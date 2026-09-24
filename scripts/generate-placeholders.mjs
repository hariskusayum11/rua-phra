/**
 * Generates the development placeholder artwork used until field photography arrives.
 *
 * Every file is locked to the aspect ratio its slot will carry in production, so real
 * photographs can replace a placeholder without any layout change. The artwork is
 * deliberately abstract: it must never be mistaken for documentary evidence of a real
 * boat, pattern, artisan or process.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const outputDirectory = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "public",
  "placeholders",
);

const palette = {
  paper: "#f1e9d9",
  paperDeep: "#e3d7c0",
  indigo: "#17324d",
  indigoSoft: "#2b4c6b",
  night: "#17201e",
  terracotta: "#a85535",
  gold: "#b99555",
  goldSoft: "#d8be86",
};

/** Deterministic pseudo-random so regenerating the set never churns the repository. */
function seeded(seed) {
  let state = seed * 2654435761 % 2147483647;
  return () => {
    state = (state * 48271) % 2147483647;
    return state / 2147483647;
  };
}

function frame(width, height, background, body, label) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-label="${label}">
  <title>${label}</title>
  <rect width="${width}" height="${height}" fill="${background}"/>
${body}
  <text x="${width - Math.round(width * 0.035)}" y="${height - Math.round(height * 0.035)}" text-anchor="end" font-family="sans-serif" font-size="${Math.round(Math.min(width, height) * 0.032)}" fill="#ffffff" fill-opacity=".42">PLACEHOLDER</text>
</svg>
`;
}

/** Boat silhouettes: tiered mass, spire and hull, read as a vessel at any crop. */
function boat(width, height, index) {
  const random = seeded(index + 7);
  const baseline = height * 0.74;
  const centre = width * (0.42 + random() * 0.14);
  const spire = height * (0.12 + random() * 0.06);
  const hullWidth = width * 0.78;
  const shapes = [
    `<rect width="${width}" height="${height}" fill="${palette.night}"/>`,
    `<circle cx="${(width * 0.8).toFixed(0)}" cy="${(height * 0.22).toFixed(0)}" r="${(height * 0.2).toFixed(0)}" fill="${palette.goldSoft}" fill-opacity=".14"/>`,
    `<path d="M${centre} ${spire} L${centre + width * 0.045} ${baseline - height * 0.24} L${centre - width * 0.045} ${baseline - height * 0.24} Z" fill="${palette.gold}" fill-opacity=".85"/>`,
    `<path d="M${centre - width * 0.13} ${baseline - height * 0.24} h${width * 0.26} l${width * 0.035} ${height * 0.1} h-${width * 0.33} Z" fill="${palette.goldSoft}" fill-opacity=".72"/>`,
    `<rect x="${centre - width * 0.1}" y="${baseline - height * 0.14}" width="${width * 0.2}" height="${height * 0.14}" fill="${palette.gold}" fill-opacity=".55"/>`,
    `<path d="M${(width - hullWidth) / 2} ${baseline} q${hullWidth / 2} ${height * 0.16} ${hullWidth} 0 l-${width * 0.06} ${height * 0.12} h-${hullWidth - width * 0.12} Z" fill="${palette.terracotta}" fill-opacity=".8"/>`,
    `<rect x="0" y="${baseline + height * 0.2}" width="${width}" height="${height - baseline - height * 0.2}" fill="${palette.indigo}" fill-opacity=".55"/>`,
  ];
  return frame(width, height, palette.night, shapes.join("\n"), "ภาพตัวอย่างเรือพระสำหรับการพัฒนา ยังไม่ใช่ภาพถ่ายจริง");
}

/** Macro craft: overlapping paper sheets with punched openings. */
function craft(width, height, index) {
  const random = seeded(index + 23);
  const shapes = [`<rect width="${width}" height="${height}" fill="${palette.paperDeep}"/>`];
  for (let sheet = 0; sheet < 3; sheet += 1) {
    const x = width * (0.06 + sheet * 0.14 + random() * 0.04);
    const y = height * (0.1 + sheet * 0.12);
    const w = width * 0.62;
    const h = height * 0.56;
    const rotation = (random() * 10 - 5).toFixed(2);
    shapes.push(
      `<g transform="rotate(${rotation} ${(x + w / 2).toFixed(0)} ${(y + h / 2).toFixed(0)})"><rect x="${x.toFixed(0)}" y="${y.toFixed(0)}" width="${w.toFixed(0)}" height="${h.toFixed(0)}" fill="${sheet === 2 ? palette.gold : palette.paper}" fill-opacity="${sheet === 2 ? ".9" : ".95"}"/></g>`,
    );
  }
  for (let row = 0; row < 4; row += 1) {
    for (let column = 0; column < 5; column += 1) {
      const cx = width * (0.24 + column * 0.13);
      const cy = height * (0.26 + row * 0.13);
      shapes.push(
        `<circle cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" r="${(Math.min(width, height) * 0.022).toFixed(1)}" fill="${palette.night}" fill-opacity=".3"/>`,
      );
    }
  }
  shapes.push(
    `<path d="M0 ${height * 0.82} q${width * 0.3} -${height * 0.12} ${width * 0.62} ${height * 0.05} T${width} ${height * 0.78} V${height} H0 Z" fill="${palette.terracotta}" fill-opacity=".75"/>`,
  );
  return frame(width, height, palette.paperDeep, shapes.join("\n"), "ภาพตัวอย่างงานกระดาษระยะใกล้สำหรับการพัฒนา");
}

