import Link from "next/link";
import { getAdminCounts } from "@/lib/services/admin";

export default async function AdminDashboard() {
  const [boats,hotspots,patterns,masters,processes,sources,qr,media,temples]=await getAdminCounts();
  const stats=[["ภาพและสื่อ",media,"media"],["วัด / ชุมชน",temples,"temples"],["เรือพระ",boats,"boats"],["จุดสำรวจ",hotspots,"sections"],["ลวดลาย",patterns,"patterns"],["ช่าง",masters,"masters"],["กระบวนการ",processes,"processes"],["แหล่งความรู้",sources,"sources"],["QR Codes",qr,"qr-codes"]] as const;
  return <main id="main-content" className="admin-main"><header className="admin-page-head"><div><p className="admin-kicker">Dashboard</p><h1>ภาพรวมคลังข้อมูล</h1></div></header><div className="admin-stats">{stats.map(([label,count,key])=><Link key={key} href={`/admin/${key}`}><span>{label}</span><strong>{count}</strong><small>จัดการข้อมูล →</small></Link>)}</div></main>;
}
