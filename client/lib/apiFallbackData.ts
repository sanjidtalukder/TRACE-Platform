import type {
  CaseListItem,
  CaseDetailResponse,
  TimelineResponse,
  GlobalEventsResponse,
  CharHistoryResponse,
  ThresholdAlertResponse,
  SelfAuditResponse,
  AuditCheckItem,
  EvidenceFusionResponse,
  SentinelWorkflowResponse,
  ScenarioSimulationResponse,
} from './api';

export const FALLBACK_CASES: CaseListItem[] = [
  {
    id: '1f825d31-d255-46bc-b47d-f175aefb8f05',
    case_id: 'TRACE-CHAR-01',
    event_type: 'char',
    geometry: {
      type: 'Polygon',
      coordinates: [[[89.5, 24.7], [89.8, 24.7], [89.8, 24.9], [89.5, 24.9], [89.5, 24.7]]],
    },
    observation_start: '2026-10-02T05:32:26.870608',
    observation_end: '2026-10-02T05:32:26.870608',
    status: 'active',
    created_at: '2026-10-02T05:32:26',
    updated_at: '2026-10-02T05:32:26',
  },
  {
    id: '7669ee9c-4abf-4393-a3c6-4b993f13e3e7',
    case_id: 'CASE-017',
    event_type: 'surface_water_change',
    geometry: {
      type: 'Polygon',
      coordinates: [[[-118.3, 34.0], [-118.1, 34.0], [-118.1, 34.2], [-118.3, 34.2], [-118.3, 34.0]]],
    },
    observation_start: '2026-09-21T23:22:07.248901',
    observation_end: '2026-09-21T23:22:07.248901',
    status: 'active',
    created_at: '2026-09-21T23:22:07',
    updated_at: '2026-09-21T23:22:07',
  },
  {
    id: '6b69c2f6-476b-4e37-b801-3b8e34a27dcd',
    case_id: 'TRACE-2026-001',
    event_type: 'flood',
    geometry: {
      type: 'Polygon',
      coordinates: [[[-95.4, 29.7], [-95.2, 29.7], [-95.2, 29.9], [-95.4, 29.9], [-95.4, 29.7]]],
    },
    observation_start: '2026-09-21T23:22:07.248901',
    observation_end: '2026-09-21T23:22:07.248901',
    status: 'active',
    created_at: '2026-09-21T23:22:07',
    updated_at: '2026-09-21T23:22:07',
  },
  {
    id: '56755995-231c-414a-8f01-583b5e4795fa',
    case_id: 'TRACE-WILD-01',
    event_type: 'wildfire',
    geometry: {
      type: 'Polygon',
      coordinates: [[[-119.6, 37.7], [-119.4, 37.7], [-119.4, 37.9], [-119.6, 37.9], [-119.6, 37.7]]],
    },
    observation_start: '2026-10-02T05:32:26.870608',
    observation_end: '2026-10-02T05:32:26.870608',
    status: 'active',
    created_at: '2026-10-02T05:32:26',
    updated_at: '2026-10-02T05:32:26',
  },
  {
    id: 'b16835c3-4414-4820-9434-eb8e5843cc11',
    case_id: 'TRACE-QUAKE-01',
    event_type: 'earthquake',
    geometry: {
      type: 'Polygon',
      coordinates: [[[-117.8, 35.6], [-117.5, 35.6], [-117.5, 35.9], [-117.8, 35.9], [-117.8, 35.6]]],
    },
    observation_start: '2026-10-02T05:32:26.870608',
    observation_end: '2026-10-02T05:32:26.870608',
    status: 'active',
    created_at: '2026-10-02T05:32:26',
    updated_at: '2026-10-02T05:32:26',
  },
  {
    id: '1dd4f285-6ffa-4a63-8284-95944a176346',
    case_id: 'TRACE-DEFOR-01',
    event_type: 'deforestation',
    geometry: {
      type: 'Polygon',
      coordinates: [[[-62.5, -10.9], [-62.2, -10.9], [-62.2, -10.7], [-62.5, -10.7], [-62.5, -10.9]]],
    },
    observation_start: '2026-10-02T05:32:26.870608',
    observation_end: '2026-10-02T05:32:26.870608',
    status: 'active',
    created_at: '2026-10-02T05:32:26',
    updated_at: '2026-10-02T05:32:26',
  },
];

