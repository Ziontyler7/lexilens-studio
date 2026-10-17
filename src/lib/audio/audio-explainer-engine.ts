/**
 * LexiLens Studio — Synchronized Web Speech Audio Explainer & Word-Timing Engine
 *
 * Pure-math engine providing:
 * 1. Deterministic word-by-word timeline schedule computation (`AudioWordCue`) across
 *    dyslexia-friendly speech rates (`0.75x`, `0.90x`, `1.0x`, `1.15x`, `1.25x`).
 * 2. Pause-aware punctuation cadence weighting (commas add 140ms breathing pause;
 *    periods/colons add 280ms comprehension pause) and syllable-weighted word duration.
 * 3. Active word index lookup from elapsed playback milliseconds (`findActiveWordCueIndex`).
 */

import { segmentWordIntoSyllables } from '../dyslexia/dyslexia-typography-engine.ts';

export type SpeechRateMultiplier = 0.75 | 0.9 | 1.0 | 1.15 | 1.25;

export interface AudioWordCue {
  wordIndex: number;
  word: string;
  syllableCount: number;
  startTimeMs: number;
  endTimeMs: number;
  durationMs: number;
}

export interface AudioExplainerTimeline {
  text: string;
  rate: SpeechRateMultiplier;
  totalDurationMs: number;
  wordsPerMinute: number;
  cues: AudioWordCue[];
  monotonicVerified: boolean;
}

/**
 * Builds a deterministic, strictly monotonic word-by-word audio highlight schedule
 * for both Web Speech API `onboundary` synchronization and fallback timer drives.
 */
export function buildAudioExplainerTimeline(
  text: string,
  rate: SpeechRateMultiplier = 1.0
): AudioExplainerTimeline {
  const safeRate = Math.max(0.5, Math.min(2.0, rate)) as SpeechRateMultiplier;
  const rawWords = text
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0);

  if (rawWords.length === 0) {
    return {
      text: '',
      rate: safeRate,
      totalDurationMs: 0,
      wordsPerMinute: 0,
      cues: [],
      monotonicVerified: true,
    };
  }

  let cursorMs = 0;
  const cues: AudioWordCue[] = [];

  for (let i = 0; i < rawWords.length; i++) {
    const word = rawWords[i];
    const cleanAlpha = word.replace(/[^a-zA-Z0-9]/g, '');
    const syllableCount = Math.max(1, segmentWordIntoSyllables(cleanAlpha || word).length);

    // Base duration: 190ms base + 85ms per syllable, scaled inversely by speech rate
    let baseDuration = (190 + syllableCount * 85) / safeRate;

    // Add natural comprehension pauses on punctuation boundaries
    if (/[,;:]$/.test(word)) {
      baseDuration += 140 / safeRate;
    } else if (/[.!?]$/.test(word)) {
      baseDuration += 280 / safeRate;
    }

    const durationMs = Math.max(90, Math.round(baseDuration));
    const startTimeMs = cursorMs;
    const endTimeMs = startTimeMs + durationMs;

    cues.push({
      wordIndex: i,
      word,
      syllableCount,
      startTimeMs,
      endTimeMs,
      durationMs,
    });

    cursorMs = endTimeMs;
  }

  let monotonicVerified = true;
  for (let i = 1; i < cues.length; i++) {
    if (cues[i].startTimeMs < cues[i - 1].endTimeMs || cues[i].endTimeMs <= cues[i].startTimeMs) {
      monotonicVerified = false;
      break;
    }
  }

  const totalMinutes = cursorMs / 60000;
  const wordsPerMinute = totalMinutes > 0 ? Math.round(rawWords.length / totalMinutes) : 150;

  return {
    text: rawWords.join(' '),
    rate: safeRate,
    totalDurationMs: cursorMs,
    wordsPerMinute,
    cues,
    monotonicVerified,
  };
}

/**
 * Given elapsed milliseconds during audio explainer playback, returns the active `wordIndex`.
 */
export function findActiveWordCueIndex(
  timeline: AudioExplainerTimeline,
  elapsedMs: number
): number {
  if (timeline.cues.length === 0) return -1;
  if (elapsedMs <= 0) return 0;
  if (elapsedMs >= timeline.totalDurationMs) return timeline.cues.length - 1;

  for (const cue of timeline.cues) {
    if (elapsedMs >= cue.startTimeMs && elapsedMs < cue.endTimeMs) {
      return cue.wordIndex;
    }
  }

  return timeline.cues.length - 1;
}
