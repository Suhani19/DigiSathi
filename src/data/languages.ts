import { ExplanationResult } from '../types';

export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  speechLang: string;
  flag: string;
  isCustom?: boolean;
}

export const DEFAULT_SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', speechLang: 'en-US', flag: '🇺🇸' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', speechLang: 'hi-IN', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', speechLang: 'ta-IN', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', speechLang: 'te-IN', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', speechLang: 'bn-IN', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', speechLang: 'mr-IN', flag: '🇮🇳' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', speechLang: 'gu-IN', flag: '🇮🇳' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', speechLang: 'kn-IN', flag: '🇮🇳' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', speechLang: 'pa-IN', flag: '🇮🇳' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', speechLang: 'es-ES', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', speechLang: 'fr-FR', flag: '🇫🇷' },
];

export const SUPPORTED_LANGUAGES: LanguageOption[] = DEFAULT_SUPPORTED_LANGUAGES;

export const EXTENDED_CATALOG_LANGUAGES: LanguageOption[] = [
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', speechLang: 'ml-IN', flag: '🇮🇳' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', speechLang: 'ur-IN', flag: '🇮🇳' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', speechLang: 'or-IN', flag: '🇮🇳' },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া', speechLang: 'as-IN', flag: '🇮🇳' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', speechLang: 'ar-SA', flag: '🇸🇦' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', speechLang: 'de-DE', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', speechLang: 'it-IT', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', speechLang: 'pt-BR', flag: '🇧🇷' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', speechLang: 'ru-RU', flag: '🇷🇺' },
  { code: 'tl', name: 'Tagalog', nativeName: 'Tagalog (Filipino)', speechLang: 'tl-PH', flag: '🇵🇭' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', speechLang: 'vi-VN', flag: '🇻🇳' },
  { code: 'zh', name: 'Chinese', nativeName: '中文 (Simplified)', speechLang: 'zh-CN', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', speechLang: 'ja-JP', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', speechLang: 'ko-KR', flag: '🇰🇷' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', speechLang: 'tr-TR', flag: '🇹🇷' },
  { code: 'ne', name: 'Nepali', nativeName: 'नेपाली', speechLang: 'ne-NP', flag: '🇳🇵' },
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili', speechLang: 'sw-KE', flag: '🇰🇪' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', speechLang: 'nl-NL', flag: '🇳🇱' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', speechLang: 'pl-PL', flag: '🇵🇱' },
  { code: 'el', name: 'Greek', nativeName: 'Ελληνικά', speechLang: 'el-GR', flag: '🇬🇷' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย', speechLang: 'th-TH', flag: '🇹🇭' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', speechLang: 'id-ID', flag: '🇮🇩' },
];

export const STORAGE_KEY_USER_LANGUAGES = 'digisathi_user_languages';

export function getUserLanguages(): LanguageOption[] {
  if (typeof window === 'undefined') return DEFAULT_SUPPORTED_LANGUAGES;
  try {
    const stored = localStorage.getItem(STORAGE_KEY_USER_LANGUAGES);
    if (!stored) return DEFAULT_SUPPORTED_LANGUAGES;
    const parsed: LanguageOption[] = JSON.parse(stored);
    const merged = [...DEFAULT_SUPPORTED_LANGUAGES];
    parsed.forEach((userLang) => {
      if (!merged.some((l) => l.code === userLang.code)) {
        merged.push({ ...userLang, isCustom: true });
      }
    });
    return merged;
  } catch {
    return DEFAULT_SUPPORTED_LANGUAGES;
  }
}

export function addUserLanguage(lang: LanguageOption): LanguageOption[] {
  if (typeof window === 'undefined') return DEFAULT_SUPPORTED_LANGUAGES;
  try {
    const current = getUserLanguages();
    if (!current.some((l) => l.code === lang.code)) {
      const customLang = { ...lang, isCustom: true };
      const updated = [...current, customLang];
      const customOnly = updated.filter(
        (l) => !DEFAULT_SUPPORTED_LANGUAGES.some((def) => def.code === l.code)
      );
      localStorage.setItem(STORAGE_KEY_USER_LANGUAGES, JSON.stringify(customOnly));
      return updated;
    }
    return current;
  } catch {
    return DEFAULT_SUPPORTED_LANGUAGES;
  }
}

export function removeUserLanguage(code: string): LanguageOption[] {
  if (typeof window === 'undefined') return DEFAULT_SUPPORTED_LANGUAGES;
  try {
    const stored = localStorage.getItem(STORAGE_KEY_USER_LANGUAGES);
    if (stored) {
      const parsed: LanguageOption[] = JSON.parse(stored);
      const filtered = parsed.filter((l) => l.code !== code);
      localStorage.setItem(STORAGE_KEY_USER_LANGUAGES, JSON.stringify(filtered));
    }
    return getUserLanguages();
  } catch {
    return DEFAULT_SUPPORTED_LANGUAGES;
  }
}

export const INPUT_LANGUAGES: LanguageOption[] = [
  { code: 'auto', name: 'Auto-Detect', nativeName: 'Auto-Detect (स्वचालित)', speechLang: 'en-US', flag: '🌐' },
  ...SUPPORTED_LANGUAGES
];

export interface UITranslation {
  languageLabel: string;
  activeBadge: string;
  translateNotice: string;
  reassuringHeadline: string;
  reassuringBody: string;
  atAGlanceSub: string;
  atAGlanceTitle: string;
  point1Title: string;
  point2Title: string;
  point3Title: string;
  confusingTermsTitle: string;
  confusingTermsSub: string;
  plainMeaning: string;
  whatToDoNextTitle: string;
  roadmapSub: string;
  doneOf: string;
  mostImportantBadge: string;
  timeEstimate: string;
  jumpToScript: string;
  noAwkwardCalls: string;
  readyScriptsTitle: string;
  phoneScriptTab: string;
  writtenDisputeTab: string;
  phonePrompt: string;
  writtenPrompt: string;
  copyScript: string;
  scriptCopied: string;
  printScript: string;
  textToSarah: string;
  listenSummary: string;
  nowPlaying: string;
  originalDoc: string;
  officialForm: string;
  sharedWithCaregiver: string;
  caregiverPhoneView: string;
  realAdvocateTitle: string;
  realAdvocateSubtitle: string;
  realAdvocateDesc: string;
  callAdvocateBtn: string;
  scheduleQuietBtn: string;
  seniorHelplinesTitle: string;
  seniorHelplinesSub: string;
  digiSathiNote: string;
  showEnglishScriptToggle?: string;
  showTranslatedScriptToggle?: string;
}

export const UI_STRINGS: Record<string, UITranslation> = {
  en: {
    languageLabel: 'Language',
    activeBadge: 'Active: English',
    translateNotice: 'Tap any language to instantly translate the entire explanation, steps, and phone script:',
    reassuringHeadline: 'Don’t panic — you do not need to pay this $482.50 out of pocket.',
    reassuringBody: 'Your doctor’s office simply forgot to attach their routine office visit chart note. Once they resubmit the file with the missing code, Medicare standard procedure covers this.',
    atAGlanceSub: 'At A Glance',
    atAGlanceTitle: 'In Plain Words (The 30-Second Summary)',
    point1Title: 'What this letter actually is:',
    point2Title: 'What you owe right now:',
    point3Title: 'Your deadline & risk level:',
    confusingTermsTitle: 'Jargon Decoder — Tap any phrase to understand it:',
    confusingTermsSub: 'Bureaucratic letters are filled with confusing jargon. Tap any chip below to reveal what it means in normal everyday language:',
    plainMeaning: 'Plain Meaning:',
    whatToDoNextTitle: 'What To Do Next',
    roadmapSub: 'Your Clear Roadmap',
    doneOf: 'of',
    mostImportantBadge: 'Most Important Action',
    timeEstimate: 'Takes ~3 minutes',
    jumpToScript: 'Jump to Phone Script below ↓',
    noAwkwardCalls: 'No Awkward Phone Calls',
    readyScriptsTitle: 'Ready-to-Use Phone Script',
    phoneScriptTab: 'Phone Script',
    writtenDisputeTab: 'Written Dispute',
    phonePrompt: 'Read this word-for-word to the clinic billing secretary:',
    writtenPrompt: 'Copy or mail this formal written dispute letter:',
    copyScript: 'Copy Script Text',
    scriptCopied: 'Script Copied to Clipboard!',
    printScript: 'Print in Large Type',
    textToSarah: 'Send via WhatsApp / SMS',
    listenSummary: 'Listen to Plain Summary',
    nowPlaying: 'Narrating at calm pace...',
    originalDoc: 'Original Letter',
    officialForm: 'Official Form CMS-10156',
    sharedWithCaregiver: 'Shared with Sarah (Daughter)',
    caregiverPhoneView: 'Syncs real-time to Sarah’s phone • Can co-sign appeals',
    realAdvocateTitle: 'Prefer a real person to handle this call with you?',
    realAdvocateSubtitle: 'DigiSathi Advocates On Duty',
    realAdvocateDesc: 'Our free DigiSathi eldercare navigators can join you on a 3-way conference call with Dr. Chen’s billing office or Medicare at no cost.',
    callAdvocateBtn: '1-800-555-CARE',
    scheduleQuietBtn: 'Schedule a Quiet Time',
    seniorHelplinesTitle: 'Trusted Senior Helplines & Emergency Support',
    seniorHelplinesSub: 'Official Senior Support Services',
    digiSathiNote: 'Medicare frequently reverses administrative denials once the clinic resubmits the routine paperwork. You do not have to pay this out of pocket right now.',
    showEnglishScriptToggle: 'View English Script (for US Office Staff)',
    showTranslatedScriptToggle: 'View Translated Script'
  },
  hi: {
    languageLabel: 'भाषा (Language)',
    activeBadge: 'सक्रिय: हिन्दी',
    translateNotice: 'व्याख्या, कदम और फ़ोन संवाद को तुरंत अपनी भाषा में देखने के लिए टैप करें:',
    reassuringHeadline: 'घबराएं नहीं — आपको यह $482.50 तुरंत अपनी जेब से देने की आवश्यकता नहीं है।',
    reassuringBody: 'आपके डॉक्टर का कार्यालय सामान्य क्लिनिक चार्ट नोट संलग्न करना भूल गया था। जब वे आवश्यक कोड के साथ फ़ाइल दोबारा भेजेंगे तो मेडिकेयर इसे सामान्य रूप से कवर करेगा।',
    atAGlanceSub: 'एक नज़र में',
    atAGlanceTitle: 'सरल शब्दों में (30 सेकंड का सार)',
    point1Title: 'यह पत्र वास्तव में क्या है:',
    point2Title: 'आपको अभी क्या भुगतान करना है:',
    point3Title: 'आपकी समय सीमा व जोखिम स्तर:',
    confusingTermsTitle: 'कठिन शब्दों का अर्थ — किसी भी शब्द पर टैप करें:',
    confusingTermsSub: 'सरकारी व अस्पताल के पत्रों में कठिन तकनीकी शब्द होते हैं। इनका सामान्य अर्थ जानने के लिए नीचे टैप करें:',
    plainMeaning: 'सरल अर्थ:',
    whatToDoNextTitle: 'आगे क्या करना है',
    roadmapSub: 'आपका स्पष्ट मार्गदर्शन',
    doneOf: 'में से पूरा हुआ',
    mostImportantBadge: 'सबसे महत्वपूर्ण कदम',
    timeEstimate: 'लगभग 3 मिनट',
    jumpToScript: 'नीचे फ़ोन स्क्रिप्ट पर जाएं ↓',
    noAwkwardCalls: 'बिना किसी झिझक के बात करें',
    readyScriptsTitle: 'तैयार फ़ोन संवाद (स्क्रिप्ट)',
    phoneScriptTab: 'फ़ोन स्क्रिप्ट',
    writtenDisputeTab: 'लिखित पत्र',
    phonePrompt: 'बिलिंग सचिव को यह शब्द-दर-शब्द पढ़कर सुनाएं:',
    writtenPrompt: 'यह औपचारिक पत्र कॉपी करें या डाक द्वारा भेजें:',
    copyScript: 'स्क्रिप्ट कॉपी करें',
    scriptCopied: 'स्क्रिप्ट क्लिपबोर्ड पर कॉपी हो गई!',
    printScript: 'बड़े अक्षरों में प्रिंट करें',
    textToSarah: 'व्हाट्सएप / एसएमएस द्वारा भेजें',
    listenSummary: 'सरल आवाज़ में सुनें',
    nowPlaying: 'शांत गति से वाचन जारी है...',
    originalDoc: 'मूल पत्र',
    officialForm: 'सरकारी फॉर्म CMS-10156',
    sharedWithCaregiver: 'बेटी सारा के साथ साझा किया गया',
    caregiverPhoneView: 'सारा अपने फ़ोन पर यह अनुवाद देख सकती हैं • साथ में अपील कर सकती हैं',
    realAdvocateTitle: 'क्या आप चाहते हैं कि कोई सहायक आपके साथ कॉल पर रहे?',
    realAdvocateSubtitle: 'सिविक साथी सहायक उपलब्ध हैं',
    realAdvocateDesc: 'हमारे निःशुल्क वरिष्ठ सहायक आपके साथ मिलकर क्लिनिक के बिलिंग विभाग या मेडिकेयर अधिकारी से 3-पक्षीय कॉल पर बात कर सकते हैं।',
    callAdvocateBtn: '1-800-555-CARE पर कॉल करें',
    scheduleQuietBtn: 'शांत समय का चयन करें',
    seniorHelplinesTitle: 'भरोसेमंद वरिष्ठ नागरिक हेल्पलाइन और आपातकालीन नंबर',
    seniorHelplinesSub: 'आधिकारिक राष्ट्रीय वरिष्ठ नागरिक सहायता',
    digiSathiNote: 'जब क्लिनिक सामान्य कागज़ात दोबारा जमा करता है, तो मेडिकेयर अक्सर इस शुल्क को रद्द कर देता है। आपको इसे तुरंत अपनी जेब से चुकाने की ज़रूरत नहीं है।',
    showEnglishScriptToggle: 'अंग्रेजी स्क्रिप्ट देखें (ऑफ़िस स्टाफ़ के लिए)',
    showTranslatedScriptToggle: 'हिंदी स्क्रिप्ट देखें'
  },
  ta: {
    languageLabel: 'மொழி (Language)',
    activeBadge: 'செயலில்: தமிழ்',
    translateNotice: 'முழு விளக்கம், படிகள் மற்றும் தொலைபேசி உரையை தமிழில் காண தட்டவும்:',
    reassuringHeadline: 'பயப்பட வேண்டாம் — இந்த $482.50 தொகையை நீங்கள் உடனடியாக உங்கள் கையில் இருந்து செலுத்த வேண்டியதில்லை.',
    reassuringBody: 'உங்கள் மருத்துவர் அலுவலகம் வழக்கமான கிளினிக் குறிப்பை இணைக்க மறந்துவிட்டது. விடுபட்ட குறியீட்டுடன் மீண்டும் சமர்ப்பிக்கும் போது மெடிகேர் இதை ஏற்கும்.',
    atAGlanceSub: 'ஒரு பார்வையில்',
    atAGlanceTitle: 'எளிய தமிழில் (30 வினாடி சுருக்கம்)',
    point1Title: 'இந்தக் கடிதம் எதைப் பற்றியது:',
    point2Title: 'நீங்கள் இப்போது செலுத்த வேண்டியது:',
    point3Title: 'உங்கள் ஆபத்து நிலை & காலக்கெடு:',
    confusingTermsTitle: 'கடினமான சொற்களின் விளக்கம் — அறிய தட்டவும்:',
    confusingTermsSub: 'அதிகாரப்பூர்வ கடிதங்களில் உள்ள கடினமான சொற்களை அன்றாட எளிய தமிழில் புரிந்துகொள்ளுங்கள்:',
    plainMeaning: 'எளிய பொருள்:',
    whatToDoNextTitle: 'அடுத்து என்ன செய்ய வேண்டும்',
    roadmapSub: 'தெளிவான வழிகாட்டுதல்',
    doneOf: 'இல் முடிந்தது',
    mostImportantBadge: 'மிக முக்கியமான நடவடிக்கை',
    timeEstimate: '~3 நிமிடங்கள் ஆகும்',
    jumpToScript: 'கீழே உள்ள தொலைபேசி உரைக்கு செல்லவும் ↓',
    noAwkwardCalls: 'தயங்காமல் பேசலாம்',
    readyScriptsTitle: 'தயாரான தொலைபேசி உரையாடல்',
    phoneScriptTab: 'தொலைபேசி உரை',
    writtenDisputeTab: 'எழுத்துப்பூர்வ மனு',
    phonePrompt: 'பில்லிங் செயலாளரிடம் இதை அப்படியே வாசிக்கவும்:',
    writtenPrompt: 'முறையான மேல்முறையீட்டு கடிதத்தை அஞ்சலில் அனுப்பவும்:',
    copyScript: 'உரையை நகலெடு',
    scriptCopied: 'உரை நகலெடுக்கப்பட்டது!',
    printScript: 'பெரிய எழுத்தில் அச்சிடு',
    textToSarah: 'வாட்ஸ்அப் / எஸ்எம்எஸ் மூலம் அனுப்பு',
    listenSummary: 'எளிய குரலில் கேளுங்கள்',
    nowPlaying: 'அமைதியான குரலில் ஒலிக்கிறது...',
    originalDoc: 'அசல் கடிதம்',
    officialForm: 'படிவம் CMS-10156',
    sharedWithCaregiver: 'மகள் சாராவுடன் பகிரப்பட்டது',
    caregiverPhoneView: 'சாரா தனது தொலைபேசியில் நேரலையாக பார்க்கலாம்',
    realAdvocateTitle: 'உங்களுடன் ஒரு உதவியாளர் பேச விரும்புகிறீர்களா?',
    realAdvocateSubtitle: 'சிவிக் சாதி உதவியாளர்கள் தயார்',
    realAdvocateDesc: 'எங்கள் இலவச முதியோர் வழிகாட்டிகள் உங்களுடன் இணைந்து மருத்துவமனை பில்லிங் பிரிவுடன் 3-வழி அழைப்பில் பேச முடியும்.',
    callAdvocateBtn: '1-800-555-CARE அழைக்கவும்',
    scheduleQuietBtn: 'நேரம் பதிவு செய்க',
    seniorHelplinesTitle: 'முதியோர் உதவி எண்கள் & அவசர சேவைகள்',
    seniorHelplinesSub: 'அரசு அங்கீகாரம் பெற்ற சேவைகள்',
    digiSathiNote: 'மருத்துவமனை விடுபட்ட ஆவணங்களை சமர்ப்பித்தவுடன் மெடிகேர் இந்த கட்டணத்தை ரத்து செய்கிறது. நீங்கள் இப்போது செலுத்த தேவையில்லை.',
    showEnglishScriptToggle: 'ஆங்கில உரை (அலுவலக ஊழியர்களிடம் பேச)',
    showTranslatedScriptToggle: 'தமிழ் உரை'
  },
  te: {
    languageLabel: 'భాష (Language)',
    activeBadge: 'యాక్టివ్: తెలుగు',
    translateNotice: 'వివరణ, తదుపరి దశలు మరియు ఫోన్ స్క్రిప్ట్‌ను తెలుగులో చూడటానికి ట్యాప్ చేయండి:',
    reassuringHeadline: 'కంగారు పడకండి — మీరు ఈ $482.50 ని మీ జేబు నుండి వెంటనే చెల్లించాల్సిన అవసరం లేదు.',
    reassuringBody: 'మీ డాక్టర్ క్లినిక్ సాధారణ చార్ట్ నోట్స్ జతచేయడం మర్చిపోయారు. వారు సరైన కోడ్‌తో మళ్లీ పంపినప్పుడు మెడికేర్ దీనిని సాధారణంగా కవర్ చేస్తుంది.',
    atAGlanceSub: 'ఒక్క చూపులో',
    atAGlanceTitle: 'సులభమైన తెలుగులో (30 సెకన్ల సారాంశం)',
    point1Title: 'ఈ లేఖ అసలు దేని గురించి:',
    point2Title: 'మీరు ఇప్పుడు చెల్లించాల్సిన మొత్తం:',
    point3Title: 'మీ రిస్క్ స్థాయి & గడువు:',
    confusingTermsTitle: 'కఠిన పదాల నిఘంటువు — అర్థం కోసం ట్యాప్ చేయండి:',
    confusingTermsSub: 'అధికారిక లేఖల్లోని సాంకేతిక పదాలను సులభమైన తెలుగులో అర్థం చేసుకోండి:',
    plainMeaning: 'సులభమైన అర్థం:',
    whatToDoNextTitle: 'తరువాత ఏమి చేయాలి',
    roadmapSub: 'స్పష్టమైన కార్యాచరణ',
    doneOf: 'లో పూర్తయింది',
    mostImportantBadge: 'అత్యంత ముఖ్యమైన చర్య',
    timeEstimate: '~3 నిమిషాలు పడుతుంది',
    jumpToScript: 'క్రింద ఉన్న ఫోన్ స్క్రిప్ట్‌కు వెళ్లండి ↓',
    noAwkwardCalls: 'సులభంగా మాట్లాడండి',
    readyScriptsTitle: 'సిద్ధంగా ఉన్న ఫోన్ స్క్రిప్ట్',
    phoneScriptTab: 'ఫోన్ స్క్రిప్ట్',
    writtenDisputeTab: 'రాతపూర్వక లేఖ',
    phonePrompt: 'బిల్లింగ్ సెక్రటరీతో ఈ విధంగా మాట్లాడండి:',
    writtenPrompt: 'ఈ లేఖను కాపీ చేసి తపాలా ద్వారా పంపండి:',
    copyScript: 'స్క్రిప్ట్ కాపీ చేయండి',
    scriptCopied: 'స్క్రిప్ట్ క్లిప్‌బోర్డ్‌కు కాపీ అయింది!',
    printScript: 'పెద్ద అక్షరాలలో ప్రింట్ చేయండి',
    textToSarah: 'వాట్సాప్ / ఎస్ఎంఎస్ ద్వారా పంపండి',
    listenSummary: 'వాయిస్ సారాంశం వినండి',
    nowPlaying: 'శాంతమైన స్వరంలో చదువుతోంది...',
    originalDoc: 'అసలు లేఖ',
    officialForm: 'ఫారమ్ CMS-10156',
    sharedWithCaregiver: 'కూతురు సారాకు భాగస్వామ్యం చేయబడింది',
    caregiverPhoneView: 'సారా తన ఫోన్‌లో దీనిని వెంటనే చూడవచ్చు',
    realAdvocateTitle: 'మీతో పాటు సహాయకుడు కాల్‌లో ఉండాలనుకుంటున్నారా?',
    realAdvocateSubtitle: 'సివిక్ సాథి సహాయకులు అందుబాటులో ఉన్నారు',
    realAdvocateDesc: 'మా ఉచిత వయోవృద్ధుల సహాయకులు డాక్టర్ చెన్ బిల్లింగ్ డెస్క్‌తో 3-వే కాల్‌లో పాల్గొని మీకు సహాయం చేస్తారు.',
    callAdvocateBtn: '1-800-555-CARE కి కాల్ చేయండి',
    scheduleQuietBtn: 'సమయం కేటాయించండి',
    seniorHelplinesTitle: 'సీనియర్ హెల్ప్‌లైన్లు & అత్యవసర సహాయం',
    seniorHelplinesSub: 'అధికారిక జాతీయ సహాయ సేవలు',
    digiSathiNote: 'క్లినిక్ పత్రాలను తిరిగి సమర్పించినప్పుడు మెడికేర్ తరచుగా ఈ బిల్లును రద్దు చేస్తుంది. మీరు ఇప్పుడు సొంతంగా చెల్లించాల్సిన పనిలేదు.',
    showEnglishScriptToggle: 'ఇంగ్లీష్ స్క్రిప్ట్ చూడండి (సిబ్బందితో మాట్లాడటానికి)',
    showTranslatedScriptToggle: 'తెలుగు స్క్రిప్ట్'
  },
  bn: {
    languageLabel: 'ভাষা (Language)',
    activeBadge: 'সক্রিয়: বাংলা',
    translateNotice: 'ব্যাখ্যা, পদক্ষেপ এবং ফোন স্ক্রিপ্ট বাংলায় দেখতে স্পর্শ করুন:',
    reassuringHeadline: 'আতঙ্কিত হবেন না — এই $482.50 আপনাকে এখনই নিজের পকেট থেকে দিতে হবে না।',
    reassuringBody: 'আপনার ডাক্তারের চেম্বার সাধারণ ভিজিট চার্ট নোট সংযুক্ত করতে ভুলে গিয়েছিল। তারা সঠিক কোডসহ পুনরায় জমা দিলে মেডিকেয়ার এটি কভার করবে।',
    atAGlanceSub: 'এক নজরে',
    atAGlanceTitle: 'সহজ বাংলায় (৩০ সেকেন্ডের সারসংক্ষেপ)',
    point1Title: 'এই চিঠিটি আসলে কী:',
    point2Title: 'আপনাকে এখনই যা দিতে হবে:',
    point3Title: 'আপনার ঝুঁকির মাত্রা ও সময়সীমা:',
    confusingTermsTitle: 'কঠিন শব্দের সহজ অর্থ — জানতে স্পর্শ করুন:',
    confusingTermsSub: 'সরকারি চিঠির জটিল আইনি ও মেডিকেল শব্দের সহজ অর্থ জেনে নিন:',
    plainMeaning: 'সহজ অর্থ:',
    whatToDoNextTitle: 'এরপর কী করতে হবে',
    roadmapSub: 'আপনার স্পষ্ট রোডম্যাপ',
    doneOf: 'টি সম্পন্ন',
    mostImportantBadge: 'সবচেয়ে গুরুত্বপূর্ণ পদক্ষেপ',
    timeEstimate: 'প্রায় ৩ মিনিট সময় লাগবে',
    jumpToScript: 'নিচে ফোন স্ক্রিপ্ট দেখুন ↓',
    noAwkwardCalls: 'দ্বিধাহীন কথোপকথন',
    readyScriptsTitle: 'প্রস্তুত ফোন স্ক্রিপ্ট',
    phoneScriptTab: 'ফোন স্ক্রিপ্ট',
    writtenDisputeTab: 'লিখিত আবেদন',
    phonePrompt: 'বিলিং কর্মীকে এটি হুবহু পড়ে শোনান:',
    writtenPrompt: 'এই চিঠিটি কপি করে ডাকযোগে পাঠান:',
    copyScript: 'স্ক্রিপ্ট কপি করুন',
    scriptCopied: 'স্ক্রিপ্ট কপি করা হয়েছে!',
    printScript: 'বড় অক্ষরে প্রিন্ট করুন',
    textToSarah: 'মেয়ে সারাহকে পাঠান',
    listenSummary: 'শান্ত কণ্ঠে শুনুন',
    nowPlaying: 'শান্ত কণ্ঠে পাঠ করা হচ্ছে...',
    originalDoc: 'মূল চিঠি',
    officialForm: 'সরকারি ফর্ম CMS-10156',
    sharedWithCaregiver: 'মেয়ে সারাহর সাথে যুক্ত',
    caregiverPhoneView: 'সারাহ তার ফোনে এটি সরাসরি দেখতে পাবে',
    realAdvocateTitle: 'আপনার সাথে একজন সহায়তাকারী কলে যুক্ত হতে চান?',
    realAdvocateSubtitle: 'সিভিকসাথী সহায়ক প্রস্তুত',
    realAdvocateDesc: 'আমাদের অভিজ্ঞ সাহায্যকারী বিনামূল্যে ক্লিনিক বা মেডিকেয়ারের সাথে ৩-মুখী কনফারেন্স কলে অংশ নিতে পারেন।',
    callAdvocateBtn: '1-800-555-CARE এ কল করুন',
    scheduleQuietBtn: 'সময় নির্ধারণ করুন',
    seniorHelplinesTitle: 'জরুরি সিনিয়র হেল্পলাইন ও সহায়তা কেন্দ্র',
    seniorHelplinesSub: 'সরকারি যাচাইকৃত সেবা',
    digiSathiNote: 'ডাক্তারের অফিস কাগজপত্র পুনরায় জমা দিলে মেডিকেয়ার প্রায়শই এই বিল বাতিল করে দেয়। এখনই পকেট থেকে দিতে হবে না।',
    showEnglishScriptToggle: 'ইংরেজি স্ক্রিপ্ট (স্টাফদের সাথে কথা বলতে)',
    showTranslatedScriptToggle: 'বাংলা স্ক্রিপ্ট'
  },
  mr: {
    languageLabel: 'भाषा (Language)',
    activeBadge: 'सक्रिय: मराठी',
    translateNotice: 'स्पष्टीकरण, कृती पायऱ्या व फोन संवाद मराठीत पाहण्यासाठी टॅप करा:',
    reassuringHeadline: 'घाबरू नका — हे $482.50 तुम्हाला स्वतःच्या खिशातून त्वरित भरण्याची गरज नाही.',
    reassuringBody: 'तुमच्या डॉक्टरांचे कार्यालय नियमित क्लिनिक व्हिजिट नोट्स जोडायचे विसरले होते. आवश्यक कागदपत्रांसह पुन्हा सादर केल्यावर मेडिकेअर हे नेहमीप्रमाणे मान्य करते.',
    atAGlanceSub: 'एका दृष्टीक्षेपात',
    atAGlanceTitle: 'सोप्या मराठीत (३० सेकंदांचा सारांश)',
    point1Title: 'हे पत्र नेमके काय आहे:',
    point2Title: 'तुम्हाला आता काय भरावे लागेल:',
    point3Title: 'तुमची जोखीम व अंतिम मुदत:',
    confusingTermsTitle: 'कठीण शब्दांचा सोपा अर्थ — जाणून घेण्यासाठी टॅप करा:',
    confusingTermsSub: 'सरकारी व वैद्यकीय पत्रांमधील तांत्रिक शब्दांचा दैनंदिन भाषेतील अर्थ:',
    plainMeaning: 'सोपा अर्थ:',
    whatToDoNextTitle: 'पुढे काय करावे',
    roadmapSub: 'तुमचा स्पष्ट मार्ग',
    doneOf: 'पैकी पूर्ण',
    mostImportantBadge: 'सर्वात महत्त्वाची कृती',
    timeEstimate: '~३ मिनिटे लागतील',
    jumpToScript: 'खालील फोन संवादाकडे जा ↓',
    noAwkwardCalls: 'कोणत्याही संकोचाशिवाय बोला',
    readyScriptsTitle: 'तयार फोन संवाद (स्क्रिप्ट)',
    phoneScriptTab: 'फोन संवाद',
    writtenDisputeTab: 'लेखी तक्रार',
    phonePrompt: 'बिलिंग कर्मचाऱ्याला हे शब्दशः वाचून दाखवा:',
    writtenPrompt: 'हे औपचारिक पत्र पोस्टाने पाठवा:',
    copyScript: 'संवाद कॉपी करा',
    scriptCopied: 'संवाद क्लिपबोर्डवर कॉपी झाला!',
    printScript: 'मोठ्या अक्षरांमध्ये प्रिंट करा',
    textToSarah: 'मुलगी साराला पाठवा',
    listenSummary: 'शांत आवाजात ऐका',
    nowPlaying: 'शांत गतीने वाचन सुरू आहे...',
    originalDoc: 'मूळ पत्र',
    officialForm: 'सरकारी फॉर्म CMS-10156',
    sharedWithCaregiver: 'मुलगी सारासोबत शेअर केले',
    caregiverPhoneView: 'सारा तिच्या फोनवर हे त्वरित पाहू शकते',
    realAdvocateTitle: 'कॉलवर तुमच्यासोबत प्रत्यक्ष मदतनीस हवा आहे का?',
    realAdvocateSubtitle: 'सिविकसाथी सहाय्यक उपलब्ध',
    realAdvocateDesc: 'आमचे ज्येष्ठ नागरिक सहाय्यक तुमच्यासोबत क्लिनिकच्या बिलिंग विभागाशी ३-वे कॉलवर मोफत बोलू शकतात.',
    callAdvocateBtn: '1-800-555-CARE वर कॉल करा',
    scheduleQuietBtn: 'वेळ निश्चित करा',
    seniorHelplinesTitle: 'विश्वसनीय ज्येष्ठ नागरिक हेल्पलाइन व मदत',
    seniorHelplinesSub: 'अधिकृत राष्ट्रीय मदत कक्ष',
    digiSathiNote: 'क्लिनिकने कागदपत्रे पुन्हा जमा केल्यास मेडिकेअर अनेकदा हे शुल्क रद्द करते. तुम्हाला आत्ता पैसे भरण्याची गरज नाही.',
    showEnglishScriptToggle: 'इंग्रजी स्क्रिप्ट पहा (कर्मचाऱ्यांशी बोलण्यासाठी)',
    showTranslatedScriptToggle: 'मराठी स्क्रिप्ट'
  },
  gu: {
    languageLabel: 'ભાષા (Language)',
    activeBadge: 'સક્રિય: ગુજરાતી',
    translateNotice: 'સમગ્ર સમજૂતી, પગલાં અને ફોન સંવાદ ગુજરાતીમાં જોવા માટે ટૅપ કરો:',
    reassuringHeadline: 'ચિંતા કરશો નહીં — તમારે આ $482.50 તાત્કાલિક તમારા ખિસ્સામાંથી ચૂકવવાની જરૂર નથી.',
    reassuringBody: 'તમારા ડૉક્ટરની ઑફિસ સામાન્ય ચાર્ટ નોટ્સ જોડવાનું ભૂલી ગઈ હતી. જરૂરી વિગતો સાથે ફરી સબમિટ કરવાથી મેડિકેર આ બિલ સામાન્ય રીતે સ્વીકારી લે છે.',
    atAGlanceSub: 'એક નજરમાં',
    atAGlanceTitle: 'સરળ ગુજરાતીમાં (30 સેકન્ડનો સારાંશ)',
    point1Title: 'આ પત્ર ખરેખર શું છે:',
    point2Title: 'તમારે અત્યારે શું ચૂકવવાનું છે:',
    point3Title: 'તમારું જોખમ સ્તર અને સમયમર્યાદા:',
    confusingTermsTitle: 'અઘરા શબ્દોનો સરળ અર્થ — જાણવા માટે ટૅપ કરો:',
    confusingTermsSub: 'સત્તાવાર પત્રોના અટપટા શબ્દોનો રોજિંદી ભાષામાં અર્થ સમજો:',
    plainMeaning: 'સરળ અર્થ:',
    whatToDoNextTitle: 'હવે આગળ શું કરવું',
    roadmapSub: 'તમારો સ્પષ્ટ રોડમેપ',
    doneOf: 'માંથી પૂર્ણ',
    mostImportantBadge: 'સૌથી મહત્ત્વનું પગલું',
    timeEstimate: '~3 મિનિટ થશે',
    jumpToScript: 'નીચે આપેલ ફોન સ્ક્રિપ્ટ પર જાઓ ↓',
    noAwkwardCalls: 'સહજતાથી વાત કરો',
    readyScriptsTitle: 'તૈયાર ફોન સ્ક્રિપ્ટ',
    phoneScriptTab: 'ફોન સ્ક્રિપ્ટ',
    writtenDisputeTab: 'લેખિત પત્ર',
    phonePrompt: 'બિલિંગ સેક્રેટરીને આ શબ્દશઃ વાંચી સંભળાવો:',
    writtenPrompt: 'આ ઔપચારિક પત્ર ડાક દ્વારા મોકલો:',
    copyScript: 'સ્ક્રિપ્ટ કૉપિ કરો',
    scriptCopied: 'સ્ક્રિપ્ટ કૉપિ થઈ ગઈ!',
    printScript: 'મોટા અક્ષરોમાં પ્રિન્ટ કરો',
    textToSarah: 'પુત્રી સારાને મોકલો',
    listenSummary: 'શાંત અવાજે સાંભળો',
    nowPlaying: 'શાંત ગતિએ સંભળાવી રહ્યું છે...',
    originalDoc: 'મૂળ પત્ર',
    officialForm: 'ફોર્મ CMS-10156',
    sharedWithCaregiver: 'પુત્રી સારા સાથે શેર કરેલ',
    caregiverPhoneView: 'સારા તેના ફોન પર આ તાત્કાલિક જોઈ શકે છે',
    realAdvocateTitle: 'કૉલ પર તમારી સાથે કોઈ સહાયક જોઈએ છે?',
    realAdvocateSubtitle: 'સિવિકસાથી સહાયક ઉપલબ્ધ',
    realAdvocateDesc: 'અમારા નિઃશુલ્ક વરિષ્ઠ સહાયકો ડૉક્ટર ચેનની બિલિંગ ઑફિસ સાથે 3-વે કૉલમાં જોડાઈને તમારી સહાય કરી શકે છે.',
    callAdvocateBtn: '1-800-555-CARE પર કૉલ કરો',
    scheduleQuietBtn: 'સમય નક્કી કરો',
    seniorHelplinesTitle: 'વિશ્વસનીય સિનિયર હેલ્પલાઇન અને સહાય',
    seniorHelplinesSub: 'સત્તાવાર રાષ્ટ્રીય સહાય',
    digiSathiNote: 'ક્લિનિક જ્યારે કાગળો ફરી મોકલે છે ત્યારે મેડિકેર આ ચાર્જ માફ કરી દે છે. અત્યારે તમારે પૈસા ચૂકવવાના નથી.',
    showEnglishScriptToggle: 'અંગ્રેજી સ્ક્રિપ્ટ (સ્ટાફ સાથે વાત કરવા માટે)',
    showTranslatedScriptToggle: 'ગુજરાતી સ્ક્રિપ્ટ'
  },
  kn: {
    languageLabel: 'ಭಾಷೆ (Language)',
    activeBadge: 'ಸಕ್ರಿಯ: ಕನ್ನಡ',
    translateNotice: 'ವಿವರಣೆ, ಮುಂದಿನ ಹಂತಗಳು ಮತ್ತು ಫೋನ್ ಸಂಭಾಷಣೆಯನ್ನು ಕನ್ನಡದಲ್ಲಿ ನೋಡಲು ಟ್ಯಾಪ್ ಮಾಡಿ:',
    reassuringHeadline: 'ಆತಂಕಪಡಬೇಡಿ — ಈ $482.50 ಹಣವನ್ನು ನೀವು ತಕ್ಷಣ ನಿಮ್ಮ ಜೇಬಿನಿಂದ ಪಾವತಿಸುವ ಅಗತ್ಯವಿಲ್ಲ.',
    reassuringBody: 'ನಿಮ್ಮ ವೈದ್ಯರ ಕಚೇರಿಯು ಸಾಮಾನ್ಯ ಚಾರ್ಟ್ ಟಿಪ್ಪಣಿಗಳನ್ನು ಲಗತ್ತಿಸಲು ಮರೆತಿದೆ. ಕಾಣೆಯಾದ ಕೋಡ್‌ನೊಂದಿಗೆ ಮರುಸಲ್ಲಿಸಿದಾಗ ಮೆಡಿಕೇರ್ ಇದನ್ನು ಸಾಮಾನ್ಯ ನಿಯಮದಂತೆ ಪಾವತಿಸುತ್ತದೆ.',
    atAGlanceSub: 'ಒಂದು ನೋಟದಲ್ಲಿ',
    atAGlanceTitle: 'ಸರಳ ಕನ್ನಡದಲ್ಲಿ (30 ಸೆಕೆಂಡುಗಳ ಸಾರಾಂಶ)',
    point1Title: 'ಈ ಪತ್ರ ನಿಜವಾಗಿ ಏನನ್ನು ತಿಳಿಸುತ್ತದೆ:',
    point2Title: 'ನೀವು ಈಗ ಪಾವತಿಸಬೇಕಾದದ್ದು:',
    point3Title: 'ನಿಮ್ಮ ಅಪಾಯದ ಮಟ್ಟ ಮತ್ತು ಗಡುವು:',
    confusingTermsTitle: 'ಕಠಿಣ ಪದಗಳ ನಿಘಂಟು — ತಿಳಿಯಲು ಟ್ಯಾಪ್ ಮಾಡಿ:',
    confusingTermsSub: 'ಅಧಿಕೃತ ಪತ್ರಗಳಲ್ಲಿನ ಕ್ಲಿಷ್ಟಕರ ಪದಗಳ ಸರಳ ದೈನಂದಿನ ಕನ್ನಡ ಅರ್ಥ:',
    plainMeaning: 'ಸರಳ ಅರ್ಥ:',
    whatToDoNextTitle: 'ಮುಂದೆ ಏನು ಮಾಡಬೇಕು',
    roadmapSub: 'ನಿಮ್ಮ ಸ್ಪಷ್ಟ ಮಾರ್ಗಸೂಚಿ',
    doneOf: 'ರಲ್ಲಿ ಪೂರ್ಣಗೊಂಡಿದೆ',
    mostImportantBadge: 'ಅತ್ಯಂತ ಪ್ರಮುಖ ಹಂತ',
    timeEstimate: '~3 ನಿಮಿಷಗಳು ಬೇಕಾಗುತ್ತದೆ',
    jumpToScript: 'ಕೆಳಗಿರುವ ಫೋನ್ ಸಂಭಾಷಣೆಗೆ ಹೋಗಿ ↓',
    noAwkwardCalls: 'ಸಂಕೋಚವಿಲ್ಲದೆ ಮಾತನಾಡಿ',
    readyScriptsTitle: 'ಸಿದ್ಧ ಫೋನ್ ಸಂಭಾಷಣೆ',
    phoneScriptTab: 'ಫೋನ್ ಸಂಭಾಷಣೆ',
    writtenDisputeTab: 'ಲಿಖಿತ ಮನವಿ',
    phonePrompt: 'ಬಿಲ್ಲಿಂಗ್ ಅಧಿಕಾರಿಯೊಂದಿಗೆ ಇದನ್ನು ನೇರವಾಗಿ ಓದಿ:',
    writtenPrompt: 'ಈ ಮನವಿಯನ್ನು ಅಂಚೆ ಮೂಲಕ ಕಳುಹಿಸಿ:',
    copyScript: 'ಸಂಭಾಷಣೆ ನಕಲಿಸಿ',
    scriptCopied: 'ಸಂಭಾಷಣೆ ನಕಲಿಸಲಾಗಿದೆ!',
    printScript: 'ದೊಡ್ಡ ಅಕ್ಷರಗಳಲ್ಲಿ ಮುದ್ರಿಸಿ',
    textToSarah: 'ಮಗಳು ಸಾರಾಗೆ ಕಳುಹಿಸಿ',
    listenSummary: 'ಸ್ಪಷ್ಟ ಧ್ವನಿಯಲ್ಲಿ ಕೇಳಿ',
    nowPlaying: 'ಶಾಂತ ಧ್ವನಿಯಲ್ಲಿ ಓದಲಾಗುತ್ತಿದೆ...',
    originalDoc: 'ಮೂಲ ಪತ್ರ',
    officialForm: 'ಫಾರ್ಮ್ CMS-10156',
    sharedWithCaregiver: 'ಮಗಳು ಸಾರಾ ಜೊತೆ ಹಂಚಿಕೊಳ್ಳಲಾಗಿದೆ',
    caregiverPhoneView: 'ಸಾರಾ ತನ್ನ ಫೋನ್‌ನಲ್ಲಿ ಇದನ್ನು ನೇರವಾಗಿ ವೀಕ್ಷಿಸಬಹುದು',
    realAdvocateTitle: 'ನಿಮ್ಮೊಂದಿಗೆ ಕರೆ ಮಾಡಲು ನಿಜವಾದ ಸಹಾಯಕರು ಬೇಕೇ?',
    realAdvocateSubtitle: 'ಸಿವಿಕ್ ಸಾಥಿ ಸಹಾಯಕರು ಲಭ್ಯ',
    realAdvocateDesc: 'ನಮ್ಮ ಉಚಿತ ಹಿರಿಯ ನಾಗರಿಕರ ಸಹಾಯಕರು ನಿಮ್ಮೊಂದಿಗೆ ಕ್ಲಿನಿಕ್ ಬಿಲ್ಲಿಂಗ್ ವಿಭಾಗದೊಂದಿಗೆ 3-ವೇ ಕರೆಯಲ್ಲಿ ಭಾಗವಹಿಸಬಹುದು.',
    callAdvocateBtn: '1-800-555-CARE ಗೆ ಕರೆ ಮಾಡಿ',
    scheduleQuietBtn: 'ಸಮಯ ನಿಗದಿಪಡಿಸಿ',
    seniorHelplinesTitle: 'ಹಿರಿಯ ನಾಗರಿಕರ ಸಹಾಯವಾಣಿಗಳು',
    seniorHelplinesSub: 'ಅಧಿಕೃತ ರಾಷ್ಟ್ರೀಯ ಸೇವೆಗಳು',
    digiSathiNote: 'ವೈದ್ಯರ ಕಚೇರಿ ದಾಖಲೆಗಳನ್ನು ಮರುಸಲ್ಲಿಸಿದಾಗ ಮೆಡಿಕೇರ್ ಈ ಶುಲ್ಕವನ್ನು ರದ್ದುಗೊಳಿಸುತ್ತದೆ. ನೀವು ಈಗಲೇ ಹಣ ನೀಡಬೇಕಾಗಿಲ್ಲ.',
    showEnglishScriptToggle: 'ಇಂಗ್ಲಿಷ್ ಸ್ಕ್ರಿಪ್ಟ್ (ಕಚೇರಿ ಸಿಬ್ಬಂದಿಗೆ ಓದಲು)',
    showTranslatedScriptToggle: 'ಕನ್ನಡ ಸ್ಕ್ರಿಪ್ಟ್'
  },
  pa: {
    languageLabel: 'ਭਾਸ਼ਾ (Language)',
    activeBadge: 'ਸਰਗਰਮ: ਪੰਜਾਬੀ',
    translateNotice: 'ਆਪਣੀ ਭਾਸ਼ਾ ਵਿੱਚ ਸਪੱਸ਼ਟੀਕਰਨ, ਕਦਮ ਅਤੇ ਫ਼ੋਨ ਸੰਵਾਦ ਦੇਖਣ ਲਈ ਟੈਪ ਕਰੋ:',
    reassuringHeadline: 'ਘਬਰਾਓ ਨਾ — ਤੁਹਾਨੂੰ ਇਹ $482.50 ਤੁਰੰਤ ਆਪਣੀ ਜੇਬ ਵਿੱਚੋਂ ਦੇਣ ਦੀ ਲੋੜ ਨਹੀਂ ਹੈ।',
    reassuringBody: 'ਤੁਹਾਡੇ ਡਾਕਟਰ ਦਾ ਦਫ਼ਤਰ ਆਮ ਚਾਰਟ ਨੋਟ ਨੱਥੀ ਕਰਨਾ ਭੁੱਲ ਗਿਆ ਸੀ। ਜਦੋਂ ਉਹ ਸਹੀ ਕੋਡ ਨਾਲ ਦੁਬਾਰਾ ਭੇਜਣਗੇ ਤਾਂ ਮੈਡੀਕੇਅਰ ਇਸਨੂੰ ਕਵਰ ਕਰ ਲਵੇਗਾ।',
    atAGlanceSub: 'ਇੱਕ ਨਜ਼ਰ ਵਿੱਚ',
    atAGlanceTitle: 'ਸੌਖੇ ਸ਼ਬਦਾਂ ਵਿੱਚ (30 ਸਕਿੰਟ ਦਾ ਸਾਰ)',
    point1Title: 'ਇਹ ਚਿੱਠੀ ਅਸਲ ਵਿੱਚ ਕੀ ਹੈ:',
    point2Title: 'ਤੁਹਾਨੂੰ ਹੁਣ ਕੀ ਦੇਣਾ ਪਵੇਗਾ:',
    point3Title: 'ਜੋਖਮ ਦਾ ਪੱਧਰ ਅਤੇ ਆਖਰੀ ਮਿਤੀ:',
    confusingTermsTitle: 'ਔਖੇ ਸ਼ਬਦਾਂ ਦਾ ਸਰਲ ਅਰਥ:',
    confusingTermsSub: 'ਸਰਕਾਰੀ ਚਿੱਠੀਆਂ ਦੇ ਤਕਨੀਕੀ ਸ਼ਬਦਾਂ ਨੂੰ ਆਪਣੀ ਬੋਲੀ ਵਿੱਚ ਸਮਝੋ:',
    plainMeaning: 'ਸਰਲ ਅਰਥ:',
    whatToDoNextTitle: 'ਅੱਗੇ ਕੀ ਕਰਨਾ ਹੈ',
    roadmapSub: 'ਤੁਹਾਡਾ ਸਪੱਸ਼ਟ ਮਾਰਗਦਰਸ਼ਨ',
    doneOf: 'ਵਿੱਚੋਂ ਪੂਰੇ ਹੋਏ',
    mostImportantBadge: 'ਸਭ ਤੋਂ ਮਹੱਤਵਪੂਰਨ ਕਦਮ',
    timeEstimate: '~3 ਮਿੰਟ ਲੱਗਣਗੇ',
    jumpToScript: 'ਹੇਠਾਂ ਫ਼ੋਨ ਸਕ੍ਰਿਪਟ ਦੇਖੋ ↓',
    noAwkwardCalls: 'ਬਿਨਾਂ ਝਿਜਕ ਗੱਲ ਕਰੋ',
    readyScriptsTitle: 'ਤਿਆਰ ਫ਼ੋਨ ਸੰਵਾਦ (ਸਕ੍ਰਿਪਟ)',
    phoneScriptTab: 'ਫ਼ੋਨ ਸਕ੍ਰਿਪਟ',
    writtenDisputeTab: 'ਲਿਖਤੀ ਪੱਤਰ',
    phonePrompt: 'ਬਿਲਿੰਗ ਕਰਮਚਾਰੀ ਨੂੰ ਇਹ ਸ਼ਬਦ-ਬ-ਸ਼ਬਦ ਪੜ੍ਹ ਕੇ ਸੁਣਾਓ:',
    writtenPrompt: 'ਇਹ ਰਸਮੀ ਪੱਤਰ ਡਾਕ ਰਾਹੀਂ ਭੇਜੋ:',
    copyScript: 'ਸਕ੍ਰਿਪਟ ਕਾਪੀ ਕਰੋ',
    scriptCopied: 'ਸਕ੍ਰਿਪਟ ਕਾਪੀ ਹੋ ਗਈ!',
    printScript: 'ਵੱਡੇ ਅੱਖਰਾਂ ਵਿੱਚ ਪ੍ਰਿੰਟ ਕਰੋ',
    textToSarah: 'ਧੀ ਸਾਰਾਹ ਨੂੰ ਭੇਜੋ',
    listenSummary: 'ਸ਼ਾਂਤ ਆਵਾਜ਼ ਵਿੱਚ ਸੁਣੋ',
    nowPlaying: 'ਸ਼ਾਂਤ ਗਤੀ ਨਾਲ ਸੁਣਾਇਆ ਜਾ ਰਿਹਾ ਹੈ...',
    originalDoc: 'ਅਸਲ ਚਿੱਠੀ',
    officialForm: 'ਫਾਰਮ CMS-10156',
    sharedWithCaregiver: 'ਧੀ ਸਾਰਾਹ ਨਾਲ ਸਾਂਝਾ ਕੀਤਾ ਗਿਆ',
    caregiverPhoneView: 'ਸਾਰਾਹ ਆਪਣੇ ਫ਼ੋਨ ’ਤੇ ਇਹ ਤੁਰੰਤ ਦੇਖ ਸਕਦੀ ਹੈ',
    realAdvocateTitle: 'ਕੀ ਤੁਸੀਂ ਚਾਹੁੰਦੇ ਹੋ ਕਿ ਕੋਈ ਸਹਾਇਕ ਤੁਹਾਡੇ ਨਾਲ ਕਾਲ ’ਤੇ ਰਹੇ?',
    realAdvocateSubtitle: 'ਸਿਵਿਕਸਾਥੀ ਸਹਾਇਕ ਉਪਲਬਧ',
    realAdvocateDesc: 'ਸਾਡੇ ਮੁਫ਼ਤ ਬਜ਼ੁਰਗ ਸਹਾਇਕ ਕਲੀਨਿਕ ਦੇ ਬਿਲਿੰਗ ਦਫ਼ਤਰ ਨਾਲ 3-ਵੇਅ ਕਾਨਫ਼ਰੰਸ ਕਾਲ ਵਿੱਚ ਸ਼ਾਮਲ ਹੋ ਸਕਦੇ ਹਨ।',
    callAdvocateBtn: '1-800-555-CARE ’ਤੇ ਕਾਲ ਕਰੋ',
    scheduleQuietBtn: 'ਸ਼ਾਂਤ ਸਮਾਂ ਚੁਣੋ',
    seniorHelplinesTitle: 'ਭਰੋਸੇਯੋਗ ਸੀਨੀਅਰ ਹੈਲਪਲਾਈਨਾਂ',
    seniorHelplinesSub: 'ਸਰਕਾਰੀ ਪ੍ਰਮਾਣਿਤ ਸੇਵਾਵਾਂ',
    digiSathiNote: 'ਕਲੀਨਿਕ ਵੱਲੋਂ ਕਾਗਜ਼ਾਤ ਦੁਬਾਰਾ ਭੇਜਣ ’ਤੇ ਮੈਡੀਕੇਅਰ ਅਕਸਰ ਇਹ ਫ਼ੀਸ ਰੱਦ ਕਰ ਦਿੰਦਾ ਹੈ।',
    showEnglishScriptToggle: 'ਅੰਗਰੇਜ਼ੀ ਸਕ੍ਰਿਪਟ (ਸਟਾਫ਼ ਨਾਲ ਗੱਲ ਕਰਨ ਲਈ)',
    showTranslatedScriptToggle: 'ਪੰਜਾਬੀ ਸਕ੍ਰਿਪਟ'
  },
  es: {
    languageLabel: 'Idioma (Language)',
    activeBadge: 'Activo: Español',
    translateNotice: 'Toque cualquier idioma para traducir al instante la explicación, pasos y guion telefónico:',
    reassuringHeadline: 'No se preocupe — no tiene que pagar estos $482.50 de su bolsillo de inmediato.',
    reassuringBody: 'El consultorio de su médico simplemente olvidó adjuntar las notas de rutina de la visita. Una vez que reenvíen el archivo con el código faltante, el procedimiento estándar de Medicare cubre esto.',
    atAGlanceSub: 'De un Vistazo',
    atAGlanceTitle: 'En Palabras Sencillas (Resumen de 30 Segundos)',
    point1Title: 'Qué es realmente esta carta:',
    point2Title: 'Lo que debe pagar en este momento:',
    point3Title: 'Nivel de riesgo y plazos:',
    confusingTermsTitle: 'Decodificador de Jerga — Toque para entender:',
    confusingTermsSub: 'Las cartas oficiales contienen jerga confusa. Toque cualquier etiqueta para ver su significado en lenguaje cotidiano:',
    plainMeaning: 'Significado Sencillo:',
    whatToDoNextTitle: 'Qué Hacer a Continuación',
    roadmapSub: 'Su Guía Paso a Paso',
    doneOf: 'de completados',
    mostImportantBadge: 'Acción Más Importante',
    timeEstimate: 'Toma ~3 minutos',
    jumpToScript: 'Ir al Guion Telefónico abajo ↓',
    noAwkwardCalls: 'Llamadas Telefónicas Sin Estrés',
    readyScriptsTitle: 'Guion Telefónico Listo para Usar',
    phoneScriptTab: 'Guion Telefónico',
    writtenDisputeTab: 'Carta Formal de Disputa',
    phonePrompt: 'Lea esto palabra por palabra a la oficina de facturación:',
    writtenPrompt: 'Copie o envíe por correo esta carta formal de reclamo:',
    copyScript: 'Copiar Texto del Guion',
    scriptCopied: '¡Guion copiado al portapapeles!',
    printScript: 'Imprimir en Letra Grande',
    textToSarah: 'Enviar a Hija Sarah por SMS/WhatsApp',
    listenSummary: 'Escuchar Resumen en Voz Alta',
    nowPlaying: 'Narrando a paso tranquilo...',
    originalDoc: 'Carta Original',
    officialForm: 'Formulario Oficial CMS-10156',
    sharedWithCaregiver: 'Compartido con Sarah (Hija)',
    caregiverPhoneView: 'Sarah puede revisar esta traducción en su teléfono • Puede cofirmar apelaciones',
    realAdvocateTitle: '¿Prefiere que una persona real lo acompañe en la llamada?',
    realAdvocateSubtitle: 'Asesores de DigiSathi Disponibles',
    realAdvocateDesc: 'Nuestros orientadores gratuitos pueden unirse a una llamada de 3 vías con la clínica o Medicare sin ningún costo.',
    callAdvocateBtn: 'Llamar al 1-800-555-CARE',
    scheduleQuietBtn: 'Programar Hora Tranquila',
    seniorHelplinesTitle: 'Líneas de Ayuda y Emergencia para Adultos Mayores',
    seniorHelplinesSub: 'Apoyo Oficial Nacional',
    digiSathiNote: 'Medicare con frecuencia anula este cargo una vez que la clínica reenvía el papeleo. No tiene que pagar esto de su bolsillo ahora.',
    showEnglishScriptToggle: 'Ver Guion en Inglés (para personal de oficina)',
    showTranslatedScriptToggle: 'Ver Guion en Español'
  },
  ml: {
    languageLabel: 'ഭാഷ (Language)',
    activeBadge: 'സജീവം: മലയാളം',
    translateNotice: 'വിശദീകരണവും ഘട്ടങ്ങളും മലയാളത്തിൽ കാണാൻ ഇവിടെ ടാപ്പ് ചെയ്യുക:',
    reassuringHeadline: 'ഭയപ്പെടേണ്ടതില്ല — ഈ $482.50 നിങ്ങളുടെ സ്വന്തം പോക്കറ്റിൽ നിന്ന് ഇപ്പോൾ നൽകേണ്ടതില്ല.',
    reassuringBody: 'നിങ്ങളുടെ ഡോക്ടറുടെ ഓഫീസ് പതിവ് ക്ലിനിക് ചാർട്ട് കുറിപ്പ് ചേർക്കാൻ മറന്നുപോയി. ആവശ്യമായ കോഡ് സഹിതം അവർ വീണ്ടും ഫയൽ ചെയ്യുമ്പോൾ മെഡികെയർ ഇത് സാധാരണയായി നൽകും.',
    atAGlanceSub: 'ഒറ്റനോട്ടത്തിൽ',
    atAGlanceTitle: 'ലളിതമായ വാക്കുകളിൽ (30 സെക്കൻഡ് സംഗ്രഹം)',
    point1Title: 'ഈ കത്ത് എന്താണ്:',
    point2Title: 'നിങ്ങൾ ഇപ്പോൾ നൽകേണ്ടത്:',
    point3Title: 'നിങ്ങളുടെ സമയപരിധിയും റിസ്കും:',
    confusingTermsTitle: 'കഠിനമായ വാക്കുകളുടെ ലളിതമായ അർത്ഥം:',
    confusingTermsSub: 'ഔദ്യോഗിക കത്തുകളിലെ സാങ്കേതിക പദങ്ങൾ ലളിതമായി മനസ്സിലാക്കാം:',
    plainMeaning: 'ലളിതമായ അർത്ഥം:',
    whatToDoNextTitle: 'അടുത്തതായി ചെയ്യേണ്ടത്',
    roadmapSub: 'നിങ്ങളുടെ വ്യക്തമായ വഴികാട്ടി',
    doneOf: 'പൂർത്തിയായി',
    mostImportantBadge: 'ഏറ്റവും പ്രധാനപ്പെട്ട നടപടി',
    timeEstimate: '~3 മിനിറ്റ് എടുക്കും',
    jumpToScript: 'ഫോൺ സംഭാഷണത്തിലേക്ക് പോകുക ↓',
    noAwkwardCalls: 'മടിയില്ലാതെ സംസാരിക്കാം',
    readyScriptsTitle: 'തയ്യാറാക്കിയ ഫോൺ സംഭാഷണം',
    phoneScriptTab: 'ഫോൺ സ്ക്രിപ്റ്റ്',
    writtenDisputeTab: 'എഴുത്തുപൂർവ്വമായ അപ്പീൽ',
    phonePrompt: 'ബില്ലിംഗ് സെക്രട്ടറിയോട് ഇത് വായിച്ചു കേൾപ്പിക്കുക:',
    writtenPrompt: 'ഈ അപ്പീൽ കത്ത് തപാലിൽ അയക്കുക:',
    copyScript: 'സ്ക്രിപ്റ്റ് കോപ്പി ചെയ്യുക',
    scriptCopied: 'സ്ക്രിപ്റ്റ് കോപ്പി ചെയ്തു!',
    printScript: 'വലിയ അക്ഷരങ്ങളിൽ പ്രിന്റ് ചെയ്യുക',
    textToSarah: 'മകൾ സാറയ്ക്ക് അയക്കുക',
    listenSummary: 'ലളിതമായ ശബ്ദത്തിൽ കേൾക്കൂ',
    nowPlaying: 'ശാന്തമായ സ്വരത്തിൽ വായിക്കുന്നു...',
    originalDoc: 'യഥാർത്ഥ കത്ത്',
    officialForm: 'ഫോം CMS-10156',
    sharedWithCaregiver: 'മകൾ സാറയുമായി പങ്കിട്ടു',
    caregiverPhoneView: 'സാറയ്ക്ക് സ്വന്തം ഫോണിൽ ഇത് തത്സമയം കാണാം',
    realAdvocateTitle: 'നിങ്ങളോടൊപ്പം സംസാരിക്കാൻ ഒരു സഹായിയെ വേണമെന്നുണ്ടോ?',
    realAdvocateSubtitle: 'ഡിജിസാഥി സഹായികൾ തയ്യാറാണ്',
    realAdvocateDesc: 'ഞങ്ങളുടെ സൗജന്യ ഹെൽപ്പ്‌ലൈൻ പ്രവർത്തകർക്ക് ക്ലിനിക്കിന്റെ ബില്ലിംഗ് ഓഫീസുമായി 3-വേ കോളിൽ നിങ്ങളോടൊപ്പം സംസാരിക്കാൻ കഴിയും.',
    callAdvocateBtn: '1-800-555-CARE ലേക്ക് വിളിക്കുക',
    scheduleQuietBtn: 'സമയം നിശ്ചയിക്കുക',
    seniorHelplinesTitle: 'മുതിർന്ന പൗരന്മാരുടെ ഹെൽപ്പ്‌ലൈൻ നമ്പറുകൾ',
    seniorHelplinesSub: 'ഔദ്യോഗിക ദേശീയ സേവനങ്ങൾ',
    digiSathiNote: 'ക്ലിനിക് സാധാരണ പേപ്പറുകൾ വീണ്ടും സമർപ്പിക്കുമ്പോൾ മെഡികെയർ ഈ ബിൽ ഒഴിവാക്കുന്നു. നിങ്ങൾ സ്വന്തമായി പണം നൽകേണ്ടതില്ല.',
    showEnglishScriptToggle: 'ഇംഗ്ലീഷ് സ്ക്രിപ്റ്റ് (ഓഫീസ് സ്റ്റാഫിനോട് സംസാരിക്കാൻ)',
    showTranslatedScriptToggle: 'മലയാളം സ്ക്രിപ്റ്റ്'
  },
  ur: {
    languageLabel: 'زبان (Language)',
    activeBadge: 'فعال: اردو',
    translateNotice: 'وضاحت، ضروری اقدامات اور فون اسکرپٹ اردو میں دیکھنے کے لیے ٹیپ کریں:',
    reassuringHeadline: 'پریشان نہ ہوں — آپ کو یہ $482.50 فوراً اپنی جیب سے ادا کرنے کی ضرورت نہیں ہے۔',
    reassuringBody: 'آپ کے ڈاکٹر کا دفتر معمول کا وزٹ چارٹ نوٹ منسلک کرنا بھول گیا تھا۔ جب وہ مطلوبہ کوڈ کے ساتھ دوبارہ فائل بھیجیں گے تو میڈیکیئر اسے کَور کر لے گا۔',
    atAGlanceSub: 'ایک نظر میں',
    atAGlanceTitle: 'آسان الفاظ میں (30 سیکنڈ کا خلاصہ)',
    point1Title: 'یہ خط دراصل کیا ہے:',
    point2Title: 'آپ کو ابھی کیا ادا کرنا ہے:',
    point3Title: 'آپ کے خطرے کی سطح اور آخری تاریخ:',
    confusingTermsTitle: 'مشکل اصطلاحات کا آسان مطلب:',
    confusingTermsSub: 'سرکاری خطوط کے تکنیکی الفاظ کا روزمرہ اردو میں مفہوم:',
    plainMeaning: 'آسان مطلب:',
    whatToDoNextTitle: 'آگے کیا کرنا ہے',
    roadmapSub: 'آپ کی واضح رہنمائی',
    doneOf: 'مکمل ہوئے',
    mostImportantBadge: 'سب سے اہم قدم',
    timeEstimate: 'تقریباً 3 منٹ لگیں گے',
    jumpToScript: 'نیچے فون اسکرپٹ پر جائیں ↓',
    noAwkwardCalls: 'بغیر کسی ہچکچاہٹ کے بات کریں',
    readyScriptsTitle: 'تیار فون اسکرپٹ',
    phoneScriptTab: 'فون اسکرپٹ',
    writtenDisputeTab: 'تحریری درخواست',
    phonePrompt: 'بلنگ سیکرٹری کو یہ لفظ بہ لفظ پڑھ کر سنائیں:',
    writtenPrompt: 'یہ خط کاپی کر کے ڈاک سے بھیجیں:',
    copyScript: 'اسکرپٹ کاپی کریں',
    scriptCopied: 'اسکرپٹ کاپی ہو گیا!',
    printScript: 'بڑے حروف میں پرنٹ کریں',
    textToSarah: 'بیٹی سارہ کو بھیجیں',
    listenSummary: 'آسان آواز میں سنیں',
    nowPlaying: 'پُرسکون آواز میں پڑھا جا رہا ہے...',
    originalDoc: 'اصل خط',
    officialForm: 'فارم CMS-10156',
    sharedWithCaregiver: 'بیٹی سارہ کے ساتھ شیئر کیا گیا',
    caregiverPhoneView: 'سارہ اپنے فون پر یہ ترجمہ دیکھ سکتی ہیں',
    realAdvocateTitle: 'کیا آپ چاہتے ہیں کہ کوئی مددگار آپ کے ساتھ کال پر رہے؟',
    realAdvocateSubtitle: 'ڈِجی ساتھی مددگار دستیاب ہیں',
    realAdvocateDesc: 'ہمارے مفت بزرگ معاونین ڈاکٹر کے بلنگ ڈپارٹمنٹ سے 3 طرفہ کال پر آپ کی مدد کر سکتے ہیں۔',
    callAdvocateBtn: '1-800-555-CARE پر کال کریں',
    scheduleQuietBtn: 'پُرسکون وقت طے کریں',
    seniorHelplinesTitle: 'بزرگ شہریوں کے لیے ہیلپ لائنز',
    seniorHelplinesSub: 'سرکاری قومی معاونت',
    digiSathiNote: 'جب کلینک معمول کے کاغذات دوبارہ جمع کراتا ہے تو میڈیکیئر اکثر یہ فیس ختم کر دیتا ہے۔ آپ کو فوراً پیسے دینے کی ضرورت نہیں ہے۔',
    showEnglishScriptToggle: 'انگریزی اسکرپٹ (آفس اسٹاف کے لیے)',
    showTranslatedScriptToggle: 'اردو اسکرپٹ'
  }
};

export const PRECOMPUTED_TRANSLATIONS: Record<string, Record<string, Partial<ExplanationResult>>> = {
  'medicare-part-b': {
    en: {
      documentType: 'Medicare Summary Notice (Form CMS-10156)',
      plainSummary: 'Don’t panic — you do not need to pay this $482.50 out of pocket. Your doctor’s office simply forgot to attach their routine office visit chart note. Once they resubmit the file with the missing code, Medicare standard procedure covers this.',
      atAGlance: {
        whatItIs: "Medicare did not pay for Dr. Robert Chen's clinic visit on Oct 12th because a routine administrative approval form was left out of the packet.",
        whatYouOwe: "The clinic printed a bill for $482.50, but this is almost always resolved when the clinic attaches their clinical notes and resubmits code 99214.",
        riskAndTiming: "Low risk, provided you or Sarah make a 5-minute phone call to Dr. Chen's office before December 14, 2024."
      },
      urgency: 'soon',
      urgencyNote: 'Needs Attention by Dec 14 • 21 days remaining',
      deadline: 'December 14, 2024',
      glossaryTerms: [
        {
          term: 'Section 1862(a)(1)(A)',
          definition: 'A legal Medicare clause that simply means: "The computer didn\'t see the doctor\'s visit summary note attached to this bill." It does not mean the visit was rejected medically.'
        },
        {
          term: 'Remittance PR-204',
          definition: 'An internal accounting code meaning: "Doctor\'s billing service must resubmit with clinical documentation." Once Dr. Chen\'s office attaches the file, Medicare processes it.'
        },
        {
          term: 'Beneficiary Liability',
          definition: 'A formal term indicating the initial charge before supplemental insurance or doctor re-billing takes effect. You are NOT required to write a check immediately.'
        },
        {
          term: 'Redetermination Form',
          definition: 'A straightforward 1-page free appeal form you or your daughter Sarah can submit if Dr. Chen\'s office ever fails to resubmit within 30 days.'
        }
      ],
      nextSteps: [
        {
          title: 'Step 1: Verify this was your appointment',
          detail: 'Confirmed: Dr. Robert Chen (Cardiology Clinic), appointment date October 12, 2024.',
          mostUrgent: false,
          completed: true
        },
        {
          title: 'Step 2: Call Dr. Chen\'s Billing Department',
          detail: 'Call their clinic office directly at (555) 019-2849. Ask for billing and read the ready script provided below.',
          mostUrgent: true,
          completed: false
        },
        {
          title: 'Step 3: Only if clinic refuses (10 days buffer)',
          detail: 'If the clinic does not resubmit within 10 business days, file a 1-page free Medicare appeal before December 14.',
          mostUrgent: false,
          completed: false
        }
      ],
      callScript: "“Hello, my name is Margaret Miller. I am calling about notice CMS-10156 for claim #8839201-B from my visit on October 12th.\n\nMedicare informed me that code 99214 was denied because routine clinical notes were omitted. Could your billing coordinator please attach the doctor's chart notes and resubmit this claim under remark code PR-204 so that I am not erroneously billed $482.50?”"
    },
    hi: {
      documentType: 'मेडिकेयर सारांश सूचना (फॉर्म CMS-10156)',
      plainSummary: 'घबराएं नहीं — आपको यह $482.50 तुरंत अपनी जेब से देने की आवश्यकता नहीं है। 12 अक्टूबर को डॉ. रॉबर्ट चेन की क्लिनिक विज़िट का भुगतान मेडिकेयर ने नहीं किया क्योंकि नियमित प्रशासनिक चार्ट नोट संलग्न करना छूट गया था।',
      atAGlance: {
        whatItIs: '12 अक्टूबर को डॉ. रॉबर्ट चेन की क्लिनिक विज़िट का भुगतान मेडिकेयर ने नहीं किया क्योंकि नियमित प्रशासनिक चार्ट नोट संलग्न करना छूट गया था।',
        whatYouOwe: 'क्लिनिक ने $482.50 का बिल भेजा है, लेकिन जब क्लिनिक अपने मेडिकल नोट्स संलग्न करके कोड 99214 पुनः सबमिट करेगा तो यह शुल्क हट जाएगा।',
        riskAndTiming: 'कम जोखिम, बशर्ते आप या सारा 14 दिसंबर, 2024 से पहले डॉ. चेन के कार्यालय में 3-5 मिनट का कॉल कर लें।'
      },
      urgency: 'soon',
      urgencyNote: '14 दिसंबर तक ध्यान देने की आवश्यकता • 21 दिन शेष',
      deadline: '14 दिसंबर 2024',
      glossaryTerms: [
        {
          term: 'धारा 1862(a)(1)(A)',
          definition: 'एक कानूनी मेडिकेयर नियम जिसका सीधा अर्थ है: "कंप्यूटर सिस्टम को डॉक्टर का चार्ट नोट नहीं मिला।" इसका मतलब यह बिल्कुल नहीं है कि आपकी जांच खारिज कर दी गई है।'
        },
        {
          term: 'रेमिटेंस कोड PR-204',
          definition: 'आंतरिक बिलिंग कोड जिसका अर्थ है: "डॉक्टर के कार्यालय को मेडिकल कागज़ात जोड़कर दोबारा भेजना होगा।" जब डॉ. चेन का कार्यालय इसे भेजेगा तो बिल पास हो जाएगा।'
        },
        {
          term: 'लाभार्थी देनदारी (Liability)',
          definition: 'कागजी त्रुटि या दोबारा समीक्षा से पहले का प्रारंभिक बिल। आपको तुरंत चेक लिखने की आवश्यकता नहीं है।'
        },
        {
          term: 'पुनर्निर्धारण फॉर्म',
          definition: 'एक साधारण 1-पेज का निःशुल्क फॉर्म जिसे आप या बेटी सारा भर सकते हैं यदि क्लिनिक 30 दिनों में कागजात दोबारा नहीं भेजता।'
        }
      ],
      nextSteps: [
        {
          title: 'कदम 1: पुष्टि करें कि यह आपकी ही अपॉइंटमेंट थी',
          detail: 'पुष्टीकृत: डॉ. रॉबर्ट चेन (कार्डियोलॉजी क्लिनिक), विज़िट तिथि 12 अक्टूबर 2024.',
          mostUrgent: false,
          completed: true
        },
        {
          title: 'कदम 2: डॉ. चेन के बिलिंग विभाग को कॉल करें',
          detail: 'उनके क्लिनिक पर (555) 019-2849 पर सीधे कॉल करें। बिलिंग विभाग से बात करें और नीचे दिया गया तैयार संवाद पढ़ें।',
          mostUrgent: true,
          completed: false
        },
        {
          title: 'कदम 3: केवल यदि क्लिनिक मना करे (10 दिन की छूट)',
          detail: 'यदि क्लिनिक 10 व्यावसायिक दिनों में दोबारा दावा जमा नहीं करता, तो 14 दिसंबर से पहले 1-पेज का निःशुल्क मेडिकेयर अपील फॉर्म भरें।',
          mostUrgent: false,
          completed: false
        }
      ],
      callScript: '“नमस्ते, मेरा नाम मार्गरेट मिलर है। मैं 12 अक्टूबर की अपनी विजिट के नोटिस CMS-10156 (दावा #8839201-B) के संबंध में कॉल कर रही हूँ।\n\nमेडिकेयर ने मुझे सूचित किया कि कोड 99214 को इसलिए अस्वीकार किया गया क्योंकि क्लिनिकल दस्तावेज संलग्न नहीं थे। क्या आपके बिलिंग समन्वयक डॉक्टर के चार्ट नोट्स संलग्न कर रीमार्क कोड PR-204 के तहत इस क्लेम को पुनः सबमिट कर सकते हैं ताकि मुझसे गलती से $482.50 न लिया जाए?”'
    },
    ta: {
      documentType: 'மெடிகேர் சுருக்க அறிவிப்பு (படிவம் CMS-10156)',
      plainSummary: 'பயப்பட வேண்டாம் — இந்த $482.50 தொகையை நீங்கள் உடனடியாக உங்கள் கையில் இருந்து செலுத்த வேண்டியதில்லை. அக்டோபர் 12 அன்று நடந்த டாக்டர் ராபர்ட் சென் கிளினிக் வருகைக்கு வழக்கமான நிர்வாக ஒப்புதல் படிவம் விடுபட்டதால் மெடிகேர் தொகையை செலுத்தவில்லை.',
      atAGlance: {
        whatItIs: 'அக்டோபர் 12 அன்று நடந்த டாக்டர் ராபர்ட் சென் கிளினிக் வருகைக்கு வழக்கமான நிர்வாக ஒப்புதல் படிவம் விடுபட்டதால் மெடிகேர் தொகையை செலுத்தவில்லை.',
        whatYouOwe: 'மருத்துவமனை $482.50 பில் அனுப்பியுள்ளது. மருத்துவமனை தனது மருத்துவ குறிப்புகளை இணைத்து குறியீடு 99214-ஐ மீண்டும் சமர்ப்பித்தால் இந்த கட்டணம் ரத்தாகிவிடும்.',
        riskAndTiming: 'குறைந்த ஆபத்து, நீங்களோ அல்லது சாராவோ டிசம்பர் 14, 2024க்குள் டாக்டர் சென் அலுவலகத்திற்கு 3 நிமிட அழைப்பை மேற்கொண்டால் போதும்.'
      },
      urgency: 'soon',
      urgencyNote: 'டிசம்பர் 14க்குள் கவனம் தேவை • 21 நாட்கள் உள்ளன',
      deadline: 'டிசம்பர் 14, 2024',
      glossaryTerms: [
        {
          term: 'பிரிவு 1862(a)(1)(A)',
          definition: 'மெடிகேர் சட்டப்பிரிவு. இதன் பொருள்: "மருத்துவரின் வருகை குறிப்பு கோப்பில் இல்லை." இது மருத்துவ ரீதியாக நிராகரிக்கப்பட்டதாக அர்த்தமில்லை.'
        },
        {
          term: 'ரெமிட்டன்ஸ் PR-204',
          definition: 'கணக்கியல் குறியீடு: "மருத்துவர் அலுவலகம் கூடுதல் ஆவணங்களை இணைத்து மீண்டும் சமர்ப்பிக்க வேண்டும்." சமர்ப்பித்தவுடன் மெடிகேர் ஏற்கும்.'
        },
        {
          term: 'பயனாளி பொறுப்பு',
          definition: 'ஆரம்ப கணக்கீட்டு தொகை. நீங்கள் உடனடியாக காசோலை எழுதவோ கட்டணம் செலுத்தவோ தேவையில்லை.'
        },
        {
          term: 'மறுபரிசீலனை படிவம்',
          definition: 'மருத்துவமனை ஆவணங்களை சமர்ப்பிக்க தவறினால், நீங்கள் அல்லது உங்கள் மகள் சாரா அனுப்பக்கூடிய எளிய 1-பக்க இலவச படிவம்.'
        }
      ],
      nextSteps: [
        {
          title: 'படி 1: இது உங்கள் சந்திப்புதான் என்பதை உறுதிப்படுத்தவும்',
          detail: 'உறுதி செய்யப்பட்டது: டாக்டர் ராபர்ட் சென் (இதயவியல் பிரிவு), வருகை தேதி அக்டோபர் 12, 2024.',
          mostUrgent: false,
          completed: true
        },
        {
          title: 'படி 2: டாக்டர் சென்னின் பில்லிங் துறைக்கு அழைக்கவும்',
          detail: 'நேரடியாக மருத்துவமனைக்கு (555) 019-2849 என்ற எண்ணில் அழைக்கவும். பில்லிங் துறையிடம் கீழே உள்ள வாக்கியங்களை படித்துக் காட்டவும்.',
          mostUrgent: true,
          completed: false
        },
        {
          title: 'படி 3: மருத்துவமனை மறுத்தால் மட்டுமே (10 நாட்கள் அவகாசம்)',
          detail: '10 நாட்களுக்குள் மருத்துவமனை திருத்தவில்லை என்றால், டிசம்பர் 14க்குள் எளிய மெடிகேர் மேல்முறையீட்டு படிவத்தை சமர்ப்பிக்கவும்.',
          mostUrgent: false,
          completed: false
        }
      ],
      callScript: '“வணக்கம், என் பெயர் மார்கரெட் மில்லர். அக்டோபர் 12 எனது மருத்துவ வருகைக்கான நோட்டீஸ் CMS-10156 மற்றும் க்ளெய்ம் எண் #8839201-B தொடர்பாக அழைக்கிறேன்.\n\nமருத்துவ ஆவணங்கள் விடுபட்டதால் குறியீடு 99214 நிராகரிக்கப்பட்டதாக மெடிகேர் கூறியுள்ளது. என்னிடம் தவறாக $482.50 வசூலிக்கப்படாமல் இருக்க, மருத்துவரின் குறிப்புகளை இணைத்து PR-204 கீழ் மீண்டும் சமர்ப்பிக்க முடியுமா?”'
    },
    te: {
      documentType: 'మెడికేర్ సారాంశ నోటీసు (ఫారమ్ CMS-10156)',
      plainSummary: 'కంగారు పడకండి — మీరు ఈ $482.50 ని మీ జేబు నుండి వెంటనే చెల్లించాల్సిన అవసరం లేదు. అక్టోబర్ 12న డాక్టర్ రాబర్ట్ చెన్ క్లినిక్ సందర్శన కోసం అధికారిక ఆమోద ఫారమ్ జతచేయకపోవడం వల్ల మెడికేర్ చెల్లించలేదు.',
      atAGlance: {
        whatItIs: 'అక్టోబర్ 12న డాక్టర్ రాబర్ట్ చెన్ క్లినిక్ సందర్శన కోసం అధికారిక ఆమోద ఫారమ్ జతచేయకపోవడం వల్ల మెడికేర్ చెల్లించలేదు.',
        whatYouOwe: 'క్లినిక్ $482.50 బిల్లు పంపింది, కానీ క్లినిక్ వారి మెడికల్ నోట్స్ జతచేసి కోడ్ 99214ను తిరిగి సమర్పిస్తే ఈ బిల్లు రద్దవుతుంది.',
        riskAndTiming: 'చాలా తక్కువ రిస్క్, మీరు లేదా సారా డిసెంబర్ 14, 2024 లోపు డాక్టర్ చెన్ కార్యాలయానికి 3 నిమిషాల కాల్ చేస్తే సరిపోతుంది.'
      },
      urgency: 'soon',
      urgencyNote: 'డిసెంబర్ 14 లోపు పరిశీలించాలి • 21 రోజులు మిగిలి ఉన్నాయి',
      deadline: 'డిసెంబర్ 14, 2024',
      glossaryTerms: [
        {
          term: 'సెక్షన్ 1862(a)(1)(A)',
          definition: 'మెడికేర్ నిబంధన: "డాక్టర్ క్లినికల్ చార్ట్ నోట్ ఫైల్‌లో కనిపించలేదు." ఇది వైద్యపరంగా నిరాకరణ కాదు.'
        },
        {
          term: 'రెమిటెన్స్ కోడ్ PR-204',
          definition: 'అంతర్గత కోడ్: "క్లినిక్ వైద్య పత్రాలను జతచేసి తిరిగి సమర్పించాలి." వారు పంపిన వెంటనే ఆమోదించబడుతుంది.'
        },
        {
          term: 'లబ్ధిదారుని బాధ్యత',
          definition: 'ప్రాథమిక నోటీసు మొత్తం. మీరు వెంటనే చెల్లించవలసిన అవసరం లేదు.'
        },
        {
          term: 'పునఃపరిశీలన ఫారమ్',
          definition: 'క్లినిక్ స్పందించకపోతే మీరు లేదా మీ కుమార్తె సారా సమర్పించగల 1-పేజీ ఉచిత అప్పీల్ ఫారమ్.'
        }
      ],
      nextSteps: [
        {
          title: 'దశ 1: ఇది మీ అపాయింట్‌మెంటే అని నిర్ధారించుకోండి',
          detail: 'నిర్ధారించబడింది: డాక్టర్ రాబర్ట్ చెన్ (కార్డియాలజీ క్లినిక్), అక్టోబర్ 12, 2024.',
          mostUrgent: false,
          completed: true
        },
        {
          title: 'దశ 2: డాక్టర్ చెన్ బిల్లింగ్ విభాగానికి కాల్ చేయండి',
          detail: 'నేరుగా క్లినిక్ కార్యాలయానికి (555) 019-2849 లో కాల్ చేయండి. క్రింద ఉన్న సిద్ధంగా ఉన్న స్క్రిప్ట్ చదవండి.',
          mostUrgent: true,
          completed: false
        },
        {
          title: 'దశ 3: క్లినిక్ తిరస్కరిస్తే మాత్రమే (10 రోజుల వ్యవధి)',
          detail: '10 పనిదినాలలో క్లినిక్ సరిదిద్దకపోతే, డిసెంబర్ 14 లోపు 1-పేజీ ఉచిత మెడికేర్ అప్పీల్ దాఖలు చేయండి.',
          mostUrgent: false,
          completed: false
        }
      ],
      callScript: '“నమస్తే, నా పేరు మార్గరెట్ మిల్లర్. అక్టోబర్ 12 నాటి సందర్శనకు సంబంధించిన నోటీసు CMS-10156 (క్లెయిమ్ #8839201-B) గురించి కాల్ చేస్తున్నాను.\n\nమెడికల్ రికార్డులు జతచేయనందున కోడ్ 99214 తిరస్కరించబడిందని మెడికేర్ తెలిపింది. నాపై తప్పుగా $482.50 భారం పడకుండా ఉండటానికి, దయచేసి డాక్టర్ చార్ట్ నోట్స్ జతచేసి PR-204 క్రింద తిరిగి సమర్పించగలరా?”'
    },
    bn: {
      documentType: 'মেডিকেয়ার সারসংক্ষেপ নোটিশ (ফর্ম CMS-10156)',
      plainSummary: 'আতঙ্কিত হবেন না — এই $482.50 আপনাকে এখনই নিজের পকেট থেকে দিতে হবে না। ১২ অক্টোবর ডাঃ রবার্ট চেনের ক্লিনিক পরিদর্শনের বিল মেডিকেয়ার পরিশোধ করেনি কারণ ফাইলে একটি নিয়মিত প্রশাসনিক অনুমোদন ফর্ম অনুপস্থিত ছিল।',
      atAGlance: {
        whatItIs: '১২ অক্টোবর ডাঃ রবার্ট চেনের ক্লিনিক পরিদর্শনের বিল মেডিকেয়ার পরিশোধ করেনি কারণ ফাইলে একটি নিয়মিত প্রশাসনিক অনুমোদন ফর্ম অনুপস্থিত ছিল।',
        whatYouOwe: 'ক্লিনিক $482.50 ডলারের বিল পাঠিয়েছে, তবে ক্লিনিক তাদের মেডিকেল নোট যুক্ত করে কোড 99214 পুনরায় জমা দিলে এই বিল বাতিল হয়ে যাবে।',
        riskAndTiming: 'খুব কম ঝুঁকি, যদি আপনি বা সারা ১৪ ডিসেম্বর, ২০২৪ এর আগে ডাঃ চেনের অফিসে ৩ মিনিটের একটি ফোন কল করেন।'
      },
      urgency: 'soon',
      urgencyNote: '১৪ ডিসেম্বরের মধ্যে করণীয় • ২১ দিন বাকি আছে',
      deadline: '১৪ ডিসেম্বর ২০২৪',
      glossaryTerms: [
        {
          term: 'ধারা 1862(a)(1)(A)',
          definition: 'মেডিকেয়ারের সাধারণ নিয়ম: "কম্পিউটার ফাইলে ডাক্তারের ভিজিট নোট খুঁজে পায়নি।" এটি চিকিৎসার কোনো অস্বীকৃতি নয়।'
        },
        {
          term: 'রেমিট্যান্স PR-204',
          definition: 'বিলিং কোড: "ডাক্তারের অফিসকে মেডিকেল ডকুমেন্টেশন সংযুক্ত করে পুনরায় জমা দিতে হবে।" জমা দিলেই বিল পাশ হবে।'
        },
        {
          term: 'সুবিধাভোগী দায়ভার',
          definition: 'কাগজপত্রের ত্রুটি ঠিক করার আগের প্রাথমিক হিসাব। এখনই পকেট থেকে টাকা দিতে হবে না।'
        },
        {
          term: 'পুনর্বিবেচনা ফর্ম',
          definition: 'ক্লিনিক বিলম্ব করলে আপনি বা আপনার মেয়ে সারাহ যে ১-পৃষ্ঠার বিনামূল্যের আপিল ফর্ম পাঠাতে পারেন।'
        }
      ],
      nextSteps: [
        {
          title: 'পদক্ষেপ ১: নিশ্চিত করুন এটি আপনারই অ্যাপয়েন্টমেন্ট ছিল',
          detail: 'নিশ্চিত করা হয়েছে: ডাঃ রবার্ট চেন (কার্ডিওলজি ক্লিনিক), পরিদর্শনের তারিখ ১২ অক্টোবর, ২০২৪।',
          mostUrgent: false,
          completed: true
        },
        {
          title: 'পদক্ষেপ ২: ডাঃ চেনের বিলিং বিভাগে ফোন করুন',
          detail: 'সরাসরি ক্লিনিকের নম্বরে (555) 019-2849 এ ফোন করুন এবং নিচে প্রস্তুত স্ক্রিপ্টটি পড়ে শোনান।',
          mostUrgent: true,
          completed: false
        },
        {
          title: 'পদক্ষেপ ৩: কেবল ক্লিনিক অসম্মত হলে (১০ দিনের সুযোগ)',
          detail: '১০ কার্যদিবসের মধ্যে ক্লিনিক সমাধান না করলে, ১৪ ডিসেম্বরের পূর্বে ১-পৃষ্ঠার মেডিকেয়ার আপিল ফর্ম জমা দিন।',
          mostUrgent: false,
          completed: false
        }
      ],
      callScript: '“নমস্কার, আমার নাম মার্গারেট মিলার। ১২ অক্টোবরের ভিজিটের নোটিশ CMS-10156 এবং দাবি #8839201-B প্রসঙ্গে ফোন করছি।\n\nমেডিকেয়ার জানিয়েছে পর্যাপ্ত মেডিকেল ডকুমেন্ট না থাকার কারণে কোড 99214 বাতিল হয়েছে। আমার ওপর যেন ভুল করে $482.50 চার্জ না আসে, সেজন্য দয়া করে ডাক্তারের চার্ট নোট সংযুক্ত করে PR-204 কোডের অধীনে এটি পুনরায় জমা দিতে পারবেন?”'
    },
    mr: {
      documentType: 'मेडिकेअर सारांश सूचना (फॉर्म CMS-10156)',
      plainSummary: 'घाबरू नका — हे $482.50 तुम्हाला स्वतःच्या खिशातून त्वरित भरण्याची गरज नाही. १२ ऑक्टोबर रोजी डॉ. रॉबर्ट चेन यांच्या क्लिनिक भेटीचे बिल मेडिकेअरने नाकारले कारण अर्जात नियमित प्रशासकीय मंजुरी फॉर्म जोडला नव्हता.',
      atAGlance: {
        whatItIs: '१२ ऑक्टोबर रोजी डॉ. रॉबर्ट चेन यांच्या क्लिनिक भेटीचे बिल मेडिकेअरने नाकारले कारण अर्जात नियमित प्रशासकीय मंजुरी फॉर्म जोडला नव्हता.',
        whatYouOwe: 'क्लिनिकने $482.50 चे बिल पाठवले आहे, परंतु क्लिनिकने त्यांचे वैद्यकीय अहवाल जोडून कोड 99214 पुन्हा सबमिट केल्यास हे बिल रद्द होईल.',
        riskAndTiming: 'अतिशय कमी जोखीम, फक्त तुम्ही किंवा साराने १४ डिसेंबर २०२४ पूर्वी डॉ. चेन यांच्या कार्यालयात ३ मिनिटांचा फोन करणे आवश्यक आहे.'
      },
      urgency: 'soon',
      urgencyNote: '१४ डिसेंबरपर्यंत लक्ष देणे आवश्यक • २१ दिवस बाकी',
      deadline: '१४ डिसेंबर २०२४',
      glossaryTerms: [
        {
          term: 'कलम 1862(a)(1)(A)',
          definition: 'मेडिकेअरचा कायदेशीर नियम: "फाइलमध्ये डॉक्टरांच्या तपासणीच्या नोट्स आढळल्या नाहीत." हा वैद्यकीय नकार नाही.'
        },
        {
          term: 'रेमिटन्स PR-204',
          definition: 'अकाउंटिंग कोड: "क्लिनिकने वैद्यकीय नोंदी जोडून पुन्हा दावा सादर करावा." सादर केल्यावर मेडिकेअर रक्कम मंजूर करते.'
        },
        {
          term: 'लाभार्थी उत्तरदायित्व',
          definition: 'कागदपत्रांची पूर्तता करण्यापूर्वीचे प्राथमिक बिल. तुम्हाला त्वरित चेक देण्याची गरज नाही.'
        },
        {
          term: 'पुनर्निर्धारण अर्ज',
          definition: 'क्लिनिकने ३० दिवसांत पूर्तता न केल्यास तुम्ही किंवा तुमची मुलगी सारा सादर करू शकणारा १ पानाचा मोफत अपील अर्ज.'
        }
      ],
      nextSteps: [
        {
          title: 'पायरी १: ही तुमचीच अपॉइंटमेंट होती याची खात्री करा',
          detail: 'खात्री झाली: डॉ. रॉबर्ट चेन (हृदयविकार क्लिनिक), तारीख १२ ऑक्टोबर २०२४.',
          mostUrgent: false,
          completed: true
        },
        {
          title: 'पायरी २: डॉ. चेन यांच्या बिलिंग विभागाशी संपर्क साधा',
          detail: 'थेट क्लिनिकवर (555) 019-2849 वर फोन करा आणि खाली दिलेला तयार संवाद वाचून दाखवा.',
          mostUrgent: true,
          completed: false
        },
        {
          title: 'पायरी ३: केवळ क्लिनिकने नकार दिल्यास (१० दिवसांची मुदत)',
          detail: '१० कामकाजाच्या दिवसांत क्लिनिकने दुरुस्ती न केल्यास, १४ डिसेंबरपूर्वी १ पानाचा मोफत मेडिकेअर अपील अर्ज भरा.',
          mostUrgent: false,
          completed: false
        }
      ],
      callScript: '“नमस्कार, माझे नाव मार्गारेट मिलर आहे. १२ ऑक्टोबरच्या भेटीच्या नोटीस CMS-10156 आणि क्लेम क्रमांक #8839201-B बाबत मी फोन करत आहे।\n\nमेडिकेअरने कळवले आहे की क्लिनिकल कागदपत्रे नसल्यामुळे कोड 99214 नाकारला गेला. माझ्यावर चुकीच्या पद्धतीने $482.50 चा बोजा पडू नये म्हणून कृपया डॉक्टरांचे चार्ट नोट्स जोडून कोड PR-204 अंतर्गत हा क्लेम पुन्हा सादर कराल का?”'
    },
    gu: {
      documentType: 'મેડિકેર સારાંશ સૂચના (ફોર્મ CMS-10156)',
      plainSummary: 'ચિંતા કરશો નહીં — તમારે આ $482.50 તાત્કાલિક તમારા ખિસ્સામાંથી ચૂકવવાની જરૂર નથી. 12 ઑક્ટોબરે ડૉ. રોબર્ટ ચેનની ક્લિનિક મુલાકાતનું બિલ મેડિકેરે ચૂકવ્યું નથી કારણ કે ફાઇલમાં નિયમિત વહીવટી મંજૂરી ફોર્મ ખૂટતું હતું.',
      atAGlance: {
        whatItIs: '12 ઑક્ટોબરે ડૉ. રોબર્ટ ચેનની ક્લિનિક મુલાકાતનું બિલ મેડિકેરે ચૂકવ્યું નથી કારણ કે ફાઇલમાં નિયમિત વહીવટી મંજૂરી ફોર્મ ખૂટતું હતું.',
        whatYouOwe: 'ક્લિનિકે $482.50 નું બિલ મોકલ્યું છે, પરંતુ ક્લિનિક તેમના મેડિકલ નોટ્સ જોડીને કોડ 99214 ફરીથી સબમિટ કરશે ત્યારે આ રકમ માફ થઈ જશે.',
        riskAndTiming: 'ખૂબ ઓછું જોખમ, માત્ર તમારે અથવા સારાએ 14 ડિસેમ્બર, 2024 પહેલાં ડૉ. ચેનની ઑફિસમાં 3 મિનિટનો કૉલ કરવાનો રહેશે.'
      },
      urgency: 'soon',
      urgencyNote: '14 ડિસેમ્બર સુધીમાં ધ્યાન આપવું જરૂરી • 21 દિવસ બાકી',
      deadline: '14 ડિસેમ્બર 2024',
      glossaryTerms: [
        {
          term: 'કલમ 1862(a)(1)(A)',
          definition: 'મેડિકેર કલમ: "સિસ્ટમમાં ડૉક્ટરના વિઝિટ ચાર્ટ નોટ્સ મળ્યા નથી." આ કોઈ મેડિકલ નકાર નથી.'
        },
        {
          term: 'રેમિટન્સ PR-204',
          definition: 'હિસાબી કોડ: "ડૉક્ટરની ઑફિસે દસ્તાવેજો જોડીને ફરી સબમિટ કરવું પડશે." તે જોડતાં જ બિલ પાસ થઈ જાય છે.'
        },
        {
          term: 'લાભાર્થી જવાબદારી',
          definition: 'પત્રવ્યવહારની ભૂલ સુધારવા પહેલાંની પ્રાથમિક રકમ. તમારે તરત જ ચેક આપવાની જરૂર નથી.'
        },
        {
          term: 'પુનઃનિર્ધારણ ફોર્મ',
          definition: 'જો ક્લિનિક ભૂલ ન સુધારે તો તમે અથવા તમારી દીકરી સારા મોકલી શકે તેવું 1-પેજનું મફત અપીલ ફોર્મ.'
        }
      ],
      nextSteps: [
        {
          title: 'પગલું 1: ખાતરી કરો કે આ તમારી જ મુલાકાત હતી',
          detail: 'ખાતરી થઈ: ડૉ. રોબર્ટ ચેન (કાર્ડિયોલોજી ક્લિનિક), તારીખ 12 ઑક્ટોબર, 2024.',
          mostUrgent: false,
          completed: true
        },
        {
          title: 'પગલું 2: ડૉ. ચેનના બિલિંગ વિભાગને કૉલ કરો',
          detail: 'સીધો ક્લિનિક ઑફિસ પર (555) 019-2849 પર કૉલ કરો અને નીચે આપેલી સ્ક્રિપ્ટ વાંચી સંભળાવો.',
          mostUrgent: true,
          completed: false
        },
        {
          title: 'પગલું 3: માત્ર જો ક્લિનિક ઇનકાર કરે તો (10 દિવસની મુદત)',
          detail: 'જો ઑફિસ 10 દિવસમાં ક્લેમ ઠીક ન કરે, તો 14 ડિસેમ્બર પહેલાં 1-પેજનું મફત મેડિકેર અપીલ ફોર્મ ભરો.',
          mostUrgent: false,
          completed: false
        }
      ],
      callScript: '“નમસ્તે, મારું નામ માર્ગારેટ મિલર છે. હું 12 ઑક્ટોબરની મુલાકાતની નોટિસ CMS-10156 (ક્લેમ #8839201-B) બાબતે કૉલ કરી રહી છું.\n\nમેડિકેરે જણાવ્યું છે કે મેડિકલ ડોક્યુમેન્ટ ન હોવાને લીધે કોડ 99214 નામંજૂર થયો છે. મારા પર ભૂલથી $482.50 નું બિલ ન આવે તે માટે કૃપા કરીને ડૉક્ટરના ચાર્ટ નોટ્સ જોડીને કોડ PR-204 હેઠળ આ ક્લેમ ફરી સબમિટ કરશો?”'
    },
    kn: {
      documentType: 'ಮೆಡಿಕೇರ್ ಸಾರಾಂಶ ನೋಟಿಸ್ (ಫಾರ್ಮ್ CMS-10156)',
      plainSummary: 'ಆತಂಕಪಡಬೇಡಿ — ಈ $482.50 ಹಣವನ್ನು ನೀವು ತಕ್ಷಣ ನಿಮ್ಮ ಜೇಬಿನಿಂದ ಪಾವತಿಸುವ ಅಗತ್ಯವಿಲ್ಲ. ಅಕ್ಟೋಬರ್ 12 ರಂದು ಡಾ. ರಾಬರ್ಟ್ ಚೆನ್ ಅವರ ಕ್ಲಿನಿಕ್ ಭೇಟಿಯ ಬಿಲ್ ಅನ್ನು ಮೆಡಿಕೇರ್ ಪಾವತಿಸಿಲ್ಲ, ಏಕೆಂದರೆ ಕಡತದಲ್ಲಿ ಕಡ್ಡಾಯ ಆಡಳಿತಾತ್ಮಕ ಅನುಮೋದನೆ ಫಾರ್ಮ್ ಇರಲಿಲ್ಲ.',
      atAGlance: {
        whatItIs: 'ಅಕ್ಟೋಬರ್ 12 ರಂದು ಡಾ. ರಾಬರ್ಟ್ ಚೆನ್ ಅವರ ಕ್ಲಿನಿಕ್ ಭೇಟಿಯ ಬಿಲ್ ಅನ್ನು ಮೆಡಿಕೇರ್ ಪಾವತಿಸಿಲ್ಲ, ಏಕೆಂದರೆ ಕಡತದಲ್ಲಿ ಕಡ್ಡಾಯ ಆಡಳಿತಾತ್ಮಕ ಅನುಮೋದನೆ ಫಾರ್ಮ್ ಇರಲಿಲ್ಲ.',
        whatYouOwe: 'ಕ್ಲಿನಿಕ್ $482.50 ಮೊತ್ತದ ಬಿಲ್ ಕಳುಹಿಸಿದೆ. ಕ್ಲಿನಿಕ್ ತನ್ನ ವೈದ್ಯಕೀಯ ಟಿಪ್ಪಣಿಗಳನ್ನು ಲಗತ್ತಿಸಿ ಕೋಡ್ 99214 ಅನ್ನು ಮರುಸಲ್ಲಿಸಿದಾಗ ಈ ಶುಲ್ಕ ರದ್ದಾಗುತ್ತದೆ.',
        riskAndTiming: 'ಬಹಳ ಕಡಿಮೆ ಅಪಾಯ, ನೀವು ಅಥವಾ ಸಾರಾ ಡಿಸೆಂಬರ್ 14, 2024 ಕ್ಕಿಂತ ಮೊದಲು ಡಾ. ಚೆನ್ ಕಚೇರಿಗೆ 3 ನಿಮಿಷಗಳ ಕರೆ ಮಾಡಿದರೆ ಸಾಕು.'
      },
      urgency: 'soon',
      urgencyNote: 'ಡಿಸೆಂಬರ್ 14 ರೊಳಗೆ ಗಮನಹರಿಸಬೇಕು • 21 ದಿನಗಳು ಬಾಕಿ',
      deadline: 'ಡಿಸೆಂಬರ್ 14, 2024',
      glossaryTerms: [
        {
          term: 'ವಿಭಾಗ 1862(a)(1)(A)',
          definition: 'ಮೆಡಿಕೇರ್ ನಿಯಮ: "ವೈದ್ಯರ ಭೇಟಿ ಸಾರಾಂಶ ಟಿಪ್ಪಣಿ ಕಡತದಲ್ಲಿ ಕಾಣಿಸಿಲ್ಲ." ಇದು ಚಿಕಿತ್ಸೆಯ ತಿರಸ್ಕಾರವಲ್ಲ.'
        },
        {
          term: 'ರೆಮಿಟೆನ್ಸ್ PR-204',
          definition: 'ಖಾತೆ ಕೋಡ್: "ವೈದ್ಯರ ಕಚೇರಿ ವೈದ್ಯಕೀಯ ದಾಖಲೆಗಳನ್ನು ಲಗತ್ತಿಸಿ ಮರುಸಲ್ಲಿಸಬೇಕು." ಸಲ್ಲಿಸಿದ ತಕ್ಷಣ ಮೆಡಿಕೇರ್ ಅನುಮೋದಿಸುತ್ತದೆ.'
        },
        {
          term: 'ಫಲಾನುಭವಿಯ ಹೊಣೆಗಾರಿಕೆ',
          definition: 'ದಾಖಲೆಗಳ ತಿದ್ದುಪಡಿಯ ಮುಂಚಿನ ಪ್ರಾಥಮಿಕ ಬಿಲ್. ನೀವು ತಕ್ಷಣ ಹಣ ಪಾವತಿಸಬೇಕಾಗಿಲ್ಲ.'
        },
        {
          term: 'ಮರುಪರಿಶೀಲನೆ ಫಾರ್ಮ್',
          definition: 'ಕ್ಲಿನಿಕ್ ಮರುಸಲ್ಲಿಸದಿದ್ದರೆ ನೀವು ಅಥವಾ ನಿಮ್ಮ ಮಗಳು ಸಾರಾ ಕಳುಹಿಸಬಹುದಾದ 1-ಪುಟದ ಉಚಿತ ಮೇಲ್ಮನವಿ ಫಾರ್ಮ್.'
        }
      ],
      nextSteps: [
        {
          title: 'ಹಂತ 1: ಇದು ನಿಮ್ಮದೇ ಭೇಟಿಯೇ ಎಂದು ಖಚಿತಪಡಿಸಿಕೊಳ್ಳಿ',
          detail: 'ದೃಢೀಕರಿಸಲಾಗಿದೆ: ಡಾ. ರಾಬರ್ಟ್ ಚೆನ್ (ಕಾರ್ಡಿಯಾಲಜಿ ಕ್ಲಿನಿಕ್), ಭೇಟಿ ದಿನಾಂಕ ಅಕ್ಟೋಬರ್ 12, 2024.',
          mostUrgent: false,
          completed: true
        },
        {
          title: 'ಹಂತ 2: ಡಾ. ಚೆನ್ ಬಿಲ್ಲಿಂಗ್ ವಿಭಾಗಕ್ಕೆ ಕರೆ ಮಾಡಿ',
          detail: 'ನೇರವಾಗಿ ಕ್ಲಿನಿಕ್ ಕಚೇರಿಗೆ (555) 019-2849 ಗೆ ಕರೆ ಮಾಡಿ ಕೆಳಗಿರುವ ಸಿದ್ಧ ಸಂಭಾಷಣೆಯನ್ನು ಓದಿ ಹೇಳಿ.',
          mostUrgent: true,
          completed: false
        },
        {
          title: 'ಹಂತ 3: ಕ್ಲಿನಿಕ್ ನಿರಾಕರಿಸಿದರೆ ಮಾತ್ರ (10 ದಿನಗಳ ಕಾಲಾವಕಾಶ)',
          detail: '10 ಕೆಲಸದ ದಿನಗಳಲ್ಲಿ ಕಚೇರಿ ಸರಿಪಡಿಸದಿದ್ದರೆ, ಡಿಸೆಂಬರ್ 14 ರ ಮೊದಲು 1-ಪುಟದ ಉಚಿತ ಮೆಡಿಕೇರ್ ಮೇಲ್ಮನವಿ ಸಲ್ಲಿಸಿ.',
          mostUrgent: false,
          completed: false
        }
      ],
      callScript: '“ನಮಸ್ಕಾರ, ನನ್ನ ಹೆಸರು ಮಾರ್ಗರೇಟ್ ಮಿಲ್ಲರ್. ಅಕ್ಟೋಬರ್ 12 ರ ಭೇಟಿಯ ನೋಟಿಸ್ CMS-10156 (ಕ್ಲೈಮ್ #8839201-B) ಸಂಬಂಧಿಸಿದಂತೆ ಕರೆ ಮಾಡುತ್ತಿದ್ದೇನೆ.\n\nವೈದ್ಯಕೀಯ ದಾಖಲೆಗಳಿಲ್ಲದ ಕಾರಣ ಕೋಡ್ 99214 ತಿರಸ್ಕರಿಸಲಾಗಿದೆ ಎಂದು ಮೆಡಿಕೇರ್ ತಿಳಿಸಿದೆ. ನನ್ನ ಮೇಲೆ ತಪ್ಪಾಗಿ $482.50 ಹೊರೆ ಬೀಳದಂತೆ, ದಯವಿಟ್ಟು ವೈದ್ಯರ ಚಾರ್ಟ್ ಟಿಪ್ಪಣಿ ಲಗತ್ತಿಸಿ ಕೋಡ್ PR-204 ಅಡಿಯಲ್ಲಿ ಮರುಸಲ್ಲಿಸಬಹುದೇ?”'
    },
    es: {
      documentType: 'Aviso de Resumen de Medicare (Formulario CMS-10156)',
      plainSummary: 'No se preocupe — no tiene que pagar estos $482.50 de su bolsillo de inmediato. El consultorio de su médico simplemente olvidó adjuntar las notas de rutina de la visita. Una vez que reenvíen el archivo con el código faltante, el procedimiento estándar de Medicare cubre esto.',
      atAGlance: {
        whatItIs: 'Medicare no cubrió la consulta médica del Dr. Robert Chen del 12 de octubre porque faltó un formulario de aprobación administrativa de rutina en el expediente.',
        whatYouOwe: 'La clínica emitió una factura por $482.50, pero casi siempre se resuelve cuando la clínica adjunta sus notas médicas y reenvía el código 99214.',
        riskAndTiming: 'Riesgo bajo, siempre y cuando usted o Sarah hagan una llamada de 5 minutos al consultorio del Dr. Chen antes del 14 de diciembre de 2024.'
      },
      urgency: 'soon',
      urgencyNote: 'Requiere atención antes del 14 de diciembre • Quedan 21 días',
      deadline: '14 de diciembre de 2024',
      glossaryTerms: [
        {
          term: 'Ley de Seguro Social Sec. 1862',
          definition: 'Una cláusula legal estándar que Medicare cita cada vez que faltan registros médicos. Casi siempre significa que la clínica olvidó adjuntar las notas del Dr. Chen.'
        },
        {
          term: 'Remesa PR-204',
          definition: 'Código de Observación de Responsabilidad del Paciente 204. Se aplica automáticamente cuando la aseguradora espera documentación faltante del equipo de facturación.'
        },
        {
          term: 'Responsabilidad del Beneficiario',
          definition: 'Término formal para "monto de factura preliminar" antes de que se corrijan errores de oficina o apelaciones.'
        },
        {
          term: 'Formulario de Redeterminación',
          definition: 'Un formulario estándar gratuito de 1 página que puede enviar por correo a Medicare si la clínica no reenvía sus registros dentro de los 30 días.'
        }
      ],
      nextSteps: [
        {
          title: 'Paso 1: Verifique que esta fue su cita médica',
          detail: 'Confirmado: Dr. Robert Chen (Clínica de Cardiología), fecha de cita 12 de octubre de 2024.',
          mostUrgent: false,
          completed: true
        },
        {
          title: 'Paso 2: Llame al Departamento de Facturación del Dr. Chen',
          detail: 'Llame a la oficina directamente al (555) 019-2849. Solicite hablar con el coordinador de facturación y lea el guion preparado abajo.',
          mostUrgent: true,
          completed: false
        },
        {
          title: 'Paso 3: Solo si la clínica se niega (10 días de margen)',
          detail: 'Si la oficina no corrige el reclamo en 10 días hábiles, presente una apelación gratuita de 1 página antes del 14 de diciembre.',
          mostUrgent: false,
          completed: false
        }
      ],
      callScript: '“Hola, mi nombre es Margaret Miller. Llamo sobre el aviso CMS-10156 para el reclamo #8839201-B de mi consulta del 12 de octubre.\n\nMedicare me informó que el código 99214 fue denegado porque no se incluyó la documentación clínica previa. ¿Podría su coordinador de facturación adjuntar las notas del médico y reenviar este reclamo bajo el código PR-204 para que no se me facturen indebidamente $482.50?”'
    },
    ml: {
      documentType: 'മെഡികെയർ സംഗ്രഹ നോട്ടീസ് (ഫോം CMS-10156)',
      plainSummary: 'ഭയപ്പെടേണ്ടതില്ല — ഈ $482.50 നിങ്ങളുടെ സ്വന്തം പോക്കറ്റിൽ നിന്ന് നൽകേണ്ടതില്ല. ഡോക്ടറുടെ ഓഫീസ് പതിവ് ക്ലിനിക് ചാർട്ട് കുറിപ്പ് ചേർക്കാൻ മറന്നുപോയി. ആവശ്യമായ കോഡ് സഹിതം അവർ വീണ്ടും സമർപ്പിക്കുമ്പോൾ മെഡികെയർ ഇത് പൂർണ്ണമായി കവർ ചെയ്യും.',
      atAGlance: {
        whatItIs: 'റൂട്ടീൻ അഡ്മിനിസ്ട്രേറ്റീവ് അപ്രൂവൽ ഫോം വിട്ടുപോയതിനാൽ ഒക്ടോബർ 12 ലെ ഡോ. റോബർട്ട് ചെന്നിന്റെ സന്ദർശനത്തിനുള്ള തുക മെഡികെയർ നൽകിയില്ല.',
        whatYouOwe: 'ക്ലിനിക് $482.50 ന്റെ ബിൽ അയച്ചിട്ടുണ്ടെങ്കിലും, ക്ലിനിക് അവരുടെ നോട്ടുകൾ ചേർത്ത് കോഡ് 99214 വീണ്ടും ഫയൽ ചെയ്യുമ്പോൾ ഇത് സാധാരണയായി പരിഹരിക്കപ്പെടും.',
        riskAndTiming: 'വളരെ കുറഞ്ഞ റിസ്ക്: ഡിസംബർ 14, 2024-ന് മുമ്പ് നിങ്ങൾ അല്ലെങ്കിൽ സാറ ഡോ. ചെന്നിന്റെ ഓഫീസിലേക്ക് ഒരു കോൾ ചെയ്താൽ മതിയാകും.'
      },
      urgency: 'soon',
      urgencyNote: 'ഡിസംബർ 14-നകം ശ്രദ്ധിക്കേണ്ടതുണ്ട് • 21 ദിവസങ്ങൾ ബാക്കി',
      deadline: 'ഡിസംബർ 14, 2024',
      glossaryTerms: [
        {
          term: 'വകുപ്പ് 1862(a)(1)(A)',
          definition: 'ഡോക്ടറുടെ ക്ലിനിക്കൽ ചാർട്ട് കുറിപ്പ് കമ്പ്യൂട്ടറിൽ ലഭ്യമല്ല എന്ന് കാണിക്കുന്ന ഒരു സാധാരണ മെഡികെയർ നിയമം.'
        },
        {
          term: 'റെമിറ്റൻസ് കോഡ് PR-204',
          definition: 'ക്ലിനിക്കിൽ നിന്ന് കൂടുതൽ മെഡിക്കൽ രേഖകൾ ആവശ്യമുണ്ടെന്ന് വ്യക്തമാക്കുന്ന ആന്തരിക ബില്ലിംഗ് കോഡ്.'
        }
      ],
      nextSteps: [
        {
          title: 'ഘട്ടം 1: സന്ദർശന വിവരങ്ങൾ ഉറപ്പുവരുത്തുക',
          detail: 'ഡോ. റോബർട്ട് ചെൻ (കാർഡിയോളജി), സന്ദർശന തീയതി: ഒക്ടോബർ 12, 2024.',
          mostUrgent: false,
          completed: true
        },
        {
          title: 'ഘട്ടം 2: ക്ലിനിക്കിന്റെ ബില്ലിംഗ് വിഭാഗത്തിലേക്ക് വിളിക്കുക',
          detail: '(555) 019-2849 എന്ന നമ്പറിൽ വിളിച്ച് താഴെ നൽകിയിട്ടുള്ള ഫോൺ സ്ക്രിപ്റ്റ് വായിക്കുക.',
          mostUrgent: true,
          completed: false
        },
        {
          title: 'ഘട്ടം 3: ക്ലിനിക് വിസമ്മതിച്ചാൽ മാത്രം (10 ദിവസത്തെ സമയം)',
          detail: '10 ദിവസത്തിനകം ക്ലിനിക് ഇത് പരിഹരിച്ചില്ലെങ്കിൽ ഡിസംബർ 14-നകം 1-പേജ് സൗജന്യ അപ്പീൽ നൽകുക.',
          mostUrgent: false,
          completed: false
        }
      ],
      callScript: '“നമസ്കാരം, എന്റെ പേര് മാർഗരറ്റ് മില്ലർ. ഒക്ടോബർ 12-ലെ CMS-10156 നോട്ടീസുമായി ബന്ധപ്പെട്ടാണ് ഞാൻ വിളിക്കുന്നത്. ക്ലിനിക്കൽ രേഖകൾ ഇല്ലാത്തതിനാൽ കോഡ് 99214 നിരസിച്ചതായി മെഡികെയർ അറിയിച്ചു. എനിക്ക് അനാവശ്യമായി $482.50 ഈടാക്കാതിരിക്കാൻ, ഡോക്ടറുടെ കുറിപ്പുകൾ ചേർത്ത് PR-204 കോഡിൽ വീണ്ടും സമർപ്പിക്കാമോ?”'
    },
    ur: {
      documentType: 'میڈیکیئر سمری نوٹس (فارم CMS-10156)',
      plainSummary: 'پریشان نہ ہوں — آپ کو یہ $482.50 اپنی جیب سے ادا کرنے کی ضرورت نہیں ہے۔ ڈاکٹر کا دفتر معمول کا وزٹ چارٹ نوٹ منسلک کرنا بھول گیا تھا۔ جب وہ مطلوبہ کوڈ کے ساتھ دوبارہ فائل جمع کرائیں گے تو میڈیکیئر اسے کَور کر لے گا۔',
      atAGlance: {
        whatItIs: 'معمولی دفتری منظوری فارم چھوٹ جانے کی وجہ سے 12 اکتوبر کے ڈاکٹر رابرٹ چن کے وزٹ کا بل میڈیکیئر نے ابھی پاس نہیں کیا۔',
        whatYouOwe: 'کلینک نے $482.50 کا بل بھیجا ہے، لیکن ڈاکٹر کے نوٹس شامل کر کے کوڈ 99214 دوبارہ بھیجنے پر یہ بل ختم ہو جاتا ہے۔',
        riskAndTiming: 'بہت کم خطرہ: 14 دسمبر 2024 سے پہلے ڈاکٹر چن کے دفتر کو 5 منٹ کی فون کال درکار ہے۔'
      },
      urgency: 'soon',
      urgencyNote: '14 دسمبر تک توجہ درکار ہے • 21 دن باقی',
      deadline: '14 دسمبر 2024',
      glossaryTerms: [
        {
          term: 'سیکشن 1862(a)(1)(A)',
          definition: 'میڈیکیئر کا قانونی رول جس کا مطلب ہے کہ کمپیوٹر کو ڈاکٹر کے چیک اپ کی رپورٹ موصول نہیں ہوئی۔'
        },
        {
          term: 'ریمیٹنس کوڈ PR-204',
          definition: 'بلنگ کوڈ جس کا مطلب ہے کہ کلینک کو طبی دستاویزات دوبارہ منسلک کر کے بھیجنا ہوں گی۔'
        }
      ],
      nextSteps: [
        {
          title: 'مرحلہ 1: ڈاکٹر اور تاریخ کی تصدیق کریں',
          detail: 'تصدیق شدہ: ڈاکٹر رابرٹ چن (کارڈیالوجی)، تاریخ: 12 اکتوبر 2024۔',
          mostUrgent: false,
          completed: true
        },
        {
          title: 'مرحلہ 2: ڈاکٹر چن کے بلنگ آفس کو کال کریں',
          detail: '(555) 019-2849 پر کال کریں اور نیچے دیا گیا تیار اسکرپٹ پڑھ کر سنائیں۔',
          mostUrgent: true,
          completed: false
        },
        {
          title: 'مرحلہ 3: اگر کلینک انکار کرے (10 دن کی رعایت)',
          detail: 'اگر دفتر 10 دن میں حل نہ کرے تو 14 دسمبر سے پہلے 1 صفحے کی مفت اپیل بھیجیں۔',
          mostUrgent: false,
          completed: false
        }
      ],
      callScript: '“ہیلو، میرا نام مارگریٹ ملر ہے۔ میں 12 اکتوبر کے نوٹس CMS-10156 (کلیم #8839201-B) کے سلسلے میں کال کر رہی ہوں۔ میڈیکیئر نے بتایا کہ کلینیکل نوٹس نہ ہونے کی وجہ سے کوڈ 99214 مسترد ہوا۔ کیا آپ ڈاکٹر کے چارٹ نوٹس منسلک کر کے PR-204 کے تحت دوبارہ کلیم بھیج سکتے ہیں تاکہ مجھ پر غلط طور پر $482.50 چارج نہ آئے؟”'
    }
  }
};
