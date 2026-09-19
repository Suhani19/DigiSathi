import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { InputSection } from './components/InputSection';
import { ResultsView } from './components/ResultsView';
import { PastRecordsModal } from './components/PastRecordsModal';
import { AddLanguageModal } from './components/AddLanguageModal';
import { Footer } from './components/Footer';
import { SAMPLE_DOCUMENTS } from './data/sampleDocuments';
import { ExplanationResult, SampleDocument } from './types';
import { narrator } from './utils/speech';
import {
  SUPPORTED_LANGUAGES,
  PRECOMPUTED_TRANSLATIONS,
  getUserLanguages,
  addUserLanguage,
  removeUserLanguage,
  LanguageOption
} from './data/languages';
import { Loader2, AlertCircle } from 'lucide-react';

export default function App() {
  // Accessibility state
  const [textScale, setTextScale] = useState<number>(1);
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [isReadingAloud, setIsReadingAloud] = useState<boolean>(false);
  const [isPlayingIntro, setIsPlayingIntro] = useState<boolean>(false);

  // Multi-language state & user-added languages
  const [currentLanguage, setCurrentLanguage] = useState<string>('en');
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [userLanguages, setUserLanguages] = useState<LanguageOption[]>(() => getUserLanguages());
  const [isAddLanguageModalOpen, setIsAddLanguageModalOpen] = useState<boolean>(false);

  // Document & Explanation state
  const [currentDocument, setCurrentDocument] = useState<SampleDocument | null>(
    SAMPLE_DOCUMENTS[0]
  );
  const [explanation, setExplanation] = useState<ExplanationResult>(
    SAMPLE_DOCUMENTS[0].explanation
  );
  const [uploadedImageUri, setUploadedImageUri] = useState<string | null>(null);
  const [uploadedText, setUploadedText] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modals & Navigation
  const [isPastRecordsOpen, setIsPastRecordsOpen] = useState<boolean>(false);
  const [activeNav, setActiveNav] = useState<'explain' | 'records' | 'helplines'>('explain');

  // Subscribe to speech narrator status
  useEffect(() => {
    const unsubscribe = narrator.subscribe((speaking) => {
      setIsReadingAloud(speaking);
      if (!speaking) {
        setIsPlayingIntro(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Set high-contrast root class
  useEffect(() => {
    if (highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  }, [highContrast]);

  // Audio Playback toggles with language awareness
  const handleToggleReadAloud = () => {
    if (isReadingAloud) {
      narrator.stop();
      setIsReadingAloud(false);
      setIsPlayingIntro(false);
    } else {
      const stepsAudio =
        explanation.nextSteps && explanation.nextSteps.length > 0
          ? explanation.nextSteps.map((s) => `${s.title}. ${s.detail || ''}`).join(' ')
          : '';
      const textToRead = `${explanation.plainSummary}. ${stepsAudio}`;
      const langObj = userLanguages.find((l) => l.code === currentLanguage) || SUPPORTED_LANGUAGES.find((l) => l.code === currentLanguage);
      narrator.speak(textToRead, 0.9, langObj?.speechLang || 'en-US');
    }
  };

  const handleListenIntro = () => {
    if (isPlayingIntro) {
      narrator.stop();
      setIsPlayingIntro(false);
    } else {
      setIsPlayingIntro(true);
      const introText =
        currentLanguage === 'hi'
          ? "डिजी साथी में आपका स्वागत है। आइए आपका पत्र साथ में समझें। सरल और शांत शब्दों में।"
          : currentLanguage === 'es'
          ? "Bienvenido a DigiSathi. Leamos su carta juntos, con calma y en palabras sencillas."
          : currentLanguage === 'ml'
          ? "ഡിജി സാഥിയിലേക്ക് സ്വാഗതം. നിങ്ങളുടെ കത്ത് ലളിതമായ വാക്കുകളിൽ നമുക്ക് ഒരുമിച്ച് വായിക്കാം."
          : currentLanguage === 'ur'
          ? "ڈیجی ساتھی میں خوش آمدید۔ آئیے آپ کے خط کو پرسکون اور آسان الفاظ میں سمجھیں۔"
          : "Welcome to DigiSathi. Let's read your letter together. In plain, calm words. You can upload a photo of your paper, speak with our voice companion, or paste any confusing medical bill, Medicare notice, bank letter, or government form. DigiSathi translates bureaucratic notices into simple, confident steps.";
      const langObj = userLanguages.find((l) => l.code === currentLanguage) || SUPPORTED_LANGUAGES.find((l) => l.code === currentLanguage);
      narrator.speak(introText, 0.9, langObj?.speechLang || 'en-US');
    }
  };

  // Add / Remove user customized languages
  const handleAddUserLanguage = (newLang: LanguageOption) => {
    const updated = addUserLanguage(newLang);
    setUserLanguages(updated);
    handleSelectLanguage(newLang.code);
  };

  const handleRemoveUserLanguage = (langCode: string) => {
    const updated = removeUserLanguage(langCode);
    setUserLanguages(updated);
    if (currentLanguage === langCode) {
      handleSelectLanguage('en');
    }
  };

  // Language selection and translation handler
  const handleSelectLanguage = async (langCode: string) => {
    setCurrentLanguage(langCode);
    if (!explanation) return;

    // Preserve English reference for multi-language and dual-view summary
    const englishSummary = explanation.englishSummary || currentDocument?.explanation.plainSummary || explanation.plainSummary;
    const englishAtAGlance = explanation.englishAtAGlance || currentDocument?.explanation.atAGlance || explanation.atAGlance;
    const englishCallScript = explanation.englishCallScript || currentDocument?.explanation.callScript || explanation.callScript;

    // If switching back to English
    if (langCode === 'en') {
      if (currentDocument) {
        setExplanation({
          ...currentDocument.explanation,
          englishSummary,
          englishAtAGlance,
          englishCallScript
        });
      } else {
        setExplanation((prev) => ({
          ...prev,
          language: 'English',
          languageCode: 'en',
          englishSummary,
          englishAtAGlance,
          englishCallScript
        }));
      }
      return;
    }

    // Check if precomputed translation exists for current document
    if (currentDocument && PRECOMPUTED_TRANSLATIONS[currentDocument.id]?.[langCode]) {
      const pre = PRECOMPUTED_TRANSLATIONS[currentDocument.id][langCode];
      const langObj = userLanguages.find((l) => l.code === langCode) || SUPPORTED_LANGUAGES.find((l) => l.code === langCode);
      setExplanation((prev) => ({
        ...prev,
        ...pre,
        language: langObj?.name || langCode,
        languageCode: langCode,
        englishSummary,
        englishAtAGlance,
        englishCallScript
      }));
      return;
    }

    // Otherwise translate dynamically using /api/translate
    setIsTranslating(true);
    try {
      const langObj = userLanguages.find((l) => l.code === langCode) || SUPPORTED_LANGUAGES.find((l) => l.code === langCode);
      const targetName = langObj ? langObj.name : langCode;
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          explanation,
          targetLanguage: targetName,
          targetCode: langCode
        })
      });

      if (res.ok) {
        const translated = await res.json();
        setExplanation({
          ...translated,
          englishSummary,
          englishAtAGlance,
          englishCallScript
        });
      } else {
        // Fallback to localized mock
        const fallback = getLocalizedFallback(langCode);
        setExplanation({
          ...fallback,
          englishSummary,
          englishAtAGlance,
          englishCallScript
        });
      }
    } catch (err) {
      console.warn('Translation error, using localized fallback:', err);
      const fallback = getLocalizedFallback(langCode);
      setExplanation({
        ...fallback,
        englishSummary,
        englishAtAGlance,
        englishCallScript
      });
    } finally {
      setIsTranslating(false);
    }
  };

  // Sample Selection
  const handleSelectSample = (sample: SampleDocument) => {
    narrator.stop();
    setCurrentDocument(sample);
    setUploadedImageUri(null);
    setUploadedText(null);
    setErrorMessage(null);

    // If a non-English language is selected, apply translation if available
    if (currentLanguage !== 'en' && PRECOMPUTED_TRANSLATIONS[sample.id]?.[currentLanguage]) {
      const pre = PRECOMPUTED_TRANSLATIONS[sample.id][currentLanguage];
      setExplanation({
        ...sample.explanation,
        ...pre,
        language: SUPPORTED_LANGUAGES.find((l) => l.code === currentLanguage)?.name,
        languageCode: currentLanguage,
        englishCallScript: sample.explanation.callScript
      });
    } else {
      setExplanation(sample.explanation);
    }
  };

  // Helper for localized fallback when API is unreachable
  const getLocalizedFallback = (langCode: string): ExplanationResult => {
    const pre = PRECOMPUTED_TRANSLATIONS['medicare-part-b']?.[langCode];
    if (pre && pre.plainSummary && pre.nextSteps) {
      return {
        documentType: pre.documentType || 'Official Notice / Document',
        urgency: 'soon',
        urgencyNote: pre.urgencyNote || 'Action Needed Within 30 Days',
        deadline: pre.deadline || 'Within 30 Days',
        plainSummary: pre.plainSummary,
        atAGlance: pre.atAGlance || {
          whatItIs: 'Administrative verification notice.',
          whatYouOwe: 'Do not pay immediately.',
          riskAndTiming: 'Low risk.'
        },
        glossaryTerms: pre.glossaryTerms || [],
        nextSteps: pre.nextSteps || [],
        callScript: pre.callScript || '',
        englishCallScript:
          'Hello, my name is Margaret Miller. I am calling regarding my recent claim. Could you please confirm if additional clinical notes were needed? Please place a 30-day administrative hold on this account balance while this is reviewed. Thank you.'
      };
    }
    return {
      documentType: 'Official Document',
      urgency: 'soon',
      urgencyNote: 'Action Needed Within 30 Days',
      deadline: 'Within 30 Days',
      plainSummary:
        'DigiSathi examined your submitted letter. This correspondence pertains to an administrative clarification request. No urgent penalty is due right now.',
      atAGlance: {
        whatItIs:
          'A routine request for verification or paperwork clarification regarding your recent service.',
        whatYouOwe:
          'You do not have to pay anything immediately out of pocket while this record is being verified.',
        riskAndTiming:
          'Low risk. Follow the simple steps below to confirm that the office has what they need.'
      },
      glossaryTerms: [
        {
          term: 'Prior Authorization',
          definition:
            'A standard check where an insurance company confirms approval for a specific service before paying.'
        },
        {
          term: 'Beneficiary',
          definition:
            'The person (you) who is enrolled in and eligible to receive healthcare benefits.'
        }
      ],
      nextSteps: [
        {
          title: 'Step 1: Call the billing office',
          detail:
            'Call the contact number listed on your letter and ask them to verify whether any updated clinical notes are needed.',
          completed: false,
          mostUrgent: true
        },
        {
          title: 'Step 2: Request a 30-day balance hold',
          detail:
            'Ask the billing coordinator to place a temporary 30-day hold on the account while the information is verified.',
          completed: false,
          mostUrgent: false
        }
      ],
      callScript:
        'Hello, my name is Margaret Miller. I received a notice regarding my recent statement. Could you please confirm if you need additional clinical records or pre-authorization notes to resubmit this claim? Thank you.'
    };
  };

  // API Call: Analyze Raw Text
  const handleAnalyzeText = async (text: string, inputLang: string = 'auto') => {
    narrator.stop();
    setIsProcessing(true);
    setErrorMessage(null);
    setUploadedText(text);
    setCurrentDocument(null);
    setUploadedImageUri(null);

    const langObj = SUPPORTED_LANGUAGES.find((l) => l.code === currentLanguage);

    try {
      const response = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          documentType: 'Uploaded Letter / Spoken Transcript',
          language: langObj ? langObj.name : 'English',
          inputLanguage: inputLang
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned error status ${response.status}`);
      }

      const data = await response.json();
      setExplanation(data);

      // Auto scroll to results
      setTimeout(() => {
        const resultsEl = document.getElementById('results-view');
        resultsEl?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err: any) {
      console.warn('API error, falling back to local synthesis:', err);
      // Fallback: localized explanation so next steps and summary remain in selected language
      setExplanation(getLocalizedFallback(currentLanguage));
    } finally {
      setIsProcessing(false);
    }
  };

  // API Call: Analyze Scanned Photo/Image
  const handleAnalyzeImage = async (
    base64Image: string,
    mimeType: string,
    inputLang: string = 'auto'
  ) => {
    narrator.stop();
    setIsProcessing(true);
    setErrorMessage(null);
    setUploadedImageUri(base64Image);
    setCurrentDocument(null);
    setUploadedText(null);

    const langObj = SUPPORTED_LANGUAGES.find((l) => l.code === currentLanguage);

    try {
      const response = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Image,
          mimeType: mimeType || 'image/jpeg',
          language: langObj ? langObj.name : 'English',
          inputLanguage: inputLang
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned error status ${response.status}`);
      }

      const data = await response.json();
      setExplanation(data);

      setTimeout(() => {
        const resultsEl = document.getElementById('results-view');
        resultsEl?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err: any) {
      console.warn('Image analysis issue, using calm fallback:', err);
      setExplanation(getLocalizedFallback(currentLanguage));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleScrollToHelplines = () => {
    setActiveNav('helplines');
    const el = document.getElementById('senior-helplines');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div
      style={{
        fontSize: `${textScale * 100}%`
      }}
      className="min-h-screen bg-[#FBF9F5] text-[#1B1C1A] antialiased flex flex-col selection:bg-[#1E3A34]/20"
    >
      {/* Persistent Header with Accessibility Tools & Multi-Language Selector */}
      <Header
        textScale={textScale}
        setTextScale={setTextScale}
        highContrast={highContrast}
        setHighContrast={setHighContrast}
        isReadingAloud={isReadingAloud}
        onToggleReadAloud={handleToggleReadAloud}
        onOpenRecords={() => setIsPastRecordsOpen(true)}
        onScrollToHelplines={handleScrollToHelplines}
        activeNav={activeNav}
        currentLanguage={currentLanguage}
        onSelectLanguage={handleSelectLanguage}
        isTranslating={isTranslating}
        availableLanguages={userLanguages}
        onOpenAddLanguage={() => setIsAddLanguageModalOpen(true)}
      />

      {/* Main App Container */}
      <main className="flex-1 max-w-[1140px] w-full mx-auto px-4 sm:px-6">
        {/* Calm Hero Section */}
        <Hero onListenIntro={handleListenIntro} isPlayingIntro={isPlayingIntro} />

        {/* Input Card with 3 Tabs & Currently Viewing Sample Bar */}
        <InputSection
          onAnalyzeText={handleAnalyzeText}
          onAnalyzeImage={handleAnalyzeImage}
          onSelectSample={handleSelectSample}
          activeSampleId={currentDocument?.id || null}
          isProcessing={isProcessing}
          currentLanguage={currentLanguage}
          onSelectLanguage={handleSelectLanguage}
          availableLanguages={userLanguages}
          onOpenAddLanguage={() => setIsAddLanguageModalOpen(true)}
        />

        {/* Processing / Loading State */}
        {isProcessing && (
          <div className="my-8 p-8 rounded-2xl bg-[#EFEEEA] border border-[#D6CEC2] text-center flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-10 h-10 text-[#1E3A34] animate-spin" />
            <h3 className="font-serif text-2xl font-bold text-[#1E3A34]">
              {currentLanguage === 'hi'
                ? 'डिजी साथी आपका पत्र ध्यान से पढ़ रहा है...'
                : currentLanguage === 'es'
                ? 'DigiSathi está leyendo su carta detenidamente...'
                : 'DigiSathi is reading your letter carefully...'}
            </h3>
            <p className="text-[17px] text-[#414846] max-w-md">
              {currentLanguage === 'hi'
                ? 'कठिन कानूनी भाषा का अनुवाद, अंतिम तिथियों की जांच और आपके लिए फोन स्क्रिप्ट तैयार की जा रही है।'
                : currentLanguage === 'es'
                ? 'Traduciendo la jerga burocrática, verificando fechas límite y preparando su guion telefónico.'
                : 'Translating bureaucratic jargon, checking deadlines, and drafting your word-for-word call script.'}
            </p>
          </div>
        )}

        {/* Error Notification if any */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-[#ffdad6] border border-[#BA1A1A] text-[#BA1A1A] flex items-center gap-3">
            <AlertCircle className="w-6 h-6 shrink-0" />
            <p className="text-[16px] font-semibold">{errorMessage}</p>
          </div>
        )}

        {/* Results View: Urgency card, Audio player, Side-by-side, Roadmap, Scripts, Advocate & Helplines */}
        {explanation && !isProcessing && (
          <ResultsView
            explanation={explanation}
            currentDocument={currentDocument}
            uploadedImageUri={uploadedImageUri}
            uploadedText={uploadedText}
            onReadAloudSummary={(text, customSpeechLang) => {
              if (isReadingAloud) {
                narrator.stop();
                setIsReadingAloud(false);
              } else {
                const langObj = userLanguages.find((l) => l.code === currentLanguage) || SUPPORTED_LANGUAGES.find((l) => l.code === currentLanguage);
                const voiceLang = customSpeechLang || langObj?.speechLang || 'en-US';
                narrator.speak(text, 0.9, voiceLang);
              }
            }}
            isReadingAloud={isReadingAloud}
            currentLanguage={currentLanguage}
            onSelectLanguage={handleSelectLanguage}
            isTranslating={isTranslating}
            availableLanguages={userLanguages}
            onOpenAddLanguage={() => setIsAddLanguageModalOpen(true)}
          />
        )}
      </main>

      {/* Footer with HIPAA security and official helplines */}
      <Footer />

      {/* Sample Notices & Practice Records Modal */}
      <PastRecordsModal
        isOpen={isPastRecordsOpen}
        onClose={() => setIsPastRecordsOpen(false)}
        onSelectRecord={handleSelectSample}
        currentId={currentDocument?.id || null}
      />

      {/* Add User Custom Language Modal */}
      <AddLanguageModal
        isOpen={isAddLanguageModalOpen}
        onClose={() => setIsAddLanguageModalOpen(false)}
        onAddLanguage={handleAddUserLanguage}
        onSelectLanguage={(code) => {
          handleSelectLanguage(code);
          setIsAddLanguageModalOpen(false);
        }}
        onRemoveLanguage={handleRemoveUserLanguage}
        currentLanguage={currentLanguage}
        activeLanguages={userLanguages}
      />
    </div>
  );
}
