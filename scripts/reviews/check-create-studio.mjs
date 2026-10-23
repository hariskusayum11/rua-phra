import {chromium} from 'playwright';import assert from 'node:assert/strict';import sharp from 'sharp';
const base=process.env.CREATE_REVIEW_URL||'http://localhost:3111';
const b=await chromium.launch({channel:'chrome',args:['--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const p=await b.newPage({viewport:{width:1440,height:900}});const errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')console.log('console:',m.text().slice(0,200));});
await p.goto(base+'/create',{waitUntil:'domcontentloaded'});
await p.locator('.layout-quick-patterns img').first().evaluate(img=>img.decode());await p.screenshot({path:'artifacts/redesign-layout.png',fullPage:true});
await p.getByRole('button',{name:'น้ำเงิน',exact:true}).click();
await p.locator('.layout-controls select').first().selectOption('triangle');
for(let i=0;i<6;i++)await p.locator('.layout-quick-patterns button').nth(i).click();
await p.getByRole('button',{name:'เริ่มตอกลาย',exact:true}).click();await p.getByRole('button',{name:'ตอกที่เหลืออัตโนมัติ',exact:true}).click();await p.getByRole('button',{name:'เริ่มอัดดอก →',exact:true}).click();
await p.getByRole('button',{name:'ชุดสีแบบช่าง',exact:true}).click();
await p.waitForFunction(()=>{const el=document.querySelector('.color-board-scroll');return el.scrollHeight<=el.clientHeight+2&&el.scrollWidth<=el.clientWidth+2;});
assert.ok(await p.locator('.color-board-scroll').evaluate(el=>el.scrollHeight<=el.clientHeight+2),'whole sheet fits without scrolling at 1x');
await p.screenshot({path:'artifacts/redesign-color.png',fullPage:true});await p.getByRole('button',{name:'เสร็จสิ้น',exact:true}).click();
for(const [id,label] of [['art','แผ่นลาย'],['mug','แก้ว'],['bag','ถุงผ้า'],['boat','เรือพระ']]){
 await p.locator('.result-options').getByRole('button',{name:label,exact:true}).click();
 const button=p.getByRole('button',{name:'เตรียมภาพ PNG',exact:true});await button.waitFor();
 await p.waitForFunction(()=>!Array.from(document.querySelectorAll('button')).find(b=>b.textContent.includes('เตรียมภาพ PNG'))?.disabled);
 await p.screenshot({path:'artifacts/redesign-'+id+'.png',fullPage:true});
 await button.click();await p.locator('.result-actions a[download]').waitFor();const [dl]=await Promise.all([p.waitForEvent('download'),p.locator('.result-actions a[download]').click()]);await dl.saveAs('artifacts/redesign-export-'+id+'.png');
 const meta=await sharp('artifacts/redesign-export-'+id+'.png').metadata();assert.equal(meta.width,1800);
 const stats=await sharp('artifacts/redesign-export-'+id+'.png').stats();assert.ok(stats.channels.some(c=>c.stdev>20),'export has visible coloured artwork');
 const rect=await p.locator('.result-actions').boundingBox();assert.ok(rect.y+rect.height<=900,'desktop primary actions fit viewport');
 if(id!=='art'){await p.getByRole('button',{name:'หมุนสินค้า',exact:true}).click();await p.getByRole('button',{name:'คืนมุมมองเริ่มต้น',exact:true}).click();}
 console.log(id,'export and viewport passed');
}
for(const width of [360,768,1440,1920]){
 await p.setViewportSize({width,height:900});await p.waitForTimeout(200);
 assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 if(width===360)await p.screenshot({path:'artifacts/redesign-mobile.png',fullPage:true});
}
assert.deepEqual(errors,[]);
const storage=await p.context().storageState();
const fallbackContext=await b.newContext({storageState:storage});
await fallbackContext.addInitScript(()=>{
 const original=HTMLCanvasElement.prototype.getContext;
 HTMLCanvasElement.prototype.getContext=function(type,...args){if(type==='webgl'||type==='webgl2'||type==='experimental-webgl')return null;return original.call(this,type,...args);};
});
const fallback=await fallbackContext.newPage();await fallback.goto(base+'/create');
await fallback.getByRole('button',{name:'เริ่มตอกลาย',exact:true}).click();await fallback.getByRole('button',{name:'เริ่มอัดดอก →',exact:true}).click();await fallback.getByRole('button',{name:'เสร็จสิ้น',exact:true}).click();
await fallback.getByRole('button',{name:'ดูแผ่นงานต้นฉบับ',exact:true}).click();await fallback.getByRole('button',{name:'เตรียมภาพ PNG',exact:true}).click();await fallback.locator('.result-actions a[download]').waitFor();
console.log('responsive, product export, no runtime errors, and WebGL fallback passed');await b.close();
