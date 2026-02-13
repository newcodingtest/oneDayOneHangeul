// hooks/useGrammarLesson.ts

import { GrammarLesson } from '@/types/grammer';
import { useEffect, useState } from 'react';

export function useGrammarLesson(day: number) {
  const [lesson, setLesson] = useState<GrammarLesson | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLesson = async (dayNumber: number) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/grammar?day=${dayNumber}`);

      if (!response.ok) {
        throw new Error('Failed to fetch grammar lesson');
      }

      const data: GrammarLesson = await response.json();
      setLesson(data);
    } catch (err) {
      setError('문법 데이터를 불러오는데 실패했습니다. 다시 시도해주세요.');
      console.error('Error fetching grammar:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLesson(day);
  }, [day]);

  const retry = () => fetchLesson(day);

  return { lesson, loading, error, retry };
}