// hooks/useAudioPlayer.ts

import { audioService } from '@/lib/audioService';
import { useState } from 'react';

export function useAudioPlayer() {
  const [playingId, setPlayingId] = useState<number | null>(null);

  const play = async (text: string, id: number) => {
    try {
      setPlayingId(id);
      await audioService.play(text);
    } catch (error) {
      console.error('Audio playback failed:', error);
    } finally {
      setPlayingId(null);
    }
  };

  const stop = () => {
    audioService.stop();
    setPlayingId(null);
  };

  return { playingId, play, stop };
}