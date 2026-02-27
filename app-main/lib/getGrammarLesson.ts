// lib/grammar/getGrammarLesson.ts
import { KOREAN_LEARNING_PROMPT } from "@/lib/prompts";
import { getSampleLesson } from "@/mocks/grammar";
import { grammarRepository } from "@/repository/grammarRepository";
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
    try {
        const ttsResponse = await fetch(`${MP3_SERVICE_URL}/api/tts/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ grammarData: grammarData, mp3DataKey: mp3DataKey }),
        });
        
        // ⭐ 중요: 응답 바디를 끝까지 읽어야 '통신 완료'로 간주됩니다.
        const ttsResult = await ttsResponse.json(); 
        console.log("TTS 완료:", ttsResult);
      } catch (e) {
            if (e instanceof Error) {
          // 이제 e는 Error 타입으로 추론되어 .message 사용이 가능합니다.
          console.error("TTS 서비스 호출 중 최종 실패:", e.message);
        } else {
          // 에러가 객체가 아닌 문자열이나 다른 타입으로 던져졌을 경우
          console.error("알 수 없는 에러 발생:", String(e));
        }
      }

  // ✅ 캐시 미스(처음 생성)일 때만 저장되도록 이 함수 안에서 저장
  await grammarRepository.save(cleanContent);

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

