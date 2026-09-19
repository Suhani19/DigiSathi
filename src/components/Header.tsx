import React, { useState, useRef, useEffect } from 'react';
import { Logo } from './Logo';
import {
  Eye,
  Volume2,
  VolumeX,
  FileText,
  PhoneCall,
  Check,
  Globe,
  ChevronDown,
  Plus
} from 'lucide-react';
import { SUPPORTED_LANGUAGES, LanguageOption } from '../data/languages';

interface HeaderProps {
  textScale: number;
  setTextScale: (scale: number) => void;
  highContrast: boolean;
  setHighContrast: (val: boolean) => void;
  isReadingAloud: boolean;
  onToggleReadAloud: () => void;
  onOpenRecords: () => void;
  onScrollToHelplines: () => void;
  activeNav: 'explain' | 'records' | 'helplines';
  currentLanguage: string;
  onSelectLanguage: (langCode: string) => void;
  isTranslating?: boolean;
  availableLanguages?: LanguageOption[];
  onOpenAddLanguage?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  textScale,
  setTextScale,
  highContrast,
  setHighContrast,
  isReadingAloud,
  onToggleReadAloud,
  onOpenRecords,
  onScrollToHelplines,
  activeNav,
  currentLanguage,
  onSelectLanguage,
  isTranslating = false,
  availableLanguages,
  onOpenAddLanguage
}) => {
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement | null>(null);

  const langList = availableLanguages && availableLanguages.length > 0 ? availableLanguages : SUPPORTED_LANGUAGES;
  const nextScale = textScale === 1 ? 1.25 : textScale === 1.25 ? 1.5 : 1;
  const currentLangObj =
    langList.find((l) => l.code === currentLanguage) || langList[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setIsLangMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header
      id="main-header"
      className="sticky top-0 z-40 bg-[#FBF9F5]/95 backdrop-blur-md border-b border-[#D6CEC2] shadow-2xs transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4 flex-wrap">
        {/* Brand / Logo */}
        <div className="flex items-center gap-4">
          <Logo />
        </div>

        {/* Center Nav: Core user actions */}
        <nav
          aria-label="Main Navigation"
          className="hidden md:flex items-center bg-[#F5F3EF] p-1 rounded-full border border-[#D6CEC2]"
        >
          <button
            id="nav-explain"
            type="button"
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`min-h-[44px] px-5 py-2 rounded-full text-[16px] font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeNav === 'explain'
                ? 'bg-[#1E3A34] text-white shadow-xs'
                : 'text-[#1B1C1A] hover:bg-[#EFEEEA]'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Explain a Document</span>
          </button>

          <button
            id="nav-records"
            type="button"
            onClick={onOpenRecords}
            className="min-h-[44px] px-4 py-2 rounded-full text-[16px] font-semibold text-[#1B1C1A] hover:bg-[#EFEEEA] transition-all cursor-pointer flex items-center gap-2"
          >
            <span>Sample Notices &amp; Letters</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#EFEEEA] text-[#1E3A34] font-bold border border-[#D6CEC2]">
              3
            </span>
          </button>

          <button
            id="nav-helplines"
            type="button"
            onClick={onScrollToHelplines}
            className="min-h-[44px] px-4 py-2 rounded-full text-[16px] font-semibold text-[#1B1C1A] hover:bg-[#EFEEEA] transition-all cursor-pointer flex items-center gap-2"
          >
            <PhoneCall className="w-4 h-4 text-[#C05621]" />
            <span>Senior Helplines</span>
          </button>
        </nav>

        {/* Right side: Accessibility controls & Language */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end">
          {/* Persistent Accessibility Bar */}
          <div
            role="toolbar"
            aria-label="Accessibility Tools"
            className="flex items-center bg-[#EFEEEA] border border-[#D6CEC2] rounded-full p-1 gap-1"
          >
            {/* Text Size Stepper */}
            <button
              id="a11y-text-size"
              type="button"
              onClick={() => setTextScale(nextScale)}
              aria-label={`Change text size. Currently ${Math.round(textScale * 100)}%`}
              title="Scale text larger for easier reading"
              className="min-h-[40px] px-3 py-1.5 rounded-full text-[15px] font-bold text-[#1B1C1A] hover:bg-[#FFFFFF] transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span className="text-xs">A</span>
              <span className="text-base font-extrabold text-[#1E3A34]">
                {textScale === 1 ? 'A' : textScale === 1.25 ? 'A+' : 'A++'}
              </span>
            </button>

            <div className="w-[1px] h-4 bg-[#D6CEC2]" />

            {/* Contrast Toggle */}
            <button
              id="a11y-contrast"
              type="button"
              onClick={() => setHighContrast(!highContrast)}
              aria-pressed={highContrast}
              aria-label="Toggle High Contrast Mode"
              title="Toggle high-contrast black and white mode"
              className={`min-h-[40px] px-2.5 py-1.5 rounded-full text-[14px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                highContrast
                  ? 'bg-black text-white font-bold'
                  : 'text-[#1B1C1A] hover:bg-[#FFFFFF]'
              }`}
            >
              <Eye className="w-4 h-4" />
              <span className="hidden sm:inline">Contrast</span>
              {highContrast && <Check className="w-3.5 h-3.5 text-white" />}
            </button>

            <div className="w-[1px] h-4 bg-[#D6CEC2]" />

            {/* Read Aloud Toggle */}
            <button
              id="a11y-read-aloud"
              type="button"
              onClick={onToggleReadAloud}
              aria-pressed={isReadingAloud}
              aria-label="Read document summary aloud"
              title="Listen to plain voice narration"
              className={`min-h-[40px] px-3 py-1.5 rounded-full text-[14px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                isReadingAloud
                  ? 'bg-[#1E3A34] text-white animate-pulse'
                  : 'text-[#1B1C1A] hover:bg-[#FFFFFF]'
              }`}
            >
              {isReadingAloud ? (
                <>
                  <VolumeX className="w-4 h-4" />
                  <span className="hidden sm:inline">Stop</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 text-[#1E3A34]" />
                  <span className="hidden sm:inline">Read Aloud</span>
                </>
              )}
            </button>
          </div>

          {/* Language Selector Dropdown */}
          <div ref={langMenuRef} className="relative">
            <button
              id="header-language-selector"
              type="button"
              onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
              aria-haspopup="listbox"
              aria-expanded={isLangMenuOpen}
              title="Change output language (English, Hindi, Spanish, etc.)"
              className="min-h-[44px] px-3.5 py-1.5 rounded-full bg-[#EFEEEA] border border-[#D6CEC2] hover:bg-[#FFFFFF] text-[#1B1C1A] font-bold text-[14px] flex items-center gap-2 cursor-pointer shadow-2xs transition-colors"
            >
              <Globe className="w-4 h-4 text-[#1E3A34]" />
              <span className="text-base">{currentLangObj.flag}</span>
              <span className="font-semibold">{currentLangObj.nativeName}</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#727976]" />
              {isTranslating && (
                <span className="w-2 h-2 rounded-full bg-[#C05621] animate-ping" />
              )}
            </button>

            {isLangMenuOpen && (
              <div
                role="listbox"
                aria-label="Select output language"
                className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border-1.5 border-[#D6CEC2] shadow-lg py-2 z-50 animate-in fade-in zoom-in-95 duration-150 max-h-[360px] overflow-y-auto"
              >
                <div className="px-3 py-1.5 border-b border-[#D6CEC2] mb-1">
                  <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#414846]">
                    Select Output Language
                  </p>
                </div>
                {langList.map((lang) => {
                  const isSelected = lang.code === currentLanguage;
                  return (
                    <button
                      key={lang.code}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => {
                        onSelectLanguage(lang.code);
                        setIsLangMenuOpen(false);
                      }}
                      className={`w-full px-3.5 py-2 text-left flex items-center justify-between text-[14px] hover:bg-[#F5F3EF] cursor-pointer transition-colors ${
                        isSelected ? 'bg-[#EFEEEA] font-bold text-[#1E3A34]' : 'text-[#1B1C1A]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-lg">{lang.flag}</span>
                        <div>
                          <p className="leading-tight">{lang.nativeName}</p>
                          <p className="text-[11px] text-[#727976]">{lang.name}</p>
                        </div>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-[#1E3A34]" />}
                    </button>
                  );
                })}

                <div className="p-1.5 border-t border-[#D6CEC2] mt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsLangMenuOpen(false);
                      onOpenAddLanguage?.();
                    }}
                    className="w-full px-3 py-2 text-left rounded-xl text-[13px] font-bold text-[#1E3A34] hover:bg-[#EBF2EE] flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <Plus className="w-4 h-4 text-[#1E3A34]" />
                    <span>+ Add Language Used by You...</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Elderline Quick Link */}
          <a
            href="tel:14567"
            title="Call National Senior Citizens Helpline (Toll-Free 14567)"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FEF3C7] border border-[#F59E0B] text-[#92400E] font-bold text-[13px] hover:bg-[#FDE68A] transition-colors"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Elderline: 14567</span>
          </a>
        </div>
      </div>
    </header>
  );
};
