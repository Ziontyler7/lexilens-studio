# LexiLens Studio

**Visual Dyslexia-Friendly STEM, Clinical Discharge & Legal Contract Simplifier**  
Built for the **Build With AI: Basics** Hackathon.

---

## Key Features

- **Interactive Visual Concept Maps (SVG DAG)**: Automatically maps dense passages into 3-layer visual flowcharts (`Prerequisite` → `Core Mechanism` → `Outcome / Risk Trap`) with 1-click upstream and downstream path isolation.
- **WCAG 2.2 SC 1.4.12, BDA & Rello Typography Engine**: Includes 4 clinical low-glare Irlen paper tints (verified at **WCAG AAA `15.4:1` contrast**), 4 empirical font profiles (`Atkinson Hyperlegible`, `Lexend`, `OpenDyslexic`, and `Rello & Baeza-Yates (2013) Monospace`), enforced **WCAG 2.2 SC 1.4.12** spacing thresholds (`0.12em` letter, `0.18em` word, `1.75` line-height, `2.0em` paragraph, `66ch` measure), automatic **BDA `ALL-CAPS` anti-crowding normalizer**, Bionic fixation bold anchors, and syllable dot segmentation (`mi·to·chon·dri·a`, `phos·pho·ry·la·tion`, `in·dem·ni·fi·ca·tion`).
- **100% Numeric & Dosage Preservation Verifier**: Simplifies complex academic, clinical, and legal clauses into plain English while mathematically verifying that every dosage (`75 mg`, `0.4 mg`), deadline (`60 days`), and dollar figure (`$2,400`, `$450`) is preserved intact.
- **Synchronized Web Speech Audio Explainer**: Reads simplified clauses aloud at `0.75x`–`1.25x` speeds with synchronized word-by-word visual highlighting and a 30-second takeaway comprehension check.
- **Dual-Mode AI Inference with Enforced Structured JSON Schemas**: Works out of the box with zero API keys required via the deterministic local engine, or optionally connects to Google Gemini 2.5 Flash (`responseSchema`) and OpenAI GPT-4o-Mini (`json_schema` `strict: true`) with an interactive Schema Inspector and automatic `3,800ms` circuit-breaker fallback. See [`devpost/AI_BEST_PRACTICES.md`](devpost/AI_BEST_PRACTICES.md) for the complete architecture writeup.

---

## Quick Start (Port 5181)

```bash
# Run the 6/6 automated verification gates
npm test

# Typecheck and build production bundle
npm run build

# Launch the interactive studio at http://127.0.0.1:5181
npm run dev
```
