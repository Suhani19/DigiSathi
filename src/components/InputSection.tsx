import React, { useState, useRef } from 'react';
import {
  Upload,
  Mic,
  Type,
  FileText,
  Camera,
  ShieldCheck,
  FileCheck,
  Layers,
  Sparkles,
  Globe,
  ArrowRight,
  Languages,
  Plus
} from 'lucide-react';
import { VoiceAgentTab } from './VoiceAgentTab';
import { CameraCaptureModal } from './CameraCaptureModal';
import { SampleDocument } from '../types';
import { SAMPLE_DOCUMENTS } from '../data/sampleDocuments';
import { SUPPORTED_LANGUAGES, INPUT_LANGUAGES, LanguageOption } from '../data/languages';

interface InputSectionProps {
  onAnalyzeText: (text: string, inputLanguage?: string) => void;
  onAnalyzeImage: (base64: string, mime: string, inputLanguage?: string) => void;
  onSelectSample: (sample: SampleDocument) => void;
  activeSampleId: string | null;
  isProcessing: boolean;
  currentLanguage: string;
  onSelectLanguage: (langCode: string) => void;
  availableLanguages?: LanguageOption[];
  onOpenAddLanguage?: () => void;
}

const MULTILINGUAL_SNIPPETS = [
  {
    id: 'medicare-en',
    title: 'Medicare Notice (English)',
    lang: 'English',
    inputCode: 'en',
    text: `DEPARTMENT OF HEALTH & HUMAN SERVICES
Part B Medicare Summary Notice - Form CMS-10156
Beneficiary Name: MARGARET E. MILLER
Claim Control Reference: #8839201-B | Provider: DR. ROBERT CHEN, MD
Prior authorization criteria under Section 1862(a)(1)(A) were not satisfied for Service Code 99214 on 10/12/2024.
Reason code citation: Remittance Advice Remark Code PR-204.
Balance Due From Beneficiary: $482.50`
  },
  {
    id: 'hospital-hi',
    title: 'अस्पताल बिल (Hindi)',
    lang: 'Hindi',
    inputCode: 'hi',
    text: `अखिल भारतीय आयुर्विज्ञान संस्थान (AIIMS) / स्वास्थ्य सेवा नोटिस
रोगी का नाम: रामेश्वर शर्मा | यूएचआईडी: 2024-8849-ND
सूचना की तारीख: 12 नवंबर 2024
सेवा: बाह्य रोगी परामर्श (OPD Level 3)
अस्वीकृति कारण: कोड PR-204 — पूर्व-प्राधिकरण और डॉक्टर के क्लिनिकल नोट्स संलग्न नहीं थे।
कुल बिल राशि: ₹12,450.00
बीमा द्वारा स्वीकृत: ₹0.00
रोगी द्वारा देय प्रारंभिक राशि: ₹12,450.00
टिप्पणी: कृपया 30 दिनों के भीतर अस्पताल बिलिंग काउंटर पर संपर्क करें।`
  },
  {
    id: 'clinica-es',
    title: 'Aviso Médico (Spanish)',
    lang: 'Spanish',
    inputCode: 'es',
    text: `CENTRO MÉDICO SAN RAFAEL
AVISO DE RESUMEN DE BENEFICIOS Y FACTURACIÓN
Nombre del Paciente: Carlos Mendoza | ID: #98321-ES
Fecha: 15 de Noviembre de 2024
Proveedor: Dr. Alejandro Ramos
Motivo: Código 99214 — Falta de autorización previa y notas clínicas del médico.
Total Facturado: $385.00
Aprobado por el seguro: $0.00
Saldo pendiente del paciente: $385.00
Acción requerida: Llame a la oficina de facturación antes del 15 de Diciembre para reenviar el expediente.`
  }
];

