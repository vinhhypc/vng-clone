import type { Metadata } from "next";
import { CursorDot } from "@/components/sites/vng22/cursor-dot";
import { SiteHeader } from "@/components/sites/vng22/site-header";
import "./globals.css";

export const metadata: Metadata = {
  title: "VNG22 — Human²",
  description: "Con người định hướng giá trị. AI cộng hưởng tác động.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body>
        <SiteHeader />
        {children}
        <div aria-hidden="true" className="grain-overlay" />
        <CursorDot />
      </body>
    </html>
  );
}
