import math
import logging
from typing import Optional, List, Dict, Any, Tuple
from datetime import datetime, timezone, timedelta
from pydantic import BaseModel, Field

from app.services.nasa.schemas import NASAObservation, GeoJSONGeometry
from app.services.nasa.firms import FirmsDiscoveryService, FIRMSSummary, haversine_distance_km
from app.services.nasa.gpm import GpmDiscoveryService
from app.services.nasa.modis import ModisDiscoveryService
from app.services.nasa.nisar import NisarDiscoveryService

logger = logging.getLogger("trace.evidence_engine")


# Disallowed causal terms that must NEVER be used in hypothesis generation
DISALLOWED_CAUSAL_TERMS = [
    "caused by",
    "definitively caused by",
    "triggered by",
    "proves that",
    "definitive cause",
    "direct proof",
]


class NormalizedEvidence(BaseModel):
    """
    Normalized internal evidence representation for cross-mission observations.
    """
    source: str  # "NISAR", "NASA_FIRMS", "NASA_GPM", "NASA_MODIS", "GROUND_OBSERVATION"
    product_id: str
    granule_id: Optional[str] = None
    collection_id: Optional[str] = None
    observation_time: datetime
    time_start: Optional[datetime] = None
    time_end: Optional[datetime] = None
    spatial_extent: Optional[Dict[str, Any]] = None
    measurement_values: Dict[str, Any] = Field(default_factory=dict)
    method: str
    relevance: str = "NEUTRAL"  # SUPPORTING | NOT_SUPPORTING | NEUTRAL | UNAVAILABLE
    spatial_relevance_score: float = 0.0  # 0.0 to 1.0
    temporal_correlation_score: float = 0.0  # 0.0 to 1.0
    data_quality: str = "VALIDATED"  # VALIDATED | NRT | ESTIMATED | UNAVAILABLE
    visualization_uri: Optional[str] = None
    provenance: Dict[str, Any] = Field(default_factory=dict)


class FusionSensorEvaluation(BaseModel):
    sensor_name: str
    status: str  # SUPPORTING | NOT_SUPPORTING | NEUTRAL | UNAVAILABLE
    summary_text: str
    evidence_items: List[NormalizedEvidence] = Field(default_factory=list)


class EvidenceFusionResult(BaseModel):
    case_id: str
    event_type: str
    sar_anomaly_status: str  # DETECTED | NOT_DETECTED | UNKNOWN
    overall_status: str  # CONFIRMED_MULTIMISSION | PARTIALLY_SUPPORTED | INCONCLUSIVE | CONTRADICTED
    sensor_evaluations: Dict[str, FusionSensorEvaluation] = Field(default_factory=dict)
    hypothesis_narrative: str
    non_causal_statement: str
    evaluated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    provenance_records: List[Dict[str, Any]] = Field(default_factory=list)


class SpatialCorrelationCalculator:
    """
    Computes spatial relevance between event AOI/center and independent observation locations.
    """

    @staticmethod
    def calculate_point_relevance(
        event_center: Tuple[float, float], obs_lat: float, obs_lon: float
    ) -> Tuple[float, float]:
        """
        Returns (distance_km, relevance_score [0.0 - 1.0]).
        """
        center_lat, center_lon = event_center
        dist_km = haversine_distance_km(center_lat, center_lon, obs_lat, obs_lon)
        if dist_km <= 10.0:
            score = 1.0
        elif dist_km <= 50.0:
            score = max(0.2, 1.0 - (dist_km - 10.0) / 50.0)
        elif dist_km <= 100.0:
            score = max(0.05, 0.2 - (dist_km - 50.0) / 250.0)
        else:
            score = 0.0
        return dist_km, round(score, 3)

    @staticmethod
    def parse_bbox(bbox_str: Optional[str]) -> Optional[Tuple[float, float, float, float]]:
        """
        Parses min_lon, min_lat, max_lon, max_lat from bounding box string.
        """
        if not bbox_str:
            return None
        try:
            parts = [float(x) for x in bbox_str.split(",")]
            if len(parts) == 4:
                return (parts[0], parts[1], parts[2], parts[3])
        except Exception:
            pass
        return None

    @staticmethod
    def bbox_center(bbox_str: Optional[str]) -> Tuple[float, float]:
        """
        Returns (center_lat, center_lon) for a bounding box string, defaulting to (0.0, 0.0).
        """
        parsed = SpatialCorrelationCalculator.parse_bbox(bbox_str)
        if parsed:
            min_lon, min_lat, max_lon, max_lat = parsed
            return ((min_lat + max_lat) / 2.0, (min_lon + max_lon) / 2.0)
        return (0.0, 0.0)


