from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
from app.core.config import settings
from app.services.nasa.client import NasaHttpClient
from app.services.nasa.schemas import NASAObservation, GeoJSONGeometry


class CMRSearchService:
    """
    Search service interacting with NASA Earthdata Common Metadata Repository (CMR).
    Normalizes third-party granule metadata into clean TRACE NASAObservation schemas.
    """

    def __init__(self, client: Optional[NasaHttpClient] = None):
        self.client = client or NasaHttpClient()
        self.cmr_url = f"{settings.CMR_BASE_URL.rstrip('/')}/search/granules.json"

    def search_granules(
        self,
        short_name: Optional[str] = None,
        bbox: Optional[str] = None,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        page_size: int = 20,
        mission_label: str = "EARTHDATA",
        product_type_label: str = "GRANULE",
    ) -> List[NASAObservation]:
        params: Dict[str, Any] = {"page_size": page_size}

        if short_name:
            params["short_name"] = short_name
        if bbox:
            params["bounding_box"] = bbox
        if start_date or end_date:
            def _clean_cmr_date(d_str: Optional[str]) -> str:
                if not d_str:
                    return ""
                try:
                    dt = datetime.fromisoformat(d_str.replace("Z", "+00:00"))
                    return dt.strftime("%Y-%m-%dT%H:%M:%SZ")
                except Exception:
                    return d_str
            s_str = _clean_cmr_date(start_date)
            e_str = _clean_cmr_date(end_date)
            params["temporal"] = f"{s_str},{e_str}"


        data = self.client.get(self.cmr_url, params=params)
        
        entries = data.get("feed", {}).get("entry", [])
        observations: List[NASAObservation] = []

        for entry in entries:
            granule_id = entry.get("producer_granule_id") or entry.get("title") or entry.get("id", "UNKNOWN")
            collection_id = entry.get("dataset_id") or short_name or "NASA_COLLECTION"
            product_id = entry.get("title") or granule_id

            time_start_str = entry.get("time_start")
            time_end_str = entry.get("time_end")
            
            obs_time = datetime.now(timezone.utc)
            if time_start_str:
                try:
                    obs_time = datetime.fromisoformat(time_start_str.replace("Z", "+00:00"))
                except Exception:
                    pass

            start_t = None
            if time_start_str:
                try:
                    start_t = datetime.fromisoformat(time_start_str.replace("Z", "+00:00"))
                except Exception:
                    pass

            end_t = None
            if time_end_str:
                try:
                    end_t = datetime.fromisoformat(time_end_str.replace("Z", "+00:00"))
                except Exception:
                    pass

            # Spatial Extent Parsing
            spatial: Optional[GeoJSONGeometry] = None
            boxes = entry.get("boxes", [])
            polygons = entry.get("polygons", [])

            if polygons and len(polygons) > 0 and len(polygons[0]) > 0:
                coords_str = polygons[0][0].split()
                try:
                    coords_floats = [float(x) for x in coords_str]
                    poly_coords = []
                    for i in range(0, len(coords_floats) - 1, 2):
                        poly_coords.append([coords_floats[i + 1], coords_floats[i]])
                    if poly_coords and poly_coords[0] != poly_coords[-1]:
                        poly_coords.append(poly_coords[0])
                    spatial = GeoJSONGeometry(type="Polygon", coordinates=[poly_coords])
                except Exception:
                    pass
            elif boxes:
                try:
                    box_parts = [float(x) for x in boxes[0].split()]
                    s, w, n, e = box_parts[0], box_parts[1], box_parts[2], box_parts[3]
                    poly_coords = [[w, s], [e, s], [e, n], [w, n], [w, s]]
                    spatial = GeoJSONGeometry(type="Polygon", coordinates=[poly_coords])
                except Exception:
                    pass

            # Links Parsing & Visualization URI Extraction
            links = []
            viz_uri: Optional[str] = None

            for link in entry.get("links", []):
                href = link.get("href")
                if not href or not href.startswith("http"):
                    continue

                links.append(href)

                # Identify official NASA/ASF browse and visualization links
                rel = str(link.get("rel", "")).lower()
                link_type = str(link.get("type", "")).upper()
                inherited = link.get("inherited", False)

                href_lower = href.lower()
                is_img_ext = any(href_lower.endswith(ext) for ext in [".png", ".jpg", ".jpeg", ".webp"])
                is_browse_keyword = any(k in href_lower for k in ["browse", "quicklook", "thumbnail", "preview"])

                if (
                    "GET RELATED VISUALIZATION" in link_type
                    or "browse" in rel
                    or "user/documentation#" in rel
                    or (is_img_ext and is_browse_keyword)
                ):
                    if not viz_uri:
                        viz_uri = href
                elif is_img_ext and not viz_uri and not inherited:
                    viz_uri = href

            observations.append(
                NASAObservation(
                    source="NASA",
                    mission=mission_label,
                    product_id=product_id,
                    granule_id=granule_id,
                    collection_id=collection_id,
                    observation_time=obs_time,
                    start_time=start_t,
                    end_time=end_t,
                    spatial_extent=spatial,
                    product_type=product_type_label,
                    access_links=links,
                    visualization_uri=viz_uri,
                    metadata_reference=f"{settings.CMR_BASE_URL}/search/concepts/{entry.get('id')}.json" if entry.get("id") else None,
                )
            )

        return observations
