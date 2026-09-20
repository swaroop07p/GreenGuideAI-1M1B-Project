# GreenGuide AI — Comprehensive Project Rules & Standards

## 1. Project Vision & Identity
1. **Application Name**: GreenGuide AI — Personal Sustainability & Carbon Footprint Advisor.
2. **United Nations SDG Alignment**:
   - **SDG 13: Climate Action** (Primary mission: personal emissions transparency and Paris 1.5°C boundary alignment).
   - **SDG 12: Responsible Consumption and Production** (Dietary shifts, food waste reduction, circular materials).
   - **SDG 11: Sustainable Cities and Communities** (Active commuting, transit electrification, renewable energy).
3. **Core Philosophy**: Empower users with realistic, personalized, encouraging decarbonization pathways without shaming, judging, or overwhelming them.

---

## 2. Technology Stack & Dependencies
4. **Frontend Architecture**:
   - Framework: React 19 + Vite 8.
   - Styling: Vanilla CSS + TailwindCSS v4 (`@tailwindcss/vite`).
   - Visualization: Recharts (interactive charts) + Lucide React (icons) + Canvas Confetti (celebrations).
5. **Backend Architecture**:
   - Framework: FastAPI + Python 3.
   - Validation & Serialization: Pydantic v2.
   - AI SDK: Official `google-genai` SDK.
   - Rate Limiting: In-memory sliding-window limiter.
6. **Zero Database Architecture**:
   - The application does not use SQL/NoSQL databases, user logins, or server-side user tracking.
   - All calculations are processed on-the-fly and returned in the HTTP response.

---

## 3. Hybrid Calculation & AI Intelligence Rules
7. **Deterministic Calculation Standard**:
   - Emission numbers (kg CO2e) MUST always be computed mathematically using the reference tables in `emission_factors.py`.
   - Never rely on the LLM to perform raw arithmetic or baseline factor lookups.
   - Standards strictly align with IPCC Sixth Assessment (AR6) and US EPA Greenhouse Gas Equivalencies.
8. **Role of Generative AI (Gemini)**:
   - Use Gemini (`gemini-3.6-flash`) strictly for:
     - Plain-language synthesis and personalized interpretation.
     - 4–6 tailored high-impact decarbonization recommendations ranked by leverage.
     - 4-week progressive action roadmaps with customized checklists.
     - Interactive What-If sustainability assistant chat (`POST /api/chat`).
9. **Multi-Model Fallback Cascade**:
   - Implement candidate model cascading: `gemini-3.6-flash` → `gemini-3.5-flash-lite` → `gemini-3.1-flash-lite` → `gemini-3-flash-preview`.
   - If all Gemini models fail (or if no API key is provided), seamlessly fall back to the dynamic rule-based deterministic engine without breaking the user experience.

---

## 4. API Key Hierarchy & Precedence Rules
10. **Website Settings API Key Dominance**:
    - If a user enters an API key in the website settings modal (`ApiKeyModal.jsx`), this key **strictly dominates** and takes 1st priority for all calculations and AI chats via the `X-Gemini-API-Key` header.
    - If no website key is set, the system seamlessly falls back to the default backend `.env` key.
    - If neither key is available, the app functions smoothly via the deterministic IPCC/EPA fallback engine.
11. **Security & Secrets Governance**:
    - Never hardcode API keys, tokens, or credentials in source code.
    - Never commit `.env` or secret configuration files to version control.
    - Never inspect, log, or expose raw `.env` file contents in agent responses or terminal outputs.
    - Personal API keys in the browser must remain strictly in `localStorage['greenguide_gemini_api_key']` and never be saved to the server.

---

## 5. PDF Generation & Print Layout Rules
12. **Balanced 2-Page Publication Standard**:
    - Printable reports must use dedicated `@media print` CSS rendering.
    - Avoid awkward empty half-pages at the bottom of Page 1.
    - **Page 1 (Assessment & Interventions)**: Header banner, 4-metric KPI summary grid, side-by-side Lifestyle Domain Breakdown table & Assessment Interpretation narrative, and 4 Priority Decarbonization Action cards in a 2x2 grid, finished by the Page 1 footer.
    - **Page 2 (Roadmap & Methodology)**: Header banner, 4-Week Action Implementation Plan (2x2 grid), 2-column IPCC AR6 / EPA methodology & assumptions, long-term Paris 1.5°C trajectory guidance, and official SDG verification disclaimer.
13. **Print CSS Specifications**:
    - Use exact A4 portrait dimensions with balanced margins (`@page { size: A4 portrait; margin: 8mm; }`).
    - Enforce exact print colors: `-webkit-print-color-adjust: exact; print-color-adjust: exact;`.
    - Apply `page-break-after: always;` and flex distribution on `.print-page`.
    - Prevent card splitting with `break-inside: avoid;` on `.print-card`.

---

## 6. UX, Design Aesthetics & Accessibility
14. **Visual Aesthetics**:
    - Curated emerald and teal color palette with soft glassmorphism, subtle micro-interactions, and clear card hierarchies.
    - Support both Light mode (default) and Dark mode with smooth transitions.
    - Provide a prominent Metric (kg CO2e) and Imperial (lb CO2e) unit toggle.
15. **User Feedback & Responsiveness**:
    - All interactive elements must provide tactile feedback (hover states, focus rings, loading spinners).
    - Mobile drawer navigation must be compact and space-efficient.
    - Calculator wizard must provide live progress indicators, field defaults, and a quick "Fill Sample" demo option.
16. **Scientific Transparency**:
    - Every carbon estimate must be labeled as an estimate.
    - The slide-out Methodology Panel (`TransparencyPanel.jsx`) must remain easily accessible to show all factors, formulas, and citations.
