# AI Engineering Best Practices & Accessibility Research Rationale

**Hackathon:** Build With AI: Basics (`$2,500` Prize Pool)  
**Project:** LexiLens Studio (`http://127.0.0.1:5181`)

---

## 1. Schema-Enforced Structured Output (`@google/genai` `responseSchema` & OpenAI `json_schema`)

One of the most common failure modes in beginner AI applications is relying on free-form prompt instructions (`"Please return valid JSON"`) without enforcing a grammar-level schema at the model generation layer. In **LexiLens Studio** ([`src/lib/ai/ai-inference-adapter.ts`](../src/lib/ai/ai-inference-adapter.ts)):
- **Google Gemini 2.5 Flash (`gemini-2.5-flash`)**: Requests enforce `generationConfig.responseMimeType = "application/json"` paired with `generationConfig.responseSchema = LEXILENS_GEMINI_RESPONSE_SCHEMA` (`type: "OBJECT"`, `properties: { title, clauses }`, `required: ["title", "clauses"]`).
- **OpenAI GPT-4o-Mini (`gpt-4o-mini`)**: Requests enforce `response_format = LEXILENS_OPENAI_JSON_SCHEMA` (`type: "json_schema"`, `strict: true`, `additionalProperties: false`).
- **Post-Generation Hydration & Guardrail Validation (`validateAndHydrateLLMResponse`)**: Even when a model returns valid JSON, LexiLens runs a deterministic post-processor that checks every clause against `verifyCriticalEntityPreservation()` before rendering it to the user.

---

## 2. Deterministic Numeric, Dosage & Deadline Guardrails (`verifyCriticalEntityPreservation`)

When simplifying medical discharge instructions (`75 mg clopidogrel`, `0.4 mg sublingual nitroglycerin`) or legal residential leases (`$1,850 rent`, `5th day`, `$250 fee`), an LLM hallucinating or dropping a number is unacceptable.
- **How It Works**: `verifyCriticalEntityPreservation()` extracts all numeric, dosage, currency, and percentage tokens from the source clause and mathematically verifies `100%` presence in the simplified output.

---

## 3. Zero-Setup Judge Mode + `4,500ms` `AbortController` Circuit Breaker

To ensure judges and users can test LexiLens Studio immediately without hunting for API keys—while still supporting live BYOK inference:
- **Default Instant Mode (`local-deterministic`)**: Runs 100% locally in `< 5ms` with zero network dependencies.
- **BYOK Circuit Breaker (`4,500ms` timeout)**: Any network error, HTTP `4xx/5xx`, or timeout automatically triggers graceful fallback to the deterministic engine so the UI never crashes or hangs.

---

## 4. Empirical Dyslexia Typography Standards (`WCAG 2.2 SC 1.4.12`, `BDA` & `Rello / Baeza-Yates`)

LexiLens Studio's typography engine ([`src/lib/dyslexia/dyslexia-typography-engine.ts`](../src/lib/dyslexia/dyslexia-typography-engine.ts)) implements three peer-reviewed accessibility standards:
1. **W3C WCAG 2.2 Success Criterion 1.4.12 (Text Spacing)**:
   - Default `letterSpacingEm: 0.12` (`>= 0.12em` tracking minimum)
   - Default `wordSpacingEm: 0.18` (`>= 0.16em` word spacing minimum)
   - Default `lineHeight: 1.8` (`>= 1.5x` line spacing minimum)
   - Default `paragraphSpacingEm: 2.0` (`>= 2.0x` paragraph spacing minimum)
2. **Luz Rello & Ricardo Baeza-Yates Eye-Tracking Findings (ACM ASSETS)**:
   - Provides a dedicated **Rello & Baeza Monospace** (`rello-monospace`) option alongside clean sans-serif fonts (`Lexend`, `Atkinson Hyperlegible`, `OpenDyslexic`) at `>= 18px` (`19px` default) with zero italics.
3. **British Dyslexia Association (BDA) Style Guide**:
   - Enforces left-aligned ragged-right layout within a `66ch` maximum column measure (`maxLineMeasureCh: 66`), low-glare Irlen paper tints (`WCAG AAA 15.4:1` contrast), and `normalizeTextForBdaAntiCrowding()` to convert shouting `ALL-CAPS` legal blocks into readable sentence casing while preserving clinical/STEM acronyms (`ATP`, `NADH`, `DNA`, `RNA`, `MRI`, `ECG`).
