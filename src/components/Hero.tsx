import React from 'react';
import { Play, Volume2, ShieldCheck } from 'lucide-react';

interface HeroProps {
  onListenIntro: () => void;
  isPlayingIntro: boolean;
}

export const Hero: React.FC<HeroProps> = ({ onListenIntro, isPlayingIntro }) => {
  return (
    <section className="pt-6 pb-6 text-left">
      {/* Category Pill Badge */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EFEEEA] border border-[#D6CEC2] text-[15px] font-semibold text-[#1E3A34] mb-4">
        <span className="w-2 h-2 rounded-full bg-[#1E3A34]" />
        <span>DigiSathi • Calm, clear document support for seniors &amp; families</span>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Main Headline & Calm Subhead */}
        <div className="max-w-[760px]">
          <h1
            id="hero-heading"
            className="font-serif text-3xl sm:text-4xl lg:text-[42px] font-bold text-[#1E3A34] leading-[1.25] tracking-tight mb-3"
          >
            Let's read this letter together. In plain, calm words.
          </h1>
          <p className="text-[18px] sm:text-[19px] leading-[1.6] text-[#414846] font-normal">
            Upload a photo or scan, speak directly with your AI voice companion, or paste any confusing
            medical bill, Medicare notice, bank letter, or government form. DigiSathi translates
            bureaucratic notices into simple, confident steps.
          </p>
        </div>

        {/* Voice Readout Banner with Listen Button */}
        <div
          id="voice-readout-banner"
          className="lg:w-[320px] shrink-0 bg-[#1E3A34] text-white p-4 sm:p-5 rounded-xl border border-[#1E3A34] shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
              <Volume2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-[15px] font-bold text-white leading-tight">
                Voice Readout Available
              </p>
              <p className="text-[13px] text-white/80 leading-normal mt-0.5">
                Narrated at a calm, comfortable pace
              </p>
            </div>
          </div>

          <button
            id="hero-listen-btn"
            type="button"
            onClick={onListenIntro}
            aria-label={isPlayingIntro ? 'Pause voice readout' : 'Listen to voice readout'}
            className="w-full min-h-[48px] px-4 py-2.5 rounded-lg bg-white text-[#1E3A34] font-bold text-[16px] hover:bg-[#F5F3EF] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            {isPlayingIntro ? (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-[#BA1A1A] animate-ping" />
                <span>Pause Voice</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-[#1E3A34] text-[#1E3A34]" />
                <span>Listen</span>
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
};