/** Pattern swatch: a repeating motif field, distinct per index. */
function pattern(width, height, index) {
  const random = seeded(index + 41);
  const inks = [palette.terracotta, palette.indigo, palette.gold, palette.indigoSoft];
  const ink = inks[index % inks.length];
  const shapes = [`<rect width="${width}" height="${height}" fill="${palette.paper}"/>`];
  const columns = 3 + (index % 3);
  const rows = columns;
  const cellWidth = width / columns;
  const cellHeight = height / rows;
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const cx = cellWidth * (column + 0.5);
      const cy = cellHeight * (row + 0.5);
      const unit = Math.min(cellWidth, cellHeight) * 0.34;
      const variant = (index + row + column) % 3;
      if (variant === 0) {
        shapes.push(
          `<path d="M${cx.toFixed(1)} ${(cy - unit).toFixed(1)} q${unit.toFixed(1)} ${unit.toFixed(1)} 0 ${(unit * 2).toFixed(1)} q-${unit.toFixed(1)} -${unit.toFixed(1)} 0 -${(unit * 2).toFixed(1)} Z" fill="${ink}" fill-opacity=".8"/>`,
        );
      } else if (variant === 1) {
        shapes.push(
          `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${unit.toFixed(1)}" fill="none" stroke="${ink}" stroke-opacity=".75" stroke-width="${(unit * 0.22).toFixed(1)}"/>`,
        );
      } else {
        shapes.push(
          `<path d="M${(cx - unit).toFixed(1)} ${(cy + unit).toFixed(1)} q${unit.toFixed(1)} -${(unit * 2).toFixed(1)} ${(unit * 2).toFixed(1)} 0" fill="none" stroke="${ink}" stroke-opacity=".8" stroke-width="${(unit * 0.24).toFixed(1)}"/>`,
        );
      }
    }
  }
  shapes.push(
    `<rect x="0" y="0" width="${width}" height="${height}" fill="${palette.gold}" fill-opacity="${(0.05 + random() * 0.06).toFixed(3)}"/>`,
  );
  return frame(width, height, palette.paper, shapes.join("\n"), "ภาพตัวอย่างลวดลายสำหรับการพัฒนา ยังไม่ใช่ลายที่บันทึกจากพื้นที่");
}