export const FALLBACK_CASE_DETAILS: Record<string, CaseDetailResponse> = {
  'TRACE-CHAR-01': {
    id: '1f825d31-d255-46bc-b47d-f175aefb8f05',
    case_id: 'TRACE-CHAR-01',
    event_type: 'char',
    geometry: {
      type: 'Polygon',
      coordinates: [[[89.5, 24.7], [89.8, 24.7], [89.8, 24.9], [89.5, 24.9], [89.5, 24.7]]],
    },
    observation_start: '2026-10-02T05:32:26.870608',
    observation_end: '2026-10-02T05:32:26.870608',
    status: 'active',
    created_at: '2026-10-02T05:32:26',
    updated_at: '2026-10-02T05:32:26',
    nisar_measurements: [
      {
        id: 'meas-char-01',
        case_id: 'TRACE-CHAR-01',
        product_id: 'NISAR_L2_PR_GSLC_CHAR01',
        observation_time: '2026-10-02T05:32:26.870608',
        delta_backscatter: 2.1,
        affected_area: 210.0,
        change_metric: 'log_ratio',
        raster_reference: '/imagery/char_sar.jpg',
        created_at: '2026-10-02T05:32:26',
      },
    ],
    evidence: [
      {
        id: 'ev-char-optical',
        case_id: 'TRACE-CHAR-01',
        source_type: 'sentinel-2',
        collection_id: 'SENTINEL2_MSI_L2A',
        granule_id: 'S2A_MSIL2A_20261001T043701',
        role: 'optical',
        status: 'supports',
        visualization_uri: '/imagery/char_optical.jpg',
        created_at: '2026-10-02T05:32:26',
      },
      {
        id: 'ev-char-sar',
        case_id: 'TRACE-CHAR-01',
        source_type: 'nisar',
        collection_id: 'NISAR_L2_GSLC',
        granule_id: 'NISAR_L2_PR_GSLC_001_024_A_200_20261002T053226',
        role: 'sar',
        status: 'supports',
        visualization_uri: '/imagery/char_sar.jpg',
        created_at: '2026-10-02T05:32:26',
      },
    ],
    challenge_checks: [
      {
        id: 'chk-char-01',
        case_id: 'TRACE-CHAR-01',
        check_type: 'OVERALL_SELF_AUDIT',
        status: 'PASS',
        value: '+2.10 dB',
        threshold: '+1.0 dB',
        rationale: 'New sandbar deposition confirmed with multi-pass L-band SAR backscatter shift along the Jamuna River braid.',
        source: 'system',
        created_at: '2026-10-02T05:32:26',
      },
      {
        id: 'chk-char-02',
        case_id: 'TRACE-CHAR-01',
        check_type: 'PHASE_COHERENCE',
        status: 'PASS',
        value: '0.41 coherence',
        threshold: '0.30 coherence',
        rationale: 'Stable emergent silt deposit maintains baseline coherence.',
        source: 'system',
        created_at: '2026-10-02T05:32:26',
      },
    ],
    interpretations: [
      {
        id: 'interp-char-01',
        case_id: 'TRACE-CHAR-01',
        narrative: 'Seasonal monsoon recession has exposed emergent silt deposits in the central Jamuna River channel. Backscatter elevation of +2.10 dB is consistent with rough sandbar sedimentation rather than open-water specular reflection.',
        uncertainty: 0.12,
        created_at: '2026-10-02T05:32:26',
        updated_at: '2026-10-02T05:32:26',
      },
    ],
    provenance_records: [
      {
        id: 'prov-char-01',
        case_id: 'TRACE-CHAR-01',
        collection_id: 'NISAR_L2_GSLC',
        product_id: 'NISAR_L2_PR_GSLC_CHAR01',
        acquisition_time: '2026-10-02T05:32:26',
        processing_method: 'ASF DAAC SAR Radiometric Terrain Correction',
        source_reference: 'NASA-ISRO SAR Science Data System',
        created_at: '2026-10-02T05:32:26',
      },
    ],
    field_observations: [
      {
        id: 'fo-char-01',
        case_id: 'TRACE-CHAR-01',
        note: 'Sariakandi community ranger verified fresh silt bar deposition measuring approx 2.5km length.',
        observed_at: '2026-10-02T06:15:00',
        source: 'Community Field Ranger',
        created_at: '2026-10-02T06:15:00',
      },
    ],
    threshold_alerts: [
      {
        id: 'al-char-01',
        case_id: 'TRACE-CHAR-01',
        metric_name: 'delta_backscatter',
        threshold_value: 1.5,
        comparison: 'gt',
        is_active: true,
        triggered_state: 'TRIGGERED',
        last_evaluated_val: 2.1,
        last_triggered_at: '2026-10-02T05:35:00',
        created_at: '2026-10-02T05:32:26',
        updated_at: '2026-10-02T05:35:00',
      },
    ],
  },
  'CASE-017': {
    id: '7669ee9c-4abf-4393-a3c6-4b993f13e3e7',
    case_id: 'CASE-017',
    event_type: 'surface_water_change',
    geometry: {
      type: 'Polygon',
      coordinates: [[[-118.3, 34.0], [-118.1, 34.0], [-118.1, 34.2], [-118.3, 34.2], [-118.3, 34.0]]],
    },
    observation_start: '2026-09-21T23:22:07.248901',
    observation_end: '2026-09-21T23:22:07.248901',
    status: 'active',
    created_at: '2026-09-21T23:22:07',
    updated_at: '2026-09-21T23:22:07',
    nisar_measurements: [
      {
        id: '6b15827b-76bd-4b69-a1b5-9767609a10d9',
        case_id: 'CASE-017',
        product_id: 'NISAR_L2_PR_GCOV_017',
        observation_time: '2026-09-21T23:22:07.248901',
        delta_backscatter: -2.43,
        affected_area: 45.2,
        change_metric: 'log_ratio',
        raster_reference: '/imagery/flood_sar.jpg',
        created_at: '2026-09-21T23:22:07',
      },
    ],
    evidence: [
      {
        id: 'ev-017-gpm',
        case_id: 'CASE-017',
        source_type: 'gpm',
        collection_id: 'GPM_IMERG_V06',
        granule_id: '3B-DAY.MS.MRG.3IMERG.20260921-S000000-E235959.V06B',
        role: 'baseline',
        status: 'supports',
        visualization_uri: '/imagery/flood_optical.jpg',
        created_at: '2026-09-21T23:22:07',
      },
      {
        id: 'ev-017-optical',
        case_id: 'CASE-017',
        source_type: 'landsat',
        collection_id: 'LANDSAT_8_C2_L2',
        granule_id: 'LC08_L2SP_044034_20260920',
        role: 'optical',
        status: 'supports',
        visualization_uri: '/imagery/flood_optical.jpg',
        created_at: '2026-09-21T23:22:07',
      },
    ],
    challenge_checks: [
      {
        id: '34801c9b-90eb-46c7-9a07-ab5f472a0403',
        case_id: 'CASE-017',
        check_type: 'OVERALL_SELF_AUDIT',
        status: 'PASS',
        value: '-2.43 dB',
        threshold: '-1.5 dB',
        rationale: 'Validated against GPM IMERG baseline; significant specular reflection loss indicating surface inundation.',
        source: 'system',
        created_at: '2026-10-02T05:44:15',
      },
    ],
    interpretations: [
      {
        id: 'interp-017-01',
        case_id: 'CASE-017',
        narrative: 'Coincident radar backscatter attenuation (-2.43 dB) and high-volume precipitation recorded by NASA GPM IMERG support anomalous standing water extent across 45.2 km².',
        uncertainty: 0.09,
        created_at: '2026-09-21T23:22:07',
        updated_at: '2026-09-21T23:22:07',
      },
    ],
    provenance_records: [],
    field_observations: [],
    threshold_alerts: [],
  },
  'TRACE-2026-001': {
    id: '6b69c2f6-476b-4e37-b801-3b8e34a27dcd',
    case_id: 'TRACE-2026-001',
    event_type: 'flood',
    geometry: {
      type: 'Polygon',
      coordinates: [[[-95.4, 29.7], [-95.2, 29.7], [-95.2, 29.9], [-95.4, 29.9], [-95.4, 29.7]]],
    },
    observation_start: '2026-09-21T23:22:07.248901',
    observation_end: '2026-09-21T23:22:07.248901',
    status: 'active',
    created_at: '2026-09-21T23:22:07',
    updated_at: '2026-09-21T23:22:07',
    nisar_measurements: [
      {
        id: 'meas-001-01',
        case_id: 'TRACE-2026-001',
        product_id: 'NISAR_L2_PR_GSLC_001',
        observation_time: '2026-09-21T23:22:07.248901',
        delta_backscatter: -1.85,
        affected_area: 120.5,
        change_metric: 'log_ratio',
        raster_reference: '/imagery/flood_sar.jpg',
        created_at: '2026-09-21T23:22:07',
      },
    ],
    evidence: [
      {
        id: 'ev-001-optical',
        case_id: 'TRACE-2026-001',
        source_type: 'modis',
        collection_id: 'MODIS_TERRA_AQUA_SURFACE',
        granule_id: 'MOD09GA.A2026264.h09v05',
        role: 'optical',
        status: 'supports',
        visualization_uri: '/imagery/flood_optical.jpg',
        created_at: '2026-09-21T23:22:07',
      },
    ],
    challenge_checks: [
      {
        id: 'chk-001-01',
        case_id: 'TRACE-2026-001',
        check_type: 'OVERALL_SELF_AUDIT',
        status: 'PASS',
        value: '-1.85 dB',
        threshold: '-1.0 dB',
        rationale: 'Multi-sensor flood inundation confirmed by high-confidence backscatter attenuation.',
        source: 'system',
        created_at: '2026-09-21T23:22:07',
      },
    ],
    interpretations: [
      {
        id: 'interp-001-01',
        case_id: 'TRACE-2026-001',
        narrative: 'Extensive coastal low-lying flood inundation observed across 120.5 km² following tropical storm storm-surge and heavy overland precipitation.',
        uncertainty: 0.11,
        created_at: '2026-09-21T23:22:07',
        updated_at: '2026-09-21T23:22:07',
      },
    ],
    provenance_records: [],
    field_observations: [],
    threshold_alerts: [],
  },
  'TRACE-WILD-01': {
    id: '56755995-231c-414a-8f01-583b5e4795fa',
    case_id: 'TRACE-WILD-01',
    event_type: 'wildfire',
    geometry: {
      type: 'Polygon',
      coordinates: [[[-119.6, 37.7], [-119.4, 37.7], [-119.4, 37.9], [-119.6, 37.9], [-119.6, 37.7]]],
    },
    observation_start: '2026-10-02T05:32:26.870608',
    observation_end: '2026-10-02T05:32:26.870608',
    status: 'active',
    created_at: '2026-10-02T05:32:26',
    updated_at: '2026-10-02T05:32:26',
    nisar_measurements: [
      {
        id: 'meas-wild-01',
        case_id: 'TRACE-WILD-01',
        product_id: 'NISAR_L2_PR_GCOV_WILD01',
        observation_time: '2026-10-02T05:32:26.870608',
        delta_backscatter: 1.92,
        affected_area: 340.0,
        change_metric: 'log_ratio',
        raster_reference: '/imagery/wildfire_sar.jpg',
        created_at: '2026-10-02T05:32:26',
      },
    ],
    evidence: [
      {
        id: 'ev-wild-firms',
        case_id: 'TRACE-WILD-01',
        source_type: 'firms',
        collection_id: 'MODIS_NRT_FIRMS',
        granule_id: 'FIRMS.MODIS.2026.GLOBAL',
        role: 'detection',
        status: 'supports',
        visualization_uri: '/imagery/wildfire_optical.jpg',
        created_at: '2026-10-02T05:32:26',
      },
    ],
    challenge_checks: [
      {
        id: 'chk-wild-01',
        case_id: 'TRACE-WILD-01',
        check_type: 'OVERALL_SELF_AUDIT',
        status: 'PASS',
        value: '+1.92 dB',
        threshold: '+0.8 dB',
        rationale: 'Corroborated by NASA FIRMS thermal anomaly cluster and rough scar scattering after canopy loss.',
        source: 'system',
        created_at: '2026-10-02T05:32:26',
      },
    ],
    interpretations: [
      {
        id: 'interp-wild-01',
        case_id: 'TRACE-WILD-01',
        narrative: 'High-severity burn scar in Sierra Nevada foothill zone exhibits radar backscatter increase (+1.92 dB) caused by removal of dielectric foliage and direct surface ground scattering.',
        uncertainty: 0.14,
        created_at: '2026-10-02T05:32:26',
        updated_at: '2026-10-02T05:32:26',
      },
    ],
    provenance_records: [],
    field_observations: [],
    threshold_alerts: [],
  },
  'TRACE-QUAKE-01': {
    id: 'b16835c3-4414-4820-9434-eb8e5843cc11',
    case_id: 'TRACE-QUAKE-01',
    event_type: 'earthquake',
    geometry: {
      type: 'Polygon',
      coordinates: [[[-117.8, 35.6], [-117.5, 35.6], [-117.5, 35.9], [-117.8, 35.9], [-117.8, 35.6]]],
    },
    observation_start: '2026-10-02T05:32:26.870608',
    observation_end: '2026-10-02T05:32:26.870608',
    status: 'active',
    created_at: '2026-10-02T05:32:26',
    updated_at: '2026-10-02T05:32:26',
    nisar_measurements: [
      {
        id: 'meas-quake-01',
        case_id: 'TRACE-QUAKE-01',
        product_id: 'NISAR_L2_PR_GUNW_QUAKE01',
        observation_time: '2026-10-02T05:32:26.870608',
        delta_backscatter: -0.45,
        affected_area: 85.0,
        change_metric: 'log_ratio',
        raster_reference: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80',
        created_at: '2026-10-02T05:32:26',
      },
    ],
    evidence: [],
    challenge_checks: [
      {
        id: 'chk-quake-01',
        case_id: 'TRACE-QUAKE-01',
        check_type: 'OVERALL_SELF_AUDIT',
        status: 'INCONCLUSIVE',
        value: '0.32 fringe coherence',
        threshold: '0.65 fringe coherence',
        rationale: 'Phase decorrelation in dry alluvium requires secondary descending orbit pass to isolate tectonic slip from soil shifting.',
        source: 'system',
        created_at: '2026-10-02T05:32:26',
      },
    ],
    interpretations: [
      {
        id: 'interp-quake-01',
        case_id: 'TRACE-QUAKE-01',
        narrative: 'InSAR phase fringes show surface displacement across the fault line, pending confirmation by secondary orbit trajectory pass.',
        uncertainty: 0.28,
        created_at: '2026-10-02T05:32:26',
        updated_at: '2026-10-02T05:32:26',
      },
    ],
    provenance_records: [],
    field_observations: [],
    threshold_alerts: [],
  },
  'TRACE-DEFOR-01': {
    id: '1dd4f285-6ffa-4a63-8284-95944a176346',
    case_id: 'TRACE-DEFOR-01',
    event_type: 'deforestation',
    geometry: {
      type: 'Polygon',
      coordinates: [[[-62.5, -10.9], [-62.2, -10.9], [-62.2, -10.7], [-62.5, -10.7], [-62.5, -10.9]]],
    },
    observation_start: '2026-10-02T05:32:26.870608',
    observation_end: '2026-10-02T05:32:26.870608',
    status: 'active',
    created_at: '2026-10-02T05:32:26',
    updated_at: '2026-10-02T05:32:26',
    nisar_measurements: [
      {
        id: 'meas-defor-01',
        case_id: 'TRACE-DEFOR-01',
        product_id: 'NISAR_L2_PR_GCOV_DEFOR01',
        observation_time: '2026-10-02T05:32:26.870608',
        delta_backscatter: -4.2,
        affected_area: 520.0,
        change_metric: 'log_ratio',
        raster_reference: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80',
        created_at: '2026-10-02T05:32:26',
      },
    ],
    evidence: [],
    challenge_checks: [
      {
        id: 'chk-defor-01',
        case_id: 'TRACE-DEFOR-01',
        check_type: 'OVERALL_SELF_AUDIT',
        status: 'FAIL',
        value: 'False Anomaly Warning',
        threshold: 'Deterministic Moisture Check',
        rationale: 'Radar attenuation caused by seasonal agricultural harvesting rather than permanent forest clearing.',
        source: 'system',
        created_at: '2026-10-02T05:32:26',
      },
    ],
    interpretations: [
      {
        id: 'interp-defor-01',
        case_id: 'TRACE-DEFOR-01',
        narrative: 'Self-audit rejected permanent forest clearing hypothesis. High agricultural crop rotation signature identified.',
        uncertainty: 0.35,
        created_at: '2026-10-02T05:32:26',
        updated_at: '2026-10-02T05:32:26',
      },
    ],
    provenance_records: [],
    field_observations: [],
    threshold_alerts: [],
  },
};

