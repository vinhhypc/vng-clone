import type { Metadata } from "next";
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
      <body>{children}</body>
    </html>
  );
}
