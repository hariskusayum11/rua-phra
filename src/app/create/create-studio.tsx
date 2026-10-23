"use client";
import { memo, useEffect, useId, useState } from "react";
import Link from "next/link";
import { LayoutWorkshop } from "./layout-workshop";
import Image from "next/image";
import { Home, CircleHelp, BookOpen, Check, ChevronRight, Flower2, Hammer, Palette, Search, Sparkles, X } from "lucide-react";
import type { CreatePattern, PatternSummary } from "@/lib/create/types";
import { useCreateStudio } from "@/lib/create/store";

type Geometry = Omit<CreatePattern,"svg">;
const categories = ["ทั้งหมด","ลายช่างปากพะยูน","กระจัง","ประจำยาม","พุ่ม","กนก"];
const stages = ["เลือกลวดลาย","ตอกลาย","ตกแต่งรายละเอียด","โชว์ผลงาน"];
const PatternDrawing = memo(function PatternDrawing({pattern, mode}:{pattern:Geometry; mode:"outline"|"color"}) {
 const titleId=useId();
 return <svg className="studio-pattern-svg" viewBox={pattern.viewBox} role="img" aria-labelledby={titleId} preserveAspectRatio="xMidYMid meet"><title id={titleId}>{pattern.name_th} · {mode==="outline"?"เส้นร่าง":"ตัวอย่างลวดลาย"}</title>
  <g data-layer="paper"><rect width={pattern.width} height={pattern.height} fill={mode==="color"?(pattern.foil??"#e8d9ab"):"#ffffff"}/></g>
  {mode==="outline"?<g data-layer="outline" fill="none" stroke="#675c4b" strokeWidth={2} strokeDasharray="5 3">{pattern.outlines.map(p=><path key={p.id} d={p.d} data-motif={p.motif}/>)}</g>:<g data-layer="holes" fillRule="evenodd">{pattern.holes.map(p=><path key={p.id} d={p.d} fill={p.color??"#305c51"} data-group={p.group} data-motif={p.motif}/>)}</g>}
 </svg>;
});

function PatternPreview({summary,mode}:{summary:PatternSummary;mode:"outline"|"color"}) {
 const [geometry,setGeometry]=useState<Geometry|null>(null);
 const [error,setError]=useState(false);
 const [retry,setRetry]=useState(0);
 useEffect(()=>{
  const controller=new AbortController();
  fetch(summary.dataUrl,{signal:controller.signal}).then(response=>{if(!response.ok)throw Error("ภาพยังไม่พร้อม");return response.json();}).then((data:Geometry)=>{if(data.id!==summary.id||!Array.isArray(data.holes)||data.holes.length!==summary.holeCount)throw Error("ข้อมูลลายไม่ครบ");setGeometry(data);setError(false);}).catch(error=>{if(error.name!=="AbortError")setError(true);});
  return ()=>controller.abort();
 },[summary.id,summary.dataUrl,summary.holeCount,retry]);
 if(error)return <div className="studio-paper-message" role="alert"><p>ยังโหลดภาพลายไม่ได้</p><button onClick={()=>{setError(false);setRetry(retry+1);}}>ลองอีกครั้ง</button></div>;
 if(!geometry)return <p className="studio-paper-message" role="status">กำลังเตรียมลาย…</p>;
 return <PatternDrawing pattern={geometry} mode={mode}/>;
}

