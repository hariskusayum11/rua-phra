"use client";
import {useCallback,useEffect,useRef,useState} from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {ArrowLeft,Download,Share2,FileJson,Image as ImageIcon,Ship,ShoppingBag,Coffee,Check} from "lucide-react";
import type {ProductPreviewHandle} from "./product-preview";
const ProductPreview=dynamic(()=>import("./product-preview"),{ssr:false,loading:()=> <div className="product-loading" role="status">กำลังเตรียมสตูดิโอ 3 มิติ…</div>});
const productIcons={art:ImageIcon,boat:Ship,bag:ShoppingBag,mug:Coffee};
import type {Draft} from "@/lib/create/layout";
import type {CreatePattern,PatternSummary} from "@/lib/create/types";
import {creatorName,mockupLabels,type MockupKind} from "@/lib/create/result";
import {ResultArtwork} from "./result-artwork";
import "./result-workshop.css";
type Geometry=Omit<CreatePattern,"svg">;
function download(blob:Blob,name:string){const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);}
function lines(ctx:CanvasRenderingContext2D,text:string,width:number){const rows:string[]=[];let line="";for(const char of Array.from(text)){if(ctx.measureText(line+char).width>width&&line){rows.push(line);line=char;}else line+=char;}if(line)rows.push(line);return rows;}
export function ResultWorkshop({draft,geometry,colors,patterns,onEdit}:{draft:Draft;geometry:Record<string,Geometry>;colors:Record<string,string>;patterns:PatternSummary[];onEdit:()=>void}){
 const [kind,setKind]=useState<MockupKind>("art");const [name,setName]=useState("");const [loaded,setLoaded]=useState(false);const [busy,setBusy]=useState(false);const [message,setMessage]=useState("");const [prepared,setPrepared]=useState<{file:File;key:string;url:string}|null>(null);const imageRef=useRef<SVGSVGElement>(null);const alive=useRef(true);
 const [density,setDensity]=useState(2);const [productReady,setProductReady]=useState(false);
 const productRef=useRef<ProductPreviewHandle>(null);
 const onProductReady=useCallback((ready:boolean)=>setProductReady(ready),[]);
 const used=patterns.filter(p=>draft.placements.some(x=>x.patternId===p.id));const signature=JSON.stringify(draft);const cleanName=creatorName(name);const exportKey=JSON.stringify({kind,name:cleanName,colors,density});
 useEffect(()=>{alive.current=true;return()=>{alive.current=false;};},[]);
 useEffect(()=>{const timer=requestAnimationFrame(()=>{try{const saved=JSON.parse(localStorage.getItem("ruaphra-result-v1")||"null");if(saved?.signature===signature){if(typeof saved.name==="string")setName(creatorName(saved.name));if(["art","boat","bag","mug"].includes(saved.kind))setKind(saved.kind);}}catch{/* optional saved name */}setLoaded(true);});return()=>cancelAnimationFrame(timer);},[signature]);
 useEffect(()=>{if(!loaded)return;try{localStorage.setItem("ruaphra-result-v1",JSON.stringify({signature,name:cleanName,kind}));}catch{/* exporting remains available without storage */}},[signature,cleanName,kind,loaded]);
 useEffect(()=>()=>{if(prepared)URL.revokeObjectURL(prepared.url);},[prepared]);
 async function generate(){
  if(kind!=="art"&&!productReady)return;
  setBusy(true);setMessage("");
  let url:string|undefined;
  try{
   await document.fonts.load('24px "IBM Plex Sans Thai"');await document.fonts.ready;
   let image:CanvasImageSource;
   if(kind==="art"){
    if(!imageRef.current)throw Error("แผ่นงานยังไม่พร้อม");
    const raw=new XMLSerializer().serializeToString(imageRef.current);
    url=URL.createObjectURL(new Blob([raw],{type:"image/svg+xml;charset=utf-8"}));
    const img=new window.Image();await new Promise<void>((resolve,reject)=>{img.onload=()=>resolve();img.onerror=()=>reject(Error("โหลดภาพผลงานไม่สำเร็จ"));img.src=url!;});image=img;
   }else{
    if(!productRef.current)throw Error("ภาพจำลองยังไม่พร้อม");
    image=productRef.current.capture();
   }
   const canvas=document.createElement("canvas");const ctx=canvas.getContext("2d");if(!ctx)throw Error("เบราว์เซอร์นี้สร้างภาพไม่ได้");
   ctx.font='18px "IBM Plex Sans Thai", sans-serif';
   const credits=used.flatMap(p=>lines(ctx,p.name_th+" — "+p.credit+(p.sourcePage?" · หน้า "+p.sourcePage:""),1080));
   canvas.width=1800;canvas.height=Math.round((980+credits.length*30)*1.5);ctx.scale(1.5,1.5);
   ctx.fillStyle="#f3f0e9";ctx.fillRect(0,0,1200,canvas.height/1.5);ctx.drawImage(image,0,0,1200,800);
   ctx.fillStyle="#242c30";ctx.font='600 32px "IBM Plex Sans Thai", sans-serif';ctx.fillText("ตอกลาย อัดดอก · ผลงานของฉัน",60,850);
   ctx.font='24px "IBM Plex Sans Thai", sans-serif';ctx.fillText("สร้างสรรค์โดย "+(cleanName||"ผู้ร่วมสืบสาน")+" · "+mockupLabels[kind],60,892);
   ctx.font='18px "IBM Plex Sans Thai", sans-serif';ctx.fillStyle="#545b5a";
   ctx.fillText(kind==="art"?"เรือพระเล่าเรื่อง · ทุกลายมีเรื่อง ทุกเรื่องมีคนส่งต่อ":"ภาพจำลอง 3 มิติ · จัดเรียงลายซ้ำให้เต็มพื้นผิวสินค้า",60,928);
   credits.forEach((line,i)=>ctx.fillText(line,60,970+i*30));
   const blob=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(Error("สร้าง PNG ไม่สำเร็จ")),"image/png"));
   if(!alive.current)return;const file=new File([blob],"ruaphra-"+kind+".png",{type:"image/png"});
   setPrepared({file,key:exportKey,url:URL.createObjectURL(file)});setMessage("ภาพพร้อมแล้ว ดาวน์โหลดหรือแชร์ภาพมุมนี้ได้เลย");
  }catch(error){if(alive.current)setMessage(error instanceof Error?error.message:"สร้างภาพไม่ได้ ลองอีกครั้งครับ");}
  finally{if(url)URL.revokeObjectURL(url);if(alive.current)setBusy(false);}
 }
 async function share(){if(!prepared||prepared.key!==exportKey)return;try{if(navigator.canShare?.({files:[prepared.file]})&&navigator.share){await navigator.share({files:[prepared.file],title:"ตอกลาย อัดดอก — ผลงานของฉัน",text:"ทุกลายมีเรื่อง ทุกเรื่องมีคนส่งต่อ · เรือพระเล่าเรื่อง"});setMessage("ส่งภาพไปยังเมนูแชร์แล้ว");}else{download(prepared.file,prepared.file.name);setMessage("เบราว์เซอร์นี้แชร์ไฟล์ไม่ได้ จึงดาวน์โหลด PNG ให้แทน");}}catch(error){if(error instanceof DOMException&&error.name==="AbortError")setMessage("ยกเลิกการแชร์แล้ว ภาพยังดาวน์โหลดได้");else setMessage("แชร์ไม่สำเร็จ กรุณากดดาวน์โหลด PNG แทน");}}
 function saveJson(){const file={version:1,foil:draft.foil,template:draft.template,mode:draft.mode,placements:draft.placements,colors,creator:cleanName,credits:used.map(p=>({id:p.id,name:p.name_th,credit:p.credit,source:p.source,sourceHash:p.sourceHash}))};download(new Blob([JSON.stringify(file,null,2)],{type:"application/json"}),"ruaphra-artwork.json");}
 const hasImage=prepared?.key===exportKey;
 return <section className="shell layout-workshop result-workshop">
  <header className="result-heading"><div><p>ขั้นที่ 4 · สตูดิโอผลงาน</p><h2>ลายของคุณ <span>บนชิ้นงานที่ชอบ</span></h2></div><button onClick={onEdit}><ArrowLeft size={17}/> กลับไปแก้สี</button></header>
  <div className="result-studio">
   <aside className="result-sidebar">
    <div className="result-options"><h3>เลือกชิ้นงาน</h3><div role="group" aria-label="เลือกภาพจำลอง">{Object.entries(mockupLabels).map(([id,label])=>{const Icon=productIcons[id as MockupKind];return <button key={id} aria-pressed={kind===id} onClick={()=>{setKind(id as MockupKind);setMessage("");}}><Icon size={23}/><span>{label}</span>{kind===id&&<Check size={15}/>}</button>;})}</div>
    <label>ชื่อผู้สร้างสรรค์ <small>ไม่บังคับ</small><input maxLength={40} value={name} onChange={e=>setName(e.target.value)} onBlur={()=>setName(cleanName)} placeholder="ชื่อหรือชื่อเล่นของคุณ"/></label></div>
    {kind!=="art"&&<div className="result-print-controls"><label>ขนาดลายบนสินค้า<input aria-label="ความถี่ลายบนสินค้า" type="range" min="1" max="4" step=".5" value={density} onChange={e=>setDensity(Number(e.target.value))}/></label><div><span>ลายใหญ่</span><span>ลายละเอียด</span></div><p>นำลายและสีที่คุณสร้างมาเรียงซ้ำเต็มพื้นผิว โดยเก็บแผ่นงานต้นฉบับไว้เหมือนเดิม</p></div>}
    <div className="result-sidebar-note"><strong>พร้อมส่งต่อเรื่องราว</strong><p>เลือกมุมที่ชอบ แล้วเตรียมภาพ PNG พร้อมชื่อและเครดิตลาย</p></div>
   </aside>
   <div className="result-preview-column">
    <div className="result-art">{kind==="art"?<ResultArtwork ref={imageRef} draft={draft} geometry={geometry} colors={colors} kind="art"/>:<ProductPreview key={kind} ref={productRef} draft={draft} geometry={geometry} colors={colors} kind={kind} density={density} onReady={onProductReady} onFallback={()=>setKind("art")}/>}<p>สร้างสรรค์โดย <strong>{cleanName||"ผู้ร่วมสืบสาน"}</strong></p></div>
    <p className="result-note">{kind==="art"?"แผ่นงานต้นฉบับ · รูปทรงและตำแหน่งลายตามที่คุณจัดวาง":kind==="boat"?"เรือประดับจำลอง 3 มิติสำหรับทดลองลาย ไม่ใช่แบบจำลองเรือวัดใดวัดหนึ่ง":"ภาพจำลอง 3 มิติ · ลากเพื่อหมุนดูพื้นผิวและแสงเงา"}</p>
   </div>
  </div>
  <div className="result-bottom"><p role="status" className="result-status">{message||"ผลงานเก็บในเครื่องนี้ · เตรียมภาพก่อนดาวน์โหลดหรือแชร์"}</p><div className="result-actions"><button disabled={busy||(kind!=="art"&&!productReady)} onClick={generate}><ImageIcon size={18}/>{busy?"กำลังสร้างภาพ…":hasImage?"สร้าง PNG อีกครั้ง":"เตรียมภาพ PNG"}</button>{hasImage&&prepared&&<><a href={prepared.url} download={prepared.file.name}><Download size={18}/>ดาวน์โหลด {mockupLabels[kind]} PNG</a><button onClick={share}><Share2 size={18}/>แชร์ภาพนี้</button></>}</div></div>
  <details className="result-details"><summary>ที่มาของลาย และตัวเลือกเพิ่มเติม</summary><section className="result-credits"><h3>ลายที่ร่วมอยู่ในผลงานนี้</h3><ul>{used.map(p=><li key={p.id}><h4>{p.name_th}</h4><p>{p.meaning||"ความหมายของลายอยู่ระหว่างรวบรวมข้อมูล"}</p><small>{p.credit}{p.sourcePage?" · หน้า "+p.sourcePage:""}</small></li>)}</ul><Link href="/credits">อ่านที่มาของลายทั้งหมด →</Link></section><div className="result-restart"><button onClick={saveJson}><FileJson size={17}/>เก็บไฟล์งาน JSON</button><button onClick={()=>{if(window.confirm("เริ่มงานใหม่จะล้างงานค้างในเครื่อง ดาวน์โหลดผลงานก่อนเริ่มใหม่หรือยัง?"))window.dispatchEvent(new Event("create:restart"));}}>เริ่มสร้างผลงานใหม่</button><span>ไม่มีการส่งผลงานขึ้นเซิร์ฟเวอร์ การแชร์จะเปิดเมนูของอุปกรณ์ให้คุณเลือกเอง</span></div></details>
 </section>;
}
