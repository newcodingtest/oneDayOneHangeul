// app/api/grammar/route.ts
import { getGrammarLesson } from "@/lib/getGrammarLesson";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
// ✅ 서버 캐시 유효 시간 설정 (단위: 초)
// 86400초 = 24시간
//export const revalidate = 86400;
export const revalidate = 60;//1분
//export const dynamic = 'force-static'; // 이 파일은 무조건 정적 결과물로 취급해!


export async function GET(request: NextRequest) {
    const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();

  // (선택) 쿼리로 특정 날짜를 테스트하고 싶으면:
  // const { searchParams } = new URL(request.url);
  // const y = Number(searchParams.get("year")) || year;
  // const m = Number(searchParams.get("month")) || month;
  // const d = Number(searchParams.get("day")) || day;

  const data = await getGrammarLesson(year, month, day);
  return NextResponse.json(data);
}