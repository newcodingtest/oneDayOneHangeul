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

  if (!synthesis) return;

  // 1. [모바일 필수] 이전 음성을 확실히 종료하고 엔진을 깨움
  synthesis.cancel();
  synthesis.resume(); 

  const getKoreanVoices = (): Promise<SpeechSynthesisVoice[]> => {
    return new Promise((resolve) => {
      let voices = synthesis.getVoices();
      if (voices.length > 0) {
        resolve(voices.filter(v => v.lang.includes('ko')));
      } else {
        // 모바일 브라우저는 보이스 로딩이 늦는 경우가 많음
        synthesis.onvoiceschanged = () => {
          resolve(synthesis.getVoices().filter(v => v.lang.includes('ko')));
        };
      }
    });
  };

  const koVoices = await getKoreanVoices();
  const utterance = new SpeechSynthesisUtterance(text);

  // 2. [기기별 최적 보이스 강제 지정]
  const ua = navigator.userAgent.toLowerCase();
  const isIOS = /iphone|ipad|ipod/.test(ua);
  const isAndroid = /android/.test(ua);

  let selectedVoice = null;

  if (isIOS) {
    // iOS: 'Siri' 보이스가 압도적으로 자연스럽습니다. (Siri > Enhanced > Yuna)
    selectedVoice = 
      koVoices.find(v => v.name.includes('Siri')) || 
      koVoices.find(v => v.name.includes('Enhanced')) ||
      koVoices.find(v => v.name.includes('Yuna')) ||
      koVoices[0];
    
    // iOS는 1.0 속도에서 발음이 가장 정확합니다.
    utterance.rate = options?.rate || 1.0; 
  } else if (isAndroid) {
    // 안드로이드: Google 엔진이 가장 정확합니다. 
    // 삼성 엔진은 가끔 영어식으로 읽는 버그가 있어 Google을 우선합니다.
    selectedVoice = 
      koVoices.find(v => v.name.toLowerCase().includes('google')) || 
      koVoices.find(v => v.name.toLowerCase().includes('samsung')) ||
      koVoices[0];

    // 안드로이드는 약간 천천히 읽어야 한국어 성조가 선명합니다.
    utterance.rate = options?.rate || 0.85; 
  }

  if (selectedVoice) {
    utterance.voice = selectedVoice;
    utterance.lang = selectedVoice.lang; // 보이스와 언어 설정을 일치시킴
  } else {
    utterance.lang = 'ko-KR';
  }

  utterance.pitch = 1.0;
  utterance.volume = 1.0;

  return new Promise((resolve, reject) => {
    utterance.onend = () => resolve();
    utterance.onerror = (e) => reject(e);

    // 3. [모바일 핵심] 큐 엉킴 방지를 위해 짧은 지연 후 실행
    setTimeout(() => {
      synthesis.speak(utterance);
    }, isIOS ? 100 : 50);
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