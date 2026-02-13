import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest){
  const { grammarData, mp3DataKey } = await request.json();
  
    const MP3_SERVICE_URL = process.env.NEXT_PUBLIC_MP3_SERVICE_URL || "http://localhost:3000";
          const ttsResponse = await fetch(`${MP3_SERVICE_URL}/api/tts/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ grammarData: grammarData, mp3DataKey: "2026_2_13"}),
        });
// 3. 백엔드의 응답을 받아옵니다.
    const result = await ttsResponse.json();

    // 4. ⭐ 중요: 브라우저에게 최종 결과를 반환합니다.
    // 이렇게 return을 해줘야 브라우저는 Vercel 서버하고만 대화한 셈이 됩니다.
    return NextResponse.json(result);
}
