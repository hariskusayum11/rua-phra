import * as T from "three";
import type {MockupKind} from "./result";

export function createProduct(kind:Exclude<MockupKind,"art">,map:T.Texture){
 const group=new T.Group();
 const gold=new T.MeshStandardMaterial({color:0xc39a47,metalness:.72,roughness:.28});
 const cream=new T.MeshStandardMaterial({color:0xf5efe2,roughness:.82});
 const wood=new T.MeshStandardMaterial({color:0x53301c,roughness:.55});
 const ceramic=new T.MeshStandardMaterial({color:0xfffcf5,roughness:.19,metalness:.04});
 const printed=new T.MeshStandardMaterial({map,roughness:kind==="mug"?.24:.75,metalness:kind==="boat"?.16:0,side:T.DoubleSide});
 function mesh(g:T.BufferGeometry,m:T.Material,x=0,y=0,z=0){const o=new T.Mesh(g,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;group.add(o);return o;}
 function tube(points:number[][],r:number,m:T.Material){return mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),64,r,10,false),m);}
 if(kind==="mug"){
  // Hollow ceramic body: printed outside, plain interior, rounded lip and foot.
  mesh(new T.CylinderGeometry(.89,.82,1.75,96,1,true),printed,0,.98,0);
  const inner=mesh(new T.CylinderGeometry(.82,.76,1.65,96,1,true),ceramic,0,1.01,0);inner.material=new T.MeshStandardMaterial({color:0xeee9de,side:T.BackSide,roughness:.2});
  mesh(new T.CylinderGeometry(.82,.82,.09,96),ceramic,0,.15,0);
  const lip=mesh(new T.TorusGeometry(.855,.036,12,96),ceramic,0,1.855,0);lip.rotation.x=Math.PI/2;
  const foot=mesh(new T.TorusGeometry(.8,.035,12,96),ceramic,0,.12,0);foot.rotation.x=Math.PI/2;
  tube([[.82,1.5,0],[1.36,1.52,0],[1.5,1.05,0],[1.28,.52,0],[.8,.5,0]],.105,ceramic);
 }else if(kind==="bag"){
  const weave=document.createElement("canvas");weave.width=128;weave.height=128;
  const ctx=weave.getContext("2d")!;ctx.fillStyle="#888";ctx.fillRect(0,0,128,128);
  ctx.strokeStyle="#bcbcbc";ctx.lineWidth=1;
  for(let i=0;i<128;i+=4){ctx.beginPath();ctx.moveTo(i,0);ctx.lineTo(i,128);ctx.moveTo(0,i);ctx.lineTo(128,i);ctx.stroke();}
  const bump=new T.CanvasTexture(weave);bump.wrapS=bump.wrapT=T.RepeatWrapping;bump.repeat.set(8,8);
  printed.bumpMap=bump;printed.bumpScale=.018;printed.roughness=.95;

  // Soft front and back panels with curved sides, restrained fabric ripples.
  for(const side of [1,-1]){
   const g=new T.PlaneGeometry(2.05,2.05,48,48);const pos=g.attributes.position;
   for(let i=0;i<pos.count;i++){const x=pos.getX(i),y=pos.getY(i);const edge=Math.max(0,1-(x/1.025)**2);pos.setXYZ(i,x*(1+.035*y),y+1.16,side*(.2+edge*.075+Math.sin(x*16+y*3)*.018*edge));}
   g.computeVertexNormals();const panel=mesh(g,printed);if(side<0)panel.material=printed;
  }
  const sideMaterial=new T.MeshStandardMaterial({color:0xd5c3a2,roughness:1});
  mesh(new T.BoxGeometry(.08,2.05,.42),sideMaterial,-1.02,1.16);
  mesh(new T.BoxGeometry(.08,2.05,.42),sideMaterial,1.02,1.16);
  mesh(new T.BoxGeometry(2.05,.09,.44),sideMaterial,0,.14);
  for(const z of [-.23,.23]){
   tube([[-.63,2.12,z],[-.62,2.78,z],[-.3,3.12,z],[.3,3.12,z],[.62,2.78,z],[.63,2.12,z]],.065,cream);
   tube([[-1,2.17,z],[0,2.14,z],[1,2.17,z]],.025,cream);
   // Physical seams catch the studio light along the edge of each panel.
   for(const x of [-.97,.97])tube([[x,.2,z],[x,1.1,z],[x,2.1,z]],.009,cream);
  }
 }else{
  // A decorative miniature inspired by a processional boat, not a replica.
  const shape=new T.Shape();shape.moveTo(-2.65,.95);shape.bezierCurveTo(-1.1,.55,1.1,.55,2.65,.95);shape.lineTo(2.1,.18);shape.quadraticCurveTo(0,-.12,-2.1,.18);shape.closePath();
  const hull=new T.ExtrudeGeometry(shape,{depth:.8,bevelEnabled:true,bevelThickness:.05,bevelSize:.04,bevelSegments:3,steps:1});hull.translate(0,0,-.4);
  const pos=hull.attributes.position,uv=hull.attributes.uv;for(let i=0;i<pos.count;i++)uv.setXY(i,(pos.getX(i)+2.7)/5.4,pos.getY(i)/1.1);
  mesh(hull,printed);
  for(const z of [-.45,.45]){
   tube([[-2.65,.96,z],[-1.3,.68,z],[0,.63,z],[1.3,.68,z],[2.65,.96,z]],.045,gold);
   tube([[-2.1,.18,z],[0,.02,z],[2.1,.18,z]],.04,gold);
   for(let i=0;i<25;i++){const x=-2.04+i*.17;mesh(new T.SphereGeometry(.036,8,6),gold,x,.25,z);}
  }
  mesh(new T.BoxGeometry(2.1,.16,1.05),gold,0,.93);
  mesh(new T.BoxGeometry(1.65,.85,.8),printed,0,1.4);
  for(const x of [-.82,.82])for(const z of [-.4,.4])mesh(new T.CylinderGeometry(.035,.045,1.05,12),gold,x,1.5,z);
  for(let i=0;i<3;i++){
   const roof=mesh(new T.ConeGeometry(1.28-i*.2,.5,4),i%2?gold:printed,0,1.98+i*.33);
   roof.rotation.y=Math.PI/4;roof.scale.z=.68;
  }
  for(let i=0;i<7;i++)mesh(new T.ConeGeometry(.23-i*.025,.25,12),gold,0,2.85+i*.16);
  for(const sign of [-1,1]){
   tube([[sign*2.35,.65,0],[sign*2.8,1.2,0],[sign*2.92,1.85,0],[sign*2.7,2.15,0],[sign*2.43,2.02,0]],.075,gold);
   for(let i=0;i<8;i++){
    const fin=mesh(new T.ConeGeometry(.12,.38,3),i%2?gold:printed,sign*(2.5+i*.045),.95+i*.14,0);
    fin.rotation.z=-sign*.65;
   }
   mesh(new T.SphereGeometry(.12,16,12),wood,sign*2.48,2.02,0);
  }
  // Dark presentation plinth anchors the miniature and receives its shadows.
  mesh(new T.BoxGeometry(4.8,.12,1.25),wood,0,-.12);
 }
 return group;
}
