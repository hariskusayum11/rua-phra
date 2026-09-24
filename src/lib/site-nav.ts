/**
 * Navigation targets. Every entry points at a route or a homepage section that exists —
 * the header must never offer a link that resolves to a 404.
 */
export type NavItem = { href: string; label: string };

export const primaryNav: NavItem[] = [
  { href: "/#boats", label: "เรื่องเล่าเรือพระ" },
  { href: "/craft", label: "จากกระดาษสู่เรือพระ" },
  { href: "/#patterns", label: "คลังลวดลาย" },
  { href: "/learn", label: "เรียนรู้" },
];

export const secondaryNav: NavItem[] = [
  { href: "/#reader", label: "อ่านเรือพระ" },
  { href: "/#master", label: "ช่างผู้สืบสาน" },
  { href: "/#next-generation", label: "ผลงานคนรุ่นใหม่" },
  { href: "/about", label: "เกี่ยวกับโครงการ" },
  { href: "/login", label: "ผู้ดูแลระบบ" },
];
