# 🎓 RESPIRE Pipeline & Architecture: Simplified Jury Explainer

> **A Plain-English Guide to How RESPIRE Converts Satellite Images into Real-World Municipal Cooling Budgets for Chennai.**

---

## 🌟 Executive Summary in 30 Seconds

When extreme heat hits Chennai, municipal planners face two critical questions:
1. **Where should we deploy emergency cooling first?**
2. **What exact cooling solutions should we build, and how much will they cost?**

**RESPIRE solves this through a transparent, non-black-box data pipeline.** It takes free, publicly accessible satellite thermal scans, combines them with city population data, calculates an auditable heat risk score, and automatically outputs a prioritized investment queue with real rupee budgets.

```
   🛰️ SATELLITE SCANS             🗺️ 200 WARDS SCORING            💰 ACTIONABLE BUDGETS
┌─────────────────────────┐     ┌────────────────────────┐     ┌────────────────────────┐
│ Landsat 9 + Sentinel-2  │ ──► │  50% Heat + 20% Trees  │ ──► │ ₹14.2L Cool Roofs      │
│ Thermal Radiance & NDVI │     │  + 30% Vulnerability   │     │ ₹4.5L Hydration Hubs   │
└─────────────────────────┘     └────────────────────────┘     └────────────────────────┘
```

---

## 🔄 The 5-Step Pipeline Explained Simply

```mermaid
flowchart LR
    A["🛰️ 1. SCAN\nLandsat & Sentinel"] --> B["🌡️ 2. CALIBRATE\nLST °C & Green Cover"]
    B --> C["👥 3. FUSE\nPopulation & Density"]
    C --> D["⚖️ 4. SCORE\n50/20/30 Formula"]
    D --> E["🏗️ 5. DEPLOY\nRanked Budget Queue"]

    style A fill:#0f172a,stroke:#38bdf8,stroke-width:2px,color:#fff
    style B fill:#0f172a,stroke:#818cf8,stroke-width:2px,color:#fff
    style C fill:#0f172a,stroke:#c084fc,stroke-width:2px,color:#fff
    style D fill:#0f172a,stroke:#34d399,stroke-width:2px,color:#fff
    style E fill:#0f172a,stroke:#fbbf24,stroke-width:2px,color:#fff
```

### Step 1: Satellite Scanning (`thermal_processor.py`)
- **What happens:** Every few days, Earth-observation satellites (NASA/USGS Landsat 9 and ESA Sentinel-2) pass over Chennai.
- **What we extract:** 
  - *Thermal Infrared Band (Band 10)*: Measures surface radiant heat emitted by asphalt, roofs, and ground.
  - *Red & Near-Infrared Bands (B4 & B8)*: Measures healthy green vegetation ($NDVI$).

### Step 2: Radiative Transfer Calibration (`thermal_processor.py`)
- **What happens:** Raw satellite pixels are numbers (Digital Numbers). We use physics formulas (Planck's Radiation Law and split-window emissivity) to convert these into true **Land Surface Temperature in °C ($LST$)**.
- **Result:** An exact temperature map of Chennai showing which neighborhoods are $43.8^\circ\text{C}$ vs $31.8^\circ\text{C}$.

### Step 3: Social & Demographic Fusion (`demographic_fusion.py`)
- **What happens:** Heat alone isn't the whole story. A $43^\circ\text{C}$ temperature in an empty parking lot is less dangerous than in a crowded transit hub with outdoor workers.
- **What we combine:** We merge census demographics, population density (up to $45,000/\text{km}^2$), informal housing settlements, and outdoor worker ratios into a **Social Vulnerability Index ($SVI$)**.

### Step 4: The 50/20/30 Deterministic Scoring (`scoring.py`)
- **What happens:** Each of Chennai's 200 wards receives an overall **Urban Heat Priority Score (0–100)**:
  $$\text{Total Score} = \underbrace{(0.50 \times \text{Heat Severity})}_{\text{Max 50 pts}} + \underbrace{(0.20 \times \text{Tree Canopy Deficit})}_{\text{Max 20 pts}} + \underbrace{(0.30 \times \text{Social Vulnerability})}_{\text{Max 30 pts}}$$
- **Why this matters to juries:** **There is ZERO "black-box AI" guessing.** Every municipal officer, auditor, or citizen can verify the math on a whiteboard.

### Step 5: Decision & Capital Prioritization (`recommendations.py` & `prioritization.py`)
- **What happens:** The system automatically diagnoses the root cause and generates tailored cooling packages:
  - *Extreme Roof Heat?* $\rightarrow$ **High-Albedo Reflective Cool Roof Coating** (₹1,000/tenement, -4.2°C drop).
  - *No Trees?* $\rightarrow$ **Miyawaki Native Pocket Forests** (₹6.0L/1,000 sq.m, -3.8°C drop).
  - *High Outdoor Labor?* $\rightarrow$ **Solar-Powered Hydration & Shaded Rest Shelters** (₹1.5L/unit, -5.5°C drop).
- **Capital Queue:** Ranks wards by $(0.50 \times \text{Risk}) + (0.30 \times \text{Density}) + (0.20 \times \text{Cost Feasibility})$, fitting within municipal budget caps (e.g. ₹50 Lakhs).

---

## 🛡️ Why Juries & City Officials Trust This Architecture

| Feature | Typical "AI" Hackathon Project | RESPIRE Architecture |
| :--- | :--- | :--- |
| **Scoring Mechanism** | Complex neural network with unexplainable weights. | **100% Deterministic 50/20/30 formula.** |
| **Missing/Cloud Data** | Fakes numbers or uses city-wide averages. | **Civic Trust Guard:** Wards with >20% clouds (e.g. Ward 198) are isolated as `UNSCORED` to prevent capital waste. |
| **Output Type** | Pretty heatmap with no actionable next steps. | **Direct Engineering Work Orders:** Units, ₹ budgets, and expected °C cooling impact. |
| **Speed & Scalability** | Heavy GPU dependencies. | **Sub-second FastAPI engine:** Runs on any standard municipal server. |

---

## 🧪 How to Verify in 60 Seconds

You can run the entire pipeline live directly in the terminal:

```bash
python backend/run_pipeline.py
```

You will see:
1. Satellite physics calibration output.
2. Zonal fusion across all 15 zones.
3. Scoring of all 200 GCC Wards.
4. The cloud-safety exclusion of Ward 198.
5. The ranked ₹50 Lakh municipal budget allocation.
