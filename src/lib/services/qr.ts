import "server-only";
import { getDb } from "@/lib/db";

/**
 * A QR code printed on a sticker and glued to a boat at the temple is the one part of this
 * archive that cannot be edited after the fact. Once it is out there, the code is fixed and
 * the destination has to keep working — so resolution lives in the database, not in the URL.
 */
export type QrResolution =
  | { kind: "redirect"; href: string; id: string }
  | { kind: "inactive"; label: string }
  | { kind: "unroutable"; label: string; targetKind: string }
  | { kind: "unknown" };

export async function resolveQrCode(code: string): Promise<QrResolution> {
  const record = await getDb().qRCode.findUnique({
    where: { code },
    select: {
      id: true,
      label: true,
      active: true,
      targetKind: true,
      boat: { select: { slug: true } },
      pattern: { select: { slug: true } },
      master: { select: { slug: true } },
      process: { select: { id: true } },
      step: { select: { slug: true } },
      lesson: { select: { id: true } },
    },
  });

  if (!record) return { kind: "unknown" };
  if (!record.active) return { kind: "inactive", label: record.label };

  // A target row can be missing even when targetKind says otherwise — the join is nullable
  // and an editor can change the kind without repointing it. Falling through to a readable
  // page beats redirecting a visitor to /boats/undefined.
  const href =
    record.targetKind === "BOAT" && record.boat ? `/boats/${record.boat.slug}`
    : record.targetKind === "PATTERN" && record.pattern ? `/patterns/${record.pattern.slug}`
    : record.targetKind === "MASTER" && record.master ? `/masters/${record.master.slug}`
    : record.targetKind === "STEP" && record.step ? `/craft/${record.step.slug}`
    : record.targetKind === "PROCESS" && record.process ? "/craft"
    : null;

  if (!href) return { kind: "unroutable", label: record.label, targetKind: record.targetKind };
  return { kind: "redirect", href, id: record.id };
}

/**
 * Counting a scan must never be the reason a visitor sees an error. The temple has patchy
 * signal as it is; a failed write here is swallowed and the redirect happens anyway.
 */
export async function recordScan(id: string) {
  try {
    await getDb().qRCode.update({ where: { id }, data: { scanCount: { increment: 1 } } });
  } catch {
    // Intentionally ignored — the destination matters, the counter does not.
  }
}

/** Every code an editor might print, with its resolved destination for the print sheet. */
export async function getQrCodeSheet() {
  const rows = await getDb().qRCode.findMany({
    orderBy: [{ active: "desc" }, { label: "asc" }],
    select: {
      id: true, code: true, label: true, targetKind: true, active: true, scanCount: true,
      boat: { select: { name: true, slug: true } },
      pattern: { select: { name: true, localName: true, slug: true } },
      master: { select: { name: true, slug: true } },
      step: { select: { title: true, slug: true } },
      process: { select: { title: true } },
    },
  });
  return rows.map((row) => ({
    ...row,
    target:
      row.boat?.name ?? row.pattern?.localName ?? row.pattern?.name ?? row.master?.name ??
      row.step?.title ?? row.process?.title ?? null,
  }));
}
