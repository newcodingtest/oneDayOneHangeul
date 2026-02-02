// components/Header.tsx

import { BookOpen, Menu } from './icons';

export default function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <BookOpen className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-blue-600 flex-shrink-0" />
          <h1 className="text-base sm:text-xl lg:text-2xl font-bold text-gray-800 truncate">
            Daily Korean Grammar
          </h1>
        </div>
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0">
          <Menu className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
        </button>
      </div>
    </header>
  );
}