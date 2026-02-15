// app/daily-grammar/GrammarContentClient.tsx
"use client"; // 이 선언이 있어야 useState 사용 가능!

import DayCounter from '@/components/DayCounter';
import ExampleSentences from '@/components/ExampleSentences';
import GrammarExplanation from '@/components/GrammarExplanation';
import SentenceCard from '@/components/SentenceCard';
import { audioService } from '@/service/audioService';
import { audioServiceV1 } from '@/service/audioServiceV1';
import { GrammarLesson } from '@/types/grammer';
import { useState } from 'react';

export default function GrammarContentClient({ lesson }: { lesson: GrammarLesson }) {
  const [isPlaying, setIsPlaying] = useState<number | null>(null);

  const playAudioV1 = async (text: string, id: number) => {
    try {
      setIsPlaying(id);
      await audioService.play(text, { lang: 'ko', rate: 0.9 });
      //await audioService.playEdgeTTS(text);
      setIsPlaying(null);
    } catch (error) {
      console.error("재생 중 오류 발생:", error);
      setIsPlaying(null);
    }
  };

  const playAudioV2 = async (date: string, type: string, id: number) => {
    try {
      setIsPlaying(id);
      //await audioService.play(text, { lang: 'ko', rate: 0.9 });
      await audioService.playEdgeTTSV2(date, type, id);
      setIsPlaying(null);
    } catch (error) {
      console.error("재생 중 오류 발생:", error);
      setIsPlaying(null);
    }
  };

    const playAudioV3 = async (objectPath: string, id: number) => {
    try {
      setIsPlaying(id);
      await audioServiceV1.playFromObjectPath(objectPath);
      setIsPlaying(null);
    } catch (error) {
      console.error("재생 중 오류 발생:", error);
      setIsPlaying(null);
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
      <DayCounter date={lesson.date} day={lesson.day} />
      
      <SentenceCard
        sentence={lesson.sentence}
        translation={lesson.sentenceTranslation}
        phonetic={lesson.phonetic}
        isPlaying={isPlaying === 0}
        onPlay={() => playAudioV3(lesson.tts.mainObjectPath, 0)}
      />

      <GrammarExplanation
        title={lesson.grammarTitle}
        explanation={lesson.grammarExplanation}
        structure={lesson.structure}
      />

      <ExampleSentences
        examples={lesson.examples}
        playingId={isPlaying}
        onPlay={(text, id) => playAudioV3(lesson.tts.exampleObjectPaths[id], id)}
      />
    </main>
  );
}