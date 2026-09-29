# TRACE-Platform: Comprehensive Feature & Architecture Documentation

**TRACE** (Temporal Radar Assessment & Cross-mission Evidence) is a cutting-edge, AI-driven platform designed to monitor, analyze, and verify environmental events (e.g., floods, fires, landslides, deforestation, river morphology). It fuses advanced satellite imagery (NISAR, MODIS, GPM, FIRMS) with on-the-ground human verification.

This document serves as the **master blueprint**, detailing every single feature, its specific use case, and the target audience it serves.

---

## 1. Executive Summary & User Personas

The TRACE platform is designed for two distinct user groups, each with their own dedicated interface and toolkit:

1.  **Community Sentinels (Field Operatives):**
    *   **Who they are:** Everyday citizens, volunteers, or official field workers.
    *   **What they do:** They use the **Mobile Interface** to physically go to locations flagged by satellites and provide ground truth (photos, notes, geolocation). They act as the human verification layer against AI and satellite data.
2.  **Scientific Analysts (Data Scientists & Challenge Judges):**
    *   **Who they are:** Experts, researchers, and administrators.
    *   **What they do:** They use the **Scientific Desktop Interface** to review the AI agents' findings, cross-reference satellite data (e.g., Optical vs SAR), dive deep into raw radar metrics, and evaluate the overall "Evidence Wall" before making official determinations.

---

## 2. Server Architecture (Backend)
*Built with Python, FastAPI, and PostgreSQL/PostGIS.*

The backend is built as a highly autonomous event-driven engine that processes cases without human intervention until the final verification stage.

### 2.1 Autonomous Sentinel Workflow (AI Agents)
The core intelligence of TRACE lies in a sequence of specialized AI agents (`sentinel_agents.py`):

*   **Data Agent:**
    *   **Purpose:** Automatically fetches necessary geospatial and Earthdata across defined timelines and bounding boxes from NASA APIs.
*   **Detection Agent:**
    *   **Purpose:** Analyzes primary SAR (Synthetic Aperture Radar) metrics (Delta Backscatter in dB, affected area) to determine if a significant anomaly (e.g., flooding) has occurred.
*   **Evidence Agent:**
    *   **Purpose:** Fuses cross-mission observation data. It pulls from secondary sensors (FIRMS for thermal, GPM for precipitation, MODIS for optical) to corroborate or contradict the primary SAR findings temporally and spatially.
*   **Challenge Agent:**
    *   **Purpose:** Executes deterministic self-audit rules (the "Self-Audit Engine").
    *   **Critical Use Case:** This agent is designed to be adversarial. It is allowed to *disagree* with the Detection Agent if the secondary evidence or human ground-truth reports contradict the primary findings. This ensures high scientific rigor and prevents AI hallucinations.
*   **Interpretation Agent:**
    *   **Purpose:** Assembles the final scientific narrative. It generates a human-readable, non-causal statement explaining what happened (e.g., "Observed SAR backscatter drop strongly correlates with ground reports of standing water"), along with a final execution log and overall verdict.

### 2.2 Core Engines & NASA Integrations
*   **NASA APIs (`nasa/`):** Direct integrations with CMR (historical baselines), FIRMS (active fires), GPM (precipitation), MODIS (optical imagery), and NISAR (radar).
*   **Scenario Simulator (`scenario_simulator.py`):** Generates synthetic reference baselines.
    *   **Use Case:** Projects potential impacts based on water level offsets (e.g., estimating affected population, schools, and health facilities).
*   **Storage Service (`storage_service.py`):** Handles secure file uploads for ground-truth photos.

---

## 3. Client Architecture - Mobile Interface
*Target Audience: Community Sentinels / Field Operatives*

Located in `client/components/mobile/`, these features are optimized for on-the-go use, even in remote areas.

### 3.1 ScanScreen (The Mobile Dashboard)
The main entry point for operatives, containing four segmented views:
*   **OverviewView:**
    *   **Feature:** Shows map context, user's GPS location, distance to the event centroid, and potential optical/SAR data links.
*   **SignalsView:**
    *   **Feature:** Displays backend scientific measurements (e.g., current Delta Backscatter values) directly to the operative.
*   **PayloadAuditView:**
    *   **Feature:** Displays the `EvidenceConfidenceWall` in a mobile-friendly format and lists all previous Community Sentinel ground reports to provide historical context before they submit their own.
