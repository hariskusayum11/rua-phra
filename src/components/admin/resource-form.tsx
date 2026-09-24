"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle2, Grip, Save, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import Image from "next/image";
import { useForm, useWatch, type Resolver } from "react-hook-form";
import { deleteResource, saveResource } from "@/app/admin/actions";
import { uploadMediaFile } from "@/app/admin/upload";
import { BlocksField, QuizField } from "@/components/admin/lesson-editors";
import { resources, type AdminField, type ResourceKey } from "@/lib/admin/resources";
import type { AdminOption } from "@/lib/services/admin";
import { adminSchemas, type ActionState } from "@/lib/validations/admin";

type Values = Record<string, string | number | boolean | string[] | undefined>;
type OptionMap = Record<string, AdminOption[]>;
const statuses=[{value:"DRAFT",label:"ฉบับร่าง"},{value:"PENDING_REVIEW",label:"รอตรวจสอบ"},{value:"REVISION_REQUIRED",label:"ต้องแก้ไข"},{value:"VERIFIED",label:"ตรวจสอบแล้ว"},{value:"PUBLISHED",label:"เผยแพร่"}];

export function AdminResourceForm({resource,id,initialValues={},options,created=false}:{resource:ResourceKey;id?:string;initialValues?:Record<string,unknown>;options:OptionMap;created?:boolean}) {
  const router=useRouter(); const [pending,startTransition]=useTransition(); const [recordId,setRecordId]=useState(id); const [feedback,setFeedback]=useState<ActionState|null>(created?{ok:true,message:"สร้างรายการแล้ว"}:null);
  const defaults=useMemo(()=>({status:"DRAFT",active:true,isDemo:false,x:50,y:50,...initialValues}) as Values,[initialValues]);
  const resolver = zodResolver(adminSchemas[resource]) as unknown as Resolver<Values>;
  const {register,handleSubmit,control,setValue,formState:{errors}}=useForm<Values>({resolver,defaultValues:defaults});
  const watched=useWatch({control}) as Values; const config=resources[resource];
  useEffect(()=>{
    if(!id)return;
    const feedbackKey=`admin-created:${resource}:${id}`;
    let feedbackTimer:ReturnType<typeof setTimeout>|undefined;
    if(window.sessionStorage.getItem(feedbackKey)){window.sessionStorage.removeItem(feedbackKey);feedbackTimer=setTimeout(()=>setFeedback({ok:true,message:"สร้างรายการแล้ว"}),0);}
    if(created)router.replace(`/admin/${resource}/${id}`);
    return ()=>{if(feedbackTimer)clearTimeout(feedbackTimer);};
  },[created,id,resource,router]);

  function submit(values:Values) { setFeedback(null);startTransition(async()=>{const result=await saveResource(resource,recordId??null,values);setFeedback(result);if(result.ok){if(!recordId&&result.id){setRecordId(result.id);window.sessionStorage.setItem(`admin-created:${resource}:${result.id}`,"1");router.replace(`/admin/${resource}/${result.id}`);}window.scrollTo({top:0,behavior:"smooth"});}}); }
  function remove() { if(!recordId||!window.confirm(`ยืนยันการลบ${config.singular}นี้? การทำงานนี้ย้อนกลับไม่ได้`))return;startTransition(async()=>{const result=await deleteResource(resource,recordId);if(result.ok)router.replace(`/admin/${resource}`);else setFeedback(result);}); }

  return <form className="admin-form" onSubmit={handleSubmit(submit)} noValidate>
    {feedback&&<div className={`admin-feedback ${feedback.ok?"success":"error"}`} role={feedback.ok?"status":"alert"}>{feedback.ok?<CheckCircle2 aria-hidden="true"/>:<AlertCircle aria-hidden="true"/>}<div><span>{feedback.message}</span>{feedback.fieldErrors&&<ul>{Object.entries(feedback.fieldErrors).flatMap(([field,messages])=>messages.map(message=><li key={`${field}-${message}`}>{resources[resource].fields.find(item=>item.name===field)?.label||field}: {message}</li>))}</ul>}</div></div>}
    <div className="admin-form-grid">{config.fields.map(field=><Field key={field.name} field={field} resource={resource} register={register} errors={errors} watched={watched} setValue={setValue} options={options}/>)}</div>
    {/* A lesson has no demo flag of its own — it is demo because its course is — so the
        checkbox is hidden rather than left there doing nothing. */}
    {resource!=="lessons"&&<label className="admin-check"><input type="checkbox" {...register("isDemo")}/><span>ข้อมูลสาธิต / ยังไม่ใช่ข้อมูลภาคสนามจริง</span></label>}
    <footer className="admin-form-actions">{recordId&&<button className="admin-danger" type="button" onClick={remove} disabled={pending}><Trash2 aria-hidden="true"/>ลบรายการ</button>}<button className="admin-save" type="submit" disabled={pending}><Save aria-hidden="true"/>{pending?"กำลังบันทึก…":"บันทึกข้อมูล"}</button></footer>
  </form>;
}

