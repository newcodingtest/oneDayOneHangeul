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
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      return reject(new Error('지원하지 않는 브라우저입니다.'));
    }
    
    // 현재 진행 중인 음성 즉시 취소
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    
    const ua = navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(ua);
    const isAndroid = /android/.test(ua);

    // 1. 한국어 학습에 최적화된 속도/피치 설정
    // 외국인 학습자용이므로 기본 속도를 약간 낮추는 것이 가독성에 좋습니다.
    if (isIOS) {
      utterance.rate = options?.rate || 0.9; // iOS는 0.9가 적당
      utterance.pitch = 1.0; 
    } else if (isAndroid) {
      utterance.rate = options?.rate || 0.85; // 안드로이드 Google 엔진은 약간 느릴 때 선명함
      utterance.pitch = 1.0;
    } else {
      utterance.rate = options?.rate || 0.9;
      utterance.pitch = options?.pitch || 1.0;
    }

    // 언어 설정 고정 (중요)
    utterance.lang = 'ko-KR';

    // 2. 기기별 한국어 보이스 매칭 로직
    let selectedVoice = null;

    if (isIOS) {
      // iOS: Yuna(유나)가 한국어 표준 발음에 가장 가깝습니다.
      selectedVoice = 
        voices.find(v => v.name.includes('Yuna') && v.name.includes('Enhanced')) ||
        voices.find(v => v.name.includes('Yuna')) ||
        voices.find(v => v.lang === 'ko-KR' || v.lang === 'ko_KR');
    } else if (isAndroid) {
      // 안드로이드: Google 한국어 엔진이 억양이 가장 자연스럽습니다.
      // 간혹 삼성 기기에서는 Samsung 엔진이 우선될 수 있어 Google을 먼저 찾습니다.
      selectedVoice = 
        voices.find(v => v.name.toLowerCase().includes('google') && v.lang.startsWith('ko')) ||
        voices.find(v => v.name.toLowerCase().includes('samsung') && v.lang.startsWith('ko')) ||
        voices.find(v => v.lang.startsWith('ko'));
    } else {
      // PC/Chrome: Google 한국어(ko-KR) 우선
      selectedVoice = 
        voices.find(v => v.name.includes('Google') && v.lang === 'ko-KR') ||
        voices.find(v => v.lang === 'ko-KR');
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.onend = () => resolve();
    utterance.onerror = (e) => reject(e);

    // iOS/Android 모바일 브라우저의 끊김 방지를 위한 미세한 딜레이
    const playDelay = (isIOS || isAndroid) ? 100 : 0;
    setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, playDelay);
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