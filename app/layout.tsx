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
  title: "Daily Korean",
  description: "Let’s study one Korean sentence every day!",
  openGraph: {
    title: "My Sentence of the Day",
    description: "Let’s study one Korean sentence every day!",
    url: "https://one-day-one-language-one-grammar-qa.vercel.app/", // 배포된 실제 주소
    siteName: "Daily Korean",
    images: [
      {
        url: "/oneDayKorean.png", // public 폴더에 저장한 이미지 경로
        width: 1200,
        height: 630,
        alt: "Service Thumnail",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  //SEO 설정
  icons: {
    icon: '/favicon.ico',
    apple: '/oneDayKorean.png',
  },
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


