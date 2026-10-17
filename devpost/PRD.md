# LexiLens Studio — Product Requirements Document (PRD)

**Competition**: Build With AI: Basics Hackathon  
**Category**: Accessible AI · Dyslexia & Cognitive Reading Studio  
**Local Runtime**: `http://127.0.0.1:5181` (`strictPort: true`)

---

## 1. Problem Statement

More than **1 in 5 learners and adults (20% of the population)** experience dyslexia, scotopic visual stress, or working-memory overload when confronted with dense walls of text. Whether a student is studying **university STEM textbooks** (e.g., *chemiosmotic ATP synthesis* or *quantum superposition*), a patient is reading **post-surgical cardiac discharge instructions** (`clopidogrel 75 mg`, `0.4 mg sublingual nitroglycerin`), or a renter is reviewing a **residential lease addendum** (`60-day certified notice`, `$450 nonrefundable fee`), conventional AI summarizers often fail them in two dangerous ways:
1. **Unformatted Text Walls**: Generic chatbots replace a dense paragraph with another wall of plain text that still triggers visual crowding and saccadic tracking fatigue.
2. **Silent Number & Dosage Loss**: Unconstrained summarization frequently drops critical numbers, dosages, deadlines, or legal liabilities.

---

## 2. Solution Overview

**LexiLens Studio** transforms dense STEM textbooks, clinical discharge instructions, and legal contracts into a **4-Pillar Visual & Dyslexia-Friendly Comprehension Studio**:

1. **Interactive Visual Concept Map (SVG DAG)**:
   - Converts complex cause-and-effect chains into a clean 3-layer Directed Acyclic Graph (`Prerequisite / Input` → `Core Mechanism` → `Outcome / Risk Trap`) with zero node overlap and 1-click upstream/downstream path isolation.
2. **Dyslexia Typography, Bionic Saccades & Syllable Spacing**:
   - Applies British Dyslexia Association (BDA) spacing standards, 4 clinical Irlen low-glare paper tints (verified up to **WCAG AAA `15.4:1` contrast**), Bionic fixation bold anchors (`boldPrefix` + `regularSuffix`), and automatic syllable dot segmentation (`mi·to·chon·dri·a`, `phos·pho·ry·la·tion`, `in·dem·ni·fi·ca·tion`).
3. **Entity-Verified Clause Translator & Jargon Analogy Cards**:
   - Breaks dense paragraphs into digestible step-by-step clauses with color-coded Risk/Action badges while mathematically verifying that **100% of numbers, dosages, percentages, and dollar figures** remain intact.
4. **Synchronized Web Speech Audio Explainer & 30-Second Takeaway Check**:
   - Reads simplified clauses aloud at adjustable speeds (`0.75x` to `1.25x`) with real-time word-by-word visual highlighting and an interactive comprehension quiz.
5. **Dual-Mode AI Inference Adapter (Instant Zero-Key Local + Optional BYOK)**:
   - Evaluators can test all 4 showcase domains and custom pasted passages **instantly offline with zero API setup**, or optionally toggle live **Google Gemini 2.5 Flash** / **OpenAI GPT-4o-Mini** BYOK mode with automatic circuit-breaker fallback.