def ensure_utc(dt: datetime) -> datetime:
    if dt is None:
        return datetime.now(timezone.utc)
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)


class TemporalCorrelationCalculator:
    """
    Computes temporal overlap and proximity correlation scores using UTC datetime objects.
    Does NOT compare dates as plain strings.
    """

    @staticmethod
    def calculate_firms_temporal_score(
        event_start: datetime, event_end: datetime, fire_time: datetime
    ) -> float:
        """
        Calculates temporal correlation score for FIRMS fire observations relative to event window.
        Rule: Fire within [event_start - 7 days, event_end + 7 days] = 1.0.
        Within 14 days = 0.5. Beyond = 0.0.
        """
        e_start = ensure_utc(event_start)
        e_end = ensure_utc(event_end)
        f_time = ensure_utc(fire_time)

        margin = timedelta(days=7)
        window_start = e_start - margin
        window_end = e_end + margin

        if window_start <= f_time <= window_end:
            return 1.0
        
        diff_days = abs((f_time - e_start).total_seconds()) / 86400.0
        if diff_days <= 14.0:
            return 0.5
        return 0.0

    @staticmethod
    def calculate_gpm_temporal_score(
        event_start: datetime, obs_time: datetime
    ) -> float:
        """
        Calculates temporal score for GPM precipitation.
        Rule: Heavy rain within 72h prior to SAR detection is the primary trigger window (score=1.0).
        Within 7 days prior = 0.6. Outside = 0.0.
        """
        e_start = ensure_utc(event_start)
        o_time = ensure_utc(obs_time)

        diff_hours = (e_start - o_time).total_seconds() / 3600.0
        if -24.0 <= diff_hours <= 72.0:  # 72 hours before to 24 hours after event start
            return 1.0
        elif -48.0 <= diff_hours <= 168.0:  # Up to 7 days before
            return 0.6
        return 0.0

    @staticmethod
    def calculate_modis_temporal_score(
        event_start: datetime, obs_time: datetime
    ) -> float:
        """
        Calculates temporal score for MODIS land/NDVI observations.
        Rule: Within 30 days = 1.0. Outside = 0.3.
        """
        e_start = ensure_utc(event_start)
        o_time = ensure_utc(obs_time)

        diff_days = abs((e_start - o_time).total_seconds()) / 86400.0
        if diff_days <= 30.0:
            return 1.0
        elif diff_days <= 60.0:
            return 0.5
        return 0.2



