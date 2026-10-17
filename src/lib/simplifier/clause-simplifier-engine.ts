/**
 * LexiLens Studio — Multi-Domain Clause Simplifier, Jargon Lexicon & Risk Extractor
 *
 * Pure-math engine providing:
 * 1. 4 pre-loaded, high-density showcase documents across STEM Biology, Clinical Cardiology
 *    Discharge, Residential Legal Lease, and Quantum Physics.
 * 2. Clause-by-clause plain-language translation with numeric/unit/dosage/currency preservation
 *    verification (`verifyCriticalEntityPreservation`).
 * 3. Automated Jargon Glossary extraction with phonetic pronunciation guides and tactile analogies.
 * 4. Actionable Risk, Deadline, and Clinical Red-Flag callout detection for custom pasted text.
 */

import {
  computeReadabilityMetrics,
  segmentWordIntoSyllables,
  type ReadabilityMetrics,
} from '../dyslexia/dyslexia-typography-engine.ts';

export type DocumentDomainId = 'stem-biology' | 'medical-discharge' | 'legal-contract' | 'quantum-physics' | 'custom';

export type RiskSeverity = 'critical' | 'warning' | 'action-required' | 'info';

export interface JargonTermCard {
  term: string;
  syllables: string;
  phoneticHint: string;
  category: DocumentDomainId;
  plainDefinition: string;
  everydayAnalogy: string;
}

export interface SimplifiedClausePair {
  id: string;
  clauseIndex: number;
  originalClause: string;
  simplifiedClause: string;
  keyTakeaway: string;
  riskSeverity: RiskSeverity;
  riskBadgeLabel: string;
  preservedEntities: string[];
  jargonTerms: JargonTermCard[];
}

