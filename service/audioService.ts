// lib/audioService.ts

/**
 * 무료 Web Speech API를 사용한 음성 재생 서비스
 */

interface AudioServiceOptions {
  lang?: string;
  rate?: number;
  pitch?: number;
  voice?: string; // <- 이 줄을 추가하세요!
}

class AudioService {
  private currentAudio: HTMLAudioElement | null = null;
  private abortController: AbortController | null = null;
  private defaultOptions: AudioServiceOptions = {
    lang: 'ko-KR', // Google TTS는 'en-US' 대신 'en'을 기본으로 사용 가능
  };

async play(text: string, options?: AudioServiceOptions): Promise<void> {
// 음성 목록을 가져오는 헬퍼 함수
  const getKoreanVoice = (): SpeechSynthesisVoice | undefined => {
    const voices = window.speechSynthesis.getVoices();
    const koVoices = voices.filter(v => v.lang.startsWith('ko'));
    
    return (
      koVoices.find(v => v.name.includes('Google') && v.lang === 'ko-KR') ||
      koVoices.find(v => (v.name.includes('Apple') || v.name.includes('Yuna')) && v.lang === 'ko-KR') ||
      koVoices.find(v => v.lang === 'ko-KR') ||
      koVoices[0]
    );
  };

  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      return reject(new Error('지원하지 않는 브라우저입니다.'));
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = options?.lang || 'ko-KR';

    // 모바일/PC 설정
    const isMobile = this.checkIsMobile();
    utterance.rate = options?.rate || (isMobile ? 0.85 : 0.9);
    utterance.pitch = options?.pitch || (isMobile ? 1.1 : 1.0);

    // [수정 핵심] 음성을 설정하는 내부 함수
    const setVoiceAndSpeak = () => {
      const selectedVoice = getKoreanVoice();
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
      
      utterance.onend = () => resolve();
      utterance.onerror = (e) => reject(e);
      window.speechSynthesis.speak(utterance);
    };

    // 음성 목록이 이미 로드되었는지 확인
    if (window.speechSynthesis.getVoices().length > 0) {
      setVoiceAndSpeak();
    } else {
      // 로드되지 않았다면 onvoiceschanged 이벤트 발생 시 실행
      window.speechSynthesis.onvoiceschanged = () => {
        setVoiceAndSpeak();
      };
    }
  });
  }

  
  // AudioService.ts 내의 수정된 play 함수
async playEdgeTTS(date: string, type: string, id?: number): Promise<void> {
  // 1. 이전 요청(Fetch) 취소
  if (this.abortController) {
    this.abortController.abort();
  }
  this.abortController = new AbortController();

  // 2. 기존 재생 중인 소리 즉시 정지
  if (this.currentAudio) {
    this.currentAudio.pause();
    this.currentAudio.src = ""; // 메모리 해제 및 로딩 중단
    this.currentAudio.load();
    this.currentAudio = null;
  }

  const params = new URLSearchParams({
    date,
    type,
    ...(id && { id: id.toString() }),
  });
  
  try {
    // 3. fetch에 signal 전달 (광클 시 이전 요청 자동 취소)
    const response = await fetch(`/api/tts?${params}`, {
      signal: this.abortController.signal
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`서버 에러: ${errorData.error || response.statusText}`);
    }

    const blob = await response.blob();
    if (blob.size < 100) throw new Error("데이터 부족");

    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    this.currentAudio = audio;

    return new Promise((resolve, reject) => {
      audio.volume = 1.0;

      audio.oncanplaythrough = async () => {
        try {
          // 재생 시점에도 내가 '최신'인지 한 번 더 확인
          if (this.currentAudio === audio) {
            await audio.play();
          }
        } catch (e) { reject(e); }
      };

      audio.onended = () => {
        URL.revokeObjectURL(url);
        if (this.currentAudio === audio) this.currentAudio = null;
        resolve();
      };

      audio.onerror = (e) => {
        URL.revokeObjectURL(url);
        reject(e);
      };
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'AbortError') {
          console.log("이전 요청이 취소되었습니다.");
          return; 
        }

        // 2. 일반 에러 처리
        if (error instanceof Error) {
          console.error("Edge TTS 재생 에러 상세:", error.message);
        } else {
          console.error("알 수 없는 에러 발생:", error);
        }
        
        throw error;
  }
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