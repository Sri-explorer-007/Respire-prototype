"""
RESPIRE Pydantic Data Models & API Schemas
==========================================
Enforces strict type safety and field validation across API endpoints.
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class ProvenanceMetadata(BaseModel):
    source: str = "USGS Landsat 8/9 & Copernicus Sentinel-2"
    calibrationDate: str = "2026-09-09"
    accuracyStandard: str = "NDMA / GCC Heat Action Plan"
    deterministicFormula: str = "50% LST + 20% Veg Deficit + 30% Social Vulnerability"

class PointContributions(BaseModel):
    heatPoints: float
    maxHeatPoints: float = 50.0
    vegPoints: float
    maxVegPoints: float = 20.0
    vulnPoints: float
    maxVulnPoints: float = 30.0

class DriverBreakdown(BaseModel):
    heatSeverityNormalized: float
    vegetationDeficitNormalized: float
    socialVulnerabilityNormalized: float

class WardDetailResponse(BaseModel):
    id: str
    wardNumber: int
    name: str
    zoneNumber: int
    zoneName: str
    region: str
    lstCelsius: Optional[float]
    ndvi: Optional[float]
    population: int
    populationDensitySqKm: float
    riskScore: Optional[float]
    riskTier: str
    isAnalyzable: bool
    status: str
    primaryDriver: str
    secondaryDriver: Optional[str] = None
    pointContributions: Optional[PointContributions] = None
    driverBreakdown: Optional[DriverBreakdown] = None
    completenessRatio: float

class WardListResponse(BaseModel):
    totalWards: int
    totalAnalyzable: int
    unscoredCount: int
    zonesMonitored: int
    wards: List[WardDetailResponse]

class InterventionPackage(BaseModel):
    id: str
    name: str
    category: str
    targetScale: str
    estimatedBudgetInr: int
    budgetLakhs: float
    expectedLocalCoolingC: float
    coBenefits: List[str]

class WardRecommendationResponse(BaseModel):
    wardId: str
    wardName: str
    zoneName: str
    riskTier: str
    primaryDriver: str
    recommendedPackages: List[InterventionPackage]
    totalBudgetLakhs: float
    maxExpectedCoolingC: float

class PrioritizedWardItem(BaseModel):
    rank: int
    wardId: str
    wardName: str
    zoneName: str
    priorityScore: float
    riskScore: Optional[float]
    budgetLakhs: float
    isFunded: bool
    cumulativeSpendLakhs: float
    expectedCoolingC: float

class PrioritizationQueueResponse(BaseModel):
    totalCandidates: int
    availableBudgetLakhs: float
    allocatedBudgetLakhs: float
    remainingBudgetLakhs: float
    fullyFundedWardsCount: int
    rankedQueue: List[PrioritizedWardItem]

class LiveWeatherResponse(BaseModel):
    city: str = "Chennai, Tamil Nadu"
    temperatureC: float
    relativeHumidityPct: float
    apparentTemperatureC: float
    heatIndexC: float
    windSpeedKmh: float
    solarRadiationWm2: float
    timestamp: str
    heatIndexCategory: str
    advisory: str
