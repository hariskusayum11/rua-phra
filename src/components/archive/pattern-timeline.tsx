"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Columns2, History, ZoomIn, X } from "lucide-react";
import { MediaFrame } from "@/components/media/media-frame";
import { historyYearLabel, type PatternHistoryRecord } from "@/lib/pattern-history";
import "./pattern-timeline.css";

export function PatternTimeline({ records }: { records: PatternHistoryRecord[] }) {
  const [pattern, setPattern] = useState("");
  const [selected, setSelected] = useState(records[0]?.id ?? "");
  const [compare, setCompare] = useState(false);
  const [otherId, setOtherId] = useState(records[1]?.id ?? "");
  const [zoom, setZoom] = useState(1);
  const dialog = useRef<HTMLDialogElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const [zoomRow, setZoomRow] = useState<PatternHistoryRecord | null>(null);
  const visible = records.filter(r=>!pattern || r.patternSlug===pattern);
  const active = visible.find(r=>r.id===selected) ?? visible[0];
  const others = visible.filter(r=>r.id!==active?.id);
  const other = others.find(r=>r.id===otherId) ?? others[0];
  const index = visible.findIndex(r=>r.id===active?.id);
  const dated = visible.some(r=>r.year!==null);
  const patterns = Array.from(new Map(records.map(r=>[r.patternSlug,r.title])).entries());
  function openImage(row: PatternHistoryRecord) {setZoomRow(row);setZoom(1);dialog.current?.showModal();closeButton.current?.focus();}
  return <section className="shell pattern-timeline" aria-label="รอยลาย รอยเวลา">
    <header><div><p className="timeline-kicker"><History size={18}/> บันทึกลวดลายผ่านกาลเวลา</p><h2>รอยลาย <span>รอยเวลา</span></h2><p>จากเครื่องมือในวันวาน สู่ฝีมือในวันนี้<br/>ชมลวดลาย วัสดุ และวิธีฉลุ ผ่านภาพที่บันทึกไว้ในแต่ละช่วงเวลา</p></div><Link href="/patterns#pattern-catalog">ไปยังลวดลายทั้งหมด ↓</Link></header>
    {!records.length ? <p className="timeline-notice">อยู่ระหว่างรวบรวมภาพลวดลายและหลักฐานช่วงเวลา</p> : <>
      <div className="timeline-controls"><label>เลือกลวดลาย<select value={pattern} onChange={e=>{setPattern(e.target.value);setCompare(false);}}><option value="">ทุกลวดลาย</option>{patterns.map(([slug,name])=><option key={slug} value={slug}>{name}</option>)}</select></label><button className="timeline-compare-toggle" aria-pressed={compare} disabled={!others.length} onClick={()=>setCompare(!compare)}><Columns2 size={18}/>{compare?"กลับไปดูภาพเดียว":"เทียบภาพสองบันทึก"}</button></div>
      {!dated && <p className="timeline-notice">ภาพชุดนี้ยังไม่ระบุปี จึงยังไม่แสดงเป็นลำดับอดีต–ปัจจุบัน เมื่อมีหลักฐานช่วงเวลา จะจัดเรียงตามปีให้เห็นความต่อเนื่องของลวดลาย</p>}
      <div className="timeline-navigation"><button aria-label="บันทึกก่อนหน้า" disabled={index<=0} onClick={()=>setSelected(visible[index-1].id)}><ArrowLeft/></button><div className="timeline-track" aria-label="เลือกบันทึกภาพ">{visible.map(r=><button key={r.id} aria-pressed={r.id===active?.id} onClick={()=>setSelected(r.id)}><strong>{historyYearLabel(r)}</strong><span>{r.title}</span></button>)}</div><button aria-label="บันทึกถัดไป" disabled={index>=visible.length-1} onClick={()=>setSelected(visible[index+1].id)}><ArrowRight/></button></div>
      {compare && other && <div className="timeline-compare-controls"><label>เทียบกับ<select value={other.id} onChange={e=>setOtherId(e.target.value)}>{others.map(r=><option key={r.id} value={r.id}>{historyYearLabel(r)} · {r.title}</option>)}</select></label><p>{active?.patternSlug!==other.patternSlug?"กำลังเทียบต่างลวดลาย ไม่ใช่พัฒนาการของลายเดียวกัน":"ภาพต่างช่วงเวลาอาจใช้เทคนิคร่วมกัน ต้องอ่านหลักฐานประกอบ"}</p></div>}
      <div className="timeline-records" data-compare={compare && !!other}>{active && <TimelineCard row={active} onZoom={openImage} />}{compare && other && <TimelineCard row={other} onZoom={openImage} />}</div>
    </>}
    <dialog ref={dialog} className="timeline-lightbox" onClose={()=>setZoom(1)} onClick={e=>{if(e.target===e.currentTarget)dialog.current?.close();}}><div className="timeline-lightbox-head"><p>{zoomRow?.title} · {zoomRow && historyYearLabel(zoomRow)}</p><button ref={closeButton} aria-label="ปิดภาพขยาย" onClick={()=>dialog.current?.close()}><X/></button></div><label className="timeline-zoom">ซูมภาพ {zoom.toFixed(1)}× <input aria-label="ระดับการขยายภาพ" type="range" min="1" max="3" step="0.1" value={zoom} onChange={e=>setZoom(Number(e.target.value))}/></label><div className="timeline-zoom-scroll"><div style={{width:`${zoom*100}%`}}>{zoomRow && <MediaFrame image={zoomRow.image} ratio="3/2" sizes="90vw"/>}</div></div></dialog>
  </section>;
}

function TimelineCard({row, onZoom}: {row: PatternHistoryRecord; onZoom: (row: PatternHistoryRecord)=>void}) {return <article className="timeline-record" key={row.id}>
    <div className="timeline-photo"><MediaFrame image={row.image} ratio="3/2" sizes="(max-width:700px) 90vw, 50vw" /><button onClick={()=>onZoom(row)} aria-label={`ขยายภาพ ${row.title} ${historyYearLabel(row)}`}><ZoomIn size={18} /> ขยายภาพ</button></div>
    <div className="timeline-record-copy"><p className="timeline-date">{historyYearLabel(row)} <span>{row.verified?"ตรวจสอบแล้ว":"รอตรวจสอบข้อมูล"}</span></p><h3>{row.title}</h3>{row.location && <p>{row.location}</p>}
    <dl><div><dt>วัสดุที่ใช้</dt><dd>{row.materials || "ยังไม่มีข้อมูลวัสดุของภาพนี้"}</dd></div><div><dt>เครื่องมือและวิธีฉลุ</dt><dd>{row.tools || "ยังไม่มีข้อมูลเครื่องมือของภาพนี้"}{row.technique && <p>{row.technique}</p>}</dd></div><div><dt>สิ่งที่เปลี่ยนไป</dt><dd>{row.changes || "ยังไม่มีหลักฐานเปรียบเทียบที่ยืนยันการเปลี่ยนแปลง"}</dd></div></dl>
    <p className="timeline-source">ที่มา: {row.source}{row.image.credit && <> · ภาพ: {row.image.credit}</>}</p><Link href={`/patterns/${row.patternSlug}`}>อ่านเรื่องราวของลายนี้ <ArrowRight size={16}/></Link></div>
  </article>;}