class NonCausalHypothesisGenerator:
    """
    Generates evidence-backed hypotheses adhering strictly to non-causal correlation language.
    Rejects and replaces any unsupported causal statements.
    """

    @staticmethod
    def sanitize_text(text: str) -> str:
        """
        Replaces any accidental causal phrasing with scientific correlation phrasing.
        """
        sanitized = text
        for term in DISALLOWED_CAUSAL_TERMS:
            if term in sanitized.lower():
                sanitized = sanitized.replace(term, "is temporally consistent with")
                sanitized = sanitized.replace(term.capitalize(), "Is temporally consistent with")
        return sanitized

    @staticmethod
    def generate_narrative(
        event_type: str,
        overall_status: str,
        firms_eval: FusionSensorEvaluation,
        gpm_eval: FusionSensorEvaluation,
        modis_eval: FusionSensorEvaluation,
    ) -> Tuple[str, str]:
        """
        Generates (narrative_text, non_causal_statement).
        """
        supporting_missions = []
        unavailable_missions = []
        neutral_missions = []

        for eval_item in [firms_eval, gpm_eval, modis_eval]:
            if eval_item.status == "SUPPORTING":
                supporting_missions.append(eval_item.sensor_name)
            elif eval_item.status == "UNAVAILABLE":
                unavailable_missions.append(eval_item.sensor_name)
            elif eval_item.status == "NEUTRAL":
                neutral_missions.append(eval_item.sensor_name)

        if overall_status == "CONFIRMED_MULTIMISSION":
            narrative = (
                f"Observed SAR anomaly is temporally and spatially consistent with multiple independent "
                f"NASA Earth observation datasets ({', '.join(supporting_missions)})."
            )
            statement = (
                f"SAR change detection in target area is supported by co-occurring observations "
                f"from {', '.join(supporting_missions)}. Evidence indicates strong temporal correlation "
                f"with surface environmental changes."
            )
        elif overall_status == "PARTIALLY_SUPPORTED":
            narrative = (
                f"Observed SAR anomaly is supported by {', '.join(supporting_missions)} observations. "
            )
            if unavailable_missions:
                narrative += f"Additional independent sensors ({', '.join(unavailable_missions)}) were unavailable."
            statement = (
                f"SAR detection is consistent with independent data from {', '.join(supporting_missions)}. "
                f"Possible explanation of surface perturbation, though comprehensive multi-sensor confirmation is incomplete."
            )
        elif overall_status == "CONTRADICTED":
            narrative = (
                f"Observed SAR anomaly is not supported by independent sensors. Sensor observations contradict "
                f"the expected signature for a {event_type.lower()} event."
            )
            statement = (
                f"Independent NASA sensor observations do not support the {event_type.lower()} hypothesis "
                f"for the observed SAR anomaly."
            )
        else:  # INCONCLUSIVE
            narrative = (
                f"Insufficient independent evidence available to validate or contradict the SAR anomaly. "
            )
            if unavailable_missions:
                narrative += f"Sensor data for {', '.join(unavailable_missions)} was unavailable or unqueryable."
            statement = (
                f"Inconclusive: independent NASA sensor coverage was unavailable or returned neutral baseline "
                f"observations during the observation window."
            )

        sanitized_narrative = NonCausalHypothesisGenerator.sanitize_text(narrative)
        sanitized_statement = NonCausalHypothesisGenerator.sanitize_text(statement)
        return sanitized_narrative, sanitized_statement


