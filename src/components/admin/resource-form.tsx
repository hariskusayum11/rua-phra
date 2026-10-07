"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, ArrowLeft, CheckCircle2, Grip, Save, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import Image from "next/image";
import { useForm, useWatch, type Resolver } from "react-hook-form";
import { deleteResource, saveResource } from "@/app/admin/actions";
import { uploadMediaFile } from "@/app/admin/upload";
import { BlocksField, QuizField } from "@/components/admin/lesson-editors";
import { RankingField } from "@/components/admin/ranking-field";
import { flashMessage } from "@/components/admin/admin-flash";
import { downscaleImage, MAX_UPLOAD_BYTES } from "@/lib/admin/downscale";
import { VideoUploadField } from "@/components/admin/video-upload";
import { resources, type AdminField, type ResourceKey } from "@/lib/admin/resources";
import type { AdminOption } from "@/lib/services/admin";
import { adminSchemas, type ActionState } from "@/lib/validations/admin";

type Values = Record<string, string | number | boolean | string[] | undefined>;
type OptionMap = Record<string, AdminOption[]>;
const statuses=[{value:"DRAFT",label:"ฉบับร่าง"},{value:"PENDING_REVIEW",label:"รอตรวจสอบ"},{value:"REVISION_REQUIRED",label:"ต้องแก้ไข"},{value:"VERIFIED",label:"ตรวจสอบแล้ว"},{value:"PUBLISHED",label:"เผยแพร่"}];

export function AdminResourceForm({resource,id,initialValues={},options}:{resource:ResourceKey;id?:string;initialValues?:Record<string,unknown>;options:OptionMap}) {
  const router=useRouter(); const [pending,startTransition]=useTransition(); const recordId=id; const [feedback,setFeedback]=useState<ActionState|null>(null);
  const defaults=useMemo(()=>({status:"DRAFT",active:true,isDemo:false,x:50,y:50,...initialValues}) as Values,[initialValues]);
  const resolver = zodResolver(adminSchemas[resource]) as unknown as Resolver<Values>;
  const {register,handleSubmit,control,setValue,formState:{errors}}=useForm<Values>({resolver,defaultValues:defaults});
  const watched=useWatch({control}) as Values; const config=resources[resource];

  /**
   * Saving finishes the job, so it returns to the list rather than leaving the editor in a
   * form with nothing left to do. `replace` rather than `push`: going back from the list
   * should reach whatever came before the form, not the form that was just submitted and
   * would be resubmitted.
   *
   * Errors keep the editor where they are, because the thing that needs fixing is here.
   */
  function submit(values:Values) {
    setFeedback(null);
    startTransition(async()=>{
      const result=await saveResource(resource,recordId??null,values);
      if(!result.ok){setFeedback(result);window.scrollTo({top:0,behavior:"smooth"});return;}
      flashMessage(recordId?`บันทึกการแก้ไข${config.singular}แล้ว`:`เพิ่ม${config.singular}แล้ว`,`/admin/${resource}`);
      router.replace(`/admin/${resource}`);
      router.refresh();
    });
  }
  function remove() {
    if(!recordId||!window.confirm(`ยืนยันการลบ${config.singular}นี้? การทำงานนี้ย้อนกลับไม่ได้`))return;
    startTransition(async()=>{
      const result=await deleteResource(resource,recordId);
      if(!result.ok){setFeedback(result);return;}
      flashMessage(`ลบ${config.singular}แล้ว`,`/admin/${resource}`);
      router.replace(`/admin/${resource}`);
      router.refresh();
    });
  }

  return <form className="admin-form" onSubmit={handleSubmit(submit)} noValidate>
    {feedback&&<div className={`admin-feedback ${feedback.ok?"success":"error"}`} role={feedback.ok?"status":"alert"}>{feedback.ok?<CheckCircle2 aria-hidden="true"/>:<AlertCircle aria-hidden="true"/>}<div><span>{feedback.message}</span>{feedback.fieldErrors&&<ul>{Object.entries(feedback.fieldErrors).flatMap(([field,messages])=>messages.map(message=><li key={`${field}-${message}`}>{resources[resource].fields.find(item=>item.name===field)?.label||field}: {message}</li>))}</ul>}</div></div>}
    <div className="admin-form-grid">{config.fields.map(field=><Field key={field.name} field={field} resource={resource} register={register} errors={errors} watched={watched} setValue={setValue} options={options}/>)}</div>
    {/* A lesson has no demo flag of its own — it is demo because its course is — so the
        checkbox is hidden rather than left there doing nothing. */}
    {resource!=="lessons"&&<label className="admin-check"><input type="checkbox" {...register("isDemo")}/><span>ข้อมูลสาธิต / ยังไม่ใช่ข้อมูลภาคสนามจริง</span></label>}
    {/* After a long form the reader is at the bottom, which is where the way out has to
        be. The breadcrumb at the top is a scroll away and might as well not exist. */}
    <footer className="admin-form-actions"><Link className="admin-back-link" href={`/admin/${resource}`}><ArrowLeft aria-hidden="true"/>กลับไปรายการ{config.label}</Link>{recordId&&<button className="admin-danger" type="button" onClick={remove} disabled={pending}><Trash2 aria-hidden="true"/>ลบรายการ</button>}<button className="admin-save" type="submit" disabled={pending}><Save aria-hidden="true"/>{pending?"กำลังบันทึก…":"บันทึกข้อมูล"}</button></footer>
  </form>;
}

