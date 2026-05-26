"""BidyutGyan (বিদ্যুতজ্ঞান) — Utility & District Lookup Logic."""

from math import radians, sin, cos, sqrt, atan2
from backend.config import settings


def _haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate the great-circle distance in km between two points."""
    R = 6371.0  # Earth radius in km
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)
    a = sin(dlat / 2) ** 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2) ** 2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))
    return R * c


def find_district_by_coords(lat: float, lon: float, data: dict) -> dict | None:
    """
    Find the nearest district to the given coordinates.
    Returns district info with distance.
    """
    nearest = None
    min_distance = float("inf")

    for div_key, div_data in data["divisions"].items():
        for dist_key, dist_data in div_data["districts"].items():
            distance = _haversine(lat, lon, dist_data["lat"], dist_data["lon"])
            if distance < min_distance:
                min_distance = distance
                nearest = {
                    "division": {
                        "key": div_key,
                        "name_en": div_data["name_en"],
                        "name_bn": div_data["name_bn"],
                    },
                    "district": {
                        "key": dist_key,
                        "name_en": dist_data["name_en"],
                        "name_bn": dist_data["name_bn"],
                        "lat": dist_data["lat"],
                        "lon": dist_data["lon"],
                        "utilities": dist_data["utilities"],
                        "primary": dist_data["primary"],
                        "note": dist_data.get("note", ""),
                    },
                    "distance_km": round(min_distance, 2),
                }

    return nearest


def find_district_by_name(query: str, data: dict) -> list[dict]:
    """
    Search districts by name (English or Bangla, case-insensitive).
    Returns list of matching districts.
    """
    query = query.lower().strip()
    results = []

    for div_key, div_data in data["divisions"].items():
        for dist_key, dist_data in div_data["districts"].items():
            if (
                query in dist_data["name_en"].lower()
                or query in dist_data["name_bn"].lower()
                or query in dist_key.lower()
            ):
                results.append({
                    "division": {
                        "key": div_key,
                        "name_en": div_data["name_en"],
                        "name_bn": div_data["name_bn"],
                    },
                    "district": {
                        "key": dist_key,
                        "name_en": dist_data["name_en"],
                        "name_bn": dist_data["name_bn"],
                        "lat": dist_data["lat"],
                        "lon": dist_data["lon"],
                        "utilities": dist_data["utilities"],
                        "primary": dist_data["primary"],
                        "note": dist_data.get("note", ""),
                    },
                })

    return results


def get_all_districts(data: dict) -> list[dict]:
    """Return all 64 districts with their utilities info."""
    districts = []
    for div_key, div_data in data["divisions"].items():
        for dist_key, dist_data in div_data["districts"].items():
            districts.append({
                "division": {
                    "key": div_key,
                    "name_en": div_data["name_en"],
                    "name_bn": div_data["name_bn"],
                },
                "district": {
                    "key": dist_key,
                    "name_en": dist_data["name_en"],
                    "name_bn": dist_data["name_bn"],
                    "lat": dist_data["lat"],
                    "lon": dist_data["lon"],
                    "utilities": dist_data["utilities"],
                    "primary": dist_data["primary"],
                    "note": dist_data.get("note", ""),
                },
            })
    return districts


def get_district_by_slug(slug: str, data: dict) -> dict | None:
    """Find a single district by its key/slug."""
    for div_key, div_data in data["divisions"].items():
        if slug in div_data["districts"]:
            dist_data = div_data["districts"][slug]
            return {
                "division": {
                    "key": div_key,
                    "name_en": div_data["name_en"],
                    "name_bn": div_data["name_bn"],
                },
                "district": {
                    "key": slug,
                    "name_en": dist_data["name_en"],
                    "name_bn": dist_data["name_bn"],
                    "lat": dist_data["lat"],
                    "lon": dist_data["lon"],
                    "utilities": dist_data["utilities"],
                    "primary": dist_data["primary"],
                    "note": dist_data.get("note", ""),
                },
            }
    return None


def get_all_divisions(data: dict) -> list[dict]:
    """Return all 8 divisions with district counts."""
    divisions = []
    for div_key, div_data in data["divisions"].items():
        divisions.append({
            "key": div_key,
            "name_en": div_data["name_en"],
            "name_bn": div_data["name_bn"],
            "district_count": len(div_data["districts"]),
        })
    return divisions