/** Environmental portrait stand-in: figure and workbench, never a real likeness. */
function portrait(width, height, index) {
  const random = seeded(index + 59);
  const headY = height * (0.3 + random() * 0.04);
  const shapes = [
    `<rect width="${width}" height="${height}" fill="${palette.indigo}"/>`,
    `<rect x="0" y="${(height * 0.62).toFixed(0)}" width="${width}" height="${(height * 0.38).toFixed(0)}" fill="${palette.night}" fill-opacity=".65"/>`,
    `<circle cx="${(width * 0.52).toFixed(0)}" cy="${headY.toFixed(0)}" r="${(width * 0.15).toFixed(0)}" fill="${palette.goldSoft}" fill-opacity=".85"/>`,
    `<path d="M${(width * 0.18).toFixed(0)} ${height} q${(width * 0.34).toFixed(0)} -${(height * 0.42).toFixed(0)} ${(width * 0.68).toFixed(0)} 0 Z" fill="${palette.terracotta}" fill-opacity=".9"/>`,
    `<rect x="${(width * 0.08).toFixed(0)}" y="${(height * 0.78).toFixed(0)}" width="${(width * 0.84).toFixed(0)}" height="${(height * 0.04).toFixed(0)}" fill="${palette.gold}" fill-opacity=".6"/>`,
  ];
  return frame(width, height, palette.indigo, shapes.join("\n"), "ภาพตัวอย่างแทนภาพช่าง ไม่ใช่ภาพบุคคลจริง");
}

/** Process step: work surface, tool line and a piece in progress. */
function process(width, height, index) {
  const random = seeded(index + 83);
  const shapes = [
    `<rect width="${width}" height="${height}" fill="${palette.paperDeep}"/>`,
    `<rect x="${(width * 0.08).toFixed(0)}" y="${(height * 0.16).toFixed(0)}" width="${(width * 0.56).toFixed(0)}" height="${(height * 0.62).toFixed(0)}" fill="${palette.paper}"/>`,
    `<rect x="${(width * 0.08).toFixed(0)}" y="${(height * 0.16).toFixed(0)}" width="${(width * 0.56).toFixed(0)}" height="${(height * 0.62).toFixed(0)}" fill="none" stroke="${palette.night}" stroke-opacity=".18" stroke-width="2"/>`,
  ];
  const marks = 3 + Math.floor(random() * 3);
  for (let mark = 0; mark < marks; mark += 1) {
    shapes.push(
      `<rect x="${(width * (0.14 + mark * 0.09)).toFixed(0)}" y="${(height * (0.26 + (mark % 2) * 0.16)).toFixed(0)}" width="${(width * 0.06).toFixed(0)}" height="${(height * 0.2).toFixed(0)}" fill="${mark % 2 === 0 ? palette.terracotta : palette.indigo}" fill-opacity=".7"/>`,
    );
  }
  shapes.push(
    `<rect x="${(width * 0.7).toFixed(0)}" y="${(height * 0.2).toFixed(0)}" width="${(width * 0.05).toFixed(0)}" height="${(height * 0.56).toFixed(0)}" rx="${(width * 0.02).toFixed(0)}" fill="${palette.gold}"/>`,
    `<rect x="${(width * 0.8).toFixed(0)}" y="${(height * 0.32).toFixed(0)}" width="${(width * 0.04).toFixed(0)}" height="${(height * 0.44).toFixed(0)}" rx="${(width * 0.016).toFixed(0)}" fill="${palette.indigoSoft}"/>`,
    `<text x="${(width * 0.08).toFixed(0)}" y="${(height * 0.92).toFixed(0)}" font-family="sans-serif" font-size="${Math.round(height * 0.11)}" font-weight="600" fill="${palette.night}" fill-opacity=".28">${String(index + 1).padStart(2, "0")}</text>`,
  );
  return frame(width, height, palette.paperDeep, shapes.join("\n"), "ภาพตัวอย่างขั้นตอนการทำงานสำหรับการพัฒนา");
}

