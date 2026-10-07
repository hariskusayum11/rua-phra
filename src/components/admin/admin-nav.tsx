"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Archive, BookOpenText, Boxes, ChevronDown, DraftingCompass, GraduationCap, HardDrive,
  Trophy,
  Image as ImageIcon, Landmark, LayoutDashboard, Library, MapPin, NotebookPen, Palette,
  QrCode, ScrollText, Ship, Users, Wrench,
} from "lucide-react";

/**
 * The admin menu.
 *
 * Eighteen links in one unbroken column read as a list of eighteen equally important
 * things, which they are not: five of them describe a boat and the people around it, six
 * describe how the work is made, three are teaching material, and the rest are tooling.
 * Grouping them under headings means an editor looking for "วัสดุ" scans four short lists
 * instead of one long one.
 *
 * The two links an editor opens on arriving — the dashboard and the media library — sit
 * above the headings, because they belong to no category and are wanted constantly.
 *
 * A client component only so it can mark the page you are on. Without that the menu can
 * say where you can go but not where you are, which on a narrow screen (where the sidebar
 * collapses into a grid above the content) is the only orientation there is.
 */

type Item = { key: string; href: string; label: string; icon: typeof Ship; also?: string };

export function AdminNav({ labels }: { labels: Record<string, string> }) {
  const pathname = usePathname();
  const label = (key: string) => labels[key] ?? key;

  const top: Item[] = [
    { key: "dashboard", href: "/admin", label: "ภาพรวม", icon: LayoutDashboard },
    { key: "media", href: "/admin/media", label: label("media"), icon: ImageIcon },
  ];

  const groups: Array<{ title: string; items: Item[] }> = [
    {
      title: "เรือพระและชุมชน",
      items: [
        { key: "temples", href: "/admin/temples", label: label("temples"), icon: Landmark },
        { key: "boats", href: "/admin/boats", label: label("boats"), icon: Ship },
        { key: "sections", href: "/admin/sections", label: label("sections"), icon: MapPin },
        { key: "stories", href: "/admin/stories", label: label("stories"), icon: BookOpenText },
        { key: "masters", href: "/admin/masters", label: label("masters"), icon: Users },
        { key: "competitions", href: "/admin/competitions", label: label("competitions"), icon: Trophy },
      ],
    },
    {
      title: "งานช่างและภูมิปัญญา",
      items: [
        { key: "processes", href: "/admin/processes", label: label("processes"), icon: Archive },
        { key: "steps", href: "/admin/steps", label: label("steps"), icon: ScrollText },
        { key: "materials", href: "/admin/materials", label: label("materials"), icon: Boxes },
        { key: "tools", href: "/admin/tools", label: label("tools"), icon: Wrench },
        { key: "techniques", href: "/admin/techniques", label: label("techniques"), icon: DraftingCompass },
        { key: "patterns", href: "/admin/patterns", label: label("patterns"), icon: Palette },
      ],
    },
    {
      title: "บทเรียนและแหล่งอ้างอิง",
      items: [
        { key: "courses", href: "/admin/courses", label: label("courses"), icon: GraduationCap },
        { key: "lessons", href: "/admin/lessons", label: label("lessons"), icon: NotebookPen },
        { key: "sources", href: "/admin/sources", label: label("sources"), icon: Library },
      ],
    },
    {
      title: "ระบบ",
      items: [
        // The print sheet is a page of its own, reached from the QR list; while it is open
        // the editor is still working on QR codes and the menu should say so.
        { key: "qr-codes", href: "/admin/qr-codes", label: label("qr-codes"), icon: QrCode, also: "/admin/qr-print" },
        { key: "storage", href: "/admin/storage", label: "พื้นที่เก็บไฟล์", icon: HardDrive },
      ],
    },
  ];

  function isCurrent(item: Item) {
    if (item.href === "/admin") return pathname === "/admin";
    return pathname === item.href || pathname.startsWith(item.href + "/")
      || (!!item.also && (pathname === item.also || pathname.startsWith(item.also + "/")));
  }

  const link = (item: Item) => {
    const Icon = item.icon;
    const current = isCurrent(item);
    return (
      <li key={item.key}>
        <Link href={item.href} aria-current={current ? "page" : undefined}>
          <Icon aria-hidden="true" />
          {item.label}
        </Link>
      </li>
    );
  };

  // The group you are working in is the one that is open. Eighteen links stacked out to
  // 1168px — taller than the screen on every laptop in the project — so the menu could
  // only ever show part of itself and you had to scroll to find out which part. Folding
  // the other three groups away makes the whole menu visible at once.
  //
  // Keyed on the path so a navigation restores that rule: a group opened by hand to look
  // around stays open until you go somewhere, and then the group you went to is the open
  // one. Nothing is remembered between visits, which means the menu looks the same every
  // time it is opened rather than however it was left weeks ago.
  const activeGroup = groups.findIndex((group) => group.items.some(isCurrent));

  return (
    <nav className="admin-nav" aria-label="เมนูผู้ดูแล">
      <ul className="admin-nav-list">{top.map(link)}</ul>
      {groups.map((group, index) => (
        <details
          key={`${pathname}-${group.title}`}
          className="admin-nav-group"
          open={index === activeGroup}
        >
          <summary>
            <ChevronDown aria-hidden="true" />
            {group.title}
          </summary>
          <ul className="admin-nav-list" aria-label={group.title}>{group.items.map(link)}</ul>
        </details>
      ))}
    </nav>
  );
}
