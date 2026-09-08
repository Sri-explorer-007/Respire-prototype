# RESPIRE
### Urban Heat Reduction & Climate Resilience Platform

A transparent, explainable decision-support platform designed for **Municipal / Ward Planning Officers** (initially focused on Greater Chennai Corporation).

---

## 🎯 Core Workflow
RESPIRE converts complex urban heat and socioeconomic vulnerability data into actionable municipal decisions through a four-stage pipeline:

$$\text{IDENTIFY} \longrightarrow \text{EXPLAIN} \longrightarrow \text{RECOMMEND} \longrightarrow \text{PRIORITIZE}$$

1. **IDENTIFY**: Pinpoints high-risk urban zones using Land Surface Temperature (LST), NDVI vegetation deficit, and defensible social vulnerability indicators.
2. **EXPLAIN**: Provides a fully transparent, rule-based risk score breakdown (0–100) explaining *why* a zone is at risk without black-box ML.
3. **RECOMMEND**: Generates rule-based, justifiable heat mitigation interventions (cool roofs, targeted shade trees, worker cooling stations, urban greening).
4. **PRIORITIZE**: Ranks interventions by cost, expected impact, and feasibility to answer: *"What should the municipality fund first?"*

---

## 🔒 Locked Engineering & Scoring Principles
- **No Black-Box AI / ML Scoring**: Risk scoring and recommendations are transparent and rule-based.
- **Strict Data Provenance**:
  - `SOURCED`: Directly obtained from documented satellite/census sources.
  - `DERIVED`: Calculated via documented methodologies.
  - `INDICATIVE_ESTIMATE`: Planning estimates clearly labeled as such.
  - `ASSUMPTION`: Documented proxies due to data constraints.
  - `UNKNOWN`: Insufficient evidence.
- **Scoring Model Weights**:
  - Heat Exposure = **50%** (Max 50 pts)
  - Vegetation Deficit = **20%** (Max 20 pts)
  - Social Vulnerability = **30%** (Max 30 pts)
  - *Total Priority Score = 100% (0–100)*
- **Demo Reliability**: Fully functioning offline demo fallback cache ensuring evaluation works seamlessly without live Google Earth Engine requirements.

---

## 🏛️ System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     DATA BOUNDARY                       │
│   ┌─────────────────────┐     ┌─────────────────────┐   │
│   │ Processed Satellite │     │  Illustrative Demo  │   │
│   │    Data Cache       │     │     Data Cache      │   │
│   └──────────┬──────────┘     └──────────┬──────────┘   │
└──────────────┼───────────────────────────┼──────────────┘
               ▼                           ▼
┌─────────────────────────────────────────────────────────┐
│                   IZoneDataProvider                     │
│               (Unified Ingestion Port)                  │
└──────────────────────────┬──────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│             CORE DOMAIN ENGINES (Decoupled)             │
│  • IScoringEngine         (50/20/30 Risk Scoring)       │
│  • IRecommendationEngine  (Rule-Based Interventions)    │
│  • IPrioritizationEngine  (Cost / Impact Ranking)       │
└──────────────────────────┬──────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│              BACKEND / API BRIDGE SERVICE               │
│                    (RespireApiClient)                   │
└──────────────────────────┬──────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                RESPIRE DASHBOARD / MAP                  │
│       (Municipal Decision Support User Interface)       │
└─────────────────────────────────────────────────────────┘
```

---

## 📁 Repository Structure
```
respire/
├── index.html                  # HTML entrypoint with RESPIRE metadata
├── package.json                # Project dependencies & scripts
├── tsconfig.json               # TypeScript workspace config
├── tsconfig.app.json           # Application TypeScript compiler config
├── vite.config.ts              # Vite bundler configuration with Tailwind CSS v4
├── README.md                   # System documentation & architectural contracts
├── public/                     # Public static assets
└── src/
    ├── main.tsx                # Application mounting entrypoint
    ├── App.tsx                 # Core layout & foundational municipal view
    ├── index.css               # Tailwind CSS v4 design system
    ├── types/                  # Domain entity & provenance contracts
    │   ├── provenance.ts       # SOURCED, DERIVED, INDICATIVE_ESTIMATE, ASSUMPTION
    │   ├── metrics.ts          # Heat, NDVI, and Social Vulnerability metrics
    │   ├── scoring.ts          # Locked 50/20/30 score breakdown types
    │   ├── zone.ts             # Municipal Zone and Ward definitions
    │   ├── intervention.ts     # Interventions, indicative costs, and impact
    │   ├── recommendation.ts   # Rule-based recommendation structures
    │   └── index.ts            # Consolidating export barrel
    ├── core/                   # Decoupled Domain & Business Logic
    │   ├── scoring/            # IScoringEngine interface & contracts
    │   ├── recommendations/    # IRecommendationEngine interface & contracts
    │   └── prioritization/     # IPrioritizationEngine interface & contracts
    ├── data/                   # Data Boundary & Providers
    │   ├── boundary/           # IZoneDataProvider interface contract
    │   ├── demo/               # Illustrative Chennai demo dataset & provider
    │   ├── processed/          # Pre-processed satellite data provider skeleton
    │   └── index.ts            # Data provider factory & exports
    ├── services/               # API / Service Bridge Layer
    │   ├── apiClient.ts        # Decoupled RespireApiClient
    │   └── index.ts            # Service exports
    └── components/             # User Interface Layer
        ├── common/             # Reusable UI elements (ProvenanceBadge)
        ├── layout/             # Header, Footer, navigation
        ├── map/                # Spatial HeatRiskMap container placeholder
        └── dashboard/          # ZoneSelector, RiskScoreCard, InterventionPanel
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js `v20+` or `v24+`
- npm `v10+` or `v11+`

### Installation
```bash
npm install
```

### Run Development Server
```bash
npm run dev
```

### Build & Typecheck
```bash
npm run build
```

### Linting
```bash
npm run lint
```
