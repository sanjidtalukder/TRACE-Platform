# TRACE-Platform: Comprehensive Project Documentation

**TRACE** (Temporal Radar Assessment & Cross-mission Evidence) is a cutting-edge platform designed to monitor, analyze, and verify environmental events (e.g., floods, fires, landslides) using advanced satellite imagery (NISAR, MODIS, GPM) paired with on-the-ground human verification. 

This document serves as the **master blueprint** for the TRACE Platform. It covers the entire system architecture, every single feature across the mobile and scientific interfaces, and the underlying AI-driven backend engine.

---

## 1. System Architecture

The project is structured as a **monorepo**, neatly splitting responsibilities into two distinct domains:

*   **`client/` (Frontend):** Built with Next.js, React, TypeScript, and TailwindCSS. It provides distinct views tailored for on-the-ground field operatives (Mobile) and high-level data scientists (Desktop).
*   **`server/` (Backend):** Built with Python and FastAPI. It relies on a PostgreSQL/PostGIS database for geospatial data and acts as the brain of the platform, orchestrating autonomous AI agents and interfacing directly with NASA Earthdata APIs.

---

## 2. Server Architecture (Backend)

The backend is built as a highly autonomous event-driven engine.

### 2.1 Autonomous Sentinel Workflow (Agents)
The platform uses an orchestration of specialized AI agents to process cases autonomously. This workflow is defined in `server/app/services/sentinel_agents.py`.

*   **Data Agent:** Automatically fetches necessary geospatial and Earthdata across defined timelines and bounding boxes.
*   **Detection Agent:** Analyzes primary SAR (Synthetic Aperture Radar) metrics. It calculates Delta Backscatter (dB) and affected area to determine if a significant anomaly (e.g., flooding) has occurred.
*   **Evidence Agent:** Fuses cross-mission observation data. It pulls from secondary sensors (FIRMS for thermal, GPM for precipitation, MODIS for optical) to corroborate or contradict the primary SAR findings.
*   **Challenge Agent:** Executes deterministic self-audit rules. Crucially, this agent is allowed to *disagree* with the Detection Agent if the secondary evidence or ground-truth reports contradict the primary findings, ensuring high scientific rigor.
*   **Interpretation Agent:** Assembles the final scientific narrative, generating a human-readable, non-causal statement explaining what happened, along with a final execution log and overall verdict.

### 2.2 NASA API Integrations
The backend integrates with multiple NASA systems (`server/app/services/nasa/`):
*   **CMR (Common Metadata Repository):** For historical baselines and historical sensor models.
*   **FIRMS:** For active fire data (thermal anomalies).
*   **GPM:** For global precipitation measurements.
*   **MODIS:** For moderate-resolution optical imagery.
*   **NISAR:** The primary radar instrument used for detecting surface changes (e.g., floods, biomass changes).

### 2.3 Core Services
*   **Evidence Engine (`evidence_engine.py`):** Correlates spatial and temporal evidence from various sources.
*   **Scenario Simulator (`scenario_simulator.py`):** Generates synthetic reference baselines, projecting water level offsets, affected areas, and potential impacts on population, schools, and health facilities.
*   **Self-Audit Engine (`self_audit_engine.py`):** Runs the deterministic rules used by the Challenge Agent.
*   **Storage Service (`storage_service.py`):** Handles file uploads for ground-truth photos.

### 2.4 Database Models (`server/app/models/`)
*   **Case:** Represents a specific environmental event.
*   **NisarMeasurement:** Stores the primary scientific measurements derived from NISAR data (Delta backscatter, spatial extent).
*   **Evidence:** Stores independent cross-mission observations used for investigation.
*   **ChallengeCheck:** Stores quality control and hypothesis validation results.
*   **Interpretation:** Stores the generated scientific narrative and uncertainty evaluation.
*   **Provenance:** A cryptographic and processing lineage record ensuring complete data traceability.
*   **FieldObservation:** Stores ground-truth reports submitted by the Community Sentinel Network, including points, notes, and photos.
*   **ThresholdAlert:** Manages user subscriptions to specific anomaly alerts (e.g., when water levels exceed a specified threshold).

---

## 3. Client Architecture (Frontend)

The Next.js frontend is divided into two primary experiences: **Mobile** for field reporting, and **Scientific** for desktop analysis.

### 3.1 Mobile Interface (Field Operations)
The mobile interface (`client/components/mobile/`) is designed for field operatives ("Sentinels") who provide ground-truth verification of satellite anomalies.

