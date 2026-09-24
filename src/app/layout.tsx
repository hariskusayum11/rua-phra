import type { Metadata } from "next";
import "@fontsource/ibm-plex-sans-thai/400.css";
import "@fontsource/ibm-plex-sans-thai/500.css";
import "@fontsource/ibm-plex-sans-thai/600.css";
import "@fontsource/noto-sans-thai/400.css";
import "@fontsource/noto-sans-thai/500.css";
import "@fontsource/noto-serif-thai/500.css";
import "@fontsource/noto-serif-thai/600.css";
import "./globals.css";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";

export const metadata: Metadata = {
  title: {
    default: "เรือพระเล่าเรื่อง | คลังเรื่องราวและภูมิปัญญาเรือพระปากพะยูน",
    template: "%s | เรือพระเล่าเรื่อง",
  },
  description: "ทุกลายมีเรื่อง ทุกเรื่องมีคนส่งต่อ — คลังเรื่องราว ภูมิปัญญา และการเรียนรู้เรือพระแห่งปากพะยูน",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="th">
      <body>
        {/* Scroll reveals start transparent; without scripting they must simply be there.
            Written as raw markup so React does not hoist the <style> out of the <noscript>. */}
        <noscript dangerouslySetInnerHTML={{ __html: "<style>.reveal{opacity:1;transform:none}</style>" }} />
        <a className="skip-link" href="#main-content">ข้ามไปยังเนื้อหา</a>
        <SiteHeader />
        <div className="header-spacer" aria-hidden="true" />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
