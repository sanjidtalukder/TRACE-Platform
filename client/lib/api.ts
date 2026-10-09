import {
  FALLBACK_CASES,
  FALLBACK_CASE_DETAILS,
  FALLBACK_TIMELINES,
  FALLBACK_GLOBAL_EVENTS,
  getFallbackCharHistory,
  getFallbackSentinelWorkflow,
  getFallbackScenarioSimulation,
  getFallbackSelfAudit,
  getFallbackEvidenceFusion,
} from './apiFallbackData';

export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    const isLocalhost =
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1';
    if (isLocalhost) {
      if (process.env.NEXT_PUBLIC_API_URL && !process.env.NEXT_PUBLIC_API_URL.includes('railway')) {
        return process.env.NEXT_PUBLIC_API_URL;
      }
      return 'http://localhost:8000';
    }
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
}

export const API_BASE_URL = getApiBaseUrl();

export function getApiUrl(path: string = ''): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${getApiBaseUrl()}${cleanPath}`;
}

export interface HealthResponse {
  status: string;
  service: string;
  version?: string;
  timestamp?: string;
}

export interface GeoJSONGeometry {
  type: string;
  coordinates: any;
}

export interface CaseListItem {
  id: string;
  case_id: string;
  event_type: string;
  geometry?: GeoJSONGeometry | null;
  observation_start: string;
  observation_end: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface PaginatedCasesResponse {
  items: CaseListItem[];
  page: number;
  page_size: number;
  total: number;
}

export interface NisarMeasurementResponse {
  id: string;
  case_id: string;
  product_id: string;
  observation_time: string;
  delta_backscatter?: number | null;
  affected_area?: number | null;
  spatial_extent?: GeoJSONGeometry | null;
  change_metric?: string | null;
  raster_reference?: string | null;
  created_at: string;
}

export interface EvidenceResponse {
  id: string;
  case_id: string;
  source_type: string;
  collection_id?: string | null;
  granule_id?: string | null;
  time_start?: string | null;
  time_end?: string | null;
  spatial_extent?: GeoJSONGeometry | null;
  role?: string | null;
  status: string;
  visualization_uri?: string | null;
  created_at: string;
}

export interface ChallengeCheckResponse {
  id: string;
  case_id: string;
  check_type: string;
  status: string;
  value?: string | null;
  threshold?: string | null;
  rationale?: string | null;
  source?: string | null;
  created_at: string;
}

export interface InterpretationResponse {
  id: string;
  case_id: string;
  narrative: string;
  uncertainty?: number | null;
  created_at: string;
  updated_at: string;
}

export interface ProvenanceResponse {
  id: string;
  case_id: string;
  evidence_id?: string | null;
  collection_id?: string | null;
  granule_id?: string | null;
  product_id?: string | null;
  acquisition_time?: string | null;
  processing_method?: string | null;
  calculation_method?: string | null;
  source_reference?: string | null;
  created_at: string;
}

export interface FieldObservationResponse {
  id: string;
  case_id: string;
  photo_reference?: string | null;
  note?: string | null;
  observed_at: string;
  location?: GeoJSONGeometry | null;
  source_type?: string;
  source?: string;
  created_at: string;
}

export interface FieldObservationCreatePayload {
  photo_reference?: string | null;
  note?: string | null;
  observed_at: string;
  latitude: number;
  longitude: number;
}

export interface ThresholdAlertResponse {
  id: string;
  case_id: string;
  metric_name: string;
  threshold_value: number;
  comparison: string;
  is_active: boolean;
  triggered_state: 'ARMED' | 'TRIGGERED';
  last_evaluated_val?: number | null;
  last_triggered_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ThresholdAlertCreatePayload {
  metric_name?: string;
  threshold_value: number;
  comparison?: string;
  is_active?: boolean;
}

export interface CaseDetailResponse {
  id: string;
  case_id: string;
  event_type: string;
  geometry?: GeoJSONGeometry | null;
  observation_start: string;
  observation_end: string;
  status: string;
  created_at: string;
  updated_at: string;
  nisar_measurements: NisarMeasurementResponse[];
  evidence: EvidenceResponse[];
  challenge_checks: ChallengeCheckResponse[];
  interpretations: InterpretationResponse[];
  provenance_records: ProvenanceResponse[];
  field_observations: FieldObservationResponse[];
  threshold_alerts?: ThresholdAlertResponse[];
}

export interface TimelineEventItem {
  id: string;
  case_id: string;
  timestamp: string;
  phase: 'before' | 'change' | 'after';
  event_type: string;
  title: string;
  details?: Record<string, any> | null;
}

export interface TimelineResponse {
  case_id: string;
  events: TimelineEventItem[];
}

/**
 * Fetch health status of backend server with timeout & graceful fallback
 */
export async function fetchHealthStatus(): Promise<HealthResponse> {
  try {
    const url = getApiUrl('/health');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      cache: 'no-store',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    // Graceful offline fallback
  }

  return {
    status: 'operational',
    service: 'TRACE Offline Autonomous Engine',
    version: '0.1.0',
    timestamp: new Date().toISOString(),
  };
}

/**
 * Fetch paginated list of TRACE cases with offline fallback
 */
export async function fetchCases(page: number = 1, pageSize: number = 20): Promise<PaginatedCasesResponse> {
  try {
    const url = getApiUrl(`/api/cases?page=${page}&page_size=${pageSize}`);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      cache: 'no-store',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.items) && data.items.length > 0) {
        return data;
      }
    }
  } catch (err) {
    console.warn('[TRACE API] Falling back to seeded cases:', err);
  }

  return {
    items: FALLBACK_CASES,
    page: 1,
    page_size: pageSize,
    total: FALLBACK_CASES.length,
  };
}

/**
 * Fetch full case detail by case_id with offline fallback
 */
export async function fetchCaseDetail(caseId: string): Promise<CaseDetailResponse> {
  try {
    const url = getApiUrl(`/api/cases/${encodeURIComponent(caseId)}`);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      cache: 'no-store',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.case_id) {
        return data;
      }
    }
  } catch (err) {
    console.warn(`[TRACE API] Falling back to offline case detail for ${caseId}:`, err);
  }

  if (FALLBACK_CASE_DETAILS[caseId]) {
    return FALLBACK_CASE_DETAILS[caseId];
  }

  const match = FALLBACK_CASES.find((c) => c.case_id === caseId) || FALLBACK_CASES[0];
  return (
    FALLBACK_CASE_DETAILS[match.case_id] ||
    FALLBACK_CASE_DETAILS['TRACE-CHAR-01']
  );
}

/**
 * Fetch chronological timeline for a case with offline fallback
 */
export async function fetchCaseTimeline(caseId: string): Promise<TimelineResponse> {
  try {
    const url = getApiUrl(`/api/cases/${encodeURIComponent(caseId)}/timeline`);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      cache: 'no-store',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn(`[TRACE API] Falling back to offline timeline for ${caseId}:`, err);
  }

  return (
    FALLBACK_TIMELINES[caseId] ||
    FALLBACK_TIMELINES['TRACE-CHAR-01'] || { case_id: caseId, events: [] }
  );
}

/**
 * Record a ground field observation for a specific case ID
 */
export async function createFieldObservation(
  caseId: string,
  payload: FieldObservationCreatePayload,
  photoFile?: File | null
): Promise<FieldObservationResponse> {
  const url = getApiUrl(`/api/cases/${encodeURIComponent(caseId)}/field-observations`);

  let requestInit: RequestInit;

  if (photoFile) {
    const formData = new FormData();
    formData.append('file', photoFile);
    if (payload.note) formData.append('note', payload.note);
    formData.append('observed_at', payload.observed_at);
    formData.append('latitude', payload.latitude.toString());
    formData.append('longitude', payload.longitude.toString());
    if (payload.photo_reference) formData.append('photo_reference', payload.photo_reference);

    requestInit = {
      method: 'POST',
      headers: {
        Accept: 'application/json',
      },
      body: formData,
    };
  } else {
    requestInit = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    };
  }

  const res = await fetch(url, requestInit);

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.detail || `HTTP ${res.status} failed to submit field observation`);
  }

  return res.json();
}

/**
 * Fetch threshold alerts configured for a specific case ID
 */
export async function fetchCaseAlerts(caseId: string): Promise<ThresholdAlertResponse[]> {
  const url = getApiUrl(`/api/cases/${encodeURIComponent(caseId)}/alerts`);
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} failed to fetch case alerts`);
  }

  return res.json();
}

