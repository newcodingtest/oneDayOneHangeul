import { Constants, EdgeTTS } from "@andresaya/edge-tts";
import fs from "fs/promises";
import path from "path";
import { uploadMp3ToSupabase } from "../storage";
import { generateMp3Buffer } from "./TtsPathService";


type Lesson = {
  sentence: string;
  examples: {
    id: number;
    text: string;
  }[];
};

export async function generateTTSForLesson(
  lesson: { sentence: string; examples: { id: number; text: string }[] },
  dateKey: string
) {
  const baseDir = path.join(process.cwd(), "tts-cache", dateKey);

  // 메인 문장 MP3
  await generateMp3(
    lesson.sentence,
    path.join(baseDir, "main.mp3")
  );

  // 예문 MP3
  for (const ex of lesson.examples) {
    await generateMp3(
      ex.text,
      path.join(baseDir, `example-${ex.id}.mp3`)
    );
  }
}

async function generateMp3(text: string, filePath: string) {
  const tts = new EdgeTTS();

  // mp3 생성
  await tts.synthesize(text, "ko-KR-SunHiNeural", {
    outputFormat: Constants.OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3,
  });

  // 파일 저장
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await tts.toFile(filePath);
}

/***
 * mp3를 supabse(s3) 업로드
 */
export async function generateTTSForLessonV1(
  lesson: { sentence: string; examples: { id: number; text: string }[] },
  dateKey: string
) {
  // ✅ main
  const mainObjectPath = `tts-cache/${dateKey}/main.mp3`;
  const mainBuffer = await generateMp3Buffer(lesson.sentence);
  await uploadMp3ToSupabase({ objectPath: mainObjectPath, buffer: mainBuffer });

  // ✅ examples
  const examples: { id: number; objectPath: string }[] = [];
  for (const ex of lesson.examples ?? []) {
    const objectPath = `tts-cache/${dateKey}/example-${ex.id}.mp3`;
    const buffer = await generateMp3Buffer(ex.text);
    await uploadMp3ToSupabase({ objectPath, buffer });
    examples.push({ id: ex.id, objectPath });
  }

  return { mainObjectPath, examples };
}