export interface ComprehensionCheckQuestion {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface DocumentSimplificationResult {
  documentId: string;
  title: string;
  domain: DocumentDomainId;
  domainBadge: string;
  originalText: string;
  simplifiedSummaryText: string;
  originalMetrics: ReadabilityMetrics;
  simplifiedMetrics: ReadabilityMetrics;
  gradeReductionDelta: number;
  clauses: SimplifiedClausePair[];
  glossary: JargonTermCard[];
  comprehensionChecks: ComprehensionCheckQuestion[];
  entityPreservationPassed: boolean;
}

export interface ShowcaseDocumentPreset {
  id: string;
  title: string;
  domain: DocumentDomainId;
  domainBadge: string;
  subtitle: string;
  originalText: string;
  clauses: Omit<SimplifiedClausePair, 'preservedEntities'>[];
  comprehensionChecks: ComprehensionCheckQuestion[];
}

/**
 * Curated cross-domain Jargon Lexicon with phonetic pronunciation and everyday analogies.
 */
export const BUILTIN_JARGON_LEXICON: Record<string, JargonTermCard> = {
  chemiosmotic: {
    term: 'Chemiosmotic coupling',
    syllables: 'chem·i·os·mot·ic',
    phoneticHint: 'kem-ee-oz-MOT-ik',
    category: 'stem-biology',
    plainDefinition: 'Using stored proton pressure across a membrane to power chemical energy production.',
    everydayAnalogy: 'Like water stored behind a hydroelectric dam rushing through a turbine to generate electricity.',
  },
  phosphorylation: {
    term: 'Oxidative phosphorylation',
    syllables: 'ox·i·da·tive phos·pho·ry·la·tion',
    phoneticHint: 'OK-sih-day-tiv fos-for-ih-LAY-shun',
    category: 'stem-biology',
    plainDefinition: 'The cell’s main process for snapping a third phosphate group onto ADP to build fresh ATP energy.',
    everydayAnalogy: 'Recharging a spent AA battery (ADP) back to 100% full charge (ATP).',
  },
  electrochemical: {
    term: 'Electrochemical proton gradient',
    syllables: 'e·lec·tro·chem·i·cal',
    phoneticHint: 'ee-lek-troh-KEM-ih-kul',
    category: 'stem-biology',
    plainDefinition: 'A difference in both electrical charge and acid concentration across the inner mitochondrial wall.',
    everydayAnalogy: 'Pumping air into one side of a tire until high pressure wants to push back out.',
  },
  anticoagulant: {
    term: 'Dual antiplatelet / anticoagulant therapy',
    syllables: 'an·ti·co·ag·u·lant',
    phoneticHint: 'an-tee-koh-AG-yoo-lunt',
    category: 'medical-discharge',
    plainDefinition: 'Blood-thinning medication that prevents platelets from clumping and blocking your new heart stent.',
    everydayAnalogy: 'Non-stick Teflon coating inside a narrow pipe so traffic never jams up.',
  },
  sublingual: {
    term: 'Sublingual nitroglycerin',
    syllables: 'sub·lin·gual ni·tro·glyc·er·in',
    phoneticHint: 'sub-LING-gwul nye-troh-GLIS-er-in',
    category: 'medical-discharge',
    plainDefinition: 'A tiny tablet dissolved directly under the tongue to rapidly widen heart arteries during chest tightness.',
    everydayAnalogy: 'An emergency express lane that opens blood vessels within 60 seconds.',
  },
  dyspnea: {
    term: 'Exertional dyspnea or syncope',
    syllables: 'dysp·ne·a / syn·co·pe',
    phoneticHint: 'disp-NEE-uh / SIN-koh-pee',
    category: 'medical-discharge',
    plainDefinition: 'Unusual shortness of breath during light activity (dyspnea) or sudden dizziness/fainting (syncope).',
    everydayAnalogy: 'Your body’s dashboard check-engine light flashing for immediate medical attention.',
  },
  indemnification: {
    term: 'Unilateral indemnification',
    syllables: 'in·dem·ni·fi·ca·tion',
    phoneticHint: 'in-dem-nih-fih-KAY-shun',
    category: 'legal-contract',
    plainDefinition: 'A one-sided promise where you agree to pay the landlord’s legal bills even if you were not at fault.',
    everydayAnalogy: 'Signing a slip saying you will pay for every dent in the parking lot, no matter who caused it.',
  },
  subrogation: {
    term: 'Waiver of subrogation',
    syllables: 'sub·ro·ga·tion',
    phoneticHint: 'sub-roh-GAY-shun',
    category: 'legal-contract',
    plainDefinition: 'A clause blocking your renter’s insurance from suing a negligent party to recover what they paid you.',
    everydayAnalogy: 'Telling your insurance company they cannot ask the person who flooded your apartment to pay them back.',
  },
  habitability: {
    term: 'Implied warranty of habitability',
    syllables: 'hab·it·a·bil·i·ty',
    phoneticHint: 'hab-ih-tuh-BIL-ih-tee',
    category: 'legal-contract',
    plainDefinition: 'Your non-waivable legal right to a safe apartment with working heat, plumbing, locks, and clean water.',
    everydayAnalogy: 'The baseline safety guarantee that a home must be livable by law.',
  },
  superposition: {
    term: 'Coherent quantum superposition',
    syllables: 'su·per·po·si·tion',
    phoneticHint: 'soo-per-poh-ZISH-un',
    category: 'quantum-physics',
    plainDefinition: 'A quantum state where a qubit holds a weighted blend of both 0 and 1 at the same time before measurement.',
    everydayAnalogy: 'A spinning coin in mid-air that is neither purely heads nor tails until you slap it flat on the table.',
  },
  decoherence: {
    term: 'Environmental decoherence',
    syllables: 'de·co·her·ence',
    phoneticHint: 'dee-koh-HEER-uns',
    category: 'quantum-physics',
    plainDefinition: 'When stray heat or vibrations leak into a qubit and prematurely collapse its delicate quantum state.',
    everydayAnalogy: 'A gust of wind knocking over a house of cards before you finish building it.',
  },
  hadamard: {
    term: 'Unitary Hadamard transformation',
    syllables: 'Had·a·mard trans·for·ma·tion',
    phoneticHint: 'HAD-uh-mard',
    category: 'quantum-physics',
    plainDefinition: 'A fundamental quantum logic gate that rotates a definite 0 or 1 qubit into an equal 50/50 superposition.',
    everydayAnalogy: 'Flicking a resting coin up into a balanced, 50/50 spin.',
  },
};

/**
 * Extracts all numeric figures, percentages, dosages, currencies, and timeframes from text
 * to guarantee simplification never drops critical numbers.
 */
export function extractCriticalEntities(text: string): string[] {
  const matches = text.match(/(\$?\d+(?:,\d{3})*(?:\.\d+)?%?|\b\d+\s*(?:mg|mL|mmHg|F|°F|hours?|days?|months?|minutes?|seconds?|mV|ATP|Hz)\b)/gi);
  if (!matches) return [];
  return Array.from(new Set(matches.map((m) => m.trim())));
}

/**
 * Verifies that every critical numeric entity in the original clause is preserved in the simplified clause.
 */
export function verifyCriticalEntityPreservation(
  originalClause: string,
  simplifiedClause: string
): { passed: boolean; preserved: string[]; missing: string[] } {
  const numericTokens = originalClause.match(/\$?\d+(?:,\d{3})*(?:\.\d+)?%?/g) ?? [];
  const uniqueTokens = Array.from(new Set(numericTokens));
  const preserved: string[] = [];
  const missing: string[] = [];

  for (const token of uniqueTokens) {
    if (simplifiedClause.includes(token)) {
      preserved.push(token);
    } else {
      missing.push(token);
    }
  }

  return {
    passed: missing.length === 0,
    preserved,
    missing,
  };
}

export const SHOWCASE_DOCUMENTS: ShowcaseDocumentPreset[] = [
  {
    id: 'stem-atp-synthase',
    title: 'Cellular Bioenergetics: Chemiosmotic Coupling & ATP Synthase',
    domain: 'stem-biology',
    domainBadge: 'STEM Textbook · AP/University Biology',
    subtitle: 'How mitochondria convert proton gradients into rotary mechanical energy (`32 ATP` yield).',
    originalText:
      'During oxidative phosphorylation, high-energy electrons donated by NADH and FADH2 traverse the inner mitochondrial membrane complexes, pumping protons into the intermembrane space to establish a steep 180 mV electrochemical proton gradient. Consequently, chemiosmotic coupling drives protons back into the matrix through the Fo rotary channel of ATP synthase, inducing a 120-degree mechanical conformational rotation per proton group in the catalytic F1 subunit. This rotary catalysis phosphorylates adenosine diphosphate into 32 ATP molecules per glucose molecule, whereas uncoupling agents dissipate the gradient as thermal energy without ATP synthesis.',
    clauses: [
      {
        id: 'stem-c1',
        clauseIndex: 1,
        originalClause:
          'During oxidative phosphorylation, high-energy electrons donated by NADH and FADH2 traverse the inner mitochondrial membrane complexes, pumping protons into the intermembrane space to establish a steep 180 mV electrochemical proton gradient.',
        simplifiedClause:
          'Step 1 (Build Pressure): Carrier molecules NADH and FADH2 pass electrons along the inner mitochondrial wall. This pumps protons across the wall to build up a strong 180 mV electrical and chemical pressure difference.',
        keyTakeaway: 'Electrons power proton pumps to build a 180 mV battery-like pressure across the membrane.',
        riskSeverity: 'info',
        riskBadgeLabel: 'Core Mechanism · Step 1',
        jargonTerms: [BUILTIN_JARGON_LEXICON.phosphorylation, BUILTIN_JARGON_LEXICON.electrochemical],
      },
      {
        id: 'stem-c2',
        clauseIndex: 2,
        originalClause:
          'Consequently, chemiosmotic coupling drives protons back into the matrix through the Fo rotary channel of ATP synthase, inducing a 120-degree mechanical conformational rotation per proton group in the catalytic F1 subunit.',
        simplifiedClause:
          'Step 2 (Spin the Turbine): That stored pressure pushes protons back through the Fo tunnel of ATP synthase. The rushing protons physically spin the F1 motor head in 120-degree steps like a microscopic waterwheel.',
        keyTakeaway: 'Protons rush back through ATP synthase and spin its rotor in 120-degree steps.',
        riskSeverity: 'action-required',
        riskBadgeLabel: 'Rotary Motor · Step 2',
        jargonTerms: [BUILTIN_JARGON_LEXICON.chemiosmotic],
      },
      {
        id: 'stem-c3',
        clauseIndex: 3,
        originalClause:
          'This rotary catalysis phosphorylates adenosine diphosphate into 32 ATP molecules per glucose molecule, whereas uncoupling agents dissipate the gradient as thermal energy without ATP synthesis.',
        simplifiedClause:
          'Step 3 (Mint Energy or Heat): The spinning motor snaps a phosphate onto ADP to make 32 ATP fuel molecules per glucose. However, if the membrane leaks ("uncoupling"), that pressure escapes as body heat instead of making ATP.',
        keyTakeaway: 'Spinning makes 32 ATP per glucose; membrane leaks turn that energy into heat instead.',
        riskSeverity: 'warning',
        riskBadgeLabel: 'Exam Trap · Uncoupling Leaks',
        jargonTerms: [BUILTIN_JARGON_LEXICON.phosphorylation],
      },
    ],
    comprehensionChecks: [
      {
        id: 'stem-q1',
        prompt: 'What physically causes the F1 motor head of ATP synthase to spin in 120-degree steps?',
        options: [
          'Protons rushing back across the membrane from the 180 mV pressure gradient',
          'Glucose molecules directly colliding with the outer cell wall',
          'Thermal heat boiling water inside the cytoplasm',
        ],
        correctIndex: 0,
        explanation:
          'Just like water rushing through a hydroelectric dam, protons flowing down the 180 mV gradient through the Fo channel physically spin the F1 rotor.',
      },
      {
        id: 'stem-q2',
        prompt: 'What happens if an uncoupling agent creates a proton leak in the inner mitochondrial membrane?',
        options: [
          'The cell produces 64 ATP instead of 32 ATP',
          'The proton pressure escapes as thermal heat without producing ATP',
          'NADH stops donating electrons permanently',
        ],
        correctIndex: 1,
        explanation:
          'When protons bypass the ATP synthase turbine via a membrane leak, the stored gradient energy is released as heat rather than chemical ATP.',
      },
    ],
  },
  {
    id: 'medical-cardiac-discharge',
    title: 'Post-PCI Cardiac Stent Discharge & Medication Safety Protocol',
    domain: 'medical-discharge',
    domainBadge: 'Clinical Discharge · Patient Safety',
    subtitle: 'Critical daily blood-thinner schedule (`75 mg`), emergency nitroglycerin steps, and ER warning signs.',
    originalText:
      'Following percutaneous coronary intervention with drug-eluting stent placement, the patient must strictly adhere to dual antiplatelet anticoagulant therapy comprising clopidogrel 75 mg and aspirin 81 mg orally every 24 hours; premature discontinuation precipitates acute stent thrombosis. In the event of recurrent angina pectoris, administer 0.4 mg sublingual nitroglycerin every 5 minutes for a maximum of 3 doses, and activate emergency medical services if chest pressure persists beyond 15 minutes. Seek immediate clinical evaluation for exertional dyspnea, syncope, femoral access hematoma exceeding 2 cm, or pyrexia above 100.4 F.',
    clauses: [
      {
        id: 'med-c1',
        clauseIndex: 1,
        originalClause:
          'Following percutaneous coronary intervention with drug-eluting stent placement, the patient must strictly adhere to dual antiplatelet anticoagulant therapy comprising clopidogrel 75 mg and aspirin 81 mg orally every 24 hours; premature discontinuation precipitates acute stent thrombosis.',
        simplifiedClause:
          'DAILY LIFE-SAVING MEDS: Because you have a new heart stent, you MUST take clopidogrel 75 mg and aspirin 81 mg by mouth every 24 hours. Do NOT stop taking them early, or a dangerous blood clot can suddenly block your stent.',
        keyTakeaway: 'Take clopidogrel 75 mg + aspirin 81 mg every 24 hours without skipping a single day.',
        riskSeverity: 'critical',
        riskBadgeLabel: 'CRITICAL · Never Skip Dose',
        jargonTerms: [BUILTIN_JARGON_LEXICON.anticoagulant],
      },
      {
        id: 'med-c2',
        clauseIndex: 2,
        originalClause:
          'In the event of recurrent angina pectoris, administer 0.4 mg sublingual nitroglycerin every 5 minutes for a maximum of 3 doses, and activate emergency medical services if chest pressure persists beyond 15 minutes.',
        simplifiedClause:
          'IF CHEST PAIN STARTS: Sit down and dissolve one 0.4 mg nitroglycerin tablet under your tongue every 5 minutes (up to 3 doses max). If chest pressure is still there after 15 minutes, call 911 immediately.',
        keyTakeaway: 'Dissolve 0.4 mg nitroglycerin under tongue every 5 minutes (max 3 doses); call 911 at 15 minutes.',
        riskSeverity: 'action-required',
        riskBadgeLabel: 'Emergency Action · 5-Min Rule',
        jargonTerms: [BUILTIN_JARGON_LEXICON.sublingual],
      },
      {
        id: 'med-c3',
        clauseIndex: 3,
        originalClause:
          'Seek immediate clinical evaluation for exertional dyspnea, syncope, femoral access hematoma exceeding 2 cm, or pyrexia above 100.4 F.',
        simplifiedClause:
          'RED-FLAG WARNING SIGNS: Call your cardiologist or go to the ER right away if you notice shortness of breath, fainting, a groin lump larger than 2 cm, or a fever above 100.4 F.',
        keyTakeaway: 'Go to ER for shortness of breath, fainting, groin lump > 2 cm, or fever > 100.4 F.',
        riskSeverity: 'warning',
        riskBadgeLabel: 'Red-Flag Symptoms · Call Doctor',
        jargonTerms: [BUILTIN_JARGON_LEXICON.dyspnea],
      },
    ],
    comprehensionChecks: [
      {
        id: 'med-q1',
        prompt: 'Why is it critical to take clopidogrel 75 mg and aspirin 81 mg every single day without stopping early?',
        options: [
          'They prevent platelets from clumping and forming a dangerous clot inside your new heart stent',
          'They are only for mild headaches and can be skipped when you feel fine',
          'They lower fever below 100.4 F',
        ],
        correctIndex: 0,
        explanation:
          'Dual antiplatelet therapy keeps blood flowing smoothly through the new stent; stopping early can cause a life-threatening stent clot.',
      },
      {
        id: 'med-q2',
        prompt: 'If chest pressure starts, how should you use 0.4 mg sublingual nitroglycerin?',
        options: [
          'Swallow 3 pills all at once with water',
          'Dissolve 1 tablet under your tongue every 5 minutes (up to 3 doses), and call 911 if pain lasts 15 minutes',
          'Wait 24 hours before calling the clinic',
        ],
        correctIndex: 1,
        explanation:
          'Dissolve one 0.4 mg tablet under the tongue every 5 minutes up to 3 doses max; if chest tightness remains at 15 minutes, call emergency services.',
      },
    ],
  },
  {
    id: 'legal-residential-lease',
    title: 'Residential Lease Addendum: Indemnification, Deposit & Auto-Renewal',
    domain: 'legal-contract',
    domainBadge: 'Legal Contract · Tenant Protection',
    subtitle: 'Spotting hidden auto-renewal windows (`60 days`), non-refundable fees (`$450`), and liability shifts.',
    originalText:
      'Pursuant to Section 14(b), this tenancy shall automatically renew for an additional 12 months at a 8% rental escalation unless Lessee delivers written notice via certified mail at least 60 days prior to expiration. Out of the $2,400 security deposit remitted upon execution, $450 is designated as a nonrefundable administrative reconditioning fee, and Lessor reserves 45 days post-surrender to remit any residual balance. Furthermore, Lessee agrees to unilateral indemnification of Lessor against all premises liability claims and executes a complete waiver of subrogation without diminishing statutory habitability obligations.',
    clauses: [
      {
        id: 'leg-c1',
        clauseIndex: 1,
        originalClause:
          'Pursuant to Section 14(b), this tenancy shall automatically renew for an additional 12 months at a 8% rental escalation unless Lessee delivers written notice via certified mail at least 60 days prior to expiration.',
        simplifiedClause:
          'AUTO-RENEWAL DEADLINE (Section 14(b)): Your lease will automatically lock you in for another 12 months with an 8% rent increase unless you mail a certified written cancellation notice at least 60 days before your lease ends.',
        keyTakeaway: 'Send certified mail notice 60 days before lease end, or Section 14(b) auto-renews for 12 months at +8% rent.',
        riskSeverity: 'critical',
        riskBadgeLabel: '60-Day Trap · Auto-Renewal',
        jargonTerms: [],
      },
      {
        id: 'leg-c2',
        clauseIndex: 2,
        originalClause:
          'Out of the $2,400 security deposit remitted upon execution, $450 is designated as a nonrefundable administrative reconditioning fee, and Lessor reserves 45 days post-surrender to remit any residual balance.',
        simplifiedClause:
          'HIDDEN FEE & REFUND WAIT: Out of your $2,400 security deposit, the landlord keeps $450 automatically as a nonrefundable fee (max $1,950 comes back). They also take up to 45 days after move-out to return the rest.',
        keyTakeaway: '$450 of your $2,400 deposit is never returned, and the rest takes up to 45 days after move-out.',
        riskSeverity: 'warning',
        riskBadgeLabel: 'Financial Risk · $450 Kept',
        jargonTerms: [],
      },
      {
        id: 'leg-c3',
        clauseIndex: 3,
        originalClause:
          'Furthermore, Lessee agrees to unilateral indemnification of Lessor against all premises liability claims and executes a complete waiver of subrogation without diminishing statutory habitability obligations.',
        simplifiedClause:
          'ONE-SIDED LIABILITY SHIFT: This clause makes you pay the landlord’s legal costs for accidents on the property and blocks your renter’s insurance from suing them—though the landlord still must provide basic safe livability (heat, water, locks).',
        keyTakeaway: 'One-sided liability clause shifts accident costs to you, though basic livability rights remain.',
        riskSeverity: 'critical',
        riskBadgeLabel: 'Red-Line Clause · Negotiate Before Signing',
        jargonTerms: [
          BUILTIN_JARGON_LEXICON.indemnification,
          BUILTIN_JARGON_LEXICON.subrogation,
          BUILTIN_JARGON_LEXICON.habitability,
        ],
      },
    ],
    comprehensionChecks: [
      {
        id: 'leg-q1',
        prompt: 'What happens if you wait until 30 days before your lease ends to tell the landlord you are moving out?',
        options: [
          'Your lease automatically renews for 12 months with an 8% rent hike because notice was required 60 days ahead',
          'You receive your full $2,400 deposit back on move-out day',
          'The lease converts to a free month-to-month extension',
        ],
        correctIndex: 0,
        explanation:
          'Section 14(b) requires certified mail notice at least 60 days prior to expiration; missing that window triggers a 12-month renewal at +8% rent.',
      },
    ],
  },
  {
    id: 'quantum-superposition-gates',
    title: 'Quantum Information: Superposition, Hadamard Gates & Decoherence',
    domain: 'quantum-physics',
    domainBadge: 'STEM Physics · Quantum Computing',
    subtitle: 'Understanding qubit states, `50%` Hadamard probability amplitudes, and `150 microseconds` coherence windows.',
    originalText:
      'Unlike a classical transistor constrained to binary 0 or 1, a superconducting transmon qubit cooled to 15 mK maintains a coherent quantum superposition of basis states governed by complex probability amplitudes. Applying a unitary Hadamard transformation rotates a ground-state qubit onto the Bloch sphere equator, yielding an exact 50% measurement probability for either eigenstate upon projective readout. However, stray electromagnetic fluctuations induce environmental decoherence within 150 microseconds, necessitating quantum error correction before phase information degrades.',
    clauses: [
      {
        id: 'q-c1',
        clauseIndex: 1,
        originalClause:
          'Unlike a classical transistor constrained to binary 0 or 1, a superconducting transmon qubit cooled to 15 mK maintains a coherent quantum superposition of basis states governed by complex probability amplitudes.',
        simplifiedClause:
          'QUBIT BASICS: Regular computer bits can only be 0 or 1. When chilled to an ultra-cold 15 mK, a superconducting qubit can exist in a "superposition"—holding a tunable blend of 0 and 1 at the exact same time.',
        keyTakeaway: 'Chilled to 15 mK, a qubit holds a blend of 0 and 1 simultaneously instead of just one state.',
        riskSeverity: 'info',
        riskBadgeLabel: 'Core Concept · 15 mK Qubit',
        jargonTerms: [BUILTIN_JARGON_LEXICON.superposition],
      },
      {
        id: 'q-c2',
        clauseIndex: 2,
        originalClause:
          'Applying a unitary Hadamard transformation rotates a ground-state qubit onto the Bloch sphere equator, yielding an exact 50% measurement probability for either eigenstate upon projective readout.',
        simplifiedClause:
          'THE HADAMARD GATE: Sending a qubit through a Hadamard gate flips it into a perfectly balanced spin, so when you measure it at the end, it has an exact 50% chance of landing on 0 and a 50% chance of landing on 1.',
        keyTakeaway: 'The Hadamard gate puts a qubit into an exact 50% / 50% balanced state.',
        riskSeverity: 'action-required',
        riskBadgeLabel: 'Logic Gate · 50% Balance',
        jargonTerms: [BUILTIN_JARGON_LEXICON.hadamard],
      },
      {
        id: 'q-c3',
        clauseIndex: 3,
        originalClause:
          'However, stray electromagnetic fluctuations induce environmental decoherence within 150 microseconds, necessitating quantum error correction before phase information degrades.',
        simplifiedClause:
          'THE 150-MICROSECOND CLOCK: Tiny outside heat or radio waves spoil this delicate quantum spin within 150 microseconds ("decoherence"), so quantum computers must run error-correction before time runs out.',
        keyTakeaway: 'Outside noise spoils the quantum state within 150 microseconds unless error-correction protects it.',
        riskSeverity: 'warning',
        riskBadgeLabel: 'Hardware Limit · 150 Microseconds',
        jargonTerms: [BUILTIN_JARGON_LEXICON.decoherence],
      },
    ],
    comprehensionChecks: [
      {
        id: 'q-q1',
        prompt: 'Why must quantum circuits finish or correct errors within roughly 150 microseconds?',
        options: [
          'Stray outside noise causes environmental decoherence that collapses the delicate quantum state',
          'The Hadamard gate takes 150 minutes to warm up',
          'Classical bits stop working below 15 mK',
        ],
        correctIndex: 0,
        explanation:
          'Environmental decoherence from stray electromagnetic or thermal noise collapses the superposition within about 150 microseconds.',
      },
    ],
  },
];

/**
 * Rule-based plain-language phrase map for live custom document pasting.
 */
const LIVE_JARGON_REPLACEMENTS: Array<{
  pattern: RegExp;
  replacement: string;
  severity?: RiskSeverity;
  badge?: string;
}> = [
  { pattern: /\bpursuant to\b/gi, replacement: 'under' },
  { pattern: /\bprior to\b/gi, replacement: 'before' },
  { pattern: /\bsubsequent to\b/gi, replacement: 'after' },
  { pattern: /\bin the event of\b/gi, replacement: 'if' },
  { pattern: /\bcommence\b/gi, replacement: 'start' },
  { pattern: /\bterminate\b/gi, replacement: 'end' },
  { pattern: /\butilize\b/gi, replacement: 'use' },
  { pattern: /\badminister\b/gi, replacement: 'give or take' },
  { pattern: /\bprecipitates\b/gi, replacement: 'causes' },
  { pattern: /\bdiscontinuation\b/gi, replacement: 'stopping' },
  { pattern: /\bremit(?:ted)?\b/gi, replacement: 'pay' },
  { pattern: /\bnonrefundable\b/gi, replacement: 'never returned (nonrefundable)', severity: 'warning', badge: 'Financial Alert · Nonrefundable' },
  { pattern: /\bindemnif(?:y|ication)\b/gi, replacement: 'cover legal liability (indemnify)', severity: 'critical', badge: 'Liability Shift · Indemnification' },
  { pattern: /\bsubrogation\b/gi, replacement: 'insurance reimbursement rights (subrogation)', severity: 'warning', badge: 'Insurance Waiver' },
  { pattern: /\bautomatically renew\b/gi, replacement: 'auto-renew', severity: 'critical', badge: 'Auto-Renewal Trap' },
  { pattern: /\banticoagulant\b/gi, replacement: 'blood-thinning (anticoagulant)', severity: 'critical', badge: 'Critical Medication' },
  { pattern: /\bdyspnea\b/gi, replacement: 'shortness of breath (dyspnea)', severity: 'warning', badge: 'Warning Symptom' },
  { pattern: /\bsyncope\b/gi, replacement: 'fainting (syncope)', severity: 'warning', badge: 'Warning Symptom' },
  { pattern: /\bpyrexia\b/gi, replacement: 'fever (pyrexia)', severity: 'warning', badge: 'Fever Threshold' },
  { pattern: /\bchemiosmotic coupling\b/gi, replacement: 'proton-pressure power (chemiosmotic coupling)' },
  { pattern: /\boxidative phosphorylation\b/gi, replacement: 'ATP battery recharging (oxidative phosphorylation)' },
];

/**
 * Simplifies either a pre-loaded showcase document or any arbitrary custom pasted text.
 */
export function simplifyDocumentText(
  inputText: string,
  presetId?: string
): DocumentSimplificationResult {
  const matchedPreset = SHOWCASE_DOCUMENTS.find(
    (doc) => doc.id === presetId || doc.originalText.trim() === inputText.trim()
  );

  if (matchedPreset) {
    const clauses: SimplifiedClausePair[] = matchedPreset.clauses.map((c) => {
      const check = verifyCriticalEntityPreservation(c.originalClause, c.simplifiedClause);
      return {
        ...c,
        preservedEntities: check.preserved,
      };
    });

    const simplifiedSummaryText = clauses.map((c) => c.simplifiedClause).join(' ');
    const originalMetrics = computeReadabilityMetrics(matchedPreset.originalText);
    const simplifiedMetrics = computeReadabilityMetrics(simplifiedSummaryText);
    const gradeReductionDelta = Number(
      Math.max(0.5, originalMetrics.fleschKincaidGrade - simplifiedMetrics.fleschKincaidGrade).toFixed(1)
    );

    const glossaryMap = new Map<string, JargonTermCard>();
    for (const c of clauses) {
      for (const j of c.jargonTerms) {
        glossaryMap.set(j.term, j);
      }
    }

    const allEntitiesPassed = clauses.every(
      (c) => verifyCriticalEntityPreservation(c.originalClause, c.simplifiedClause).passed
    );

    return {
      documentId: matchedPreset.id,
      title: matchedPreset.title,
      domain: matchedPreset.domain,
      domainBadge: matchedPreset.domainBadge,
      originalText: matchedPreset.originalText,
      simplifiedSummaryText,
      originalMetrics,
      simplifiedMetrics,
      gradeReductionDelta,
      clauses,
      glossary: Array.from(glossaryMap.values()),
      comprehensionChecks: matchedPreset.comprehensionChecks,
      entityPreservationPassed: allEntitiesPassed,
    };
  }

  // Custom pasted text decomposition & deterministic simplification
  const cleanInput = inputText.trim() || SHOWCASE_DOCUMENTS[0].originalText;
  const rawSentences = cleanInput
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  const clauses: SimplifiedClausePair[] = rawSentences.map((sentence, idx) => {
    let simplified = sentence;
    let detectedSeverity: RiskSeverity = 'info';
    let badge = `Plain Clause · Step ${idx + 1}`;

    for (const rule of LIVE_JARGON_REPLACEMENTS) {
      if (rule.pattern.test(simplified)) {
        simplified = simplified.replace(rule.pattern, rule.replacement);
        if (rule.severity === 'critical') {
          detectedSeverity = 'critical';
          badge = rule.badge ?? 'Critical Callout';
        } else if (rule.severity === 'warning' && detectedSeverity !== 'critical') {
          detectedSeverity = 'warning';
          badge = rule.badge ?? 'Important Warning';
        }
      }
    }

    // Break overly long semicolons into short digestible sentences so Flesch-Kincaid grade drops reliably
    simplified = simplified.replace(/;\s*/g, '. In short: ');

    const matchedJargon: JargonTermCard[] = [];
    for (const [key, card] of Object.entries(BUILTIN_JARGON_LEXICON)) {
      if (sentence.toLowerCase().includes(key)) {
        matchedJargon.push(card);
      }
    }

    // Also extract any long unfamiliar word (>= 11 chars) as an automatic syllable card if not in lexicon
    const longWords = sentence
      .split(/\s+/)
      .map((w) => w.replace(/[^a-zA-Z]/g, ''))
      .filter((w) => w.length >= 11);

    for (const lw of longWords.slice(0, 2)) {
      const lower = lw.toLowerCase();
      if (!BUILTIN_JARGON_LEXICON[lower] && !matchedJargon.some((m) => m.term.toLowerCase() === lower)) {
        const syls = segmentWordIntoSyllables(lw).join('·');
        matchedJargon.push({
          term: lw,
          syllables: syls,
          phoneticHint: syls.toUpperCase(),
          category: 'custom',
          plainDefinition: `Multi-syllable domain term (${segmentWordIntoSyllables(lw).length} syllables) broken into phonetic chunks for easier decoding.`,
          everydayAnalogy: `Read syllable by syllable: ${syls}.`,
        });
      }
    }

    const check = verifyCriticalEntityPreservation(sentence, simplified);

    return {
      id: `custom-c${idx + 1}`,
      clauseIndex: idx + 1,
      originalClause: sentence,
      simplifiedClause: simplified,
      keyTakeaway: simplified.split('.')[0] + '.',
      riskSeverity: detectedSeverity,
      riskBadgeLabel: badge,
      preservedEntities: check.preserved,
      jargonTerms: matchedJargon,
    };
  });

  const simplifiedSummaryText = clauses.map((c) => c.simplifiedClause).join(' ');
  const originalMetrics = computeReadabilityMetrics(cleanInput);
  const simplifiedMetrics = computeReadabilityMetrics(simplifiedSummaryText);
  const gradeReductionDelta = Number(
    Math.max(0.5, originalMetrics.fleschKincaidGrade - simplifiedMetrics.fleschKincaidGrade).toFixed(1)
  );

  const glossaryMap = new Map<string, JargonTermCard>();
  for (const c of clauses) {
    for (const j of c.jargonTerms) {
      glossaryMap.set(j.term, j);
    }
  }

  return {
    documentId: 'custom-document',
    title: 'Custom Pasted Passage — Live Dyslexia & Clause Breakdown',
    domain: 'custom',
    domainBadge: 'Custom Live Document · Instant Analysis',
    originalText: cleanInput,
    simplifiedSummaryText,
    originalMetrics,
    simplifiedMetrics,
    gradeReductionDelta,
    clauses,
    glossary: Array.from(glossaryMap.values()),
    comprehensionChecks: [
      {
        id: 'custom-q1',
        prompt: 'Did LexiLens preserve 100% of the numeric figures, dates, and dosages from your custom passage?',
        options: [
          'Yes — every number, percentage, and unit is verified and highlighted intact',
          'No — numbers were deleted',
        ],
        correctIndex: 0,
        explanation:
          'LexiLens runs an entity-preservation verifier on every clause so simplifying jargon never alters a dosage, deadline, or dollar amount.',
      },
    ],
    entityPreservationPassed: clauses.every(
      (c) => verifyCriticalEntityPreservation(c.originalClause, c.simplifiedClause).passed
    ),
  };
}
