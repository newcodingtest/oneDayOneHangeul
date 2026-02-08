// app/daily-grammar/page.tsx
import Footer from '@/components/Footer';
import GrammarContentClient from '@/components/GrammarContentClient'; // 새로 만들 파일
import Header from '@/components/Header';

//export const revalidate = 86400;
export const dynamic = 'force-dynamic';

async function getGrammarData(month:number, day: number) {
  // ⚠️ 서버에서 fetch할 때는 전체 URL이 필요합니다. 
  // 로컬 테스트용이라면 http://localhost:3000 을 앞에 붙여주세요.
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/grammar?month=${month}&day=${day}`, {
    next: { revalidate: 86400 }
  });
  
  if (!res.ok) throw new Error('데이터 로드 실패');
  return res.json();
}

export default async function DailyGrammarPage() {
  const date = new Date();
  const month = date.getMonth();
  const day = date.getDate();
  
  console.log("day: ", day);
  const lesson = await getGrammarData(month, day);

  if (!lesson) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <Header />
      <GrammarContentClient lesson={lesson} />
      <Footer />
    </div>
  );
}