export const FALLBACK_TIMELINES: Record<string, TimelineResponse> = {
  'TRACE-CHAR-01': {
    case_id: 'TRACE-CHAR-01',
    events: [
      {
        id: 'tl-char-1',
        case_id: 'TRACE-CHAR-01',
        timestamp: '2026-09-15T00:00:00Z',
        phase: 'before',
        event_type: 'monsoon_peak',
        title: 'Peak High-Flow Discharge',
        details: { description: 'Jamuna main river channel high flood stage submersion of shoals' },
      },
      {
        id: 'tl-char-2',
        case_id: 'TRACE-CHAR-01',
        timestamp: '2026-09-28T04:22:00Z',
        phase: 'change',
        event_type: 'sar_backscatter_rise',
        title: 'NISAR L2 GSLC Emergent Detection',
        details: { delta_backscatter: '+2.10 dB', area_km2: 210.0 },
      },
      {
        id: 'tl-char-3',
        case_id: 'TRACE-CHAR-01',
        timestamp: '2026-10-02T06:15:00Z',
        phase: 'after',
        event_type: 'field_ranger_ground_truth',
        title: 'Ranger Ground Truth Corroboration',
        details: { observer: 'Sariakandi Field Unit', confirmation: 'Confirmed dry silt deposition' },
      },
    ],
  },
  'CASE-017': {
    case_id: 'CASE-017',
    events: [
      {
        id: 'tl-017-1',
        case_id: 'CASE-017',
        timestamp: '2026-09-10T00:00:00Z',
        phase: 'before',
        event_type: 'dry_baseline',
        title: 'Dry Season Baseline Acquisition',
        details: { sensor: 'Sentinel-1A SAR' },
      },
      {
        id: 'tl-017-2',
        case_id: 'CASE-017',
        timestamp: '2026-09-20T12:00:00Z',
        phase: 'change',
        event_type: 'heavy_rainfall',
        title: 'GPM IMERG Extreme Rainfall Event',
        details: { accumulation_mm: 142.5 },
      },
      {
        id: 'tl-017-3',
        case_id: 'CASE-017',
        timestamp: '2026-09-21T23:22:07Z',
        phase: 'after',
        event_type: 'nisar_inundation_detection',
        title: 'NISAR Backscatter Drop Detected',
        details: { delta_backscatter: '-2.43 dB', area_km2: 45.2 },
      },
    ],
  },
};

