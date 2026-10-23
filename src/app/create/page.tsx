import type { Metadata } from "next";
import catalog from "@/data/create-pattern-catalog.json";
import type { PatternSummary } from "@/lib/create/types";
import { CreateSession } from "./create-session";
import "./create.css";
import "./craft-desk.css";

export const metadata: Metadata = {title:"ตอกลาย อัดดอก · ห้องทดลองงานศิลป์",description:"สำรวจลายช่างปากพะยูนและลายไทย พร้อมเครดิตต้นทาง ก่อนเริ่มสร้างผลงานกระดาษของตัวเอง"};
export default function CreatePage() {
  return <main id="main-content" className="create-page" tabIndex={-1}><CreateSession patterns={catalog as PatternSummary[]} /></main>;
}
