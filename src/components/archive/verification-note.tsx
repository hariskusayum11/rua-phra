/**
 * Says where a record stands. Silence would read as confirmation, so anything short of
 * VERIFIED or PUBLISHED carries a line of its own.
 */
export function VerificationNote({
  status,
  isDemo,
}: {
  status?: string | null;
  isDemo: boolean;
}) {
  if (status === "VERIFIED" || status === "PUBLISHED") return null;
  return (
    <p className="demo-notice">
      {isDemo
        ? "ข้อมูลสาธิต · สร้างขึ้นเพื่อทดสอบระบบ ยังไม่ใช่ข้อมูลภาคสนาม"
        : "บันทึกภาคสนาม · รอการตรวจสอบร่วมกับช่างและชุมชน"}
    </p>
  );
}