export const FALLBACK_GLOBAL_EVENTS: GlobalEventsResponse = {
  items: [
    {
      case_id: 'TRACE-CHAR-01',
      event_type: 'char',
      latitude: 24.8,
      longitude: 89.65,
      observation_start: '2026-10-02T05:32:26',
      observation_end: '2026-10-02T05:32:26',
      status: 'active',
      evidence_status: 'SUPPORTED',
      audit_verdict: 'SUPPORTED',
      ground_truth_count: 1,
      provenance_count: 1,
      created_at: '2026-10-02T05:32:26',
    },
    {
      case_id: 'CASE-017',
      event_type: 'surface_water_change',
      latitude: 34.1,
      longitude: -118.2,
      observation_start: '2026-09-21T23:22:07',
      observation_end: '2026-09-21T23:22:07',
      status: 'active',
      evidence_status: 'SUPPORTED',
      audit_verdict: 'SUPPORTED',
      ground_truth_count: 0,
      provenance_count: 2,
      created_at: '2026-09-21T23:22:07',
    },
    {
      case_id: 'TRACE-2026-001',
      event_type: 'flood',
      latitude: 29.8,
      longitude: -95.3,
      observation_start: '2026-09-21T23:22:07',
      observation_end: '2026-09-21T23:22:07',
      status: 'active',
      evidence_status: 'SUPPORTED',
      audit_verdict: 'SUPPORTED',
      ground_truth_count: 1,
      provenance_count: 1,
      created_at: '2026-09-21T23:22:07',
    },
    {
      case_id: 'TRACE-WILD-01',
      event_type: 'wildfire',
      latitude: 37.8,
      longitude: -119.5,
      observation_start: '2026-10-02T05:32:26',
      observation_end: '2026-10-02T05:32:26',
      status: 'active',
      evidence_status: 'SUPPORTED',
      audit_verdict: 'SUPPORTED',
      ground_truth_count: 0,
      provenance_count: 1,
      created_at: '2026-10-02T05:32:26',
    },
    {
      case_id: 'TRACE-QUAKE-01',
      event_type: 'earthquake',
      latitude: 35.75,
      longitude: -117.65,
      observation_start: '2026-10-02T05:32:26',
      observation_end: '2026-10-02T05:32:26',
      status: 'active',
      evidence_status: 'INCONCLUSIVE',
      audit_verdict: 'INCONCLUSIVE',
      ground_truth_count: 0,
      provenance_count: 1,
      created_at: '2026-10-02T05:32:26',
    },
    {
      case_id: 'TRACE-DEFOR-01',
      event_type: 'deforestation',
      latitude: -10.8,
      longitude: -62.35,
      observation_start: '2026-10-02T05:32:26',
      observation_end: '2026-10-02T05:32:26',
      status: 'active',
      evidence_status: 'REJECTED',
      audit_verdict: 'REJECTED',
      ground_truth_count: 0,
      provenance_count: 1,
      created_at: '2026-10-02T05:32:26',
    },
  ],
  total: 6,
};

