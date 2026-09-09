"""
RESPIRE Demographic & Socioeconomic Vulnerability Fusion Module
================================================================
Combines satellite-derived physical features with municipal census indices,
transit commuter density, and informal housing vulnerability.
"""

from typing import Dict, Any

class DemographicFusionProcessor:
    """
    Normalizes and fuses demographic, occupational, and built-environment
    vulnerability indicators across GCC administrative wards.
    """

    @staticmethod
    def calculate_social_vulnerability_index(
        population_density_sqkm: float,
        informal_settlement_pct: float,
        outdoor_worker_ratio: float,
        senior_child_dependency_ratio: float
    ) -> Dict[str, Any]:
        """
        Calculates normalized Social Vulnerability Score (0-100) using deterministic municipal weights.
        - Population Density: 35%
        - Outdoor Worker Proportion: 30%
        - Informal Settlement / Dense Tenements: 20%
        - Age Dependency (Children + Seniors): 15%
        """
        # Density normalization: Max threshold 45,000 / sq.km in dense urban cores (e.g., George Town/Royapuram)
        norm_density = min(1.0, population_density_sqkm / 45000.0)
        norm_workers = min(1.0, outdoor_worker_ratio)
        norm_informal = min(1.0, informal_settlement_pct / 100.0)
        norm_dependency = min(1.0, senior_child_dependency_ratio)

        svi_score = (
            (norm_density * 35.0) +
            (norm_workers * 30.0) +
            (norm_informal * 20.0) +
            (norm_dependency * 15.0)
        )

        return {
            "socialVulnerabilityScore": round(svi_score, 1),
            "normalizedDensity": round(norm_density, 3),
            "normalizedOutdoorWorkers": round(norm_workers, 3),
            "normalizedInformalHousing": round(norm_informal, 3),
            "normalizedDependency": round(norm_dependency, 3),
            "provenance": "DERIVED"
        }
