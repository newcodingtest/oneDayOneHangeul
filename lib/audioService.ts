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
  // 1. 보이스 목록을 가져오는 시점을 보장하는 헬퍼 함수
  const getVoicesSafe = (): Promise<SpeechSynthesisVoice[]> => {
    return new Promise((resolve) => {
      let voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        resolve(voices);
      } else {
        window.speechSynthesis.onvoiceschanged = () => {
          voices = window.speechSynthesis.getVoices();
          resolve(voices);
        };
      }
    });
  };

  if (typeof window === 'undefined' || !window.speechSynthesis) {
    throw new Error('지원하지 않는 브라우저입니다.');
  }

  // 안드로이드/iOS 공통: 이전 재생 즉시 중단
  window.speechSynthesis.cancel();

  const voices = await getVoicesSafe();
  const utterance = new SpeechSynthesisUtterance(text);
  
  const ua = navigator.userAgent.toLowerCase();
  const isIOS = /iphone|ipad|ipod/.test(ua);
  const isAndroid = /android/.test(ua);

  // 2. [애플 해결] 먹먹함 방지: 고음질(Enhanced) 우선 순위
  let selectedVoice = null;
  if (isIOS) {
    // 'Siri' 보이스나 'Enhanced'가 붙은 보이스가 훨씬 선명합니다.
    selectedVoice = 
      voices.find(v => v.lang === 'ko-KR' && v.name.includes('Siri')) ||
      voices.find(v => v.lang === 'ko-KR' && v.name.includes('Enhanced')) ||
      voices.find(v => v.name.includes('Yuna')) ||
      voices.find(v => v.lang.startsWith('ko'));
    
    utterance.rate = options?.rate || 1.0; 
    utterance.pitch = 1.0;
  } 
  // 3. [안드로이드 해결] 무음 방지: Google 엔진 강제 및 음량 설정
  else if (isAndroid) {
    selectedVoice = 
      voices.find(v => v.name.toLowerCase().includes('google') && v.lang.startsWith('ko')) ||
      voices.find(v => v.lang.startsWith('ko'));
    
    // 안드로이드는 rate가 너무 낮으면 소리가 깨지거나 안 나올 수 있음
    utterance.rate = options?.rate || 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0; // 볼륨 명시
  } else {
    selectedVoice = voices.find(v => v.lang === 'ko-KR') || voices[0];
    utterance.rate = options?.rate || 1.0;
  }

  if (selectedVoice) {
    utterance.voice = selectedVoice;
    utterance.lang = selectedVoice.lang; // 보이스의 언어 설정과 일치시킴
  } else {
    utterance.lang = 'ko-KR';
  }

  return new Promise((resolve, reject) => {
    utterance.onend = () => resolve();
    utterance.onerror = (e) => {
      console.error('TTS 에러 발생:', e);
      reject(e);
    };

    // 4. [모바일 공통] 핵심: 큐가 꼬이지 않도록 아주 짧은 지연 후 실행
    setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, 150); 
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