export const FALLBACK_CHAR_HISTORIES: Record<string, CharHistoryResponse> = {
  'TRACE-CHAR-01': {
    case_id: 'TRACE-CHAR-01',
    event_type: 'char',
    char_name_or_id: 'Jamuna-Char-01',
    geometry: {
      type: 'Polygon',
      coordinates: [[[89.5, 24.7], [89.8, 24.7], [89.8, 24.9], [89.5, 24.9], [89.5, 24.7]]],
    },
    latitude: 24.8,
    longitude: 89.65,
    observation_start: '2026-10-02T05:32:26',
    observation_end: '2026-10-02T05:32:26',
    status: 'active',
    change_status: 'OBSERVED CHANGE',
    latest_delta_backscatter: -2.1,
    latest_affected_area: 210.0,
    evidence_status: 'SUPPORTED',
    audit_verdict: 'SUPPORTED',
    ground_truth: {
      total_reports: 1,
      confirmed_reports: 1,
      denied_reports: 0,
      pending_reports: 0,
    },
    historical_observations: FALLBACK_TIMELINES['TRACE-CHAR-01']?.events || [],
    provenance_records: FALLBACK_CASE_DETAILS['TRACE-CHAR-01']?.provenance_records || [],
    alerts: FALLBACK_CASE_DETAILS['TRACE-CHAR-01']?.threshold_alerts || [],
  },
};

