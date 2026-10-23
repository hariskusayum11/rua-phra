export type Placement = {id:string;patternId:string;x:number;y:number;scale:number;rotation:number;flip:boolean;slot:number|null};
export type Draft = {foil:string;template:"strip"|"square"|"triangle";mode:"slots"|"free";placements:Placement[]};
export const initialDraft:Draft={foil:"#eeeef0",template:"strip",mode:"slots",placements:[]};
export const foils=[{name:"เงิน",color:"#eeeef0"},{name:"ทอง",color:"#d7ad4c"},{name:"แดง",color:"#ca354c"},{name:"น้ำเงิน",color:"#28509b"},{name:"เขียว",color:"#31856c"}];
export function slots(template:Draft["template"]){return template==="strip"?Array.from({length:6},(_,i)=>({x:85+i*166,y:300,w:150,h:470})):template==="square"?Array.from({length:9},(_,i)=>({x:170+(i%3)*330,y:105+Math.floor(i/3)*195,w:300,h:175})):[{x:500,y:115,w:160,h:150},{x:355,y:300,w:240,h:170},{x:645,y:300,w:240,h:170},{x:200,y:495,w:270,h:170},{x:500,y:495,w:270,h:170},{x:800,y:495,w:270,h:170}];}
export function validDraft(value:unknown, ids:Set<string>):value is Draft {
 if(!value||typeof value!=="object")return false;
 const d=value as Draft;
 return foils.some(f=>f.color===d.foil)&&["strip","square","triangle"].includes(d.template)&&["slots","free"].includes(d.mode)&&Array.isArray(d.placements)&&d.placements.length<=60&&new Set(d.placements.map(p=>p.id)).size===d.placements.length&&d.placements.every(p=>typeof p.id==="string"&&ids.has(p.patternId)&&[p.x,p.y,p.scale,p.rotation].every(Number.isFinite)&&p.x>=0&&p.x<=1000&&p.y>=0&&p.y<=600&&p.scale>=.2&&p.scale<=4&&typeof p.flip==="boolean"&&(p.slot===null||Number.isInteger(p.slot)&&p.slot>=0&&p.slot<slots(d.template).length));
}
