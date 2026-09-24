import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signIn } from "@/auth";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const failed = Boolean((await searchParams).error);
  return (
    <main id="main-content" className="login-page" tabIndex={-1}>
      <form className="login-panel" action={async (formData) => {
        "use server";
        try {
          await signIn("credentials", { email: formData.get("email"), password: formData.get("password"), redirectTo: "/admin" });
        } catch (error) {
          if (error instanceof AuthError) redirect("/login?error=credentials");
          throw error;
        }
      }}>
        <p className="admin-kicker">Rua Phra Story CMS</p>
        <h1>เข้าสู่ระบบจัดการเนื้อหา</h1>
        {failed && <p className="form-alert" role="alert">อีเมลหรือรหัสผ่านไม่ถูกต้อง</p>}
        <label>อีเมล<input name="email" type="email" autoComplete="username" required /></label>
        <label>รหัสผ่าน<input name="password" type="password" autoComplete="current-password" required /></label>
        <button type="submit">เข้าสู่ระบบ</button>
      </form>
    </main>
  );
}
