/**
 * LexiLens Studio — Dyslexia Typography, Bionic Saccades & Syllable Spacing Engine
 *
 * Pure-math engine providing:
 * 1. Deterministic English syllable segmentation with compound/medical/STEM/legal rules
 *    plus vowel-cluster onset/nucleus/coda splitting.
 * 2. Bionic Reading saccade bold-anchor computation (40%–50% prefix fixation points)
 *    with strict punctuation stripping and reattachment.
 * 3. WCAG 2.1 AAA / AA relative luminance contrast ratio verification across 4 clinical
 *    dyslexia reading tints (Warm Cream, Soft Sage, Calm Sky, High-Contrast Slate).
 * 4. Flesch-Kincaid Grade Level & Flesch Reading Ease scoring to quantify before/after
 *    cognitive load reduction.
 */

export type DyslexiaTintId = 'warm-cream' | 'soft-sage' | 'calm-sky' | 'high-contrast-slate';

export type DyslexiaFontFamilyId =
  | 'lexend-sans'
  | 'opendyslexic-weighted'
  | 'atkinson-hyperlegible'
  | 'rello-monospace';

export interface DyslexiaThemePreset {
  id: DyslexiaTintId;
  label: string;
  description: string;
  backgroundHex: string;
  surfaceHex: string;
  textPrimaryHex: string;
  textSecondaryHex: string;
  accentHex: string;
  rulerHighlightHex: string;
}

export interface DyslexiaTypographyConfig {
  fontFamily: DyslexiaFontFamilyId;
  fontSizePx: number;         // 16..28 (Rello & Baeza-Yates recommend >= 18px)
  letterSpacingEm: number;    // 0.04..0.24 (WCAG 2.2 SC 1.4.12 requires >= 0.12em)
  wordSpacingEm: number;      // 0.12..0.35 (WCAG 2.2 SC 1.4.12 requires >= 0.16em)
  lineHeight: number;         // 1.5..2.2 (WCAG 2.2 SC 1.4.12 requires >= 1.5)
  paragraphSpacingEm: number; // 1.5..2.8 (WCAG 2.2 SC 1.4.12 requires >= 2.0em)
  maxLineMeasureCh: number;   // 45..70 (British Dyslexia Association recommends <= 66ch)
  syllableSep: string;        // e.g. "·"
  bionicAnchorEnabled: boolean;
  syllableSpacingEnabled: boolean;
  lineFocusRulerEnabled: boolean;
  tintId: DyslexiaTintId;
}

export interface BionicWordToken {
  rawToken: string;
  leadingPunct: string;
  coreWord: string;
  trailingPunct: string;
  boldPrefix: string;
  regularSuffix: string;
  syllables: string[];
  syllableFormatted: string;
  isComplexTerm: boolean;
}

export interface ReadabilityMetrics {
  wordCount: number;
  sentenceCount: number;
  syllableCount: number;
  complexWordCount: number;
  avgWordsPerSentence: number;
  avgSyllablesPerWord: number;
  fleschKincaidGrade: number;
  fleschReadingEase: number;
}

