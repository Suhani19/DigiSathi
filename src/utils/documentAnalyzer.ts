import { ExplanationResult } from '../types';

interface ExtractedDocInfo {
  detectedType: string;
  sender: string;
  amounts: string[];
  dates: string[];
  accountNumbers: string[];
  urgency: 'none' | 'soon' | 'urgent';
  urgencyNote: string;
  deadline: string;
  category: 'medical' | 'utility' | 'tax' | 'housing' | 'banking' | 'legal' | 'general';
}

export function extractDocumentFacts(text: string): ExtractedDocInfo {
  const clean = text.trim();
  const lower = clean.toLowerCase();

  // Extract financial amounts ($45, $1,200.50, ₹12,450, etc.)
  const currencyMatches = clean.match(/([$₹£€]\s*[\d,]+(?:\.\d{1,2})?|(?:USD|INR|EUR|GBP|Rs\.?)\s*[\d,]+(?:\.\d{1,2})?)/gi) || [];
  const amounts = Array.from(new Set(currencyMatches));

  // Extract dates
  const dateMatches = clean.match(/\b(?:\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember))\s+\d{1,2}(?:st|nd|rd|th)?(?:,?\s*\d{4})?|\d{1,2}\s+(?:days?|weeks?|months?))\b/gi) || [];
  const dates = Array.from(new Set(dateMatches));

  // Extract account / reference numbers
  const refMatches = clean.match(/(?:account|claim|ref|notice|id|code|invoice|ticket|policy|case|citation)\s*(?:#|no\.?|number)?\s*[:\-]?\s*([A-Za-z0-9\-_#]{3,20})/gi) || [];
  const accountNumbers = Array.from(new Set(refMatches.map(m => m.trim())));

  // Detect category
  let category: ExtractedDocInfo['category'] = 'general';
  if (lower.includes('medicare') || lower.includes('doctor') || lower.includes('clinic') || lower.includes('hospital') || lower.includes('health') || lower.includes('cms') || lower.includes('prescription') || lower.includes('pharmacy') || lower.includes('copay')) {
    category = 'medical';
  } else if (lower.includes('water') || lower.includes('electric') || lower.includes('gas') || lower.includes('power') || lower.includes('utility') || lower.includes('internet') || lower.includes('telecom') || lower.includes('sewer')) {
    category = 'utility';
  } else if (lower.includes('irs') || lower.includes('tax') || lower.includes('revenue') || lower.includes('audit') || lower.includes('social security') || lower.includes('pension')) {
    category = 'tax';
  } else if (lower.includes('rent') || lower.includes('landlord') || lower.includes('tenant') || lower.includes('lease') || lower.includes('eviction') || lower.includes('apartment') || lower.includes('housing') || lower.includes('mortgage')) {
    category = 'housing';
  } else if (lower.includes('bank') || lower.includes('credit card') || lower.includes('loan') || lower.includes('overdraft') || lower.includes('statement') || lower.includes('wire')) {
    category = 'banking';
  } else if (lower.includes('court') || lower.includes('fine') || lower.includes('summons') || lower.includes('hearing') || lower.includes('citation') || lower.includes('ticket') || lower.includes('jury') || lower.includes('police')) {
    category = 'legal';
  }

  // Detect sender name or entity
  let sender = 'Official Department';
  if (category === 'medical') {
    if (lower.includes('aiims')) sender = 'AIIMS / Hospital Billing';
    else if (lower.includes('medicare')) sender = 'Medicare (Centers for Medicare & Medicaid Services)';
    else sender = 'Healthcare Provider / Clinic';
  } else if (category === 'utility') {
    sender = 'Public Utility / Service Provider';
  } else if (category === 'tax') {
    sender = lower.includes('irs') ? 'Internal Revenue Service (IRS)' : 'Tax & Revenue Department';
  } else if (category === 'housing') {
    sender = 'Property Management / Housing Authority';
  } else if (category === 'banking') {
    sender = 'Financial Institution / Bank';
  } else if (category === 'legal') {
    sender = 'Municipal Court / Legal Administration';
  }

  // Check lines for explicit sender names (e.g. "Department of...", "City of...", etc.)
  const firstLines = clean.split('\n').map(l => l.trim()).filter(Boolean).slice(0, 4);
  for (const line of firstLines) {
    if (line.length > 3 && line.length < 60 && !line.includes(':') && (line.toUpperCase() === line || /^[A-Z]/.test(line))) {
      if (/department|authority|center|hospital|clinic|company|council|court|service|office/i.test(line)) {
        sender = line;
        break;
      }
    }
  }

  // Detect urgency
  let urgency: ExtractedDocInfo['urgency'] = 'soon';
  let urgencyNote = 'Action Requested Within 30 Days';
  let deadline = dates[0] || 'Within 30 Days';

  const isUrgent = /urgent|disconnect|shut off|terminate|evict|warrant|final notice|immediate|overdue|penalty|action required immediately|court date/i.test(lower);
  const isInformational = /informational|statement only|keep for your records|no action required|paid in full|receipt|confirmation/i.test(lower);

  if (isUrgent) {
    urgency = 'urgent';
    urgencyNote = `Urgent Attention Required${dates[0] ? ` • Deadline: ${dates[0]}` : ''}`;
  } else if (isInformational) {
    urgency = 'none';
    urgencyNote = 'For Your Information • No Immediate Action Required';
    deadline = 'None specified';
  } else {
    urgency = 'soon';
    urgencyNote = `Please review soon${dates[0] ? ` • Stated date: ${dates[0]}` : ' • Suggested 30 days'}`;
  }

  let detectedType = 'Official Notice & Correspondence';
  if (category === 'medical') detectedType = 'Medical Billing & Coverage Explanation';
  else if (category === 'utility') detectedType = 'Utility Statement & Service Notice';
  else if (category === 'tax') detectedType = 'Tax & Government Notice';
  else if (category === 'housing') detectedType = 'Residential Tenancy & Property Notice';
  else if (category === 'banking') detectedType = 'Financial Account Notice';
  else if (category === 'legal') detectedType = 'Official Legal / Administrative Citation';

  return {
    detectedType,
    sender,
    amounts,
    dates,
    accountNumbers,
    urgency,
    urgencyNote,
    deadline,
    category
  };
}

export function synthesizeDynamicExplanation(
  inputText: string,
  targetLangName: string = 'English'
): ExplanationResult {
  const info = extractDocumentFacts(inputText);
  const primaryAmount = info.amounts[0] || '';
  const refCode = info.accountNumbers[0] || 'Reference on letter';
  const langLower = (targetLangName || 'english').toLowerCase();

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

  // Hindi localization
  if (isHindi) {
    return {
      documentType: `${info.sender} — ${info.detectedType}`,
      plainSummary: `DigiSathi ने आपके द्वारा दर्ज किए गए पत्र/नोटिस की पूरी समीक्षा की है। यह ${info.sender} द्वारा भेजा गया पत्र है। ${
        primaryAmount ? `इसमें ${primaryAmount} की राशि का उल्लेख है।` : 'इसमें किसी विशिष्ट बकाया राशि का उल्लेख नहीं है।'
      } घबराने की कोई बात नहीं है — नीचे दिए गए आसान चरणों का पालन करके आप इसे समय पर हल कर सकते हैं।`,
      atAGlance: {
        whatItIs: `${info.sender} से संबंधित आधिकारिक पत्र अथवा सूचना।`,
        whatYouOwe: primaryAmount ? `पत्र में उल्लिखित राशि: ${primaryAmount} (भुगतान से पहले जांच अवश्य करें)` : 'वर्तमान में कोई तत्काल भुगतान आवश्यक नहीं है।',
        riskAndTiming: `${info.urgencyNote}। समय सीमा: ${info.deadline}।`
      },
      urgency: info.urgency,
      urgencyNote: info.urgencyNote,
      deadline: info.deadline,
      glossaryTerms: [
        {
          term: refCode,
          definition: 'इस पत्र की विशिष्ट पहचान संख्या जिसके द्वारा कार्यालय में आपकी फाइल तुरंत ढूंढी जा सकती है।'
        },
        {
          term: 'प्रशासनिक समीक्षा (Review)',
          definition: 'एक मानक प्रक्रिया जहां संबंधित विभाग कागजी दस्तावेजों और विवरणों का मिलान करता है।'
        },
        {
          term: 'समय सीमा (Due Date)',
          definition: 'वह तिथि जिससे पहले कार्यालय से संपर्क करके स्थिति स्पष्ट करना सुरक्षित रहता है।'
        }
      ],
      nextSteps: [
        {
          title: 'कदम 1: पत्र का विवरण और दिनांक जांचें',
          detail: `अपने रिकॉर्ड से पुष्टि करें कि ${info.sender} का यह पत्र आपके नाम और सेवा से मेल खाता है।`,
          mostUrgent: false
        },
        {
          title: `कदम 2: ${info.sender} के कार्यालय में संपर्क करें`,
          detail: `पत्र पर दिए गए फोन नंबर पर कॉल करें और संदर्भ कोड ${refCode} का हवाला देकर स्थिति समझें।`,
          mostUrgent: true
        },
        {
          title: 'कदम 3: इस दस्तावेज़ को सुरक्षित रखें',
          detail: 'इस पत्र की एक प्रति अपने रिकॉर्ड में रखें जब तक कि मामला पूरी तरह समाप्त न हो जाए।',
          mostUrgent: false
        }
      ],
      callScript: `“नमस्ते, मेरा नाम खाताधारक है। मुझे ${info.sender} से एक सूचना मिली है जिसका संदर्भ संख्या ${refCode} है। ${primaryAmount ? `इसमें ${primaryAmount} का विवरण है।` : ''} क्या आप कृपया मेरे खाते की जांच करके बता सकते हैं कि मुझे क्या कदम उठाने चाहिए? धन्यवाद।”`,
      language: 'Hindi'
    };
  }

  // Spanish localization
  if (isSpanish) {
    return {
      documentType: `${info.sender} — ${info.detectedType}`,
      plainSummary: `DigiSathi ha examinado su documento de ${info.sender}. ${
        primaryAmount ? `El aviso hace referencia a un monto de ${primaryAmount}.` : 'No se exige un cobro inmediato en este momento.'
      } No se alarme: este es un aviso administrativo rutinario. Siga los sencillos pasos a continuación para confirmar la resolución con la oficina emisora.`,
      atAGlance: {
        whatItIs: `Aviso oficial emitido por ${info.sender}.`,
        whatYouOwe: primaryAmount ? `Monto indicado: ${primaryAmount} (verifique antes de emitir cualquier pago)` : 'No se requiere pago inmediato.',
        riskAndTiming: `${info.urgencyNote}. Fecha límite: ${info.deadline}.`
      },
      urgency: info.urgency,
      urgencyNote: info.urgencyNote,
      deadline: info.deadline,
      glossaryTerms: [
        {
          term: refCode,
          definition: 'Número de referencia de su expediente para identificar su caso en el sistema.'
        },
        {
          term: 'Revisión Administrativa',
          definition: 'Comprobación habitual de documentación para validar la cuenta o el servicio.'
        },
        {
          term: 'Fecha Límite',
          definition: 'Período recomendado para comunicarse antes de cualquier recargo o acción posterior.'
        }
      ],
      nextSteps: [
        {
          title: 'Paso 1: Verifique los datos del documento',
          detail: `Compruebe que la fecha y la información coincidan con su historial con ${info.sender}.`,
          mostUrgent: false
        },
        {
          title: `Paso 2: Llame a atención al cliente de ${info.sender}`,
          detail: `Marque el teléfono que aparece en el documento y proporcione la referencia ${refCode}.`,
          mostUrgent: true
        },
        {
          title: 'Paso 3: Guarde una copia en su carpeta',
          detail: 'Conserve este aviso hasta recibir la confirmación de saldo en cero o resolución definitiva.',
          mostUrgent: false
        }
      ],
      callScript: `“Hola, soy el titular de la cuenta. Recibí una notificación de ${info.sender} con el número de referencia ${refCode}. ${primaryAmount ? `Menciona un monto de ${primaryAmount}.` : ''} ¿Podrían revisar mi expediente y confirmar los pasos a seguir? Muchas gracias.”`,
      language: 'Spanish'
    };
  }

  // Default English localization
  return {
    documentType: `${info.sender} — ${info.detectedType}`,
    plainSummary: `DigiSathi analyzed the document text you provided. This is a notice from ${info.sender}. ${
      primaryAmount ? `The text references an amount of ${primaryAmount}.` : 'There is no confirmed balance due immediately in this statement.'
    } You do not need to panic. Simply follow the practical next steps below to confirm this with their representative.`,
    atAGlance: {
      whatItIs: `Official correspondence regarding your account or service with ${info.sender}.`,
      whatYouOwe: primaryAmount ? `Amount referenced: ${primaryAmount} (confirm before making any payment)` : '$0 / No immediate out-of-pocket payment demanded.',
      riskAndTiming: `${info.urgencyNote}. Key date: ${info.deadline}.`
    },
    urgency: info.urgency,
    urgencyNote: info.urgencyNote,
    deadline: info.deadline,
    glossaryTerms: [
      {
        term: refCode,
        definition: 'Your specific tracking or account reference number used by their customer service team.'
      },
      {
        term: 'Administrative Verification',
        definition: 'A routine check where an office confirms that records and forms are up to date.'
      },
      {
        term: 'Due / Review Window',
        definition: 'The standard timeframe provided to review the statement and call their office if clarification is needed.'
      }
    ],
    nextSteps: [
      {
        title: 'Step 1: Verify your records',
        detail: `Check that this notice from ${info.sender} matches your recent service, statement, or visit.`,
        mostUrgent: false
      },
      {
        title: `Step 2: Contact the billing or support office of ${info.sender}`,
        detail: `Call the telephone number printed on your letter and cite reference code: ${refCode}.`,
        mostUrgent: true
      },
      {
        title: 'Step 3: Keep this copy on file',
        detail: 'Keep this letter in your DigiSathi folder until you receive your next zero-balance or confirmation statement.',
        mostUrgent: false
      }
    ],
    callScript: `“Hello, my name is the account holder. I am calling regarding a notice I received from ${info.sender} with reference number ${refCode}. ${primaryAmount ? `It mentions an amount of ${primaryAmount}.` : ''} Could you please verify the status of this file and let me know if any updated paperwork is required? Thank you.”`,
    language: targetLangName
  };
}