function Field({field,resource,register,errors,watched,setValue,options}:{field:AdminField;resource:ResourceKey;register:ReturnType<typeof useForm<Values>>["register"];errors:ReturnType<typeof useForm<Values>>["formState"]["errors"];watched:Values;setValue:ReturnType<typeof useForm<Values>>["setValue"];options:OptionMap}) {
  if(field.type==="upload") return <UploadField setValue={setValue} url={String(watched.url||"")} alt={String(watched.alt||"")} help={field.help}/>;
  if(field.type==="blocks") return <BlocksField label={field.label} help={field.help} error={errors[field.name]?.message?.toString()} value={String(watched[field.name]??"")} mediaOptions={options.media||[]} stepOptions={options.stepSlugs||[]} onChange={(next)=>setValue(field.name,next,{shouldDirty:true})}/>;
  if(field.type==="quiz") return <QuizField label={field.label} help={field.help} error={errors[field.name]?.message?.toString()} value={String(watched[field.name]??"")} onChange={(next)=>setValue(field.name,next,{shouldDirty:true})}/>;
  if(field.type==="relations") return <RelationField field={field} value={(watched[field.name] as string[]|undefined)??[]} options={options[field.optionSource||""]||[]} setValue={setValue}/>;
  if(field.type==="hotspot") return <HotspotEditor key="hotspot" boatId={String(watched.boatId||"")} x={Number(watched.x)||0} y={Number(watched.y)||0} boats={options.boats||[]} onChange={(x,y)=>{setValue("x",x,{shouldDirty:true,shouldValidate:true});setValue("y",y,{shouldDirty:true,shouldValidate:true});}}/>;
  let fieldOptions=field.name==="status"?statuses:(field.options||options[field.optionSource||""]||[]);
  if(resource==="qr-codes"&&field.name==="targetId") {
    const kind=String(watched.targetKind||"BOAT"); const source=kind==="BOAT"?"boats":kind==="PATTERN"?"patterns":kind==="MASTER"?"masters":kind==="PROCESS"?"processes":"steps";fieldOptions=options[source]||[];
  }
  const error=errors[field.name]?.message?.toString(); const wide=field.type==="textarea"||field.type==="media";
  if(field.type==="checkbox") return <label className="admin-check admin-field-wide"><input type="checkbox" {...register(field.name)}/><span>{field.label}</span></label>;
  const registration=register(field.name,field.type==="number"?{setValueAs:(value)=>value===""?"":Number(value)}:undefined);
  return <label className={`admin-field ${wide?"admin-field-wide":""}`}><span>{field.label}{field.required&&<b aria-hidden="true"> *</b>}</span>
    {field.type==="textarea"?<textarea rows={5} {...registration}/>:field.type==="select"||field.type==="media"?<><select {...registration}><option value="">— เลือก —</option>{fieldOptions.map(option=><option key={option.value} value={option.value}>{option.label}</option>)}</select>{field.type==="media"&&<MediaPreview id={String(watched[field.name]||"")} options={fieldOptions}/>}</>:<input type={field.type==="date"?"date":field.type==="number"?"number":"text"} step={field.name==="x"||field.name==="y"?"0.01":undefined} {...registration}/>} 
    {field.help&&<small>{field.help}</small>}{error&&<small className="field-error">{error}</small>}
  </label>;
}

/**
 * Uploads the chosen file immediately and writes the returned location into the form's
 * hidden fields, so saving the record is still one plain server action.
 */
function UploadField({setValue,url,alt,help}:{setValue:ReturnType<typeof useForm<Values>>["setValue"];url:string;alt:string;help?:string}) {
  const [busy,setBusy]=useState(false); const [error,setError]=useState<string|null>(null);
  async function choose(file:File|undefined) {
    if(!file)return;
    setError(null);setBusy(true);
    const body=new FormData();body.append("file",file);
    const result=await uploadMediaFile(body);
    setBusy(false);
    if(!result.ok){setError(result.message);return;}
    setValue("url",result.url,{shouldDirty:true});
    setValue("storageKey",result.storageKey,{shouldDirty:true});
    setValue("mimeType",result.mimeType,{shouldDirty:true});
    setValue("width",result.width,{shouldDirty:true});
    setValue("height",result.height,{shouldDirty:true});
  }
  return <fieldset className="admin-upload admin-field-wide"><legend>ไฟล์ภาพ</legend>
    <input type="file" accept="image/jpeg,image/png,image/webp,image/avif,image/tiff" disabled={busy} onChange={event=>choose(event.target.files?.[0])}/>
    {help&&<small>{help}</small>}
    {busy&&<p role="status">กำลังอัปโหลดและประมวลผลภาพ…</p>}
    {error&&<p className="field-error" role="alert">{error}</p>}
    {url&&<div className="admin-media-preview"><Image loader={({src})=>src} unoptimized fill sizes="352px" src={url} alt={alt||"ภาพที่อัปโหลด"}/></div>}
    {url&&<small>บันทึกไว้ที่ {url}</small>}
  </fieldset>;
}

