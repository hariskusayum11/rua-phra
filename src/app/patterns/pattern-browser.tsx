"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Heart, Grid2X2, List, Flower2, Leaf, Shapes, Sparkles, Bird, ArrowRight } from "lucide-react";
import { MediaFrame } from "@/components/media/media-frame";
import { patternCategoryLabels, patternCategoryLabel } from "@/lib/pattern-categories";
import type { getPatternIndex } from "@/lib/services/collections";

type Pattern = Awaited<ReturnType<typeof getPatternIndex>>["items"][number];
const icons = { FLORAL:Flower2, FOLIAGE:Leaf, GEOMETRIC:Shapes, MYTHICAL:Bird, OTHER:Sparkles };
export function PatternBrowser({items, children, timeline}:{items:Pattern[];children:React.ReactNode;timeline?:React.ReactNode}) {
 const [query,setQuery]=useState(""); const [search,setSearch]=useState("");
 const [category,setCategory]=useState(""); const [sort,setSort]=useState("latest");
 const [layout,setLayout]=useState("grid"); const [saved,setSaved]=useState<string[]>([]); const [filter,setFilter]=useState("all");
 const visible=items.filter(p=>(!category||p.category===category)&&(`${p.name} ${p.localName??""} ${p.characteristics??""}`.toLocaleLowerCase("th").includes(search.toLocaleLowerCase("th")))&&(filter!=="saved"||saved.includes(p.slug))&&(filter!=="boats"||p._count.boats>0));
 if(sort==="latest") visible.reverse(); else if(sort==="name") visible.sort((a,b)=>(a.localName||a.name).localeCompare(b.localName||b.name,"th"));
 return <>
 <header className="pattern-library-hero"><Image src="/photos/patterns-banner.webp" alt="" fill priority sizes="100vw"/><div className="shell pattern-library-intro"><p className="pattern-crumb"><Link href="/">หน้าแรก</Link> › คลังลวดลาย</p><h1>คลังลวด<span>ลาย</span></h1><p>รวบรวมลวดลายจากเรือพระ ภูมิปัญญาท้องถิ่นที่ส่งต่อจากรุ่นสู่รุ่น<br/>เพื่อให้ทุกคนได้ศึกษา เรียนรู้ และนำไปต่อยอด</p><form className="pattern-search" onSubmit={e=>{e.preventDefault();setSearch(query.trim());}}><Search aria-hidden="true"/><input aria-label="ค้นหาลวดลาย" placeholder="ค้นหาชื่อหรือรายละเอียดลวดลาย…" value={query} onChange={e=>{setQuery(e.target.value);if(!e.target.value)setSearch("");}}/><button type="submit">ค้นหา <ArrowRight aria-hidden="true"/></button></form></div></header>
 {timeline}
 <div className="shell pattern-library-body" id="pattern-catalog">
 <nav className="pattern-categories" aria-label="หมวดลวดลาย"><button aria-pressed={!category} onClick={()=>setCategory("")}><Sparkles/>ทั้งหมด</button>{Object.entries(patternCategoryLabels).map(([key,label])=>{const Icon=icons[key as keyof typeof icons]??Shapes;return <button key={key} aria-pressed={category===key} onClick={()=>setCategory(key)}><Icon aria-hidden="true"/>{label}</button>;})}</nav>
 <div className="pattern-library-status">{children}</div>
 <div className="pattern-toolbar"><p role="status">พบลวดลาย <strong>{visible.length}</strong> รายการ</p><div><select aria-label="ตัวกรองลวดลาย" value={filter} onChange={e=>setFilter(e.target.value)}><option value="all">แสดงทั้งหมด</option><option value="boats">มีเรือที่ใช้ลาย</option><option value="saved">รายการที่ชอบในครั้งนี้</option></select><select aria-label="เรียงลวดลาย" value={sort} onChange={e=>setSort(e.target.value)}><option value="latest">ล่าสุด</option><option value="oldest">เก่าสุด</option><option value="name">ชื่อ ก–ฮ</option></select><button aria-label="มุมมองการ์ด" aria-pressed={layout==="grid"} onClick={()=>setLayout("grid")}><Grid2X2/></button><button aria-label="มุมมองรายการ" aria-pressed={layout==="list"} onClick={()=>setLayout("list")}><List/></button></div></div>
 <ul className="pattern-results" data-layout={layout}>{visible.map(p=><li key={p.slug}><article><div className="pattern-result-image"><Link href={`/patterns/${p.slug}`} tabIndex={-1} aria-hidden="true"><MediaFrame image={p.imageMedia} ratio="3/2" sizes="(max-width:600px) 100vw, (max-width:1000px) 45vw, 25vw"/></Link><span className="pattern-category-tag">{patternCategoryLabel(p.category)}</span><button className="pattern-save" aria-label={`ชอบ ${p.localName||p.name}`} aria-pressed={saved.includes(p.slug)} onClick={()=>setSaved(v=>v.includes(p.slug)?v.filter(s=>s!==p.slug):[...v,p.slug])}><Heart aria-hidden="true" fill={saved.includes(p.slug)?"currentColor":"none"}/></button></div><div className="pattern-result-copy"><h2><Link href={`/patterns/${p.slug}`}>{p.localName||p.name}</Link></h2><p>{p.characteristics}</p><Link className="pattern-detail" href={`/patterns/${p.slug}`}>ดูรายละเอียด <ArrowRight aria-hidden="true"/></Link></div></article></li>)}</ul>
 {!visible.length&&<p className="empty-note">ไม่พบลวดลายที่ตรงกับเงื่อนไข <button onClick={()=>{setCategory("");setSearch("");setQuery("");setFilter("all");}}>ล้างการค้นหาและตัวกรอง</button></p>}
 </div></>;
}
