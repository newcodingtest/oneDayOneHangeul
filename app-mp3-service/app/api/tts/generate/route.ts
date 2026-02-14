import { generateTTSForLesson } from "@/lib/tts/generateTTSForLesson";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest){
  const { grammarData, mp3DataKey } = await request.json();
  
  console.log(`make mp3DataKey: ${mp3DataKey}`);
  try{
    await generateTTSForLesson(grammarData, mp3DataKey);
    return NextResponse.json({
      success: true,
      message: "MP3 생성 완료"
    });
  }catch(error: unknown){
    console.log("TTS 생성 에러: ", error);
    return NextResponse.json({
      success: false,
      status: 500,
    });
  }
}