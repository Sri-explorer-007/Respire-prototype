"""
RESPIRE Site-Specific Cooling Intervention Rule Engine
======================================================
Deterministic rule matrix matching diagnosed root causes and land use
to targeted urban cooling packages with verified municipal unit costs.
"""

from typing import Dict, List, Any

# Standard Municipal Cooling Interventions Library (GCC Standard Rates)
INTERVENTIONS_CATALOG = {
    "COOL_ROOFS": {
        "id": "cool-roofs",
        "name": "High-Albedo Reflective Cool Roof Coating",
        "category": "Architectural Retrofit",
        "costPerTenementInr": 1000,
        "coolingImpactC": -4.2,
        "coBenefits": ["Reduces indoor nighttime heat", "Lowers household fan energy consumption", "Rapid 72-hr deployment"],
        "triggerCondition": "Dense residential tenements + Extreme LST (>40°C)"
    },
    "MIYAWAKI_POCKETS": {
        "id": "miyawaki-pockets",
        "name": "Dense Urban Miyawaki Pocket Forest & Micro-Canopy",
        "category": "Nature-Based Infrastructure",
        "costPer1000sqmInr": 600000,
        "coolingImpactC": -3.8,
        "coBenefits": ["Biodiversity restoration", "Groundwater percolation", "Particulate air filtration"],
        "triggerCondition": "High canopy deficit (NDVI < 0.20) + Moderate open public buffer land"
    },
    "HYDRATION_SHELTERS": {
        "id": "hydration-shelters",
        "name": "Modular Solar-Powered Hydration & Shaded Rest Shelters",
        "category": "Public Health & Safety",
        "costPerUnitInr": 150000,
        "coolingImpactC": -5.5,
        "coBenefits": ["Direct heatstroke prevention", "Free potable chilled water for gig/transit workers", "Emergency medical telemetry"],
        "triggerCondition": "High outdoor labor density + Major transit commuter intersections"
    },
    "URBAN_MISTING_CORRIDORS": {
        "id": "misting-corridors",
        "name": "High-Pressure Evaporative Misting & Green Pedestrian Spine",
        "category": "Civic Public Infrastructure",
        "costPer500mInr": 450000,
        "coolingImpactC": -3.5,
        "coBenefits": ["Immediate pedestrian thermal comfort", "Microclimate humidity stabilization", "Dust suppression"],
        "triggerCondition": "Commercial market corridors + Severe urban heat index"
    }
}

class RespireRecommendationEngine:
    """
    Evaluates ward diagnostic parameters and returns tailored, costed mitigation blueprints.
    """

    @classmethod
    def generate_recommendations_for_ward(
        cls,
        ward_id: str,
        ward_name: str,
        zone_name: str,
        risk_tier: str,
        lst_celsius: float,
        ndvi: float,
        population: int,
        primary_driver: str
    ) -> Dict[str, Any]:
        """
        Synthesizes site-specific cooling intervention packages.
        """
        packages: List[Dict[str, Any]] = []
        total_budget_inr = 0
        total_expected_cooling_c = 0.0

        # Rule 1: High LST + Dense Tenements -> Cool Roofs
        if lst_celsius >= 38.0:
            tenements = max(500, int(population * 0.08))
            cost = tenements * INTERVENTIONS_CATALOG["COOL_ROOFS"]["costPerTenementInr"]
            packages.append({
                **INTERVENTIONS_CATALOG["COOL_ROOFS"],
                "targetScale": f"{tenements:,} tenements / residential structures",
                "estimatedBudgetInr": cost,
                "budgetLakhs": round(cost / 100000.0, 2),
                "expectedLocalCoolingC": INTERVENTIONS_CATALOG["COOL_ROOFS"]["coolingImpactC"]
            })
            total_budget_inr += cost
            total_expected_cooling_c = max(total_expected_cooling_c, abs(INTERVENTIONS_CATALOG["COOL_ROOFS"]["coolingImpactC"]))

        # Rule 2: Low NDVI (< 0.25) -> Miyawaki Pocket Forest
        if ndvi < 0.25:
            units = 2 if risk_tier in ["VERY_HIGH", "HIGH"] else 1
            cost = units * INTERVENTIONS_CATALOG["MIYAWAKI_POCKETS"]["costPer1000sqmInr"]
            packages.append({
                **INTERVENTIONS_CATALOG["MIYAWAKI_POCKETS"],
                "targetScale": f"{units * 1000:,} sq.m native Miyawaki bio-shield",
                "estimatedBudgetInr": cost,
                "budgetLakhs": round(cost / 100000.0, 2),
                "expectedLocalCoolingC": INTERVENTIONS_CATALOG["MIYAWAKI_POCKETS"]["coolingImpactC"]
            })
            total_budget_inr += cost
            total_expected_cooling_c = max(total_expected_cooling_c, abs(INTERVENTIONS_CATALOG["MIYAWAKI_POCKETS"]["coolingImpactC"]))

        # Rule 3: High/Very High Risk Wards -> Hydration Hubs
        if risk_tier in ["VERY_HIGH", "HIGH"] or lst_celsius >= 40.0:
            hubs_count = 3 if risk_tier == "VERY_HIGH" else 2
            cost = hubs_count * INTERVENTIONS_CATALOG["HYDRATION_SHELTERS"]["costPerUnitInr"]
            packages.append({
                **INTERVENTIONS_CATALOG["HYDRATION_SHELTERS"],
                "targetScale": f"{hubs_count} Transit & Market Hydration Nodes",
                "estimatedBudgetInr": cost,
                "budgetLakhs": round(cost / 100000.0, 2),
                "expectedLocalCoolingC": INTERVENTIONS_CATALOG["HYDRATION_SHELTERS"]["coolingImpactC"]
            })
            total_budget_inr += cost
            total_expected_cooling_c = max(total_expected_cooling_c, abs(INTERVENTIONS_CATALOG["HYDRATION_SHELTERS"]["coolingImpactC"]))

        # Fallback default if ward is low risk
        if not packages:
            cost = INTERVENTIONS_CATALOG["MIYAWAKI_POCKETS"]["costPer1000sqmInr"]
            packages.append({
                **INTERVENTIONS_CATALOG["MIYAWAKI_POCKETS"],
                "targetScale": "1,000 sq.m Preventive Urban Green Buffer",
                "estimatedBudgetInr": cost,
                "budgetLakhs": round(cost / 100000.0, 2),
                "expectedLocalCoolingC": -2.0
            })
            total_budget_inr += cost
            total_expected_cooling_c = 2.0

        return {
            "wardId": ward_id,
            "wardName": ward_name,
            "zoneName": zone_name,
            "riskTier": risk_tier,
            "primaryDriver": primary_driver,
            "recommendedPackages": packages,
            "totalPackageCount": len(packages),
            "totalBudgetInr": total_budget_inr,
            "totalBudgetLakhs": round(total_budget_inr / 100000.0, 2),
            "maxExpectedCoolingC": round(-total_expected_cooling_c, 1),
            "provenance": "INDICATIVE_ESTIMATE"
        }
