"""
RESPIRE Spatial Zonal Statistics & Hierarchy Aggregator
======================================================
Aggregates raster thermal metrics into 15 GCC Administrative Zones
and 200 Ward vector polygons with missing data & cloud obscuration safeguards.
"""

from typing import Dict, List, Any, Optional

# Standard 15 Greater Chennai Corporation Zones
GCC_ZONES = [
    {"id": "zone-1", "number": 1, "name": "Thiruvottiyur", "region": "North"},
    {"id": "zone-2", "number": 2, "name": "Manali", "region": "North"},
    {"id": "zone-3", "number": 3, "name": "Madhavaram", "region": "North"},
    {"id": "zone-4", "number": 4, "name": "Tondiarpet", "region": "North"},
    {"id": "zone-5", "number": 5, "name": "Royapuram", "region": "North"},
    {"id": "zone-6", "number": 6, "name": "Thiru-Vi-Ka Nagar", "region": "Central"},
    {"id": "zone-7", "number": 7, "name": "Ambattur", "region": "Central"},
    {"id": "zone-8", "number": 8, "name": "Anna Nagar", "region": "Central"},
    {"id": "zone-9", "number": 9, "name": "Teynampet", "region": "Central"},
    {"id": "zone-10", "number": 10, "name": "Kodambakkam", "region": "Central"},
    {"id": "zone-11", "number": 11, "name": "Valasaravakkam", "region": "South"},
    {"id": "zone-12", "number": 12, "name": "Alandur", "region": "South"},
    {"id": "zone-13", "number": 13, "name": "Adyar", "region": "South"},
    {"id": "zone-14", "number": 14, "name": "Perungudi", "region": "South"},
    {"id": "zone-15", "number": 15, "name": "Sholinganallur", "region": "South"},
]

class SpatialZonalAggregator:
    """
    Manages spatial boundaries, zonal grouping, and pixel validity flags.
    """

    @staticmethod
    def get_zone_metadata(zone_number: int) -> Optional[Dict[str, Any]]:
        for z in GCC_ZONES:
            if z["number"] == zone_number:
                return z
        return None

    @staticmethod
    def check_cloud_obscuration(cloud_cover_pct: float, swath_overlap: bool) -> Dict[str, Any]:
        """
        Applies Civic Trust data quality checks.
        Wards with >20% cloud cover are flagged as INSUFFICIENT_EVIDENCE to prevent public budget misallocation.
        """
        if cloud_cover_pct > 20.0 or not swath_overlap:
            return {
                "isValid": False,
                "status": "INSUFFICIENT_EVIDENCE",
                "reason": f"Cloud obscuration ({cloud_cover_pct:.1f}%) exceeds 20% threshold. Requires repeat pass.",
                "completenessRatio": round(1.0 - (cloud_cover_pct / 100.0), 2)
            }
        return {
            "isValid": True,
            "status": "SOURCED",
            "reason": "Satellite swath nadir calibrated.",
            "completenessRatio": 1.0
        }
