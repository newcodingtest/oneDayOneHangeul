import KakaoRedirect from '@/components/KakaoRedirect';
import { Analytics } from '@vercel/analytics/react';
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// ✅ 별도의 viewport 상수로 분리해서 export 하세요
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1, 
};

export const metadata: Metadata = {
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <KakaoRedirect /> {/* ✅ 클라이언트 로직만 여기서 실행 */}
        {children}
        <Analytics />
        {/* 모든 페이지에 공통으로 들어가는 구조화 데이터(SEO) */}

      </body>
    </html>
  );
}


