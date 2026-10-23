"use client";
import {useEffect,useState} from "react";
import {clearCreateDraft} from "@/lib/create/result";
import {useCreateStudio} from "@/lib/create/store";
import type {PatternSummary} from "@/lib/create/types";
import {CreateStudio} from "./create-studio";
export function CreateSession({patterns}:{patterns:PatternSummary[]}){
 const [session,setSession]=useState(0);const [kiosk,setKiosk]=useState(false);const [remaining,setRemaining]=useState(90);
 useEffect(()=>{let last=Date.now();const enabled=new URLSearchParams(window.location.search).get("kiosk")==="1";const frame=requestAnimationFrame(()=>setKiosk(enabled));
 function reset(){clearCreateDraft();useCreateStudio.setState({selectedId:null,category:"ทั้งหมด",query:"",preview:"outline"});last=Date.now();setRemaining(90);setSession(v=>v+1);window.scrollTo({top:0,behavior:"instant"});}
 function activity(){last=Date.now();setRemaining(90);}
 window.addEventListener("create:restart",reset);
 const events=["pointerdown","pointermove","keydown","input","wheel"] as const;if(enabled)for(const name of events)window.addEventListener(name,activity,{passive:true});
 const timer=enabled?setInterval(()=>{const left=Math.max(0,90-Math.floor((Date.now()-last)/1000));if(left===0)reset();else setRemaining(left);},1000):null;
 return()=>{cancelAnimationFrame(frame);if(timer)clearInterval(timer);window.removeEventListener("create:restart",reset);for(const name of events)window.removeEventListener(name,activity);};
 },[]);
 return <>{kiosk&&<div className="studio-kiosk" role="status">โหมดบูธ · เริ่มใหม่เมื่อไม่ใช้งาน 90 วินาที{remaining<=15&&<strong> — อีก {remaining} วินาที แตะหน้าจอเพื่อทำต่อ</strong>}</div>}<CreateStudio key={session} patterns={patterns}/></>;
}
