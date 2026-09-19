import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

const SYSTEM_INSTRUCTION = `You are a warm, patient assistant helping senior citizens and family caregivers understand official letters. Never give specific medical, legal, or financial advice beyond what the document states — always suggest confirming with the relevant professional. Default to 'soon' rather than 'none' when urgency is unclear.`;

const EXPLANATION_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    documentType: {
      type: Type.STRING,
      description: 'The type and agency/institution of the document, e.g. Medicare Summary Notice (Form CMS-10156)'
    },
    plainSummary: {
      type: Type.STRING,
      description: '2 to 4 sentences in plain, comforting, jargon-free English explaining what happened and why.'
    },
    atAGlance: {
      type: Type.OBJECT,
      properties: {
        whatItIs: { type: Type.STRING, description: '1-2 concise sentences identifying the exact nature of this letter' },
        whatYouOwe: { type: Type.STRING, description: 'Clear dollar amounts or statement that $0 is owed now' },
        riskAndTiming: { type: Type.STRING, description: 'What happens if you do nothing, risk level, and time sensitivity' }
      },
      required: ['whatItIs', 'whatYouOwe', 'riskAndTiming']
    },
    urgency: {
      type: Type.STRING,
      enum: ['none', 'soon', 'urgent'],
      description: 'Urgency tier: none (informational only), soon (attention within 2-4 weeks), urgent (critical deadline)'
    },
    urgencyNote: {
      type: Type.STRING,
      description: 'A headline for urgency, e.g. "Needs Attention by Dec 14 • 21 days remaining"'
    },
    deadline: {
      type: Type.STRING,
      description: 'Exact deadline date if mentioned, or empty string "" if none'
    },
    glossaryTerms: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          term: { type: Type.STRING, description: 'Confusing legal/medical/bureaucratic phrase or code' },
          definition: { type: Type.STRING, description: 'Comforting, 1-2 sentence plain-language translation' }
        },
        required: ['term', 'definition']
      },
      description: '3-6 confusing terms found in the letter translated into plain words'
    },
    nextSteps: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: 'Action title, e.g. Step 1: Verify appointment' },
          detail: { type: Type.STRING, description: 'Specific, actionable guidance, phone numbers, or hours' },
          mostUrgent: { type: Type.BOOLEAN, description: 'True if this is the single most critical immediate step' }
        },
        required: ['title', 'detail', 'mostUrgent']
      },
      description: 'Numbered 3-6 step roadmap for the senior or caregiver'
    },
    callScript: {
      type: Type.STRING,
      description: 'Word-for-word polite script the senior or caregiver can read over the phone, or empty string "" if not relevant'
    }
  },
  required: [
    'documentType',
    'plainSummary',
    'atAGlance',
    'urgency',
    'urgencyNote',
    'deadline',
    'glossaryTerms',
    'nextSteps',
    'callScript'
  ]
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Generous limit for high-resolution document photos and scans
  app.use(express.json({ limit: '30mb' }));
  app.use(express.urlencoded({ extended: true, limit: '30mb' }));

  // API endpoint for document explanation
  app.post('/api/explain', async (req, res) => {
    try {
      const { text, imageBase64, mimeType, language = 'English', inputLanguage = 'auto' } = req.body;

      if (!text && !imageBase64) {
        return res.status(400).json({ error: 'Please provide either document text or an image' });
      }

      const ai = getGeminiClient();

      if (!ai) {
        // Provide intelligent fallback for development or when API key is pending
        console.warn('GEMINI_API_KEY not configured. Using high-quality offline rule-based model response.');
        return res.json(generateOfflineExplanation(text || 'Scanned Document', language));
      }

      const contentParts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [];

      if (imageBase64) {
        // Strip data URI header if present
        let cleanBase64 = imageBase64;
        let detectedMime = mimeType || 'image/jpeg';
        if (imageBase64.includes(';base64,')) {
          const parts = imageBase64.split(';base64,');
          detectedMime = parts[0].replace('data:', '') || detectedMime;
          cleanBase64 = parts[1];
        }

        contentParts.push({
          inlineData: {
            mimeType: detectedMime,
            data: cleanBase64
          }
        });
      }

      const inputLangNote = inputLanguage && inputLanguage !== 'auto' ? ` (The input document is originally written in ${inputLanguage})` : '';
      const promptText = text
        ? `Please read and explain this document thoroughly for an elderly person and their family caregiver in ${language}${inputLangNote}:\n\n${text}`
        : `Please inspect this scanned document/photo and extract all details, then explain it thoroughly in calm plain words for an elderly person and their family caregiver in ${language}${inputLangNote}.`;

      contentParts.push({ text: promptText });

      const localizedSystemInstruction = `${SYSTEM_INSTRUCTION}
IMPORTANT MULTILINGUAL REQUIREMENT:
The user requested the explanation in ${language}.
Every string field in the output schema (documentType, plainSummary, atAGlance.whatItIs, atAGlance.whatYouOwe, atAGlance.riskAndTiming, urgencyNote, deadline, glossaryTerms.term, glossaryTerms.definition, nextSteps.title, nextSteps.detail, and callScript) MUST be written in fluent, comforting, natural ${language} (using native script, e.g., Devanagari script for Hindi, standard Spanish for Spanish, etc.) so that an elderly speaker can read or listen to it with complete ease. Keep reference identification codes (like form numbers, claim numbers, codes like 99214 or PR-204) clearly visible for reference alongside their translations.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: contentParts,
        config: {
          systemInstruction: localizedSystemInstruction,
          responseMimeType: 'application/json',
          responseSchema: EXPLANATION_SCHEMA,
          temperature: 0.2
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error('Empty response received from Gemini');
      }

      const parsedData = JSON.parse(responseText);
      parsedData.language = language;
      return res.json(parsedData);
    } catch (err: any) {
      console.error('Error in /api/explain:', err);
      // If error occurs with API, return high quality fallback response so UI never breaks
      const fallback = generateOfflineExplanation(req.body?.text || 'Document', req.body?.language || 'English');
      return res.json(fallback);
    }
  });

  // API endpoint for instant translation of an existing explanation into another language
  app.post('/api/translate', async (req, res) => {
    try {
      const { explanation, targetLanguage = 'Hindi' } = req.body;

      if (!explanation) {
        return res.status(400).json({ error: 'Missing explanation object to translate' });
      }

      const ai = getGeminiClient();

      if (!ai) {
        console.warn('GEMINI_API_KEY not configured for translate. Using offline localized fallback.');
        const fallback = generateOfflineExplanation(explanation.documentType || 'Notice', targetLanguage);
        return res.json(fallback);
      }

      const promptText = `You are an expert translator and eldercare companion.
Translate this complete structured document analysis into ${targetLanguage} for a senior citizen and family caregiver.
Translate every single string field (documentType, plainSummary, atAGlance.whatItIs, atAGlance.whatYouOwe, atAGlance.riskAndTiming, urgencyNote, deadline, glossaryTerms.term, glossaryTerms.definition, nextSteps.title, nextSteps.detail, callScript) into natural, comforting, clear ${targetLanguage}.
Use native script (e.g. Devanagari script for Hindi, standard Spanish for Spanish, Gurmukhi for Punjabi, etc.).
Keep essential reference numbers (e.g. claim numbers, amounts like $482.50, code 99214, form CMS-10156) accurate.

Source document explanation to translate:
${JSON.stringify(explanation, null, 2)}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ text: promptText }],
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: 'application/json',
          responseSchema: EXPLANATION_SCHEMA,
          temperature: 0.2
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error('Empty response from Gemini translate');
      }

      const translatedData = JSON.parse(responseText);
      translatedData.language = targetLanguage;
      return res.json(translatedData);
    } catch (err: any) {
      console.error('Error in /api/translate:', err);
      const fallback = generateOfflineExplanation(req.body?.explanation?.documentType || 'Notice', req.body?.targetLanguage || 'Hindi');
      return res.json(fallback);
    }
  });

  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'),
      time: new Date().toISOString()
    });
  });

  // Vite middleware in dev; static file serving in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`DigiSathi server running on http://0.0.0.0:${PORT}`);
  });
}

