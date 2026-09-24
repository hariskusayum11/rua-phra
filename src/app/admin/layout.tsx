import Link from "next/link";
import { redirect } from "next/navigation";
import { Archive, BookOpenText, Boxes, DraftingCompass, GraduationCap, Image as ImageIcon, Landmark, LayoutDashboard, MapPin, NotebookPen, QrCode, ScrollText, Ship, Users, Wrench } from "lucide-react";
import { auth } from "@/auth";
import { logoutAction } from "@/app/admin/actions";
import { resources } from "@/lib/admin/resources";

const nav = [
  ["media", ImageIcon], ["temples", Landmark], ["boats", Ship], ["stories", BookOpenText], ["sections", MapPin], ["patterns", DraftingCompass], ["masters", Users],
  ["processes", Archive], ["steps", ScrollText], ["materials", Boxes], ["tools", Wrench], ["techniques", DraftingCompass],
  ["sources", BookOpenText], ["courses", GraduationCap], ["lessons", NotebookPen], ["qr-codes", QrCode],
] as const;

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session=await auth(); if(!session?.user?.email) redirect("/login");
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand"><span>เรือพระเล่าเรื่อง</span><small>CONTENT MANAGEMENT</small></div>
        <nav aria-label="เมนูผู้ดูแล">
          <Link href="/admin"><LayoutDashboard aria-hidden="true" />ภาพรวม</Link>
          {nav.map(([key,Icon])=><Link key={key} href={`/admin/${key}`}><Icon aria-hidden="true" />{resources[key].label}</Link>)}
        </nav>
        <form action={logoutAction}><button type="submit">ออกจากระบบ</button></form>
      </aside>
      <div className="admin-workspace">
        <header className="admin-topbar"><span>ระบบจัดการองค์ความรู้</span><span>{session.user.email}</span></header>
        {children}
      </div>
    </div>
  );
}
