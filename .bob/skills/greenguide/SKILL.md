---
name: greenguide
description: Complete technical reference, architectural guidelines, calculation standards, and AI integration specifications for GreenGuide AI.
---

# GreenGuide AI Skill Reference

## 1. Project Overview & Mission

**GreenGuide AI** is an intelligent personal sustainability and carbon footprint advisory application designed to accelerate individual decarbonization in alignment with the United Nations Sustainable Development Goals:
- **SDG 13: Climate Action** (Primary: emissions reduction, 1.5°C Paris Agreement targets)
- **SDG 12: Responsible Consumption and Production** (Dietary shifts, circularity, waste prevention)
- **SDG 11: Sustainable Cities and Communities** (Transit modal shifts, active commuting, renewable energy)

---

## 2. Technical Architecture & Component Map

### Frontend (React 19 + Vite 8 + TailwindCSS v4)
- **State Management**: React Context (`AppContext.jsx`) managing theme (`light`/`dark`), active measurement unit (`kg`/`lb`), API key dominance, and previous session snapshots.
- **Calculator Wizard (`src/components/form/`)**:
  - `WizardContainer.jsx`: Step tracking, progress bar, quick "Fill Sample" demo filler, form state management.
  - `EnergyStep.jsx`: Electricity usage (kWh or bill), cooking fuel (LPG, PNG, electric), residence type, household size, AC usage, renewable energy adoption.
  - `TransportStep.jsx`: Daily round-trip commute distance, commute days/week, primary mode (car, bike, bus, metro, walk), fuel efficiency, long-distance trip frequency.
  - `FoodStep.jsx`: Dietary pattern (vegan, vegetarian, flexitarian, heavy meat), non-veg meals per week, local/seasonal sourcing, food waste level, dairy intake.
  - `WasteStep.jsx`: Trash generation volume, wet/dry waste segregation, recycling frequency, composting adoption, single-use plastic reliance.
- **Results Dashboard (`src/components/results/`)**:
  - `ResultsDashboard.jsx`: Orchestrator containing top action bar, print trigger, share card trigger, and session reset.
  - `FootprintHero.jsx`: Monthly footprint, annual impact, Eco Score, Eco Tier badge, and Paris 1.5°C status.
  - `EcoScoreGauge.jsx`: Animated SVG radial gauge (0-100) with visual milestone markers.
  - `CategoryCharts.jsx`: Interactive Recharts pie and bar breakdowns across Energy, Transport, Food, and Waste.
  - `BenchmarksChart.jsx`: Comparative benchmarks against Global Average (390 kg/mo), National Average (360 kg/mo), and Paris Target (167 kg/mo).
  - `ExplanationCard.jsx`: Plain-language narrative citing the user's primary emissions drivers.
  - `Recommendations.jsx`: 4–6 prioritized decarbonization actions with difficulty badges and monthly kg CO2e savings.
  - `ActionPlan.jsx`: 4-week progressive implementation roadmap with checklist milestones.
  - `WhatIfSimulator.jsx`: Interactive sliders & toggles for real-time formula recalculation.
  - `WhatIfAIChat.jsx`: Live conversational sustainability advisor powered by Google Gemini.
  - `GoalSetter.jsx`: Custom percentage reduction targets (-10%, -20%, -30%, Paris 1.5°C Target).
  - `SessionCompare.jsx`: Local comparison against previous user sessions.
  - `ShareCardModal.jsx`: HTML5 Canvas social impact card generator for public awareness.
  - `PrintReport.jsx`: Dedicated 2-page publication-quality print report layout.
- **Global Components**:
  - `Navbar.jsx`: Brand title, SDG 13 badge, live Gemini API key dominance indicator, transparency drawer link, unit toggle, dark/light toggle.
  - `ApiKeyModal.jsx`: API key configuration, live "Test Key" validation, and website dominance management.
  - `TransparencyPanel.jsx`: Slide-out methodology drawer with live emission factor reference tables.

---

## 3. Backend API Contract & Endpoints (FastAPI)

| Endpoint | Method | Purpose | Header / Payload |
| :--- | :--- | :--- | :--- |
| `/api/health` | `GET` | Health check & readiness | None |
| `/api/emission-factors` | `GET` | Emission factors & citations | None |
| `/api/gemini-status` | `GET` | API key active status & source | Optional: `X-Gemini-API-Key` |
| `/api/validate-key` | `POST` | Lightweight key verification test | `{ "api_key": string }` or `X-Gemini-API-Key` |
| `/api/calculate-footprint` | `POST` | Deterministic baseline + Gemini recs & plan | `FootprintRequest`, optional `X-Gemini-API-Key` |
| `/api/whatif-recalculate` | `POST` | Instant formula-based recalculation | `WhatIfRequest` |
| `/api/compare-benchmarks` | `POST` | Comparative benchmark analysis | `{ "monthly_kg": float }` |
| `/api/generate-share-card` | `POST` | Sanitized card metadata for canvas rendering | `{ "total_monthly_kg": float, ... }` |
| `/api/chat` | `POST` | Interactive Gemini sustainability chat | `ChatRequest`, optional `X-Gemini-API-Key` |

