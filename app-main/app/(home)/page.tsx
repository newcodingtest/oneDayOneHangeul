"use client"
//app/(home)/page.tsx
import Footer from '@/components/Footer';
import GrammarContentClient from '@/components/GrammarContentClient'; // 새로 만들 파일
import Header from '@/components/Header';
import { GrammarLesson } from '@/types/grammer';
import { useEffect, useState } from 'react';

export default function DailyGrammarPage() {
const [lesson, setLesson] = useState<GrammarLesson | null>(null);
function formatDateString(dateStr: string): string {
  // 1. 숫자만 추출합니다 (결과 예: ["2026", "2", "12"])
  const numbers = dateStr.match(/\d+/g);

  if (!numbers || numbers.length < 3) {
    console.error("날짜 형식이 올바르지 않습니다:", dateStr);
    return dateStr; // 실패 시 원래 문자열 반환
  }

  // 2. 언더바(_)로 연결합니다.
  // 숫자 앞의 0을 제거하고 싶다면 (02 -> 2) parseInt를 거칩니다.
  const year = numbers[0];
  const month = parseInt(numbers[1], 10);
  const day = parseInt(numbers[2], 10);

  return `${year}_${month}_${day}`;
}

 useEffect(() => {
    async function fetchLesson() {
      try {
        const res = await fetch("/api/grammar");
        const data: GrammarLesson = await res.json();
        setLesson(data);

         const MP3_SERVICE_URL = process.env.NEXT_PUBLIC_MP3_SERVICE_URL || "http://localhost:3000";
          const ttsResponse = await fetch(`${MP3_SERVICE_URL}/api/tts/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ grammarData: data, mp3DataKey: formatDateString(data.date)}),
        });

        
      } catch (err) {
        console.error("Failed to fetch lesson:", err);
      }
    }
    fetchLesson();
  }, []);

  if (!lesson) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <Header />
      <GrammarContentClient lesson={lesson} />
      <Footer />
    </div>
  );
}