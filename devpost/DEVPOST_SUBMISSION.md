# 📖🔍 Build With AI: Basics — Complete Devpost Submission Package

**Project Title:** LexiLens Studio — Visual Dyslexia-Friendly STEM, Clinical & Contract Simplifier  
**Tagline (<= 60 chars):** Dyslexia-friendly STEM, medical & legal visual simplifier.  
**Competition:** Build With AI: Basics (`$2,500` Prize Pool)  
**Local Studio Port:** `http://127.0.0.1:5181` (`strictPort: true`)

---

## 1. Inspiration

More than **1 in 5 learners and adults (20% of the population)** experience dyslexia, visual crowding, or working-memory overload when confronted with dense walls of technical text. Conventional AI chatbots fail these readers in two ways: they replace a dense paragraph with another unformatted wall of text, and they silently drop critical numbers, medication dosages (`75 mg`, `0.4 mg`), or legal deadlines (`60 days`, `$2,400`). We built **LexiLens Studio** to combine schema-enforced AI simplification with peer-reviewed dyslexia typography and deterministic numeric preservation guardrails.

---

## 2. What It Does

1. **Interactive 3-Layer Visual Concept Maps (SVG DAG)**:
   - Converts dense academic, clinical, and legal passages into a zero-overlap 3-layer Directed Acyclic Graph (`Prerequisite / Input` ➔ `Core Mechanism` ➔ `Outcome / Risk Trap`) with 1-click upstream and downstream path isolation.
2. **WCAG 2.2 SC 1.4.12, British Dyslexia Association (BDA) & Rello (2013) Typography Engine**:
   - Enforces **WCAG 2.2 SC 1.4.12 Text Spacing** minimums (`>= 0.12em` letter spacing, `>= 0.18em` word spacing, `>= 1.75` line height, `>= 2.0em` paragraph spacing, `66ch` max line width).
   - Provides 4 clinical Irlen low-glare paper tints (verified up to **WCAG AAA `15.4:1` contrast**), 4 empirical fonts (`Atkinson Hyperlegible`, `Lexend`, `OpenDyslexic`, and `Rello & Baeza-Yates (2013) Monospace`), an automatic **BDA `ALL-CAPS` anti-crowding normalizer**, Bionic fixation bold prefixes, and syllable dot segmentation (`mi·to·chon·dri·a`, `phos·pho·ry·la·tion`).
3. **100% Numeric, Dosage & Deadline Preservation Verifier**:
   - Mathematically verifies that every number, unit, dosage, and dollar amount in the original clause is preserved intact in the simplified output (`verifyCriticalEntityPreservation`).
4. **Dual-Mode AI Inference with Enforced Structured JSON Schemas**:
   - Works out-of-the-box with zero API keys required via the deterministic local engine, or connects to **Google Gemini 2.5 Flash (`responseSchema`)** and **OpenAI GPT-4o-Mini (`json_schema` `strict: true`)** guarded by a `3,800ms` `AbortController` circuit breaker.

---

## 3. How We Built It

- **5 Pure-Math TypeScript Engines (`src/lib/`)**: `dyslexia-typography-engine.ts`, `clause-simplifier-engine.ts`, `concept-graph-engine.ts`, `audio-explainer-engine.ts`, and `ai-inference-adapter.ts`, verified by **6/6 automated gates (`npm test`)**.
- **AI Engineering Best Practices Documentation**: Full structured-output rationale documented in [`devpost/AI_BEST_PRACTICES.md`](AI_BEST_PRACTICES.md).

---

## 4. Challenges We Ran Into & Accomplishments

- **Preventing Acronym Corruption During `ALL-CAPS` Normalization**: British Dyslexia Association guidelines warn against all-caps words because uniform rectangular word shapes obscure ascenders and descenders. We engineered `normalizeAllCapsProse()` to convert multi-word uppercase shouting into readable sentence case while whitelisting critical STEM/medical acronyms (`ATP`, `DNA`, `RNA`, `MRI`, `ECG`, `HIPAA`, `WCAG`, `STEM`).

---

## 5. "Built With" Tags

`google-gemini`, `openai`, `structured-outputs`, `accessibility`, `dyslexia`, `wcag-aaa`, `typescript`, `react`, `svg-dag`, `web-speech-api`

---

## 6. 90-Second Demo Video Narration Script

- **`0:00 – 0:20` · The Wall-of-Text Problem & 3-Layer Visual Concept Map**:
  - *Visual*: Open `http://127.0.0.1:5181`. Switch across *STEM Cellular Respiration*, *Clinical Cardiology Discharge*, and *Residential Lease Addendum*, clicking nodes in the 3-layer SVG Concept Map DAG to isolate upstream/downstream causal paths.
- **`0:20 – 0:55` · WCAG 2.2 SC 1.4.12 Dyslexia Typography & 100% Dosage Lock**:
  - *Visual*: Toggle Irlen Warm Cream paper (`15.4:1` WCAG AAA), Rello Monospace font, Bionic Saccade Bold, and Syllable Dots. Highlight the green **100% Entity Preservation Lock** proving `75 mg` and `0.4 mg` are preserved while reading grade drops by `> 4` levels.
- **`0:55 – 1:30` · Synchronized Web Speech Audio & Gemini/OpenAI Schema Inspector**:
  - *Visual*: Play the synchronized word-by-word Web Speech audio explainer, then open the **Structured JSON Schema Inspector** to show the enforced Google Gemini `responseSchema` and OpenAI `json_schema` (`strict: true`) contracts.
