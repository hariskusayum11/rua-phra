import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { XMLParser, XMLValidator } from "fast-xml-parser";
import type { CreatePattern, PatternPath, PatternSummary } from "../src/lib/create/types";

const root = path.resolve("assets/create-patterns");
const output = path.resolve("public/create-patterns");
const parser = new XMLParser({ignoreAttributes:false, attributeNamePrefix:"@_",processEntities:false});
type XmlNode = Record<string, unknown>;
const list = (v: unknown): XmlNode[] => v ? (Array.isArray(v) ? v : [v]) as XmlNode[] : [];
const attr = (v: XmlNode, k: string) => String(v[`@_${k}`] ?? "");
const color = (v: string) => /^#[\da-f]{6}$/i.test(v) ? v : null;
const xml = (v: string) => v.replaceAll("&","&amp;").replaceAll('"',"&quot;").replaceAll("<","&lt;").replaceAll(">","&gt;");
const craftNames: Record<string,string> = {"stencil-01":"แม่แบบฉลุช่างปากพะยูน 01","strip-red":"แถบลายพื้นแดง","strip-blue":"แถบลายพื้นน้ำเงิน","strip-flower":"แถบลายดอก"};
const sources = [
 {folder:"lai",label:"ลายช่างปากพะยูน",credit:"ช่างภูมิปัญญาปากพะยูน (รอใส่ชื่อ)"},
 {folder:"lai-from-pdf",label:"ลายจากเอกสาร",credit:"เอกสาร 'ลาย ลวดลายในงานสถาปัตยกรรมไทย'"},
 {folder:"lai-from-book",label:"ลายจากหนังสือ",credit:"หนังสือ (รอใส่ชื่อ)"},
];
async function main() {
const patterns: CreatePattern[] = [];
await fs.mkdir(output,{recursive:true});
for (const source of sources) {
 const dir=path.join(root,source.folder);
 let catalog: {patterns?: {id:string;name_th:string;category:string;credit?:string;source_page?:number}[];_note?:string} = {};
 if(source.folder!=="lai")catalog=JSON.parse(await fs.readFile(path.join(dir,"patterns.json"),"utf8"));
 const names=catalog.patterns ?? (await fs.readdir(dir)).filter(n=>n.endsWith(".svg")).sort().map(n=>({id:n.slice(0,-4),name_th:craftNames[n.slice(0,-4)],category:"ลายช่างปากพะยูน"}));
 for(const meta of names) {
  if(!/^[a-z0-9-]+$/.test(meta.id))throw Error(`Invalid pattern id: ${meta.id}`);
  const svg=await fs.readFile(path.join(dir,`${meta.id}.svg`),"utf8");
  if(/<!DOCTYPE|<!ENTITY|<script|<foreignObject|\bon\w+\s*=|(?:href|src)\s*=/i.test(svg))throw Error(`Unsupported SVG content: ${meta.id}`);
  if(XMLValidator.validate(svg)!==true)throw Error(`Invalid SVG: ${meta.id}`);
  const node=parser.parse(svg).svg as XmlNode;
  const viewBox=attr(node,"viewBox");const box=viewBox.split(/\s+/).map(Number);
  if(box.length!==4 || box.some(n=>!Number.isFinite(n))||box[2]<=0||box[3]<=0)throw Error(`Invalid viewBox: ${meta.id}`);
  const gs=list(node.g);const outlines=list(gs.find(g=>attr(g,"id")==="outline")?.path).map(p=>({id:attr(p,"id"),d:attr(p,"d"),motif:attr(p,"data-motif")}));
  const holes:PatternPath[]=list(gs.find(g=>attr(g,"id")==="holes")?.path).map(p=>({id:attr(p,"id"),d:attr(p,"d"),group:attr(p,"data-group"),motif:attr(p,"data-motif"),color:color(attr(p,"data-color"))}));
  if(!outlines.length||!holes.length||Number(attr(node,"data-holes"))!==holes.length)throw Error(`Incomplete shapes: ${meta.id}`);
  if(new Set(holes.map(h=>h.id)).size!==holes.length || holes.some(h=>!h.id||!h.d||!h.group||!h.motif))throw Error(`Invalid holes: ${meta.id}`);
  const groups:Record<string,string[]>={};for(const h of holes)(groups[h.group]??=[]).push(h.id);
  const originalCategory=meta.category;
  const category=source.folder==="lai"?"ลายช่างปากพะยูน":originalCategory.startsWith("กระจัง")?"กระจัง":originalCategory.startsWith("พุ่ม")?"พุ่ม":originalCategory==="กระหนก"?"กนก":originalCategory;
  const id=`${source.folder}--${meta.id}`;
  const item:CreatePattern={id,originalId:meta.id,name_th:meta.name_th,category,originalCategory,svg,viewBox,width:box[2],height:box[3],outlines,holes,groups,hasCraftColors:holes.some(h=>h.color!==null),foil:color(attr(node,"data-foil")),credit:source.credit+("credit" in meta && meta.credit?` · ${meta.credit}`:""),source:`${source.folder}/${meta.id}.svg`,sourceNote:catalog._note??"ลายจากช่างปากพะยูนในชุดไฟล์ที่ผู้ใช้ให้มา",sourcePage:"source_page" in meta?Number(meta.source_page):null,sourceGroup:source.label,meaning:"",difficulty:holes.length<=10?"ง่าย":holes.length<=40?"กลาง":"ยาก",sourceHash:createHash("sha256").update(svg).digest("hex")};
  patterns.push(item);
  // Render only validated geometry, never source HTML/scripts. The originals are untouched.
  const thumb=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${xml(viewBox)}"><rect width="${box[2]}" height="${box[3]}" fill="${item.foil??"#eee5ce"}"/><g fill-rule="evenodd">${holes.map(h=>`<path d="${xml(h.d)}" fill="${h.color??"#304d45"}"/>`).join("")}</g></svg>`;
  await fs.writeFile(path.join(output,`${id}.svg`),thumb);
  // Fetch only the selected pattern, keeping all large path data out of the page payload.
  const {svg: originalSvg, ...geometry}=item;
  void originalSvg;
  await fs.writeFile(path.join(output,`${id}.json`),JSON.stringify(geometry));
 }
}
const manifest:PatternSummary[]=patterns.map(p=>({id:p.id,originalId:p.originalId,name_th:p.name_th,category:p.category,originalCategory:p.originalCategory,viewBox:p.viewBox,width:p.width,height:p.height,hasCraftColors:p.hasCraftColors,foil:p.foil,credit:p.credit,source:p.source,sourceNote:p.sourceNote,sourcePage:p.sourcePage,sourceGroup:p.sourceGroup,meaning:p.meaning,difficulty:p.difficulty,sourceHash:p.sourceHash,holeCount:p.holes.length,groupCount:Object.keys(p.groups).length,thumbnail:`/create-patterns/${p.id}.svg`,dataUrl:`/create-patterns/${p.id}.json`}));
await fs.writeFile("src/data/patterns.json",JSON.stringify(patterns));
await fs.writeFile("src/data/create-pattern-catalog.json",JSON.stringify(manifest,null,2)+"\n");
console.log(`Built ${patterns.length} patterns, ${patterns.reduce((n,p)=>n+p.holes.length,0)} holes. Originals unchanged.`);

}
main().catch(error=>{console.error(error);process.exitCode=1;});

