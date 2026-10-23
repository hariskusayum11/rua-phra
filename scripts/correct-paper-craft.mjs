import 'dotenv/config';
import {writeFile,mkdir} from 'node:fs/promises';
import {PrismaPg} from '@prisma/adapter-pg';
import {PrismaClient} from '../src/generated/prisma/client.ts';
const db=new PrismaClient({adapter:new PrismaPg({connectionString:process.env.DATABASE_URL})});
const step=await db.processStep.findUnique({where:{slug:'embossing-demo'}});
const pattern=await db.pattern.findUnique({where:{slug:'kled-phaya-nak-rattanaram'}});
await mkdir('artifacts/content-backups',{recursive:true});
await writeFile(`artifacts/content-backups/paper-correction-${Date.now()}.json`,JSON.stringify({step,pattern},null,2));
await db.$transaction([
 db.processStep.update({where:{slug:'embossing-demo'},data:{title:'อัดกนกด้วยกระดาษ',description:'สร้างลวดลายกนกด้วยกระดาษสำหรับงานประดับเรือพระปากพะยูน ควบคู่กับงานลวดลายฉลุ รายละเอียดวิธีอัดกนกรอการบันทึกและตรวจสอบร่วมกับช่าง'}}),
 db.pattern.update({where:{slug:'kled-phaya-nak-rattanaram'},data:{characteristics:'เกล็ดรูปโค้งซ้อนเหลื่อมกันเป็นชั้น ภายในมีลวดลายและสีบานเย็นสลับสีทอง รายละเอียดวัสดุของเกล็ดแต่ละส่วนรอการตรวจสอบร่วมกับช่าง'}})
]);
console.log('Updated 2 records; original records backed up locally.');await db.$disconnect();