/** Learner work: a mounted sheet on an exhibition wall. */
function work(width, height, index) {
  const random = seeded(index + 97);
  const inks = [palette.terracotta, palette.indigoSoft, palette.gold, palette.indigo];
  const ink = inks[index % inks.length];
  const shapes = [
    `<rect width="${width}" height="${height}" fill="${palette.paper}"/>`,
    `<rect x="${(width * 0.12).toFixed(0)}" y="${(height * 0.1).toFixed(0)}" width="${(width * 0.76).toFixed(0)}" height="${(height * 0.7).toFixed(0)}" fill="#ffffff" fill-opacity=".72"/>`,
  ];
  const petals = 5 + Math.floor(random() * 4);
  const cx = width * 0.5;
  const cy = height * 0.44;
  const radius = Math.min(width, height) * 0.2;
  for (let petal = 0; petal < petals; petal += 1) {
    const angle = (petal / petals) * Math.PI * 2;
    shapes.push(
      `<ellipse cx="${(cx + Math.cos(angle) * radius * 0.6).toFixed(1)}" cy="${(cy + Math.sin(angle) * radius * 0.6).toFixed(1)}" rx="${(radius * 0.52).toFixed(1)}" ry="${(radius * 0.26).toFixed(1)}" transform="rotate(${((angle * 180) / Math.PI).toFixed(1)} ${(cx + Math.cos(angle) * radius * 0.6).toFixed(1)} ${(cy + Math.sin(angle) * radius * 0.6).toFixed(1)})" fill="${ink}" fill-opacity=".62"/>`,
    );
  }
  shapes.push(
    `<circle cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" r="${(radius * 0.3).toFixed(0)}" fill="${palette.night}" fill-opacity=".45"/>`,
    `<rect x="${(width * 0.12).toFixed(0)}" y="${(height * 0.86).toFixed(0)}" width="${(width * 0.34).toFixed(0)}" height="${(height * 0.025).toFixed(0)}" fill="${palette.night}" fill-opacity=".25"/>`,
  );
  return frame(width, height, palette.paper, shapes.join("\n"), "ภาพตัวอย่างผลงานผู้เรียนสำหรับการพัฒนา");
}

const files = [
  // 16:9 — hero, featured boats, boat detail, closing.
  ...[0, 1, 2].map((index) => [`boat-16x9-${index + 1}.svg`, boat(1920, 1080, index)]),
  ["closing-16x9.svg", boat(1920, 1080, 5)],
  // 4:5 — craft macro and portraits.
  ...[0, 1].map((index) => [`craft-4x5-${index + 1}.svg`, craft(1200, 1500, index)]),
  ...[0, 1, 2].map((index) => [`portrait-4x5-${index + 1}.svg`, portrait(1200, 1500, index)]),
  // 1:1 — pattern swatches.
  ...Array.from({ length: 6 }, (_, index) => [`pattern-1x1-${index + 1}.svg`, pattern(1200, 1200, index)]),
  // 3:2 — process steps.
  ...Array.from({ length: 7 }, (_, index) => [`process-3x2-${index + 1}.svg`, process(1500, 1000, index)]),
  // 4:5 — learner work.
  ...Array.from({ length: 4 }, (_, index) => [`work-4x5-${index + 1}.svg`, work(1200, 1500, index)]),
  // 16:9 — boat section close-ups.
  ...Array.from({ length: 6 }, (_, index) => [`detail-16x9-${index + 1}.svg`, craft(1600, 900, index + 3)]),
];

await mkdir(outputDirectory, { recursive: true });
for (const [name, content] of files) {
  await writeFile(path.join(outputDirectory, name), content, "utf8");
}
console.log(`Wrote ${files.length} placeholder files to public/placeholders`);