/** A checkbox per option, because a multi-select listbox hides what is already linked. */
function RelationField({field,value,options,setValue}:{field:AdminField;value:string[];options:AdminOption[];setValue:ReturnType<typeof useForm<Values>>["setValue"]}) {
  const selected=new Set(value);
  function toggle(id:string,checked:boolean) {
    const next=new Set(selected);
    if(checked)next.add(id);else next.delete(id);
    setValue(field.name,[...next],{shouldDirty:true});
  }
  return <fieldset className="admin-relations admin-field-wide">
    <legend>{field.label} <span>{selected.size} รายการ</span></legend>
    {options.length===0
      ? <p className="admin-relations-empty">ยังไม่มีรายการให้เลือก — สร้างข้อมูลในหมวดนั้นก่อน</p>
      : <div className="admin-relations-grid">{options.map(option=>
          <label key={option.value}><input type="checkbox" checked={selected.has(option.value)} onChange={event=>toggle(option.value,event.target.checked)}/><span>{option.label}</span></label>)}
        </div>}
  </fieldset>;
}

function MediaPreview({id,options}:{id:string;options:AdminOption[]}) { const media=options.find(x=>x.value===id);return media?.imageUrl?<div className="admin-media-preview"><Image loader={({src})=>src} unoptimized fill sizes="352px" src={media.imageUrl} alt={media.label}/></div>:null; }

function HotspotEditor({boatId,x,y,boats,onChange}:{boatId:string;x:number;y:number;boats:AdminOption[];onChange:(x:number,y:number)=>void}) {
  const boat=boats.find(item=>item.value===boatId);
  function locate(clientX:number,clientY:number,currentTarget:HTMLElement){const rect=currentTarget.getBoundingClientRect();const round=(value:number)=>Math.round(Math.max(0,Math.min(100,value))*10_000)/10_000;onChange(round(((clientX-rect.left)/rect.width)*100),round(((clientY-rect.top)/rect.height)*100));}
  if(!boat?.imageUrl)return <div className="hotspot-admin-empty"><MapHint/></div>;
  return <fieldset className="hotspot-editor"><legend>วางจุดสำรวจบนภาพเรือ</legend><p>คลิกบนภาพเพื่อวางจุด หรือลากจุดเดิมไปยังตำแหน่งใหม่</p><div className="hotspot-canvas" onPointerDown={e=>locate(e.clientX,e.clientY,e.currentTarget)}>
    <Image loader={({src})=>src} unoptimized width={1600} height={700} src={boat.imageUrl} alt={`ภาพสำหรับกำหนดจุดบน ${boat.label}`} draggable={false}/>
    <button type="button" className="hotspot-admin-point" style={{left:`${x}%`,top:`${y}%`}} aria-label={`ตำแหน่งจุดสำรวจ X ${x.toFixed(1)} เปอร์เซ็นต์ Y ${y.toFixed(1)} เปอร์เซ็นต์`} onPointerDown={e=>{e.stopPropagation();e.currentTarget.setPointerCapture(e.pointerId)}} onPointerMove={e=>{if(e.currentTarget.hasPointerCapture(e.pointerId))locate(e.clientX,e.clientY,e.currentTarget.parentElement!)}} onPointerUp={e=>e.currentTarget.releasePointerCapture(e.pointerId)} onKeyDown={e=>{const delta=e.shiftKey?5:1;if(e.key==="ArrowLeft")onChange(Math.max(0,x-delta),y);if(e.key==="ArrowRight")onChange(Math.min(100,x+delta),y);if(e.key==="ArrowUp")onChange(x,Math.max(0,y-delta));if(e.key==="ArrowDown")onChange(x,Math.min(100,y+delta));}}><Grip aria-hidden="true"/></button>
  </div><output>X {x.toFixed(2)}% · Y {y.toFixed(2)}%</output></fieldset>;
}

function MapHint(){return <><Grip aria-hidden="true"/><p>เลือกเรือพระที่มีภาพก่อนวางจุดสำรวจ</p></>;}
