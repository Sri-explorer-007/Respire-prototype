"""
RESPIRE Multi-Criteria Municipal Capital Allocation Engine
==========================================================
Ranks candidate ward interventions into an auditable investment queue:
- 50% Heat Risk Severity
- 30% Population Density / Exposure
- 20% Cost Feasibility & Implementation Readiness
"""

from typing import List, Dict, Any

class RespirePrioritizationEngine:
    """
    Computes Planning Priority Score (0-100) and allocates capital under municipal budgetary constraints.
    """

    @staticmethod
    def calculate_priority_score(
        risk_score: float,
        population_density_sqkm: float,
        estimated_budget_lakhs: float
    ) -> float:
        """
        Computes composite Planning Priority Score:
        - Risk Score: 50%
        - Density Proxy: 30% (Normalized against 40,000/sq.km cap)
        - Cost Feasibility: 20% (Lower unit cost per capita yields higher feasibility)
        """
        norm_density = min(1.0, population_density_sqkm / 40000.0) * 100.0
        # Cost feasibility: Interventions <= 10 Lakhs get max feasibility; scaled down to 50 Lakhs
        cost_clamped = max(5.0, min(50.0, estimated_budget_lakhs))
        feasibility = ((50.0 - cost_clamped) / 45.0) * 100.0

        priority_score = (
            (0.50 * risk_score) +
            (0.30 * norm_density) +
            (0.20 * feasibility)
        )
        return round(priority_score, 1)

    @classmethod
    def rank_and_allocate_budget(
        cls,
        candidate_wards: List[Dict[str, Any]],
        available_budget_lakhs: float = 50.0
    ) -> Dict[str, Any]:
        """
        Ranks wards by Priority Score and computes cumulative funding allocations.
        """
        ranked_queue: List[Dict[str, Any]] = []

        for ward in candidate_wards:
            risk = ward.get("riskScore", 70.0)
            density = ward.get("populationDensity", 20000.0)
            budget = ward.get("totalBudgetLakhs", 10.0)

            score = cls.calculate_priority_score(risk, density, budget)
            ranked_queue.append({
                **ward,
                "priorityScore": score
            })

        # Sort descending by priority score
        ranked_queue.sort(key=lambda x: x["priorityScore"], reverse=True)

        # Allocate budget
        funded_queue: List[Dict[str, Any]] = []
        cumulative_spend = 0.0

        for rank_idx, item in enumerate(ranked_queue, start=1):
            cost = item.get("totalBudgetLakhs", 10.0)
            is_funded = (cumulative_spend + cost) <= available_budget_lakhs
            if is_funded:
                cumulative_spend += cost

            funded_queue.append({
                "rank": rank_idx,
                "wardId": item.get("wardId"),
                "wardName": item.get("wardName"),
                "zoneName": item.get("zoneName"),
                "priorityScore": item["priorityScore"],
                "riskScore": item.get("riskScore"),
                "budgetLakhs": cost,
                "isFunded": is_funded,
                "cumulativeSpendLakhs": round(cumulative_spend, 2),
                "expectedCoolingC": item.get("maxExpectedCoolingC", -3.5),
                "recommendedInterventions": item.get("recommendedPackages", [])
            })

        return {
            "totalCandidates": len(funded_queue),
            "availableBudgetLakhs": available_budget_lakhs,
            "allocatedBudgetLakhs": round(cumulative_spend, 2),
            "remainingBudgetLakhs": round(available_budget_lakhs - cumulative_spend, 2),
            "fullyFundedWardsCount": sum(1 for w in funded_queue if w["isFunded"]),
            "rankedQueue": funded_queue,
            "provenance": "DERIVED"
        }
