import 'dotenv/config';
import {PrismaPg} from '@prisma/adapter-pg';
import {PrismaClient} from '../src/generated/prisma/client.ts';
const db=new PrismaClient({adapter:new PrismaPg({connectionString:process.env.DATABASE_URL})});
for(const [name,rows] of [['steps',await db.processStep.findMany({select:{slug:true,title:true,description:true}})],['patterns',await db.pattern.findMany({select:{slug:true,name:true,characteristics:true,meaning:true}})],['boats',await db.boat.findMany({select:{slug:true,summary:true,concept:true}})]])console.log(name,JSON.stringify(rows));
await db.$disconnect();
