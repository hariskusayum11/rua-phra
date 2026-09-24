import { notFound } from "next/navigation";
import { AdminResourceForm } from "@/components/admin/resource-form";
import { isResourceKey, resources } from "@/lib/admin/resources";
import { getAdminOptions, getAdminRecord } from "@/lib/services/admin";

export default async function EditResourcePage({params,searchParams}:{params:Promise<{resource:string;id:string}>;searchParams:Promise<{created?:string}>}) { const [{resource,id},query]=await Promise.all([params,searchParams]);if(!isResourceKey(resource))notFound();const [record,options]=await Promise.all([getAdminRecord(resource,id),getAdminOptions()]);if(!record)notFound();return <main id="main-content" className="admin-main"><header className="admin-page-head"><div><p className="admin-kicker">Edit record</p><h1>แก้ไข{resources[resource].singular}</h1></div></header><AdminResourceForm resource={resource} id={id} initialValues={record} options={options} created={query.created==="1"}/></main>; }
