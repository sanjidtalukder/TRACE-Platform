from typing import List, Tuple, Optional
from datetime import datetime, timezone
import logging
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import select, func
from geoalchemy2.elements import WKTElement
from app.models.case import (
    Case,
    Evidence,
    Provenance,
    FieldObservation,
    ChallengeCheck,
    Interpretation,
    ThresholdAlert,
)

logger = logging.getLogger(__name__)



class CaseRepository:
    """
    Data-access repository layer handling database queries for TRACE investigation cases.
    """

    @staticmethod
    def get_cases(db: Session, page: int = 1, page_size: int = 20) -> Tuple[List[Case], int]:
        total = db.scalar(select(func.count(Case.id))) or 0
        offset = (page - 1) * page_size
        stmt = (
            select(Case)
            .order_by(Case.created_at.desc())
            .offset(offset)
            .limit(page_size)
        )
        items = list(db.scalars(stmt).all())
        return items, total

    @staticmethod
    def get_case_by_case_id(db: Session, case_id: str) -> Optional[Case]:
        stmt = (
            select(Case)
            .where(Case.case_id == case_id)
            .options(
                joinedload(Case.nisar_measurements),
                joinedload(Case.evidence),
                joinedload(Case.challenge_checks),
                joinedload(Case.interpretations),
                joinedload(Case.provenance_records),
                joinedload(Case.field_observations),
                joinedload(Case.threshold_alerts),
            )
        )
        return db.scalars(stmt).unique().first()


    @staticmethod
    def get_evidence_for_case(db: Session, case_id: str) -> Optional[List[Evidence]]:
        # Verify case existence first
        case_exists = db.scalar(select(Case.id).where(Case.case_id == case_id))
        if not case_exists:
            return None
        stmt = select(Evidence).where(Evidence.case_id == case_id).order_by(Evidence.created_at.asc())
        return list(db.scalars(stmt).all())

    @staticmethod
    def get_provenance_for_evidence(db: Session, case_id: str, evidence_id: str) -> Optional[Provenance]:
        stmt = (
            select(Provenance)
            .where(Provenance.case_id == case_id, Provenance.evidence_id == evidence_id)
        )
        return db.scalars(stmt).first()

    @staticmethod
    def get_challenge_checks_for_case(db: Session, case_id: str) -> Optional[List[ChallengeCheck]]:
        case_exists = db.scalar(select(Case.id).where(Case.case_id == case_id))
        if not case_exists:
            return None
        stmt = select(ChallengeCheck).where(ChallengeCheck.case_id == case_id).order_by(ChallengeCheck.created_at.asc())
        return list(db.scalars(stmt).all())

    @staticmethod
    def create_field_observation(
        db: Session,
        case_id: str,
        photo_reference: Optional[str],
        note: Optional[str],
        observed_at: datetime,
        latitude: Optional[float] = None,
        longitude: Optional[float] = None,
        source_type: str = "community_sentinel",
        user_id: Optional[str] = "community_sentinel_anon",
        verification_state: str = "PENDING",
        sentinel_tier: str = "ACTIVE_REPORTER",
    ) -> Optional[FieldObservation]:
        case_exists = db.scalar(select(Case.id).where(Case.case_id == case_id))
        if not case_exists:
            return None

        # Idempotency check: prevent duplicate observation records if client retries after network drop
        stmt = select(FieldObservation).where(
            FieldObservation.case_id == case_id,
            FieldObservation.user_id == user_id,
            FieldObservation.note == note,
        )
        existing_list = db.scalars(stmt).all()
        for existing in existing_list:
            if existing.observed_at and observed_at:
                t1 = existing.observed_at.astimezone(timezone.utc).replace(tzinfo=None) if existing.observed_at.tzinfo else existing.observed_at
                t2 = observed_at.astimezone(timezone.utc).replace(tzinfo=None) if observed_at.tzinfo else observed_at
                if abs((t1 - t2).total_seconds()) < 5.0:
                    return existing

        wkt_loc = f"POINT({longitude} {latitude})" if (latitude is not None and longitude is not None) else None
        loc_element = WKTElement(wkt_loc, srid=4326) if wkt_loc else None

        field_obs = FieldObservation(
            case_id=case_id,
            user_id=user_id,
            photo_reference=photo_reference,
            note=note,
            observed_at=observed_at,
            location=loc_element,
            source_type=source_type,
            verification_state=verification_state,
            sentinel_tier=sentinel_tier,
        )
        db.add(field_obs)
        db.flush()

        # Create corresponding Evidence record for cross-mission evidence integration
        ev = Evidence(
            case_id=case_id,
            source_type=source_type,
            collection_id="COMMUNITY_SENTINEL_REPORT",
            granule_id=field_obs.id,
            time_start=observed_at,
            time_end=observed_at,
            role="ground_truth_community",
            status="evaluated",
            visualization_uri=photo_reference,
        )
        db.add(ev)

        db.commit()
        db.refresh(field_obs)
        return field_obs

    @staticmethod
    def get_alerts_for_case(db: Session, case_id: str) -> Optional[List[ThresholdAlert]]:
        case_exists = db.scalar(select(Case.id).where(Case.case_id == case_id))
        if not case_exists:
            return None
        stmt = (
            select(ThresholdAlert)
            .where(ThresholdAlert.case_id == case_id)
            .order_by(ThresholdAlert.created_at.desc())
        )
        return list(db.scalars(stmt).all())

    @staticmethod
    def create_or_update_alert(
        db: Session,
        case_id: str,
        metric_name: str,
        threshold_value: float,
        comparison: str = "less_than",
        is_active: bool = True,
    ) -> Optional[ThresholdAlert]:
        case_exists = db.scalar(select(Case.id).where(Case.case_id == case_id))
        if not case_exists:
            return None

        # Check if alert already exists for this case + metric
        stmt = select(ThresholdAlert).where(
            ThresholdAlert.case_id == case_id,
            ThresholdAlert.metric_name == metric_name,
        )
        existing = db.scalars(stmt).first()

        if existing:
            existing.threshold_value = threshold_value
            existing.comparison = comparison
            existing.is_active = is_active
            db.commit()
            db.refresh(existing)
            return existing
        else:
            alert = ThresholdAlert(
                case_id=case_id,
                metric_name=metric_name,
                threshold_value=threshold_value,
                comparison=comparison,
                is_active=is_active,
                triggered_state="ARMED",
            )
            db.add(alert)
            db.commit()
            db.refresh(alert)
            return alert

    @staticmethod
    def get_alert_by_id(db: Session, alert_id: str) -> Optional[ThresholdAlert]:
        stmt = select(ThresholdAlert).where(ThresholdAlert.id == alert_id)
        return db.scalars(stmt).first()

    @staticmethod
    def update_alert(
        db: Session,
        alert_id: str,
        metric_name: Optional[str] = None,
        threshold_value: Optional[float] = None,
        comparison: Optional[str] = None,
        is_active: Optional[bool] = None,
        triggered_state: Optional[str] = None,
        alert_state: Optional[str] = None,
        acknowledgement_status: Optional[str] = None,
        safe_message: Optional[str] = None,
        evidence_id: Optional[str] = None,
        last_evaluated_val: Optional[float] = None,
        last_triggered_at: Optional[datetime] = None,
    ) -> Optional[ThresholdAlert]:
        stmt = select(ThresholdAlert).where(ThresholdAlert.id == alert_id)
        alert = db.scalars(stmt).first()
        if not alert:
            return None

        if metric_name is not None:
            alert.metric_name = metric_name
        if threshold_value is not None:
            alert.threshold_value = threshold_value
        if comparison is not None:
            alert.comparison = comparison
        if is_active is not None:
            alert.is_active = is_active
        if triggered_state is not None:
            alert.triggered_state = triggered_state
        if alert_state is not None:
            alert.alert_state = alert_state
        if acknowledgement_status is not None:
            alert.acknowledgement_status = acknowledgement_status
        if safe_message is not None:
            alert.safe_message = safe_message
        if evidence_id is not None:
            alert.evidence_id = evidence_id
        if last_evaluated_val is not None:
            alert.last_evaluated_val = last_evaluated_val
        if last_triggered_at is not None:
            alert.last_triggered_at = last_triggered_at

        db.commit()
        db.refresh(alert)
        return alert

    @staticmethod
    def save_evidence_record(
        db: Session,
        case_id: str,
        source_type: str,
        collection_id: Optional[str] = None,
        granule_id: Optional[str] = None,
        time_start: Optional[datetime] = None,
        time_end: Optional[datetime] = None,
        role: Optional[str] = None,
        status: str = "evaluated",
        visualization_uri: Optional[str] = None,
    ) -> Evidence:
        ev = Evidence(
            case_id=case_id,
            source_type=source_type,
            collection_id=collection_id,
            granule_id=granule_id,
            time_start=time_start,
            time_end=time_end,
            role=role,
            status=status,
            visualization_uri=visualization_uri,
        )
        db.add(ev)
        db.commit()
        db.refresh(ev)
        return ev

    @staticmethod
    def save_provenance_record(
        db: Session,
        case_id: str,
        evidence_id: Optional[str] = None,
        collection_id: Optional[str] = None,
        granule_id: Optional[str] = None,
        product_id: Optional[str] = None,
        acquisition_time: Optional[datetime] = None,
        processing_method: Optional[str] = None,
        calculation_method: Optional[str] = None,
        source_reference: Optional[str] = None,
    ) -> Provenance:
        prov = Provenance(
            case_id=case_id,
            evidence_id=evidence_id,
            collection_id=collection_id,
            granule_id=granule_id,
            product_id=product_id,
            acquisition_time=acquisition_time,
            processing_method=processing_method,
            calculation_method=calculation_method,
            source_reference=source_reference,
        )
        try:
            db.add(prov)
            db.commit()
            db.refresh(prov)
        except Exception as e:
            db.rollback()
            logger.warning(f"Could not persist provenance record: {e}")
        return prov

    @staticmethod
    def save_interpretation_record(
        db: Session,
        case_id: str,
        narrative: str,
        uncertainty: Optional[float] = None,
    ) -> Interpretation:
        interp = Interpretation(
            case_id=case_id,
            narrative=narrative,
            uncertainty=uncertainty,
        )
        try:
            db.add(interp)
            db.commit()
            db.refresh(interp)
        except Exception as e:
            db.rollback()
            logger.warning(f"Could not persist interpretation record: {e}")
        return interp

    @staticmethod
    def save_challenge_check(
        db: Session,
        case_id: str,
        check_type: str,
        status: str,
        value: Optional[str] = None,
        threshold: Optional[str] = None,
        rationale: Optional[str] = None,
        source: Optional[str] = None,
    ) -> ChallengeCheck:
        check = ChallengeCheck(
            case_id=case_id,
            check_type=check_type,
            status=status,
            value=value,
            threshold=threshold,
            rationale=rationale,
            source=source,
        )
        try:
            db.add(check)
            db.commit()
            db.refresh(check)
        except Exception as e:
            db.rollback()
            logger.warning(f"Could not persist challenge check record: {e}")
        return check

