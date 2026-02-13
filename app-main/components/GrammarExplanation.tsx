// components/GrammarExplanation.tsx

interface GrammarExplanationProps {
  title: string;
  explanation: string;
  structure: string;
}

export default function GrammarExplanation({
  title,
  explanation,
  structure,
}: GrammarExplanationProps) {
  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-md p-4 sm:p-5 lg:p-6 mb-4 sm:mb-5 lg:mb-6 border border-gray-200">
      <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-3 sm:mb-4 flex items-center gap-2">
        <div className="w-1.5 sm:w-2 h-5 sm:h-6 bg-yellow-500 rounded flex-shrink-0"></div>
        <span>Grammar Explanation</span>
      </h3>

      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 sm:p-5 rounded-r-lg mb-4">
        <h4 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 break-words">{title}</h4>
        <p className="text-sm sm:text-base text-gray-700 leading-relaxed break-words">
          {explanation}
        </p>
      </div>

      <div className="bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-200">
        <p className="text-xs sm:text-sm text-gray-600 mb-1">Structure</p>
        <p className="text-sm sm:text-base lg:text-lg font-mono font-semibold text-blue-600 break-words">
          {structure}
        </p>
      </div>
    </div>
  );
}