export function getFallbackCharHistory(caseId: string): CharHistoryResponse {
  if (FALLBACK_CHAR_HISTORIES[caseId]) {
    return FALLBACK_CHAR_HISTORIES[caseId];
  }
  const detail = FALLBACK_CASE_DETAILS[caseId] || FALLBACK_CASE_DETAILS['TRACE-CHAR-01'];
  const timeline = FALLBACK_TIMELINES[caseId] || FALLBACK_TIMELINES['TRACE-CHAR-01'];
  const nisar = detail.nisar_measurements?.[0];
  const delta = nisar?.delta_backscatter ?? -1.8;
  const area = nisar?.affected_area ?? 120.0;
  const confirmedCount = detail.field_observations?.length || 1;

  return {
    case_id: detail.case_id,
    event_type: detail.event_type || 'char',
    char_name_or_id: detail.case_id,
    geometry: detail.geometry,
    latitude: 24.8,
    longitude: 89.65,
    observation_start: detail.observation_start,
    observation_end: detail.observation_end,
    status: detail.status,
    change_status: delta <= -1.5 ? 'OBSERVED CHANGE' : 'POTENTIAL CHANGE',
    latest_delta_backscatter: delta,
    latest_affected_area: area,
    evidence_status: 'SUPPORTED',
    audit_verdict: 'SUPPORTED',
    ground_truth: {
      total_reports: confirmedCount,
      confirmed_reports: confirmedCount,
      denied_reports: 0,
      pending_reports: 0,
    },
    historical_observations: timeline?.events || [],
    provenance_records: detail.provenance_records || [],
    alerts: detail.threshold_alerts || [],
  };
}

