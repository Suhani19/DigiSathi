import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Globe, Sparkles, AlertCircle } from 'lucide-react';

interface VoiceAgentTabProps {
  onTranscriptReady: (transcriptText: string) => void;
  isProcessing: boolean;
  currentLanguage?: string;
}

const LANGUAGES = [
  { code: 'en-US', label: 'English (US)' },
  { code: 'hi-IN', label: 'Hindi (हिंदी)' },
  { code: 'ta-IN', label: 'Tamil (தமிழ்)' },
  { code: 'te-IN', label: 'Telugu (తెలుగు)' },
  { code: 'bn-IN', label: 'Bengali (বাংলা)' },
  { code: 'mr-IN', label: 'Marathi (मराठी)' },
  { code: 'gu-IN', label: 'Gujarati (ગુજરાતી)' },
  { code: 'kn-IN', label: 'Kannada (ಕನ್ನಡ)' },
  { code: 'pa-IN', label: 'Punjabi (ਪੰਜਾਬੀ)' },
  { code: 'es-ES', label: 'Spanish (Español)' },
  { code: 'fr-FR', label: 'French (Français)' },
  { code: 'zh-CN', label: 'Mandarin (中文)' }
];

export const VoiceAgentTab: React.FC<VoiceAgentTabProps> = ({
  onTranscriptReady,
  isProcessing,
  currentLanguage = 'en'
}) => {
  const getInitialLangCode = (lang: string) => {
    switch (lang) {
      case 'hi': return 'hi-IN';
      case 'ta': return 'ta-IN';
      case 'te': return 'te-IN';
      case 'bn': return 'bn-IN';
      case 'mr': return 'mr-IN';
      case 'gu': return 'gu-IN';
      case 'kn': return 'kn-IN';
      case 'pa': return 'pa-IN';
      case 'es': return 'es-ES';
      case 'fr': return 'fr-FR';
      default: return 'en-US';
    }
  };

  const [selectedLang, setSelectedLang] = useState(() => getInitialLangCode(currentLanguage));
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setSelectedLang(getInitialLangCode(currentLanguage));
  }, [currentLanguage]);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check SpeechRecognition support
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setErrorMessage(
        'Speech recognition is not supported in this browser. You can type or paste your letter in the next tab.'
      );
      return;
    }

    const recognizer = new SpeechRecognition();
    recognizer.continuous = true;
    recognizer.interimResults = true;
    recognizer.lang = selectedLang;

    recognizer.onresult = (event: any) => {
      let currentText = '';
      for (let i = 0; i < event.results.length; i++) {
        currentText += event.results[i][0].transcript + ' ';
      }
      setTranscript(currentText.trim());
    };

    recognizer.onerror = (event: any) => {
      console.warn('Speech recognition error:', event.error);
      if (event.error !== 'no-speech') {
        setErrorMessage(`Microphone note: ${event.error}. Please tap the mic button to try again.`);
      }
      setIsRecording(false);
    };

    recognizer.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognizer;

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (_) {}
      }
    };
  }, [selectedLang]);

  const toggleRecording = () => {
    setErrorMessage(null);
    if (!recognitionRef.current) {
      setErrorMessage('Speech recognition is not available on this browser.');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      setTranscript('');
      try {
        recognitionRef.current.lang = selectedLang;
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (err: any) {
        console.warn('Recognition start error:', err);
        setErrorMessage('Unable to start recording. Please verify microphone permission.');
        setIsRecording(false);
      }
    }
  };

  const handleProcessTranscript = () => {
    if (transcript.trim().length > 5) {
      onTranscriptReady(transcript);
    }
  };

  return (
    <div className="flex flex-col items-center text-center p-6 sm:p-8">
      {/* Language Selector */}
      <div className="w-full max-w-md flex items-center justify-center gap-2 mb-6">
        <Globe className="w-5 h-5 text-[#1E3A34]" />
        <label htmlFor="voice-language-select" className="text-[16px] font-semibold text-[#1B1C1A]">
          Speaking in:
        </label>
        <select
          id="voice-language-select"
          value={selectedLang}
          onChange={(e) => setSelectedLang(e.target.value)}
          disabled={isRecording}
          className="min-h-[44px] px-3 py-1.5 rounded-lg border border-[#D6CEC2] bg-white text-[#1B1C1A] text-[16px] font-medium focus:ring-2 focus:ring-[#1E3A34]"
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.label}
            </option>
          ))}
        </select>
      </div>

      {/* Pulsing Mic Button & Waveform Container */}
      <div className="relative my-4 flex flex-col items-center">
        {/* Pulsing ripple rings when recording */}
        {isRecording && (
          <div className="absolute inset-0 -m-6 rounded-full bg-[#1E3A34]/15 animate-ping pointer-events-none" />
        )}

        <button
          id="voice-mic-toggle-btn"
          type="button"
          onClick={toggleRecording}
          aria-pressed={isRecording}
          aria-label={isRecording ? 'Stop speaking' : 'Start speaking'}
          className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md z-10 ${
            isRecording
              ? 'bg-[#C05621] text-white scale-105'
              : 'bg-[#1E3A34] text-white hover:bg-[#142723]'
          }`}
        >
          {isRecording ? (
            <>
              <MicOff className="w-10 h-10" />
              <span className="text-xs font-bold uppercase tracking-wider">Stop</span>
            </>
          ) : (
            <>
              <Mic className="w-10 h-10" />
              <span className="text-xs font-bold uppercase tracking-wider">Tap to Speak</span>
            </>
          )}
        </button>
      </div>

      {/* Live Waveform Animation */}
      {isRecording ? (
        <div className="mt-4 flex items-center justify-center gap-1.5 h-10">
          {[40, 75, 50, 95, 60, 85, 45, 90, 65, 35].map((heightPercent, idx) => (
            <div
              key={idx}
              className="w-1.5 bg-[#1E3A34] rounded-full animate-pulse"
              style={{
                height: `${heightPercent}%`,
                animationDelay: `${idx * 120}ms`,
                animationDuration: '800ms'
              }}
            />
          ))}
        </div>
      ) : (
        <p className="text-[16px] text-[#414846] mt-3 font-medium">
          Speak aloud about the letter, what doctor or agency it is from, and what questions you have.
        </p>
      )}

      {/* Error message */}
      {errorMessage && (
        <div className="mt-4 flex items-center gap-2 p-3 rounded-lg bg-[#ffdad6] text-[#ba1a1a] text-sm max-w-lg text-left">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Live Transcript Display Box */}
      <div className="w-full max-w-2xl mt-6 p-4 rounded-xl bg-white border border-[#D6CEC2] text-left">
        <p className="text-xs font-bold tracking-wider uppercase text-[#414846] mb-1.5">
          Spoken Transcript:
        </p>
        <p className="text-[18px] leading-relaxed text-[#1B1C1A] min-h-[64px]">
          {transcript ? (
            transcript
          ) : (
            <span className="italic text-[#727976]">
              {isRecording
                ? 'Listening carefully... please speak at a calm pace.'
                : 'Your spoken words will appear here in real time...'}
            </span>
          )}
        </p>
      </div>

      {/* Action to submit transcript */}
      {transcript.trim().length > 5 && (
        <div className="mt-5">
          <button
            id="voice-explain-transcript-btn"
            type="button"
            onClick={handleProcessTranscript}
            disabled={isProcessing}
            className="min-h-[56px] px-8 py-3 rounded-lg bg-[#1E3A34] text-white font-bold text-[18px] hover:bg-[#142723] flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
          >
            <Sparkles className="w-5 h-5 text-[#C05621]" />
            <span>{isProcessing ? 'DigiSathi is Reading...' : 'Explain this Voice Explanation'}</span>
          </button>
        </div>
      )}
    </div>
  );
};
