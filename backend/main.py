"""BidyutGyan (বিদ্যুতজ্ঞান) — Load Shedding Schedule & Utility Info."""

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


# ── Static Files (MUST be last — catches all remaining routes) ─
app.mount("/", StaticFiles(directory=str(settings.base_dir / "frontend"), html=True), name="frontend")
