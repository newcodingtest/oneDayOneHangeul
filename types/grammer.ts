export interface GrammarLesson {
  date: string;
  day: number;
  sentence: string;
  sentenceTranslation: string;
  grammarTitle: string;
  grammarExplanation: string;
  structure: string;
  examples: ExampleSentence[];
}

export interface ExampleSentence {
  id: number;
  text: string;
  translation: string;
}