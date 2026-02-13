// components/ExampleSentences.tsx

import { Volume2 } from './icons';

interface ExampleSentence {
  id: number;
  text: string;
  phonetic: string;
  translation: string;
}

interface ExampleSentencesProps {
  examples: ExampleSentence[];
  playingId: number | null;
  onPlay: (type: string,  id: number) => void;
}

export default function ExampleSentences({examples, playingId, onPlay }: ExampleSentencesProps) {
  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-md p-4 sm:p-5 lg:p-6 border border-gray-200">
      <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-3 sm:mb-4 flex items-center gap-2">
        <div className="w-1.5 sm:w-2 h-5 sm:h-6 bg-green-500 rounded flex-shrink-0"></div>
        <span>Example Sentences</span>
      </h3>

      <div className="space-y-3 sm:space-y-4">
        {examples.map((example) => (
          <div
            key={example.id}
            className="bg-gray-50 p-3 sm:p-4 lg:p-5 rounded-lg sm:rounded-xl border border-gray-200 hover:border-green-300 hover:bg-green-50 active:bg-green-100 transition-all"
          >
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2 mb-2">
                  <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded flex-shrink-0 mt-0.5">
                    {example.id}
                  </span>
                  <p className="text-base sm:text-lg text-gray-800 font-medium leading-relaxed break-words">
                    {example.text}  ({example.phonetic})
                  </p>
                </div>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed break-words ml-0 sm:ml-8">
                  {example.translation}
                </p>
              </div>

              <button
                onClick={() => onPlay(example.text, example.id)}
                className="self-end sm:self-start flex-shrink-0 p-2.5 sm:p-3 hover:bg-green-100 active:bg-green-200 rounded-lg transition-colors border border-gray-300"
                aria-label={`Example Sentence ${example.id} Listening to pronunciation`}
              >
                <Volume2
                  className={`w-5 h-5 text-green-600 ${playingId === example.id ? 'animate-pulse' : ''}`}
                />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}