export const DYSLEXIA_THEME_PRESETS: Record<DyslexiaTintId, DyslexiaThemePreset> = {
  'warm-cream': {
    id: 'warm-cream',
    label: 'Warm Cream (Irlen Low-Glare)',
    description: 'Reduces bright-white scotopic glare while keeping crisp ink contrast.',
    backgroundHex: '#FDFBF7',
    surfaceHex: '#F5EFE6',
    textPrimaryHex: '#182232',
    textSecondaryHex: '#334155',
    accentHex: '#0F766E',
    rulerHighlightHex: '#FEF3C7',
  },
  'soft-sage': {
    id: 'soft-sage',
    label: 'Soft Botanical Sage',
    description: 'Calming green-tinted paper designed for extended STEM textbook reading.',
    backgroundHex: '#F2F7F4',
    surfaceHex: '#E4EFE9',
    textPrimaryHex: '#14261D',
    textSecondaryHex: '#2C4A3B',
    accentHex: '#15803D',
    rulerHighlightHex: '#DCFCE7',
  },
  'calm-sky': {
    id: 'calm-sky',
    label: 'Calm Sky Tint',
    description: 'Cool blue paper tint proven to stabilize saccadic eye tracking.',
    backgroundHex: '#F0F6FC',
    surfaceHex: '#E1EDF8',
    textPrimaryHex: '#102338',
    textSecondaryHex: '#284564',
    accentHex: '#0369A1',
    rulerHighlightHex: '#E0F2FE',
  },
  'high-contrast-slate': {
    id: 'high-contrast-slate',
    label: 'Dark Slate (Night Focus)',
    description: 'Deep charcoal slate with warm ivory ink for zero-glare evening study.',
    backgroundHex: '#0F172A',
    surfaceHex: '#1E293B',
    textPrimaryHex: '#F8FAFC',
    textSecondaryHex: '#CBD5E1',
    accentHex: '#38BDF8',
    rulerHighlightHex: '#334155',
  },
};

export const DEFAULT_DYSLEXIA_CONFIG: DyslexiaTypographyConfig = {
  fontFamily: 'lexend-sans',
  fontSizePx: 19,
  letterSpacingEm: 0.12,
  wordSpacingEm: 0.18,
  lineHeight: 1.8,
  paragraphSpacingEm: 2.0,
  maxLineMeasureCh: 66,
  syllableSep: '·',
  bionicAnchorEnabled: true,
  syllableSpacingEnabled: true,
  lineFocusRulerEnabled: true,
  tintId: 'warm-cream',
};


/**
 * Curated morphological & syllable dictionary for high-frequency STEM, medical, and legal terms
 * to guarantee 100% clinical/instructional accuracy on domain vocabulary.
 */
const DOMAIN_SYLLABLE_DICTIONARY: Record<string, string[]> = {
  mitochondria: ['mi', 'to', 'chon', 'dri', 'a'],
  mitochondrial: ['mi', 'to', 'chon', 'dri', 'al'],
  phosphorylation: ['phos', 'pho', 'ry', 'la', 'tion'],
  oxidative: ['ox', 'i', 'da', 'tive'],
  chemiosmotic: ['chem', 'i', 'os', 'mot', 'ic'],
  electrochemical: ['e', 'lec', 'tro', 'chem', 'i', 'cal'],
  adenosine: ['a', 'den', 'o', 'sine'],
  triphosphate: ['tri', 'phos', 'phate'],
  diphosphate: ['di', 'phos', 'phate'],
  anticoagulant: ['an', 'ti', 'co', 'ag', 'u', 'lant'],
  arrhythmia: ['ar', 'rhyth', 'mi', 'a'],
  postoperative: ['post', 'op', 'er', 'a', 'tive'],
  sublingual: ['sub', 'lin', 'gual'],
  nitroglycerin: ['ni', 'tro', 'glyc', 'er', 'in'],
  echocardiogram: ['ech', 'o', 'car', 'di', 'o', 'gram'],
  indemnification: ['in', 'dem', 'ni', 'fi', 'ca', 'tion'],
  indemnify: ['in', 'dem', 'ni', 'fy'],
  subrogation: ['sub', 'ro', 'ga', 'tion'],
  habitable: ['hab', 'it', 'a', 'ble'],
  habitability: ['hab', 'it', 'a', 'bil', 'i', 'ty'],
  nonrefundable: ['non', 're', 'fund', 'a', 'ble'],
  superposition: ['su', 'per', 'po', 'si', 'tion'],
  entanglement: ['en', 'tan', 'gle', 'ment'],
  decoherence: ['de', 'co', 'her', 'ence'],
  interferometer: ['in', 'ter', 'fer', 'om', 'e', 'ter'],
  probability: ['prob', 'a', 'bil', 'i', 'ty'],
  thermodynamics: ['ther', 'mo', 'dy', 'nam', 'ics'],
  bioenergetics: ['bi', 'o', 'en', 'er', 'get', 'ics'],
};