function Field({field,resource,register,errors,watched,setValue,options}:{field:AdminField;resource:ResourceKey;register:ReturnType<typeof useForm<Values>>["register"];errors:ReturnType<typeof useForm<Values>>["formState"]["errors"];watched:Values;setValue:ReturnType<typeof useForm<Values>>["setValue"];options:OptionMap}) {
  if(field.type==="upload"&&String(watched.kind||"")==="VIDEO") return null;
  if(field.type==="videoUpload"&&String(watched.mimeType||"").startsWith("image/")) return null;
  if(field.type==="upload") return <UploadField setValue={setValue} url={String(watched.url||"")} alt={String(watched.alt||"")} help={field.help}/>;
  if(field.type==="videoUpload") return <VideoUploadField key="video" onComplete={(result)=>{
    // One record is one file. Filling these marks it as a video, which is what makes the
    // image controls above irrelevant rather than merely unused.
    setValue("kind","VIDEO",{shouldDirty:true});
    setValue("url",result.url,{shouldDirty:true});
    setValue("storageKey",result.storageKey,{shouldDirty:true});
    setValue("mimeType",result.mimeType,{shouldDirty:true});
    setValue("width",result.width,{shouldDirty:true});
    setValue("height",result.height,{shouldDirty:true});
    setValue("durationSeconds",Math.round(result.durationSeconds),{shouldDirty:true});
    if(result.posterMediaId)setValue("posterMediaId",result.posterMediaId,{shouldDirty:true});
  }}/>;
  if(field.type==="blocks") return <BlocksField label={field.label} help={field.help} error={errors[field.name]?.message?.toString()} value={String(watched[field.name]??"")} mediaOptions={options.media||[]} stepOptions={options.stepSlugs||[]} onChange={(next)=>setValue(field.name,next,{shouldDirty:true})}/>;
  if(field.type==="quiz") return <QuizField label={field.label} help={field.help} error={errors[field.name]?.message?.toString()} value={String(watched[field.name]??"")} onChange={(next)=>setValue(field.name,next,{shouldDirty:true})}/>;
  if(field.type==="ranking") return <RankingField label={field.label} help={field.help} error={errors[field.name]?.message?.toString()} value={String(watched[field.name]??"")} templeOptions={options.temples||[]} onChange={(next)=>setValue(field.name,next,{shouldDirty:true})}/>;
  if(field.type==="relations") return <RelationField field={field} value={(watched[field.name] as string[]|undefined)??[]} options={options[field.optionSource||""]||[]} setValue={setValue}/>;
  if(field.type==="hotspot") return <HotspotEditor key="hotspot" boatId={String(watched.boatId||"")} x={Number(watched.x)||0} y={Number(watched.y)||0} boats={options.boats||[]} onChange={(x,y)=>{setValue("x",x,{shouldDirty:true,shouldValidate:true});setValue("y",y,{shouldDirty:true,shouldValidate:true});}}/>;
  // Most "status" fields are the shared verification vocabulary and carry an empty options
  // list as a placeholder. A resource whose status is its own enum supplies real ones.
  let fieldOptions=field.name==="status"&&(field.options?.length??0)===0?statuses:(field.options||options[field.optionSource||""]||[]);
  if(resource==="qr-codes") {
    const kind=String(watched.targetKind||"BOAT");
    // A page code has a path and no record; a record code has the reverse. Showing both
    // at once invites an editor to fill in the one that will be thrown away.
    if(field.name==="targetId"){ if(kind==="PAGE")return null; const source=kind==="BOAT"?"boats":kind==="PATTERN"?"patterns":kind==="MASTER"?"masters":kind==="PROCESS"?"processes":"steps";fieldOptions=options[source]||[]; }
    if(field.name==="path"&&kind!=="PAGE")return null;
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
    // Shrunk here first: a serverless host rejects a request body of a few megabytes, and
    // a photograph off a camera is usually bigger than that. The server still re-encodes.
    const prepared=await downscaleImage(file);
    if(prepared.size>MAX_UPLOAD_BYTES){
      setBusy(false);
      setError(`ย่อขนาดไฟล์นี้ไม่สำเร็จ และไฟล์ยังใหญ่ ${(prepared.size/1048576).toFixed(1)}MB เกินกว่าที่เซิร์ฟเวอร์รับได้ — ลองบันทึกเป็น JPG หรือ WebP แล้วอัปโหลดใหม่`);
      return;
    }
    const body=new FormData();body.append("file",prepared);
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
    {busy&&<p role="status">กำลังย่อขนาดและอัปโหลดภาพ…</p>}
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
