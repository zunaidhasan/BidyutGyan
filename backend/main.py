"""BidyutGyan (বিদ্যুতজ্ঞান) — Load Shedding Schedule & Utility Info."""

from fastapi import FastAPI, Query, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from backend.config import settings
import json
import time

from fastapi import FastAPI, Query, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

from backend.config import settings
from backend.utility_lookup import (
    find_district_by_coords,
    find_district_by_name,
    get_all_districts,
    get_district_by_slug,
    get_all_divisions,
    get_upazilas_for_district,
)

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description=settings.app_description,
)

# CORS — allow frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load utilities data once at startup
utilities_data = settings.load_utilities_data()


# ── API Endpoints ──────────────────────────────────────────────


@app.get("/api")
def api_root():
    return {
        "app": settings.app_name,
        "version": settings.app_version,
        "description": settings.app_description,
        "demo_mode": settings.demo_mode,
        "endpoints": {
            "divisions": "/api/divisions",
            "districts": "/api/districts",
            "district_by_slug": "/api/district/{slug}",
            "search": "/api/search?q={name}",
            "lookup": "/api/lookup?lat={lat}&lon={lon}",
        },
        "total_districts": len(get_all_districts(utilities_data)),
        "total_divisions": len(get_all_divisions(utilities_data)),
        "upazilas_supported": True,
    }


@app.get("/api/divisions")
def list_divisions():
    """List all 8 divisions with district counts."""
    return {
        "divisions": get_all_divisions(utilities_data),
        "total": len(get_all_divisions(utilities_data)),
    }


@app.get("/api/districts")
def list_districts():
    """List all 64 districts with their utility suppliers."""
    districts = get_all_districts(utilities_data)
    return {
        "districts": districts,
        "total": len(districts),
    }


@app.get("/api/district/{slug}")
def district_detail(slug: str):
    """Get details for a specific district by its slug (e.g. 'dhaka', 'bogura')."""
    result = get_district_by_slug(slug.lower(), utilities_data)
    if not result:
        raise HTTPException(status_code=404, detail=f"District '{slug}' not found")
    return result


@app.get("/api/search")
def search_districts(q: str = Query(..., description="District name (English or Bangla)")):
    """Search districts by name (English or Bangla)."""
    results = find_district_by_name(q, utilities_data)
    return {
        "query": q,
        "results": results,
        "total": len(results),
    }


@app.get("/api/lookup")
def lookup_by_coords(
    lat: float = Query(..., description="Latitude"),
    lon: float = Query(..., description="Longitude"),
):
    """
    Find the nearest district and its electricity utility by GPS coordinates.
    Uses Haversine distance formula for accurate nearest-district matching.
    """
    result = find_district_by_coords(lat, lon, utilities_data)
    if not result:
        raise HTTPException(status_code=404, detail="Could not find a nearby district")

    return result


# ── Upazilas / Sub-Districts ─────────────────────────────────────


@app.get("/api/upazilas/{slug}")
def list_upazilas(slug: str):
    """List all upazilas (sub-districts) for a given district by slug.
    Returns upazila names and which utility company serves each."""
    upazilas = get_upazilas_for_district(slug.lower(), utilities_data)
    if upazilas is None:
        raise HTTPException(
            status_code=404,
            detail=f"District '{slug}' not found or no upazila data available"
        )
    return {
        "district_key": slug,
        "upazilas": upazilas,
        "total": len(upazilas),
    }


# ── Utilities Info ────────────────────────────────────────────


@app.get("/api/utilities")
def list_utilities():
    """List all electricity distribution companies with descriptions."""
    return {
        "utilities": utilities_data["_utilities"],
    }


# ── Health Check ──────────────────────────────────────────────


@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "app": settings.app_name,
        "version": settings.app_version,
        "demo_mode": settings.demo_mode,
    }


# ── Community Power Reports (In-Memory Storage) ─────────────────

REPORTS_FILE = settings.base_dir / "backend" / "data" / "power_reports.json"


def _load_reports() -> dict:
    """Load reports from disk, or return empty dict if not found."""
    try:
        with open(REPORTS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return {}


def _save_reports(reports: dict):
    """Persist reports to disk."""
    with open(REPORTS_FILE, "w", encoding="utf-8") as f:
        json.dump(reports, f, indent=2, ensure_ascii=False)


from pydantic import BaseModel

class ReportSubmission(BaseModel):
    upazila: str
    district: str
    status: str  # 'cut' or 'on'
    note: str = ""


@app.post("/api/reports")
def submit_report(report: ReportSubmission):
    """Submit a community power report for an upazila."""
    upazila = report.upazila
    district = report.district
    status = report.status
    note = report.note

    reports = _load_reports()
    key = f"{district}:{upazila}"

    if key not in reports:
        reports[key] = {
            "upazila": upazila,
            "district": district,
            "reports": [],
        }

    reports[key]["reports"].insert(0, {
        "status": status,
        "note": note,
        "timestamp": int(time.time()),
    })

    # Keep only last 50 reports per upazila
    reports[key]["reports"] = reports[key]["reports"][:50]

    _save_reports(reports)

    return {
        "ok": True,
        "upazila": upazila,
        "district": district,
        "total_reports": len(reports[key]["reports"]),
    }


@app.get("/api/reports/{district}")
def get_district_reports(district: str):
    """Get all community power reports for a district, grouped by upazila."""
    reports = _load_reports()
    prefix = f"{district}:"
    result = {}

    for key, data in reports.items():
        if key.startswith(prefix):
            upazila_name = key[len(prefix):]
            if data["reports"]:
                latest = data["reports"][0]
                last_24h = sum(
                    1 for r in data["reports"]
                    if r["timestamp"] > int(time.time()) - 86400
                )
                result[upazila_name] = {
                    "latest_status": latest["status"],
                    "latest_timestamp": latest["timestamp"],
                    "total_reports": len(data["reports"]),
                    "reports_last_24h": last_24h,
                }

    return {
        "district": district,
        "upazilas": result,
        "total_upazilas_with_reports": len(result),
    }


@app.get("/api/reports/{district}/{upazila}")
def get_upazila_reports(district: str, upazila: str):
    """Get recent community reports for a specific upazila."""
    reports = _load_reports()
    key = f"{district}:{upazila}"
    data = reports.get(key)

    if not data or not data["reports"]:
        return {
            "upazila": upazila,
            "district": district,
            "reports": [],
            "total": 0,
        }

    return {
        "upazila": upazila,
        "district": district,
        "reports": data["reports"][:20],
        "total": len(data["reports"]),
    }


# Render's default health check hits /health (not /api/health)
@app.get("/health")
def render_health_check():
    return {"status": "ok"}


# ── Static Files (MUST be last — catches all remaining routes) ─
app.mount("/", StaticFiles(directory=str(settings.base_dir / "frontend"), html=True), name="frontend")
