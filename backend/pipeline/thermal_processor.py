"""
RESPIRE Satellite Thermal Calibration & Radiative Transfer Processor
=====================================================================
Processes raw USGS Landsat 8/9 TIRS Band 10 and Copernicus Sentinel-2 MSI
radiance values to compute Land Surface Temperature (LST °C) and NDVI.
"""

from typing import Dict, Any, Optional
import math

class ThermalProcessor:
    """
    Implements standard USGS/Copernicus physical radiative transfer algorithms
    for Land Surface Temperature (LST) and Normalized Difference Vegetation Index (NDVI).
    """

    # Landsat 8/9 Band 10 Thermal Calibration Constants
    K1_CONSTANT = 774.8853    # W/(m2 * sr * um)
    K2_CONSTANT = 1321.0789   # Kelvin
    ML_RAD_MULT = 0.0003342   # Radiance multiplicative scaling factor
    AL_RAD_ADD = 0.10000      # Radiance additive scaling factor

    # Emissivity Calibration Bounds
    NDVI_SOIL = 0.20
    NDVI_VEG = 0.86
    EMISSIVITY_SOIL = 0.97
    EMISSIVITY_VEG = 0.99
    EMISSIVITY_WATER = 0.995

    @classmethod
    def calculate_toa_radiance(cls, digital_number: float) -> float:
        """
        Converts Landsat Band 10 Digital Number (DN) to Top-Of-Atmosphere (TOA) Spectral Radiance (L_lambda).
        Formula: L_lambda = (M_L * DN) + A_L
        """
        return (cls.ML_RAD_MULT * digital_number) + cls.AL_RAD_ADD

    @classmethod
    def calculate_brightness_temperature(cls, toa_radiance: float) -> float:
        """
        Converts TOA Radiance to At-Sensor Brightness Temperature (T_b in Kelvin) using Planck's Law.
        Formula: T_b = K2 / ln((K1 / L_lambda) + 1)
        """
        if toa_radiance <= 0:
            return 273.15  # Fallback to 0°C in Kelvin
        return cls.K2_CONSTANT / math.log((cls.K1_CONSTANT / toa_radiance) + 1.0)

    @classmethod
    def calculate_ndvi(cls, red_reflectance: float, nir_reflectance: float) -> float:
        """
        Calculates Sentinel-2 Normalized Difference Vegetation Index (NDVI).
        Formula: NDVI = (NIR - Red) / (NIR + Red)
        """
        denom = nir_reflectance + red_reflectance
        if abs(denom) < 1e-6:
            return 0.0
        ndvi = (nir_reflectance - red_reflectance) / denom
        return max(-1.0, min(1.0, ndvi))

    @classmethod
    def calculate_fractional_vegetation_cover(cls, ndvi: float) -> float:
        """
        Calculates Fractional Vegetation Cover (FVC / P_v).
        Formula: P_v = ((NDVI - NDVI_soil) / (NDVI_veg - NDVI_soil))^2
        """
        if ndvi < cls.NDVI_SOIL:
            return 0.0
        if ndvi > cls.NDVI_VEG:
            return 1.0
        return ((ndvi - cls.NDVI_SOIL) / (cls.NDVI_VEG - cls.NDVI_SOIL)) ** 2

    @classmethod
    def calculate_surface_emissivity(cls, ndvi: float, fvc: float) -> float:
        """
        Estimates surface land emissivity (epsilon) using NDVI and FVC thresholds.
        """
        if ndvi < 0:
            return cls.EMISSIVITY_WATER  # Water body
        if ndvi < cls.NDVI_SOIL:
            return cls.EMISSIVITY_SOIL   # Bare soil / paved impervious surface
        if ndvi > cls.NDVI_VEG:
            return cls.EMISSIVITY_VEG    # Dense green canopy
        # Mixed pixels
        c_cavity = 0.005  # Cavity effect constant for surface roughness
        return (cls.EMISSIVITY_VEG * fvc) + (cls.EMISSIVITY_SOIL * (1.0 - fvc)) + c_cavity

    @classmethod
    def calculate_lst_celsius(cls, brightness_temp_k: float, emissivity: float, wavelength_um: float = 10.895) -> float:
        """
        Computes Land Surface Temperature (LST in °C) with split-window emissivity correction.
        Formula: LST = T_b / (1 + (lambda * T_b / rho) * ln(emissivity)) - 273.15
        where rho = h * c / sigma = 14388 um*K
        """
        rho = 14388.0  # um * K
        if emissivity <= 0:
            emissivity = 0.95
        corrected_temp_k = brightness_temp_k / (1.0 + ((wavelength_um * brightness_temp_k / rho) * math.log(emissivity)))
        return round(corrected_temp_k - 273.15, 2)

    @classmethod
    def process_ward_satellite_sample(cls, digital_number: float, red: float, nir: float) -> Dict[str, Any]:
        """
        Full radiative transfer pipeline for a single ward observation.
        """
        toa_rad = cls.calculate_toa_radiance(digital_number)
        bt_k = cls.calculate_brightness_temperature(toa_rad)
        ndvi = cls.calculate_ndvi(red, nir)
        fvc = cls.calculate_fractional_vegetation_cover(ndvi)
        emissivity = cls.calculate_surface_emissivity(ndvi, fvc)
        lst_c = cls.calculate_lst_celsius(bt_k, emissivity)

        return {
            "toaRadiance": round(toa_rad, 4),
            "brightnessTempK": round(bt_k, 2),
            "ndvi": round(ndvi, 3),
            "fractionalVegCover": round(fvc, 3),
            "surfaceEmissivity": round(emissivity, 4),
            "lstCelsius": lst_c,
            "provenance": "SOURCED"
        }
