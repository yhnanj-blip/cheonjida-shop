import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "천지다 | 차 주문",
  description: "천지다 차 상품을 살펴보고 주문을 접수하세요.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">{children}</body>
    </html>
  );
}