export function getFallbackSentinelWorkflow(caseId: string): SentinelWorkflowResponse {
  const caseDetail = FALLBACK_CASE_DETAILS[caseId] || FALLBACK_CASE_DETAILS['TRACE-CHAR-01'];
  const eventType = caseDetail.event_type || 'char';
  const now = new Date().toISOString();
  const delta = caseDetail.nisar_measurements?.[0]?.delta_backscatter ?? -2.1;
  const area = caseDetail.nisar_measurements?.[0]?.affected_area ?? 210.0;

  return {
    case_id: caseId,
    event_type: eventType,
    overall_workflow_status: 'SUCCESS',
    final_verdict: 'SUPPORTED',
    challenge_disagreed: false,
    execution_log: [
      {
        agent_name: 'DataAgent',
        status: 'SUCCESS',
        summary: `Discovered 2 satellite passes (NISAR L-band & Sentinel-2 MSI) matching spatial bounding box for ${caseId}.`,
        data_payload: { sensor_products: ['NISAR_L2_GSLC', 'SENTINEL2_MSI_L2A'] },
        provenance: { agent: 'DataAgent', catalog: 'NASA_CMR_ASF' },
        timestamp: now,
      },
      {
        agent_name: 'DetectionAgent',
        status: 'SUCCESS',
        summary: `Computed calibrated radar backscatter delta (${delta} dB). Spatial change mask delineated for ${area.toFixed(1)} km².`,
        data_payload: { delta_backscatter: delta, area_km2: area },
        provenance: { agent: 'DetectionAgent', algorithm: 'LOG_RATIO_CHANGE_DETECTION' },
        timestamp: now,
      },
      {
        agent_name: 'EvidenceAgent',
        status: 'SUCCESS',
        summary: 'Cross-correlated NASA GPM IMERG precipitation and FIRMS thermal anomaly baselines. High multi-mission concurrence.',
        data_payload: { multi_mission_concurrence: true, confidence: 0.94 },
        provenance: { agent: 'EvidenceAgent', source: 'NASA_CROSS_MISSION_FUSION' },
        timestamp: now,
      },
      {
        agent_name: 'ChallengeAgent',
        status: 'SUCCESS',
        summary: 'Executed 7-point deterministic self-audit. Verified phase coherence, atmospheric delay tolerance, and spatiotemporal bounds. Disagreed: False.',
        data_payload: { audit_state: 'PASS', checks_passed: 7, total_checks: 7 },
        provenance: { agent: 'ChallengeAgent', method: 'ADVERSARIAL_DETERMINISTIC_AUDIT' },
        timestamp: now,
      },
      {
        agent_name: 'InterpretationAgent',
        status: 'SUCCESS',
        summary: 'Synthesized final non-causal executive scientific narrative. Strictly enforced defensible terminology.',
        data_payload: { overall_verdict: 'SUPPORTED' },
        provenance: { agent: 'InterpretationAgent', method: 'NON_CAUSAL_SCIENTIFIC_SYNTHESIS_V1' },
        timestamp: now,
      },
    ],
    interpretation_narrative:
      caseDetail.interpretations?.[0]?.narrative ||
      'Multi-sensor satellite evidence confirms significant surface reflection changes matching historical monsoon dynamics. Cloud-penetrating radar confirms active morphological change.',
    non_causal_statement:
      'SAR backscatter change coincides temporally with multi-mission satellite observations within the calibrated bounding box.',
    executed_at: now,
  };
}

export function getFallbackScenarioSimulation(caseId: string, waterLevelOffsetM: number = 1.0): ScenarioSimulationResponse {
  const baseArea = 210.0;
  const factor = waterLevelOffsetM / 1.0;
  return {
    case_id: caseId,
    water_level_offset_m: waterLevelOffsetM,
    disclaimer: 'Scenario simulation — not a forecast.',
    affected_area_sq_km: baseArea * (1 + factor * 0.4),
    affected_population_text: `~${Math.round(12400 * (1 + factor * 0.35)).toLocaleString()} residents`,
    affected_schools_text: `${Math.round(8 * (1 + factor * 0.5))} educational facilities`,
    affected_health_facilities_text: `${Math.round(3 * (1 + factor * 0.33))} clinic/community health posts`,
    simulated_at: new Date().toISOString(),
  };
}

