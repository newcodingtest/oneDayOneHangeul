import { getGrammarLesson } from "@/lib/getGrammarLesson";
import { NextResponse } from "next/server";


export async function GET() {
  console.log("API 들어왔음");

  try {
    const kst = new Date(Date.now() + 9 * 60 * 60 * 1000);
    const year = kst.getUTCFullYear();
    const month = kst.getUTCMonth() + 1;
    const day = kst.getUTCDate();

    const lesson = await getGrammarLesson(year, month, day);

    console.log("API 응답 성공:", lesson);
    return NextResponse.json(lesson);
  } catch (err) {
    console.error("API 호출 실패:", err);
    return NextResponse.error();
  }
}