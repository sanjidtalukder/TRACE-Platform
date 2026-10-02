from datetime import datetime, timezone
from sqlalchemy.orm import Session
from geoalchemy2.elements import WKTElement
from app.models.case import (
    Case,
    NisarMeasurement,
    Evidence,
    ChallengeCheck,
    Interpretation,
    Provenance,
    FieldObservation,
)

def seed_initial_cases(db: Session):
    """
    Seed standard TRACE investigation cases if table is empty or missing canonical event categories.
    Ensures all planetary matrix categories (wildfire, flood, earthquake, deforestation, char)
    and all audit verdict states (SUPPORTED, INCONCLUSIVE, REJECTED) have authentic cases.
    """
    now = datetime.now(timezone.utc)

    # Helper to check if case exists
    def case_exists(cid: str) -> bool:
        return db.query(Case).filter(Case.case_id == cid).first() is not None

    # 1. CASE-017: Surface Water Change Case (Salton Sea / California Region)
    if not case_exists("CASE-017"):
        case_017 = Case(
            case_id="CASE-017",
            event_type="surface_water_change",
            geometry=WKTElement("POLYGON((-118.3 34.0, -118.1 34.0, -118.1 34.2, -118.3 34.2, -118.3 34.0))", srid=4326),
            observation_start=now,
            observation_end=now,
            status="active",
        )
        db.add(case_017)
        db.commit()

        nisar_017 = NisarMeasurement(
            case_id=case_017.case_id,
            product_id="NISAR_L2_PR_GCOV_017",
            observation_time=now,
            delta_backscatter=-2.43,
            affected_area=45.2,
            change_metric="log_ratio",
            raster_reference="s3://asf-nisar-archive/GCOV_CASE_017.tif",
        )
        db.add(nisar_017)

        evidence_017 = Evidence(
            id="ev-017-gpm",
            case_id=case_017.case_id,
            source_type="gpm",
            collection_id="GPM_IMERG_V06",
            granule_id="3B-DAY.MS.MRG.3IMERG.20260921-S000000-E235959.V06B",
            role="baseline",
            status="supports",
        )
        db.add(evidence_017)

        check_017 = ChallengeCheck(
            case_id=case_017.case_id,
            check_type="OVERALL_SELF_AUDIT",
            status="PASS",
            value="-2.43 dB",
            threshold="-1.5 dB",
            rationale="Radar backscatter drop validated against GPM precipitation baseline",
            source="system",
        )
        db.add(check_017)
        db.commit()

    # 2. TRACE-2026-001: Flood Debris Case (Houston / Gulf Coast)
    if not case_exists("TRACE-2026-001"):
        case_001 = Case(
            case_id="TRACE-2026-001",
            event_type="flood",
            geometry=WKTElement("POLYGON((-95.4 29.7, -95.2 29.7, -95.2 29.9, -95.4 29.9, -95.4 29.7))", srid=4326),
            observation_start=now,
            observation_end=now,
            status="active",
        )
        db.add(case_001)
        db.commit()

        nisar_001 = NisarMeasurement(
            case_id=case_001.case_id,
            product_id="NISAR_L2_PR_GSLC_001",
            observation_time=now,
            delta_backscatter=-1.85,
            affected_area=120.5,
            change_metric="log_ratio",
            raster_reference="s3://asf-nisar-archive/GSLC_CASE_001.tif",
        )
        db.add(nisar_001)

        check_001 = ChallengeCheck(
            case_id=case_001.case_id,
            check_type="OVERALL_SELF_AUDIT",
            status="PASS",
            value="-1.85 dB",
            threshold="-1.0 dB",
            rationale="Multi-sensor flood inundation confirmed by high-confidence backscatter attenuation",
            source="system",
        )
        db.add(check_001)
        db.commit()

    # 3. TRACE-WILD-01: Wildfire Scar Case (Sierra Nevada / Yosemite, CA)
    if not case_exists("TRACE-WILD-01"):
        case_wild = Case(
            case_id="TRACE-WILD-01",
            event_type="wildfire",
            geometry=WKTElement("POLYGON((-119.6 37.7, -119.4 37.7, -119.4 37.9, -119.6 37.9, -119.6 37.7))", srid=4326),
            observation_start=now,
            observation_end=now,
            status="active",
        )
        db.add(case_wild)
        db.commit()

        nisar_wild = NisarMeasurement(
            case_id=case_wild.case_id,
            product_id="NISAR_L2_PR_GCOV_WILD01",
            observation_time=now,
            delta_backscatter=1.92,
            affected_area=340.0,
            change_metric="log_ratio",
            raster_reference="s3://asf-nisar-archive/GCOV_WILD_01.tif",
        )
        db.add(nisar_wild)

        evidence_wild = Evidence(
            id="ev-wild-firms",
            case_id=case_wild.case_id,
            source_type="firms",
            collection_id="MODIS_NRT_FIRMS",
            granule_id="FIRMS.MODIS.2026.GLOBAL",
            role="detection",
            status="supports",
        )
        db.add(evidence_wild)

        check_wild = ChallengeCheck(
            case_id=case_wild.case_id,
            check_type="OVERALL_SELF_AUDIT",
            status="PASS",
            value="+1.92 dB",
            threshold="+0.8 dB",
            rationale="Corroborated by NASA FIRMS thermal anomaly cluster and rough scar scattering",
            source="system",
        )
        db.add(check_wild)
        db.commit()

    # 4. TRACE-QUAKE-01: Fault Displacement Case (Ridgecrest / Mojave, CA)
    if not case_exists("TRACE-QUAKE-01"):
        case_quake = Case(
            case_id="TRACE-QUAKE-01",
            event_type="earthquake",
            geometry=WKTElement("POLYGON((-117.8 35.6, -117.5 35.6, -117.5 35.9, -117.8 35.9, -117.8 35.6))", srid=4326),
            observation_start=now,
            observation_end=now,
            status="active",
        )
        db.add(case_quake)
        db.commit()

        nisar_quake = NisarMeasurement(
            case_id=case_quake.case_id,
            product_id="NISAR_L2_PR_GUNW_QUAKE01",
            observation_time=now,
            delta_backscatter=-0.45,
            affected_area=85.0,
            change_metric="log_ratio",
            raster_reference="s3://asf-nisar-archive/GUNW_QUAKE_01.tif",
        )
        db.add(nisar_quake)

        check_quake = ChallengeCheck(
            case_id=case_quake.case_id,
            check_type="OVERALL_SELF_AUDIT",
            status="INCONCLUSIVE",
            value="0.32 fringe coherence",
            threshold="0.65 fringe coherence",
            rationale="Phase decorrelation in dry alluvium requires secondary descending orbit pass",
            source="system",
        )
        db.add(check_quake)
        db.commit()

    # 5. TRACE-DEFOR-01: Rainforest Canopy Clear-cut (Rondonia, Amazon)
    if not case_exists("TRACE-DEFOR-01"):
        case_defor = Case(
            case_id="TRACE-DEFOR-01",
            event_type="deforestation",
            geometry=WKTElement("POLYGON((-62.5 -10.9, -62.2 -10.9, -62.2 -10.7, -62.5 -10.7, -62.5 -10.9))", srid=4326),
            observation_start=now,
            observation_end=now,
            status="active",
        )
        db.add(case_defor)
        db.commit()

        nisar_defor = NisarMeasurement(
            case_id=case_defor.case_id,
            product_id="NISAR_L2_PR_GCOV_DEFOR01",
            observation_time=now,
            delta_backscatter=-4.20,
            affected_area=520.0,
            change_metric="log_ratio",
            raster_reference="s3://asf-nisar-archive/GCOV_DEFOR_01.tif",
        )
        db.add(nisar_defor)

        check_defor = ChallengeCheck(
            case_id=case_defor.case_id,
            check_type="OVERALL_SELF_AUDIT",
            status="FAIL",
            value="False Anomaly Warning",
            threshold="Deterministic Moisture Check",
            rationale="Radar attenuation caused by seasonal agricultural harvesting rather than permanent forest clearing",
            source="system",
        )
        db.add(check_defor)
        db.commit()

    # 6. TRACE-CHAR-01: Jamuna River Island Dynamics (Bangladesh)
    if not case_exists("TRACE-CHAR-01"):
        case_char = Case(
            case_id="TRACE-CHAR-01",
            event_type="char",
            geometry=WKTElement("POLYGON((89.5 24.7, 89.8 24.7, 89.8 24.9, 89.5 24.9, 89.5 24.7))", srid=4326),
            observation_start=now,
            observation_end=now,
            status="active",
        )
        db.add(case_char)
        db.commit()

        nisar_char = NisarMeasurement(
            case_id=case_char.case_id,
            product_id="NISAR_L2_PR_GSLC_CHAR01",
            observation_time=now,
            delta_backscatter=2.10,
            affected_area=210.0,
            change_metric="log_ratio",
            raster_reference="s3://asf-nisar-archive/GSLC_CHAR_01.tif",
        )
        db.add(nisar_char)

        check_char = ChallengeCheck(
            case_id=case_char.case_id,
            check_type="OVERALL_SELF_AUDIT",
            status="PASS",
            value="+2.10 dB",
            threshold="+1.0 dB",
            rationale="New sandbar deposition confirmed with multi-pass L-band SAR backscatter shift",
            source="system",
        )
        db.add(check_char)
        db.commit()

    db.commit()
