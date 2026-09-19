// Speech synthesis helper for calm narration using Web Speech API

class SpeechNarrator {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isSpeaking = false;
  private isPaused = false;
  private listeners: Set<(speaking: boolean, paused: boolean) => void> = new Set();
  private voices: SpeechSynthesisVoice[] = [];

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  private loadVoices() {
    if (this.synth) {
      this.voices = this.synth.getVoices();
    }
  }

  public subscribe(listener: (speaking: boolean, paused: boolean) => void) {
    this.listeners.add(listener);
    listener(this.isSpeaking, this.isPaused);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((cb) => cb(this.isSpeaking, this.isPaused));
  }

  public speak(text: string, rate: number = 0.9, lang: string = 'en-US') {
    if (!this.synth) {
      console.warn('SpeechSynthesis is not supported in this browser.');
      return;
    }

    this.stop();

    // Clean markdown, links, and formatting for clear audio reading
    const cleanText = text
      .replace(/[*#_`]/g, '')
      .replace(/https?:\/\/\S+/g, '')
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = rate; // calm comfortable pace
    utterance.pitch = 1.0;
    utterance.lang = lang;

    // Retrieve fresh or cached voices
    const voices = this.voices.length > 0 ? this.voices : (this.synth.getVoices() || []);
    const langNormalized = lang.toLowerCase().replace('_', '-');
    const langPrefix = langNormalized.split('-')[0];

    // 1. Exact match for full BCP-47 tag (e.g. hi-IN, es-ES, ta-IN, ur-IN)
    let matchedVoice = voices.find(
      (v) => v.lang.toLowerCase().replace('_', '-') === langNormalized
    );

    // 2. High-quality natural voice matching the language prefix
    if (!matchedVoice) {
      matchedVoice = voices.find(
        (v) =>
          v.lang.toLowerCase().startsWith(langPrefix) &&
          (v.name.includes('Natural') ||
            v.name.includes('Google') ||
            v.name.includes('Premium') ||
            v.name.includes('Neural') ||
            v.name.includes('Lekha') ||
            v.name.includes('Jorge') ||
            v.name.includes('Monica') ||
            v.name.includes('Paulina') ||
            v.name.includes('Samantha') ||
            v.name.includes('Daniel'))
      );
    }

    // 3. Any voice starting with the language prefix
    if (!matchedVoice) {
      matchedVoice = voices.find((v) => v.lang.toLowerCase().startsWith(langPrefix));
    }

    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    utterance.onstart = () => {
      this.isSpeaking = true;
      this.isPaused = false;
      this.notify();
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      this.isPaused = false;
      this.currentUtterance = null;
      this.notify();
    };

    utterance.onerror = (e) => {
      console.warn('Speech synthesis event:', e);
      this.isSpeaking = false;
      this.isPaused = false;
      this.currentUtterance = null;
      this.notify();
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  public pause() {
    if (this.synth && this.isSpeaking && !this.isPaused) {
      this.synth.pause();
      this.isPaused = true;
      this.notify();
    }
  }

  public resume() {
    if (this.synth && this.isPaused) {
      this.synth.resume();
      this.isPaused = false;
      this.notify();
    }
  }

  public stop() {
    if (this.synth) {
      this.synth.cancel();
      this.isSpeaking = false;
      this.isPaused = false;
      this.currentUtterance = null;
      this.notify();
    }
  }

  public toggle(text: string, rate: number = 0.9, lang: string = 'en-US') {
    if (this.isSpeaking) {
      if (this.isPaused) {
        this.resume();
      } else {
        this.pause();
      }
    } else {
      this.speak(text, rate, lang);
    }
  }
}

export const narrator = new SpeechNarrator();