*   **FeelScreen (`FeelScreen.tsx`):** A unique sensory feature that allows users to physically "feel" the environmental change. It converts backend NISAR measurements (Delta Backscatter) into haptic feedback (vibrations) and audio pulses. Includes adjustable sensitivity controls and an immersive radar UI.
*   **ScanScreen (`ScanScreen.tsx`):** The main dashboard for operatives, featuring four segmented views:
    1.  **Overview View:** Shows GPS location, distance to the event centroid, and allows navigating to the optical vs SAR candidates.
    2.  **Signals View:** Displays scientific signals and backend metrics.
    3.  **Payloads/Audit View (`PayloadAuditView.tsx`):** Displays the `EvidenceConfidenceWall` and a timeline of Human Ground Sentinel Field Reports.
    4.  **Timeline View:** A chronological timeline of the event observation period.
*   **VerifyScreen (`VerifyScreen.tsx`):** A detailed form allowing field operatives to submit ground-truth data. It includes optional photo capture/upload, custom notes, GPS coordinate capture, and timestamps. It supports quick "One-Tap Confirmations" as well as detailed reporting.
*   **ThresholdAlertModal (`ThresholdAlertModal.tsx`):** Allows users to subscribe to specific alerts, setting custom thresholds (e.g., alert me if Delta Backscatter drops below -2.0 dB).
*   **Investigation Detail Drawer:** A slide-up modal showing the current status of a case, field observation counts, and detailed NISAR measurements.

### 3.2 Scientific Interface (Desktop / Analysis)
The scientific interface (`client/components/scientific/`) provides deep, rigorous analytical tools for data scientists to verify the AI's findings.

*   **PlanetaryRealMap (`PlanetaryRealMap.tsx`):** A map view showing spatial extents and locations of events.
*   **EvidenceConfidenceWall (`EvidenceConfidenceWall.tsx`):** A comprehensive dashboard displaying the results of the Sentinel Workflow. It breaks data into four categories:
    1.  **Core Evidence:** Primary SAR measurements and Community Sentinel Ground Truths.
    2.  **Derived Evidence:** Spatiotemporal correlation checks and audit rule results.
    3.  **Interpretation:** The AI-generated scientific narrative, non-causal statement, and the Sentinel Agents Execution Log.
    4.  **Simulation Reference:** Output from the Scenario Simulator (impact metrics, water levels) and historical baseline references.
*   **OpticalSarSwipeComparison (`OpticalSarSwipeComparison.tsx`):** A slider tool allowing scientists to visually compare optical imagery (e.g., MODIS) against SAR imagery (NISAR) side-by-side to manually verify anomalies.
*   **CharGuardianView & GlobalPulseView:** Specialized dashboards for monitoring overarching trends and system health.
*   **ChangeLensesView:** Allows switching between different data lenses to highlight specific environmental factors.
*   **EnhancedEventTimeline:** A high-density chronological view of all cross-mission evidence and measurements.
*   **SAR Analysis Tools (`components/scientific/sar/`):**
    *   **SarPolarizationControl:** Tools for filtering and manipulating SAR polarization data (e.g., VV, VH).
    *   **SarTimeSeriesGraph:** Graphs showing changes in backscatter over time.
    *   **SarInspectSignalDrawer:** Deep dive into the raw signal metrics of a specific measurement.
    *   **SarChangeLegend:** Visual legend to help scientists interpret the color-coded SAR changes.

---

## 4. Key Workflows

### 4.1 The Anomaly Detection Lifecycle
1.  **Detection:** The Backend *Data* and *Detection Agents* detect an anomaly via NISAR satellite data.
2.  **Alerting:** The system checks `ThresholdAlerts` and notifies subscribed users.
3.  **Investigation:** The *Evidence Agent* pulls cross-mission data (FIRMS, GPM).
4.  **Audit:** The *Challenge Agent* evaluates the data rigorously.
5.  **Ground Truth:** Field Operatives use the **Mobile Interface** (`ScanScreen` -> `FeelScreen` -> `VerifyScreen`) to travel to the site, "feel" the data, and submit photos and GPS-verified notes.
6.  **Synthesis:** The *Interpretation Agent* combines satellite data with ground truth to create a final narrative, visible on the **Scientific Interface** (`EvidenceConfidenceWall`).

## 5. Environment & Tech Stack Summary
*   **Frontend:** React, Next.js, Tailwind CSS, Lucide Icons, Mobile-first responsive design.
*   **Backend:** Python, FastAPI, SQLAlchemy, Alembic (Migrations).
*   **Database:** PostgreSQL with PostGIS extension for rigorous spatial querying.
*   **Offline/Resilience:** The client incorporates offline queueing (`lib/offlineQueue.ts`, `lib/useOfflineSync.ts`) ensuring field operatives can record data even without cellular service, syncing automatically once reconnected.

---
*Generated automatically based on the TRACE-Platform codebase.*
