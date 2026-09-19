export type UrgencyLevel = 'none' | 'soon' | 'urgent';

export interface GlossaryTerm {
  term: string;
  definition: string;
}

export interface NextStep {
  stepNumber?: number;
  title: string;
  detail: string;
  mostUrgent: boolean;
  completed?: boolean;
}

export interface AtAGlance {
  whatItIs: string;
  whatYouOwe: string;
  riskAndTiming: string;
}

export interface ExplanationResult {
  documentType: string;
  plainSummary: string;
  atAGlance: AtAGlance;
  urgency: UrgencyLevel;
  urgencyNote: string;
  deadline: string; // "" if none
  glossaryTerms: GlossaryTerm[];
  nextSteps: NextStep[];
  callScript: string; // "" if not relevant
  language?: string;
  languageCode?: string;
  englishCallScript?: string;
  englishSummary?: string;
  englishAtAGlance?: AtAGlance;
}

export interface SampleDocument {
  id: string;
  title: string;
  shortLabel: string;
  type: string;
  billedAmount?: string;
  date: string;
  formId?: string;
  originalText: string;
  previewImage?: string;
  explanation: ExplanationResult;
}