export const InputSection: React.FC<InputSectionProps> = ({
  onAnalyzeText,
  onAnalyzeImage,
  onSelectSample,
  activeSampleId,
  isProcessing,
  currentLanguage,
  onSelectLanguage,
  availableLanguages,
  onOpenAddLanguage
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'voice' | 'text'>('upload');
  const [pastedText, setPastedText] = useState('');
  const [inputLanguage, setInputLanguage] = useState<string>('auto');
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const langList = availableLanguages && availableLanguages.length > 0 ? availableLanguages : SUPPORTED_LANGUAGES;
  const currentLangObj =
    langList.find((l) => l.code === currentLanguage) || langList[0];
  const inputLangObj =
    INPUT_LANGUAGES.find((l) => l.code === inputLanguage) || INPUT_LANGUAGES[0];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      onAnalyzeImage(result, file.type || 'image/jpeg', inputLangObj.name);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pastedText.trim().length > 10) {
      onAnalyzeText(pastedText, inputLangObj.name);
    }
  };

  return (
    <section className="mb-8">
      {/* Container Card */}
      <div className="bg-[#FFFFFF] border-1.5 border-[#D6CEC2] rounded-2xl shadow-xs overflow-hidden">
        {/* Multilingual Pairing Banner */}
        <div className="bg-[#1E3A34] text-white px-4 sm:px-6 py-3 border-b border-[#2D5A4C] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Languages className="w-5 h-5 text-[#E6A070]" />
            <span className="text-sm font-bold tracking-wide">
              Multilingual Input &amp; Output Setup:
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm">
            {/* Input Language Selector */}
            <div className="flex items-center gap-1.5 bg-[#142723] px-3 py-1.5 rounded-lg border border-[#2D5A4C]">
              <span className="text-[#A4B3AF] font-medium">Input Document:</span>
              <select
                id="select-input-language"
                aria-label="Select Input Document Language"
                value={inputLanguage}
                onChange={(e) => setInputLanguage(e.target.value)}
                className="bg-transparent text-white font-bold cursor-pointer outline-hidden pr-2"
              >
                {INPUT_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code} className="bg-[#1E3A34] text-white">
                    {lang.flag} {lang.nativeName}
                  </option>
                ))}
              </select>
            </div>

            <ArrowRight className="w-4 h-4 text-[#A4B3AF] hidden sm:inline" />

            {/* Output Language Selector */}
            <div className="flex items-center gap-1.5 bg-[#142723] px-3 py-1.5 rounded-lg border border-[#2D5A4C]">
              <span className="text-[#A4B3AF] font-medium">Explain &amp; Next Steps in:</span>
              <select
                id="select-output-language"
                aria-label="Select Output Language"
                value={currentLanguage}
                onChange={(e) => onSelectLanguage(e.target.value)}
                className="bg-transparent text-[#FFE4D6] font-bold cursor-pointer outline-hidden pr-2"
              >
                {langList.map((lang) => (
                  <option key={lang.code} value={lang.code} className="bg-[#1E3A34] text-white">
                    {lang.flag} {lang.nativeName} ({lang.name})
                  </option>
                ))}
              </select>

              {onOpenAddLanguage && (
                <button
                  type="button"
                  onClick={onOpenAddLanguage}
                  title="Add language used by you"
                  className="ml-1 px-2 py-1 rounded bg-[#2D5A4C] hover:bg-[#3D7462] text-white text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  <span className="hidden sm:inline">Add Language</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Header Tab Bar */}
        <div className="p-4 sm:p-5 border-b border-[#D6CEC2] bg-[#F5F3EF]">
          <p className="text-xs font-bold uppercase tracking-wider text-[#414846] mb-2">
            Choose how you'd like to share
          </p>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1E3A34]">
              How would you like DigiSathi to examine your letter?
            </h2>

            {/* 3 Main Tabs */}
            <div
              role="tablist"
              aria-label="Input options"
              className="flex items-center gap-1.5 bg-[#EFEEEA] p-1.5 rounded-xl border border-[#D6CEC2] overflow-x-auto"
            >
              <button
                role="tab"
                id="tab-upload"
                aria-selected={activeTab === 'upload'}
                type="button"
                onClick={() => setActiveTab('upload')}
                className={`min-h-[46px] px-3.5 py-2 rounded-lg font-semibold text-[15px] flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'upload'
                    ? 'bg-[#1E3A34] text-white shadow-xs'
                    : 'text-[#1B1C1A] hover:bg-white'
                }`}
              >
                <Upload className="w-4 h-4" />
                <span>Upload Document</span>
              </button>

              <button
                role="tab"
                id="tab-voice"
                aria-selected={activeTab === 'voice'}
                type="button"
                onClick={() => setActiveTab('voice')}
                className={`min-h-[46px] px-3.5 py-2 rounded-lg font-semibold text-[15px] flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'voice'
                    ? 'bg-[#1E3A34] text-white shadow-xs'
                    : 'text-[#1B1C1A] hover:bg-white'
                }`}
              >
                <Mic className="w-4 h-4" />
                <span>Speak with Voice Agent</span>
              </button>

              <button
                role="tab"
                id="tab-text"
                aria-selected={activeTab === 'text'}
                type="button"
                onClick={() => setActiveTab('text')}
                className={`min-h-[46px] px-3.5 py-2 rounded-lg font-semibold text-[15px] flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'text'
                    ? 'bg-[#1E3A34] text-white shadow-xs'
                    : 'text-[#1B1C1A] hover:bg-white'
                }`}
              >
                <Type className="w-4 h-4" />
                <span>Type or Paste Text</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab Content Panels */}
        <div className="p-6 sm:p-8">
          {/* TAB 1: UPLOAD DOCUMENT */}
          {activeTab === 'upload' && (
            <div className="space-y-6">
              {/* Large Dashed Drop Zone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-8 sm:p-12 text-center transition-colors flex flex-col items-center justify-center ${
                  isDragOver
                    ? 'border-[#1E3A34] bg-[#F5F3EF]'
                    : 'border-[#2D5A4C]/40 bg-[#FBF9F5] hover:border-[#1E3A34]'
                }`}
              >
                {/* Scanner / Camera graphic */}
                <div className="w-16 h-16 rounded-2xl bg-[#EFEEEA] border border-[#D6CEC2] flex items-center justify-center mb-4 text-[#1E3A34]">
                  <FileText className="w-8 h-8 stroke-[1.5]" />
                </div>

                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#1E3A34] mb-2">
                  Drag &amp; drop your letter or bill here
                </h3>
                <p className="text-[17px] text-[#414846] max-w-lg mb-4 leading-relaxed">
                  Take a cell phone photo of the paper, upload a scanned PDF, or choose a file from your
                  computer or tablet.
                </p>

                {/* Multilingual Active Language Indicator Pill */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EFEEEA] border border-[#D6CEC2] text-xs font-semibold text-[#1E3A34] mb-6">
                  <span>Input: <strong>{inputLangObj.nativeName}</strong></span>
                  <span className="text-[#A4B3AF]">•</span>
                  <span>Output: <strong>{currentLangObj.flag} {currentLangObj.nativeName}</strong></span>
                </div>

                {/* Primary Action Buttons */}
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*,application/pdf"
                    className="hidden"
                    id="file-upload-input"
                  />
                  <button
                    id="btn-browse-files"
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isProcessing}
                    className="min-h-[56px] px-7 py-3 rounded-lg bg-[#1E3A34] text-white font-bold text-[18px] hover:bg-[#142723] flex items-center gap-2.5 cursor-pointer shadow-xs"
                  >
                    <Upload className="w-5 h-5" />
                    <span>Browse Files</span>
                  </button>

                  <button
                    id="btn-take-photo"
                    type="button"
                    onClick={() => setIsCameraOpen(true)}
                    disabled={isProcessing}
                    className="min-h-[56px] px-6 py-3 rounded-lg bg-[#EFEEEA] border-1.5 border-[#1E3A34] text-[#1E3A34] font-bold text-[18px] hover:bg-white flex items-center gap-2.5 cursor-pointer"
                  >
                    <Camera className="w-5 h-5" />
                    <span>Take Photo with Camera</span>
                  </button>
                </div>

                {/* Trust Badges */}
                <div className="mt-8 pt-6 border-t border-[#D6CEC2]/60 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-[14px] text-[#414846] font-medium">
                  <span className="flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4 text-[#1E3A34]" />
                    PDF, JPG, PNG supported
                  </span>
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#1E3A34]" />
                    100% Private &amp; HIPAA Secure
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-[#1E3A34]" />
                    Multi-page documents supported
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: VOICE AGENT */}
          {activeTab === 'voice' && (
            <VoiceAgentTab
              onTranscriptReady={(transcript) => onAnalyzeText(transcript, inputLangObj.name)}
              isProcessing={isProcessing}
              currentLanguage={currentLanguage}
            />
          )}

          {/* TAB 3: TYPE OR PASTE TEXT */}
          {activeTab === 'text' && (
            <form onSubmit={handleTextSubmit} className="space-y-4">
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <label
                    htmlFor="paste-letter-textarea"
                    className="block text-[17px] font-bold text-[#1E3A34]"
                  >
                    Paste the text or letter contents here:
                  </label>
                  <div className="text-xs font-semibold text-[#414846] flex items-center gap-2 bg-[#F5F3EF] px-2.5 py-1 rounded-md border border-[#D6CEC2]">
                    <span>Input: {inputLangObj.nativeName}</span>
                    <span>→</span>
                    <span>Output: {currentLangObj.nativeName}</span>
                  </div>
                </div>

                <textarea
                  id="paste-letter-textarea"
                  rows={6}
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  placeholder={`Paste any confusing Medicare notice, clinic bill, bank letter, or government form text in ${inputLangObj.name}, English, Hindi, Spanish, etc. DigiSathi will read it and generate clear next steps in ${currentLangObj.nativeName}.`}
                  className="w-full p-4 rounded-xl border-1.5 border-[#D6CEC2] bg-[#FBF9F5] text-[#1B1C1A] text-[18px] leading-relaxed focus:border-[#1E3A34] focus:bg-white resize-y min-h-[160px]"
                />
                <div className="flex items-center justify-between text-sm text-[#414846] mt-1.5">
                  <span>Minimum 10 characters</span>
                  <span>{pastedText.length} characters</span>
                </div>
              </div>

              {/* Multilingual Quick Paste Snippets */}
              <div className="p-4 rounded-xl bg-[#F5F3EF] border border-[#D6CEC2] space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#414846]">
                    Quick Multilingual Test Samples:
                  </p>
                  <span className="text-xs text-[#727976]">Tap any to load test document</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {MULTILINGUAL_SNIPPETS.map((snippet) => (
                    <button
                      key={snippet.id}
                      type="button"
                      onClick={() => {
                        setPastedText(snippet.text);
                        setInputLanguage(snippet.inputCode);
                      }}
                      className="px-3.5 py-1.5 rounded-lg bg-white border border-[#D6CEC2] text-[14px] font-semibold text-[#1E3A34] hover:bg-[#EFEEEA] transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5 text-[#C05621]" />
                      <span>{snippet.title}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Fast Sample Loader Buttons inside Paste Tab */}
              <div className="p-4 rounded-xl bg-[#F5F3EF] border border-[#D6CEC2]">
                <p className="text-xs font-bold uppercase tracking-wider text-[#414846] mb-2">
                  Or load official sample documents:
                </p>
                <div className="flex flex-wrap gap-2">
                  {SAMPLE_DOCUMENTS.map((sample) => (
                    <button
                      key={sample.id}
                      type="button"
                      onClick={() => {
                        setPastedText(sample.originalText);
                        onSelectSample(sample);
                      }}
                      className="px-3.5 py-2 rounded-lg bg-white border border-[#D6CEC2] text-[15px] font-semibold text-[#1E3A34] hover:bg-[#EFEEEA] transition-colors cursor-pointer"
                    >
                      {sample.title}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  id="btn-analyze-pasted-text"
                  type="submit"
                  disabled={isProcessing || pastedText.trim().length < 10}
                  className="min-h-[56px] px-8 py-3 rounded-lg bg-[#1E3A34] text-white font-bold text-[18px] hover:bg-[#142723] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <Sparkles className="w-5 h-5 text-[#E6A070]" />
                  <span>
                    {isProcessing
                      ? 'DigiSathi is Reading...'
                      : `Explain Document in ${currentLangObj.nativeName}`}
                  </span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Currently Viewing Sample Selector Bar (Matching Image 4) */}
        <div className="px-4 sm:px-6 py-3.5 bg-[#F5F3EF] border-t border-[#D6CEC2] flex flex-wrap items-center justify-between gap-3 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[14px] font-bold text-[#414846]">
              Currently Viewing Sample:
            </span>

            {SAMPLE_DOCUMENTS.map((sample) => {
              const isSelected = activeSampleId === sample.id;
              return (
                <button
                  key={sample.id}
                  type="button"
                  onClick={() => onSelectSample(sample)}
                  aria-pressed={isSelected}
                  className={`min-h-[40px] px-3.5 py-1.5 rounded-lg text-[14px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#1E3A34] text-white shadow-xs'
                      : 'bg-white text-[#1B1C1A] border border-[#D6CEC2] hover:bg-[#EFEEEA]'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{sample.shortLabel}</span>
                  {isSelected && (
                    <span className="text-[11px] px-1.5 py-0.5 rounded-md bg-white/20 text-white font-medium ml-1">
                      Sample Loaded
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => {
              setActiveTab('upload');
              fileInputRef.current?.click();
            }}
            className="min-h-[40px] px-3 py-1.5 rounded-lg bg-white border border-[#D6CEC2] text-[14px] font-bold text-[#0F2942] hover:bg-[#EFEEEA] flex items-center gap-1.5 cursor-pointer ml-auto"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>+ Upload or Paste New Document</span>
          </button>
        </div>
      </div>

      {/* Camera Capture Modal */}
      <CameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onPhotoCaptured={(base64) => onAnalyzeImage(base64, 'image/jpeg', inputLangObj.name)}
      />
    </section>
  );
};
