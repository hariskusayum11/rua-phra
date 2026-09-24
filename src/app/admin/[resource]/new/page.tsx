import { notFound } from "next/navigation";
import { AdminResourceForm } from "@/components/admin/resource-form";
import { isResourceKey, resources } from "@/lib/admin/resources";
import { getAdminOptions } from "@/lib/services/admin";

export default async function NewResourcePage({params}:{params:Promise<{resource:string}>}) { const {resource}=await params;if(!isResourceKey(resource))notFound();return <main id="main-content" className="admin-main"><header className="admin-page-head"><div><p className="admin-kicker">New record</p><h1>เพิ่ม{resources[resource].singular}</h1></div></header><AdminResourceForm resource={resource} options={await getAdminOptions()} /></main>; }
