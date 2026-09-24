/**
 * Facts about the project itself, as opposed to the cultural records it holds.
 *
 * These live in code rather than the database because they describe who is running the
 * archive, not what the archive knows — and because the footer and the about page must
 * never disagree about who made this.
 */
export const partners = [
  {
    name: "มหาวิทยาลัยทักษิณ",
    role: "วิจัย บันทึกภาคสนาม และพัฒนาระบบ",
  },
  {
    name: "สำนักงานส่งเสริมการเรียนรู้ระดับอำเภอปากพะยูน",
    role: "ประสานชุมชน และนำองค์ความรู้ไปใช้ในการเรียนรู้",
  },
] as const;

export const projectTitle = "โครงการจัดการองค์ความรู้เรือพระ อำเภอปากพะยูน จังหวัดพัทลุง";

/**
 * How to reach the project. There is no email or phone number here yet, and writing a
 * plausible-looking one would be worse than saying so — a correction sent into a mailbox
 * nobody reads is indistinguishable from a correction that was ignored.
 */
export const contactChannel: { kind: "organisation" } | { kind: "email"; value: string } = {
  kind: "organisation",
};