---

## 4. Hybrid Calculation & AI Architecture

### 1. Deterministic Calculation Engine (`emission_factors.py`)
Emissions must strictly be calculated via deterministic mathematical formulas based on IPCC AR6 and EPA lifecycle factors:
- **Energy**:
  - Grid Electricity: `kWh * 0.71 kg CO2e/kWh` (or estimated from bill / household size).
  - Cooking LPG: `12.5 kg CO2e/cylinder` annualized per household resident.
  - AC Usage: Moderate (~30 kg/mo), Heavy (~75 kg/mo).
  - Renewable Solar: Credits domestic electricity emissions by up to 85%.
- **Transport**:
  - Daily commute: `distance_km * days_per_week * 4.33 * mode_factor`.
  - Factors: Petrol/Diesel Car (`0.17 kg/km`), Two-wheeler (`0.06 kg/km`), Bus (`0.05 kg/km`), Metro/Train (`0.03 kg/km`), Walk/Bicycle (`0.0 kg/km`).
  - Long-distance flights: Scaled per frequency (0 to 180 kg/mo).
- **Food**:
  - Diets: Heavy Meat (`210 kg/mo`), Mixed/Flexitarian (`150 kg/mo`), Vegetarian (`100 kg/mo`), Vegan (`75 kg/mo`).
  - Adjustments for non-veg meals per week, local seasonal produce sourcing, and food waste.
- **Waste**:
  - Landfill waste: Baseline generation (`15-40 kg/mo`).
  - Diversion credits for segregation, active recycling, and organic composting.

### 2. Eco Score Formulation (0 to 100)
- Score 100 aligns with the Paris 1.5°C target (~167 kg CO2e/month).
- Global average footprint (~390 kg/mo) yields an Eco Score of ~50-55.
- Tiers:
  - `85 - 100`: **Climate Hero** (Within Paris 1.5°C boundary)
  - `70 - 84`: **Low Carbon Pioneer**
  - `55 - 69`: **On Track**
  - `40 - 54`: **Transitioning**
  - `< 40`: **High Impact Opportunity**

### 3. Generative AI Synthesis (`gemini_service.py`)
- SDK: Official `google-genai` SDK.
- Model Cascade: `gemini-3.6-flash` → `gemini-3.5-flash-lite` → `gemini-3.1-flash-lite` → `gemini-3-flash-preview`.
- Prompt Engineering: Structured JSON instructions requiring exact numerical and categorical schema matching Pydantic `RecommendationItem` and `ActionPlanItem` models.
- Graceful Fallback: If AI is unconfigured or rate limits occur, dynamically synthesizes rule-based recommendations tailored to the user's highest emission categories.

---

## 5. API Key Hierarchy & Precedence Implementation

1. **Website Custom Key Dominance**:
   - Keys saved in the browser (`localStorage['greenguide_gemini_api_key']`) are sent via `X-Gemini-API-Key`.
   - In `gemini_service.py`, `resolve_api_key(custom_key)` evaluates the website key **first**. If present, it dominates and overrides the backend `.env` key.
2. **Backend Default Key Fallback**:
   - If no website key is supplied, the backend `.env` default key is loaded and used.
3. **Resilience & Testing**:
   - If a custom key fails initialization or exceeds quota, the engine falls back to the backend default before falling back to the deterministic engine.
   - The `/api/validate-key` endpoint allows users to test their key connectivity prior to saving.

---

## 6. Print & PDF Export Architecture

The print report is designed as a balanced, professional **2-page publication document**:
- **Page 1 (Assessment & Priority Interventions)**:
  - Official Header with UN SDG 13 badge.
  - 4-Column Executive Summary KPI grid.
  - Side-by-side 2-column layout:
    - Left (7 cols): Lifestyle Domain Breakdown table with distribution progress bars.
    - Right (5 cols): Assessment Interpretation narrative & Global Benchmark callout.
  - Section 4: 2x2 grid of 4 Priority Decarbonization Action cards.
  - Page 1 bottom footer with verification citations and page count.
- **Page 2 (Implementation Roadmap & Scientific Transparency)**:
  - Page 2 Header banner.
  - Section 5: 2x2 grid of 4-Week Action Implementation Plan cards with checklist items.
  - Section 6 & 7: 2-column scientific methodology, IPCC AR6 standards, session assumptions, and long-term Paris guidance.
  - Official SDG verification disclaimer and Page 2 footer.
- **Print CSS Rules (`index.css`)**:
  - Base font size: `10.5pt`, line height `1.4`.
  - Exact print colors: `-webkit-print-color-adjust: exact; print-color-adjust: exact;`.
  - Clean page boundary: `.print-page` with `page-break-after: always; min-height: 278mm;`.

---

## 7. Development & Verification Checklist

When contributing or updating features:
1. **Never commit or inspect `.env` secrets**.
2. **Ensure arithmetic remains deterministic** in `emission_factors.py`.
3. **Test API key precedence**: Custom header key must take precedence over backend default.
4. **Validate print layout**: Verify that Page 1 and Page 2 are balanced with no empty half-pages.
5. **Run production build**: Always verify frontend compilation via `npm run build`.