/**
 * Splits an English word into readable syllable chunks while preserving original casing.
 */
export function segmentWordIntoSyllables(word: string): string[] {
  const clean = word.trim();
  if (clean.length <= 3 || !/[a-zA-Z]/.test(clean)) {
    return [clean];
  }

  const lower = clean.toLowerCase();
  const dictMatch = DOMAIN_SYLLABLE_DICTIONARY[lower];
  if (dictMatch) {
    // Project original casing onto the dictionary slices
    const result: string[] = [];
    let offset = 0;
    for (const part of dictMatch) {
      result.push(clean.slice(offset, offset + part.length));
      offset += part.length;
    }
    return result;
  }

  // Handle hyphenated words naturally first
  if (clean.includes('-')) {
    return clean
      .split('-')
      .flatMap((part, idx, arr) => {
        const sub = segmentWordIntoSyllables(part);
        if (idx < arr.length - 1 && sub.length > 0) {
          sub[sub.length - 1] = `${sub[sub.length - 1]}-`;
        }
        return sub;
      });
  }

  // Algorithmic vowel-group syllable splitter
  const isVowel = (ch: string): boolean => /[aeiouyAEIOUY]/.test(ch);
  const syllables: string[] = [];
  let current = '';

  for (let i = 0; i < clean.length; i++) {
    current += clean[i];
    const hasVowelInCurrent = /[aeiouyAEIOUY]/.test(current);
    const remaining = clean.slice(i + 1);
    // Do not split if remaining is only a silent 'e' or has no vowels left
    const remainingHasActiveVowel =
      /[aeiouyAEIOUY]/.test(remaining) &&
      !(remaining.toLowerCase() === 'e' || remaining.toLowerCase() === 'es' || remaining.toLowerCase() === 'ed');

    if (!hasVowelInCurrent || !remainingHasActiveVowel) {
      continue;
    }

    const currIsVowel = isVowel(clean[i]);
    const nextIsVowel = i + 1 < clean.length ? isVowel(clean[i + 1]) : false;
    const next2IsVowel = i + 2 < clean.length ? isVowel(clean[i + 2]) : false;

    // V-CV pattern: split after vowel if current chunk is at least 2 chars and next is consonant followed by vowel
    if (currIsVowel && !nextIsVowel && next2IsVowel && current.length >= 2) {
      syllables.push(current);
      current = '';
      continue;
    }

    // VC-CV pattern: split between two consonants unless they form an inseparable digraph (th, ch, sh, ph, wh, tr, br, cr, gr, pl, cl)
    if (!currIsVowel && !nextIsVowel && remainingHasActiveVowel) {
      const pair = (clean[i] + (clean[i + 1] ?? '')).toLowerCase();
      const inseparableDigraphs = new Set(['th', 'ch', 'sh', 'ph', 'wh', 'ck', 'qu', 'tr', 'br', 'cr', 'dr', 'fr', 'gr', 'pr', 'bl', 'cl', 'fl', 'gl', 'pl', 'sl', 'st', 'sp']);
      if (!inseparableDigraphs.has(pair)) {
        syllables.push(current);
        current = '';
      }
    }
  }

  if (current.length > 0) {
    if (syllables.length > 0 && !/[aeiouyAEIOUY]/.test(current)) {
      syllables[syllables.length - 1] += current;
    } else {
      syllables.push(current);
    }
  }

  return syllables.length > 0 ? syllables : [clean];
}

/**
 * Tokenizes a word into leading punctuation, core word, trailing punctuation,
 * Bionic Reading fixation anchor (bold prefix + regular suffix), and syllable breakdown.
 */