class CrossMissionEvidenceEngine:
    """
    Core Phase 4.1 Cross-Mission Evidence Engine for TRACE.
    Executes cross-mission discovery, spatial/temporal normalization, evidence fusion, and hypothesis generation.
    """

    def __init__(
        self,
        firms_service: Optional[FirmsDiscoveryService] = None,
        gpm_service: Optional[GpmDiscoveryService] = None,
        modis_service: Optional[ModisDiscoveryService] = None,
        nisar_service: Optional[NisarDiscoveryService] = None,
    ):
        self.firms_service = firms_service or FirmsDiscoveryService()
        self.gpm_service = gpm_service or GpmDiscoveryService()
        self.modis_service = modis_service or ModisDiscoveryService()
        self.nisar_service = nisar_service or NisarDiscoveryService()

    def evaluate_case_evidence(
        self,
        case_id: str,
        event_type: str,
        bbox: Optional[str],
        observation_start: datetime,
        observation_end: datetime,
        sar_backscatter_delta: Optional[float] = None,
        sar_affected_area: Optional[float] = None,
    ) -> EvidenceFusionResult:
        """
        Evaluates cross-mission evidence for a TRACE case.
        """
        center_lat, center_lon = SpatialCorrelationCalculator.bbox_center(bbox)
        event_center = (center_lat, center_lon)

        # 1. SAR Anomaly Status Determination
        sar_anomaly_status = "UNKNOWN"
        if sar_backscatter_delta is not None or sar_affected_area is not None:
            if (sar_backscatter_delta and sar_backscatter_delta <= -1.5) or (sar_affected_area and sar_affected_area > 0.0):
                sar_anomaly_status = "DETECTED"
            else:
                sar_anomaly_status = "NOT_DETECTED"

        start_iso = observation_start.isoformat()
        end_iso = observation_end.isoformat()

        import concurrent.futures

        # 2. Query independent satellite sensors (FIRMS, GPM, MODIS) concurrently
        with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
            fut_firms = executor.submit(
                self.firms_service.get_firms_summary,
                bbox=bbox,
                start_date=start_iso,
                end_date=end_iso,
                event_center=event_center,
            )
            fut_gpm = executor.submit(
                self.gpm_service.discover_gpm_observations,
                bbox=bbox,
                start_date=start_iso,
                end_date=end_iso,
                page_size=10,
            )
            fut_modis = executor.submit(
                self.modis_service.discover_modis_observations,
                bbox=bbox,
                start_date=start_iso,
                end_date=end_iso,
                page_size=10,
            )

            try:
                firms_summary = fut_firms.result(timeout=3.0)
            except Exception as e:
                logger.warning(f"FIRMS query error: {e}")
                firms_summary = FIRMSSummary(status="UNAVAILABLE")

            try:
                gpm_items = fut_gpm.result(timeout=3.0)
            except Exception as e:
                logger.warning(f"GPM query error: {e}")
                gpm_items = []

            try:
                modis_items = fut_modis.result(timeout=3.0)
            except Exception as e:
                logger.warning(f"MODIS query error: {e}")
                modis_items = []



        normalized_firms_items: List[NormalizedEvidence] = []
        firms_status = "UNAVAILABLE"
        firms_summary_text = "NASA FIRMS fire observation service was unavailable."

        if firms_summary.status == "AVAILABLE":
            if firms_summary.total_fires > 0 and firms_summary.nearest_distance_km is not None:
                # Check spatial & temporal scores
                nearest_km = firms_summary.nearest_distance_km
                _, spatial_score = SpatialCorrelationCalculator.calculate_point_relevance(
                    event_center, center_lat, center_lon
                )
                
                # Check if any detection falls within temporal window
                temporal_score = 0.0
                for det in firms_summary.detections:
                    t_score = TemporalCorrelationCalculator.calculate_firms_temporal_score(
                        observation_start, observation_end, det.acq_datetime
                    )
                    if t_score > temporal_score:
                        temporal_score = t_score

                is_fire_event = event_type.upper() in {"WILDFIRE", "FIRE", "DEFORESTATION"}
                
                if spatial_score >= 0.2 and temporal_score >= 0.5:
                    if is_fire_event:
                        firms_status = "SUPPORTING"
                        firms_summary_text = (
                            f"Detected {firms_summary.total_fires} active fire thermal anomalies "
                            f"(nearest {nearest_km:.1f} km from center, max FRP {firms_summary.max_frp or 0.0:.1f} MW)."
                        )
                    else:
                        firms_status = "NOT_SUPPORTING" if event_type.upper() == "FLOOD" else "NEUTRAL"
                        firms_summary_text = f"Active fires detected ({firms_summary.total_fires}) near non-fire event area."
                else:
                    firms_status = "NEUTRAL"
                    firms_summary_text = f"Active fires detected ({firms_summary.total_fires}) outside primary spatiotemporal window."

                for det in firms_summary.detections[:5]:
                    d_km, s_score = SpatialCorrelationCalculator.calculate_point_relevance(
                        event_center, det.latitude, det.longitude
                    )
                    t_score = TemporalCorrelationCalculator.calculate_firms_temporal_score(
                        observation_start, observation_end, det.acq_datetime
                    )
                    normalized_firms_items.append(
                        NormalizedEvidence(
                            source="NASA_FIRMS",
                            product_id="VIIRS_NRT",
                            granule_id=f"FIRMS_{det.acq_datetime.strftime('%Y%m%d%H%M')}",
                            collection_id="FIRMS_ACTIVE_FIRE",
                            observation_time=det.acq_datetime,
                            time_start=det.acq_datetime,
                            time_end=det.acq_datetime,
                            spatial_extent={"latitude": det.latitude, "longitude": det.longitude},
                            measurement_values={
                                "brightness": det.brightness,
                                "frp": det.frp,
                                "confidence": det.confidence,
                                "distance_km": round(d_km, 2),
                            },
                            method="THERMAL_RADIANCE_DETECTION",
                            relevance=firms_status,
                            spatial_relevance_score=s_score,
                            temporal_correlation_score=t_score,
                            data_quality="NRT",
                            provenance={
                                "source": "NASA_FIRMS",
                                "satellite": det.satellite,
                                "instrument": det.instrument,
                            },
                        )
                    )
            else:
                firms_status = "NEUTRAL"
                firms_summary_text = "No active thermal fire anomalies detected in target area."

        firms_eval = FusionSensorEvaluation(
            sensor_name="FIRMS",
            status=firms_status,
            summary_text=firms_summary_text,
            evidence_items=normalized_firms_items,
        )

        # 3. Process GPM Observations
        normalized_gpm_items: List[NormalizedEvidence] = []
        gpm_status = "UNAVAILABLE"
        gpm_summary_text = "NASA GPM IMERG precipitation observation service was unavailable."

        if gpm_items:
            gpm_status = "NEUTRAL"
            gpm_summary_text = f"Discovered {len(gpm_items)} GPM IMERG precipitation granules in temporal window."
            is_rain_event = event_type.upper() in {"FLOOD", "LANDSLIDE", "STORM"}
            
            for obs in gpm_items:
                t_score = TemporalCorrelationCalculator.calculate_gpm_temporal_score(
                    observation_start, obs.observation_time
                )
                if t_score >= 0.6 and is_rain_event:
                    gpm_status = "SUPPORTING"
                    gpm_summary_text = f"GPM IMERG precipitation granule available ({obs.granule_id}) temporally co-occurring with SAR detection."

                normalized_gpm_items.append(
                    NormalizedEvidence(
                        source="NASA_GPM",
                        product_id="GPM_3IMERGDF",
                        granule_id=obs.granule_id,
                        collection_id=obs.collection_id,
                        observation_time=obs.observation_time,
                        time_start=obs.start_time,
                        time_end=obs.end_time,
                        spatial_extent=obs.spatial_extent.model_dump() if obs.spatial_extent else None,
                        measurement_values={"product_type": obs.product_type},
                        method="PASSIVE_MICROWAVE_IMERG",
                        relevance=gpm_status,
                        spatial_relevance_score=1.0 if obs.spatial_extent else 0.5,
                        temporal_correlation_score=t_score,
                        data_quality="VALIDATED",
                        visualization_uri=obs.visualization_uri,
                        provenance={
                            "source": "NASA_GPM",
                            "metadata_reference": obs.metadata_reference,
                        },
                    )
                )

        gpm_eval = FusionSensorEvaluation(
            sensor_name="GPM",
            status=gpm_status,
            summary_text=gpm_summary_text,
            evidence_items=normalized_gpm_items,
        )

        # 4. Process MODIS Observations
        normalized_modis_items: List[NormalizedEvidence] = []
        modis_status = "UNAVAILABLE"
        modis_summary_text = "NASA MODIS land surface observation service was unavailable."

        if modis_items:
            modis_status = "NEUTRAL"
            modis_summary_text = f"Discovered {len(modis_items)} MODIS surface context granules in temporal window."
            is_land_event = event_type.upper() in {"DEFORESTATION", "WILDFIRE", "LANDSLIDE"}

            for obs in modis_items:
                t_score = TemporalCorrelationCalculator.calculate_modis_temporal_score(
                    observation_start, obs.observation_time
                )
                if t_score >= 0.5 and is_land_event:
                    modis_status = "SUPPORTING"
                    modis_summary_text = f"MODIS land context granule available ({obs.granule_id}) providing surface baseline."

                normalized_modis_items.append(
                    NormalizedEvidence(
                        source="NASA_MODIS",
                        product_id=obs.product_id,
                        granule_id=obs.granule_id,
                        collection_id=obs.collection_id,
                        observation_time=obs.observation_time,
                        time_start=obs.start_time,
                        time_end=obs.end_time,
                        spatial_extent=obs.spatial_extent.model_dump() if obs.spatial_extent else None,
                        measurement_values={"product_type": obs.product_type},
                        method="OPTICAL_REFLECTANCE",
                        relevance=modis_status,
                        spatial_relevance_score=1.0 if obs.spatial_extent else 0.5,
                        temporal_correlation_score=t_score,
                        data_quality="VALIDATED",
                        visualization_uri=obs.visualization_uri,
                        provenance={
                            "source": "NASA_MODIS",
                            "metadata_reference": obs.metadata_reference,
                        },
                    )
                )

        modis_eval = FusionSensorEvaluation(
            sensor_name="MODIS",
            status=modis_status,
            summary_text=modis_summary_text,
            evidence_items=normalized_modis_items,
        )

        # 5. Deterministic Evidence Fusion Synthesis
        supporting_count = sum(
            1 for ev in [firms_eval, gpm_eval, modis_eval] if ev.status == "SUPPORTING"
        )
        contradicting_count = sum(
            1 for ev in [firms_eval, gpm_eval, modis_eval] if ev.status == "NOT_SUPPORTING"
        )

        if contradicting_count > 0:
            overall_status = "CONTRADICTED"
        elif supporting_count >= 2:
            overall_status = "CONFIRMED_MULTIMISSION"
        elif supporting_count == 1:
            overall_status = "PARTIALLY_SUPPORTED"
        else:
            overall_status = "INCONCLUSIVE"

        # 6. Generate Non-Causal Hypothesis and Narrative
        narrative, statement = NonCausalHypothesisGenerator.generate_narrative(
            event_type=event_type,
            overall_status=overall_status,
            firms_eval=firms_eval,
            gpm_eval=gpm_eval,
            modis_eval=modis_eval,
        )

        # 7. Collect Provenance Records
        provenance_records = []
        for eval_item in [firms_eval, gpm_eval, modis_eval]:
            for item in eval_item.evidence_items:
                provenance_records.append({
                    "source": item.source,
                    "product_id": item.product_id,
                    "granule_id": item.granule_id,
                    "acquisition_time": item.observation_time.isoformat() if item.observation_time else None,
                    "processing_method": "CROSS_MISSION_EVIDENCE_NORMALIZATION_V1",
                    "calculation_method": "HAVERSINE_SPATIAL_PROXIMITY_AND_DATETIME_WINDOW_INTERSECTION",
                    "source_reference": item.provenance.get("metadata_reference") or item.provenance.get("source"),
                    "generated_at": datetime.now(timezone.utc).isoformat(),
                })

        return EvidenceFusionResult(
            case_id=case_id,
            event_type=event_type,
            sar_anomaly_status=sar_anomaly_status,
            overall_status=overall_status,
            sensor_evaluations={
                "FIRMS": firms_eval,
                "GPM": gpm_eval,
                "MODIS": modis_eval,
            },
            hypothesis_narrative=narrative,
            non_causal_statement=statement,
            evaluated_at=datetime.now(timezone.utc),
            provenance_records=provenance_records,
        )
