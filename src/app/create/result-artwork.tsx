import {forwardRef,useId} from "react";
import {slots,type Draft} from "@/lib/create/layout";
import type {CreatePattern} from "@/lib/create/types";
type Geometry=Omit<CreatePattern,"svg">;

/** The original paper remains untouched; product reflow is a separate renderer. */
export const ResultArtwork=forwardRef<SVGSVGElement,{draft:Draft;geometry:Record<string,Geometry>;colors:Record<string,string>;kind:"art"}>(function ResultArtwork({draft,geometry,colors},ref){
 const id=useId().replaceAll(":","");const cells=slots(draft.template);
 function transform(p:Draft["placements"][number]){const g=geometry[p.patternId];const c=p.slot===null?{w:300,h:250}:cells[p.slot];const s=Math.min(c.w/g.width,c.h/g.height)*p.scale;return `translate(${p.x} ${p.y}) rotate(${p.rotation}) scale(${p.flip?-s:s} ${s}) translate(${-g.width/2} ${-g.height/2})`;}
 return <svg ref={ref} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" width="1200" height="800" role="img" aria-label="แผ่นงานต้นฉบับ">
 <defs>
  <clipPath id={id+"-sheet"}>{draft.template==="triangle"?<path d="M500 0L1000 600H0Z"/>:<rect width="1000" height="600"/>}</clipPath>
  <mask id={id+"-holes"} maskUnits="userSpaceOnUse" x="0" y="0" width="1000" height="600"><rect width="1000" height="600" fill="white"/>{draft.placements.map(p=><g key={p.id} transform={transform(p)} fill="black" fillRule="evenodd">{geometry[p.patternId].holes.map(h=><path key={h.id} d={h.d}/>)}</g>)}</mask>
  <linearGradient id={id+"-shine"}><stop stopColor="white" stopOpacity=".12"/><stop offset=".45" stopColor="white" stopOpacity="0"/><stop offset="1" stopColor="black" stopOpacity=".06"/></linearGradient>
  <filter id={id+"-shadow"} x="-.1" y="-.1" width="1.2" height="1.3"><feDropShadow dx="0" dy="8" stdDeviation="9" floodColor="#3e3020" floodOpacity=".2"/></filter>
 </defs>
 <rect width="1200" height="800" fill="#eeeae2"/>
 <g transform="translate(100 100)" filter={`url(#${id}-shadow)`}><g clipPath={`url(#${id}-sheet)`}>
 {draft.placements.map(p=><g key={p.id} transform={transform(p)} fillRule="evenodd">{geometry[p.patternId].holes.map(h=><path key={h.id} d={h.d} fill={colors[p.id+":"+h.id]??"transparent"}/>)}</g>)}
 <g mask={`url(#${id}-holes)`}><rect width="1000" height="600" fill={draft.foil}/><rect width="1000" height="600" fill={`url(#${id}-shine)`}/></g>
 </g></g>
 </svg>;
});