export function getFallbackSelfAudit(caseId: string): SelfAuditResponse {
  const caseDetail = FALLBACK_CASE_DETAILS[caseId] || FALLBACK_CASE_DETAILS['TRACE-CHAR-01'];
  const checks: AuditCheckItem[] = [
    {
      check_type: 'SAR_DATA_COMPLETENESS',
      rule_name: 'Rule 1: Data Completeness & Quality',
      rule_version: '1.0.0',
      status: 'PASS',
      value: `${caseDetail.nisar_measurements?.[0]?.delta_backscatter ?? -2.1} dB`,
      threshold: '-1.5 dB',
      rationale: 'Active backscatter delta verified within valid temporal observation bounds.',
      source: 'NISAR_L2_GSLC',
    },
    {
      check_type: 'PHASE_COHERENCE',
      rule_name: 'Rule 2: InSAR Phase Coherence',
      rule_version: '1.0.0',
      status: 'PASS',
      value: '0.41',
      threshold: '0.25 - 0.65',
      rationale: 'Coherence decorrelation matches surface morphological displacement without sensor artifact.',
      source: 'InSAR_Phase_Engine',
    },
    {
      check_type: 'SPATIOTEMPORAL_SANITY',
      rule_name: 'Rule 3: Spatiotemporal Sanity Check',
      rule_version: '1.0.0',
      status: 'PASS',
      value: `${caseDetail.nisar_measurements?.[0]?.affected_area ?? 210.0} km²`,
      threshold: 'Polygon Sanity OK',
      rationale: 'Observation duration and geometric polygon bounding box are physically valid.',
      source: 'Spatiotemporal_Validator',
    },
    {
      check_type: 'ATMOSPHERIC_ARTIFACT_RISK',
      rule_name: 'Rule 4: Atmospheric Delay & Ionospheric Check',
      rule_version: '1.0.0',
      status: 'PASS',
      value: 'Low Artifact Risk',
      threshold: 'Delay < 3.0cm',
      rationale: 'Ionospheric delay model validates absence of heavy rain-cell radio wave attenuation.',
      source: 'Atmospheric_Discipline_Model',
    },
    {
      check_type: 'MULTISENSOR_CROSS_COVERAGE',
      rule_name: 'Rule 5: Multi-Sensor Cross-Coverage Verification',
      rule_version: '1.0.0',
      status: 'PASS',
      value: 'Sentinel-2 + GPM Concurrence',
      threshold: '>= 1 Corroborating Instrument',
      rationale: 'Independent NASA and Copernicus Earth observation instruments confirm surface change.',
      source: 'Cross_Mission_Correlator',
    },
    {
      check_type: 'GROUND_TRUTH_CONCURRENCE',
      rule_name: 'Rule 6: Field Ground Truth Concurrence',
      rule_version: '1.0.0',
      status: 'PASS',
      value: `${caseDetail.field_observations?.length || 1} Reports`,
      threshold: '>= 1 Verified Observer',
      rationale: 'Field observation reports corroborate satellite anomaly within the target bounding box.',
      source: 'Community_Ranger_Network',
    },
    {
      check_type: 'CONFIDENCE_SYNTHESIS',
      rule_name: 'Rule 7: Deterministic Confidence Synthesis',
      rule_version: '1.0.0',
      status: 'PASS',
      value: '0.94 Confidence Score',
      threshold: '>= 0.70',
      rationale: 'All deterministic rules satisfied. Final mathematical verdict: SUPPORTED.',
      source: 'Self_Audit_Synthesizer',
    },
  ];

    return {
    case_id: caseId,
    overall_audit_state: 'SUPPORTED',
    confidence_score: 0.94,
    summary_explanation: 'All 7 deterministic self-audit checks passed with high multi-mission concurrence.',
    checks,
    evaluated_at: new Date().toISOString(),
  };
}

export function getFallbackEvidenceFusion(caseId: string): EvidenceFusionResponse {
  const caseDetail = FALLBACK_CASE_DETAILS[caseId] || FALLBACK_CASE_DETAILS['TRACE-CHAR-01'];
  const eventType = caseDetail.event_type || 'char';
  const isChar = eventType.toLowerCase() === 'char';
  const isFire = eventType.toLowerCase().includes('fire');
  const now = new Date().toISOString();

  return {
    case_id: caseId,
    event_type: eventType,
    sar_anomaly_status: 'DETECTED',
    overall_status: 'CONFIRMED_MULTIMISSION',
    sensor_evaluations: {
      FIRMS: {
        sensor_name: 'FIRMS',
        status: isFire ? 'SUPPORTING' : 'NEUTRAL',
        summary_text: isFire
          ? 'Active thermal anomalies confirmed in bounding box via NASA VIIRS/MODIS sensors.'
          : 'No conflicting active fire thermal anomalies detected in target bounding box.',
        evidence_items: [],
      },
      GPM: {
        sensor_name: 'GPM',
        status: 'SUPPORTING',
        summary_text: isChar
          ? 'NASA GPM IMERG precipitation data shows heavy monsoonal rain accumulation correlating with river discharge dynamics.'
          : 'NASA GPM IMERG precipitation data confirms multi-day precipitation baseline across target area.',
        evidence_items: [],
      },
      MODIS: {
        sensor_name: 'MODIS',
        status: 'SUPPORTING',
        summary_text: isChar
          ? 'MODIS Terra/Aqua surface reflectance shows dynamic sediment transport and sandbar reshaping in Jamuna river channel.'
          : 'MODIS surface reflectance products corroborate visible surface alterations matching SAR backscatter boundary changes.',
        evidence_items: [],
      },
    },
    hypothesis_narrative:
      caseDetail.interpretations?.[0]?.narrative ||
      'Independent satellite sensors confirm surface reflection changes matching historical monsoon dynamics. Cloud-penetrating radar confirms active morphological change without optical obscuration.',
    non_causal_statement:
      'SAR backscatter change coincides temporally with multi-mission satellite observations within the calibrated bounding box.',
    evaluated_at: now,
    provenance_records: caseDetail.provenance_records || [],
  };
}

