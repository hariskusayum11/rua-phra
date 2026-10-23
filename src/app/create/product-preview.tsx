"use client";
import {forwardRef,useEffect,useImperativeHandle,useRef,useState} from "react";
import * as T from "three";
import {OrbitControls} from "three/addons/controls/OrbitControls.js";
import {RoomEnvironment} from "three/addons/environments/RoomEnvironment.js";
import {RotateCcw,RotateCw,ZoomIn,ZoomOut} from "lucide-react";
import type {Draft} from "@/lib/create/layout";
import type {CreatePattern} from "@/lib/create/types";
import type {MockupKind} from "@/lib/create/result";
import {productTexture} from "@/lib/create/product-texture";
import {createProduct} from "@/lib/create/product-models";
export type ProductPreviewHandle={capture:()=>HTMLCanvasElement};
type Props={draft:Draft;geometry:Record<string,Omit<CreatePattern,"svg">>;colors:Record<string,string>;kind:Exclude<MockupKind,"art">;density:number;onReady:(ready:boolean)=>void;onFallback:()=>void};
export default forwardRef<ProductPreviewHandle,Props>(function ProductPreview({draft,geometry,colors,kind,density,onReady,onFallback},ref){
 const host=useRef<HTMLDivElement>(null);
 const api=useRef<{capture:()=>HTMLCanvasElement;reset:()=>void;rotate:()=>void;zoom:(factor:number)=>void}|null>(null);
 const [error,setError]=useState("");
 useImperativeHandle(ref,()=>({capture:()=>{if(!api.current)throw Error("ภาพ 3 มิติยังไม่พร้อม");return api.current.capture();}}),[]);
 useEffect(()=>{
  const el=host.current;if(!el)return;
  let renderer:T.WebGLRenderer|null=null,controls:OrbitControls|null=null,observer:ResizeObserver|null=null;
  const scene=new T.Scene();let environment:T.WebGLRenderTarget|null=null;let cancelled=false;
  onReady(false);
  const onLost=(event:Event)=>{event.preventDefault();onReady(false);setError("อุปกรณ์พักการแสดงภาพ 3 มิติ กรุณากลับไปแผ่นงานแล้วเปิดสินค้าอีกครั้ง");};
  try{
   renderer=new T.WebGLRenderer({antialias:true,alpha:false,preserveDrawingBuffer:true});
   renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));renderer.setClearColor(0xeeeae2);scene.background=new T.Color(0xeeeae2);scene.fog=new T.Fog(0xeeeae2,12,32);
   renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
   renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=.8;
   renderer.domElement.setAttribute("aria-label","ภาพจำลองสามมิติ ลากเพื่อหมุน ใช้ปุ่มด้านล่างเพื่อซูม");
   renderer.domElement.setAttribute("role","img");
   renderer.domElement.addEventListener("webglcontextlost",onLost);
   el.appendChild(renderer.domElement);
   const pmrem=new T.PMREMGenerator(renderer);const room=new RoomEnvironment();
   environment=pmrem.fromScene(room,.04);scene.environment=environment.texture;scene.environmentIntensity=.4;room.dispose();pmrem.dispose();
   scene.add(new T.HemisphereLight(0xffffff,0x8a7660,.65));
   const key=new T.DirectionalLight(0xfff4dc,2.2);key.position.set(-3,6,5);key.castShadow=true;
   key.shadow.mapSize.set(2048,2048);key.shadow.camera.left=-5;key.shadow.camera.right=5;key.shadow.camera.top=5;key.shadow.camera.bottom=-5;key.shadow.bias=-.0005;scene.add(key);
   const fill=new T.DirectionalLight(0xdbeaff,.65);fill.position.set(4,3,-4);scene.add(fill);
   const texture=new T.CanvasTexture(productTexture(draft,geometry,colors,density));texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
   const product=createProduct(kind,texture);scene.add(product);
   const box=new T.Box3().setFromObject(product);const center=box.getCenter(new T.Vector3());const size=box.getSize(new T.Vector3());
   product.position.sub(center);product.position.y+=size.y/2;
   const floor=new T.Mesh(new T.PlaneGeometry(200,200),new T.ShadowMaterial({color:0x33271b,opacity:.18}));
   floor.rotation.x=-Math.PI/2;floor.position.y=-.025;floor.receiveShadow=true;scene.add(floor);
   const camera=new T.PerspectiveCamera(34,1,.1,100);
   const target=new T.Vector3(0,size.y*.48,0);
   controls=new OrbitControls(camera,renderer.domElement);controls.target.copy(target);
   controls.enablePan=false;controls.enableZoom=false;controls.minPolarAngle=.45;controls.maxPolarAngle=Math.PI/2-.03;
   const render=()=>{if(!cancelled)renderer!.render(scene,camera);};
   let distance=5;
   const reset=()=>{
    const aspect=Math.max(.4,el.clientWidth/Math.max(1,el.clientHeight));
    distance=Math.max(size.y,size.x/aspect)*.5/Math.tan(T.MathUtils.degToRad(17))*1.3;
    camera.position.set(distance*.27,target.y+distance*.3,distance*.94);
    controls!.target.copy(target);controls!.update();render();
   };
   const resize=()=>{renderer!.setSize(el.clientWidth,el.clientHeight);camera.aspect=el.clientWidth/el.clientHeight;camera.updateProjectionMatrix();reset();};
   controls.addEventListener("change",render);
   api.current={
    reset,
    rotate:()=>{const offset=camera.position.clone().sub(target);offset.applyAxisAngle(new T.Vector3(0,1,0),Math.PI/8);camera.position.copy(target).add(offset);controls!.update();},
    zoom:(factor)=>{const offset=camera.position.clone().sub(target);const next=Math.max(distance*.6,Math.min(distance*1.7,offset.length()*factor));offset.setLength(next);camera.position.copy(target).add(offset);controls!.update();},
    capture:()=>{
     // Export the current angle at a consistent resolution, then restore the viewport.
     const oldAspect=camera.aspect,oldRatio=renderer!.getPixelRatio(),oldPosition=camera.position.clone();const w=el.clientWidth,h=el.clientHeight;
     const direction=camera.position.clone().sub(target);const exportDistance=Math.max(size.y,size.x/1.5)*.5/Math.tan(T.MathUtils.degToRad(17))*1.3;direction.setLength(exportDistance*direction.length()/distance);camera.position.copy(target).add(direction);camera.lookAt(target);
     renderer!.setPixelRatio(1);renderer!.setSize(1800,1200,false);camera.aspect=1.5;camera.updateProjectionMatrix();render();
     const output=document.createElement("canvas");output.width=1800;output.height=1200;output.getContext("2d")!.drawImage(renderer!.domElement,0,0);
     renderer!.setPixelRatio(oldRatio);renderer!.setSize(w,h);camera.position.copy(oldPosition);camera.lookAt(target);camera.aspect=oldAspect;camera.updateProjectionMatrix();render();return output;
    }
   };
   observer=new ResizeObserver(resize);observer.observe(el);resize();onReady(true);
  }catch(e){queueMicrotask(()=>{if(!cancelled){setError(e instanceof Error?"อุปกรณ์นี้ยังแสดงภาพ 3 มิติไม่ได้ ใช้แผ่นงานต้นฉบับและดาวน์โหลดได้ตามปกติ":"โหลดภาพจำลองไม่ได้");onReady(false);}});}
  return()=>{
   cancelled=true;onReady(false);api.current=null;observer?.disconnect();controls?.dispose();
   const textures=new Set<T.Texture>();const materials=new Set<T.Material>();
   scene.traverse(o=>{if(o instanceof T.Mesh){o.geometry.dispose();for(const mat of Array.isArray(o.material)?o.material:[o.material]){materials.add(mat);for(const value of Object.values(mat))if(value instanceof T.Texture)textures.add(value);}}});
   textures.forEach(t=>t.dispose());materials.forEach(m=>m.dispose());environment?.dispose();
   if(renderer){renderer.domElement.removeEventListener("webglcontextlost",onLost);renderer.dispose();renderer.forceContextLoss();renderer.domElement.remove();}
  };
 },[draft,geometry,colors,kind,density,onReady]);
 return <div className="product-preview"><div className="product-canvas" ref={host}/>{error?<div className="product-error" role="alert"><p>{error}</p><button onClick={onFallback}>ดูแผ่นงานต้นฉบับ</button></div>:<><span className="product-hint">ลากเพื่อหมุนดูรอบชิ้นงาน</span><div className="product-camera-tools" aria-label="มุมมองสินค้า"><button aria-label="หมุนสินค้า" onClick={()=>api.current?.rotate()}><RotateCw size={18}/></button><button aria-label="ขยายสินค้า" onClick={()=>api.current?.zoom(.85)}><ZoomIn size={18}/></button><button aria-label="ย่อสินค้า" onClick={()=>api.current?.zoom(1.15)}><ZoomOut size={18}/></button><button aria-label="คืนมุมมองเริ่มต้น" onClick={()=>api.current?.reset()}><RotateCcw size={18}/></button></div></>}</div>;
});
