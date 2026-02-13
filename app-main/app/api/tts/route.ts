// app/api/tts/route.ts

import fs from "fs/promises";
import { NextResponse } from "next/server";
import path from "path";


export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  // 클라이언트로부터 필요한 정보 수신
  const date = formatDateString(searchParams.get("date") as string); // 예: 2026_2_12
  const type = searchParams.get("type"); // main 또는 example
  const id = searchParams.get("id");     // example일 때의 넘버링

  if (!date || !type) {
    return NextResponse.json({ error: "date와 type은 필수입니다." }, { status: 400 });
  }

  // 1. 파일명 규칙 생성 (부사수님이 말씀하신 .mp3.mp3 패턴 반영)
  let fileName = "";
  if (type === "main") {
    fileName = "main.mp3.mp3";
  } else if (type === "example") {
    fileName = `example-${id}.mp3.mp3`;
  }

  console.log("fileName: ", fileName);
  // 2. 물리적 경로 생성
  const filePath = path.join(process.cwd(), "tts-cache", date, fileName);

  try {
    // 3. 파일 존재 확인 및 읽기
    const buffer = await fs.readFile(filePath);
    console.log(`✅ 캐시 파일 로드 성공: ${filePath}`);

    return new Response(new Uint8Array(buffer), {
      headers: { 
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=31536000, immutable" 
      },
    });
  } catch (error) {
    console.error("❌ 파일 읽기 실패:", filePath);
    return NextResponse.json({ error: "파일을 찾을 수 없습니다." }, { status: 404 });
  }
}

export function formatDateString(dateStr: string): string {
  // 1. 숫자만 추출합니다 (결과 예: ["2026", "2", "12"])
  const numbers = dateStr.match(/\d+/g);

  if (!numbers || numbers.length < 3) {
    console.error("날짜 형식이 올바르지 않습니다:", dateStr);
    return dateStr; // 실패 시 원래 문자열 반환
  }

  // 2. 언더바(_)로 연결합니다.
  // 숫자 앞의 0을 제거하고 싶다면 (02 -> 2) parseInt를 거칩니다.
  const year = numbers[0];
  const month = parseInt(numbers[1], 10);
  const day = parseInt(numbers[2], 10);

  return `${year}_${month}_${day}`;
}

// export async function GET(request: Request) {
//   console.log("edge tts 요청");
//   const { searchParams } = new URL(request.url);
//   const text = searchParams.get("text");
//   const voice = searchParams.get("voice") || "ko-KR-SunHiNeural"; // 서버에서도 기본값 한국어!

//   if (!text) return NextResponse.json({ error: "Text is required" }, { status: 400 });

//   try {
//     const buffer = await edgeTTS(text, { voice });
    
//     // [수정 핵심] Buffer를 Uint8Array로 캐스팅하여 Response에 전달
//     return new Response(new Uint8Array(buffer), {
//       headers: { 
//         "Content-Type": "audio/mpeg",
//         // 캐시 설정을 추가하면 Vercel 비용과 맥미니 부하를 줄일 수 있습니다.
//         "Cache-Control": "public, max-age=31536000, immutable" 
//       },
//     });
//   } catch (error) {
//     console.error("TTS Route Error:", error);
//     return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
//   }
// }