export function CreateStudio({patterns}:{patterns:PatternSummary[]}) {
 const [stage,setStage]=useState(0);
 const [help,setHelp]=useState(false);
 useEffect(()=>{
  const root=document.querySelector(".create-page");
  if(!root)return;
  const sync=()=>setStage(root.querySelector(".result-workshop")?3:root.querySelector(".color-workshop")?2:root.querySelector(".punch-workshop")?1:0);
  sync();
  const observer=new MutationObserver(sync);
  observer.observe(root,{childList:true,subtree:true});
  return ()=>observer.disconnect();
 },[]);
 const {selectedId,category,query,preview,selectPattern,setCategory,setQuery,setPreview}=useCreateStudio();
 const selected=patterns.find(p=>p.id===selectedId);
 const visible=patterns.filter(p=>(category==="ทั้งหมด"||p.category===category)&&`${p.name_th} ${p.category} ${p.credit}`.toLocaleLowerCase("th").includes(query.trim().toLocaleLowerCase("th")));
 return <>
  <header className="craft-game-header">
   <Link href="/learn" className="craft-brand"><strong>เรือพระ<span>ปากพะยูน</span></strong><small>สืบสานงานศิลป์ · สร้างสรรค์ลายกระดาษ</small></Link>
   <ol className="craft-game-steps" aria-label="ขั้นตอนสร้างผลงาน">{stages.map((label,i)=><li key={label} data-active={stage===i} data-done={stage>i} aria-current={stage===i?"step":undefined}><span>{stage>i?<Check size={24}/>:i+1}</span><strong>{label}</strong></li>)}</ol>
   <nav className="craft-game-nav" aria-label="เมนูห้องงาน"><Link href="/learn" aria-label="กลับหน้าเรียนรู้"><Home size={23}/></Link><button onClick={()=>setHelp(!help)} aria-expanded={help} aria-controls="craft-help" aria-label="วิธีเล่น"><CircleHelp size={25}/></button></nav>
  </header>
  {help&&<aside className="craft-help" id="craft-help"><button onClick={()=>setHelp(false)} aria-label="ปิดวิธีเล่น"><X size={20}/></button><h2>สร้างลายทีละขั้น</h2><p>1. แตะภาพในถาดเพื่อเพิ่มลาย แล้วลากจัดตำแหน่งบนกระดาษให้ครบช่อง</p><p>2. เริ่มตอกลาย แล้วแตะชิ้นงาน หรือเลือกตอกอัตโนมัติ</p><p>3. เลือกกระดาษสี แตะช่องลาย หรือใช้โหมดลากระบาย</p><p>4. ดูผลงานบนสินค้า ดาวน์โหลด และแชร์ภาพของคุณ</p><small>งานบันทึกในเครื่องนี้อัตโนมัติ · แบบจำลองเพื่อทดลองเรียนรู้</small></aside>}
  <LayoutWorkshop patterns={patterns} selectedId={selectedId} onSelect={selectPattern}/>
  <details className="shell studio-reference"><summary>สำรวจลายและที่มาเพิ่มเติม</summary><div className="studio-layout">
   <section className="studio-workspace" aria-label="โต๊ะทดลองลาย">
    <div className="studio-workspace-head"><div><small>โต๊ะงานของคุณ</small><h2>{selected?selected.name_th:"เริ่มต้นจากกระดาษเปล่า"}</h2></div><span>{selected?"ภาพตัวอย่างลาย":"ยังไม่ได้เลือกลาย"}</span></div>
    <div className="studio-desk"><div className="studio-paper" data-selected={!!selected}>{selected?<PatternPreview key={selected.id} summary={selected} mode={preview}/>:<div className="studio-paper-message"><Flower2 size={50} strokeWidth={1}/><h3>ทุกผลงาน เริ่มจากหนึ่งลาย</h3><p>เลือกภาพจากถาดลาย<br/>เพื่อดูเส้นร่างและเรื่องราวของลายนั้น</p><a href="#studio-pattern-tray">เลือกดูลาย <ChevronRight size={16}/></a></div>}</div><p className="studio-desk-caption">{selected?"ตัวอย่างสำหรับสำรวจลาย · ยังไม่ได้วางบนชิ้นงาน":"แผ่นงานของคุณ พร้อมรับแรงบันดาลใจ"}</p></div>
    {selected&&<div className="studio-preview-controls"><div role="group" aria-label="รูปแบบภาพตัวอย่าง"><button aria-pressed={preview==="outline"} onClick={()=>setPreview("outline")}>ดูเส้นร่าง</button><button aria-pressed={preview==="color"} onClick={()=>setPreview("color")}>{selected.hasCraftColors?"ดูสีจากต้นฉบับ":"ดูรูปทรงลาย"}</button></div><p>{preview==="outline"?"เส้นร่างก่อนตอก ยังไม่มีรูทะลุ":selected.hasCraftColors?"ตัวอย่างสีที่อ่านจากไฟล์ลายต้นฉบับ":"ใช้สีเดียวช่วยให้เห็นรูปทรง ไม่ใช่ชุดสีดั้งเดิม"}</p></div>}
    <section className="studio-story" aria-labelledby="studio-story-title" aria-live="polite"><p className="studio-story-kicker"><BookOpen size={18}/> ทุกลายมีเรื่อง</p><h2 id="studio-story-title">{selected?.name_th??"เลือกลาย เพื่อรู้จักที่มา"}</h2>{selected?<><div className="studio-tags"><span>{selected.category}</span><span>{selected.holeCount} รู</span><span>{selected.groupCount} กลุ่ม</span><span>ระดับ{selected.difficulty}</span></div><p>{selected.meaning||"ความหมายของลายอยู่ระหว่างรวบรวมข้อมูลจากแหล่งที่มา"}</p><dl><div><dt>เครดิต / ที่มา</dt><dd>{selected.credit}{selected.sourcePage&&<> · หน้า {selected.sourcePage}</>}</dd></div><div><dt>ชุดลาย</dt><dd>{selected.sourceGroup}</dd></div></dl></>:<p>ทุกภาพมีเครดิตต้นทางกำกับ เลือกลายจากถาดเพื่ออ่านรายละเอียดก่อนนำไปสร้างสรรค์</p>}</section>
   </section>
   <aside className="studio-tray" id="studio-pattern-tray" aria-labelledby="studio-tray-title"><div className="studio-tray-title"><div><small>แรงบันดาลใจของคุณ</small><h2 id="studio-tray-title">ถาดลวดลาย</h2></div><span>{patterns.length} ลาย</span></div><label className="studio-search"><Search size={18}/><span className="sr-only">ค้นหาลายในเกม</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="ค้นหาชื่อลาย หรือแหล่งที่มา"/>{query&&<button aria-label="ล้างคำค้น" onClick={()=>setQuery("")}><X size={16}/></button>}</label><div className="studio-categories" role="group" aria-label="หมวดลายในเกม">{categories.map(c=><button key={c} aria-pressed={category===c} onClick={()=>setCategory(c)}>{c}</button>)}</div><p className="studio-result-count" role="status">พบ {visible.length} ลาย · แตะเพื่อดูตัวอย่าง</p>
    <ul className="studio-patterns">{visible.map(p=><li key={p.id}><button aria-pressed={selectedId===p.id} onClick={()=>selectPattern(p.id)}><span className="studio-thumbnail">{/* Generated SVG previews have no scripts or external resources. */}<Image unoptimized src={p.thumbnail} alt="" loading="lazy" width={160} height={140}/>{selectedId===p.id&&<span className="studio-selected"><Check size={16}/></span>}</span><strong>{p.name_th}</strong><span className="studio-pattern-meta">{p.category} · {p.holeCount} รู</span><span className="studio-pattern-credit">{p.credit}{p.sourcePage&&<> · หน้า {p.sourcePage}</>}</span></button></li>)}</ul>
    {!visible.length&&<div className="studio-no-results"><p>ไม่พบลายตามคำค้นหรือหมวดนี้</p><button onClick={()=>{setCategory("ทั้งหมด");setQuery("");}}>แสดงทุกลาย</button></div>}
   </aside>
  </div>
  </details><section className="shell studio-how"><p>จากลายบนกระดาษ สู่สีสันที่มองเห็น</p><div><article><Hammer/><h2>ตอกให้เป็นช่อง</h2><p>ในเกม ค้อนและเหล็กตอกจะเปิดช่องบนแผ่นฟอยล์ตามลายที่เลือก</p></article><article><Palette/><h2>อัดสีไว้ด้านหลัง</h2><p>กระดาษสีอยู่ใต้แผ่นฟอยล์ สีจึงปรากฏเฉพาะช่องที่ตอกแล้ว</p></article><article><Sparkles/><h2>ส่งต่อในแบบของคุณ</h2><p>ลองลายบนภาพจำลองสินค้า ดาวน์โหลด และแชร์ผลงานของตัวเอง</p></article></div><small>แบบจำลองเพื่อทดลองเรียนรู้ ไม่ใช่ขั้นตอนสาธิตจากช่าง · <Link href="/credits">อ่านที่มาของลายทั้งหมด</Link></small></section>
 </>;
}


