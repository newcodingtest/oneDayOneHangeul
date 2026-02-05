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
  
  // 1. 보이스 목록이 로드될 때까지 확실히 기다림
  const getKoreanVoices = (): Promise<SpeechSynthesisVoice[]> => {
    return new Promise((resolve) => {
      let voices = synthesis.getVoices();
      if (voices.length > 0) {
        resolve(voices.filter(v => v.lang.includes('ko')));
      } else {
        synthesis.onvoiceschanged = () => {
          resolve(synthesis.getVoices().filter(v => v.lang.includes('ko')));
        };
      }
    });
  };

  const koVoices = await getKoreanVoices();
  const utterance = new SpeechSynthesisUtterance(text);
  
  // 2. [핵심] 굴리는 발음 방지: 보이스 우선순위 강제 지정
  // 이름에 'Siri', 'Google', 'Samsung'이 들어간 한국어 보이스가 진짜 한국인 발음입니다.
  const selectedVoice = 
    koVoices.find(v => v.name.includes('Siri')) ||               // iOS 1순위 (가장 자연스러움)
    koVoices.find(v => v.name.includes('Google')) ||             // Android 1순위 (정석 발음)
    koVoices.find(v => v.name.includes('Enhanced')) ||           // 고음질 보이스
    koVoices.find(v => v.name.includes('Yuna')) ||               // 기본 한국어 보이스
    koVoices[0];                                                 // 그 외 한국어 보이스

  if (selectedVoice) {
    utterance.voice = selectedVoice;
    utterance.lang = 'ko-KR'; // 언어 설정도 반드시 ko-KR로 명시
  } else {
    // 한국어 보이스를 아예 못 찾았을 때만 기본값 설정 (이때 굴리는 발음이 날 수 있음)
    utterance.lang = 'ko-KR';
  }

  // 3. 발음 속도 최적화 (외국인이 듣기 좋게 약간 천천히)
  utterance.rate = options?.rate || 0.9; 
  utterance.pitch = 1.0;

  return new Promise((resolve) => {
    utterance.onend = () => resolve();
    synthesis.cancel(); // 큐 초기화
    setTimeout(() => synthesis.speak(utterance), 50);
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