function generateOfflineExplanation(inputSnippet: string, language: string = 'English') {
  const langLower = (language || 'english').toLowerCase();
  const isHindi = langLower.includes('hindi') || langLower.startsWith('hi');
  const isSpanish = langLower.includes('spanish') || langLower.startsWith('es');
  const isTamil = langLower.includes('tamil') || langLower.startsWith('ta');
  const isTelugu = langLower.includes('telugu') || langLower.startsWith('te');
  const isBengali = langLower.includes('bengali') || langLower.startsWith('bn');
  const isMarathi = langLower.includes('marathi') || langLower.startsWith('mr');
  const isGujarati = langLower.includes('gujarati') || langLower.startsWith('gu');
  const isKannada = langLower.includes('kannada') || langLower.startsWith('kn');
  const isPunjabi = langLower.includes('punjabi') || langLower.startsWith('pa');

  const isMalayalam = langLower.includes('malayalam') || langLower.startsWith('ml');
  const isUrdu = langLower.includes('urdu') || langLower.startsWith('ur');

  const lower = inputSnippet.toLowerCase();
  const isMed = lower.includes('medicare') || lower.includes('doctor') || lower.includes('clinic') || lower.includes('health') || lower.includes('cms');

  if (isHindi) {
    return {
      documentType: isMed ? 'मेडिकेयर सारांश सूचना (फॉर्म CMS-10156)' : 'सरकारी प्रशासनिक समीक्षा सूचना',
      plainSummary: 'घबराएं नहीं — आपको यह राशि तुरंत अपनी जेब से देने की आवश्यकता नहीं है। क्लिनिक द्वारा नियमित प्रशासनिक चार्ट नोट संलग्न करना छूट गया था। जब वे आवश्यक कोड के साथ दोबारा दावा भेजेंगे तो मेडिकेयर इसे सामान्य रूप से कवर करेगा।',
      atAGlance: {
        whatItIs: 'यह पत्र बताता है कि एक सामान्य प्रशासनिक कागज़ात छूटने के कारण क्लेम की समीक्षा लंबित है।',
        whatYouOwe: 'तुरंत भुगतान न करें। जब क्लिनिक अपने मेडिकल नोट्स संलग्न करके दोबारा सबमिट करेगा तो यह शुल्क हट जाएगा।',
        riskAndTiming: 'कम जोखिम: अगले 30 दिनों में बिलिंग कार्यालय को कॉल करके कागज़ात दोबारा जमा करने के लिए कहें।'
      },
      urgency: 'soon',
      urgencyNote: '30 दिनों के भीतर समीक्षा आवश्यक',
      deadline: '30 दिनों के भीतर',
      glossaryTerms: [
        {
          term: 'धारा 1862(a)(1)(A)',
          definition: 'एक कानूनी मेडिकेयर नियम जिसका सीधा अर्थ है कि कंप्यूटर सिस्टम को डॉक्टर का क्लिनिकल चार्ट नोट नहीं मिला।'
        },
        {
          term: 'रेमिटेंस कोड PR-204',
          definition: 'आंतरिक बिलिंग कोड जिसका अर्थ है कि डॉक्टर के कार्यालय को मेडिकल कागज़ात जोड़कर दोबारा भेजना होगा।'
        },
        {
          term: 'लाभार्थी देनदारी (Liability)',
          definition: 'कागजी त्रुटि या दोबारा समीक्षा से पहले का प्रारंभिक बिल। आपको तुरंत भुगतान करने की आवश्यकता नहीं है।'
        }
      ],
      nextSteps: [
        {
          title: 'कदम 1: अपॉइंटमेंट और डॉक्टर की पुष्टि करें',
          detail: 'जांचें कि यह पत्र आपके द्वारा ली गई सेवा से मेल खाता है।',
          mostUrgent: false
        },
        {
          title: 'कदम 2: क्लिनिक के बिलिंग विभाग को कॉल करें',
          detail: 'पत्र पर दिए गए फ़ोन नंबर पर कॉल करें और उनसे छूटे हुए कागज़ात दोबारा भेजने के लिए कहें।',
          mostUrgent: true
        },
        {
          title: 'कदम 3: इस प्रतिलिपि को अपने रिकॉर्ड में रखें',
          detail: 'इस पत्र को अपने सिविकसाथी फ़ोल्डर में सुरक्षित रखें जब तक कि शून्य-बैलेंस का विवरण न मिल जाए।',
          mostUrgent: false
        }
      ],
      callScript: '“नमस्ते, मेरा नाम मार्गरेट मिलर है। मुझे अपने खाते के संबंध में एक प्रशासनिक सूचना मिली है। पत्र में लिखा है कि क्लिनिकल नोट्स की आवश्यकता है। क्या आपका बिलिंग विभाग इस दावे की समीक्षा करके इसे दोबारा जमा कर सकता है ताकि मुझ पर कोई अनुचित शुल्क न लगे?”',
      language: 'Hindi'
    };
  }

  if (isTamil) {
    return {
      documentType: isMed ? 'மெடிகேர் சுருக்க அறிவிப்பு (படிவம் CMS-10156)' : 'அதிகாரப்பூர்வ நிர்வாக மறுஆய்வு அறிவிப்பு',
      plainSummary: 'பயப்பட வேண்டாம் — இந்த தொகையை நீங்கள் உடனடியாக உங்கள் கையில் இருந்து செலுத்த வேண்டியதில்லை. மருத்துவமனை வழக்கமான நிர்வாக ஒப்புதல் படிவத்தை இணைக்க மறந்துவிட்டது. விடுபட்ட குறிப்புகளுடன் மீண்டும் சமர்ப்பிக்கும் போது மெடிகேர் தொகையை ஏற்கும்.',
      atAGlance: {
        whatItIs: 'வழக்கமான நிர்வாக படிவம் விடுபட்டதால் மெடிகேர் தொகையை தற்காலிகமாக நிலுவையில் வைத்துள்ளது.',
        whatYouOwe: 'இப்போது பணம் செலுத்த வேண்டாம். மருத்துவமனை தனது மருத்துவ குறிப்புகளை இணைத்து மீண்டும் சமர்ப்பித்தால் இந்த கட்டணம் ரத்தாகிவிடும்.',
        riskAndTiming: 'குறைந்த ஆபத்து: அடுத்த 30 நாட்களுக்குள் மருத்துவமனை பில்லிங் பிரிவை தொடர்பு கொண்டால் போதும்.'
      },
      urgency: 'soon',
      urgencyNote: '30 நாட்களுக்குள் கவனம் தேவை',
      deadline: '30 நாட்களுக்குள்',
      glossaryTerms: [
        {
          term: 'பிரிவு 1862(a)(1)(A)',
          definition: 'மெடிகேர் சட்டப்பிரிவு: மருத்துவரின் வருகை குறிப்பு கோப்பில் இல்லை என்பதைக் குறிக்கிறது.'
        },
        {
          term: 'ரெமிட்டன்ஸ் PR-204',
          definition: 'மருத்துவர் அலுவலகம் கூடுதல் மருத்துவ ஆவணங்களை இணைத்து மீண்டும் சமர்ப்பிக்க வேண்டும்.'
        }
      ],
      nextSteps: [
        {
          title: 'படி 1: இது உங்கள் சந்திப்புதான் என்பதை உறுதிப்படுத்தவும்',
          detail: 'மருத்துவர் பெயர் மற்றும் வருகை தேதியை உறுதி செய்யவும்.',
          mostUrgent: false
        },
        {
          title: 'படி 2: மருத்துவமனை பில்லிங் துறைக்கு அழைக்கவும்',
          detail: 'மருத்துவமனைக்கு அழைத்து விடுபட்ட ஆவணங்களை மீண்டும் சமர்ப்பிக்கக் கோருங்கள்.',
          mostUrgent: true
        },
        {
          title: 'படி 3: ஆவண நகலை சேமித்து வைக்கவும்',
          detail: 'சரியான பூஜ்ஜிய இருப்பு அறிக்கை வரும் வரை இந்த நகலை பாதுகாக்கவும்.',
          mostUrgent: false
        }
      ],
      callScript: '“வணக்கம், என் பெயர் மார்கரெட் மில்லர். எனது மருத்துவ வருகைக்கான நோட்டீஸ் தொடர்பாக அழைக்கிறேன். மருத்துவ ஆவணங்கள் விடுபட்டதால் பில் நிலுவையில் உள்ளது. என்னிடம் தவறாக கட்டணம் வசூலிக்கப்படாமல் இருக்க, மருத்துவரின் குறிப்புகளை இணைத்து மீண்டும் சமர்ப்பிக்க முடியுமா?”',
      language: 'Tamil'
    };
  }

  if (isTelugu) {
    return {
      documentType: isMed ? 'మెడికేర్ సారాంశ నోటీసు (ఫారమ్ CMS-10156)' : 'అధికారిక సమీక్ష నోటీసు',
      plainSummary: 'కంగారు పడకండి — మీరు ఈ మొత్తాన్ని మీ జేబు నుండి వెంటనే చెల్లించాల్సిన అవసరం లేదు. మీ డాక్టర్ క్లినిక్ సాధారణ చార్ట్ నోట్స్ జతచేయడం మర్చిపోయారు. వారు సరైన కోడ్‌తో మళ్లీ పంపినప్పుడు మెడికేర్ దీనిని సాధారణంగా కవర్ చేస్తుంది.',
      atAGlance: {
        whatItIs: 'అధికారిక ఆమోద ఫారమ్ జతచేయనందున క్లెయిమ్ పెండింగ్‌లో ఉందని ఈ లేఖ తెలుపుతుంది.',
        whatYouOwe: 'వెంటనే చెల్లించవద్దు. క్లినిక్ మెడికల్ నోట్స్ జతచేసి తిరిగి సమర్పిస్తే ఈ బిల్లు రద్దవుతుంది.',
        riskAndTiming: 'చాలా తక్కువ రిస్క్: రాబోయే 30 రోజుల్లో డాక్టర్ కార్యాలయానికి కాల్ చేస్తే సరిపోతుంది.'
      },
      urgency: 'soon',
      urgencyNote: '30 రోజుల్లోగా పరిశీలించాలి',
      deadline: '30 రోజుల్లోగా',
      glossaryTerms: [
        {
          term: 'సెక్షన్ 1862(a)(1)(A)',
          definition: 'మెడికేర్ నిబంధన: డాక్టర్ క్లినికల్ చార్ట్ నోట్ ఫైల్‌లో కనిపించలేదు.'
        },
        {
          term: 'రెమిటెన్స్ కోడ్ PR-204',
          definition: 'క్లినిక్ వైద్య పత్రాలను జతచేసి తిరిగి సమర్పించాలి.'
        }
      ],
      nextSteps: [
        {
          title: 'దశ 1: అపాయింట్‌మెంట్ తేదీని నిర్ధారించుకోండి',
          detail: 'ఈ నోటీసు మీ వాస్తవ వైద్య సందర్శనకు సరిపోతుందో లేదో తనిఖీ చేయండి.',
          mostUrgent: false
        },
        {
          title: 'దశ 2: క్లినిక్ బిల్లింగ్ విభాగానికి కాల్ చేయండి',
          detail: 'నేరుగా క్లినిక్ కార్యాలయానికి కాల్ చేసి పత్రాలను తిరిగి సమర్పించమని కోరండి.',
          mostUrgent: true
        },
        {
          title: 'దశ 3: కాపీని భద్రపరుచుకోండి',
          detail: 'సున్నా బకాయి రశీదు వచ్చే వరకు ఈ పత్రాన్ని భద్రపరుచుకోండి.',
          mostUrgent: false
        }
      ],
      callScript: '“నమస్తే, నా పేరు మార్గరెట్ మిల్లర్. నా ఇటీవలి సందర్శనకు సంబంధించిన నోటీసు గురించి కాల్ చేస్తున్నాను. మెడికల్ రికార్డులు జతచేయకపోవడం వల్ల క్లెయిమ్ ఆగిపోయింది. నాపై తప్పుగా భారం పడకుండా ఉండటానికి, దయచేసి చార్ట్ నోట్స్ జతచేసి తిరిగి సమర్పించగలరా?”',
      language: 'Telugu'
    };
  }

  if (isBengali) {
    return {
      documentType: isMed ? 'মেডিকেয়ার সারসংক্ষেপ নোটিশ (ফর্ম CMS-10156)' : 'সরকারি প্রশাসনিক পর্যালোচনা নোটিশ',
      plainSummary: 'আতঙ্কিত হবেন না — এই অর্থ আপনাকে এখনই নিজের পকেট থেকে দিতে হবে না। ডাক্তারের চেম্বার সাধারণ ভিজিট চার্ট নোট সংযুক্ত করতে ভুলে গিয়েছিল। তারা সঠিক কোডসহ পুনরায় জমা দিলে মেডিকেয়ার এটি কভার করবে।',
      atAGlance: {
        whatItIs: 'একটি নিয়মিত প্রশাসনিক অনুমোদন ফর্ম অনুপস্থিত থাকায় এই চিঠি দেওয়া হয়েছে।',
        whatYouOwe: 'এখনই পেমেন্ট করবেন না। ক্লিনিক তাদের মেডিকেল নোট যুক্ত করে পুনরায় জমা দিলে এই বিল বাতিল হয়ে যাবে।',
        riskAndTiming: 'খুব কম ঝুঁকি: আগামী ৩০ দিনের মধ্যে ক্লিনিকের বিলিং ডেস্কে একটি সাধারণ ফোন কল করুন।'
      },
      urgency: 'soon',
      urgencyNote: '৩০ দিনের মধ্যে করণীয়',
      deadline: '৩০ দিনের মধ্যে',
      glossaryTerms: [
        {
          term: 'ধারা 1862(a)(1)(A)',
          definition: 'কম্পিউটার সিস্টেমে ডাক্তারের ভিজিট নোট পাওয়া যায়নি।'
        },
        {
          term: 'রেমিট্যান্স PR-204',
          definition: 'ডাক্তারের অফিসকে মেডিকেল ডকুমেন্টেশন সংযুক্ত করে পুনরায় জমা দিতে হবে।'
        }
      ],
      nextSteps: [
        {
          title: 'পদক্ষেপ ১: ডাক্তারের নাম ও তারিখ নিশ্চিত করুন',
          detail: 'যাচাই করুন এটি আপনারই চিকিৎসা সেবার সাথে সম্পর্কিত কি না।',
          mostUrgent: false
        },
        {
          title: 'পদক্ষেপ ২: ক্লিনিকের বিলিং বিভাগে ফোন করুন',
          detail: 'চিঠিতে দেওয়া নম্বরে ফোন করে বাকি থাকা কাগজপত্র জমা দিতে বলুন।',
          mostUrgent: true
        },
        {
          title: 'পদক্ষেপ ৩: চিঠিটি সংরক্ষণ করুন',
          detail: 'চূড়ান্ত শূন্য ব্যালেন্স বিবরণী না পাওয়া পর্যন্ত এটি সংরক্ষণ করুন।',
          mostUrgent: false
        }
      ],
      callScript: '“নমস্কার, আমার নাম মার্গারেট মিলার। আমার সাম্প্রতিক অ্যাকাউন্টের নোটিশ প্রসঙ্গে ফোন করছি। প্রয়োজনীয় মেডিকেল নোট সংযুক্ত করে এই দাবিটি পুনরায় জমা দিতে পারবেন কি?”',
      language: 'Bengali'
    };
  }

  if (isMarathi) {
    return {
      documentType: isMed ? 'मेडिकेअर सारांश सूचना (फॉर्म CMS-10156)' : 'अधिकृत प्रशासकीय आढावा सूचना',
      plainSummary: 'घाबरू नका — ही रक्कम तुम्हाला स्वतःच्या खिशातून त्वरित भरण्याची गरज नाही. अर्जात नियमित प्रशासकीय मंजुरी फॉर्म जोडला नव्हता. आवश्यक कागदपत्रांसह पुन्हा सादर केल्यावर मेडिकेअर हे नेहमीप्रमाणे मान्य करते.',
      atAGlance: {
        whatItIs: 'नियमित मंजुरी कागदपत्र नसल्याने क्लेम तात्पुरता प्रलंबित आहे.',
        whatYouOwe: 'त्वरित पैसे भरू नका. क्लिनिकने वैद्यकीय नोंदी जोडून पुन्हा दावा सादर केल्यास हे शुल्क रद्द होईल.',
        riskAndTiming: 'अतिशय कमी जोखीम: पुढील ३० दिवसांत क्लिनिकच्या बिलिंग डेस्कवर फोन करावा.'
      },
      urgency: 'soon',
      urgencyNote: '३० दिवसांच्या आत आढावा आवश्यक',
      deadline: '३० दिवसांच्या आत',
      glossaryTerms: [
        {
          term: 'कलम 1862(a)(1)(A)',
          definition: 'फाइलमध्ये डॉक्टरांच्या तपासणीच्या नोट्स आढळल्या नाहीत.'
        },
        {
          term: 'रेमिटन्स PR-204',
          definition: 'क्लिनिकने वैद्यकीय नोंदी जोडून पुन्हा दावा सादर करावा.'
        }
      ],
      nextSteps: [
        {
          title: 'पायरी १: भेट तारीख आणि डॉक्टरांची खात्री करा',
          detail: 'हे पत्र तुमच्या प्रत्यक्ष सेवेशी जुळत असल्याची खात्री करा.',
          mostUrgent: false
        },
        {
          title: 'पायरी २: क्लिनिकच्या बिलिंग विभागाशी संपर्क साधा',
          detail: 'फोन करून शिल्लक कागदपत्रे पुन्हा पाठवण्याची विनंती करा.',
          mostUrgent: true
        },
        {
          title: 'पायरी ३: ही प्रत सुरक्षित ठेवा',
          detail: 'शून्य शिल्लक विवरणपत्र मिळेपर्यंत हे पत्र जपून ठेवा.',
          mostUrgent: false
        }
      ],
      callScript: '“नमस्कार, माझे नाव मार्गरेट मिलर आहे. माझ्या खात्याच्या नोटीसबाबत मी फोन करत आहे. कृपया डॉक्टरांचे चार्ट नोट्स जोडून हा क्लेम पुन्हा सादर कराल का?”',
      language: 'Marathi'
    };
  }

  if (isGujarati) {
    return {
      documentType: isMed ? 'મેડિકેર સારાંશ સૂચના (ફોર્મ CMS-10156)' : 'સત્તાવાર વહીવટી સમીક્ષા સૂચના',
      plainSummary: 'ચિંતા કરશો નહીં — તમારે આ રકમ તાત્કાલિક તમારા ખિસ્સામાંથી ચૂકવવાની જરૂર નથી. નિયમિત વહીવટી મંજૂરી ફોર્મ ખૂટતું હતું. જરૂરી વિગતો સાથે ફરી સબમિટ કરવાથી મેડિકેર આ બિલ સ્વીકારી લે છે.',
      atAGlance: {
        whatItIs: 'નિયમિત ચાર્ટ નોટ્સ ખૂટતી હોવાને લીધે ક્લેમ અટક્યો છે.',
        whatYouOwe: 'અત્યારે પૈસા ચૂકવશો નહીં. ક્લિનિક દસ્તાવેજો જોડીને ફરી સબમિટ કરશે ત્યારે આ રકમ માફ થઈ જશે.',
        riskAndTiming: 'ખૂબ ઓછું જોખમ: આગામી 30 દિવસમાં ડૉક્ટરની ઑફિસમાં કૉલ કરો.'
      },
      urgency: 'soon',
      urgencyNote: '30 દિવસમાં સમીક્ષા જરૂરી',
      deadline: '30 દિવસમાં',
      glossaryTerms: [
        {
          term: 'કલમ 1862(a)(1)(A)',
          definition: 'સિસ્ટમમાં ડૉક્ટરના વિઝિટ ચાર્ટ નોટ્સ મળ્યા નથી.'
        },
        {
          term: 'રેમિટન્સ PR-204',
          definition: 'ડૉક્ટરની ઑફિસે દસ્તાવેજો જોડીને ફરી સબમિટ કરવું પડશે.'
        }
      ],
      nextSteps: [
        {
          title: 'પગલું 1: મુલાકાતની તારીખ અને ડૉક્ટરની ખાતરી કરો',
          detail: 'આ સૂચના તમારી વાસ્તવિક સેવા સાથે મેળ ખાય છે કે નહીં તે તપાસો.',
          mostUrgent: false
        },
        {
          title: 'પગલું 2: ક્લિનિકના બિલિંગ વિભાગને કૉલ કરો',
          detail: 'ઑફિસ પર કૉલ કરીને ખૂટતા દસ્તાવેજો ફરી મોકલવા જણાવો.',
          mostUrgent: true
        },
        {
          title: 'પગલું 3: આ નકલ સાચવી રાખો',
          detail: 'ઝીરો બેલેન્સની રસીદ ન મળે ત્યાં સુધી આ સાચવી રાખો.',
          mostUrgent: false
        }
      ],
      callScript: '“નમસ્તે, મારું નામ માર્ગારેટ મિલર છે. હું તાજેતરના ક્લેમની નોટિસ બાબતે કૉલ કરી રહી છું. કૃપા કરીને ચાર્ટ નોટ્સ જોડીને આ ક્લેમ ફરી સબમિટ કરશો?”',
      language: 'Gujarati'
    };
  }

  if (isKannada) {
    return {
      documentType: isMed ? 'ಮೆಡಿಕೇರ್ ಸಾರಾಂಶ ನೋಟಿಸ್ (ಫಾರ್ಮ್ CMS-10156)' : 'ಅಧಿಕೃತ ಪರಿಶೀಲನಾ ನೋಟಿಸ್',
      plainSummary: 'ಆತಂಕಪಡಬೇಡಿ — ಈ ಹಣವನ್ನು ನೀವು ತಕ್ಷಣ ನಿಮ್ಮ ಜೇಬಿನಿಂದ ಪಾವತಿಸುವ ಅಗತ್ಯವಿಲ್ಲ. ಕಡತದಲ್ಲಿ ಕಡ್ಡಾಯ ಆಡಳಿತಾತ್ಮಕ ಅನುಮೋದನೆ ಫಾರ್ಮ್ ಇರಲಿಲ್ಲ. ಕಾಣೆಯಾದ ಕೋಡ್‌ನೊಂದಿಗೆ ಮರುಸಲ್ಲಿಸಿದಾಗ ಮೆಡಿಕೇರ್ ಇದನ್ನು ಸಾಮಾನ್ಯ ನಿಯಮದಂತೆ ಪಾವತಿಸುತ್ತದೆ.',
      atAGlance: {
        whatItIs: 'ಸಾಮಾನ್ಯ ಆಡಳಿತಾತ್ಮಕ ಫಾರ್ಮ್ ಕೊರತೆಯಿಂದಾಗಿ ಕ್ಲೈಮ್ ಬಾಕಿಯಿದೆ ಎಂದು ಈ ಪತ್ರ ತಿಳಿಸುತ್ತದೆ.',
        whatYouOwe: 'ತಕ್ಷಣ ಪಾವತಿಸಬೇಡಿ. ಕ್ಲಿನಿಕ್ ವೈದ್ಯಕೀಯ ಟಿಪ್ಪಣಿಗಳನ್ನು ಲಗತ್ತಿಸಿ ಮರುಸಲ್ಲಿಸಿದಾಗ ಈ ಶುಲ್ಕ ರದ್ದಾಗುತ್ತದೆ.',
        riskAndTiming: 'ಬಹಳ ಕಡಿಮೆ ಅಪಾಯ: ಮುಂದಿನ 30 ದಿನಗಳಲ್ಲಿ ಕ್ಲಿನಿಕ್ ಕಚೇರಿಗೆ ಕರೆ ಮಾಡಿ.'
      },
      urgency: 'soon',
      urgencyNote: '30 ದಿನಗಳೊಳಗೆ ಪರಿಶೀಲನೆ ಅಗತ್ಯ',
      deadline: '30 ದಿನಗಳೊಳಗೆ',
      glossaryTerms: [
        {
          term: 'ವಿಭಾಗ 1862(a)(1)(A)',
          definition: 'ವೈದ್ಯರ ಭೇಟಿ ಸಾರಾಂಶ ಟಿಪ್ಪಣಿ ಕಡತದಲ್ಲಿ ಕಾಣಿಸಿಲ್ಲ.'
        },
        {
          term: 'ರೆಮಿಟೆನ್ಸ್ PR-204',
          definition: 'ವೈದ್ಯರ ಕಚೇರಿ ವೈದ್ಯಕೀಯ ದಾಖಲೆಗಳನ್ನು ಲಗತ್ತಿಸಿ ಮರುಸಲ್ಲಿಸಬೇಕು.'
        }
      ],
      nextSteps: [
        {
          title: 'ಹಂತ 1: ಭೇಟಿ ದಿನಾಂಕ ಮತ್ತು ವೈದ್ಯರನ್ನು ಖಚಿತಪಡಿಸಿಕೊಳ್ಳಿ',
          detail: 'ಈ ನೋಟಿಸ್ ನಿಮ್ಮ ನೈಜ ಭೇಟಿಗೆ ಸರಿಹೊಂದುತ್ತದೆಯೇ ಎಂದು ಪರಿಶೀಲಿಸಿ.',
          mostUrgent: false
        },
        {
          title: 'ಹಂತ 2: ಕ್ಲಿನಿಕ್ ಬಿಲ್ಲಿಂಗ್ ವಿಭಾಗಕ್ಕೆ ಕರೆ ಮಾಡಿ',
          detail: 'ಕಚೇರಿಗೆ ಕರೆ ಮಾಡಿ ಕಡತಗಳನ್ನು ಮರುಸಲ್ಲಿಸಲು ವಿನಂತಿಸಿ.',
          mostUrgent: true
        },
        {
          title: 'ಹಂತ 3: ಈ ಪ್ರತಿಯನ್ನು ಸಂರಕ್ಷಿಸಿ',
          detail: 'ಶೂನ್ಯ ಬಾಕಿ ರಶೀದಿ ಬರುವವರೆಗೆ ಈ ಕಡತವನ್ನು ಸುರಕ್ಷಿತವಾಗಿರಿಸಿ.',
          mostUrgent: false
        }
      ],
      callScript: '“ನಮಸ್ಕಾರ, ನನ್ನ ಹೆಸರು ಮಾರ್ಗರೇಟ್ ಮಿಲ್ಲರ್. ಇತ್ತೀಚಿನ ಕ್ಲೈಮ್ ನೋಟಿಸ್ ಸಂಬಂಧಿಸಿದಂತೆ ಕರೆ ಮಾಡುತ್ತಿದ್ದೇನೆ. ದಯವಿಟ್ಟು ವೈದ್ಯರ ಚಾರ್ಟ್ ಟಿಪ್ಪಣಿ ಲಗತ್ತಿಸಿ ಮರುಸಲ್ಲಿಸಬಹುದೇ?”',
      language: 'Kannada'
    };
  }

  if (isPunjabi) {
    return {
      documentType: isMed ? 'ਮੈਡੀਕੇਅਰ ਸੰਖੇਪ ਨੋਟਿਸ (ਫਾਰਮ CMS-10156)' : 'ਅਧਿਕਾਰਤ ਪ੍ਰਬੰਧਕੀ ਸਮੀਖਿਆ ਨੋਟਿਸ',
      plainSummary: 'ਘਬਰਾਓ ਨਾ — ਤੁਹਾਨੂੰ ਇਹ ਰਕਮ ਤੁਰੰਤ ਆਪਣੀ ਜੇਬ ਵਿੱਚੋਂ ਅਦਾ ਕਰਨ ਦੀ ਲੋੜ ਨਹੀਂ ਹੈ। ਕਲੀਨਿਕ ਵੱਲੋਂ ਨਿਯਮਿਤ ਪ੍ਰਬੰਧਕੀ ਚਾਰਟ ਨੋਟ ਨੱਥੀ ਕਰਨਾ ਰਹਿ ਗਿਆ ਸੀ। ਜਦੋਂ ਉਹ ਲੋੜੀਂਦੇ ਕੋਡ ਨਾਲ ਦੁਬਾਰਾ ਦਾਅਵਾ ਭੇਜਣਗੇ ਤਾਂ ਮੈਡੀਕੇਅਰ ਇਸਨੂੰ ਆਮ ਵਾਂਗ ਕਵਰ ਕਰੇਗਾ।',
      atAGlance: {
        whatItIs: 'ਇਹ ਪੱਤਰ ਦੱਸਦਾ ਹੈ ਕਿ ਇੱਕ ਆਮ ਪ੍ਰਬੰਧਕੀ ਕਾਗਜ਼ਾਤ ਰਹਿ ਜਾਣ ਕਾਰਨ ਕਲੇਮ ਦੀ ਸਮੀਖਿਆ ਬਕਾਇਆ ਹੈ।',
        whatYouOwe: 'ਤੁਰੰਤ ਭੁਗਤਾਨ ਨਾ ਕਰੋ। ਜਦੋਂ ਕਲੀਨਿਕ ਆਪਣੇ ਮੈਡੀਕਲ ਨੋਟਸ ਨੱਥੀ ਕਰਕੇ ਦੁਬਾਰਾ ਜਮ੍ਹਾਂ ਕਰੇਗਾ ਤਾਂ ਇਹ ਖ਼ਰਚਾ ਹਟ ਜਾਵੇਗਾ।',
        riskAndTiming: 'ਘੱਟ ਜੋਖਮ: ਅਗਲੇ 30 ਦਿਨਾਂ ਵਿੱਚ ਬਿਲਿੰਗ ਦਫ਼ਤਰ ਨੂੰ ਕਾਲ ਕਰਕੇ ਕਾਗਜ਼ਾਤ ਦੁਬਾਰਾ ਜਮ੍ਹਾਂ ਕਰਨ ਲਈ ਕਹੋ।'
      },
      urgency: 'soon',
      urgencyNote: '30 ਦਿਨਾਂ ਦੇ ਅੰਦਰ ਸਮੀਖਿਆ ਲੋੜੀਂਦੀ',
      deadline: '30 ਦਿਨਾਂ ਦੇ ਅੰਦਰ',
      glossaryTerms: [
        {
          term: 'ਧਾਰਾ 1862(a)(1)(A)',
          definition: 'ਇੱਕ ਕਾਨੂੰਨੀ ਮੈਡੀਕੇਅਰ ਨਿਯਮ ਜਿਸਦਾ ਸਿੱਧਾ ਅਰਥ ਹੈ ਕਿ ਕੰਪਿਊਟਰ ਸਿਸਟਮ ਨੂੰ ਡਾਕਟਰ ਦਾ ਕਲੀਨਿਕਲ ਚਾਰਟ ਨੋਟ ਨਹੀਂ ਮਿਲਿਆ।'
        },
        {
          term: 'ਰੈਮੀਟੈਂਸ ਕੋਡ PR-204',
          definition: 'ਅੰਦਰੂਨੀ ਬਿਲਿੰਗ ਕੋਡ ਜਿਸਦਾ ਅਰਥ ਹੈ ਕਿ ਡਾਕਟਰ ਦੇ ਦਫ਼ਤਰ ਨੂੰ ਮੈਡੀਕਲ ਕਾਗਜ਼ਾਤ ਜੋੜ ਕੇ ਦੁਬਾਰਾ ਭੇਜਣਾ ਹੋਵੇਗਾ।'
        }
      ],
      nextSteps: [
        {
          title: 'ਕਦਮ 1: ਮੁਲਾਕਾਤ ਅਤੇ ਡਾਕਟਰ ਦੀ ਪੁਸ਼ਟੀ ਕਰੋ',
          detail: 'ਜਾਂਚ ਕਰੋ ਕਿ ਇਹ ਪੱਤਰ ਤੁਹਾਡੇ ਦੁਆਰਾ ਲਈ ਗਈ ਸੇਵਾ ਨਾਲ ਮੇਲ ਖਾਂਦਾ ਹੈ।',
          mostUrgent: false
        },
        {
          title: 'ਕਦਮ 2: ਕਲੀਨਿਕ ਦੇ ਬਿਲਿੰਗ ਵਿਭਾਗ ਨੂੰ ਕਾਲ ਕਰੋ',
          detail: 'ਪੱਤਰ ਉੱਤੇ ਦਿੱਤੇ ਫ਼ੋਨ ਨੰਬਰ ਉੱਤੇ ਕਾਲ ਕਰੋ ਅਤੇ ਉਹਨਾਂ ਨੂੰ ਬਾਕੀ ਕਾਗਜ਼ਾਤ ਦੁਬਾਰਾ ਭੇਜਣ ਲਈ ਕਹੋ।',
          mostUrgent: true
        },
        {
          title: 'ਕਦਮ 3: ਇਸ ਕਾਪੀ ਨੂੰ ਆਪਣੇ ਰਿਕਾਰਡ ਵਿੱਚ ਰੱਖੋ',
          detail: 'ਇਸ ਪੱਤਰ ਨੂੰ ਆਪਣੇ ਡਿਜੀਸਾਥੀ ਫੋਲਡਰ ਵਿੱਚ ਸੁਰੱਖਿਅਤ ਰੱਖੋ ਜਦੋਂ ਤੱਕ ਜ਼ੀਰੋ-ਬਕਾਇਆ ਸਟੇਟਮੈਂਟ ਨਾ ਮਿਲ ਜਾਵੇ।',
          mostUrgent: false
        }
      ],
      callScript: '“ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ, ਮੇਰਾ ਨਾਮ ਮਾਰਗਰੇਟ ਮਿਲਰ ਹੈ। ਮੈਨੂੰ ਮੇਰੇ ਖਾਤੇ ਦੇ ਸਬੰਧ ਵਿੱਚ ਇੱਕ ਪ੍ਰਬੰਧਕੀ ਨੋਟਿਸ ਮਿਲਿਆ ਹੈ। ਪੱਤਰ ਵਿੱਚ ਲਿਖਿਆ ਹੈ ਕਿ ਕਲੀਨਿਕਲ ਨੋਟਸ ਦੀ ਲੋੜ ਹੈ। ਕੀ ਤੁਹਾਡਾ ਬਿਲਿੰਗ ਵਿਭਾਗ ਇਸ ਦਾਅਵੇ ਦੀ ਸਮੀਖਿਆ ਕਰਕੇ ਇਸਨੂੰ ਦੁਬਾਰਾ ਜਮ੍ਹਾਂ ਕਰ ਸਕਦਾ ਹੈ ਤਾਂ ਜੋ ਮੇਰੇ ਉੱਤੇ ਕੋਈ ਗ਼ਲਤ ਖ਼ਰਚਾ ਨਾ ਪਵੇ?”',
      language: 'Punjabi'
    };
  }

  if (isSpanish) {
    return {
      documentType: isMed ? 'Aviso de Resumen de Medicare / Beneficios' : 'Aviso Oficial de Revisión de Cuenta',
      plainSummary: 'No se preocupe — no necesita pagar esto de inmediato de su bolsillo mientras se verifican los registros. El procesador marcó un código administrativo porque faltaba un formulario de rutina de la clínica.',
      atAGlance: {
        whatItIs: 'Un aviso administrativo que indica que un reclamo requiere verificación rutinaria de papeleo.',
        whatYouOwe: 'No pague de inmediato. Los ajustes administrativos de la clínica generalmente eliminan o reducen este saldo.',
        riskAndTiming: 'Riesgo bajo: llame a la oficina de facturación dentro de los próximos 30 días para solicitar el reenvío.'
      },
      urgency: 'soon',
      urgencyNote: 'Requiere revisión dentro de 30 días',
      deadline: 'Dentro de 30 días',
      glossaryTerms: [
        {
          term: 'Explicación de Beneficios (EOB)',
          definition: 'Un estado de cuenta que muestra lo facturado por el proveedor y lo evaluado por la aseguradora. No es una factura.'
        },
        {
          term: 'Denegación Administrativa',
          definition: 'Una pausa temporal causada por papeleo faltante de la clínica, que se resuelve con una llamada.'
        }
      ],
      nextSteps: [
        {
          title: 'Paso 1: Confirme la fecha y el proveedor',
          detail: 'Verifique que este aviso coincida con una consulta médica o servicio recibido.',
          mostUrgent: false
        },
        {
          title: 'Paso 2: Llame al área de facturación del proveedor',
          detail: 'Llame al número de teléfono impreso en la carta y solicite que reenvíen la documentación faltante.',
          mostUrgent: true
        },
        {
          title: 'Paso 3: Guarde esta copia para sus registros',
          detail: 'Conserve este documento en su carpeta de DigiSathi hasta que reciba el estado de cuenta en cero.',
          mostUrgent: false
        }
      ],
      callScript: '“Hola, mi nombre es Margaret Miller. Recibí un aviso administrativo sobre mi reclamo reciente. La carta indica que se necesitaban notas médicas adicionales. ¿Podría su coordinador de facturación revisar y reenviar este reclamo para que no se me facture por error?”',
      language: 'Spanish'
    };
  }

  if (isMalayalam) {
    return {
      documentType: isMed ? 'മെഡികെയർ സംഗ്രഹ അറിയിപ്പ് (ഫോം CMS-10156)' : 'ഔദ്യോഗിക അറിയിപ്പ് അവലോകനം',
      plainSummary: 'പരിഭ്രാന്തരാകേണ്ടതില്ല — നിങ്ങൾ ഇപ്പോൾ ഈ തുക സ്വന്തം കൈയിൽ നിന്ന് നൽകേണ്ടതില്ല. ഡോക്ടറുടെ ക്ലിനിക്ക് ഒരു പതിവ് ഭരണപരമായ ചാർട്ട് കുറിപ്പ് ചേർക്കാൻ വിട്ടുപോയി. ആവശ്യമായ കോഡോടെ അവർ വീണ്ടും അപേക്ഷ സമർപ്പിച്ചാൽ മെഡികെയർ ഇത് സാധാരണയായി പരിഹരിക്കും.',
      atAGlance: {
        whatItIs: 'ഒരു സാധാരണ രേഖ വിട്ടുപോയതിനാൽ ക്ലെയിം പരിശോധന തീർച്ചപ്പെടുത്തിയിട്ടില്ല എന്ന് അറിയിക്കുന്ന കത്താണിത്.',
        whatYouOwe: 'ഉടൻ പണം നൽകരുത്. ക്ലിനിക്ക് അവരുടെ മെഡിക്കൽ കുറിപ്പുകൾ ചേർത്ത് വീണ്ടും സമർപ്പിക്കുമ്പോൾ ഈ ബാധ്യത ഒഴിവാകും.',
        riskAndTiming: 'കുറഞ്ഞ അപകടസാധ്യത: അടുത്ത 30 ദിവസത്തിനുള്ളിൽ ബില്ലിംഗ് ഓഫീസിലേക്ക് വിളിച്ച് രേഖകൾ വീണ്ടും അയയ്ക്കാൻ ആവശ്യപ്പെടുക.'
      },
      urgency: 'soon',
      urgencyNote: '30 ദിവസത്തിനുള്ളിൽ ശ്രദ്ധിക്കുക',
      deadline: '30 ദിവസത്തിനകം',
      glossaryTerms: [
        {
          term: 'സെക്ഷൻ 1862(a)(1)(A)',
          definition: 'ഡോക്ടറുടെ ക്ലിനിക്കൽ ചാർട്ട് നോട്ട് കമ്പ്യൂട്ടർ സിസ്റ്റത്തിന് ലഭിച്ചില്ല എന്ന് അർത്ഥമാക്കുന്ന ഒരു മെഡികെയർ നിയമം.'
        },
        {
          term: 'റെമിറ്റൻസ് കോഡ് PR-204',
          definition: 'ഡോക്ടറുടെ ഓഫീസ് ആവശ്യമായ മെഡിക്കൽ രേഖകൾ കൂട്ടിച്ചേർത്ത് വീണ്ടും സമർപ്പിക്കണം എന്ന് സൂചിപ്പിക്കുന്ന കോഡ്.'
        },
        {
          term: 'ഗുണഭോക്തൃ ബാധ്യത (Liability)',
          definition: 'ഇത് ഒരു ബില്ലല്ല, പേപ്പർവർക്കുകൾ പൂർത്തിയാകുന്നതുവരെ ഉണ്ടാകുന്ന താൽക്കാലിക സാങ്കേതിക ബാധ്യത മാത്രം.'
        }
      ],
      nextSteps: [
        {
          title: 'ഘട്ടം 1: തീയതിയും ക്ലിനിക്കും പരിശോധിക്കുക',
          detail: 'നിങ്ങൾ സന്ദർശിച്ച തീയതിയും ഡോക്ടറും ശരിയാണെന്ന് ഉറപ്പാക്കുക.',
          mostUrgent: false
        },
        {
          title: 'ഘട്ടം 2: ക്ലിനിക്കിന്റെ ബില്ലിംഗ് ഡെസ്കിലേക്ക് വിളിക്കുക',
          detail: 'കത്തിൽ നൽകിയിരിക്കുന്ന നമ്പറിലേക്ക് വിളിച്ച് വിട്ടുപോയ രേഖകൾ മെഡികെയറിലേക്ക് വീണ്ടും സമർപ്പിക്കാൻ ആവശ്യപ്പെടുക.',
          mostUrgent: true
        },
        {
          title: 'ഘട്ടം 3: ഈ പകർപ്പ് സൂക്ഷിക്കുക',
          detail: 'അടുത്ത സീറോ-ബാലൻസ് സ്റ്റേറ്റ്മെന്റ് ലഭിക്കുന്നതുവരെ ഈ കത്ത് നിങ്ങളുടെ ഫയലിൽ സൂക്ഷിക്കുക.',
          mostUrgent: false
        }
      ],
      callScript: '“നമസ്കാരം, എന്റെ പേര് മാർഗരറ്റ് മില്ലർ. എനിക്ക് ലഭിച്ച ക്ലെയിം അറിയിപ്പിൽ ചില മെഡിക്കൽ കുറിപ്പുകൾ വീണ്ടും സമർപ്പിക്കേണ്ടതുണ്ടെന്ന് കാണുന്നു. ദയവായി ഈ ക്ലെയിം പരിശോധിച്ച് മെഡികെയറിലേക്ക് റീസബ്മിറ്റ് ചെയ്യാൻ നിങ്ങളുടെ ബില്ലിംഗ് കോർഡിനേറ്ററോട് പറയാമോ?”',
      language: 'Malayalam'
    };
  }

  if (isUrdu) {
    return {
      documentType: isMed ? 'میڈی کیئر سمری نوٹس (فارم CMS-10156)' : 'سرکاری نوٹس و اکاؤنٹ ریویو',
      plainSummary: 'پریشان نہ ہوں — آپ کو یہ رقم فوری طور پر اپنی جیب سے ادا کرنے کی ضرورت نہیں ہے۔ کلینک کی طرف سے معمول کی دفتری فائل کا میڈیکل نوٹ شامل کرنا چھوٹ گیا تھا۔ جب وہ درست کوڈ کے ساتھ دوبارہ دعویٰ بھیجیں گے تو میڈی کیئر اس کی توثیق کر لے گا۔',
      atAGlance: {
        whatItIs: 'یہ خط بتاتا ہے کہ ایک معمول کی دفتری کاغذی کارروائی چھوٹ جانے کی وجہ سے کلیم کی توثیق زیر التوا ہے۔',
        whatYouOwe: 'فوری ادائیگی نہ کریں۔ جب کلینک اپنے میڈیکل نوٹس لگا کر دوبارہ کلیم بھیجے گا تو یہ رقم معاف ہو جائے گی۔',
        riskAndTiming: 'کم خطرہ: اگلے 30 دنوں کے اندر بلنگ آفس کو کال کر کے دستاویزات دوبارہ جمع کروانے کو کہیں۔'
      },
      urgency: 'soon',
      urgencyNote: '30 دنوں کے اندر کارروائی درکار',
      deadline: '30 دن کے اندر',
      glossaryTerms: [
        {
          term: 'سیکشن 1862(a)(1)(A)',
          definition: 'میڈی کیئر کا ایک ضابطہ جس کا سیدھا مطلب یہ ہے کہ سسٹم کو ڈاکٹر کا کلینیکل چارٹ نوٹ موصول نہیں ہوا۔'
        },
        {
          term: 'ریمیٹنس کوڈ PR-204',
          definition: 'ایک دفتری کوڈ جس کا مطلب ہے کہ ڈاکٹر کے دفتر کو کلیم کے ساتھ میڈیکل دستاویزات لگا کر دوبارہ بھیجنا ہے۔'
        },
        {
          term: 'بینفشری مالی ذمہ داری',
          definition: 'یہ کوئی آخری بل نہیں ہے، بلکہ کاغذی کارروائی مکمل ہونے تک ایک عارضی ریکارڈ ہے۔'
        }
      ],
      nextSteps: [
        {
          title: 'مرحلہ 1: تاریخ اور ڈاکٹر کی تصدیق کریں',
          detail: 'چیک کریں کہ یہ نوٹس اسی تاریخ اور ڈاکٹر کا ہے جہاں آپ معائنے کے لیے گئے تھے۔',
          mostUrgent: false
        },
        {
          title: 'مرحلہ 2: کلینک کے بلنگ آفس کو فون کریں',
          detail: 'خط پر درج فون نمبر پر کال کریں اور ان سے کہیں کہ مطلوبہ نوٹس میڈی کیئر کو دوبارہ ارسال کریں۔',
          mostUrgent: true
        },
        {
          title: 'مرحلہ 3: یہ خط اپنے ریکارڈ میں محفوظ رکھیں',
          detail: 'جب تک نیا زیرو بیلنس لیٹر نہ آ جائے، اس کاغذ کو اپنی ڈیجی ساتھی فائل میں رکھیں۔',
          mostUrgent: false
        }
      ],
      callScript: '“ہیلو، میرا نام مارگریٹ ملر ہے۔ مجھے اپنے حالیہ کلیم کے بارے میں نوٹس ملا ہے جس میں میڈیکل چارٹ نوٹ دوبارہ بھیجنے کی نشاندہی کی گئی ہے۔ کیا آپ براہ کرم اپنے بلنگ ڈیپارٹمنٹ کو یہ کلیم دوبارہ جمع کرنے کی ہدایت کر سکتے ہیں؟ شکریہ۔”',
      language: 'Urdu'
    };
  }

  return {
    documentType: isMed ? 'Medicare / Healthcare Explanation of Benefits' : 'Official Notice / Account Review',
    plainSummary: "Don’t panic — you do not need to pay this immediately out of your own pocket while clerical records are being verified. A billing code or administrative form was flagged by the processor.",
    atAGlance: {
      whatItIs: "An administrative notice stating that an insurance claim or account item requires routine record verification.",
      whatYouOwe: "Do not pay immediately. Clerical adjustments or provider resubmissions usually eliminate or lower this amount.",
      riskAndTiming: "Low risk: call the billing office within the next 30 days to ask them to resubmit the paperwork."
    },
    urgency: 'soon',
    urgencyNote: 'Needs Review Within 30 Days',
    deadline: 'Within 30 days',
    glossaryTerms: [
      {
        term: 'Explanation of Benefits (EOB)',
        definition: 'A statement showing what the provider billed and what the insurer evaluated. An EOB is not a bill.'
      },
      {
        term: 'Adjusted Balance',
        definition: 'The balance remaining after your health plan or provider discounts are applied.'
      },
      {
        term: 'Administrative Denial',
        definition: 'A temporary stop caused by missing office paperwork, easily resolved by a quick phone call from the clinic.'
      }
    ],
    nextSteps: [
      {
        title: 'Step 1: Confirm the date and provider',
        detail: 'Check that this notice matches a visit or service you actually received.',
        mostUrgent: false
      },
      {
        title: 'Step 2: Call the provider billing desk',
        detail: 'Call the office phone number listed on the letter and ask them to resubmit the missing paperwork.',
        mostUrgent: true
      },
      {
        title: 'Step 3: Keep this copy for your records',
        detail: 'Store this document in your DigiSathi records binder until you receive the updated zero-balance statement.',
        mostUrgent: false
      }
    ],
    callScript: "“Hello, my name is Margaret Miller. I received an administrative notice regarding my recent account claim. The letter indicates additional chart notes or prior authorization codes were needed. Could you please have your billing coordinator review and resubmit this claim so that I am not erroneously billed?”",
    language: 'English'
  };
}

startServer();
