// lib/audioService.ts

/**
 * 무료 Web Speech API를 사용한 음성 재생 서비스
 */

interface AudioServiceOptions {
  lang?: string;
  rate?: number;
  pitch?: number;
}

class AudioService {
  private currentAudio: HTMLAudioElement | null = null;
  private defaultOptions: AudioServiceOptions = {
    lang: 'ko-KR', // Google TTS는 'en-US' 대신 'en'을 기본으로 사용 가능
  };

async play(text: string, options?: AudioServiceOptions): Promise<void> {
  const synthesis = window.speechSynthesis;

  if (typeof window === 'undefined' || !synthesis) {
    throw new Error('지원하지 않는 브라우저입니다.');
  }

  // 1. 인앱뷰에서 꼬인 큐를 풀기 위한 초기화
  synthesis.cancel();

  const getVoicesSafe = (): Promise<SpeechSynthesisVoice[]> => {
    return new Promise((resolve) => {
      const voices = synthesis.getVoices();
      if (voices.length > 0) resolve(voices);
      synthesis.onvoiceschanged = () => resolve(synthesis.getVoices());
      // 인앱뷰 대응: 0.1초 뒤에도 안 잡히면 일단 현재 목록 반환
      setTimeout(() => resolve(synthesis.getVoices()), 100);
    });
  };

  const voices = await getVoicesSafe();
  const utterance = new SpeechSynthesisUtterance(text);
  
  const ua = navigator.userAgent.toLowerCase();
  const isIOS = /iphone|ipad|ipod/.test(ua);
  const isKakao = /kakaotalk/.test(ua); // 카카오톡 인앱뷰 여부 확인

  let selectedVoice = null;

  if (isIOS) {
    // 2. [인앱뷰 핵심] 우선순위를 훨씬 정교하게 세팅합니다.
    // 'Siri'가 가장 자연스럽고, 그 다음이 'Enhanced', 마지막이 일반 'Yuna'입니다.
    selectedVoice = 
      voices.find(v => v.lang.includes('ko') && v.name.includes('Siri')) ||
      voices.find(v => v.lang.includes('ko') && v.name.includes('Enhanced')) ||
      voices.find(v => v.name.includes('Yuna')) ||
      voices.find(v => v.lang === 'ko-KR');

    // 3. [자연스러움 튜닝] 
    // 인앱뷰는 소리가 뭉개질 수 있으므로 rate(속도)를 아주 미세하게 조정합니다.
    // 1.0보다 0.95 정도가 한국어의 성조를 가장 잘 표현합니다.
    utterance.rate = options?.rate || (isKakao ? 0.95 : 1.0);
    utterance.pitch = 1.0; 
  } else {
    // 안드로이드 및 기타 기기 로직 (생략 가능하나 유지)
    selectedVoice = voices.find(v => v.lang.includes('ko')) || voices[0];
    utterance.rate = options?.rate || 1.0;
  }

  if (selectedVoice) {
    utterance.voice = selectedVoice;
    utterance.lang = selectedVoice.lang;
  } else {
    utterance.lang = 'ko-KR';
  }

  return new Promise((resolve, reject) => {
    utterance.onend = () => resolve();
    utterance.onerror = (e) => reject(e);

    // 4. [중요] 인앱뷰는 하드웨어 가속이 느려 딜레이를 더 줘야 소리가 안 씹힙니다.
    const delay = isKakao ? 250 : 150;
    setTimeout(() => {
      synthesis.speak(utterance);
    }, delay);
  });
}

  /**
   * 재생 중지
   */
  stop(): void {
 if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
    // 기존 Web Speech API도 혹시 모르니 중지
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }



  /**
   * 브라우저 지원 여부 확인 (HTML5 Audio 지원 확인)
   */
  isSupported(): boolean {
    return typeof Audio !== 'undefined';
  }

  /**
   * 사용 가능한 음성 목록 가져오기
   */
  async getAvailableVoices(): Promise<SpeechSynthesisVoice[]> {
    return [];
  }

  /**
   * 현재 기기가 모바일인지 확인
   */
 private checkIsMobile(): boolean {
    if (typeof window === 'undefined') return false;
    return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  }

}

// 싱글톤 인스턴스
export const audioService = new AudioService();