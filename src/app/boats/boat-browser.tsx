"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MediaFrame } from "@/components/media/media-frame";
import type { getBoatIndex } from "@/lib/services/collections";
type Boat=Awaited<ReturnType<typeof getBoatIndex>>["items"][number];
export function BoatBrowser({items,children}:{items:Boat[];children:React.ReactNode}) {
 const [q,setQ]=useState("");const [temple,setTemple]=useState("");const [year,setYear]=useState("");const [sort,setSort]=useState("latest");
 const rows=items.filter(b=>(!temple||b.temple.name===temple)&&(!year||String(b.year)===year)&&`${b.name} ${b.temple.name} ${b.year}`.includes(q.trim())).sort((a,b)=>sort==="oldest"?a.year-b.year:sort==="name"?a.name.localeCompare(b.name,"th"):b.year-a.year);
 return <><header className="boats-banner"><Image src="/photos/boats-banner.webp" alt="" fill priority sizes="100vw"/><div className="shell boats-banner-copy"><p><Link href="/">หน้าแรก</Link> › เรื่องเล่าเรือพระ</p><h1>เรื่องเล่า<br/><span>เรือพระ</span></h1><p>เรื่องราวเรือพระจากวัดต่าง ๆ ในอำเภอปากพะยูน<br/>โดดเด่นด้วยลวดลายฉลุและการอัดกนกด้วยกระดาษ<br/>สัมผัสงานศิลป์ ภูมิปัญญา และศรัทธาของชุมชน</p><a href="#boat-list" className="boats-hero-link">ดูเรือพระทั้งหมด <span>→</span></a></div></header>
 <section className="shell boats-library" id="boat-list" aria-label="เรือพระทั้งหมด"><div className="boats-filters"><input aria-label="ค้นหาเรือพระ" placeholder="ค้นหาชื่อเรือพระ วัด หรือปี…" value={q} onChange={e=>setQ(e.target.value)}/><select aria-label="วัด" value={temple} onChange={e=>setTemple(e.target.value)}><option value="">ทุกวัด</option>{[...new Set(items.map(b=>b.temple.name))].map(n=><option key={n}>{n}</option>)}</select><select aria-label="ปี" value={year} onChange={e=>setYear(e.target.value)}><option value="">ทุกปี</option>{[...new Set(items.map(b=>b.year))].sort((a,b)=>b-a).map(n=><option value={n} key={n}>พ.ศ. {n}</option>)}</select><select aria-label="เรียงเรือพระ" value={sort} onChange={e=>setSort(e.target.value)}><option value="latest">ล่าสุดก่อน</option><option value="oldest">เก่าสุดก่อน</option><option value="name">ชื่อ ก–ฮ</option></select></div>
 <div className="boats-list-heading"><div><p>รวมเรือพระในอำเภอปากพะยูน</p><h2>เรือพระทั้งหมด</h2></div><span role="status">พบทั้งหมด {rows.length} ลำ</span></div><div className="boats-record-status">{children}</div>
 <ul className="boats-cards">{rows.map(b=><li key={b.slug}><Link href={`/boats/${b.slug}`}><MediaFrame image={b.coverMedia} ratio="16/9" sizes="(max-width:600px) 90vw, (max-width:1000px) 45vw, 33vw"/><div><h3>{b.name}</h3><p>{b.temple.name} · พ.ศ. {b.year}</p><footer><span>{b._count.sections} จุดสำรวจบนภาพ</span><strong>อ่านเรื่อง →</strong></footer></div></Link></li>)}</ul>{!rows.length&&<p>ไม่พบเรือพระตามเงื่อนไข <button onClick={()=>{setQ("");setTemple("");setYear("");}}>ล้างตัวกรอง</button></p>}</section></>;
}
