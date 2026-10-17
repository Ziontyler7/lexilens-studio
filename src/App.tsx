import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  DYSLEXIA_THEME_PRESETS,
  DEFAULT_DYSLEXIA_CONFIG,
  formatParagraphForDyslexia,
  computeHexContrastRatio,
  type DyslexiaTypographyConfig,
  type DyslexiaTintId,
  type DyslexiaFontFamilyId,
} from './lib/dyslexia/dyslexia-typography-engine.ts';
import {
  SHOWCASE_DOCUMENTS,
  simplifyDocumentText,
  type DocumentSimplificationResult,
  type RiskSeverity,
} from './lib/simplifier/clause-simplifier-engine.ts';
import {
  buildConceptGraph,
  getConnectedSubgraph,
  type ConceptNodeType,
} from './lib/concept/concept-graph-engine.ts';
import {
  buildAudioExplainerTimeline,
  findActiveWordCueIndex,
  type SpeechRateMultiplier,
} from './lib/audio/audio-explainer-engine.ts';
import {
  runDocumentInference,
  type AIProviderMode,
} from './lib/ai/ai-inference-adapter.ts';

const STORAGE_KEY_CONFIG = 'lexilens.typography.v1';

interface IconProps {
  size?: number;
  color?: string;
}

const IconSvg = ({
  size = 18,
  color = 'currentColor',
  children,
}: IconProps & { children: React.ReactNode }): React.ReactElement => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {children}
  </svg>
);

const Eye = (p: IconProps): React.ReactElement => (
  <IconSvg {...p}>
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </IconSvg>
);
const Sparkles = (p: IconProps): React.ReactElement => (
  <IconSvg {...p}>
    <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3Z" />
  </IconSvg>
);
const Cpu = (p: IconProps): React.ReactElement => (
  <IconSvg {...p}>
    <rect x="4" y="4" width="16" height="16" rx="2" />
    <rect x="9" y="9" width="6" height="6" />
  </IconSvg>
);
const BookOpen = (p: IconProps): React.ReactElement => (
  <IconSvg {...p}>
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </IconSvg>
);
const Sliders = (p: IconProps): React.ReactElement => (
  <IconSvg {...p}>
    <line x1="4" x2="4" y1="21" y2="14" />
    <line x1="4" x2="4" y1="10" y2="3" />
    <line x1="12" x2="12" y1="21" y2="12" />
    <line x1="12" x2="12" y1="8" y2="3" />
    <line x1="20" x2="20" y1="21" y2="16" />
    <line x1="20" x2="20" y1="12" y2="3" />
  </IconSvg>
);
const Network = (p: IconProps): React.ReactElement => (
  <IconSvg {...p}>
    <rect x="16" y="16" width="6" height="6" rx="1" />
    <rect x="2" y="16" width="6" height="6" rx="1" />
    <rect x="9" y="2" width="6" height="6" rx="1" />
    <path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3" />
    <path d="M12 12V8" />
  </IconSvg>
);
const FileText = (p: IconProps): React.ReactElement => (
  <IconSvg {...p}>
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    <path d="M10 9H8" />
    <path d="M16 13H8" />
    <path d="M16 17H8" />
  </IconSvg>
);
const ShieldAlert = (p: IconProps): React.ReactElement => (
  <IconSvg {...p}>
    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    <path d="M12 8v4" />
    <path d="M12 16h.01" />
  </IconSvg>
);
const Volume2 = (p: IconProps): React.ReactElement => (
  <IconSvg {...p}>
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
  </IconSvg>
);
const Pause = (p: IconProps): React.ReactElement => (
  <IconSvg {...p}>
    <rect x="14" y="4" width="4" height="16" rx="1" />
    <rect x="6" y="4" width="4" height="16" rx="1" />
  </IconSvg>
);
const RotateCcw = (p: IconProps): React.ReactElement => (
  <IconSvg {...p}>
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
  </IconSvg>
);
const Layers = (p: IconProps): React.ReactElement => (
  <IconSvg {...p}>
    <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
    <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" />
    <path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" />
  </IconSvg>
);
const ArrowRight = (p: IconProps): React.ReactElement => (
  <IconSvg {...p}>
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </IconSvg>
);
const HelpCircle = (p: IconProps): React.ReactElement => (
  <IconSvg {...p}>
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <path d="M12 17h.01" />
  </IconSvg>
);
const CheckCircle2 = (p: IconProps): React.ReactElement => (
  <IconSvg {...p}>
    <circle cx="12" cy="12" r="10" />
    <path d="m9 12 2 2 4-4" />
  </IconSvg>
);

function loadPersistedConfig(): DyslexiaTypographyConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (!raw) return DEFAULT_DYSLEXIA_CONFIG;
    const parsed = JSON.parse(raw) as Partial<DyslexiaTypographyConfig>;
    return {
      ...DEFAULT_DYSLEXIA_CONFIG,
      ...parsed,
    };
  } catch {
    return DEFAULT_DYSLEXIA_CONFIG;
  }
}

