// lib/grammar/getGrammarLesson.ts
import { KOREAN_LEARNING_PROMPT } from "@/lib/prompts";
import { getSampleLesson } from "@/mocks/grammar";
import { supabaseService } from "@/repository/databaseService";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { unstable_cache } from "next/cache";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

function secondsUntilNextMidnightKST() {
  const now = new Date();
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60_000;
  const kstNow = new Date(utcMs + 9 * 60 * 60_000);

  const kstNextMidnight = new Date(kstNow);
  kstNextMidnight.setHours(24, 0, 0, 0);

  const diffMs = kstNextMidnight.getTime() - kstNow.getTime();
  return Math.max(1, Math.floor(diffMs / 1000));
}

async function askGemini(prompt: string) {
  console.log("잼미니 물어봐~")
  const model = genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL as string,
    generationConfig: {
      responseMimeType: "application/json",
      maxOutputTokens: 2000,
    },
  });

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}

function cleanJson(text: string) {
  return text.replace(/```json\n?|\n?```/g, "").trim();
}

async function generateAndPersist(year: number, month: number, day: number) {
  const isProd = process.env.DEPLOY_LEVEL === "prod";
  const prompt = KOREAN_LEARNING_PROMPT(year, month, day);

  const raw =
    isProd
      ? await askGemini(prompt)
      : JSON.stringify(getSampleLesson(year, month, day));

  console.log("잼미니 데이터: ", raw);
  const cleanContent = cleanJson(raw);
  const grammarData = JSON.parse(cleanContent);

  const mp3DataKey = `${year}_${month}_${day}`;
  // mp3 파일 생성
  const MP3_SERVICE_URL = process.env.NEXT_PUBLIC_MP3_SERVICE_URL || "http://localhost:3000";
  //generateTTSForLesson(grammarData, mp3DataKey);
  console.log("파일 생성 위치: ", MP3_SERVICE_URL);
  try{
       await fetch(`${MP3_SERVICE_URL}/api/tts/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ grammarData, mp3DataKey }),
    })
    .then(async (response) => {
        // 1. 응답 상태 코드 및 기본 정보 로깅
        console.log(`[TTS 요청 결과] Status: ${response.status} ${response.statusText}`);
        console.log(`[URL]: ${response.url}`);

        if (!response.ok) {
            // 2. 서버에서 보내준 에러 메시지 본문 읽기 (text 또는 json)
            const errorDetail = await response.text();
            console.error(`[TTS 서버 에러 메시지]: ${errorDetail}`);
            throw new Error(`서버 응답 에러: ${response.status}`);
        }

        return response.json();
    })
    .then(data => {
        console.log("TTS 생성 성공:", data);
    })
    .catch(err => {
        // 네트워크 장애나 위에서 throw한 에러가 여기로 옵니다.
        console.error("TTS 서비스 호출 중 최종 실패:", err.message);
    });
  } catch (err) {
    // 네트워크 타임아웃이나 연결 실패 시 로그
  }

  // ✅ 캐시 미스(처음 생성)일 때만 저장되도록 이 함수 안에서 저장
  await supabaseService.save(cleanContent);

  return grammarData;
}

export async function getGrammarLesson(year: number, month: number, day: number) {
  const revalidate = secondsUntilNextMidnightKST();
  const key = [`grammar-${year}-${month}-${day}`];

  const cached = unstable_cache(
    () => generateAndPersist(year, month, day),
    key,
    { revalidate, tags: ["grammar", `grammar-${year}-${month}-${day}`] }
  );

  return cached();
}

