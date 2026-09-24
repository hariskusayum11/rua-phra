import Link from "next/link";
import { notFound } from "next/navigation";
import { Plus } from "lucide-react";
import { isResourceKey, resources } from "@/lib/admin/resources";
import { getAdminList } from "@/lib/services/admin";

export default async function ResourceListPage({ params }: { params: Promise<{resource:string}> }) {
  const {resource}=await params;if(!isResourceKey(resource))notFound();const config=resources[resource];const rows=await getAdminList(resource);
  return <main id="main-content" className="admin-main"><header className="admin-page-head"><div><p className="admin-kicker">Content</p><h1>{config.label}</h1><p>{rows.length} รายการ</p></div><Link className="admin-primary" href={`/admin/${resource}/new`}><Plus aria-hidden="true"/>เพิ่ม{config.singular}</Link></header>{rows.length===0?<div className="admin-empty"><h2>ยังไม่มีข้อมูล</h2><p>เริ่มสร้าง{config.singular}รายการแรกในคลัง</p><Link href={`/admin/${resource}/new`}>สร้างรายการ</Link></div>:<div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>รายการ</th><th>รายละเอียด</th><th>สถานะ</th><th>แก้ไขล่าสุด</th><th><span className="sr-only">การทำงาน</span></th></tr></thead><tbody>{rows.map(row=><tr key={row.id}><td><strong>{row.title}</strong></td><td>{row.detail}</td><td>{row.status&&<span className={`status-badge status-${row.status.toLowerCase()}`}>{row.status}</span>}</td><td>{new Intl.DateTimeFormat("th-TH",{dateStyle:"medium"}).format(row.updatedAt)}</td><td><Link href={`/admin/${resource}/${row.id}`}>แก้ไข</Link></td></tr>)}</tbody></table></div>}</main>;
}
