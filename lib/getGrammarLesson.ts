// lib/grammar/getGrammarLesson.ts
import { unstable_cache } from "next/cache";
import { KOREAN_LEARNING_PROMPT } from "@/lib/prompts";
import { getSampleLesson } from "@/mocks/grammar";
import { supabaseService } from "@/service/databaseService";
import { GoogleGenerativeAI } from "@google/generative-ai";

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

  const cleanContent = cleanJson(raw);
  const grammarData = JSON.parse(cleanContent);

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