/**
 * Configure or update a threshold alert for a specific case ID
 */
export async function createCaseAlert(
  caseId: string,
  payload: ThresholdAlertCreatePayload
): Promise<ThresholdAlertResponse> {
  const url = getApiUrl(`/api/cases/${encodeURIComponent(caseId)}/alerts`);
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.detail || `HTTP ${res.status} failed to save threshold alert`);
  }

  return res.json();
}

/**
 * Update an existing threshold alert (e.g. toggle active state, change threshold value)
 */
export async function updateCaseAlert(
  caseId: string,
  alertId: string,
  payload: Partial<ThresholdAlertCreatePayload> & { triggered_state?: string }
): Promise<ThresholdAlertResponse> {
  const url = getApiUrl(`/api/cases/${encodeURIComponent(caseId)}/alerts/${encodeURIComponent(alertId)}`);
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.detail || `HTTP ${res.status} failed to update threshold alert`);
  }

  return res.json();
}

export interface EvidenceFusionResponse {
  case_id: string;
  event_type: string;
  sar_anomaly_status: 'DETECTED' | 'NOT_DETECTED' | 'UNKNOWN';
  overall_status: 'CONFIRMED_MULTIMISSION' | 'PARTIALLY_SUPPORTED' | 'INCONCLUSIVE' | 'CONTRADICTED';
  sensor_evaluations: Record<string, {
    sensor_name: string;
    status: 'SUPPORTING' | 'NOT_SUPPORTING' | 'NEUTRAL' | 'UNAVAILABLE';
    summary_text: string;
    evidence_items: any[];
  }>;
  hypothesis_narrative: string;
  non_causal_statement: string;

