// app/api/grammar/route.ts
import { KOREAN_LEARNING_PROMPT } from "@/lib/prompts";
import { getSampleLesson } from "@/mocks/grammar";
import { supabaseService } from "@/service/databaseService";
import { GrammarLesson } from "@/types/grammer";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
// ✅ 서버 캐시 유효 시간 설정 (단위: 초)
// 86400초 = 24시간
export const revalidate = 86400;
export const dynamic = 'force-static'; // 이 파일은 무조건 정적 결과물로 취급해!

export const askGemini = async (prompt: string) => {
  console.log("gemini model: ", process.env.GEMINI_MODEL as string);
  try {
    // 2. 모델 선택 (gemini-1.5-flash가 빠르고 무료 할당량이 많습니다)
    const model = genAI.getGenerativeModel({ 
      model: process.env.GEMINI_MODEL as string,
      generationConfig: {
        responseMimeType: "application/json",
        maxOutputTokens: 2000, // 기존보다 크게 설정 (예: 2000)
      }
    });
 
    const result = await model.generateContent(prompt);
    
    // 3. 콘텐츠 생성
    
  const response = await result.response;
  console.log("1. 텍스트 내용:", response.text());
  console.log("2. 종료 사유 (예: STOP, MAX_TOKENS):", response.candidates?.[0].finishReason);
  console.log("3. 토큰 사용량:", response.usageMetadata);
    return response.text();
  } catch (error) {
    console.error("Gemini API 호출 중 오류 발생:", error);
  }
};

 

export async function GET(request: NextRequest) {
  const now = new Date();
  const years: number = now.getFullYear();
  console.log("years: ", years);
  const month: number = now.getMonth() + 1; // 0~11로 반환되므로 +1 필수
  const day: number = now.getDate();        // 1~31일 반환

   // 샘플 데이터
  let sampleLesson: GrammarLesson = getSampleLesson(years, month, day)
  const { searchParams } = new URL(request.url);

  try {
    const prompt = KOREAN_LEARNING_PROMPT(years, month, day);

    let response : string = "";
    const isProd =  process.env.DEPLOY_LEVEL === 'prod'
    if(isProd){
      console.log("Prod 모드: 실제 api 요청한다");
      const aiResponse = await askGemini(prompt);
      response = aiResponse!;

    } else {
      console.log("Dev 모드: 샘플 api 요청한다");
      response = JSON.stringify(sampleLesson);
    }
    supabaseService.save(response);
    console.log("response: ", response);
    const data = response;
    
    // JSON 파싱 (```json 제거)
    const cleanContent = data.replace(/```json\n?|\n?```/g, '').trim();
    const grammarData = JSON.parse(cleanContent);
    sampleLesson = grammarData;

    return NextResponse.json(grammarData);

  } catch (error) {
    console.error('Grammar generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate grammar content' },
      { status: 500 }
    );
  }
}