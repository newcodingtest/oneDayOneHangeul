// lib/grammar/getGrammarLesson.ts
import { KOREAN_LEARNING_PROMPT } from "@/lib/prompts";
import { getSampleLesson } from "@/mocks/grammar";
import { supabaseService } from "@/repository/databaseService";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { unstable_cache } from "next/cache";
import { ensureTTSForLesson } from "./tts/TtsPathService";

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
  const mp3DataKey = `${year}${month}${day}`

  // ✅ 캐시 미스(처음 생성)일 때만 저장되도록 이 함수 안에서 저장
 // await supabaseService.save(cleanContent);
  try {
    const ttsPaths = await ensureTTSForLesson(grammarData, mp3DataKey);   // 원하면 grammarData에 경로를 붙여서 클라이언트에 같이 내려주기
    grammarData.tts = ttsPaths;
  }catch(e){
    console.error("TTS 생성/업로드 실패(문법은 정상 반환):", e);
  }
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

