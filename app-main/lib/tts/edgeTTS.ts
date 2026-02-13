// lib/tts/edgeTTS.ts
import { Constants, EdgeTTS } from '@andresaya/edge-tts';

export async function edgeTTS(
  text: string,
  options?: { voice?: string; rate?: string; pitch?: string }
): Promise<Buffer> {
  const tts = new EdgeTTS();
  const voice = options?.voice || "ko-KR-SunHiNeural";

  // 1. 음성 합성 실행 (이게 완료되어야 내부 버퍼에 데이터가 쌓입니다)
  await tts.synthesize(text, voice, {
    outputFormat: Constants.OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3,
  });

  // 2. 핵심: 이 라이브러리는 내부 stream을 통해 데이터를 가져와야 합니다.
  // 만약 tts.toBuffer() 같은 메서드가 없다면 아래와 같이 처리합니다.
  const buffer = tts.toBuffer(); // 라이브러리에 따라 rawData나 audioData 속성에 담깁니다.

  if (!buffer) {
    throw new Error("오디오 데이터 생성 실패");
  }

  return buffer;
}