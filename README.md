# 🛰️ TRACE — Temporal Radar Assessment & Cross-mission Evidence

<div align="center">

[![NASA Space Apps](https://img.shields.io/badge/NASA%20Space%20Apps-Challenge%202026-0B3D91?style=for-the-badge&logo=nasa&logoColor=white)](https://www.spaceappschallenge.org/)
[![Next.js 15](https://img.shields.io/badge/Next.js-15.1.7-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![PostGIS](https://img.shields.io/badge/PostGIS-Spatial%20DB-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://postgis.net/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![Turbo Monorepo](https://img.shields.io/badge/Turborepo-Monorepo-EF4444?style=for-the-badge&logo=turborepo&logoColor=white)](https://turbo.build/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

**Cloud-piercing radar anomaly detection, multi-mission satellite evidence fusion, and offline-first ground truth verification powered by NASA Earthdata & NISAR science.**

[Live Web Client](https://traceclient-production.up.railway.app) • [Interactive API Docs](https://traceserver-production.up.railway.app/docs) • [Architecture](#-system-architecture) • [Quick Start](#-quick-start-guide) • [Scientific Framework](#-scientific-integrity--the-self-audit-engine)

</div>

---

## 📖 Executive Summary

Earth observation frequently faces the **"cloud cover blind spot"**. Conventional optical satellites (MODIS, Landsat, Sentinel-2) are blinded by monsoon storm clouds, dense hurricane cloud decks, wildfire smoke plumes, and nighttime darkness — precisely when catastrophic environmental events happen.

**Synthetic Aperture Radar (SAR)**, led by the **NASA-ISRO SAR (NISAR)** mission, breaks through this barrier using active L-band radar signals that penetrate clouds, weather, and dense forest canopies 24/7.

However, raw SAR data is mathematically complex, difficult to interpret, and prone to false positives caused by moisture spikes or atmospheric disturbances. **TRACE (Temporal Radar Assessment & Cross-mission Evidence)** bridges the gap between orbit and the ground:

1. **Automated Radar Anomaly Detection**: Ingests NISAR L2/GCOV/GSLC products and computes backscatter decibel ($\Delta\text{dB}$) drops and surface water inundation polygons.
2. **Multi-Mission Cross-Correlation**: Concurrently queries NASA GPM (IMERG precipitation), NASA FIRMS (thermal fire anomalies), and NASA MODIS (vegetation context) to establish independent corroboration.
3. **Deterministic 7-Point Self-Audit Engine**: Instead of blind AI confidence, TRACE challenges every finding with 7 rigorous scientific quality checks to prevent false alarms.
4. **Autonomous Sentinel Agent Ensemble**: An orchestrator of 5 specialized agents (`DataAgent` ➔ `DetectionAgent` ➔ `EvidenceAgent` ➔ `ChallengeAgent` ➔ `InterpretationAgent`).
5. **Field Companion with Haptic/Audio Sensory Translation**: Field researchers can literally **"FEEL" the radar** — converting decibel deltas into physical vibrations and audio frequencies on mobile devices, with offline sync capabilities for remote zones.

---

## 🌟 The 5 Mission Modules

TRACE is structured into five intuitive, high-impact operational modules accessible via desktop mission control or mobile field companions:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             TRACE FIELD SYSTEM                              │
├─────────────┬─────────────┬─────────────┬───────────────────┬───────────────┤
│   🎯 SCAN   │   🌐 PULSE  │   ⚓ CHAR   │      📳 FEEL      │   🛡️ VERIFY   │
│ Detect &    │ Planetary   │ River Island│  Sensory Haptic & │ Offline Ground│
│ Inspect SAR │ Real-time   │ Dynamics &  │  Web Audio Radar  │ Truth Photo & │
│ Anomalies   │ Cases Map   │ Vulnerability│  Translation     │ GPS Validation│
└─────────────┴─────────────┴─────────────┴───────────────────┴───────────────┘
```

### 1. 🎯 SCAN — Temporal Radar Inspection
- **Dual-Polarization Controls**: Switch between **VV** (vertical transmit/receive for open water & smooth surfaces) and **VH** (cross-polarization for volume scattering and vegetation canopy).
- **Time-Series Graphs**: Interactive decibel change history across baseline, event, and recovery periods.
- **Optical vs. SAR Swipe Tool**: Interactive before/after split slider comparing optical imagery with cloud-penetrating L-band radar backscatter.

### 2. 🌐 PULSE — Planetary Activity Monitor
- **Interactive Global Basemap**: Leaflet-driven map visualizing all ongoing cases with spatial bounding polygons, centroid markers, and multi-mission status badges.
- **Real-Time Anomaly Filters**: Instantly categorize events by type (*flood, surface water change, wildfire, coastal shift*) or self-audit verdict (*SUPPORTED, INCONCLUSIVE, REJECTED*).

### 3. ⚓ CHAR — Island & Coastal Guardian
- **River Island ("Char") & Coastal Ecosystem Tracking**: Tailored for high-vulnerability river deltas (such as the Jamuna-Padma river systems and Sundarbans mangrove regions).
- **Sediment & Erosion Monitoring**: Evaluates shifting shorelines and deposition without making speculative claims.
- **Scientifically Safe Terminology**: System enforces neutral phrasing (*"Observed SAR Change"* instead of unverified catastrophic erosion).

### 4. 📳 FEEL — Sensory Radar Experience
- **Tactile Haptic Pulsing**: Transforms satellite backscatter drops into physical pulse rhythms using the HTML5 Vibration API (`navigator.vibrate`).
- **Web Audio Sound Synthesis**: Uses real-time frequency oscillation (80 Hz – 600 Hz sub-bass to midrange) so field workers can hear signal amplitude changes in direct sunlight.
- **Accessible Field Inspection**: Allows visually impaired researchers or gloved workers to comprehend environmental change instantly.

### 5. 🛡️ VERIFY — Ground-Truth & Community Sentinel
- **One-Tap Field Observations**: Field rangers capture geotagged photos, situational notes, and timestamped coordinates.
- **Offline-First Resilience**: If internet connection drops in deep wetlands or forests, reports queue locally in an IndexedDB/localStorage queue and auto-sync upon reconnection.
- **Dynamic Threshold Alerts**: Configure custom decibel thresholds ($\Delta \text{dB} \le -2.0$) with safe automated notifications (*ARMED ➔ TRIGGERED ➔ ACKNOWLEDGED*).

---

## 🏛️ System Architecture

TRACE is engineered as a clean, decoupled monorepo managed with **Turborepo** and **pnpm**:

```mermaid
graph TD
    subgraph Data_Sources ["🛰️ NASA Earthdata & Satellites"]
        NISAR["NASA-ISRO SAR (NISAR)<br/>L2 GCOV / GSLC Radar"]
        GPM["NASA GPM IMERG<br/>Precipitation Rates"]
        FIRMS["NASA FIRMS<br/>VIIRS / MODIS Fire Alerts"]
        MODIS["NASA MODIS<br/>Surface Reflectance & NDVI"]
    end

    subgraph Server ["⚡ TRACE Backend (FastAPI + Python 3.11)"]
        CMR_Client["NASA CMR & ASF Client<br/>Query Engine"]
        Evidence_Engine["Cross-Mission<br/>Evidence Engine"]
        Self_Audit["Deterministic 7-Point<br/>Self-Audit Engine"]
        Sentinel_Agents["5 Autonomous<br/>Sentinel Agents"]
        Scenario_Sim["Scenario Simulator<br/>Water Level Modeler"]
        DB[(PostgreSQL + PostGIS<br/>Spatial Storage)]
    end

    subgraph Client ["💻 TRACE Frontend (Next.js 15 + React 19)"]
        ScanView["🎯 SCAN<br/>Radar Polarization & Decibels"]
        PulseView["🌐 PULSE<br/>Planetary Interactive Map"]
        CharView["⚓ CHAR<br/>Guardian Ecosystem Lens"]
        FeelView["📳 FEEL<br/>Haptics & Audio Synthesizer"]
        VerifyView["🛡️ VERIFY<br/>Offline Camera & GPS Reports"]
    end

    NISAR --> CMR_Client
    GPM --> CMR_Client
    FIRMS --> CMR_Client
    MODIS --> CMR_Client

    CMR_Client --> Evidence_Engine
    Evidence_Engine --> Self_Audit
    Self_Audit --> Sentinel_Agents
    Sentinel_Agents --> DB
    Scenario_Sim --> DB

    DB <--> Client
```

---

## 🔬 Scientific Integrity & The Self-Audit Engine

A critical flaw in standard AI Earth observation platforms is **false confirmation bias** — platforms assume that any satellite change metric proves an environmental disaster.

TRACE eliminates this risk through a **Deterministic 7-Check Self-Audit Engine** that does not blindly trust radar anomalies:

| # | Check Type | What It Evaluates | Decision Logic / Threshold |
|---|---|---|---|
| **1** | **Data Quality Check** | Validates primary SAR payload completeness and magnitude. | $\Delta\text{dB} \le -1.5\text{ dB}$ or affected area $> 0$ km². Weak drops ($-1.5 < \text{dB} \le -0.5$) trigger `WARNING`. |
| **2** | **Phase Coherence Check** | Evaluates InSAR interferometric phase correlation ($\gamma$). | $\gamma < 0.25$ indicates phase decorrelation (flooding / physical displacement). $\gamma > 0.65$ triggers `WARNING` (stable surface). |
| **3** | **Spatiotemporal Sanity** | Evaluates temporal duration and spatial polygon sanity. | Flags anomalous single-pixel flashes or unrealistic multi-week static flood claims. |
| **4** | **Atmospheric Artifact Risk** | Cross-checks with atmospheric & ionospheric disturbance indexes. | Disqualifies radar artifacts caused by tropospheric moisture delays. |
| **5** | **Multi-Sensor Coverage** | Checks corroboration across independent NASA platforms. | Cross-correlates precipitation (GPM) or thermal alerts (FIRMS) against the radar event window. |
| **6** | **Ground Truth Verification** | Compares satellite observations with community ranger field reports. | Weighs human-submitted field photos and coordinates against satellite detections. |
| **7** | **Confidence Synthesis** | Produces a non-blind, defensible final determination. | Final State: **`SUPPORTED`**, **`INCONCLUSIVE`**, or **`REJECTED`**. |

> [!IMPORTANT]
> **Strict Non-Causal Terminology Rule:**  
> The backend explicitly forbids speculative causal language. Generated briefs will **never** claim an event was *"definitively caused by"* without multi-sensor cross-corroboration. Statements adhere strictly to defensible phrasing such as *"SAR backscatter drop coincides temporally with GPM precipitation anomaly."*

---

## 🤖 The 5 Autonomous Sentinel Agents

TRACE features a cooperative multi-agent execution pipeline that automates the verification workflow:

1. 📡 **`DataAgent`**: Queries NASA CMR (Common Metadata Repository) and ASF DAAC to discover matching satellite granules for target bounding boxes and acquisition windows.
2. 🔍 **`DetectionAgent`**: Processes raw SAR backscatter, identifies drop thresholds, and isolates the polygon boundaries of affected areas.
3. 🛰️ **`EvidenceAgent`**: Performs spatial and temporal fusion with NASA GPM rainfall baselines, FIRMS thermal signatures, and MODIS surface data.
4. ⚖️ **`ChallengeAgent`**: Acts as a scientific adversary. Runs the 7-Point Self-Audit, seeking counter-evidence or atmospheric interference before endorsing any conclusion.
5. 📝 **`InterpretationAgent`**: Synthesizes the final defensible brief, computing uncertainty metrics and actionable recommendations for decision-makers.

---

## 🛠️ Technology Stack

| Layer | Technologies Used | Purpose |
|---|---|---|
| **Frontend Framework** | **Next.js 15.1.7** (App Router), **React 19**, **TypeScript 5.7** | Responsive, high-performance UI with server components and client-side state. |
| **Styling & Design** | **Tailwind CSS**, Lucide Icons, Glassmorphism design tokens | Sci-fi mission control aesthetic with dark-mode palette (#060911). |
| **Geospatial & Visuals** | **Leaflet 1.9**, Leaflet CSS, Chart.js 4.5 | Planetary event mapping, raster overlays, and temporal radar graphs. |
| **Mobile & Sensory** | HTML5 Vibration API, Web Audio API, Geolocation API | Haptic vibration patterns, audio pitch feedback, GPS acquisition. |
| **Offline Resilience** | IndexedDB / LocalStorage queue with auto-retry | Guaranteed field report submission even with zero network coverage. |
| **Backend Framework** | **FastAPI 0.115+**, **Python 3.11+**, Uvicorn (ASGI) | Async, high-throughput REST API with automated OpenAPI / Swagger docs. |
| **Database & GIS** | **PostgreSQL** + **PostGIS**, SQLAlchemy 2.0, GeoAlchemy2, Shapely | Native geospatial polygon indexing, distance calculations, spatial joins. |
| **Earth Data Integration** | NASA CMR Search API, ASF API, NASA FIRMS, NASA GPM | Multi-mission Earth observation discovery and granule indexing. |
| **Build & Monorepo** | **Turborepo 2.4**, **pnpm 12.5** | Fast monorepo task execution, shared types, and cached builds. |

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: `v18.0.0` or higher (v20+ recommended)
- **pnpm**: `v8.0.0` or higher (`npm install -g pnpm`)
- **Python**: `v3.11` or higher
- **PostgreSQL / PostGIS** (or use local SQLite fallback for rapid prototyping)

---

### Step 1: Clone the Repository

```bash
git clone https://github.com/sanjidtalukder/TRACE-Platform.git
cd TRACE-Platform
```

---

### Step 2: Environment Configuration

Create environment configuration files for both frontend and backend from the provided examples:

```bash
# In the repository root:
cp .env.example .env
cp client/.env.example client/.env.local
cp server/.env.example server/.env
```

**Key Environment Variables:**

| Variable | Location | Description | Default |
|---|---|---|---|
| `NEXT_PUBLIC_API_URL` | `client/.env.local` | Base URL of the running FastAPI server | `http://localhost:8000` |
| `DATABASE_URL` | `server/.env` | PostgreSQL + PostGIS connection string | `postgresql://postgres:postgres@localhost:5432/trace_db` |
| `CMR_BASE_URL` | `server/.env` | NASA Common Metadata Repository API | `https://cmr.earthdata.nasa.gov` |
| `EARTHDATA_TOKEN` | `server/.env` | Optional NASA Earthdata Bearer Token | `(anonymous access supported)` |

> [!TIP]
> **No NASA credentials yet?**  
> TRACE includes an anonymous discovery fallback and seeded real-world case studies (`CASE-017`, `TRACE-2026-001`), allowing full local testing immediately without an Earthdata token.

---

### Step 3: Run the Backend Server (FastAPI)

Open a terminal for the backend:

```bash
# 1. Create and activate a Python virtual environment
python -m venv .venv

# Windows (PowerShell):
.venv\Scripts\Activate.ps1
# Linux / macOS:
source .venv/bin/activate

# 2. Install Python dependencies
pip install -r server/requirements.txt

# 3. Start the FastAPI development server
uvicorn server.app.main:app --reload --port 8000
```

✅ **Backend Verification:**
- API Root: [`http://localhost:8000/`](http://localhost:8000/)
- Interactive Swagger UI: [`http://localhost:8000/docs`](http://localhost:8000/docs)
- Service Health Probe: [`http://localhost:8000/health`](http://localhost:8000/health)
- Database Probe: [`http://localhost:8000/health/db`](http://localhost:8000/health/db)

---

### Step 4: Run the Frontend Client (Next.js)

Open a second terminal for the frontend:

```bash
# 1. Install all monorepo dependencies
pnpm install

# 2. Start the Next.js development server
pnpm --filter client dev
```

✅ **Frontend Verification:**
- Open your browser to [`http://localhost:3000`](http://localhost:3000)
- The header should show green indicators for **GPS ACTIVE** and **API CONNECTED**.

---

### Running Everything with Turborepo (One Command)

If both environments are configured, run the entire stack concurrently from the root directory:

```bash
pnpm dev
```

---

## 📡 API Reference Overview

TRACE features a clean, RESTful API structure documented with interactive OpenAPI:

### Case Investigations & Evaluation
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/cases` | List all investigation cases (paginated). |
| `GET` | `/api/cases/{case_id}` | Retrieve full stored case state, SAR measurements, and geometry. |
| `GET` | `/api/cases/{case_id}/timeline` | Retrieve chronological observations (BEFORE ➔ CHANGE ➔ AFTER). |
| `POST` | `/api/cases/{case_id}/evaluate-evidence` | Run Cross-Mission Evidence Engine (GPM, FIRMS, MODIS correlation). |
| `POST` | `/api/cases/{case_id}/self-audit` | Run 7-Point Scientific Self-Audit Engine. |
| `POST` | `/api/cases/{case_id}/simulate-scenario` | Execute elevation sea-level / water inundation modeling (+0.5m, +1.0m, +2.0m). |
| `POST` | `/api/cases/{case_id}/run-sentinel-agents` | Trigger the 5-Agent Autonomous Sentinel workflow. |
| `GET` | `/api/cases/{case_id}/char-history` | Fetch historical shoreline and river-island change records. |

### NASA Earthdata Live Discovery
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/nasa/nisar/search` | Search candidate NISAR Earth observations by bounding box & date. |
| `GET` | `/api/nasa/gpm/search` | Query GPM IMERG precipitation data for baseline verification. |
| `GET` | `/api/nasa/firms/search` | Query NASA FIRMS VIIRS/MODIS thermal fire anomalies. |
| `GET` | `/api/nasa/modis/search` | Query MODIS surface context and land reflectance. |
| `GET` | `/api/nasa/health` | Probe NASA CMR reachability and authentication status. |

### Ground-Truth & Field Alerts
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/cases/{case_id}/field-observations` | Submit geotagged field photo and observation note (multipart or JSON). |
| `GET` | `/api/cases/{case_id}/alerts` | List configured threshold alerts for a case. |
| `POST` | `/api/cases/{case_id}/alerts` | Subscribe to an anomaly threshold alert ($\Delta\text{dB}$, area). |
| `POST` | `/api/cases/{case_id}/alerts/{id}/acknowledge` | Mark an alert state as `ACKNOWLEDGED`. |
| `GET` | `/api/global/events` | Planetary aggregator of all active cases with spatial coordinates. |

---

## 🧪 Running Automated Tests

TRACE includes a comprehensive test suite covering the evidence fusion engine, the 7-point self audit, the sentinel agents, offline queues, and API routes:

```bash
# Activate your backend virtual environment
.venv\Scripts\Activate.ps1  # Windows
source .venv/bin/activate    # Linux/macOS

# Run the complete test suite with pytest
pytest server/tests -v
```

**Key Test Modules:**
- `test_self_audit_engine.py`: Validates that inconclusive signals are never falsely marked as supported.
- `test_evidence_engine.py`: Confirms multi-mission fusion and enforces non-causal phrasing rules.
- `test_sentinel_agents.py`: Simulates end-to-end multi-agent orchestration.
- `test_offline_queue_resilience.py`: Tests client-side offline caching and sync retry mechanisms.
- `test_scenario_simulator.py`: Verifies elevation-based water inundation scenarios and mandatory disclaimers.

---

## 📂 Project Directory Structure

```
TRACE-Platform/
├── client/                     # Frontend Application (Next.js 15)
│   ├── app/
│   │   ├── globals.css         # Custom tokens, neon accents & glassmorphism
│   │   ├── layout.tsx          # Root HTML layout & fonts
│   │   └── page.tsx            # Main application orchestrator
│   ├── components/
│   │   ├── mobile/             # Field Companion screens (Scan, Feel, Verify, etc.)
│   │   ├── scientific/         # PlanetaryRealMap, EvidenceConfidenceWall, CharGuardian
│   │   └── ui/                 # Reusable UI primitives (Buttons, Cards, Modals)
│   └── lib/
│       ├── api.ts              # Fully-typed API client
│       ├── feelMapping.ts      # dB-to-haptics & Web Audio synthesis algorithm
│       ├── offlineQueue.ts     # Offline storage & background sync engine
│       ├── sarAnalysis.ts      # Polarization matrix & decibel calculators
│       └── useGeolocation.ts   # Device GPS acquisition & tracking
│
├── server/                     # Backend Application (FastAPI)
│   ├── app/
│   │   ├── api/routes/         # Case, NASA, and Global route handlers
│   │   ├── core/               # Database, PostGIS connection & seed scripts
│   │   ├── models/             # SQLAlchemy & GeoAlchemy2 spatial tables
│   │   ├── schemas/            # Pydantic v2 validation models
│   │   └── services/
│   │       ├── evidence_engine.py      # Cross-mission evidence fusion
│   │       ├── self_audit_engine.py    # Deterministic 7-point quality engine
│   │       ├── sentinel_agents.py      # 5 Autonomous sentinel agents
│   │       ├── scenario_simulator.py   # Water level scenario modeling
│   │       └── nasa/                   # CMR, NISAR, GPM, FIRMS, MODIS connectors
│   ├── requirements.txt        # Server Python dependencies
│   └── tests/                  # Pytest verification suite
│
├── package.json                # Turborepo root configuration
├── pnpm-workspace.yaml         # pnpm workspace definition
└── README.md                   # This documentation
```

---

## 🌍 Real-World Impact Scenarios

### 🌊 Scenario 1: Monsoon River Island ("Char") Protection
Millions of people inhabit shifting river islands (*chars*) along the Ganges-Brahmaputra-Meghna deltas. Heavy monsoons submerge land and alter river channels rapidly, but optical satellites cannot see through monsoon clouds. TRACE utilizes NISAR L-band radar to monitor land boundary changes through heavy clouds, allowing disaster agencies to direct aid without false alarm panics.

### 🚜 Scenario 2: Post-Hurricane Surface Water Inundation
Following a hurricane landfall, standing water creates agricultural ruin and health emergencies. TRACE tracks backscatter drops across multiple passes, cross-references with GPM precipitation records, and empowers ground rangers to take georeferenced photos to confirm whether floodwaters are receding.

### 🌲 Scenario 3: Wildfire Scar & Subsequent Mudslide Threat
After severe wildfires tracked by NASA FIRMS, burn scars lose soil stability. When subsequent rainstorms hit, TRACE monitors InSAR phase decorrelation to detect early ground shift indicators before catastrophic mudslides occur.

---

## 🤝 Contributing

We welcome contributions from Earth scientists, radar specialists, software engineers, and GIS enthusiasts!

1. Fork the Project (`https://github.com/sanjidtalukder/TRACE-Platform/fork`)
2. Create your Feature Branch (`git checkout -b feature/AmazingRadarLens`)
3. Commit your Changes (`git commit -m 'feat: Add polarization ratio comparison lens'`)
4. Push to the Branch (`git push origin feature/AmazingRadarLens`)
5. Open a Pull Request

---

## 📜 Acknowledgements & Data Credits

- **NASA Earth Science Data Systems (ESDS)**: For open and unrestricted access to global Earth observation datasets.
- **NASA / ISRO NISAR Mission**: For pioneering L-band and S-band radar imaging science.
- **Alaska Satellite Facility (ASF) DAAC**: For SAR data access and infrastructure.
- **NASA Land, Atmosphere Near-real-time Capability for EOS (LANCE)**: For FIRMS active fire data.
- **NASA Global Precipitation Measurement (GPM)**: For IMERG precipitation products.
- **NASA Space Apps Challenge 2026**: For inspiring innovative solutions to planetary challenges.

---

<div align="center">

Made with 💙 for **NASA Space Apps Challenge 2026**  
**TRACE Team** • *Bridging Orbit and Ground with Scientific Rigor*

</div>
