// app/(home)/page.tsx
import Footer from '@/components/Footer';
import GrammarContentClient from '@/components/GrammarContentClient';
import Header from '@/components/Header';
import { GrammarLesson } from '@/types/grammer';

// 날짜 포맷 함수 (서버에서도 동일하게 사용 가능)
function formatDateString(dateStr: string): string {
  const numbers = dateStr.match(/\d+/g);
  if (!numbers || numbers.length < 3) return dateStr;
  return `${numbers[0]}_${parseInt(numbers[1])}_${parseInt(numbers[2])}`;
}

export default async function DailyGrammarPage() {
  // 1. 서버에서 직접 데이터를 가져옵니다. 
  // next: { revalidate: 86400 } 설정 시 하루(24시간) 동안 캐싱됩니다.
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/grammar`, {
    next: { 
      tags: ['daily-grammar'], // 이 태그가 있어야 위 API로 제어가 가능합니다.
      revalidate: 86400 // 안전장치로 하루 뒤 만료도 설정
    }
  });
  
  if (!res.ok) return <div>데이터를 불러오지 못했습니다.</div>;
  const lesson: GrammarLesson = await res.json();

  // 2. TTS 생성 로직 (필요 시 서버에서 미리 트리거하거나 클라이언트에게 위임)
  // 여기서는 데이터만 넘겨주고 인터랙션은 클라이언트 컴포넌트에서 처리합니다.
  fetch(`${process.env.BASE_URL}/api/tts/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ grammarData: lesson, mp3DataKey: formatDateString(lesson.date)}),
  }).catch(err => console.error("TTS 사전 생성 실패"));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <Header />
      {/* lesson 데이터를 props로 전달하여 SEO에 텍스트가 포함되게 합니다. */}
      <GrammarContentClient lesson={lesson} />
      <Footer />
    </div>
  );
}