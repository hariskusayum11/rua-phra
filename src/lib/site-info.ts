/**
 * Facts about the project itself, as opposed to the cultural records it holds.
 *
 * These live in code rather than the database because they describe who is running the
 * archive, not what the archive knows — and because the footer, the about page and the
 * exhibition page must never disagree about who made this.
 *
 * Taken from the exhibition form submitted to MHESI Innovative Teacher Awards 2026, which
 * is the version the organisers and the exhibition board carry. Where the two differed,
 * the form wins: it is the one with names on it.
 */

/** The work's registered name, which is longer than what the site calls itself. */
export const workTitle = "เรือพระเล่าเรื่อง : ต้นแบบการเรียนรู้เพื่อสืบสานภูมิปัญญาปากพะยูน";

export const projectTitle = "โครงการจัดการองค์ความรู้เรือพระ อำเภอปากพะยูน จังหวัดพัทลุง";

export const award = {
  programme: "MHESI Innovative Teacher Awards 2026",
  theme: "ครูนวัตกรผู้ขับเคลื่อนพื้นที่ชุมชนสู่เมืองนวัตกรรมแห่งการเรียนรู้",
  round: "รอบระดับประเทศ · ภาคใต้ · จังหวัดพัทลุง",
};

/**
 * Three institutions, under their official names. The site previously credited two, and
 * shortened one of them into a body it is not — the centre sits under the provincial
 * office, and naming the office alone drops the district team who did the fieldwork.
 */
export const partners = [
  {
    key: "sk",
    name: "ศูนย์ส่งเสริมการเรียนรู้ระดับอำเภอปากพะยูน",
    parent: "สำนักงานส่งเสริมการเรียนรู้ประจำจังหวัดพัทลุง",
    role: "ประสานชุมชนและช่าง จัดกิจกรรมการเรียนรู้กับเยาวชนในพื้นที่",
  },
  {
    key: "tsu-sci",
    name: "คณะวิทยาศาสตร์และนวัตกรรมดิจิทัล มหาวิทยาลัยทักษิณ พัทลุง",
    parent: null,
    role: "ถอดองค์ความรู้ ออกแบบและพัฒนาคลังความรู้ดิจิทัล",
  },
  {
    key: "tsu-ser",
    name: "สถาบันส่งเสริมการบริการวิชาการ มหาวิทยาลัยทักษิณ",
    parent: null,
    role: "บริการวิชาการและการขยายผลสู่ชุมชน",
  },
] as const;

export type PartnerKey = (typeof partners)[number]["key"];

/** The people named on the submitted form, in the order the form lists them. */
export const team: Array<{ name: string; partner: PartnerKey }> = [
  { name: "นายนฐกร เลงสะ", partner: "sk" },
  { name: "นางสุทธิพร ศสีธร", partner: "sk" },
  { name: "ผศ.ดร.สุนิสา คงประสิทธิ์", partner: "tsu-sci" },
  { name: "ผศ.ดร.เตือนตา ร่าหมาน", partner: "tsu-sci" },
  { name: "อาจารย์อาจารี นาโค", partner: "tsu-sci" },
  { name: "นางสาววิจิตรา อมรวิริยะชัย", partner: "tsu-ser" },
];

/**
 * How to reach the project.
 *
 * These are the numbers the team put on the submitted form themselves. They are personal
 * mobiles rather than a project line, so if the site is opened to search engines it is
 * worth replacing them with one shared address — but a page that invites corrections and
 * then offers no way to send one is worse than either.
 */
export const contacts = [
  { name: "นายนฐกร เลงสะ", phone: "097-254-5154" },
  { name: "ผศ.ดร.สุนิสา คงประสิทธิ์", phone: "083-997-4424" },
  { name: "อาจารย์อาจารี นาโค", phone: "081-898-9874" },
];

/** Digits only, for a tel: link that dials correctly from a phone. */
export function telHref(phone: string) {
  return `tel:${phone.replace(/[^0-9+]/g, "")}`;
}

export function partnerByKey(key: PartnerKey) {
  return partners.find((partner) => partner.key === key)!;
}
