/**
 * Navigation targets. Every entry points at a route or a homepage section that exists —
 * the header must never offer a link that resolves to a 404.
 *
 * Each label is also the heading of the page it opens, so a reader who taps a menu item
 * lands on a page that says the same words back.
 */
export type NavItem = { href: string; label: string };

export const primaryNav: NavItem[] = [
  { href: "/", label: "หน้าแรก" },
  { href: "/boats", label: "เรื่องเล่าเรือพระ" },
  { href: "/craft", label: "จากกระดาษสู่เรือพระ" },
  { href: "/patterns", label: "คลังลวดลาย" },
  { href: "/learn", label: "เรียนรู้" },
  { href: "/competition", label: "ผลการประกวด" },
];

export const secondaryNav: NavItem[] = [
  { href: "/#reader", label: "อ่านเรือพระ" },
  { href: "/masters", label: "ช่างผู้สืบสาน" },
  { href: "/works", label: "ผลงานคนรุ่นใหม่" },
  { href: "/about", label: "เกี่ยวกับโครงการ" },
  { href: "/login", label: "ผู้ดูแลระบบ" },
];

/**
 * Whether a menu item is the page being looked at. A section link (`/#reader`) is never
 * "current": it is a place on the homepage, and marking it would mark two items at once.
 * Everything else owns its own detail pages, so /boats is current on /boats/<slug> too.
 */
export function isCurrentPath(href: string, pathname: string) {
  if (href.includes("#")) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}
