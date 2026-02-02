// components/SentenceCard.tsx

import { Volume2 } from './icons';

interface SentenceCardProps {
  sentence: string;
  translation: string;
  isPlaying: boolean;
  onPlay: () => void;
}

export default function SentenceCard({
  sentence,
  translation,
  isPlaying,
  onPlay,
}: SentenceCardProps) {
  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-md p-4 sm:p-5 lg:p-6 mb-4 sm:mb-5 lg:mb-6 border border-gray-200">
      <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-3 sm:mb-4 flex items-center gap-2">
        <div className="w-1.5 sm:w-2 h-5 sm:h-6 bg-blue-500 rounded flex-shrink-0"></div>
        <span>Today Grammar</span>
      </h3>

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 sm:p-5 lg:p-6 rounded-lg sm:rounded-xl mb-4 border border-blue-100">
        <p className="text-lg sm:text-xl lg:text-2xl text-gray-800 leading-relaxed mb-3 sm:mb-4 font-medium break-words">
          {sentence}
        </p>
        <p className="text-sm sm:text-base lg:text-lg text-gray-600 leading-relaxed break-words">
          {translation}
        </p>
      </div>

      <button
        onClick={onPlay}
        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-500 text-white px-5 sm:px-6 py-3 rounded-lg hover:bg-blue-600 active:bg-blue-700 transition-colors shadow-sm"
      >
        <Volume2 className={`w-5 h-5 flex-shrink-0 ${isPlaying ? 'animate-pulse' : ''}`} />
        <span className="font-medium text-sm sm:text-base">Listen to Pronunciation</span>
      </button>
    </div>
  );
}