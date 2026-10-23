"use client";
import Link from "next/link";
import Image from "next/image";
import { useLayoutEffect, useRef, useState } from "react";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
// Replace temporary editorial cover paths here; archive media stays unchanged.
const topics = [
  { title: "เรือหนึ่งลำ หนึ่งเรื่องราว", href: "/boats", image: "boat", note: "รู้จักเรือและสำรวจส่วนประกอบทีละจุด" },
  { title: "จากกระดาษสู่เรือพระ", href: "/craft", image: "craft", note: "ตามดูขั้นตอนและเครื่องมือในงานกระดาษ" },
  { title: "มองใกล้ เห็นลาย", href: "/patterns", image: "pattern", note: "สำรวจรายละเอียดลวดลายที่บันทึกไว้" },
  { title: "คนเบื้องหลังความงาม", href: "/masters", image: "master", note: "รู้จักช่างผ่านเรื่องราวในคลัง" },
  { title: "เรียนรู้ไปด้วยกัน", href: "/learn", image: "learn", note: "สำรวจเส้นทางการเรียนรู้และบทเรียนสาธิต" },
  { title: "เรือพระในเวทีประกวด", href: "/competition", image: "event", note: "อ่านผลการประกวดและที่มาของข้อมูล" },
  { title: "สานต่อด้วยมือรุ่นใหม่", href: "/works", image: "youth", note: "พื้นที่รวบรวมผลงานของคนรุ่นใหม่" },
];
export function Pillars() {
 const track = useRef<HTMLUListElement>(null);
 const drag = useRef<{x:number;scroll:number}|null>(null);
 const suppress = useRef(false);
 const [active,setActive] = useState(2);
 useLayoutEffect(() => {
   const list = track.current;
   const item = list?.children[2] as HTMLElement | undefined;
   if (list && item) list.scrollLeft = item.offsetLeft - (list.clientWidth - item.clientWidth) / 2;
 }, []);
 function move(index:number) { const list=track.current;const item=list?.children[index] as HTMLElement|undefined;if(list&&item)list.scrollTo({left:item.offsetLeft-(list.clientWidth-item.clientWidth)/2,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'}); }
 return <section className="explore-topics home-section" id="pillars" aria-labelledby="pillars-title">
 <div className="shell explore-heading"><p className="section-index">เรือพระเล่าเรื่อง</p><h2 id="pillars-title">เลือกมุมที่อยากรู้ <span>แล้วออกไปสำรวจ</span></h2><p>จากลวดลายและมือช่าง สู่เรื่องราวของเรือพระปากพะยูน</p></div>
 <ul ref={track} className="explore-track" aria-label="เลือกหมวดเรื่องราว"
 onScroll={()=>{const list=track.current!;const center=list.scrollLeft+list.clientWidth/2;let best=0,distance=Infinity;Array.from(list.children).forEach((child,index)=>{const item=child as HTMLElement;const delta=Math.abs(item.offsetLeft+item.clientWidth/2-center);if(delta<distance){distance=delta;best=index;}});setActive(best);}}
 onPointerDown={e=>{suppress.current=false;if(e.pointerType==='mouse'&&e.button===0)drag.current={x:e.clientX,scroll:e.currentTarget.scrollLeft};}}
 onPointerMove={e=>{if(!drag.current)return;const delta=e.clientX-drag.current.x;if(Math.abs(delta)>6){suppress.current=true;e.currentTarget.setPointerCapture(e.pointerId);e.currentTarget.style.scrollSnapType='none';e.currentTarget.scrollLeft=drag.current.scroll-delta;}}}
 onPointerUp={e=>{drag.current=null;e.currentTarget.style.scrollSnapType='';if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);}}
 onPointerCancel={()=>{drag.current=null;if(track.current)track.current.style.scrollSnapType='';}}
 onDragStart={e=>e.preventDefault()}
 onClickCapture={e=>{if(suppress.current){e.preventDefault();e.stopPropagation();suppress.current=false;}}}>
 {topics.map((topic,index)=><li key={topic.href} data-active={index===active}><Link href={topic.href} draggable={false} onFocus={()=>move(index)}><div className="explore-photo"><Image src={`/photos/explore/${topic.image}.webp`} alt="" fill sizes="(max-width: 767px) 82vw, 440px" draggable={false}/></div><div className="explore-copy"><span className="section-index">0{index+1}</span><h3>{topic.title}</h3><p>{topic.note}</p><span className="explore-cta">เปิดเรื่องราว <ArrowUpRight aria-hidden="true"/></span></div></Link></li>)}
 </ul><div className="explore-controls"><button type="button" aria-label="หมวดก่อนหน้า" disabled={active===0} onClick={()=>move(active-1)}><ChevronLeft aria-hidden="true"/></button><span aria-live="polite">{active+1} / {topics.length}</span><button type="button" aria-label="หมวดถัดไป" disabled={active===topics.length-1} onClick={()=>move(active+1)}><ChevronRight aria-hidden="true"/></button></div><p className="explore-hint">ลากหรือปัดเพื่อเลือกเรื่องราว · ภาพประกอบหมวด</p></section>;
}
