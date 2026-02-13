"use client"
//app/(home)/page.tsx
import Footer from '@/components/Footer';
import GrammarContentClient from '@/components/GrammarContentClient'; // 새로 만들 파일
import Header from '@/components/Header';
import { GrammarLesson } from '@/types/grammer';
import { useEffect, useState } from 'react';

export default function DailyGrammarPage() {
const [lesson, setLesson] = useState<GrammarLesson | null>(null);

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
          body: JSON.stringify({ grammarData: data, mp3DataKey: "2026_2_13"}),
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