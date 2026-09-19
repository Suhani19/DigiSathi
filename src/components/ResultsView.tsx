import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Clock,
  Volume2,
  VolumeX,
  RotateCcw,
  CheckCircle2,
  Circle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Copy,
  Printer,
  MessageSquare,
  Phone,
  Calendar,
  Share2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Check,
  Sparkles,
  ShieldAlert,
  Info,
  Globe,
  Loader2,
  Plus,
  Languages
} from 'lucide-react';
import { ExplanationResult, SampleDocument } from '../types';
import { narrator } from '../utils/speech';
import { ScheduleCallbackModal } from './ScheduleCallbackModal';
import { SUPPORTED_LANGUAGES, UI_STRINGS, LanguageOption } from '../data/languages';

interface ResultsViewProps {
  explanation: ExplanationResult;
  currentDocument?: SampleDocument | null;
  uploadedImageUri?: string | null;
  uploadedText?: string | null;
  onReadAloudSummary: (text: string, customSpeechLang?: string) => void;
  isReadingAloud: boolean;
  currentLanguage: string;
  onSelectLanguage: (langCode: string) => void;
  isTranslating?: boolean;
  availableLanguages?: LanguageOption[];
  onOpenAddLanguage?: () => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({
  explanation,
  currentDocument,
  uploadedImageUri,
  uploadedText,
  onReadAloudSummary,
  isReadingAloud,
  currentLanguage,
  onSelectLanguage,
  isTranslating = false,
  availableLanguages,
  onOpenAddLanguage
}) => {
  // Step completion state
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});
  // Expanded glossary items
  const [expandedTerms, setExpandedTerms] = useState<Record<string, boolean>>({});
  // Script tab: phone vs written dispute
  const [activeScriptTab, setActiveScriptTab] = useState<'phone' | 'written'>('phone');
  // Script language toggle for calling US office: translated vs English
  const [scriptViewMode, setScriptViewMode] = useState<'translated' | 'english'>('translated');
  // Summary view mode: translated (native), english, or bilingual
  const [summaryMode, setSummaryMode] = useState<'translated' | 'english' | 'bilingual'>('translated');
  // Document zoom level
  const [docZoom, setDocZoom] = useState(100);
  // Audio playback speed
  const [audioSpeed, setAudioSpeed] = useState<0.8 | 1.0>(1.0);
  // Copy feedback toast
  const [hasCopied, setHasCopied] = useState(false);
  // Sarah notification state
  const [sarahNotified, setSarahNotified] = useState(false);
  // Schedule modal
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  // Track which next step is currently being narrated ('all' or step index)
  const [currentlyReadingStep, setCurrentlyReadingStep] = useState<number | 'all' | null>(null);

  useEffect(() => {
    const unsubscribe = narrator.subscribe((speaking) => {
      if (!speaking) {
        setCurrentlyReadingStep(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const ui = UI_STRINGS[currentLanguage] || UI_STRINGS['en'];
  const langList = availableLanguages && availableLanguages.length > 0 ? availableLanguages : SUPPORTED_LANGUAGES;
  const currentLangObj =
    langList.find((l) => l.code === currentLanguage) || langList[0];

  // English summary and At-A-Glance fallbacks for multi-language toggle
  const englishSummaryText =
    explanation.englishSummary ||
    currentDocument?.explanation.plainSummary ||
    "Don’t panic — you do not need to pay this $482.50 out of pocket immediately. Your doctor’s office simply forgot to attach their routine office visit chart note. Once they resubmit the file with the missing code, Medicare standard procedure covers this.";

  const englishAtAGlance = explanation.englishAtAGlance || currentDocument?.explanation.atAGlance || {
    whatItIs: "Medicare did not pay for Dr. Robert Chen's clinic visit on Oct 12th because a routine administrative approval form was left out of the packet.",
    whatYouOwe: "The clinic printed a bill for $482.50, but this is almost always resolved when the clinic attaches their clinical notes and resubmits code 99214.",
    riskAndTiming: "Low risk, provided you or Sarah make a 5-minute phone call to Dr. Chen's office before December 14, 2024."
  };

  // Default English call script if user wants to read to US office staff
  const englishCallScript =
    explanation.englishCallScript ||
    (currentDocument?.explanation.callScript) ||
    "Hello, my name is Margaret Miller. I am calling regarding my recent statement claim. Could you please confirm if additional clinical notes or prior authorization codes were needed to resubmit this claim under remark code PR-204? Please place a 30-day administrative hold on this account balance while this is reviewed. Thank you.";

  // Initialize step 1 as completed if Medicare sample
  useEffect(() => {
    if (explanation.nextSteps) {
      const initialMap: Record<number, boolean> = {};
      explanation.nextSteps.forEach((step, idx) => {
        if (step.completed) {
          initialMap[idx] = true;
        }
      });
      setCompletedSteps(initialMap);
    }
  }, [explanation]);

  const toggleStep = (idx: number) => {
    setCompletedSteps((prev) => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const toggleTerm = (term: string) => {
    setExpandedTerms((prev) => ({
      ...prev,
      [term]: !prev[term]
    }));
  };

  const completedCount = Object.values(completedSteps).filter(Boolean).length;
  const totalSteps = explanation.nextSteps?.length || 0;

  const handleCopyScript = () => {
    const textToCopy =
      activeScriptTab === 'phone'
        ? explanation.callScript
        : getWrittenDisputeLetter(explanation, currentDocument);
    navigator.clipboard.writeText(textToCopy);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2500);
  };

  const handlePrintScript = () => {
    window.print();
  };

  const handleNotifySarah = () => {
    setSarahNotified(true);
    setTimeout(() => setSarahNotified(false), 3500);
  };

  // Urgency styling calculation
  const getUrgencyStyles = (urgency: string) => {
    if (urgency === 'urgent') {
      return {
        bg: 'bg-[#ffdad6]',
        border: 'border-[#BA1A1A]',
        text: 'text-[#93000a]',
        badgeBg: 'bg-[#BA1A1A] text-white',
        icon: <ShieldAlert className="w-6 h-6 text-[#BA1A1A] shrink-0" />
      };
    }
    if (urgency === 'soon') {
      return {
        bg: 'bg-[#FEF7F2]',
        border: 'border-[#C05621]',
        text: 'text-[#360F00]',
        badgeBg: 'bg-[#C05621] text-white',
        icon: <Clock className="w-6 h-6 text-[#C05621] shrink-0" />
      };
    }
    return {
      bg: 'bg-[#EBF2EE]',
      border: 'border-[#1E3A34]',
      text: 'text-[#1E3A34]',
      badgeBg: 'bg-[#1E3A34] text-white',
      icon: <CheckCircle2 className="w-6 h-6 text-[#1E3A34] shrink-0" />
    };
  };

  const urgencyConfig = getUrgencyStyles(explanation.urgency);

  return (
    <div id="results-view" className="space-y-6">
      {/* 0. LANGUAGE SELECTION & TRANSLATION BAR */}
      <div
        id="language-selection-bar"
        className="p-4 sm:p-5 rounded-2xl bg-white border-1.5 border-[#D6CEC2] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-[#EBF2EE] border border-[#1E3A34] flex items-center justify-center shrink-0">
            <Globe className="w-6 h-6 text-[#1E3A34]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-serif text-[18px] font-bold text-[#1B1C1A]">
                {ui.languageLabel}:{' '}
                <span className="text-[#1E3A34]">
                  {currentLangObj.flag} {currentLangObj.nativeName} ({currentLangObj.name})
                </span>
              </h4>
              {isTranslating && (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#C05621] bg-[#FEF7F2] px-3 py-1 rounded-full border border-[#C05621] animate-pulse">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Translating notice...</span>
                </span>
              )}
            </div>
            <p className="text-[13px] text-[#414846] mt-0.5">
              {ui.translateNotice}
            </p>
          </div>
        </div>

        {/* Quick Language Switcher Pills */}
        <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
          {langList.slice(0, 4).map((lang) => {
            const isCurrent = currentLanguage === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => onSelectLanguage(lang.code)}
                disabled={isTranslating}
                className={`min-h-[42px] px-3.5 py-1.5 rounded-xl text-[14px] font-bold flex items-center gap-2 border transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-[#1E3A34] text-white border-[#1E3A34] shadow-xs'
                    : 'bg-[#F5F3EF] hover:bg-white text-[#1B1C1A] border-[#D6CEC2]'
                }`}
              >
                <span className="text-base">{lang.flag}</span>
                <span>{lang.nativeName}</span>
              </button>
            );
          })}

          {/* More Languages Dropdown */}
          <select
            value={currentLanguage}
            onChange={(e) => onSelectLanguage(e.target.value)}
            disabled={isTranslating}
            aria-label="Select more languages"
            className="min-h-[42px] px-3 py-1.5 rounded-xl text-[14px] font-bold bg-[#F5F3EF] hover:bg-white text-[#1B1C1A] border border-[#D6CEC2] cursor-pointer"
          >
            {langList.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.flag} {lang.nativeName} ({lang.name})
              </option>
            ))}
          </select>

          {onOpenAddLanguage && (
            <button
              type="button"
              onClick={onOpenAddLanguage}
              title="Add language used by you"
              className="min-h-[42px] px-3.5 py-1.5 rounded-xl text-[13px] font-bold bg-[#EBF2EE] hover:bg-[#D5E5DE] text-[#1E3A34] border border-[#1E3A34] flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Language</span>
            </button>
          )}
        </div>
      </div>

      {/* 1. URGENCY NOTICE & MULTILINGUAL SUMMARY CARD */}
      <div
        className={`p-5 sm:p-6 rounded-2xl border-2 ${urgencyConfig.border} ${urgencyConfig.bg} shadow-xs flex flex-col gap-4 transition-all`}
      >
        {/* Multilingual Summary Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#D6CEC2]/80">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider text-[#414846] flex items-center gap-1.5">
              <Languages className="w-4 h-4 text-[#1E3A34]" />
              <span>Summary Language:</span>
            </span>

            {/* View Mode Toggle: Native / English / Bilingual */}
            <div className="flex items-center bg-white/80 p-1 rounded-xl border border-[#D6CEC2] shadow-2xs">
              <button
                type="button"
                onClick={() => setSummaryMode('translated')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  summaryMode === 'translated'
                    ? 'bg-[#1E3A34] text-white shadow-xs'
                    : 'text-[#414846] hover:text-[#1B1C1A]'
                }`}
              >
                {currentLangObj.flag} {currentLangObj.nativeName}
              </button>

              {currentLanguage !== 'en' && (
                <button
                  type="button"
                  onClick={() => setSummaryMode('english')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    summaryMode === 'english'
                      ? 'bg-[#1E3A34] text-white shadow-xs'
                      : 'text-[#414846] hover:text-[#1B1C1A]'
                  }`}
                >
                  🇺🇸 English
                </button>
              )}

              {currentLanguage !== 'en' && (
                <button
                  type="button"
                  onClick={() => setSummaryMode('bilingual')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    summaryMode === 'bilingual'
                      ? 'bg-[#1E3A34] text-white shadow-xs'
                      : 'text-[#414846] hover:text-[#1B1C1A]'
                  }`}
                >
                  <span>Dual Language</span>
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
            <select
              value={currentLanguage}
              onChange={(e) => onSelectLanguage(e.target.value)}
              disabled={isTranslating}
              aria-label="Change summary language directly"
              className="text-xs font-bold bg-white hover:bg-[#F5F3EF] text-[#1B1C1A] px-2.5 py-1.5 rounded-lg border border-[#D6CEC2] cursor-pointer"
            >
              {langList.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.nativeName} ({lang.name})
                </option>
              ))}
            </select>

            {onOpenAddLanguage && (
              <button
                type="button"
                onClick={onOpenAddLanguage}
                title="Add your preferred language"
                className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-[#F5F3EF] text-[#1E3A34] border border-[#1E3A34] text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Language</span>
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start gap-4">
          <div className="p-2.5 rounded-xl bg-white border border-[#D6CEC2] shrink-0">
            {urgencyConfig.icon}
          </div>

          <div className="flex-1 text-left">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#1B1C1A]">
                {explanation.urgencyNote || 'Attention Needed Soon'}
              </h3>
              {explanation.deadline && (
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase ${urgencyConfig.badgeBg}`}
                >
                  {explanation.deadline}
                </span>
              )}
            </div>

            {/* Summary Content based on Mode */}
            {summaryMode === 'translated' && (
              <p className="text-[18px] sm:text-[19px] leading-[1.6] text-[#1B1C1A] font-medium">
                {explanation.plainSummary}
              </p>
            )}

            {summaryMode === 'english' && (
              <div className="space-y-1">
                <span className="inline-block text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-900 border border-blue-300 uppercase tracking-wider mb-1">
                  English Summary
                </span>
                <p className="text-[18px] sm:text-[19px] leading-[1.6] text-[#1B1C1A] font-medium">
                  {englishSummaryText}
                </p>
              </div>
            )}

            {summaryMode === 'bilingual' && (
              <div className="space-y-3.5 mt-1">
                <div className="p-3.5 rounded-xl bg-white/90 border border-[#D6CEC2]">
                  <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded bg-[#EBF2EE] text-[#1E3A34] border border-[#1E3A34] uppercase tracking-wider mb-2">
                    <span>{currentLangObj.flag}</span>
                    <span>In {currentLangObj.nativeName} ({currentLangObj.name})</span>
                  </span>
                  <p className="text-[18px] leading-[1.6] text-[#1B1C1A] font-medium">
                    {explanation.plainSummary}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-white/90 border border-[#D6CEC2]">
                  <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded bg-blue-50 text-blue-900 border border-blue-200 uppercase tracking-wider mb-2">
                    <span>🇺🇸</span>
                    <span>English Original Notice</span>
                  </span>
                  <p className="text-[17px] leading-[1.6] text-[#363B39]">
                    {englishSummaryText}
                  </p>
                </div>
              </div>
            )}

            <div className="mt-3.5 flex items-start gap-2 text-[15px] text-[#414846] bg-white/70 p-3 rounded-lg border border-[#D6CEC2]">
              <Info className="w-4 h-4 text-[#1E3A34] mt-0.5 shrink-0" />
              <p>
                <strong>DigiSathi note:</strong> {ui.digiSathiNote}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. AUDIO PLAYER CARD */}
      <div
        id="audio-player-card"
        className="p-5 sm:p-6 rounded-2xl bg-[#1E3A34] text-white shadow-sm flex flex-col md:flex-row items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4 w-full md:w-auto">
          <button
            type="button"
            onClick={() => {
              if (isReadingAloud || currentlyReadingStep !== null) {
                narrator.stop();
                setCurrentlyReadingStep(null);
              } else {
                const summaryText = summaryMode === 'english' ? englishSummaryText : explanation.plainSummary;
                const stepsAudio =
                  explanation.nextSteps && explanation.nextSteps.length > 0
                    ? explanation.nextSteps.map((s, i) => `${s.title}. ${s.detail || ''}`).join(' ')
                    : '';
                const fullText = `${summaryText}. ${stepsAudio}`;
                const speechLang = summaryMode === 'english' ? 'en-US' : currentLangObj.speechLang;
                onReadAloudSummary(fullText, speechLang);
              }
            }}
            aria-label={isReadingAloud || currentlyReadingStep !== null ? 'Pause audio narration' : 'Play audio narration'}
            className="w-14 h-14 rounded-full bg-white text-[#1E3A34] hover:bg-[#F5F3EF] flex items-center justify-center shrink-0 cursor-pointer shadow-md transition-transform hover:scale-105"
          >
            {isReadingAloud || currentlyReadingStep !== null ? (
              <VolumeX className="w-7 h-7 text-[#BA1A1A]" />
            ) : (
              <Volume2 className="w-7 h-7 text-[#1E3A34]" />
            )}
          </button>

          <div>
            <h4 className="font-serif text-xl font-bold text-white flex items-center gap-2">
              <span>{ui.listenSummary}</span>
              {(isReadingAloud || currentlyReadingStep !== null) && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#C05621] text-white font-bold animate-pulse">
                  {ui.nowPlaying}
                </span>
              )}
            </h4>
            <p className="text-[15px] text-[#D6CEC2]">
              Narrated in {summaryMode === 'english' ? 'English (US)' : `${currentLangObj.flag} ${currentLangObj.nativeName} (${currentLangObj.name})`} • Includes summary &amp; all next steps
            </p>
          </div>
        </div>

        {/* Speed Controls & Replay */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <div className="flex items-center bg-white/10 rounded-xl p-1 border border-white/20">
            <button
              type="button"
              onClick={() => {
                setAudioSpeed(0.8);
                const summaryText = summaryMode === 'english' ? englishSummaryText : explanation.plainSummary;
                const stepsAudio =
                  explanation.nextSteps && explanation.nextSteps.length > 0
                    ? explanation.nextSteps.map((s) => `${s.title}. ${s.detail || ''}`).join(' ')
                    : '';
                const fullText = `${summaryText}. ${stepsAudio}`;
                const speechLang = summaryMode === 'english' ? 'en-US' : currentLangObj.speechLang;
                narrator.speak(fullText, 0.8, speechLang);
              }}
              className={`min-h-[40px] px-3 py-1 rounded-lg text-[14px] font-bold transition-colors cursor-pointer ${
                audioSpeed === 0.8 ? 'bg-white text-[#1E3A34]' : 'text-white hover:bg-white/10'
              }`}
            >
              0.8x (Slower)
            </button>
            <button
              type="button"
              onClick={() => {
                setAudioSpeed(1.0);
                const summaryText = summaryMode === 'english' ? englishSummaryText : explanation.plainSummary;
                const stepsAudio =
                  explanation.nextSteps && explanation.nextSteps.length > 0
                    ? explanation.nextSteps.map((s) => `${s.title}. ${s.detail || ''}`).join(' ')
                    : '';
                const fullText = `${summaryText}. ${stepsAudio}`;
                const speechLang = summaryMode === 'english' ? 'en-US' : currentLangObj.speechLang;
                narrator.speak(fullText, 1.0, speechLang);
              }}
              className={`min-h-[40px] px-3 py-1 rounded-lg text-[14px] font-bold transition-colors cursor-pointer ${
                audioSpeed === 1.0 ? 'bg-white text-[#1E3A34]' : 'text-white hover:bg-white/10'
              }`}
            >
              1.0x (Normal)
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              const summaryText = summaryMode === 'english' ? englishSummaryText : explanation.plainSummary;
              const stepsAudio =
                explanation.nextSteps && explanation.nextSteps.length > 0
                  ? explanation.nextSteps.map((s) => `${s.title}. ${s.detail || ''}`).join(' ')
                  : '';
              const fullText = `${summaryText}. ${stepsAudio}`;
              const speechLang = summaryMode === 'english' ? 'en-US' : currentLangObj.speechLang;
              narrator.speak(fullText, audioSpeed, speechLang);
            }}
            title="Replay narration from beginning"
            className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 3. SIDE-BY-SIDE PANEL: Original Document (Left) vs. In Plain English Summary (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* LEFT COLUMN: ORIGINAL DOCUMENT */}
        <div className="bg-[#FFFFFF] border-1.5 border-[#D6CEC2] rounded-2xl shadow-xs overflow-hidden flex flex-col">
          {/* Header Bar */}
          <div className="px-5 py-3.5 bg-[#F5F3EF] border-b border-[#D6CEC2] flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#1E3A34]" />
              <span className="text-[15px] font-bold text-[#1B1C1A]">
                Original Document
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-white text-[#414846] border border-[#D6CEC2]">
                {currentDocument?.formId || 'Official Form'}
              </span>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-1 bg-[#EFEEEA] px-2 py-1 rounded-lg border border-[#D6CEC2] text-xs">
              <span className="text-[#414846] font-semibold mr-1">{docZoom}%</span>
              <button
                type="button"
                onClick={() => setDocZoom((z) => Math.max(80, z - 10))}
                className="w-6 h-6 rounded-md hover:bg-white flex items-center justify-center cursor-pointer text-[#1B1C1A]"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setDocZoom((z) => Math.min(150, z + 10))}
                className="w-6 h-6 rounded-md hover:bg-white flex items-center justify-center cursor-pointer text-[#1B1C1A]"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setDocZoom(100)}
                className="w-6 h-6 rounded-md hover:bg-white flex items-center justify-center cursor-pointer text-[#1B1C1A]"
                title="Reset Zoom"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Document Content View Stage */}
          <div className="p-6 bg-[#FBF9F5] min-h-[380px] max-h-[560px] overflow-y-auto text-left">
            <div
              style={{ transform: `scale(${docZoom / 100})`, transformOrigin: 'top left' }}
              className="transition-transform duration-150"
            >
              {uploadedImageUri ? (
                <img
                  src={uploadedImageUri}
                  alt="Scanned letter"
                  className="w-full rounded-lg border border-[#D6CEC2] shadow-xs"
                />
              ) : currentDocument ? (
                <div className="p-5 bg-white border border-[#D6CEC2] rounded-xl font-mono text-sm leading-relaxed text-[#1B1C1A] space-y-3 shadow-2xs">
                  {/* Formal Document Letterhead */}
                  <div className="border-b-2 border-black pb-3 text-center space-y-1">
                    <p className="font-serif font-bold text-xs uppercase tracking-widest text-[#0F2942]">
                      Department of Health &amp; Human Services
                    </p>
                    <p className="font-serif font-extrabold text-sm uppercase tracking-wider text-black">
                      Centers for Medicare &amp; Medicaid Services
                    </p>
                    <p className="text-xs text-[#414846]">
                      Part B Medicare Summary Notice — Form CMS-10156 | OMB 0938-1197
                    </p>
                  </div>

                  {/* Beneficiary Meta Box */}
                  <div className="grid grid-cols-2 gap-2 text-xs border border-[#D6CEC2] p-2.5 rounded-md bg-[#FBF9F5]">
                    <div>
                      <strong>Beneficiary:</strong> MARGARET E. MILLER
                    </div>
                    <div>
                      <strong>Medicare #:</strong> 1EG4-TE9-MK22
                    </div>
                    <div>
                      <strong>Notice Date:</strong> November 10, 2024
                    </div>
                    <div>
                      <strong>Provider:</strong> DR. ROBERT CHEN, MD
                    </div>
                  </div>

                  {/* Official Notice Alert Banner */}
                  <div className="p-2.5 bg-[#FFDAD6] border border-[#BA1A1A] rounded-md text-xs font-bold text-[#BA1A1A] uppercase tracking-wider text-center">
                    Notice of Non-Coverage &amp; Beneficiary Financial Liability
                  </div>

                  {/* Legal/Technical Text */}
                  <div className="text-xs space-y-2 text-[#1B1C1A]">
                    <p>
                      <strong>Claim Control Reference:</strong> #8839201-B | Processed under Jurisdiction K
                    </p>
                    <p className="p-2 bg-yellow-50 border-l-4 border-[#C05621] text-[11px]">
                      Prior authorization criteria under <strong>Section 1862(a)(1)(A) of the Social Security Act</strong> were not satisfied for Service Code <strong>99214</strong> (Outpatient Clinician Visit, Level 4) administered on 10/12/2024.
                    </p>
                    <p className="text-[11px] text-[#414846]">
                      <strong>Reason citation:</strong> Remittance Advice Remark Code PR-204: The requested medical documentation demonstrating reasonable and customary medical necessity was absent at adjudication.
                    </p>
                  </div>

                  {/* Billing Table */}
                  <div className="border border-black rounded-md overflow-hidden text-xs">
                    <div className="grid grid-cols-2 bg-[#EFEEEA] p-2 font-bold border-b border-black">
                      <span>Provider Billed Amount:</span>
                      <span className="text-right">$540.00</span>
                    </div>
                    <div className="grid grid-cols-2 p-2 border-b border-[#D6CEC2]">
                      <span>Medicare Approved Amount:</span>
                      <span className="text-right">$0.00</span>
                    </div>
                    <div className="grid grid-cols-2 bg-[#FFDAD6]/60 p-2 font-extrabold text-[#BA1A1A]">
                      <span>Balance Due From Beneficiary:</span>
                      <span className="text-right">$482.50</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-white border border-[#D6CEC2] rounded-xl text-sm whitespace-pre-wrap font-mono">
                  {uploadedText || 'No document text provided.'}
                </div>
              )}
            </div>
          </div>

          {/* Shared with Sarah (Daughter) Caregiver Sync Card */}
          <div className="p-4 bg-[#F5F3EF] border-t border-[#D6CEC2] flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#EFEEEA] border border-[#1E3A34] flex items-center justify-center shrink-0">
                <Share2 className="w-4 h-4 text-[#1E3A34]" />
              </div>
              <div className="text-left">
                <p className="text-[14px] font-bold text-[#1B1C1A]">
                  Shared with Sarah (Daughter)
                </p>
                <p className="text-[12px] text-[#414846]">
                  Sarah can view this DigiSathi translation on her phone
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleNotifySarah}
              className={`min-h-[40px] px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                sarahNotified
                  ? 'bg-[#1E3A34] text-white'
                  : 'bg-white border border-[#D6CEC2] text-[#1E3A34] hover:bg-[#EFEEEA]'
              }`}
            >
              {sarahNotified ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Sarah Notified!</span>
                </>
              ) : (
                <>
                  <MessageSquare className="w-3.5 h-3.5 text-[#C05621]" />
                  <span>Notify Sarah</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: AT A GLANCE — IN PLAIN WORDS (30-SECOND SUMMARY) */}
        <div className="bg-[#FFFFFF] border-1.5 border-[#D6CEC2] rounded-2xl shadow-xs p-6 sm:p-7 text-left space-y-6">
          <div className="border-b border-[#D6CEC2] pb-4">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <p className="text-xs font-bold uppercase tracking-wider text-[#C05621] mb-1">
                {ui.atAGlanceSub}
              </p>
              {currentLanguage !== 'en' && (
                <button
                  type="button"
                  onClick={() => setSummaryMode(summaryMode === 'bilingual' ? 'translated' : 'bilingual')}
                  className={`text-xs px-2.5 py-1 rounded-lg font-bold border transition-colors cursor-pointer flex items-center gap-1.5 ${
                    summaryMode === 'bilingual'
                      ? 'bg-[#1E3A34] text-white border-[#1E3A34]'
                      : 'bg-[#F5F3EF] text-[#414846] hover:text-[#1B1C1A] border-[#D6CEC2]'
                  }`}
                >
                  <Languages className="w-3.5 h-3.5" />
                  <span>{summaryMode === 'bilingual' ? 'Dual-Language: On' : 'Show Dual-Language'}</span>
                </button>
              )}
            </div>
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-2xl font-bold text-[#1E3A34]">
                {ui.atAGlanceTitle}
              </h3>
              <CheckCircle2 className="w-6 h-6 text-[#1E3A34] shrink-0" />
            </div>
          </div>

          {/* 3 Point Summary */}
          <div className="space-y-4">
            {/* Point 1: What this letter actually is */}
            <div className="flex items-start gap-3.5 p-4 rounded-xl bg-[#FBF9F5] border border-[#D6CEC2]">
              <div className="w-8 h-8 rounded-full bg-[#1E3A34] text-white font-bold text-sm flex items-center justify-center shrink-0">
                1
              </div>
              <div className="flex-1">
                <h4 className="font-serif text-[17px] font-bold text-[#1B1C1A] mb-1">
                  {ui.point1Title}
                </h4>
                <p className="text-[17px] sm:text-[18px] text-[#414846] leading-relaxed">
                  {summaryMode === 'english' ? englishAtAGlance.whatItIs : (explanation.atAGlance?.whatItIs || englishAtAGlance.whatItIs)}
                </p>

                {summaryMode === 'bilingual' && currentLanguage !== 'en' && (
                  <div className="mt-2.5 p-2.5 rounded-lg bg-white border border-[#D6CEC2] text-xs text-[#363B39]">
                    <span className="font-bold text-[#1E3A34] mr-1.5">🇺🇸 English Original:</span>
                    <span>{englishAtAGlance.whatItIs}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Point 2: What you owe right now */}
            <div className="flex items-start gap-3.5 p-4 rounded-xl bg-[#FBF9F5] border border-[#D6CEC2]">
              <div className="w-8 h-8 rounded-full bg-[#1E3A34] text-white font-bold text-sm flex items-center justify-center shrink-0">
                2
              </div>
              <div className="flex-1">
                <h4 className="font-serif text-[17px] font-bold text-[#1B1C1A] mb-1">
                  {ui.point2Title}
                </h4>
                <p className="text-[17px] sm:text-[18px] text-[#414846] leading-relaxed">
                  {summaryMode === 'english' ? englishAtAGlance.whatYouOwe : (explanation.atAGlance?.whatYouOwe || englishAtAGlance.whatYouOwe)}
                </p>

                {summaryMode === 'bilingual' && currentLanguage !== 'en' && (
                  <div className="mt-2.5 p-2.5 rounded-lg bg-white border border-[#D6CEC2] text-xs text-[#363B39]">
                    <span className="font-bold text-[#1E3A34] mr-1.5">🇺🇸 English Original:</span>
                    <span>{englishAtAGlance.whatYouOwe}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Point 3: Your risk level & timing */}
            <div className="flex items-start gap-3.5 p-4 rounded-xl bg-[#FBF9F5] border border-[#D6CEC2]">
              <div className="w-8 h-8 rounded-full bg-[#1E3A34] text-white font-bold text-sm flex items-center justify-center shrink-0">
                3
              </div>
              <div className="flex-1">
                <h4 className="font-serif text-[17px] font-bold text-[#1B1C1A] mb-1">
                  {ui.point3Title}
                </h4>
                <p className="text-[17px] sm:text-[18px] text-[#414846] leading-relaxed">
                  {summaryMode === 'english' ? englishAtAGlance.riskAndTiming : (explanation.atAGlance?.riskAndTiming || englishAtAGlance.riskAndTiming)}
                </p>

                {summaryMode === 'bilingual' && currentLanguage !== 'en' && (
                  <div className="mt-2.5 p-2.5 rounded-lg bg-white border border-[#D6CEC2] text-xs text-[#363B39]">
                    <span className="font-bold text-[#1E3A34] mr-1.5">🇺🇸 English Original:</span>
                    <span>{englishAtAGlance.riskAndTiming}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. CONFUSING TERMS IN THIS LETTER (GLOSSARY CHIPS) */}
      {explanation.glossaryTerms && explanation.glossaryTerms.length > 0 && (
        <div className="p-6 sm:p-7 rounded-2xl bg-[#FFFFFF] border-1.5 border-[#D6CEC2] shadow-xs text-left">
          <div className="flex items-center gap-2 mb-2">
            <HelpCircle className="w-5 h-5 text-[#C05621]" />
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#1E3A34]">
              {ui.confusingTermsTitle}
            </h3>
          </div>
          <p className="text-[16px] text-[#414846] mb-5">
            {ui.confusingTermsSub}
          </p>

          <div className="flex flex-wrap gap-2.5">
            {explanation.glossaryTerms.map((item, idx) => {
              const isExpanded = Boolean(expandedTerms[item.term]);
              return (
                <div key={idx} className="flex flex-col max-w-full">
                  <button
                    type="button"
                    onClick={() => toggleTerm(item.term)}
                    aria-expanded={isExpanded}
                    className={`min-h-[46px] px-4 py-2 rounded-xl text-[16px] font-bold flex items-center gap-2 border transition-all cursor-pointer ${
                      isExpanded
                        ? 'bg-[#1E3A34] text-white border-[#1E3A34]'
                        : 'bg-[#F5F3EF] hover:bg-white text-[#1E3A34] border-[#D6CEC2]'
                    }`}
                  >
                    <span>{item.term}</span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-white" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-[#727976]" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="mt-2 p-4 rounded-xl bg-[#FEF7F2] border-1.5 border-[#C05621] text-[16px] text-[#1B1C1A] leading-relaxed max-w-lg shadow-xs animate-in fade-in duration-150">
                      <p className="font-bold text-[#C05621] text-xs uppercase tracking-wider mb-1">
                        {ui.plainMeaning}
                      </p>
                      <p>{item.definition}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. WHAT TO DO NEXT (ROADMAP WITH CHECKBOXES) */}
      {explanation.nextSteps && explanation.nextSteps.length > 0 && (
        <div id="next-steps-roadmap" className="p-6 sm:p-8 rounded-2xl bg-[#FFFFFF] border-1.5 border-[#D6CEC2] shadow-xs text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D6CEC2] pb-4 mb-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#414846]">
                {ui.roadmapSub}
              </p>
              <h3 className="font-serif text-2xl font-bold text-[#1E3A34]">
                {ui.whatToDoNextTitle} ({explanation.nextSteps.length} Steps)
              </h3>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Listen to all next steps in selected language voice */}
              <button
                type="button"
                onClick={() => {
                  if (currentlyReadingStep === 'all') {
                    narrator.stop();
                    setCurrentlyReadingStep(null);
                  } else {
                    setCurrentlyReadingStep('all');
                    const stepsAudio = explanation.nextSteps
                      .map((s, i) => `${s.title}. ${s.detail || ''}`)
                      .join(' ');
                    const voiceLang = summaryMode === 'english' ? 'en-US' : currentLangObj.speechLang;
                    narrator.speak(stepsAudio, audioSpeed, voiceLang);
                  }
                }}
                className={`min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all cursor-pointer ${
                  currentlyReadingStep === 'all'
                    ? 'bg-[#1E3A34] text-white border-[#1E3A34]'
                    : 'bg-[#F5F3EF] hover:bg-[#EBF2EE] text-[#1E3A34] border-[#1E3A34]'
                }`}
              >
                {currentlyReadingStep === 'all' ? (
                  <>
                    <VolumeX className="w-4 h-4 text-[#ffdad6]" />
                    <span>Stop Reading Steps</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4 text-[#1E3A34]" />
                    <span>Listen to all steps ({currentLangObj.flag} {currentLangObj.nativeName})</span>
                  </>
                )}
              </button>

              <span className="text-sm font-bold text-[#1E3A34] bg-[#EFEEEA] px-3 py-1.5 rounded-full border border-[#D6CEC2]">
                {completedCount} {ui.doneOf} {totalSteps}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {explanation.nextSteps.map((step, idx) => {
              const isChecked = Boolean(completedSteps[idx]);
              const isUrgent = step.mostUrgent;
              const isStepSpeaking = currentlyReadingStep === idx;

              return (
                <div
                  key={idx}
                  className={`p-5 rounded-xl border-2 transition-all flex items-start gap-4 ${
                    isUrgent
                      ? 'border-[#C05621] bg-[#FEF7F2]'
                      : isChecked
                      ? 'border-[#D6CEC2] bg-[#F5F3EF]/60 opacity-85'
                      : 'border-[#D6CEC2] bg-[#FFFFFF] hover:border-[#1E3A34]'
                  }`}
                >
                  {/* Interactive Checkbox */}
                  <button
                    type="button"
                    onClick={() => toggleStep(idx)}
                    aria-label={`Mark step ${idx + 1} as ${isChecked ? 'incomplete' : 'complete'}`}
                    className="mt-0.5 w-7 h-7 rounded-lg border-2 border-[#1E3A34] flex items-center justify-center cursor-pointer transition-colors bg-white shrink-0"
                  >
                    {isChecked ? (
                      <Check className="w-5 h-5 text-white bg-[#1E3A34] rounded-sm p-0.5" />
                    ) : (
                      <span className="w-3 h-3" />
                    )}
                  </button>

                  {/* Step Content */}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      {isUrgent && (
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#C05621] text-white uppercase tracking-wider">
                          {ui.mostImportantBadge}
                        </span>
                      )}
                      {isUrgent && (
                        <span className="text-xs font-semibold text-[#C05621]">
                          {ui.timeEstimate}
                        </span>
                      )}
                      <h4
                        className={`font-serif text-[18px] sm:text-[19px] font-bold ${
                          isChecked ? 'line-through text-[#727976]' : 'text-[#1B1C1A]'
                        }`}
                      >
                        {step.title}
                      </h4>
                    </div>

                    <p
                      className={`text-[17px] sm:text-[18px] leading-relaxed ${
                        isChecked ? 'text-[#727976]' : 'text-[#414846]'
                      }`}
                    >
                      {step.detail}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      {/* Individual step audio narrator in user's selected language */}
                      <button
                        type="button"
                        onClick={() => {
                          if (isStepSpeaking) {
                            narrator.stop();
                            setCurrentlyReadingStep(null);
                          } else {
                            setCurrentlyReadingStep(idx);
                            const stepText = `${step.title}. ${step.detail || ''}`;
                            const voiceLang = summaryMode === 'english' ? 'en-US' : currentLangObj.speechLang;
                            narrator.speak(stepText, audioSpeed, voiceLang);
                          }
                        }}
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg border flex items-center gap-1.5 cursor-pointer transition-colors ${
                          isStepSpeaking
                            ? 'bg-[#1E3A34] text-white border-[#1E3A34]'
                            : 'bg-white hover:bg-[#F5F3EF] text-[#1E3A34] border-[#D6CEC2]'
                        }`}
                      >
                        {isStepSpeaking ? (
                          <>
                            <VolumeX className="w-3.5 h-3.5 text-[#ffdad6]" />
                            <span>Stop voice</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3.5 h-3.5 text-[#1E3A34]" />
                            <span>Listen to step ({currentLangObj.flag} {currentLangObj.nativeName})</span>
                          </>
                        )}
                      </button>

                      {isUrgent && (
                        <a
                          href="#ready-scripts"
                          className="text-sm font-bold text-[#1E3A34] hover:text-[#0F2942] underline flex items-center gap-1"
                        >
                          <span>{ui.jumpToScript}</span>
                          <span aria-hidden="true">&rarr;</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 6. READY-TO-USE SCRIPTS & LETTERS */}
      {explanation.callScript && (
        <div
          id="ready-scripts"
          className="p-6 sm:p-8 rounded-2xl bg-[#FFFFFF] border-1.5 border-[#D6CEC2] shadow-xs text-left"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D6CEC2] pb-4 mb-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#C05621]">
                {ui.noAwkwardCalls}
              </p>
              <h3 className="font-serif text-2xl font-bold text-[#1E3A34]">
                {ui.readyScriptsTitle}
              </h3>
            </div>

            {/* Script tabs: Phone Script vs Written Dispute */}
            <div className="flex items-center gap-1 bg-[#EFEEEA] p-1 rounded-xl border border-[#D6CEC2]">
              <button
                type="button"
                onClick={() => setActiveScriptTab('phone')}
                className={`min-h-[42px] px-4 py-1.5 rounded-lg text-[15px] font-bold transition-all cursor-pointer ${
                  activeScriptTab === 'phone'
                    ? 'bg-[#1E3A34] text-white shadow-xs'
                    : 'text-[#1B1C1A] hover:bg-white'
                }`}
              >
                {ui.phoneScriptTab}
              </button>
              <button
                type="button"
                onClick={() => setActiveScriptTab('written')}
                className={`min-h-[42px] px-4 py-1.5 rounded-lg text-[15px] font-bold transition-all cursor-pointer ${
                  activeScriptTab === 'written'
                    ? 'bg-[#1E3A34] text-white shadow-xs'
                    : 'text-[#1B1C1A] hover:bg-white'
                }`}
              >
                {ui.writtenDisputeTab}
              </button>
            </div>
          </div>

          {/* If language is not English and viewing phone script: provide script toggle (Native vs English to read aloud) */}
          {currentLanguage !== 'en' && activeScriptTab === 'phone' && (
            <div className="mb-4 flex items-center justify-between flex-wrap gap-2 p-3 bg-[#EFEEEA] rounded-xl border border-[#D6CEC2]">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#1E3A34]" />
                <span className="text-xs font-bold text-[#1B1C1A]">
                  Choose Script Version:
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setScriptViewMode('translated')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    scriptViewMode === 'translated'
                      ? 'bg-[#1E3A34] text-white'
                      : 'bg-white text-[#1B1C1A] hover:bg-[#F5F3EF]'
                  }`}
                >
                  In {currentLangObj.nativeName} (For Understanding)
                </button>
                <button
                  type="button"
                  onClick={() => setScriptViewMode('english')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    scriptViewMode === 'english'
                      ? 'bg-[#1E3A34] text-white'
                      : 'bg-white text-[#1B1C1A] hover:bg-[#F5F3EF]'
                  }`}
                >
                  In English (To Read to Office Staff)
                </button>
              </div>
            </div>
          )}

          {/* Word-for-Word Quote Box */}
          <div className="p-6 rounded-2xl bg-[#FBF9F5] border-1.5 border-[#D6CEC2] relative">
            <p className="text-xs font-bold uppercase tracking-wider text-[#414846] mb-3 flex items-center gap-1.5">
              <Phone className="w-4 h-4 text-[#1E3A34]" />
              <span>
                {activeScriptTab === 'phone'
                  ? currentLanguage !== 'en' && scriptViewMode === 'english'
                    ? 'Read this word-for-word in English to the office secretary:'
                    : `Read this script in ${currentLangObj.nativeName}:`
                  : 'Copy or mail this formal written dispute letter:'}
              </span>
            </p>

            <div className="font-serif text-[18px] sm:text-[19px] leading-[1.7] text-[#1B1C1A] whitespace-pre-line bg-white p-5 rounded-xl border border-[#D6CEC2] shadow-2xs">
              {activeScriptTab === 'phone'
                ? currentLanguage !== 'en' && scriptViewMode === 'english'
                  ? englishCallScript
                  : explanation.callScript
                : getWrittenDisputeLetter(explanation, currentDocument)}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleCopyScript}
              className="min-h-[52px] px-6 py-2.5 rounded-lg bg-[#1E3A34] text-white font-bold text-[16px] hover:bg-[#142723] flex items-center gap-2 cursor-pointer shadow-xs"
            >
              {hasCopied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>{ui.scriptCopied}</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>{ui.copyScript}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handlePrintScript}
              className="min-h-[52px] px-6 py-2.5 rounded-lg bg-[#EFEEEA] border-1.5 border-[#1E3A34] text-[#1E3A34] font-bold text-[16px] hover:bg-white flex items-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>{ui.printScript}</span>
            </button>
          </div>
        </div>
      )}

      {/* 7. CONNECT WITH A REAL ADVOCATE CARD (MOCK ADVOCATE PROFILE) */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#EFEEEA] border-1.5 border-[#D6CEC2] shadow-xs text-left flex flex-col md:flex-row items-center gap-6">
        {/* Advocate Photo & Badge */}
        <div className="relative shrink-0 text-center">
          <img
            src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80"
            alt="Sarah Jenkins, RN — DigiSathi Care Advocate"
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-3 border-[#1E3A34] shadow-sm"
          />
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[#1E3A34] text-white text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>On Duty</span>
          </div>
        </div>

        {/* Info & Value Proposition */}
        <div className="flex-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#C05621]">
              {ui.realAdvocateSubtitle}
            </span>
          </div>
          <h3 className="font-serif text-2xl font-bold text-[#1E3A34] mb-2">
            {ui.realAdvocateTitle}
          </h3>
          <p className="text-[17px] sm:text-[18px] text-[#414846] leading-relaxed max-w-xl">
            {ui.realAdvocateDesc}
          </p>

          <p className="text-xs text-[#727976] mt-2 italic">
            Demo advocate line — for prototype purposes only.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5 w-full md:w-auto shrink-0">
          <a
            href="tel:18005552273"
            className="min-h-[56px] px-6 py-3 rounded-xl bg-[#1E3A34] text-white font-bold text-[17px] hover:bg-[#142723] flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
          >
            <Phone className="w-5 h-5 text-emerald-400" />
            <span>{ui.callAdvocateBtn}</span>
          </a>

          <button
            type="button"
            onClick={() => setIsScheduleModalOpen(true)}
            className="min-h-[48px] px-5 py-2.5 rounded-xl bg-white border border-[#D6CEC2] text-[#1E3A34] font-bold text-[15px] hover:bg-[#F5F3EF] flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <Calendar className="w-4 h-4 text-[#C05621]" />
            <span>{ui.scheduleQuietBtn}</span>
          </button>
        </div>
      </div>

      {/* 8. TRUSTED SENIOR HELPLINES & EMERGENCY CONTACTS (ALWAYS VISIBLE) */}
      <div
        id="senior-helplines"
        className="p-6 sm:p-8 rounded-2xl bg-[#FFFFFF] border-1.5 border-[#D6CEC2] shadow-xs text-left"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#D6CEC2] pb-4 mb-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#C05621]">
              Official National Senior Support
            </p>
            <h3 className="font-serif text-2xl font-bold text-[#1E3A34]">
              {ui.seniorHelplinesTitle}
            </h3>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#EFEEEA] text-[#1E3A34] border border-[#D6CEC2]">
            Toll-Free &amp; Verified
          </span>
        </div>

        <p className="text-[17px] text-[#414846] mb-6 leading-relaxed">
          {ui.seniorHelplinesSub}
        </p>

        {/* 3 Helpline Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Elderline - 14567 */}
          <div className="p-5 rounded-xl bg-[#FBF9F5] border-1.5 border-[#D6CEC2] hover:border-[#1E3A34] flex flex-col justify-between transition-all">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#1E3A34] text-white">
                  Elderline
                </span>
                <span className="text-xs text-[#414846] font-semibold">National</span>
              </div>
              <h4 className="font-serif text-2xl font-bold text-[#1E3A34] my-1">
                14567
              </h4>
              <p className="text-xs font-bold text-[#C05621] mb-1">
                Ministry of Social Justice &amp; Empowerment
              </p>
              <p className="text-[14px] text-[#414846] leading-normal">
                Toll-free Pan-India helpline for senior citizens. Daily 8:00 AM – 8:00 PM for elder
                care, abuse grievances, and welfare.
              </p>
            </div>

            <a
              href="tel:14567"
              className="mt-4 min-h-[46px] w-full px-4 py-2 rounded-lg bg-[#1E3A34] text-white font-bold text-[15px] hover:bg-[#142723] flex items-center justify-center gap-2 cursor-pointer"
            >
              <Phone className="w-4 h-4" />
              <span>Call Elderline 14567</span>
            </a>
          </div>

          {/* HelpAge India - 1800-180-1253 */}
          <div className="p-5 rounded-xl bg-[#FBF9F5] border-1.5 border-[#D6CEC2] hover:border-[#0F2942] flex flex-col justify-between transition-all">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#0F2942] text-white">
                  HelpAge India
                </span>
                <span className="text-xs text-[#414846] font-semibold">Toll-Free</span>
              </div>
              <h4 className="font-serif text-2xl font-bold text-[#0F2942] my-1">
                1800-180-1253
              </h4>
              <p className="text-xs font-bold text-[#0F2942] mb-1">
                National Elder Care Helpline
              </p>
              <p className="text-[14px] text-[#414846] leading-normal">
                Active across 15+ states for elderly care support, emergency rescue, counseling,
                healthcare, and legal aid assistance.
              </p>
            </div>

            <a
              href="tel:18001801253"
              className="mt-4 min-h-[46px] w-full px-4 py-2 rounded-lg bg-[#0F2942] text-white font-bold text-[15px] hover:bg-[#071828] flex items-center justify-center gap-2 cursor-pointer"
            >
              <Phone className="w-4 h-4" />
              <span>Call 1800-180-1253</span>
            </a>
          </div>

          {/* Emergency - 112 */}
          <div className="p-5 rounded-xl bg-[#FEF7F2] border-1.5 border-[#BA1A1A] flex flex-col justify-between transition-all">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#BA1A1A] text-white">
                  Emergency
                </span>
                <span className="text-xs text-[#BA1A1A] font-semibold">24/7 Available</span>
              </div>
              <h4 className="font-serif text-2xl font-bold text-[#BA1A1A] my-1">
                112
              </h4>
              <p className="text-xs font-bold text-[#BA1A1A] mb-1">
                National Emergency Helpline
              </p>
              <p className="text-[14px] text-[#414846] leading-normal">
                All-in-one general emergency number for immediate ambulance, police, medical crisis,
                or urgent rescue assistance.
              </p>
            </div>

            <a
              href="tel:112"
              className="mt-4 min-h-[46px] w-full px-4 py-2 rounded-lg bg-[#BA1A1A] text-white font-bold text-[15px] hover:bg-[#93000A] flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <Phone className="w-4 h-4" />
              <span>Emergency Dial 112</span>
            </a>
          </div>
        </div>
      </div>

      {/* Schedule Callback Modal */}
      <ScheduleCallbackModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        documentTitle={explanation.documentType}
      />
    </div>
  );
};

function getWrittenDisputeLetter(explanation: ExplanationResult, doc?: SampleDocument | null) {
  return `To: Billing Coordinator / Patient Financial Services
Re: Formal Request for Claim Resubmission & Clarification
Beneficiary / Patient Name: Margaret E. Miller
Account / Claim #: #8839201-B
Date of Notice: November 14, 2024

Dear Billing Department,

I am writing regarding the recent notice for service date October 12, 2024. 

The Medicare Summary Notice indicates that reimbursement was temporarily denied under remark code PR-204 because clinical chart notes or routine pre-approval records were not attached at initial adjudication.

As this is a routine administrative requirement, I kindly request that your office review the visit notes from Dr. Robert Chen, attach the necessary clinical documentation, and resubmit this claim under code 99214 to Medicare on my behalf.

Please place a temporary 30-day hold on this account balance while this corrected claim is processed, and send written confirmation once the claim has been resubmitted.

Thank you for your patient assistance,
Margaret E. Miller
Phone: (555) 019-2849`;
}
