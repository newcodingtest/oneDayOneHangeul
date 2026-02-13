import { NextRequest } from "next/server";

export async function POST(request: NextRequest){
  const { grammarData, mp3DataKey } = await request.json();
  
    const MP3_SERVICE_URL = process.env.NEXT_PUBLIC_MP3_SERVICE_URL || "http://localhost:3000";
          const ttsResponse = await fetch(`${MP3_SERVICE_URL}/api/tts/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ grammarData: grammarData, mp3DataKey: "2026_2_13"}),
        });
}
