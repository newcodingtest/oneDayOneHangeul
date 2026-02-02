// components/DayCounter.tsx

import { Calendar } from './icons';

interface DayCounterProps {
  date: string;
  day: number;
}

export default function DayCounter({ date, day }: DayCounterProps) {
  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-md p-4 sm:p-5 lg:p-6 mb-4 sm:mb-5 lg:mb-6 border border-gray-200">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
        <div className="w-full sm:w-auto">
          <div className="flex items-center gap-2 text-gray-600 mb-1">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            <span className="text-xs sm:text-sm">{date}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-600">Day {day}</h2>
        </div>
      </div>
    </div>
  );
}