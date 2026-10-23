import type {Draft} from "./layout";
import type {CreatePattern} from "./types";
type Geometry=Omit<CreatePattern,"svg">;

/** Recompose the user's coloured motifs as a repeating print, not a triangular
 * sticker. Source path data stays untouched; each motif keeps its aspect ratio. */
export function productTexture(draft:Draft,geometry:Record<string,Geometry>,colors:Record<string,string>,density:number){
 const canvas=document.createElement("canvas");canvas.width=2048;canvas.height=1024;
 const ctx=canvas.getContext("2d")!;ctx.fillStyle=draft.foil;ctx.fillRect(0,0,2048,1024);
 const ns="http://www.w3.org/2000/svg";const svg=document.createElementNS(ns,"svg");
 svg.style.cssText="position:fixed;left:-10000px;top:0;width:1000px;height:600px;visibility:hidden";
 document.body.appendChild(svg);
 try{
 const motifs=draft.placements.map(p=>{
  const g=document.createElementNS(ns,"g");svg.appendChild(g);
  for(const hole of geometry[p.patternId].holes){const path=document.createElementNS(ns,"path");path.setAttribute("d",hole.d);g.appendChild(path);}
  const bounds=g.getBBox();g.remove();return {p,bounds};
 }).filter(m=>m.bounds.width>0&&m.bounds.height>0);
 if(!motifs.length)throw Error("ยังไม่มีลายสำหรับตกแต่งสินค้า");
 const columns=Math.max(2,Math.round(density*2));const rows=Math.max(2,Math.round(density),Math.ceil(motifs.length/columns));
 const w=2048/columns,h=1024/rows;
 for(let row=0;row<rows;row++)for(let col=0;col<columns;col++){
  const {p,bounds}=motifs[(row*columns+col)%motifs.length];
  const s=Math.min(w*.94/bounds.width,h*.92/bounds.height);
  const tileW=bounds.width*s,tileH=bounds.height*s;
  const repeatX=Math.max(1,Math.floor(w/tileW)),repeatY=Math.max(1,Math.floor(h/tileH));
  ctx.save();ctx.beginPath();ctx.rect(col*w,row*h,w,h);ctx.clip();
  for(let ry=0;ry<repeatY;ry++)for(let rx=0;rx<repeatX;rx++){
   ctx.save();ctx.translate(col*w+(rx+.5)*w/repeatX,row*h+(ry+.5)*h/repeatY);
   ctx.scale(p.flip?-s:s,s);ctx.translate(-bounds.x-bounds.width/2,-bounds.y-bounds.height/2);
   for(const hole of geometry[p.patternId].holes){const color=colors[p.id+":"+hole.id];if(!color)continue;ctx.fillStyle=color;ctx.fill(new Path2D(hole.d),"evenodd");}
   ctx.restore();
  }
  ctx.restore();
 }
 // Fine foil/paper grain, deterministic so preview and exported artwork agree.
 ctx.fillStyle="#ffffff";ctx.globalAlpha=.065;
 for(let y=0;y<1024;y+=4)ctx.fillRect(0,y,2048,1);
 ctx.globalAlpha=1;
 return canvas;
 }finally{svg.remove();}
}