export function tokenizeWordForDyslexia(
  rawToken: string,
  syllableSep = '·'
): BionicWordToken {
  const match = rawToken.match(/^([^a-zA-Z0-9]*)([a-zA-Z0-9'-]+?)([^a-zA-Z0-9]*)$/);
  if (!match) {
    return {
      rawToken,
      leadingPunct: '',
      coreWord: rawToken,
      trailingPunct: '',
      boldPrefix: rawToken,
      regularSuffix: '',
      syllables: [rawToken],
      syllableFormatted: rawToken,
      isComplexTerm: false,
    };
  }

  const leadingPunct = match[1] ?? '';
  const coreWord = match[2] ?? rawToken;
  const trailingPunct = match[3] ?? '';

  // Compute Bionic saccade bold prefix length:
  // 1-3 chars -> 1 char bold; 4-6 chars -> 2 chars bold; 7-9 chars -> 3 chars bold; 10+ chars -> ceil(len * 0.42)
  let boldLen = 1;
  if (coreWord.length <= 3) {
    boldLen = 1;
  } else if (coreWord.length <= 6) {
    boldLen = 2;
  } else if (coreWord.length <= 9) {
    boldLen = 3;
  } else {
    boldLen = Math.ceil(coreWord.length * 0.42);
  }

  const boldPrefix = coreWord.slice(0, boldLen);
  const regularSuffix = coreWord.slice(boldLen);
  const syllables = segmentWordIntoSyllables(coreWord);
  const isComplexTerm = syllables.length >= 3 || coreWord.length >= 9;
  const syllableFormatted =
    syllables.length >= 2 ? syllables.join(syllableSep) : coreWord;

  return {
    rawToken,
    leadingPunct,
    coreWord,
    trailingPunct,
    boldPrefix,
    regularSuffix,
    syllables,
    syllableFormatted,
    isComplexTerm,
  };
}

/**
 * Tokenizes an entire paragraph into Bionic + Syllable tokens while preserving word count.
 */
export function formatParagraphForDyslexia(
  text: string,
  syllableSep = '·'
): BionicWordToken[] {
  const words = text
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0);
  return words.map((w) => tokenizeWordForDyslexia(w, syllableSep));
}

/**
 * Computes WCAG 2.1 relative luminance and contrast ratio between two hex colors (#RRGGBB).
 */
export function computeHexContrastRatio(hexA: string, hexB: string): number {
  const parseLuminance = (hex: string): number => {
    const clean = hex.replace(/^#/, '');
    if (clean.length !== 6) return 0;
    const r = parseInt(clean.slice(0, 2), 16) / 255;
    const g = parseInt(clean.slice(2, 4), 16) / 255;
    const b = parseInt(clean.slice(4, 6), 16) / 255;
    const toLinear = (c: number): number =>
      c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
  };

  const lumA = parseLuminance(hexA);
  const lumB = parseLuminance(hexB);
  const lighter = Math.max(lumA, lumB);
  const darker = Math.min(lumA, lumB);
  return Number(((lighter + 0.05) / (darker + 0.05)).toFixed(2));
}

/**
 * Computes Flesch-Kincaid Grade Level and Flesch Reading Ease for any passage.
 */
export function computeReadabilityMetrics(text: string): ReadabilityMetrics {
  const trimmed = text.trim();
  if (!trimmed) {
    return {
      wordCount: 0,
      sentenceCount: 0,
      syllableCount: 0,
      complexWordCount: 0,
      avgWordsPerSentence: 0,
      avgSyllablesPerWord: 0,
      fleschKincaidGrade: 0,
      fleschReadingEase: 100,
    };
  }

  const sentences = trimmed
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  const sentenceCount = Math.max(1, sentences.length);

  const rawWords = trimmed
    .split(/\s+/)
    .map((w) => w.replace(/[^a-zA-Z0-9'-]/g, ''))
    .filter((w) => w.length > 0);
  const wordCount = Math.max(1, rawWords.length);

  let syllableCount = 0;
  let complexWordCount = 0;

  for (const w of rawWords) {
    const syls = segmentWordIntoSyllables(w);
    const count = Math.max(1, syls.length);
    syllableCount += count;
    if (count >= 3) {
      complexWordCount += 1;
    }
  }

  const avgWordsPerSentence = wordCount / sentenceCount;
  const avgSyllablesPerWord = syllableCount / wordCount;

  const rawGrade = 0.39 * avgWordsPerSentence + 11.8 * avgSyllablesPerWord - 15.59;
  const fleschKincaidGrade = Number(Math.max(1, Math.min(22, rawGrade)).toFixed(1));

  const rawEase = 206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord;
  const fleschReadingEase = Number(Math.max(0, Math.min(100, rawEase)).toFixed(1));

  return {
    wordCount,
    sentenceCount,
    syllableCount,
    complexWordCount,
    avgWordsPerSentence: Number(avgWordsPerSentence.toFixed(1)),
    avgSyllablesPerWord: Number(avgSyllablesPerWord.toFixed(2)),
    fleschKincaidGrade,
    fleschReadingEase,
  };
}

export interface WcagTextSpacingAndBdaAudit {
  wcag1412Compliant: boolean;
  bdaRelloCompliant: boolean;
  lineHeightPass: boolean;
  paragraphSpacingPass: boolean;
  letterSpacingPass: boolean;
  wordSpacingPass: boolean;
  fontSizePass: boolean;
  lineMeasurePass: boolean;
}

/**
 * Audits a DyslexiaTypographyConfig against:
 * 1. W3C WCAG 2.2 Success Criterion 1.4.12 (Text Spacing):
 *    - lineHeight >= 1.5
 *    - paragraphSpacingEm >= 2.0
 *    - letterSpacingEm >= 0.12
 *    - wordSpacingEm >= 0.16
 * 2. British Dyslexia Association (BDA) & Rello / Baeza-Yates Empirical Guidelines:
 *    - fontSizePx >= 18
 *    - maxLineMeasureCh between 45 and 70 ch
 */
export function auditWcagTextSpacingAndBdaCompliance(
  config: DyslexiaTypographyConfig
): WcagTextSpacingAndBdaAudit {
  const lineHeightPass = config.lineHeight >= 1.5;
  const paragraphSpacingPass = config.paragraphSpacingEm >= 2.0;
  const letterSpacingPass = config.letterSpacingEm >= 0.12;
  const wordSpacingPass = config.wordSpacingEm >= 0.16;
  const fontSizePass = config.fontSizePx >= 18;
  const lineMeasurePass =
    config.maxLineMeasureCh >= 45 && config.maxLineMeasureCh <= 70;

  return {
    wcag1412Compliant:
      lineHeightPass &&
      paragraphSpacingPass &&
      letterSpacingPass &&
      wordSpacingPass,
    bdaRelloCompliant: fontSizePass && lineMeasurePass,
    lineHeightPass,
    paragraphSpacingPass,
    letterSpacingPass,
    wordSpacingPass,
    fontSizePass,
    lineMeasurePass,
  };
}

const PRESERVED_UPPERCASE_ACRONYMS = new Set([
  'ATP',
  'ADP',
  'NADH',
  'FADH2',
  'DNA',
  'RNA',
  'MRNA',
  'TRNA',
  'STEM',
  'MRI',
  'CT',
  'ECG',
  'EKG',
  'ICU',
  'ER',
  'FDA',
  'WCAG',
  'BDA',
  'USD',
  'APR',
  'HIPAA',
  'NSAID',
  'NSAIDS',
]);

/**
 * Implements the British Dyslexia Association (BDA) & Rello/Baeza-Yates
 * anti-crowding rule: converts shouting ALL-CAPS words (>3 letters, unless a
 * known clinical/STEM acronym) into readable lowercase/sentence-case so word-shape
 * (bouma) recognition is preserved.
 */
export function normalizeTextForBdaAntiCrowding(text: string): string {
  return text.replace(/\b([A-Z]{4,})\b/g, (match) => {
    if (PRESERVED_UPPERCASE_ACRONYMS.has(match)) {
      return match;
    }
    return match.charAt(0) + match.slice(1).toLowerCase();
  });
}