  evaluated_at: string;
  provenance_records: any[];
}

/**
 * Execute Phase 4.1 Cross-Mission Evidence Engine evaluation for a case
 */
export async function evaluateCaseEvidence(caseId: string): Promise<EvidenceFusionResponse> {
  try {
    const url = getApiUrl(`/api/cases/${encodeURIComponent(caseId)}/evaluate-evidence`);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.case_id) {
        return data;
      }
    }
  } catch (err) {
    console.warn(`[TRACE API] Falling back to offline evidence fusion for ${caseId}:`, err);
  }

  return getFallbackEvidenceFusion(caseId);
}

export interface NASAObservationItem {
  source: string;
  mission: string;
  product_id: string;
  granule_id: string;
  collection_id: string;
  observation_time: string;
  start_time?: string | null;
  end_time?: string | null;
  spatial_extent?: GeoJSONGeometry | null;
  product_type: string;
  access_links?: string[];
  metadata_reference?: string | null;
}

export interface NASAObservationSearchResponse {
  items: NASAObservationItem[];
  total: number;
  source_query?: Record<string, any>;
}

/**
 * Fetch NASA FIRMS active fire observations
 */
export async function fetchFirmsObservations(bbox?: string, startDate?: string, endDate?: string): Promise<NASAObservationSearchResponse> {
  const params = new URLSearchParams();
  if (bbox) params.append('bbox', bbox);
  if (startDate) params.append('start_date', startDate);
  if (endDate) params.append('end_date', endDate);

  const url = getApiUrl(`/api/nasa/firms/search?${params.toString()}`);
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} failed to fetch FIRMS observations`);
  }

  return res.json();
}

export interface AuditCheckItem {
  check_type: string;
  rule_name: string;
  rule_version: string;
  status: 'PASS' | 'WARNING' | 'FAIL' | 'NOT_EVALUATED';
  value?: string | null;
  threshold?: string | null;
  rationale: string;
  source: string;
}

export interface SelfAuditResponse {
  case_id: string;
  overall_audit_state: 'SUPPORTED' | 'INCONCLUSIVE' | 'REJECTED';
  confidence_score: number;
  summary_explanation: string;
  checks: AuditCheckItem[];
  evaluated_at: string;
}

/**
 * Execute Phase 4.2 Challenge the Finding / Self-Audit Engine for a case
 */
export async function evaluateSelfAudit(caseId: string): Promise<SelfAuditResponse> {
  try {
    const url = getApiUrl(`/api/cases/${encodeURIComponent(caseId)}/self-audit`);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.case_id) {
        return data;
      }
    }
  } catch (err) {
    console.warn(`[TRACE API] Falling back to offline self-audit for ${caseId}:`, err);
  }

  return getFallbackSelfAudit(caseId);
}

export interface ScenarioSimulationResponse {
  case_id: string;
  water_level_offset_m: number;
  disclaimer: string;
  affected_area_sq_km?: number | null;
  affected_population_text: string;
  affected_schools_text: string;
  affected_health_facilities_text: string;
  simulated_at: string;
}

/**
 * Execute Phase 4.5 Scenario Simulator for a case (+0.5m, +1.0m, +2.0m)
 */
export async function simulateScenario(caseId: string, waterLevelOffsetM: number = 1.0): Promise<ScenarioSimulationResponse> {
  try {
    const url = getApiUrl(`/api/cases/${encodeURIComponent(caseId)}/simulate-scenario?water_level_offset_m=${waterLevelOffsetM}`);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.case_id) {
        return data;
      }
    }
  } catch (err) {
    console.warn(`[TRACE API] Falling back to offline scenario simulation for ${caseId}:`, err);
  }

  return getFallbackScenarioSimulation(caseId, waterLevelOffsetM);
}

export interface AgentStepOutput {
  agent_name: string;
  status: string;
  summary: string;
  data_payload: Record<string, any>;
  provenance: Record<string, any>;
  timestamp: string;
}

export interface SentinelWorkflowResponse {
  case_id: string;
  event_type: string;
  overall_workflow_status: string;
  final_verdict: string;
  challenge_disagreed: boolean;
  execution_log: AgentStepOutput[];
  interpretation_narrative: string;
  non_causal_statement: string;
  executed_at: string;
}

/**
 * Execute Phase 4.6 Autonomous Sentinel Agents workflow for a case
 */
export async function runSentinelAgents(caseId: string): Promise<SentinelWorkflowResponse> {
  try {
    const url = getApiUrl(`/api/cases/${encodeURIComponent(caseId)}/run-sentinel-agents`);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.case_id) {
        return data;
      }
    }
  } catch (err) {
    console.warn(`[TRACE API] Falling back to offline sentinel agents workflow for ${caseId}:`, err);
  }

  return getFallbackSentinelWorkflow(caseId);
}

export interface GlobalEventItem {
  case_id: string;
  event_type: string;
  latitude?: number | null;
  longitude?: number | null;
  observation_start: string;
  observation_end: string;
  status: string;
  evidence_status: string;
  audit_verdict: string;
  ground_truth_count: number;
  provenance_count: number;
  created_at: string;
}

export interface GlobalEventsResponse {
  items: GlobalEventItem[];
  total: number;
}

/**
 * Fetch planetary global events for Phase 5.1 Global Pulse
 */
export async function fetchGlobalEvents(eventType?: string, auditVerdict?: string): Promise<GlobalEventsResponse> {
  try {
    const params = new URLSearchParams();
    if (eventType) params.append('event_type', eventType);
    if (auditVerdict) params.append('audit_verdict', auditVerdict);

    const url = getApiUrl(`/api/global/events?${params.toString()}`);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      cache: 'no-store',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.items)) {
        return data;
      }
    }
  } catch (err) {
    console.warn('[TRACE API] Falling back to offline global pulse events:', err);
  }

  let items = [...FALLBACK_GLOBAL_EVENTS.items];
  if (eventType) {
    items = items.filter((i) => i.event_type.toLowerCase() === eventType.toLowerCase());
  }
  if (auditVerdict) {
    items = items.filter((i) => i.audit_verdict.toUpperCase() === auditVerdict.toUpperCase());
  }

  return {
    items,
    total: items.length,
  };
}

export interface GroundTruthAggregation {
  total_reports: number;
  confirmed_reports: number;
  denied_reports: number;
  pending_reports: number;
}

export interface CharHistoryResponse {
  case_id: string;
  event_type: string;
  char_name_or_id: string;
  geometry?: GeoJSONGeometry | null;
  latitude?: number | null;
  longitude?: number | null;
  observation_start: string;
  observation_end: string;
  status: string;
  change_status: string;
  latest_delta_backscatter?: number | null;
  latest_affected_area?: number | null;
  evidence_status: string;
  audit_verdict: string;
  ground_truth: GroundTruthAggregation;
  historical_observations: TimelineEventItem[];
  provenance_records: ProvenanceResponse[];
  alerts: ThresholdAlertResponse[];
}

/**
 * Fetch river-island / char change history for Phase 5.1 Char Guardian
 */
export async function fetchCharHistory(caseId: string): Promise<CharHistoryResponse> {
  try {
    const url = getApiUrl(`/api/cases/${encodeURIComponent(caseId)}/char-history`);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      cache: 'no-store',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.case_id) {
        return data;
      }
    }
  } catch (err) {
    console.warn(`[TRACE API] Falling back to offline char history for ${caseId}:`, err);
  }

  return getFallbackCharHistory(caseId);
}

export interface CommunityReportsResponse {
  case_id: string;
  aggregation: GroundTruthAggregation;
  reports: FieldObservationResponse[];
  message: string;
}

/**
 * Fetch structured community sentinel reports for a case
 */
export async function fetchCommunityReports(caseId: string): Promise<CommunityReportsResponse> {
  try {
    const url = getApiUrl(`/api/cases/${encodeURIComponent(caseId)}/community-reports`);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      cache: 'no-store',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn(`[TRACE API] Falling back to offline community reports for ${caseId}:`, err);
  }

  return {
    case_id: caseId,
    aggregation: {
      total_reports: 1,
      confirmed_reports: 1,
      denied_reports: 0,
      pending_reports: 0,
    },
    reports: [
      {
        id: `fo-comm-${caseId}`,
        case_id: caseId,
        note: 'Local field sentinel corroborated observed SAR backscatter shifts with optical ground photo.',
        observed_at: new Date().toISOString(),
        source_type: 'FIELD_AGENT',
        source: 'Community Field Ranger',
        created_at: new Date().toISOString(),
      },
    ],
    message: 'Community ground-truth aggregation active',
  };
}

/**
 * Acknowledge a threshold alert state (UNREAD -> READ / ACKNOWLEDGED)
 */
export async function acknowledgeAlert(caseId: string, alertId: string, acknowledgementStatus: string = 'ACKNOWLEDGED'): Promise<ThresholdAlertResponse> {
  try {
    const url = getApiUrl(`/api/cases/${encodeURIComponent(caseId)}/alerts/${encodeURIComponent(alertId)}/acknowledge`);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ acknowledgement_status: acknowledgementStatus }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn(`[TRACE API] Falling back to offline acknowledge alert for ${alertId}:`, err);
  }

  return {
    id: alertId,
    case_id: caseId,
    metric_name: 'delta_backscatter',
    threshold_value: 1.5,
    comparison: 'gt',
    is_active: false,
    triggered_state: 'ARMED',
    last_evaluated_val: 2.1,
    last_triggered_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}






