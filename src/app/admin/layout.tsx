import Link from "next/link";
import { redirect } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { auth } from "@/auth";
import { logoutAction } from "@/app/admin/actions";
import { AdminNav } from "@/components/admin/admin-nav";
import { resources } from "@/lib/admin/resources";

// Only the names travel to the browser. The rest of the resource definitions — every
// field, help text and option list in the admin — has no business in the menu bundle.
const labels = Object.fromEntries(Object.entries(resources).map(([key, value]) => [key, value.label]));

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session=await auth(); if(!session?.user?.email) redirect("/login");
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand"><span>เรือพระเล่าเรื่อง</span><small>CONTENT MANAGEMENT</small></div>
        {/* An editor is always editing something that has a public page. */}
        <Link className="admin-view-site" href="/" target="_blank" rel="noreferrer">
          <ExternalLink aria-hidden="true" />ดูเว็บไซต์
        </Link>
        <AdminNav labels={labels} />
        <form action={logoutAction}><button type="submit">ออกจากระบบ</button></form>
      </aside>
      <div className="admin-workspace">
        <header className="admin-topbar"><span>ระบบจัดการองค์ความรู้</span><span>{session.user.email}</span></header>
        {children}
      </div>
    </div>
  );
}
