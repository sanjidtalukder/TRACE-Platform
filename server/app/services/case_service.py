from datetime import datetime, timezone
from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.repositories.case_repository import CaseRepository
from app.utils.geo import shape_to_geojson, extract_centroid
from app.schemas.case import (
    CaseListItem,
    PaginatedCasesResponse,
    CaseDetailResponse,
    NisarMeasurementResponse,
    EvidenceResponse,
    ChallengeCheckResponse,
    InterpretationResponse,
    ProvenanceResponse,
    FieldObservationResponse,
    FieldObservationCreate,
    TimelineResponse,
    TimelineEventItem,
    ThresholdAlertCreate,
    ThresholdAlertUpdate,
    ThresholdAlertResponse,
    GlobalEventItem,
    GlobalEventsResponse,
    GroundTruthAggregation,
    CharHistoryResponse,
)



class CaseService:
    """
    Business logic layer assembling investigation cases, converting PostGIS geometries into GeoJSON,
    and structuring temporal timeline responses.
    """

    @staticmethod
    def list_cases(db: Session, page: int = 1, page_size: int = 20) -> PaginatedCasesResponse:
        items, total = CaseRepository.get_cases(db, page=page, page_size=page_size)
        case_list = [
            CaseListItem(
                id=c.id,
                case_id=c.case_id,
                event_type=c.event_type,
                geometry=shape_to_geojson(c.geometry),
                observation_start=c.observation_start,
                observation_end=c.observation_end,
                status=c.status,
                created_at=c.created_at,
                updated_at=c.updated_at,
            )
            for c in items
        ]
        return PaginatedCasesResponse(
            items=case_list,
            page=page,
            page_size=page_size,
            total=total,
        )

    @staticmethod
    def get_case_detail(db: Session, case_id: str) -> CaseDetailResponse:
        CaseService.evaluate_alerts_for_case(db, case_id)
        case = CaseRepository.get_case_by_case_id(db, case_id)
        if not case:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Case with ID '{case_id}' not found",
            )

        return CaseDetailResponse(
            id=case.id,
            case_id=case.case_id,
            event_type=case.event_type,
            geometry=shape_to_geojson(case.geometry),
            observation_start=case.observation_start,
            observation_end=case.observation_end,
            status=case.status,
            created_at=case.created_at,
            updated_at=case.updated_at,
            nisar_measurements=[
                NisarMeasurementResponse(
                    id=m.id,
                    case_id=m.case_id,
                    product_id=m.product_id,
                    observation_time=m.observation_time,
                    delta_backscatter=m.delta_backscatter,
                    affected_area=m.affected_area,
                    spatial_extent=shape_to_geojson(m.spatial_extent),
                    change_metric=m.change_metric,
                    raster_reference=m.raster_reference,
                    created_at=m.created_at,
                )
                for m in case.nisar_measurements
            ],
            evidence=[
                EvidenceResponse(
                    id=e.id,
                    case_id=e.case_id,
                    source_type=e.source_type,
                    collection_id=e.collection_id,
                    granule_id=e.granule_id,
                    time_start=e.time_start,
                    time_end=e.time_end,
                    spatial_extent=shape_to_geojson(e.spatial_extent),
                    role=e.role,
                    status=e.status,
                    visualization_uri=e.visualization_uri,
                    created_at=e.created_at,
                )
                for e in case.evidence
            ],
            challenge_checks=[
                ChallengeCheckResponse(
                    id=cc.id,
                    case_id=cc.case_id,
                    check_type=cc.check_type,
                    status=cc.status,
                    value=cc.value,
                    threshold=cc.threshold,
                    rationale=cc.rationale,
                    source=cc.source,
                    created_at=cc.created_at,
                )
                for cc in case.challenge_checks
            ],
            interpretations=[
                InterpretationResponse(
                    id=i.id,
                    case_id=i.case_id,
                    narrative=i.narrative,
                    uncertainty=i.uncertainty,
                    created_at=i.created_at,
                    updated_at=i.updated_at,
                )
                for i in case.interpretations
            ],
            provenance_records=[
                ProvenanceResponse(
                    id=p.id,
                    case_id=p.case_id,
                    evidence_id=p.evidence_id,
                    collection_id=p.collection_id,
                    granule_id=p.granule_id,
                    product_id=p.product_id,
                    acquisition_time=p.acquisition_time,
                    processing_method=p.processing_method,
                    calculation_method=p.calculation_method,
                    source_reference=p.source_reference,
                    created_at=p.created_at,
                )
                for p in case.provenance_records
            ],
            field_observations=[
                FieldObservationResponse(
                    id=fo.id,
                    case_id=fo.case_id,
                    photo_reference=fo.photo_reference,
                    note=fo.note,
                    observed_at=fo.observed_at,
                    location=shape_to_geojson(fo.location),
                    source_type=getattr(fo, "source_type", "human_observation") or "human_observation",
                    source="HUMAN_OBSERVATION",
                    created_at=fo.created_at,
                )
                for fo in case.field_observations
            ],
            threshold_alerts=[
                ThresholdAlertResponse(
                    id=ta.id,
                    case_id=ta.case_id,
                    metric_name=ta.metric_name,
                    threshold_value=ta.threshold_value,
                    comparison=ta.comparison,
                    is_active=ta.is_active,
                    triggered_state=ta.triggered_state,
                    last_evaluated_val=ta.last_evaluated_val,
                    last_triggered_at=ta.last_triggered_at,
                    created_at=ta.created_at,
                    updated_at=ta.updated_at,
                )
                for ta in case.threshold_alerts
            ],
        )


    @staticmethod
    def get_evidence(db: Session, case_id: str) -> List[EvidenceResponse]:
        evidence_list = CaseRepository.get_evidence_for_case(db, case_id)
        if evidence_list is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Case with ID '{case_id}' not found",
            )
        return [
            EvidenceResponse(
                id=e.id,
                case_id=e.case_id,
                source_type=e.source_type,
                collection_id=e.collection_id,
                granule_id=e.granule_id,
                time_start=e.time_start,
                time_end=e.time_end,
                spatial_extent=shape_to_geojson(e.spatial_extent),
                role=e.role,
                status=e.status,
                visualization_uri=e.visualization_uri,
                created_at=e.created_at,
            )
            for e in evidence_list
        ]

    @staticmethod
    def get_timeline(db: Session, case_id: str) -> TimelineResponse:
        case = CaseRepository.get_case_by_case_id(db, case_id)
        if not case:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Case with ID '{case_id}' not found",
            )

        events: List[TimelineEventItem] = []

        # 1. Observation Window Start (BEFORE phase)
        events.append(
            TimelineEventItem(
                id=f"evt-start-{case.id[:8]}",
                case_id=case.case_id,
                timestamp=case.observation_start,
                phase="before",
                event_type="observation_start",
                title="Baseline Observation Window Start",
                details={"event_type": case.event_type},
            )
        )

        # 2. NISAR Measurements (CHANGE phase)
        for m in case.nisar_measurements:
            phase = "change" if case.observation_start <= m.observation_time <= case.observation_end else "after" if m.observation_time > case.observation_end else "before"
            events.append(
                TimelineEventItem(
                    id=m.id,
                    case_id=m.case_id,
                    timestamp=m.observation_time,
                    phase=phase,
                    event_type="nisar_measurement",
                    title=f"NISAR Pass ({m.product_id})",
                    details={
                        "delta_backscatter": m.delta_backscatter,
                        "affected_area": m.affected_area,
                        "change_metric": m.change_metric,
                    },
                )
            )

        # 3. Independent Evidence
        for e in case.evidence:
            if e.time_start:
                phase = "change" if case.observation_start <= e.time_start <= case.observation_end else "after" if e.time_start > case.observation_end else "before"
                events.append(
                    TimelineEventItem(
                        id=e.id,
                        case_id=e.case_id,
                        timestamp=e.time_start,
                        phase=phase,
                        event_type="evidence_observation",
                        title=f"{e.source_type.upper()} Evidence Acquired ({e.collection_id or 'Data'})",
                        details={"status": e.status, "role": e.role},
                    )
                )

        # 4. Field Observations
        for fo in case.field_observations:
            phase = "after" if fo.observed_at > case.observation_end else "change" if fo.observed_at >= case.observation_start else "before"
            events.append(
                TimelineEventItem(
                    id=fo.id,
                    case_id=fo.case_id,
                    timestamp=fo.observed_at,
                    phase=phase,
                    event_type="field_observation",
                    title="Ground Field Observation Recorded",
                    details={"note": fo.note, "photo_reference": fo.photo_reference},
                )
            )

        # 5. Observation Window End (AFTER phase)
        events.append(
            TimelineEventItem(
                id=f"evt-end-{case.id[:8]}",
                case_id=case.case_id,
                timestamp=case.observation_end,
                phase="after",
                event_type="observation_end",
                title="Observation Window Close",
                details={"status": case.status},
            )
        )

        # Sort events chronologically
        events.sort(key=lambda x: x.timestamp)

        return TimelineResponse(case_id=case.case_id, events=events)

    @staticmethod
    def get_provenance(db: Session, case_id: str, evidence_id: str) -> ProvenanceResponse:
        case = CaseRepository.get_case_by_case_id(db, case_id)
        if not case:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Case with ID '{case_id}' not found",
            )

        prov = CaseRepository.get_provenance_for_evidence(db, case_id, evidence_id)
        if not prov:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Provenance record for evidence '{evidence_id}' in case '{case_id}' not found",
            )

        return ProvenanceResponse(
            id=prov.id,
            case_id=prov.case_id,
            evidence_id=prov.evidence_id,
            collection_id=prov.collection_id,
            granule_id=prov.granule_id,
            product_id=prov.product_id,
            acquisition_time=prov.acquisition_time,
            processing_method=prov.processing_method,
            calculation_method=prov.calculation_method,
            source_reference=prov.source_reference,
            created_at=prov.created_at,
        )

    @staticmethod
    def get_challenge_checks(db: Session, case_id: str) -> List[ChallengeCheckResponse]:
        checks = CaseRepository.get_challenge_checks_for_case(db, case_id)
        if checks is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Case with ID '{case_id}' not found",
            )
        return [
            ChallengeCheckResponse(
                id=cc.id,
                case_id=cc.case_id,
                check_type=cc.check_type,
                status=cc.status,
                value=cc.value,
                threshold=cc.threshold,
                rationale=cc.rationale,
                source=cc.source,
                created_at=cc.created_at,
            )
            for cc in checks
        ]

    @staticmethod
    def create_field_observation(
        db: Session, case_id: str, payload: FieldObservationCreate
    ) -> FieldObservationResponse:
        obs = CaseRepository.create_field_observation(
            db=db,
            case_id=case_id,
            photo_reference=payload.photo_reference,
            note=payload.note,
            observed_at=payload.observed_at,
            latitude=payload.latitude,
            longitude=payload.longitude,
            source_type=payload.source_type or "human_observation",
            user_id=payload.user_id or "community_sentinel_anon",
        )
        if not obs:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Case with ID '{case_id}' not found",
            )

        # Closed-Loop Confidence Pipeline: Re-evaluate cross-mission evidence and self-audit upon receiving ground truth
        try:
            CaseService.evaluate_evidence_fusion(db=db, case_id=case_id)
            CaseService.evaluate_self_audit(db=db, case_id=case_id)
        except Exception as exc:
            pass

        return FieldObservationResponse(
            id=obs.id,
            case_id=obs.case_id,
            user_id=getattr(obs, "user_id", "community_sentinel_anon") or "community_sentinel_anon",
            photo_reference=obs.photo_reference,
            note=obs.note,
            observed_at=obs.observed_at,
            location=shape_to_geojson(obs.location),
            source_type=getattr(obs, "source_type", "human_observation") or "human_observation",
            source="HUMAN_OBSERVATION" if (getattr(obs, "source_type", "") == "human_observation") else "COMMUNITY_OBSERVATION",
            verification_state=getattr(obs, "verification_state", "PENDING") or "PENDING",
            sentinel_tier=getattr(obs, "sentinel_tier", "ACTIVE_REPORTER") or "ACTIVE_REPORTER",
            created_at=obs.created_at,
        )


    @staticmethod
    def evaluate_alerts_for_case(db: Session, case_id: str):
        case = CaseRepository.get_case_by_case_id(db, case_id)
        if not case or not case.threshold_alerts:
            return

        latest_nisar = case.nisar_measurements[0] if case.nisar_measurements else None
        if not latest_nisar:
            return

        linked_evidence = None
        if case.evidence:
            for ev in case.evidence:
                if ev.source_type in ["NISAR", "SAR"] or getattr(ev, "evidence_type", None) == "sar_detection":
                    linked_evidence = ev
                    break

        latest_audit = case.challenge_checks[0] if case.challenge_checks else None
        audit_verdict = getattr(latest_audit, "verdict", getattr(latest_audit, "value", "UNAVAILABLE")) or "UNAVAILABLE"

        now = datetime.now(timezone.utc)
        for alert in case.threshold_alerts:
            if not alert.is_active:
                continue

            val: Optional[float] = None
            if alert.metric_name == "delta_backscatter":
                val = latest_nisar.delta_backscatter
            elif alert.metric_name == "affected_area":
                val = latest_nisar.affected_area

            if val is None:
                continue

            crossed = False
            if alert.comparison == "less_than":
                crossed = val <= alert.threshold_value
            elif alert.comparison == "greater_than":
                crossed = val >= alert.threshold_value
            elif alert.comparison == "abs_greater_than":
                crossed = abs(val) >= abs(alert.threshold_value)

            if crossed:
                if audit_verdict == "SUPPORTED":
                    derived_alert_state = "OBSERVED CHANGE"
                    safe_msg = f"TRACE detected an observed change near your selected location (metric: {alert.metric_name} = {val})."
                elif audit_verdict == "INCONCLUSIVE":
                    derived_alert_state = "INCONCLUSIVE"
                    safe_msg = f"TRACE detected a potential change (metric: {alert.metric_name} = {val}). Evidence is currently inconclusive."
                elif audit_verdict == "REJECTED":
                    derived_alert_state = "REJECTED"
                    safe_msg = f"Potential anomaly detected (metric: {alert.metric_name} = {val}), but scientific audit rejected the finding."
                else:
                    derived_alert_state = "POTENTIAL CHANGE"
                    safe_msg = f"TRACE detected a potential change (metric: {alert.metric_name} = {val})."

                CaseRepository.update_alert(
                    db,
                    alert.id,
                    triggered_state="TRIGGERED",
                    alert_state=derived_alert_state,
                    safe_message=safe_msg,
                    evidence_id=linked_evidence.id if linked_evidence else alert.evidence_id,
                    last_evaluated_val=val,
                    last_triggered_at=now if alert.triggered_state != "TRIGGERED" else alert.last_triggered_at,
                )
            else:
                derived_alert_state = "UNAVAILABLE" if audit_verdict == "UNAVAILABLE" else "INCONCLUSIVE"
                safe_msg = f"No threshold crossing detected for {alert.metric_name} (value: {val})."
                CaseRepository.update_alert(
                    db,
                    alert.id,
                    triggered_state="ARMED",
                    alert_state=derived_alert_state,
                    safe_message=safe_msg,
                    evidence_id=linked_evidence.id if linked_evidence else alert.evidence_id,
                    last_evaluated_val=val,
                )

    @staticmethod
    def get_alerts_for_case(db: Session, case_id: str) -> List[ThresholdAlertResponse]:
        CaseService.evaluate_alerts_for_case(db, case_id)
        alerts = CaseRepository.get_alerts_for_case(db, case_id)
        if alerts is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Case with ID '{case_id}' not found",
            )
        return [
            ThresholdAlertResponse(
                id=a.id,
                case_id=a.case_id,
                evidence_id=a.evidence_id,
                metric_name=a.metric_name,
                threshold_value=a.threshold_value,
                comparison=a.comparison,
                is_active=a.is_active,
                triggered_state=a.triggered_state,
                alert_state=getattr(a, "alert_state", "UNAVAILABLE") or "UNAVAILABLE",
                acknowledgement_status=getattr(a, "acknowledgement_status", "UNREAD") or "UNREAD",
                safe_message=getattr(a, "safe_message", None),
                last_evaluated_val=a.last_evaluated_val,
                last_triggered_at=a.last_triggered_at,
                created_at=a.created_at,
                updated_at=a.updated_at,
            )
            for a in alerts
        ]

    @staticmethod
    def create_or_update_alert(
        db: Session, case_id: str, payload: ThresholdAlertCreate
    ) -> ThresholdAlertResponse:
        alert = CaseRepository.create_or_update_alert(
            db=db,
            case_id=case_id,
            metric_name=payload.metric_name,
            threshold_value=payload.threshold_value,
            comparison=payload.comparison,
            is_active=payload.is_active,
        )
        if not alert:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Case with ID '{case_id}' not found",
            )

        CaseService.evaluate_alerts_for_case(db, case_id)
        alerts = CaseRepository.get_alerts_for_case(db, case_id)
        saved = next((a for a in (alerts or []) if a.id == alert.id), alert)

        return ThresholdAlertResponse(
            id=saved.id,
            case_id=saved.case_id,
            evidence_id=saved.evidence_id,
            metric_name=saved.metric_name,
            threshold_value=saved.threshold_value,
            comparison=saved.comparison,
            is_active=saved.is_active,
            triggered_state=saved.triggered_state,
            alert_state=getattr(saved, "alert_state", "UNAVAILABLE") or "UNAVAILABLE",
            acknowledgement_status=getattr(saved, "acknowledgement_status", "UNREAD") or "UNREAD",
            safe_message=getattr(saved, "safe_message", None),
            last_evaluated_val=saved.last_evaluated_val,
            last_triggered_at=saved.last_triggered_at,
            created_at=saved.created_at,
            updated_at=saved.updated_at,
        )

    @staticmethod
    def update_alert(
        db: Session, alert_id: str, payload: ThresholdAlertUpdate
    ) -> ThresholdAlertResponse:
        alert = CaseRepository.update_alert(
            db=db,
            alert_id=alert_id,
            metric_name=payload.metric_name,
            threshold_value=payload.threshold_value,
            comparison=payload.comparison,
            is_active=payload.is_active,
            triggered_state=payload.triggered_state,
            acknowledgement_status=payload.acknowledgement_status,
        )
        if not alert:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Alert with ID '{alert_id}' not found",
            )

        CaseService.evaluate_alerts_for_case(db, alert.case_id)
        alerts = CaseRepository.get_alerts_for_case(db, alert.case_id)
        saved = next((a for a in (alerts or []) if a.id == alert_id), alert)

        return ThresholdAlertResponse(
            id=saved.id,
            case_id=saved.case_id,
            evidence_id=saved.evidence_id,
            metric_name=saved.metric_name,
            threshold_value=saved.threshold_value,
            comparison=saved.comparison,
            is_active=saved.is_active,
            triggered_state=saved.triggered_state,
            alert_state=getattr(saved, "alert_state", "UNAVAILABLE") or "UNAVAILABLE",
            acknowledgement_status=getattr(saved, "acknowledgement_status", "UNREAD") or "UNREAD",
            safe_message=getattr(saved, "safe_message", None),
            last_evaluated_val=saved.last_evaluated_val,
            last_triggered_at=saved.last_triggered_at,
            created_at=saved.created_at,
            updated_at=saved.updated_at,
        )

    @staticmethod
    def acknowledge_alert(db: Session, case_id: str, alert_id: str, status_val: str = "ACKNOWLEDGED") -> ThresholdAlertResponse:
        alert = CaseRepository.get_alert_by_id(db, alert_id)
        if not alert or alert.case_id != case_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Alert '{alert_id}' for case '{case_id}' not found",
            )
        updated = CaseRepository.update_alert(db, alert_id, acknowledgement_status=status_val)
        return ThresholdAlertResponse(
            id=updated.id,
            case_id=updated.case_id,
            evidence_id=updated.evidence_id,
            metric_name=updated.metric_name,
            threshold_value=updated.threshold_value,
            comparison=updated.comparison,
            is_active=updated.is_active,
            triggered_state=updated.triggered_state,
            alert_state=getattr(updated, "alert_state", "UNAVAILABLE") or "UNAVAILABLE",
            acknowledgement_status=getattr(updated, "acknowledgement_status", "UNREAD") or "UNREAD",
            safe_message=getattr(updated, "safe_message", None),
            last_evaluated_val=updated.last_evaluated_val,
            last_triggered_at=updated.last_triggered_at,
            created_at=updated.created_at,
            updated_at=updated.updated_at,
        )

    @staticmethod
    def get_community_reports(db: Session, case_id: str):
        case = CaseRepository.get_case_by_case_id(db, case_id)
        if not case:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Case with ID '{case_id}' not found",
            )
        obs_list = case.field_observations or []
        total = len(obs_list)
        confirmed = sum(1 for o in obs_list if getattr(o, "verification_state", None) in ["USER_CONFIRMED", "CROSS_CHECKED", "SUPPORTED"])
        denied = sum(1 for o in obs_list if getattr(o, "verification_state", None) == "REJECTED")
        pending = sum(1 for o in obs_list if getattr(o, "verification_state", None) == "PENDING" or getattr(o, "verification_state", None) is None)

        aggregation = GroundTruthAggregation(
            total_reports=total,
            confirmed_reports=confirmed,
            denied_reports=denied,
            pending_reports=pending,
        )

        formatted_reports = [
            FieldObservationResponse(
                id=o.id,
                case_id=o.case_id,
                user_id=getattr(o, "user_id", "community_sentinel_anon") or "community_sentinel_anon",
                photo_reference=o.photo_reference,
                note=o.note,
                observed_at=o.observed_at,
                location=shape_to_geojson(o.location),
                source_type=getattr(o, "source_type", "community_sentinel") or "community_sentinel",
                source="COMMUNITY_OBSERVATION",
                verification_state=getattr(o, "verification_state", "PENDING") or "PENDING",
                sentinel_tier=getattr(o, "sentinel_tier", "ACTIVE_REPORTER") or "ACTIVE_REPORTER",
                created_at=o.created_at,
            )
            for o in obs_list
        ]

        return {
            "case_id": case_id,
            "aggregation": aggregation,
            "reports": formatted_reports,
            "message": "No community reports yet." if total == 0 else f"{total} community reports found."
        }

    @staticmethod
    def evaluate_evidence_fusion(db: Session, case_id: str):
        """
        Executes Phase 4.1 Cross-Mission Evidence Engine for a TRACE investigation case.
        Normalizes independent satellite observations, computes spatiotemporal correlations,
        performs evidence fusion, and persists evidence lineage & non-causal interpretation records.
        """
        from app.services.evidence_engine import CrossMissionEvidenceEngine

        case = CaseRepository.get_case_by_case_id(db, case_id)
        if not case:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Case with ID '{case_id}' not found",
            )

        # Extract bbox from geometry
        geom_dict = shape_to_geojson(case.geometry)
        bbox_str = None
        if geom_dict and "coordinates" in geom_dict and geom_dict.get("type") == "Polygon":
            try:
                poly_pts = geom_dict["coordinates"][0]
                lons = [p[0] for p in poly_pts]
                lats = [p[1] for p in poly_pts]
                bbox_str = f"{min(lons):.4f},{min(lats):.4f},{max(lons):.4f},{max(lats):.4f}"
            except Exception:
                pass

        # Extract NISAR anomaly indicators
        latest_nisar = case.nisar_measurements[0] if case.nisar_measurements else None
        delta_backscatter = latest_nisar.delta_backscatter if latest_nisar else None
        affected_area = latest_nisar.affected_area if latest_nisar else None

        engine = CrossMissionEvidenceEngine()
        fusion_result = engine.evaluate_case_evidence(
            case_id=case_id,
            event_type=case.event_type,
            bbox=bbox_str,
            observation_start=case.observation_start,
            observation_end=case.observation_end,
            sar_backscatter_delta=delta_backscatter,
            sar_affected_area=affected_area,
        )

        # Persist Interpretation
        uncertainty_val = 0.15 if fusion_result.overall_status == "CONFIRMED_MULTIMISSION" else 0.45
        CaseRepository.save_interpretation_record(
            db=db,
            case_id=case_id,
            narrative=fusion_result.hypothesis_narrative,
            uncertainty=uncertainty_val,
        )

        # Persist Challenge Checks
        for sensor_key, sensor_eval in fusion_result.sensor_evaluations.items():
            CaseRepository.save_challenge_check(
                db=db,
                case_id=case_id,
                check_type=f"{sensor_key.upper()}_CROSS_CORRELATION",
                status="pass" if sensor_eval.status == "SUPPORTING" else ("inconclusive" if sensor_eval.status == "UNAVAILABLE" else "pass"),
                value=sensor_eval.status,
                rationale=sensor_eval.summary_text,
                source=f"NASA_{sensor_key.upper()}",
            )

        # Persist Evidence and Provenance Records
        for sensor_key, sensor_eval in fusion_result.sensor_evaluations.items():
            for item in sensor_eval.evidence_items:
                ev_record = CaseRepository.save_evidence_record(
                    db=db,
                    case_id=case_id,
                    source_type=item.source.lower(),
                    collection_id=item.collection_id,
                    granule_id=item.granule_id,
                    time_start=item.time_start,
                    time_end=item.time_end,
                    role="supporting_cross_mission" if item.relevance == "SUPPORTING" else "baseline_context",
                    status="evaluated",
                    visualization_uri=item.visualization_uri,
                )
                CaseRepository.save_provenance_record(
                    db=db,
                    case_id=case_id,
                    evidence_id=ev_record.id,
                    collection_id=item.collection_id,
                    granule_id=item.granule_id,
                    product_id=item.product_id,
                    acquisition_time=item.observation_time,
                    processing_method=item.method,
                    calculation_method="SPATIAL_TEMPORAL_CROSS_CORRELATION_V1",
                    source_reference=item.provenance.get("source"),
                )

        return fusion_result.model_dump()

    @staticmethod
    def evaluate_self_audit(db: Session, case_id: str):
        """
        Executes Phase 4.2 Challenge the Finding / Self-Audit Engine for a TRACE investigation case.
        Runs 7 deterministic scientific validation checks and persists audit lineage records.
        """
        from app.services.self_audit_engine import SelfAuditEngine

        case = CaseRepository.get_case_by_case_id(db, case_id)
        if not case:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Case with ID '{case_id}' not found",
            )

        # Extract bbox from geometry
        geom_dict = shape_to_geojson(case.geometry)
        bbox_str = None
        if geom_dict and "coordinates" in geom_dict and geom_dict.get("type") == "Polygon":
            try:
                poly_pts = geom_dict["coordinates"][0]
                lons = [p[0] for p in poly_pts]
                lats = [p[1] for p in poly_pts]
                bbox_str = f"{min(lons):.4f},{min(lats):.4f},{max(lons):.4f},{max(lats):.4f}"
            except Exception:
                pass

        latest_nisar = case.nisar_measurements[0] if case.nisar_measurements else None
        delta_backscatter = latest_nisar.delta_backscatter if latest_nisar else None
        affected_area = latest_nisar.affected_area if latest_nisar else None
        change_metric = latest_nisar.change_metric if latest_nisar else None

        evidence_list = [
            {
                "id": ev.id,
                "source_type": ev.source_type,
                "collection_id": ev.collection_id,
                "status": ev.status,
            }
            for ev in case.evidence
        ]

        field_obs_list = [
            {
                "id": fo.id,
                "note": fo.note,
                "observed_at": fo.observed_at,
            }
            for fo in case.field_observations
        ]

        engine = SelfAuditEngine()
        audit_result = engine.evaluate_audit(
            case_id=case_id,
            event_type=case.event_type,
            observation_start=case.observation_start,
            observation_end=case.observation_end,
            bbox=bbox_str,
            delta_backscatter=delta_backscatter,
            affected_area=affected_area,
            change_metric=change_metric,
            evidence_records=evidence_list,
            field_observations=field_obs_list,
        )

        # Persist audit check records into ChallengeCheck DB table
        for check in audit_result.checks:
            CaseRepository.save_challenge_check(
                db=db,
                case_id=case_id,
                check_type=check.check_type,
                status=check.status.lower(),
                value=check.value,
                threshold=check.threshold,
                rationale=check.rationale,
                source=check.source,
            )

        # Persist Provenance record for audit evaluation
        CaseRepository.save_provenance_record(
            db=db,
            case_id=case_id,
            collection_id="TRACE_SELF_AUDIT_ENGINE",
            product_id="DETERMINISTIC_SELF_AUDIT_V1",
            acquisition_time=audit_result.evaluated_at,
            processing_method="DETERMINISTIC_SELF_AUDIT_ENGINE_V1",
            calculation_method="MULTI_RULE_QUALITATIVE_HYPOTHESIS_CHECK",
            source_reference=f"AUDIT_STATE:{audit_result.overall_audit_state}_CONFIDENCE:{audit_result.confidence_score:.2f}",
        )

        return audit_result.model_dump()

    @staticmethod
    def simulate_scenario(db: Session, case_id: str, water_level_offset_m: float):
        """
        Executes Phase 4.5 Scenario Simulator for a TRACE investigation case.
        Calculates elevation/geospatial water level impact scenarios (+0.5m, +1.0m, +2.0m).
        """
        from app.services.scenario_simulator import ScenarioSimulatorEngine

        case = CaseRepository.get_case_by_case_id(db, case_id)
        if not case:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Case with ID '{case_id}' not found",
            )

        latest_nisar = case.nisar_measurements[0] if case.nisar_measurements else None
        baseline_area = latest_nisar.affected_area if latest_nisar else None
        has_geom = case.geometry is not None

        result = ScenarioSimulatorEngine.simulate_water_level(
            case_id=case_id,
            water_level_offset_m=water_level_offset_m,
            baseline_area_sq_km=baseline_area,
            has_geometry=has_geom,
        )

        # Persist Provenance for simulation
        CaseRepository.save_provenance_record(
            db=db,
            case_id=case_id,
            collection_id="TRACE_SCENARIO_SIMULATOR",
            product_id=f"WATER_LEVEL_SIM_{water_level_offset_m:.1f}M",
            acquisition_time=result.simulated_at,
            processing_method="GEOSPATIAL_ELEVATION_SLOPE_SCALING_V1",
            calculation_method="ELEVATION_INUNDATION_AREA_MODEL",
            source_reference=f"DISCLAIMER:{result.disclaimer}",
        )

        return result.model_dump()

    @staticmethod
    def run_sentinel_agents(db: Session, case_id: str):
        """
        Executes Phase 4.6 Autonomous Sentinel Agents workflow for a TRACE investigation case.
        Orchestrates 5 specialized agents: DataAgent -> DetectionAgent -> EvidenceAgent -> ChallengeAgent -> InterpretationAgent.
        """
        from app.services.sentinel_agents import AutonomousSentinelWorkflow

        case = CaseRepository.get_case_by_case_id(db, case_id)
        if not case:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Case with ID '{case_id}' not found",
            )

        geom_dict = shape_to_geojson(case.geometry)
        bbox_str = None
        if geom_dict and "coordinates" in geom_dict and geom_dict.get("type") == "Polygon":
            try:
                poly_pts = geom_dict["coordinates"][0]
                lons = [p[0] for p in poly_pts]
                lats = [p[1] for p in poly_pts]
                bbox_str = f"{min(lons):.4f},{min(lats):.4f},{max(lons):.4f},{max(lats):.4f}"
            except Exception:
                pass

        latest_nisar = case.nisar_measurements[0] if case.nisar_measurements else None
        delta_backscatter = latest_nisar.delta_backscatter if latest_nisar else None
        affected_area = latest_nisar.affected_area if latest_nisar else None
        change_metric = latest_nisar.change_metric if latest_nisar else None

        evidence_list = [
            {
                "id": ev.id,
                "source_type": ev.source_type,
                "collection_id": ev.collection_id,
                "status": ev.status,
            }
            for ev in case.evidence
        ]

        field_obs_list = [
            {
                "id": fo.id,
                "note": fo.note,
                "observed_at": fo.observed_at,
            }
            for fo in case.field_observations
        ]

        workflow = AutonomousSentinelWorkflow()
        result = workflow.execute_workflow(
            case_id=case_id,
            event_type=case.event_type,
            observation_start=case.observation_start,
            observation_end=case.observation_end,
            bbox=bbox_str,
            delta_backscatter=delta_backscatter,
            affected_area=affected_area,
            change_metric=change_metric,
            evidence_records=evidence_list,
            field_observations=field_obs_list,
        )

        # Persist Agent Workflow Provenance Record
        CaseRepository.save_provenance_record(
            db=db,
            case_id=case_id,
            collection_id="TRACE_SENTINEL_AGENTS",
            product_id="AUTONOMOUS_SENTINEL_WORKFLOW_V1",
            acquisition_time=result.executed_at,
            processing_method="AGENTIC_INVESTIGATION_ORCHESTRATION_V1",
            calculation_method="DATA_DETECTION_EVIDENCE_CHALLENGE_INTERPRETATION_CHAIN",
            source_reference=f"VERDICT:{result.final_verdict}_DISAGREED:{result.challenge_disagreed}",
        )

        return result.model_dump()

    @staticmethod
    def get_global_events(
        db: Session,
        event_type: Optional[str] = None,
        audit_verdict: Optional[str] = None,
    ) -> GlobalEventsResponse:
        """
        Executes Phase 5.1 Global Pulse planetary case aggregator using REAL database cases.
        Returns mapped spatial coordinates, evidence fusion status, self-audit verdicts, and provenance counts.
        """
        all_cases = []
        page_idx = 1
        page_limit = 100
        while True:
            batch, db_total = CaseRepository.get_cases(db, page=page_idx, page_size=page_limit)
            if not batch:
                break
            all_cases.extend(batch)
            if len(all_cases) >= db_total or len(batch) < page_limit:
                break
            page_idx += 1

        global_items: List[GlobalEventItem] = []
        for c in all_cases:
            if event_type and event_type.strip().lower() not in c.event_type.lower():
                continue

            lat, lon = extract_centroid(c.geometry)

            # Determine self-audit verdict
            audit_state = "UNAVAILABLE"
            if c.challenge_checks:
                for cc in c.challenge_checks:
                    if cc.check_type in {"OVERALL_SELF_AUDIT", "DETERMINISTIC_SELF_AUDIT"}:
                        raw = cc.status.upper()
                        if raw in {"PASS", "SUPPORTED"}:
                            audit_state = "SUPPORTED"
                        elif raw in {"FAIL", "REJECTED"}:
                            audit_state = "REJECTED"
                        elif raw in {"INCONCLUSIVE", "WARNING"}:
                            audit_state = "INCONCLUSIVE"
                        else:
                            audit_state = raw
                        break
                if audit_state == "UNAVAILABLE" and len(c.challenge_checks) > 0:
                    has_fail = any(cc.status.upper() in {"FAIL", "REJECTED"} for cc in c.challenge_checks)
                    has_pass = any(cc.status.upper() in {"PASS", "SUPPORTED"} for cc in c.challenge_checks)
                    audit_state = "REJECTED" if has_fail else ("SUPPORTED" if has_pass else "INCONCLUSIVE")

            # Determine evidence fusion status
            evidence_state = "UNAVAILABLE"
            if c.evidence:
                has_supp = any(e.status.upper() in {"SUPPORTING", "SUPPORTS", "CONFIRMED_MULTIMISSION"} for e in c.evidence)
                has_contra = any(e.status.upper() in {"CONTRADICTORY", "CONTRADICTS"} for e in c.evidence)
                evidence_state = "CONTRADICTED" if has_contra else ("SUPPORTED" if has_supp else "INCONCLUSIVE")

            if audit_verdict:
                target_verdict = audit_verdict.strip().upper()
                if target_verdict == "PASS":
                    target_verdict = "SUPPORTED"
                elif target_verdict == "FAIL":
                    target_verdict = "REJECTED"
                if target_verdict != audit_state:
                    continue

            gt_count = len(c.field_observations) if c.field_observations else 0
            prov_count = len(c.provenance_records) if c.provenance_records else 0

            global_items.append(
                GlobalEventItem(
                    case_id=c.case_id,
                    event_type=c.event_type,
                    latitude=lat,
                    longitude=lon,
                    observation_start=c.observation_start,
                    observation_end=c.observation_end,
                    status=c.status,
                    evidence_status=evidence_state,
                    audit_verdict=audit_state,
                    ground_truth_count=gt_count,
                    provenance_count=prov_count,
                    created_at=c.created_at,
                )
            )

        return GlobalEventsResponse(items=global_items, total=len(global_items))

    @staticmethod
    def get_char_history(db: Session, case_id: str) -> CharHistoryResponse:
        """
        Executes Phase 5.1 Char Guardian river-island / char change inspection for a target case.
        Structures historical observations, ground truth report aggregations, threshold alerts, and provenance lineage.
        Enforces scientifically safe phrasing ('OBSERVED CHANGE' / 'Observed SAR change') without unverified erosion claims.
        """
        case = CaseRepository.get_case_by_case_id(db, case_id)
        if not case:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Case with ID '{case_id}' not found",
            )

        lat, lon = extract_centroid(case.geometry)
        geom_dict = shape_to_geojson(case.geometry)

        latest_nisar = case.nisar_measurements[0] if case.nisar_measurements else None
        delta_b = latest_nisar.delta_backscatter if latest_nisar else None
        area_val = latest_nisar.affected_area if latest_nisar else None

        # Scientifically safe change status (NO unsupported erosion claims)
        if delta_b is not None and delta_b <= -1.5:
            change_status = "OBSERVED CHANGE"
        elif delta_b is not None:
            change_status = "POTENTIAL CHANGE"
        elif case.evidence or case.challenge_checks:
            change_status = "INCONCLUSIVE"
        else:
            change_status = "UNAVAILABLE"

        audit_state = "UNAVAILABLE"
        if case.challenge_checks:
            for cc in case.challenge_checks:
                if cc.check_type in {"OVERALL_SELF_AUDIT", "DETERMINISTIC_SELF_AUDIT"}:
                    audit_state = cc.status.upper()
                    break
            if audit_state == "UNAVAILABLE" and len(case.challenge_checks) > 0:
                has_fail = any(cc.status.upper() in {"FAIL", "REJECTED"} for cc in case.challenge_checks)
                has_pass = any(cc.status.upper() in {"PASS", "SUPPORTED"} for cc in case.challenge_checks)
                audit_state = "REJECTED" if has_fail else ("SUPPORTED" if has_pass else "INCONCLUSIVE")

        evidence_state = "UNAVAILABLE"
        if case.evidence:
            has_supp = any(e.status.upper() in {"SUPPORTING", "SUPPORTS", "CONFIRMED_MULTIMISSION"} for e in case.evidence)
            has_contra = any(e.status.upper() in {"CONTRADICTORY", "CONTRADICTS"} for e in case.evidence)
            evidence_state = "CONTRADICTED" if has_contra else ("SUPPORTED" if has_supp else "INCONCLUSIVE")

        # Ground truth report aggregation based on structured verification_state
        tot_obs = len(case.field_observations) if case.field_observations else 0
        conf_obs = 0
        den_obs = 0
        pend_obs = 0
        for fo in (case.field_observations or []):
            v_state = (getattr(fo, "verification_state", None) or "").upper()
            if v_state in {"USER_CONFIRMED", "CROSS_CHECKED", "SUPPORTED"}:
                conf_obs += 1
            elif v_state in {"REJECTED", "DENIED"}:
                den_obs += 1
            else:
                pend_obs += 1

        gt_agg = GroundTruthAggregation(
            total_reports=tot_obs,
            confirmed_reports=conf_obs,
            denied_reports=den_obs,
            pending_reports=pend_obs,
        )

        timeline_res = CaseService.get_timeline(db, case_id)

        prov_res = [
            ProvenanceResponse(
                id=p.id,
                case_id=p.case_id,
                evidence_id=p.evidence_id,
                collection_id=p.collection_id,
                granule_id=p.granule_id,
                product_id=p.product_id,
                acquisition_time=p.acquisition_time,
                processing_method=p.processing_method,
                calculation_method=p.calculation_method,
                source_reference=p.source_reference,
                created_at=p.created_at,
            )
            for p in case.provenance_records
        ]

        alert_res = [
            ThresholdAlertResponse(
                id=ta.id,
                case_id=ta.case_id,
                evidence_id=ta.evidence_id,
                metric_name=ta.metric_name,
                threshold_value=ta.threshold_value,
                comparison=ta.comparison,
                is_active=ta.is_active,
                triggered_state=ta.triggered_state,
                alert_state=getattr(ta, "alert_state", "UNAVAILABLE") or "UNAVAILABLE",
                acknowledgement_status=getattr(ta, "acknowledgement_status", "UNREAD") or "UNREAD",
                safe_message=getattr(ta, "safe_message", None),
                last_evaluated_val=ta.last_evaluated_val,
                last_triggered_at=ta.last_triggered_at,
                created_at=ta.created_at,
                updated_at=ta.updated_at,
            )
            for ta in case.threshold_alerts
        ]

        return CharHistoryResponse(
            case_id=case.case_id,
            event_type=case.event_type,
            char_name_or_id=f"AOI-{case.case_id}",
            geometry=geom_dict,
            latitude=lat,
            longitude=lon,
            observation_start=case.observation_start,
            observation_end=case.observation_end,
            status=case.status,
            change_status=change_status,
            latest_delta_backscatter=delta_b,
            latest_affected_area=area_val,
            evidence_status=evidence_state,
            audit_verdict=audit_state,
            ground_truth=gt_agg,
            historical_observations=timeline_res.events,
            provenance_records=prov_res,
            alerts=alert_res,
        )





