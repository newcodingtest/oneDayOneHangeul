"use client"
//app/(home)/page
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