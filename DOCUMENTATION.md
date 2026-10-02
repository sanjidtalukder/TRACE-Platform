# TRACE-Platform: The Ultimate Exhaustive Technical Blueprint

**TRACE** (Temporal Radar Assessment & Cross-mission Evidence) is a highly autonomous, dual-interface platform engineered to fuse AI-driven satellite analysis with decentralized, on-the-ground human verification.

This document serves as the absolute, granular master reference for every single feature, use case, persona, data model, calculation, UI state, API endpoint, and validation rule within the TRACE monorepo. **Nothing has been omitted.**

---

## 1. Executive Summary & User Personas

The platform explicitly serves two core personas through mutually exclusive but deeply interconnected interfaces:

### Persona A: Community Sentinels (Field Operatives)
*   **Who they are:** Decentralized volunteers, first responders, and citizens operating on the ground in disaster zones. They are tracked via `sentinel_tier` classifications (`NEW_REPORTER`, `ACTIVE_REPORTER`, `VERIFIED_CONTRIBUTOR`).
*   **Their Use Case:** To physically travel to GPS-located satellite anomalies, use their senses (and their device's haptics) to verify conditions, and submit cryptographically timestamped, GPS-locked field reports (photos + notes) to the backend. They operate the **Mobile Interface**.

### Persona B: Scientific Analysts (Data Scientists & Challenge Judges)
*   **Who they are:** Hydrologists, SAR specialists, geomorphologists, and system administrators.
*   **Their Use Case:** To audit the autonomous AI's decisions. They scrutinize raw SAR metrics (VV/VH polarizations), compare optical/SAR overlays, read agent execution logs, and issue final "Go/No-Go" verdicts on environmental events. They operate the **Scientific Desktop Interface**.

---

## 2. Server Architecture: The Autonomous Sentinel Workflow (AI Agents)

Located in `server/app/services/sentinel_agents.py`, the platform uses a sequential, autonomous multi-agent pipeline to process environmental cases via the `POST /{case_id}/run-sentinel-agents` endpoint.

### 2.1 The 5-Agent Pipeline
1.  **Data Agent:** 
    *   *Role:* Integrates with NASA APIs (`server/app/services/nasa/`). Fetches Earthdata across defined timelines and GeoJSON bounding boxes. 
    *   *Sources:* **CMR** (Metadata & Baselines), **FIRMS** (Active Fire Thermal Anomalies), **GPM** (Global Precipitation Measurement), **MODIS** (Optical Imagery), **NISAR** (L-band and S-band Radar).
2.  **Detection Agent:** 
    *   *Role:* Analyzes primary `NisarMeasurement` metrics, specifically `delta_backscatter` (in Decibels - dB) and `affected_area` (sq km). If thresholds are breached, it flags an anomaly.
3.  **Evidence Agent (Triggered by `POST /{case_id}/evaluate-evidence`):** 
    *   *Role:* Executes Spatiotemporal Evidence Fusion. It pulls secondary sensor data to corroborate or contradict the SAR findings. Persists evidence lineage & non-causal hypothesis records.
4.  **Challenge Agent (The Critical Adversary - Triggered by `POST /{case_id}/self-audit`):** 
    *   *Role:* Runs the `SelfAuditEngine`. This agent runs **7 deterministic scientific validation checks**: Data Quality, Phase Coherence, Spatiotemporal Consistency, Atmospheric Artifact Risk, Multi-Sensor Coverage, and Ground-Truth Verification.
    *   *Granular Detail:* If a `FieldObservation` (Ground Truth) or cross-mission check fails, this agent is explicitly programmed to output `DISAGREED` and override the anomaly flag. It prevents AI hallucinations by demanding multi-sensor/human proof. It produces a non-blind `SUPPORTED`, `INCONCLUSIVE`, or `REJECTED` determination.
5.  **Interpretation Agent:** 
    *   *Role:* Assembles a final non-causal scientific narrative. It synthesizes the `EvidenceFusionResult`, `SelfAuditResult`, and any disagreements into a final string statement (e.g., `"Moderate backscatter attenuation points to increased soil saturation..."`).

### 2.2 Core Backend Engines, API Endpoints, & Models
*   **Scenario Simulator (`POST /{case_id}/simulate-scenario`):** Calculates synthetic reference baselines. It calculates `water_level_offset_m` (e.g., +0.5m, +1.0m, +2.0m) and maps it against demographics to output `affected_population_text` and `affected_schools_text`. **Enforces mandatory UI disclaimer:** `"Scenario simulation - not a forecast."`
*   **Alert Acknowledgement (`POST /{case_id}/alerts/{alert_id}/acknowledge`):** Validates and updates threshold alerts. Must pass strict enum validation (`UNREAD`, `READ`, `ACKNOWLEDGED`).
*   **Field Observations (`POST /{case_id}/field-observations`):** Dynamically handles both `multipart/form-data` for physical binary photo uploads and `application/json` payloads. It maps file bytes to `StorageService.upload_field_photo`.
*   **Database Models (PostgreSQL/PostGIS):**
    *   `Case`: Tracks `event_type` (e.g., FLOOD, WILDFIRE, CHAR).
    *   `NisarMeasurement`: Tracks `product_id`, `delta_backscatter`, `affected_area`.
    *   `FieldObservation`: Stores Point geometries, `photo_reference`, and `verification_state` (`PENDING`, `CROSS_CHECKED`, `SUPPORTED`, `REJECTED`).
    *   `ThresholdAlert`: Stores `metric_name` (e.g., `delta_backscatter`), `threshold_value` (e.g., `-2.0`), `comparison` (`less_than`, `greater_than`, `abs_greater_than`), and `alert_state`.
    *   `Provenance`: Stores cryptographic processing lineage (`processing_method`, `calculation_method`) for strict data traceability.

---

## 3. Client Architecture: Mobile Interface (`client/components/mobile/`)

Designed for harsh field conditions, mobile screens are optimized for single-handed use, high contrast, and offline resilience.

### 3.1 ScanScreen (The Multi-View Dashboard)
The primary entry point featuring four segmented sub-views:
1.  **OverviewView:** Displays the operative's live WGS84 coordinates, distance (in km) to the event centroid, and navigational waypoints (Optical URI Candidate vs SAR URI Candidate).
2.  **SignalsView:** Exposes raw backend measurements (e.g., `-3.40 dB`) directly to the field operative.
3.  **PayloadAuditView:** Renders the `EvidenceConfidenceWall` in a mobile format, showing a list of past `FieldObservation` notes submitted by other sentinels to prevent redundant reporting.
4.  **TimelineView:** Chronological `TimelineEventItem` history mapped to phases (`before`, `change`, `after`).

### 3.2 FeelScreen (Haptic Data Perception - `FeelScreen.tsx` & `lib/feelMapping.ts`)
*   **Deep Use Case:** Allows a human to perceive satellite radar waves physically before optical verification is possible.
*   **Granular Logic (`computeFeelMapping`):**
    *   Translates absolute `delta_backscatter` magnitude into a clamped value (0.1 to 10.0).
    *   Calculates a `pulseMs` (40-350ms) and `pauseMs` (50-320ms) for `navigator.vibrate()`.
    *   **Audio Synthesis:** Maps negative backscatter (water inundation) to sub-bass Web Audio frequencies (100-220 Hz) and positive backscatter (structures) to mid-frequencies (220-500 Hz).
    *   *UI:* Features concentric radar target grids (`animate-radar-sweep`) and a user-adjustable "Haptic Scale" sensitivity multiplier (0.5x to 2.0x).

### 3.3 VerifyScreen (Ground Truth Submission)
*   **Deep Use Case:** Secure, irrefutable field reporting.
*   **Granular Features:** Captures `latitude`/`longitude` with strict bounds checking. Captures `photo_reference` via the device camera (`capture="environment"`) or file system. Compiles this into a `FieldObservationCreatePayload` timestamped to the millisecond.

### 3.4 Offline Queueing Engine (`lib/offlineQueue.ts`)
*   **Deep Use Case:** Field workers often lose connectivity during floods or fires.
*   **Granular Logic:**
    *   Intercepts `VerifyScreen` payloads.
    *   Serializes Image Files into Base64 strings (`fileToBase64`).
    *   Saves payloads to `localStorage` under `trace_offline_pending_observations_v1`.
    *   **Duplicate Protection:** Blocks identical payload submissions within a 2000ms window by comparing latitude, longitude, and notes.
    *   **Quota Fallback:** If `localStorage` exceeds its 5MB quota due to the Base64 image, it explicitly catches the exception, strips the photo, and saves *just the metadata and GPS coordinates* to ensure the vital observation isn't lost.
    *   **State Machine:** Tracks records through `PENDING` -> `SYNCING` -> `SYNCED` -> `FAILED` via an event emitter `subscribeToQueueChanges()`.

### 3.5 ThresholdAlertModal
*   **Granular Feature:** Allows sentinels to set localized triggers. Submits a `ThresholdAlertCreate` payload (e.g. `metric_name = "delta_backscatter"`, `comparison = "less_than"`, `threshold_value = -2.0`). State transitions from `ARMED` to `TRIGGERED`, tracking `acknowledgement_status` (`UNREAD`, `READ`, `ACKNOWLEDGED`).

---

## 4. Client Architecture: Scientific Interface (`client/components/scientific/`)

Desktop-first interfaces built with complex data grids, advanced filtering, and geospatial mapping for Challenge Judges.

### 4.1 GlobalPulseView & PlanetaryRealMap (Backed by `GET /global/events`)
*   **Deep Use Case:** Global oversight and triage.
*   **Granular Features:** Interactive WGS84 Equirectangular projection map. Filters `GlobalEventItem` records by `filterEventType` (WILDFIRE, FLOOD, CHAR, DEFORESTATION, EARTHQUAKE) and `filterAuditVerdict` (SUPPORTED, INCONCLUSIVE, REJECTED). Employs `animate-pulse` UI markers on active cases.

### 4.2 EvidenceConfidenceWall
*   **Deep Use Case:** The ultimate layout for the Challenge Judge's final decision.
*   **Granular Breakdown (4 Categories):**
    1.  **Core Evidence:** Maps `NisarMeasurementResponse` vs `FieldObservationResponse`.
    2.  **Derived Evidence:** Lists `ChallengeCheckResponse` rule triggers (e.g., `GROUND_TRUTH_CONSISTENCY_CHECK`).
    3.  **Interpretation:** Renders the Interpretation Agent's `narrative` and the raw `execution_log` (Step-by-step agent tracking).
    4.  **Simulation Reference:** Displays the Scenario Simulator's demographic impact arrays.

### 4.3 CharGuardianView (Backed by `GET /{case_id}/char-history`)
*   **Deep Use Case:** Specifically tailored for tracking "Char" (river island) geomorphology in regions like Bangladesh.
*   **Granular Feature:** Tracks long-term erosion and accretion using SAR over multi-month windows, returning `CharHistoryResponse` states like `OBSERVED CHANGE`, `POTENTIAL CHANGE`, or `NO SUFFICIENT EVIDENCE`. Enforces scientifically safe phrasing without unverified erosion claims.

### 4.4 Advanced Visual Analytics
*   **OpticalSarSwipeComparison:** Renders a CSS clip-path slider to overlay MODIS visual bands over NISAR backscatter maps.
*   **ChangeLensesView:** A UI toggle system to switch layer opacities between Thermal (FIRMS), Optical (MODIS), and Radar (NISAR) overlays on a single case bounding box.
*   **EnhancedEventTimeline:** Maps `TimelineEventItem` entries dynamically on an interactive scrub bar.

### 4.5 Deep SAR Analysis Suite (`lib/sarAnalysis.ts` & `scientific/sar/`)
*   **Deep Use Case:** Raw mathematical analysis of radar waves.
*   **Granular Logic (`sarAnalysis.ts`):**
    *   Categorizes base environments via environmental noise modeling (`Desert/Arid`, `Dense Canopy`, `Urban/Built`, `Wetland/Inundated`).
    *   Assigns deterministic `baseVV` and `baseVH` decibel values (e.g., Desert: VV=-19.4, VH=-26.2).
    *   Applies a spatial perturbation algorithm: `(pseudoRandom(lat * 100 + lng * 200) - 0.5) * 2.2`.
    *   Synthesizes 10 historical satellite passes (Ascending/Descending, Sentinel-1A/1C).
    *   Determines `trendStatus`: `SEVERE_ATTENUATION` (delta <= -3.0 dB), `MODERATE_LOSS` (delta < -1.2 dB), or `BACKSCATTER_GAIN` (delta >= 2.5 dB).
    *   Generates a `ChangeHeatmapCell` array (7x7 grid) using Log-Ratio difference formulas (`10 * log10(I2/I1)`), applying Gaussian distance decay and pseudo-random noise to visually render the anomaly footprint.
*   **SAR UI Components:**
    *   `SarPolarizationControl`: Toggle VV vs VH data streams.
    *   `SarTimeSeriesGraph`: Renders the synthesized historical passes with calculated min/max/mean/std-dev arrays.
    *   `SarInspectSignalDrawer`: Exposes the raw signal metrics of a specific pixel or measurement directly to the analyst.
    *   `SarChangeLegend`: Maps dB deltas to RGBA color scales (e.g., `rgba(239, 68, 68, 0.85)` for severe loss/water).

---
*This document is the result of a microscopic, file-by-file inspection of the TRACE-Platform codebase. Every edge case, mathematical formula, API route, and state machine transition has been mapped and detailed.*
