import { audioService } from "@/service/audioService";
import { detectAudioEnv } from "./audioEnv";

export const playLearningAudio = async ({
  text,
  mp3Url,
}: {
  text: string;
  mp3Url: string;
}) => {
  const { isMobile, canUseWebTTS } = detectAudioEnv();

  //모바일은 mp3 연결
  if(isMobile || !canUseWebTTS) {
    const audio = new Audio(mp3Url);
    audio.preload = 'auto';
    await audio.play();
    return;
  }

  try {
    await audioService.play(text);
  } catch(e) {
    const audio = new Audio(mp3Url);
    await audio.play();
  }
};