"""
RESPIRE Deterministic 50/20/30 Multi-Criteria Heat Scoring Engine
=================================================================
Calculates Urban Heat Priority Score (UHPS) using fully transparent additive weights:
- 50% Normalized Land Surface Temperature (LST)
- 20% Normalized Vegetation Deficit (NDVI)
- 30% Social Vulnerability Index (SVI)
"""

from typing import Dict, Any, Optional

class RespireScoringEngine:
    """
    100% deterministic, audit-ready scoring engine conforming to NDMA and GCC Heat Action Plan guidelines.
    """

    # Baseline Climatic Bounds for Greater Chennai Corporation
    CHENNAI_BASELINE_LST_MIN = 30.0   # °C (Green/coastal baseline)
    CHENNAI_BASELINE_LST_MAX = 45.0   # °C (Extreme industrial heat island)
    CHENNAI_NDVI_MAX = 0.65           # Lush canopy (e.g., Guindy National Park/IIT Madras)
    CHENNAI_NDVI_MIN = 0.05           # Dense concrete / bare impervious industrial surface

    @classmethod
    def normalize_lst(cls, lst_celsius: float) -> float:
        """
        Normalizes LST to 0-100 scale.
        """
        clamped = max(cls.CHENNAI_BASELINE_LST_MIN, min(cls.CHENNAI_BASELINE_LST_MAX, lst_celsius))
        fraction = (clamped - cls.CHENNAI_BASELINE_LST_MIN) / (cls.CHENNAI_BASELINE_LST_MAX - cls.CHENNAI_BASELINE_LST_MIN)
        return round(fraction * 100.0, 2)

    @classmethod
    def normalize_vegetation_deficit(cls, ndvi: float) -> float:
        """
        Normalizes Vegetation Deficit to 0-100 scale.
        Higher deficit = lower vegetation = higher risk.
        """
        clamped = max(cls.CHENNAI_NDVI_MIN, min(cls.CHENNAI_NDVI_MAX, ndvi))
        deficit_fraction = (cls.CHENNAI_NDVI_MAX - clamped) / (cls.CHENNAI_NDVI_MAX - cls.CHENNAI_NDVI_MIN)
        return round(deficit_fraction * 100.0, 2)

    @classmethod
    def compute_ward_score(
        cls,
        lst_celsius: Optional[float],
        ndvi: Optional[float],
        social_vulnerability_score: Optional[float],
        is_cloud_obscured: bool = False
    ) -> Dict[str, Any]:
        """
        Computes 50/20/30 additive score and outputs full causal diagnostic breakdown.
        """
        if is_cloud_obscured or lst_celsius is None or ndvi is None or social_vulnerability_score is None:
            return {
                "overallScore": None,
                "tier": "UNSCORED",
                "isAnalyzable": False,
                "status": "INSUFFICIENT_EVIDENCE",
                "driverBreakdown": None,
                "pointContributions": None,
                "primaryDriver": "Cloud Obscuration / Missing Swath",
                "completenessRatio": 0.0
            }

        s_heat = cls.normalize_lst(lst_celsius)
        s_veg = cls.normalize_vegetation_deficit(ndvi)
        s_vuln = max(0.0, min(100.0, social_vulnerability_score))

        # Additive Point Calculations
        pts_heat = round(0.50 * s_heat, 2)   # Max 50 points
        pts_veg = round(0.20 * s_veg, 2)     # Max 20 points
        pts_vuln = round(0.30 * s_vuln, 2)   # Max 30 points

        total_score = round(pts_heat + pts_veg + pts_vuln, 1)

        # Risk Tier Classification
        if total_score >= 85.0:
            tier = "VERY_HIGH"
        elif total_score >= 70.0:
            tier = "HIGH"
        elif total_score >= 50.0:
            tier = "MODERATE"
        else:
            tier = "LOW"

        # Diagnostic Driver Identification
        driver_impacts = [
            ("Thermal Severity (LST)", pts_heat / 50.0),
            ("Canopy / Tree Deficit", pts_veg / 20.0),
            ("Socioeconomic & Density Vulnerability", pts_vuln / 30.0)
        ]
        driver_impacts.sort(key=lambda x: x[1], reverse=True)
        primary_driver = driver_impacts[0][0]
        secondary_driver = driver_impacts[1][0]

        return {
            "overallScore": total_score,
            "tier": tier,
            "isAnalyzable": True,
            "status": "DERIVED",
            "pointContributions": {
                "heatPoints": pts_heat,
                "maxHeatPoints": 50.0,
                "vegPoints": pts_veg,
                "maxVegPoints": 20.0,
                "vulnPoints": pts_vuln,
                "maxVulnPoints": 30.0
            },
            "driverBreakdown": {
                "heatSeverityNormalized": s_heat,
                "vegetationDeficitNormalized": s_veg,
                "socialVulnerabilityNormalized": s_vuln
            },
            "primaryDriver": primary_driver,
            "secondaryDriver": secondary_driver,
            "completenessRatio": 1.0
        }
