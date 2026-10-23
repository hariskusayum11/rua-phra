"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { MediaFrame } from "@/components/media/media-frame";
import type { getMasterIndex } from "@/lib/services/collections";

type Master = Awaited<ReturnType<typeof getMasterIndex>>["items"][number];
export function MasterBrowser({ items, children }: { items: Master[]; children: ReactNode }) {
  const [draft, setDraft] = useState("");
  const [query, setQuery] = useState("");
  const [expertise, setExpertise] = useState("");
  const [sort, setSort] = useState("default");
  const [page, setPage] = useState(1);
  const rows = items.filter(item => (!expertise || item.expertise.some(e => e.title === expertise)) && `${item.name} ${item.biography} ${item.expertise.map(e => e.title).join(" ")}`.toLocaleLowerCase("th").includes(query.trim().toLocaleLowerCase("th")));
  if (sort !== "default") rows.sort((a, b) => (sort === "name" ? 1 : -1) * a.name.localeCompare(b.name, "th"));
  const pages = Math.max(1, Math.ceil(rows.length / 6));
  const current = Math.min(page, pages);
  return <section className="shell masters-library" aria-label="รายชื่อช่างผู้สืบสาน">
    <form className="masters-filters" onSubmit={e => { e.preventDefault(); setQuery(draft); setPage(1); }}>
      <label className="masters-search"><Search aria-hidden="true" /><span className="sr-only">ค้นหาช่าง</span><input value={draft} onChange={e => setDraft(e.target.value)} placeholder="ค้นหาชื่อช่าง ความเชี่ยวชาญ หรือคำสำคัญ" /></label>
      <label>ประเภทงาน<select value={expertise} onChange={e => { setExpertise(e.target.value); setPage(1); }}><option value="">ทั้งหมด</option>{[...new Set(items.flatMap(item => item.expertise.map(e => e.title)))].sort((a,b)=>a.localeCompare(b,"th")).map(title => <option key={title}>{title}</option>)}</select></label>
      <label>เรียงตาม<select value={sort} onChange={e => { setSort(e.target.value); setPage(1); }}><option value="default">ลำดับในคลัง</option><option value="name">ชื่อ ก–ฮ</option><option value="reverse">ชื่อ ฮ–ก</option></select></label>
      <button type="submit">ค้นหา <Search size={18} aria-hidden="true" /></button>
    </form>
    <div className="masters-results-meta"><p role="status">พบช่าง {rows.length} ท่าน</p>{children}</div>
    <ul className="masters-cards">{rows.slice((current - 1) * 6, current * 6).map(master => <li key={master.slug}><Link href={`/masters/${master.slug}`}>
      <MediaFrame image={master.portraitMedia} ratio="16/9" sizes="(max-width:600px) 90vw, (max-width:1000px) 45vw, 33vw" emptyLabel="ยังไม่มีภาพที่ได้รับอนุญาตให้เผยแพร่" />
      <div className="masters-card-copy"><h2>{master.name}</h2><p className="masters-expertise">{master.expertise.map(e => e.title).join(" · ")}</p><p className="masters-bio">{master.biography || "อยู่ระหว่างบันทึกประวัติและเรื่องราวของช่าง"}</p><span className="masters-read">อ่านเพิ่มเติม <ArrowRight size={18} aria-hidden="true" /></span></div>
    </Link></li>)}</ul>
    {!rows.length && <div className="masters-empty"><p>{items.length ? "ไม่พบช่างตามเงื่อนไขที่เลือก" : "ยังไม่มีช่างที่บันทึกไว้ในคลัง"}</p>{items.length > 0 && <button onClick={() => {setDraft("");setQuery("");setExpertise("");setPage(1);}}>ล้างการค้นหา</button>}</div>}
    {pages > 1 && <nav className="masters-pagination" aria-label="หน้ารายชื่อช่าง"><button disabled={current === 1} onClick={() => setPage(current - 1)} aria-label="หน้าก่อนหน้า">←</button>{Array.from({length:pages},(_,i)=><button key={i} aria-current={current===i+1?"page":undefined} onClick={()=>setPage(i+1)}>{i+1}</button>)}<button disabled={current === pages} onClick={() => setPage(current + 1)} aria-label="หน้าถัดไป">→</button></nav>}
  </section>;
}

