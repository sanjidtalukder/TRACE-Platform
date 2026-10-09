import time
import logging
from typing import Optional, Dict, Any
import httpx
from app.core.config import settings

logger = logging.getLogger("trace.nasa.client")


class NasaHttpClient:
    """
    Reusable, secure HTTP client for NASA Earthdata CMR and DAAC API services.
    Handles connection timeouts, exponential retries, and server-side authentication.
    """

    def __init__(self, timeout: float = 2.5, max_retries: int = 1):
        self.timeout = timeout
        self.max_retries = max_retries


    def _get_headers(self) -> Dict[str, str]:
        headers = {
            "Accept": "application/json",
            "User-Agent": f"TRACE-Platform/{settings.PROJECT_VERSION}",
        }
        if settings.EARTHDATA_TOKEN:
            headers["Authorization"] = f"Bearer {settings.EARTHDATA_TOKEN}"
        return headers

    def _sanitize_log_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Strips passwords, access tokens, and sensitive headers from logging output."""
        sanitized = dict(data)
        sensitive_keys = {"authorization", "password", "token", "earthdata_password", "earthdata_token"}
        for k in list(sanitized.keys()):
            if k.lower() in sensitive_keys:
                sanitized[k] = "[REDACTED]"
        return sanitized

    def get(self, url: str, params: Optional[Dict[str, Any]] = None, auth: Optional[tuple] = None) -> Dict[str, Any]:
        """
        Executes an HTTP GET request with retries and timeout protection.
        """
        headers = self._get_headers()
        
        # Override with username/password auth if provided and no token set
        req_auth = auth
        if not req_auth and not settings.EARTHDATA_TOKEN and settings.EARTHDATA_USERNAME and settings.EARTHDATA_PASSWORD:
            req_auth = (settings.EARTHDATA_USERNAME, settings.EARTHDATA_PASSWORD)

        attempt = 0
        last_exception = None

        while attempt < self.max_retries:
            attempt += 1
            try:
                with httpx.Client(timeout=self.timeout) as client:
                    response = client.get(url, params=params, headers=headers, auth=req_auth)
                    
                    if response.status_code == 200:
                        return response.json()
                    elif response.status_code == 401:
                        logger.error("NASA Earthdata authentication failed (401 Unauthorized)")
                        raise HTTPException(status_code=401, detail="NASA Earthdata authentication failed")
                    elif response.status_code == 403:
                        logger.error("NASA Earthdata forbidden access (403 Forbidden)")
                        raise HTTPException(status_code=403, detail="NASA access forbidden")
                    elif response.status_code == 429:
                        logger.warning("NASA Earthdata rate limited (429 Too Many Requests)")
                        time.sleep(1.0 * attempt)
                        continue
                    elif response.status_code in (502, 503, 504):
                        logger.warning(f"NASA service transient failure ({response.status_code}), retrying attempt {attempt}")
                        time.sleep(0.5 * (2 ** (attempt - 1)))
                        continue
                    else:
                        logger.error(f"NASA service returned status HTTP {response.status_code}")
                        return response.json() if response.headers.get("content-type", "").startswith("application/json") else {}
            except (httpx.TimeoutException, httpx.NetworkError) as exc:
                last_exception = exc
                logger.warning(f"NASA network timeout/error: {exc}, retry {attempt}/{self.max_retries}")
                time.sleep(0.5 * (2 ** (attempt - 1)))

        logger.error(f"NASA API request failed after {self.max_retries} attempts: {last_exception}")
        raise HTTPException(status_code=504, detail="NASA service gateway timeout")


from fastapi import HTTPException
