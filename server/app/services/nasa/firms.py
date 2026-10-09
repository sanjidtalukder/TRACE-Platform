import math
import logging
from typing import Optional, List, Dict, Any, Tuple
from datetime import datetime, timezone, timedelta
import httpx

from app.core.config import settings
from app.services.nasa.schemas import NASAObservation, GeoJSONGeometry
from pydantic import BaseModel, Field

logger = logging.getLogger("trace.nasa.firms")


def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculates great-circle distance between two point coordinates in kilometers.
    """
    R = 6371.0  # Earth radius in kilometers
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (
        math.sin(dlat / 2.0) ** 2
        + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2.0) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return R * c


class FIRMSFireItem(BaseModel):
    latitude: float
    longitude: float
    brightness: Optional[float] = None
    scan: Optional[float] = None
    track: Optional[float] = None
    acq_datetime: datetime
    satellite: Optional[str] = None
    instrument: Optional[str] = None
    confidence: Optional[str] = None
    frp: Optional[float] = None
    daynight: Optional[str] = None
    distance_km: Optional[float] = None


class FIRMSSummary(BaseModel):
    source: str = "NASA_FIRMS"
    product_id: str = "FIRMS_ACTIVE_FIRE"
    total_fires: int = 0
    nearest_distance_km: Optional[float] = None
    max_frp: Optional[float] = None
    temporal_overlap: bool = False
    status: str = "UNAVAILABLE"  # AVAILABLE | UNAVAILABLE
    detections: List[FIRMSFireItem] = Field(default_factory=list)
    query_params: Dict[str, Any] = Field(default_factory=dict)
    provenance: Dict[str, Any] = Field(default_factory=dict)


class FirmsDiscoveryService:
    """
    Discovery service for NASA FIRMS (Fire Information for Resource Management System) active fire observations.
    Integrates MODIS and VIIRS thermal anomaly detections with spatial/temporal correlation metrics.
    """

    def __init__(self, map_key: Optional[str] = None, base_url: Optional[str] = None):
        self.map_key = map_key or settings.FIRMS_MAP_KEY
        self.base_url = (base_url or settings.FIRMS_BASE_URL).rstrip("/")

    def get_firms_summary(
        self,
        bbox: Optional[str] = None,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        source_product: str = "VIIRS_NOAA20_NRT",
        event_center: Optional[Tuple[float, float]] = None,
    ) -> FIRMSSummary:
        """
        Fetches FIRMS active fire detections for a bounding box and temporal window.
        Returns a structured FIRMSSummary safely representing AVAILABLE or UNAVAILABLE states.
        """
        query_params = {
            "bbox": bbox,
            "start_date": start_date,
            "end_date": end_date,
            "source_product": source_product,
        }

        # Parse start and end dates
        start_dt: Optional[datetime] = None
        end_dt: Optional[datetime] = None
        if start_date:
            try:
                start_dt = datetime.fromisoformat(start_date.replace("Z", "+00:00"))
            except Exception:
                pass
        if end_date:
            try:
                end_dt = datetime.fromisoformat(end_date.replace("Z", "+00:00"))
            except Exception:
                pass

        if not self.map_key:
            logger.info("FIRMS_MAP_KEY not set; returning UNAVAILABLE state for FIRMS query")
            return FIRMSSummary(
                status="UNAVAILABLE",
                query_params=query_params,
                provenance={
                    "source": "NASA_FIRMS",
                    "reason": "FIRMS_MAP_KEY_NOT_CONFIGURED",
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                },
            )

        if not bbox:
            return FIRMSSummary(
                status="UNAVAILABLE",
                query_params=query_params,
                provenance={
                    "source": "NASA_FIRMS",
                    "reason": "MISSING_BOUNDING_BOX",
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                },
            )

        # Parse bbox for center calculation if event_center not explicitly passed
        center_lat, center_lon = None, None
        if event_center:
            center_lat, center_lon = event_center
        else:
            try:
                parts = [float(x) for x in bbox.split(",")]
                if len(parts) == 4:
                    center_lon = (parts[0] + parts[2]) / 2.0
                    center_lat = (parts[1] + parts[3]) / 2.0
            except Exception:
                pass

        day_range = 10
        if start_dt and end_dt:
            day_range = max(1, min(30, (end_dt - start_dt).days + 1))
        
        req_date = (start_dt or datetime.now(timezone.utc)).strftime("%Y-%m-%d")
        url = f"{self.base_url}/area/csv/{self.map_key}/{source_product}/{bbox}/{day_range}/{req_date}"

        try:
            with httpx.Client(timeout=2.5) as client:
                res = client.get(url)
                if res.status_code != 200:
                    logger.warning(f"FIRMS API returned HTTP status {res.status_code}")
                    return FIRMSSummary(
                        status="UNAVAILABLE",
                        query_params=query_params,
                        provenance={
                            "source": "NASA_FIRMS",
                            "endpoint": url,
                            "http_status": res.status_code,
                            "timestamp": datetime.now(timezone.utc).isoformat(),
                        },
                    )
                
                csv_text = res.text.strip()
                lines = csv_text.splitlines()
                if not lines or len(lines) <= 1:
                    return FIRMSSummary(
                        status="AVAILABLE",
                        total_fires=0,
                        query_params=query_params,
                        provenance={
                            "source": "NASA_FIRMS",
                            "product": source_product,
                            "timestamp": datetime.now(timezone.utc).isoformat(),
                        },
                    )

                header = [h.strip().lower() for h in lines[0].split(",")]
                detections: List[FIRMSFireItem] = []
                nearest_dist: Optional[float] = None
                max_frp_val: Optional[float] = None
                has_temporal_overlap = False

                for line in lines[1:]:
                    parts = line.split(",")
                    if len(parts) < len(header):
                        continue
                    row = dict(zip(header, [p.strip() for p in parts]))
                    try:
                        lat = float(row["latitude"])
                        lon = float(row["longitude"])
                        acq_date_str = row.get("acq_date", "")
                        acq_time_str = row.get("acq_time", "0000").zfill(4)
                        
                        dt_iso = f"{acq_date_str}T{acq_time_str[:2]}:{acq_time_str[2:]}:00+00:00"
                        acq_dt = datetime.fromisoformat(dt_iso)

                        # Check distance
                        dist_km = None
                        if center_lat is not None and center_lon is not None:
                            dist_km = haversine_distance_km(center_lat, center_lon, lat, lon)
                            if nearest_dist is None or dist_km < nearest_dist:
                                nearest_dist = dist_km

                        frp = float(row["frp"]) if row.get("frp") else None
                        if frp is not None:
                            if max_frp_val is None or frp > max_frp_val:
                                max_frp_val = frp

                        # Check temporal overlap
                        if start_dt and end_dt:
                            if start_dt <= acq_dt <= end_dt + timedelta(days=1):
                                has_temporal_overlap = True
                        else:
                            has_temporal_overlap = True

                        detections.append(
                            FIRMSFireItem(
                                latitude=lat,
                                longitude=lon,
                                brightness=float(row["brightness"]) if row.get("brightness") else None,
                                scan=float(row["scan"]) if row.get("scan") else None,
                                track=float(row["track"]) if row.get("track") else None,
                                acq_datetime=acq_dt,
                                satellite=row.get("satellite"),
                                instrument=row.get("instrument"),
                                confidence=row.get("confidence"),
                                frp=frp,
                                daynight=row.get("daynight"),
                                distance_km=dist_km,
                            )
                        )
                    except Exception as e:
                        logger.debug(f"Error parsing FIRMS row: {e}")
                        continue

                return FIRMSSummary(
                    status="AVAILABLE",
                    total_fires=len(detections),
                    nearest_distance_km=nearest_dist,
                    max_frp=max_frp_val,
                    temporal_overlap=has_temporal_overlap,
                    detections=detections,
                    query_params=query_params,
                    provenance={
                        "source": "NASA_FIRMS",
                        "product": source_product,
                        "retrieved_at": datetime.now(timezone.utc).isoformat(),
                        "calculation_method": "HAVERSINE_SPATIAL_DISTANCE",
                    },
                )

        except Exception as exc:
            logger.error(f"FIRMS API request error: {exc}")
            return FIRMSSummary(
                status="UNAVAILABLE",
                query_params=query_params,
                provenance={
                    "source": "NASA_FIRMS",
                    "error": str(exc),
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                },
            )

    def discover_firms_observations(
        self,
        bbox: Optional[str] = None,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        source_product: str = "VIIRS_NOAA20_NRT",
        page_size: int = 20,
    ) -> List[NASAObservation]:
        """
        Discovers FIRMS observations wrapped as NASAObservation items for CMR discovery compatibility.
        """
        summary = self.get_firms_summary(
            bbox=bbox,
            start_date=start_date,
            end_date=end_date,
            source_product=source_product,
        )

        if summary.status != "AVAILABLE" or not summary.detections:
            return []

        observations: List[NASAObservation] = []
        for det in summary.detections[:page_size]:
            poly_coords = [
                [det.longitude - 0.001, det.latitude - 0.001],
                [det.longitude + 0.001, det.latitude - 0.001],
                [det.longitude + 0.001, det.latitude + 0.001],
                [det.longitude - 0.001, det.latitude + 0.001],
                [det.longitude - 0.001, det.latitude - 0.001],
            ]

            observations.append(
                NASAObservation(
                    source="NASA_FIRMS",
                    mission="FIRMS",
                    product_id=source_product,
                    granule_id=f"FIRMS_{det.acq_datetime.strftime('%Y%m%d%H%M')}_{det.latitude:.3f}_{det.longitude:.3f}",
                    collection_id="FIRMS_ACTIVE_FIRE",
                    observation_time=det.acq_datetime,
                    start_time=det.acq_datetime,
                    end_time=det.acq_datetime,
                    spatial_extent=GeoJSONGeometry(type="Polygon", coordinates=[poly_coords]),
                    product_type="ACTIVE_FIRE",
                    access_links=["https://firms.modaps.eosdis.nasa.gov/"],
                    metadata_reference=f"https://firms.modaps.eosdis.nasa.gov/api/area/",
                )
            )

        return observations