*   **TimelineView:**
    *   **Feature:** A chronological timeline of the specific environmental case.

### 3.2 FeelScreen (Haptic Data Perception)
*   **Who it's for:** Field Operatives.
*   **Use Case:** Allows operatives to physically "feel" what the satellite saw, bridging the gap between raw data and human perception.
*   **Features:** Translates Delta Backscatter into physical vibrations (haptics) and audio pulses. Includes an immersive radar-style UI and a "Haptic Scale" to adjust sensitivity.

### 3.3 VerifyScreen (Ground Truth Submission)
*   **Who it's for:** Field Operatives.
*   **Use Case:** The core tool for submitting verifiable ground data to either support or challenge the AI's findings.
*   **Features:** Forces GPS coordinate capture (with accuracy metrics), allows optional photo capture/upload, text notes, and secure timestamping.

### 3.4 Offline Queueing & Resilience (`offlineQueue.ts`)
*   **Use Case:** Field workers often operate in disaster zones (floods, fires) with destroyed or no cellular infrastructure.
*   **Features:** Automatically saves `VerifyScreen` submissions locally to the device if offline, and seamlessly syncs them to the backend when connectivity is restored.

### 3.5 ThresholdAlertModal
*   **Use Case:** Proactive monitoring.
*   **Features:** Allows sentinels to subscribe to specific anomalies. For example, setting an alert for "Notify me if Delta Backscatter drops below -2.0 dB in my local region."

---

## 4. Client Architecture - Scientific Interface
*Target Audience: Scientific Analysts, Data Scientists, Challenge Judges*

Located in `client/components/scientific/`, these features are designed for deep data analysis, rigorous auditing, and manual verification on desktop platforms.

### 4.1 GlobalPulseView & PlanetaryRealMap
*   **Who it's for:** Administrators and high-level analysts.
*   **Use Case:** Monitoring the global state of the platform.
*   **Features:** A high-level dashboard with an interactive geographic projection (`PlanetaryRealMap`) using a WGS84 Equirectangular Grid. Allows filtering active cases by Event Type (Wildfire, Flood, Char) and Audit Verdict (SUPPORTED, REJECTED, INCONCLUSIVE).

### 4.2 EvidenceConfidenceWall
*   **Who it's for:** Challenge Judges and Scientists.
*   **Use Case:** The ultimate dashboard to review a specific case and the AI's decision-making process.
*   **Features:** Divides the investigation into 4 rigorous categories:
    1.  **Core Evidence:** Primary SAR measurements alongside Community Sentinel Ground Truth reports.
    2.  **Derived Evidence:** Results from the Challenge Agent's deterministic spatiotemporal correlation checks.
    3.  **Interpretation:** The final AI-generated scientific narrative, non-causal statement, and the raw Execution Log of the Sentinel Agents.
    4.  **Simulation Reference:** Output from the Scenario Simulator (impact metrics) and historical baseline references.

### 4.3 CharGuardianView
*   **Who it's for:** Hydrologists and geomorphologists.
*   **Use Case:** Specifically tracks seasonal "Char" (river island) morphological changes.
*   **Features:** Tracks erosion and accretion rates using SAR over long periods, identifying landmass stability.

### 4.4 Advanced Analytical Tools
*   **OpticalSarSwipeComparison:**
    *   **Use Case:** Allows scientists to manually verify what clouds might obscure in optical imagery.
    *   **Feature:** An interactive slider tool comparing optical imagery (MODIS) with SAR imagery (NISAR) side-by-side.
*   **ChangeLensesView:**
    *   **Feature:** Allows analysts to rapidly switch between different data layers (optical, SAR, thermal) over a base map to highlight specific environmental factors.
*   **EnhancedEventTimeline:**
    *   **Feature:** A high-density chronological view of all cross-mission evidence.

### 4.5 Deep SAR Analysis Suite (`scientific/sar/`)
*   **Who it's for:** Radar specialists.
*   **Use Case:** Deep diving into raw Synthetic Aperture Radar data.
*   **Features:**
    *   `SarPolarizationControl`: Toggle and filter between different radar polarizations (e.g., VV, VH).
    *   `SarTimeSeriesGraph`: Plot backscatter changes over time to identify trends.
    *   `SarInspectSignalDrawer`: Drill down into the raw signal metrics of a specific pixel or measurement.
    *   `SarChangeLegend`: A visual legend to interpret the color-coded SAR changes (e.g., blue for water, red for structural damage).
