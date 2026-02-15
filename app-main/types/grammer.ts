export interface GrammarLesson {
  date: string;
  day: number;
  sentence: string;
  phonetic: string;
  sentenceTranslation: string;
  grammarTitle: string;
  grammarExplanation: string;
  structure: string;
  examples: ExampleSentence[];

  tts: LessonTtsInfo;
}

export interface ExampleSentence {
  id: number;
  text: string;
  phonetic: string;
  translation: string;
}

export interface LessonTtsInfo {
  mainObjectPath: string;
  exampleObjectPaths: Record<number, string>;
}

