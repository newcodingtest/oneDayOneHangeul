// app/daily-grammar/page.tsx
import Footer from '@/components/Footer';
import GrammarContentClient from '@/components/GrammarContentClient'; // 새로 만들 파일
import Header from '@/components/Header';
import { getGrammarLesson } from '@/lib/getGrammarLesson';

export const revalidate = 86400;


export default async function DailyGrammarPage() {
// 2. 한국 시간(KST) 계산 (현재 시간 2026-02-09 기준)
  const now = new Date();
  const kstDate = new Date(now.getTime() + (9 * 60 * 60 * 1000));
  
  const year = kstDate.getUTCFullYear();
  const month = kstDate.getUTCMonth() + 1;
  const day = kstDate.getUTCDate();
  
  console.log("day: ", day);
  const lesson = await getGrammarLesson(year, month, day);

  if (!lesson) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <Header />
      <GrammarContentClient lesson={lesson} />
      <Footer />
    </div>
  );
}