export default function App(): React.ReactElement {
  const [selectedPresetId, setSelectedPresetId] = useState<string>(SHOWCASE_DOCUMENTS[0].id);
  const [customInputText, setCustomInputText] = useState<string>(SHOWCASE_DOCUMENTS[0].originalText);
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);

  const [typoConfig, setTypoConfig] = useState<DyslexiaTypographyConfig>(loadPersistedConfig);
  const [activeClauseIdx, setActiveClauseIdx] = useState<number>(1);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // AI Inference Adapter state (Instant Local Deterministic + Optional BYOK)
  const [aiMode, setAiMode] = useState<AIProviderMode>('local-deterministic');
  const [byokKey, setByokKey] = useState<string>('');
  const [showAiDrawer, setShowAiDrawer] = useState<boolean>(false);
  const [aiStatusBanner, setAiStatusBanner] = useState<string>(
    'Instant Local Deterministic Engine Active (0ms Network Dependency)'
  );
  const [docResult, setDocResult] = useState<DocumentSimplificationResult>(() =>
    simplifyDocumentText(SHOWCASE_DOCUMENTS[0].originalText, SHOWCASE_DOCUMENTS[0].id)
  );

  // Audio Explainer playback state
  const [speechRate, setSpeechRate] = useState<SpeechRateMultiplier>(1.0);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [elapsedAudioMs, setElapsedAudioMs] = useState<number>(0);
  const audioTimerRef = useRef<number | null>(null);

  // Comprehension Quiz state
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});

  // Persist dyslexia typography settings safely
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(typoConfig));
    } catch {
      // Ignore storage quota errors
    }
  }, [typoConfig]);

  // Re-run simplification when preset changes
  const handleSelectPreset = async (presetId: string): Promise<void> => {
    stopAudioPlayback();
    setSelectedPresetId(presetId);
    setIsCustomMode(false);
    setSelectedNodeId(null);
    setActiveClauseIdx(1);
    setQuizAnswers({});

    const found = SHOWCASE_DOCUMENTS.find((d) => d.id === presetId) ?? SHOWCASE_DOCUMENTS[0];
    setCustomInputText(found.originalText);

    const envelope = await runDocumentInference(
      found.originalText,
      { mode: aiMode, apiKey: byokKey },
      presetId
    );
    setDocResult(envelope.result);
    setAiStatusBanner(
      envelope.fallbackTriggered && envelope.fallbackReason
        ? envelope.fallbackReason
        : `Analyzed in ${envelope.latencyMs}ms via ${
            envelope.providerUsed === 'local-deterministic'
              ? 'Local Deterministic Engine'
              : envelope.providerUsed
          }`
    );
  };

  const handleAnalyzeCustomText = async (): Promise<void> => {
    stopAudioPlayback();
    setIsCustomMode(true);
    setSelectedNodeId(null);
    setActiveClauseIdx(1);
    setQuizAnswers({});

    const envelope = await runDocumentInference(customInputText, {
      mode: aiMode,
      apiKey: byokKey,
    });
    setDocResult(envelope.result);
    setAiStatusBanner(
      envelope.fallbackTriggered && envelope.fallbackReason
        ? envelope.fallbackReason
        : `Analyzed custom passage in ${envelope.latencyMs}ms (${envelope.providerUsed})`
    );
  };

  // Concept Graph layout & subgraph selection
  const conceptGraph = useMemo(() => buildConceptGraph(docResult), [docResult]);
  const connectedSubgraph = useMemo(
    () => getConnectedSubgraph(conceptGraph, selectedNodeId),
    [conceptGraph, selectedNodeId]
  );

  // Active clause object for the Audio Explainer & Jargon Focus
  const activeClause = useMemo(
    () =>
      docResult.clauses.find((c) => c.clauseIndex === activeClauseIdx) ??
      docResult.clauses[0],
    [docResult, activeClauseIdx]
  );

  // Audio Explainer Timeline for the active simplified clause
  const audioTimeline = useMemo(
    () => buildAudioExplainerTimeline(activeClause?.simplifiedClause ?? '', speechRate),
    [activeClause, speechRate]
  );

  const activeWordIdx = useMemo(
    () => (isPlayingAudio ? findActiveWordCueIndex(audioTimeline, elapsedAudioMs) : -1),
    [isPlayingAudio, audioTimeline, elapsedAudioMs]
  );

  const stopAudioPlayback = (): void => {
    if (audioTimerRef.current !== null) {
      window.clearInterval(audioTimerRef.current);
      audioTimerRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingAudio(false);
    setElapsedAudioMs(0);
  };

  const toggleAudioPlayback = (): void => {
    if (isPlayingAudio) {
      stopAudioPlayback();
      return;
    }

    setElapsedAudioMs(0);
    setIsPlayingAudio(true);

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(activeClause?.simplifiedClause ?? '');
        utterance.rate = speechRate;
        window.speechSynthesis.speak(utterance);
      } catch {
        // Fallback timer still drives visual word highlighting even if browser TTS is muted
      }
    }

    const startTick = Date.now();
    audioTimerRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startTick;
      if (elapsed >= audioTimeline.totalDurationMs) {
        stopAudioPlayback();
      } else {
        setElapsedAudioMs(elapsed);
      }
    }, 50);
  };

  useEffect(() => {
    return () => {
      if (audioTimerRef.current !== null) {
        window.clearInterval(audioTimerRef.current);
      }
    };
  }, []);

  const theme = DYSLEXIA_THEME_PRESETS[typoConfig.tintId];
  const contrastRatio = useMemo(
    () => computeHexContrastRatio(theme.backgroundHex, theme.textPrimaryHex),
    [theme]
  );

  const fontStackMap: Record<DyslexiaFontFamilyId, string> = {
    'lexend-sans': '"Lexend", "Avenir Next", "Segoe UI", Roboto, system-ui, sans-serif',
    'opendyslexic-weighted': '"OpenDyslexic", "Comic Sans MS", "Trebuchet MS", Verdana, sans-serif',
    'atkinson-hyperlegible': '"Atkinson Hyperlegible", "Verdana", "Tahoma", system-ui, sans-serif',
  };

  const severityStyles: Record<
    RiskSeverity,
    { border: string; badgeBg: string; badgeText: string }
  > = {
    critical: {
      border: '#DC2626',
      badgeBg: '#FEE2E2',
      badgeText: '#991B1B',
    },
    warning: {
      border: '#D97706',
      badgeBg: '#FEF3C7',
      badgeText: '#92400E',
    },
    'action-required': {
      border: '#0284C7',
      badgeBg: '#E0F2FE',
      badgeText: '#075985',
    },
    info: {
      border: '#0F766E',
      badgeBg: '#CCFBF1',
      badgeText: '#115E59',
    },
  };

  const nodeTypeColors: Record<
    ConceptNodeType,
    { fill: string; stroke: string; badge: string }
  > = {
    prerequisite: { fill: '#E0F2FE', stroke: '#0284C7', badge: 'INPUT / PREREQ' },
    mechanism: { fill: '#CCFBF1', stroke: '#0F766E', badge: 'CORE MECHANISM' },
    outcome: { fill: '#DCFCE7', stroke: '#15803D', badge: 'OUTCOME / YIELD' },
    warning: { fill: '#FEE2E2', stroke: '#DC2626', badge: 'RISK / TRAP' },
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: theme.backgroundHex,
        color: theme.textPrimaryHex,
        fontFamily: fontStackMap[typoConfig.fontFamily],
        transition: 'background-color 0.2s ease, color 0.2s ease',
        paddingBottom: '64px',
      }}
    >
      {/* Top Studio Header */}
      <header
        style={{
          backgroundColor: theme.surfaceHex,
          borderBottom: `2px solid ${theme.accentHex}33`,
          padding: '16px 28px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              backgroundColor: theme.accentHex,
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '20px',
            }}
          >
            <Eye size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 800, letterSpacing: '0.02em' }}>
                LexiLens Studio
              </h1>
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  padding: '3px 10px',
                  borderRadius: '999px',
                  backgroundColor: theme.accentHex,
                  color: '#FFFFFF',
                }}
              >
                WCAG AAA {contrastRatio}:1
              </span>
            </div>
            <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: theme.textSecondaryHex }}>
              Visual Dyslexia-Friendly STEM, Clinical Discharge & Legal Contract Simplifier
            </p>
          </div>
        </div>

        {/* Right Controls: Grade Reduction Pill + AI Settings Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div
            style={{
              padding: '8px 14px',
              borderRadius: '10px',
              backgroundColor: theme.backgroundHex,
              border: `1px solid ${theme.accentHex}55`,
              fontSize: '13px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Sparkles size={16} color={theme.accentHex} />
            <span>
              Reading Level: Grade {docResult.originalMetrics.fleschKincaidGrade} →{' '}
              <strong style={{ color: theme.accentHex }}>
                Grade {docResult.simplifiedMetrics.fleschKincaidGrade} (-{docResult.gradeReductionDelta} Grades)
              </strong>
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowAiDrawer((prev) => !prev)}
            style={{
              padding: '9px 14px',
              borderRadius: '10px',
              border: `1px solid ${theme.accentHex}`,
              backgroundColor: showAiDrawer ? theme.accentHex : 'transparent',
              color: showAiDrawer ? '#FFFFFF' : theme.textPrimaryHex,
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Cpu size={16} />
            <span>AI Engine ({aiMode === 'local-deterministic' ? 'Local Instant' : 'BYOK'})</span>
          </button>
        </div>
      </header>

      {/* Collapsible AI Engine & BYOK Configuration Drawer */}
      {showAiDrawer && (
        <section
          aria-label="AI Engine Settings"
          style={{
            maxWidth: '1360px',
            margin: '16px auto 0',
            padding: '16px 24px',
            borderRadius: '14px',
            backgroundColor: theme.surfaceHex,
            border: `2px solid ${theme.accentHex}`,
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
          }}
        >
          <div>
            <strong style={{ fontSize: '14px', display: 'block' }}>
              Dual-Mode AI Inference Adapter (Zero-Setup Judge Mode + Optional BYOK)
            </strong>
            <span style={{ fontSize: '12px', color: theme.textSecondaryHex }}>{aiStatusBanner}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <select
              aria-label="Select AI Provider Mode"
              value={aiMode}
              onChange={(e) => setAiMode(e.target.value as AIProviderMode)}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: `1px solid ${theme.textSecondaryHex}66`,
                backgroundColor: theme.backgroundHex,
                color: theme.textPrimaryHex,
                fontWeight: 600,
              }}
            >
              <option value="local-deterministic">Local Deterministic AI (Instant / Offline Ready)</option>
              <option value="gemini-byok">Google Gemini 2.5 Flash (BYOK + Auto-Fallback)</option>
              <option value="openai-byok">OpenAI GPT-4o-Mini (BYOK + Auto-Fallback)</option>
            </select>

            {aiMode !== 'local-deterministic' && (
              <input
                type="password"
                placeholder="Paste optional API Key (auto-falls back if blank)"
                value={byokKey}
                onChange={(e) => setByokKey(e.target.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: `1px solid ${theme.textSecondaryHex}66`,
                  width: '280px',
                  backgroundColor: theme.backgroundHex,
                  color: theme.textPrimaryHex,
                }}
              />
            )}
          </div>
        </section>
      )}

      {/* Main Studio Container */}
      <main style={{ maxWidth: '1360px', margin: '0 auto', padding: '24px 28px' }}>
        {/* Row 1: Domain Showcase Switcher + Dyslexia Typography Bar */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '20px',
            marginBottom: '24px',
          }}
        >
          {/* Showcase Corpus Selector & Custom Paste Box */}
          <section
            style={{
              backgroundColor: theme.surfaceHex,
              padding: '20px',
              borderRadius: '16px',
              border: `1px solid ${theme.textSecondaryHex}25`,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800 }}>
                <BookOpen size={18} color={theme.accentHex} />
                <span>1. Select Dense Passage or Paste Custom Text</span>
              </div>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '3px 8px',
                  borderRadius: '6px',
                  backgroundColor: docResult.entityPreservationPassed ? '#DCFCE7' : '#FEE2E2',
                  color: docResult.entityPreservationPassed ? '#166534' : '#991B1B',
                }}
              >
                {docResult.entityPreservationPassed
                  ? '100% Numbers & Dosages Preserved'
                  : 'Check Numbers'}
              </span>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                gap: '8px',
                marginBottom: '12px',
              }}
            >
              {SHOWCASE_DOCUMENTS.map((doc) => {
                const isSelected = !isCustomMode && selectedPresetId === doc.id;
                return (
                  <button
                    key={doc.id}
                    type="button"
                    onClick={() => void handleSelectPreset(doc.id)}
                    style={{
                      textAlign: 'left',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: isSelected
                        ? `2px solid ${theme.accentHex}`
                        : `1px solid ${theme.textSecondaryHex}33`,
                      backgroundColor: isSelected ? theme.backgroundHex : 'transparent',
                      color: theme.textPrimaryHex,
                      cursor: 'pointer',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        color: theme.accentHex,
                        textTransform: 'uppercase',
                      }}
                    >
                      {doc.domainBadge.split('·')[0]}
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 700, marginTop: '2px' }}>
                      {doc.title.split(':')[0]}
                    </div>
                  </button>
                );
              })}
            </div>

            <label
              htmlFor="custom-passage-input"
              style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 700,
                marginBottom: '6px',
                color: theme.textSecondaryHex,
              }}
            >
              Source Passage (Edit or paste any STEM textbook, medical note, or contract clause):
            </label>
            <textarea
              id="custom-passage-input"
              rows={3}
              value={customInputText}
              onChange={(e) => setCustomInputText(e.target.value)}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '10px 12px',
                borderRadius: '10px',
                border: `1px solid ${theme.textSecondaryHex}44`,
                backgroundColor: theme.backgroundHex,
                color: theme.textPrimaryHex,
                fontFamily: 'inherit',
                fontSize: '13px',
                lineHeight: 1.5,
                resize: 'vertical',
              }}
            />
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '10px',
              }}
            >
              <span style={{ fontSize: '12px', color: theme.textSecondaryHex }}>
                Original: {docResult.originalMetrics.wordCount} words ·{' '}
                {docResult.originalMetrics.complexWordCount} multi-syllable terms
              </span>
              <button
                type="button"
                onClick={() => void handleAnalyzeCustomText()}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: theme.accentHex,
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Sparkles size={15} />
                <span>Simplify & Map Custom Text</span>
              </button>
            </div>
          </section>

          {/* Dyslexia Typography & Irlen Tint Controls */}
          <section
            style={{
              backgroundColor: theme.surfaceHex,
              padding: '20px',
              borderRadius: '16px',
              border: `1px solid ${theme.textSecondaryHex}25`,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800 }}>
                <Sliders size={18} color={theme.accentHex} />
                <span>2. Dyslexia Typography, Saccade & Irlen Tint Controls</span>
              </div>
              <button
                type="button"
                onClick={() => setTypoConfig(DEFAULT_DYSLEXIA_CONFIG)}
                style={{
                  fontSize: '12px',
                  background: 'transparent',
                  border: `1px solid ${theme.textSecondaryHex}44`,
                  color: theme.textSecondaryHex,
                  padding: '4px 10px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
              >
                Reset BDA Defaults
              </button>
            </div>

            {/* Paper Tint Swatches */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
              {(Object.keys(DYSLEXIA_THEME_PRESETS) as DyslexiaTintId[]).map((tId) => {
                const preset = DYSLEXIA_THEME_PRESETS[tId];
                const active = typoConfig.tintId === tId;
                return (
                  <button
                    key={tId}
                    type="button"
                    onClick={() => setTypoConfig((c) => ({ ...c, tintId: tId }))}
                    style={{
                      flex: '1 1 120px',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: active ? `2px solid ${theme.accentHex}` : '1px solid #94A3B866',
                      backgroundColor: preset.backgroundHex,
                      color: preset.textPrimaryHex,
                      fontWeight: 700,
                      fontSize: '12px',
                      cursor: 'pointer',
                    }}
                  >
                    {preset.label.split(' ')[0]} {preset.label.split(' ')[1]}
                  </button>
                );
              })}
            </div>

            {/* Toggles: Bionic Saccades, Syllable Dots, Focus Highlight */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '14px', flexWrap: 'wrap' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={typoConfig.bionicAnchorEnabled}
                  onChange={(e) =>
                    setTypoConfig((c) => ({ ...c, bionicAnchorEnabled: e.target.checked }))
                  }
                />
                <span>Bionic Bold Anchors</span>
              </label>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={typoConfig.syllableSpacingEnabled}
                  onChange={(e) =>
                    setTypoConfig((c) => ({ ...c, syllableSpacingEnabled: e.target.checked }))
                  }
                />
                <span>Syllable Dots (mi·to·chon·dri·a)</span>
              </label>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={typoConfig.lineFocusRulerEnabled}
                  onChange={(e) =>
                    setTypoConfig((c) => ({ ...c, lineFocusRulerEnabled: e.target.checked }))
                  }
                />
                <span>Active Clause Focus Band</span>
              </label>
            </div>

            {/* Sliders for Font Size, Letter Spacing, Line Height */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '12px',
                fontSize: '12px',
              }}
            >
              <div>
                <div style={{ fontWeight: 700, marginBottom: '4px' }}>
                  Font Size: {typoConfig.fontSizePx}px
                </div>
                <input
                  type="range"
                  min={16}
                  max={26}
                  step={1}
                  value={typoConfig.fontSizePx}
                  onChange={(e) =>
                    setTypoConfig((c) => ({ ...c, fontSizePx: Number(e.target.value) }))
                  }
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <div style={{ fontWeight: 700, marginBottom: '4px' }}>
                  Letter Space: {(typoConfig.letterSpacingEm * 100).toFixed(0)}%
                </div>
                <input
                  type="range"
                  min={0.04}
                  max={0.18}
                  step={0.02}
                  value={typoConfig.letterSpacingEm}
                  onChange={(e) =>
                    setTypoConfig((c) => ({ ...c, letterSpacingEm: Number(e.target.value) }))
                  }
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <div style={{ fontWeight: 700, marginBottom: '4px' }}>
                  Line Height: {typoConfig.lineHeight.toFixed(1)}x
                </div>
                <input
                  type="range"
                  min={1.5}
                  max={2.2}
                  step={0.1}
                  value={typoConfig.lineHeight}
                  onChange={(e) =>
                    setTypoConfig((c) => ({ ...c, lineHeight: Number(e.target.value) }))
                  }
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          </section>
        </div>

        {/* Row 2: Interactive Visual Concept Map (SVG DAG) */}
        <section
          style={{
            backgroundColor: theme.surfaceHex,
            padding: '22px',
            borderRadius: '18px',
            border: `1px solid ${theme.textSecondaryHex}25`,
            marginBottom: '24px',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              marginBottom: '14px',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: '17px' }}>
                <Network size={20} color={theme.accentHex} />
                <span>Interactive Visual Concept Map — {docResult.title}</span>
              </div>
              <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: theme.textSecondaryHex }}>
                Click any node to isolate its upstream prerequisites, downstream outcomes, and linked reading clause below.
              </p>
            </div>
            {selectedNodeId && (
              <button
                type="button"
                onClick={() => setSelectedNodeId(null)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: `1px solid ${theme.accentHex}`,
                  backgroundColor: theme.backgroundHex,
                  color: theme.textPrimaryHex,
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Show All {conceptGraph.nodes.length} Concept Nodes
              </button>
            )}
          </div>

          <div
            style={{
              width: '100%',
              overflowX: 'auto',
              backgroundColor: theme.backgroundHex,
              borderRadius: '14px',
              border: `1px solid ${theme.textSecondaryHex}22`,
              padding: '8px',
            }}
          >
            <svg
              viewBox={`0 0 ${conceptGraph.canvasWidth} ${conceptGraph.canvasHeight}`}
              style={{ width: '100%', height: 'auto', minWidth: '680px', maxHeight: '360px', display: 'block' }}
              role="img"
              aria-label={`Interactive concept map for ${docResult.title}`}
            >
              <defs>
                <marker
                  id="lexi-arrow"
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 10 5 L 0 9 z" fill={theme.accentHex} />
                </marker>
              </defs>

              {/* Edges */}
              {conceptGraph.edges.map((edge) => {
                const source = conceptGraph.nodes.find((n) => n.id === edge.sourceId);
                const target = conceptGraph.nodes.find((n) => n.id === edge.targetId);
                if (!source || !target) return null;

                const x1 = source.x + source.width;
                const y1 = source.y + source.height / 2;
                const x2 = target.x;
                const y2 = target.y + target.height / 2;
                const midX = (x1 + x2) / 2;
                const midY = (y1 + y2) / 2 - 8;
                const isActive = connectedSubgraph.activeEdgeIds.has(edge.id);

                return (
                  <g key={edge.id} style={{ opacity: isActive ? 1 : 0.22 }}>
                    <path
                      d={`M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`}
                      fill="none"
                      stroke={theme.accentHex}
                      strokeWidth={2.5}
                      markerEnd="url(#lexi-arrow)"
                    />
                    <rect
                      x={midX - 58}
                      y={midY - 11}
                      width={116}
                      height={18}
                      rx={6}
                      fill={theme.surfaceHex}
                      stroke={`${theme.accentHex}55`}
                    />
                    <text
                      x={midX}
                      y={midY + 2}
                      textAnchor="middle"
                      fontSize="10"
                      fontWeight="700"
                      fill={theme.textPrimaryHex}
                    >
                      {edge.relationLabel}
                    </text>
                  </g>
                );
              })}

              {/* Nodes */}
              {conceptGraph.nodes.map((node) => {
                const palette = nodeTypeColors[node.nodeType];
                const isNodeActive = connectedSubgraph.activeNodeIds.has(node.id);
                const isClauseSelected = activeClauseIdx === node.clauseIndex;

                return (
                  <g
                    key={node.id}
                    transform={`translate(${node.x}, ${node.y})`}
                    style={{
                      cursor: 'pointer',
                      opacity: isNodeActive ? 1 : 0.3,
                    }}
                    onClick={() => {
                      setSelectedNodeId((prev) => (prev === node.id ? null : node.id));
                      setActiveClauseIdx(node.clauseIndex);
                    }}
                  >
                    <rect
                      width={node.width}
                      height={node.height}
                      rx={14}
                      fill={palette.fill}
                      stroke={palette.stroke}
                      strokeWidth={isClauseSelected ? 3.5 : 2}
                    />
                    <text
                      x={14}
                      y={22}
                      fontSize="10"
                      fontWeight="800"
                      fill={palette.stroke}
                    >
                      {palette.badge} · CLAUSE {node.clauseIndex}
                    </text>
                    <text
                      x={14}
                      y={45}
                      fontSize="14"
                      fontWeight="800"
                      fill="#0F172A"
                    >
                      {node.label}
                    </text>
                    <text
                      x={14}
                      y={66}
                      fontSize="11.5"
                      fontWeight="600"
                      fill="#334155"
                    >
                      {node.subtitle}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </section>

        {/* Row 3: Split Clause-by-Clause Dyslexia Reader + Audio Explainer & Jargon Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.65fr) minmax(320px, 1fr)',
            gap: '24px',
            alignItems: 'start',
          }}
        >
          {/* Left Column: Clause-by-Clause Bionic & Syllable-Spaced Reader */}
          <section>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '14px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: '18px' }}>
                <FileText size={20} color={theme.accentHex} />
                <span>Clause-by-Clause Dyslexia & Plain-Language Translator</span>
              </div>
              <span style={{ fontSize: '12px', color: theme.textSecondaryHex }}>
                Click any clause card to focus the reading ruler & audio explainer
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {docResult.clauses.map((clause) => {
                const isFocused = clause.clauseIndex === activeClauseIdx;
                const sev = severityStyles[clause.riskSeverity];
                const tokens = formatParagraphForDyslexia(
                  clause.simplifiedClause,
                  typoConfig.syllableSep
                );

                return (
                  <article
                    key={clause.id}
                    onClick={() => {
                      stopAudioPlayback();
                      setActiveClauseIdx(clause.clauseIndex);
                    }}
                    style={{
                      padding: '20px',
                      borderRadius: '16px',
                      backgroundColor:
                        isFocused && typoConfig.lineFocusRulerEnabled
                          ? theme.rulerHighlightHex
                          : theme.surfaceHex,
                      borderLeft: `6px solid ${sev.border}`,
                      borderTop: isFocused
                        ? `2px solid ${theme.accentHex}`
                        : `1px solid ${theme.textSecondaryHex}22`,
                      borderRight: isFocused
                        ? `2px solid ${theme.accentHex}`
                        : `1px solid ${theme.textSecondaryHex}22`,
                      borderBottom: isFocused
                        ? `2px solid ${theme.accentHex}`
                        : `1px solid ${theme.textSecondaryHex}22`,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '10px',
                        marginBottom: '10px',
                        flexWrap: 'wrap',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '12px',
                          fontWeight: 800,
                          padding: '4px 10px',
                          borderRadius: '999px',
                          backgroundColor: sev.badgeBg,
                          color: sev.badgeText,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <ShieldAlert size={14} />
                        {clause.riskBadgeLabel}
                      </span>

                      {clause.preservedEntities.length > 0 && (
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {clause.preservedEntities.map((ent) => (
                            <span
                              key={ent}
                              style={{
                                fontSize: '11px',
                                fontWeight: 800,
                                padding: '2px 8px',
                                borderRadius: '6px',
                                backgroundColor: theme.backgroundHex,
                                border: `1px solid ${theme.accentHex}66`,
                                color: theme.textPrimaryHex,
                              }}
                            >
                              Verified: {ent}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Dyslexia-Formatted Plain-Language Clause */}
                    <p
                      style={{
                        margin: '0 0 14px 0',
                        fontSize: `${typoConfig.fontSizePx}px`,
                        letterSpacing: `${typoConfig.letterSpacingEm}em`,
                        wordSpacing: `${typoConfig.wordSpacingEm}em`,
                        lineHeight: typoConfig.lineHeight,
                        color: isFocused && typoConfig.lineFocusRulerEnabled ? '#0F172A' : theme.textPrimaryHex,
                      }}
                    >
                      {tokens.map((tok, wIdx) => {
                        const isAudioHighlighted = isFocused && isPlayingAudio && activeWordIdx === wIdx;
                        const displayWord =
                          typoConfig.syllableSpacingEnabled && tok.isComplexTerm
                            ? tok.syllableFormatted
                            : tok.coreWord;

                        return (
                          <React.Fragment key={`${clause.id}-w-${wIdx}`}>
                            <span
                              style={{
                                backgroundColor: isAudioHighlighted ? '#FACC15' : 'transparent',
                                color: isAudioHighlighted ? '#0F172A' : 'inherit',
                                padding: isAudioHighlighted ? '2px 4px' : '0',
                                borderRadius: '4px',
                                borderBottom:
                                  tok.isComplexTerm && typoConfig.syllableSpacingEnabled
                                    ? `2px dotted ${theme.accentHex}`
                                    : 'none',
                              }}
                            >
                              {tok.leadingPunct}
                              {typoConfig.bionicAnchorEnabled && !typoConfig.syllableSpacingEnabled ? (
                                <>
                                  <strong style={{ fontWeight: 800 }}>{tok.boldPrefix}</strong>
                                  <span>{tok.regularSuffix}</span>
                                </>
                              ) : (
                                <span style={{ fontWeight: tok.isComplexTerm ? 700 : 500 }}>
                                  {displayWord}
                                </span>
                              )}
                              {tok.trailingPunct}
                            </span>{' '}
                          </React.Fragment>
                        );
                      })}
                    </p>

                    {/* Original Dense Source Comparison Footer */}
                    <details style={{ fontSize: '12.5px', color: theme.textSecondaryHex }}>
                      <summary style={{ cursor: 'pointer', fontWeight: 700 }}>
                        Compare Original Dense Clause ({clause.originalClause.split(/\s+/).length} words)
                      </summary>
                      <p
                        style={{
                          marginTop: '6px',
                          padding: '10px',
                          borderRadius: '8px',
                          backgroundColor: theme.backgroundHex,
                          lineHeight: 1.5,
                        }}
                      >
                        {clause.originalClause}
                      </p>
                    </details>
                  </article>
                );
              })}
            </div>
          </section>

          {/* Right Column: Synchronized Audio Explainer + Phonetic Jargon Cards + Comprehension Check */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Pillar 4: Synchronized Web Speech Audio Explainer */}
            <section
              style={{
                backgroundColor: theme.surfaceHex,
                padding: '20px',
                borderRadius: '16px',
                border: `2px solid ${theme.accentHex}`,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '10px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800 }}>
                  <Volume2 size={18} color={theme.accentHex} />
                  <span>Synchronized Audio Explainer</span>
                </div>
                <span style={{ fontSize: '12px', fontWeight: 700, color: theme.accentHex }}>
                  Clause {activeClause?.clauseIndex} · {audioTimeline.wordsPerMinute} WPM
                </span>
              </div>

              <p style={{ fontSize: '13px', color: theme.textSecondaryHex, margin: '0 0 12px 0' }}>
                Reads the active simplified clause aloud while highlighting each word in real time.
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <button
                  type="button"
                  onClick={toggleAudioPlayback}
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: isPlayingAudio ? '#DC2626' : theme.accentHex,
                    color: '#FFFFFF',
                    fontWeight: 800,
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                >
                  {isPlayingAudio ? <Pause size={16} /> : <Volume2 size={16} />}
                  <span>
                    {isPlayingAudio
                      ? 'Pause Synchronized Read-Aloud'
                      : `Listen to Clause ${activeClause?.clauseIndex}`}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={stopAudioPlayback}
                  title="Reset Audio"
                  style={{
                    padding: '10px',
                    borderRadius: '10px',
                    border: `1px solid ${theme.textSecondaryHex}44`,
                    backgroundColor: theme.backgroundHex,
                    color: theme.textPrimaryHex,
                    cursor: 'pointer',
                  }}
                >
                  <RotateCcw size={16} />
                </button>
              </div>

              {/* Pacing Selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, marginRight: '4px' }}>Speed:</span>
                {([0.75, 0.9, 1.0, 1.15, 1.25] as SpeechRateMultiplier[]).map((rate) => (
                  <button
                    key={rate}
                    type="button"
                    onClick={() => {
                      stopAudioPlayback();
                      setSpeechRate(rate);
                    }}
                    style={{
                      padding: '4px 9px',
                      borderRadius: '6px',
                      border:
                        speechRate === rate
                          ? `2px solid ${theme.accentHex}`
                          : `1px solid ${theme.textSecondaryHex}44`,
                      backgroundColor: speechRate === rate ? theme.backgroundHex : 'transparent',
                      color: theme.textPrimaryHex,
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {rate}x
                  </button>
                ))}
              </div>
            </section>

            {/* Phonetic & Syllable Jargon Glossary Cards */}
            <section
              style={{
                backgroundColor: theme.surfaceHex,
                padding: '20px',
                borderRadius: '16px',
                border: `1px solid ${theme.textSecondaryHex}25`,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontWeight: 800,
                  marginBottom: '12px',
                }}
              >
                <Layers size={18} color={theme.accentHex} />
                <span>Syllable & Analogy Cards ({docResult.glossary.length})</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {docResult.glossary.map((item) => (
                  <div
                    key={item.term}
                    style={{
                      padding: '14px',
                      borderRadius: '12px',
                      backgroundColor: theme.backgroundHex,
                      border: `1px solid ${theme.accentHex}44`,
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'baseline',
                        gap: '8px',
                        flexWrap: 'wrap',
                      }}
                    >
                      <strong style={{ fontSize: '15px', color: theme.accentHex }}>
                        {item.syllables}
                      </strong>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '2px 7px',
                          borderRadius: '6px',
                          backgroundColor: theme.surfaceHex,
                        }}
                      >
                        /{item.phoneticHint}/
                      </span>
                    </div>
                    <p style={{ margin: '6px 0', fontSize: '13px', lineHeight: 1.45 }}>
                      {item.plainDefinition}
                    </p>
                    <div
                      style={{
                        fontSize: '12px',
                        color: theme.textSecondaryHex,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontWeight: 600,
                      }}
                    >
                      <ArrowRight size={13} color={theme.accentHex} />
                      <span>Analogy: {item.everydayAnalogy}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Quick Self-Check Comprehension Verification */}
            <section
              style={{
                backgroundColor: theme.surfaceHex,
                padding: '20px',
                borderRadius: '16px',
                border: `1px solid ${theme.textSecondaryHex}25`,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontWeight: 800,
                  marginBottom: '12px',
                }}
              >
                <HelpCircle size={18} color={theme.accentHex} />
                <span>30-Second Takeaway Check</span>
              </div>

              {docResult.comprehensionChecks.map((q) => {
                const picked = quizAnswers[q.id];
                const isCorrect = picked === q.correctIndex;
                return (
                  <div key={q.id} style={{ marginBottom: '16px' }}>
                    <p style={{ fontSize: '13.5px', fontWeight: 700, margin: '0 0 8px 0' }}>
                      {q.prompt}
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {q.options.map((opt, oIdx) => {
                        const selected = picked === oIdx;
                        return (
                          <button
                            key={`${q.id}-opt-${oIdx}`}
                            type="button"
                            onClick={() => setQuizAnswers((prev) => ({ ...prev, [q.id]: oIdx }))}
                            style={{
                              textAlign: 'left',
                              padding: '8px 10px',
                              borderRadius: '8px',
                              border: selected
                                ? `2px solid ${oIdx === q.correctIndex ? '#16A34A' : '#DC2626'}`
                                : `1px solid ${theme.textSecondaryHex}33`,
                              backgroundColor: theme.backgroundHex,
                              color: theme.textPrimaryHex,
                              fontSize: '12.5px',
                              fontWeight: selected ? 700 : 500,
                              cursor: 'pointer',
                            }}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                    {picked !== undefined && (
                      <div
                        style={{
                          marginTop: '8px',
                          padding: '8px 10px',
                          borderRadius: '8px',
                          backgroundColor: isCorrect ? '#DCFCE7' : '#FEF3C7',
                          color: isCorrect ? '#166534' : '#92400E',
                          fontSize: '12px',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <CheckCircle2 size={15} />
                        <span>{q.explanation}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}
