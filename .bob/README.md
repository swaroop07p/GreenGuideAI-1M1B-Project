# GreenGuide AI — IBM Bob Configuration & Context

This `.bob` directory provides complete architectural context, operational rules, and development skills for building and maintaining **GreenGuide AI**.

---

## Project Overview

**GreenGuide AI** is an intelligent, privacy-first personal sustainability and carbon footprint advisor aligned with:
- **SDG 13: Climate Action** (Primary)
- **SDG 12: Responsible Consumption and Production** (Secondary)
- **SDG 11: Sustainable Cities and Communities** (Secondary)

It combines deterministic IPCC/EPA greenhouse gas conversion models with generative AI reasoning powered by **Google Gemini** (`gemini-3.6-flash`).

---

## Technology Stack

- **Frontend**: React 19, Vite 8, TailwindCSS v4 (`@tailwindcss/vite`), Recharts, Lucide React, Canvas Confetti.
- **Backend**: FastAPI, Python 3, Pydantic v2, `google-genai` SDK, Python-dotenv.
- **AI Intelligence**: Google Gemini API with multi-model fallback cascade and input-tailored deterministic fallback.
- **Print / PDF**: Dedicated CSS `@media print` 2-page publication-quality assessment report.
- **Data Persistence**: Zero database requirement. Anonymous, session-based calculation with optional client-side `localStorage` for theme, unit, and personal API key settings.

---

## Directory Structure

```
.bob/
├── README.md                 # Project summary and Bob environment configuration
├── rules/
│   └── greenguide.md         # Core operational rules, security constraints, and design guidelines
└── skills/
    └── greenguide/
        └── SKILL.md          # Technical specifications, calculation factors, AI schemas, and API contracts
```

---

## Core Operational Principles

1. **Deterministic Calculations**: Carbon arithmetic (kg CO2e) is always computed deterministically via IPCC AR6 & EPA factors, never guessed or hallucinated by LLMs.
2. **AI Precedence Hierarchy**: Website settings API key dominates over the backend default `.env` key.
3. **Privacy First**: No authentication, no user tracking, no database.
4. **Balanced 2-Page PDF Export**: High-fidelity print export with zero awkward empty bottom space on Page 1.
