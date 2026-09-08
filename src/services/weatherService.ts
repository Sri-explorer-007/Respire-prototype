/**
 * RESPIRE Live Meteorological Telemetry Ingestion Service
 * 
 * Ingests real-time atmospheric telemetry for Greater Chennai Corporation coordinates:
 * - Latitude: 13.0827° N, Longitude: 80.2707° E
 * - Source: Open-Meteo High-Resolution Meteorological API (free, open, no auth key required)
 * - Fallback: Calibrated baseline telemetry when network is unavailable.
 */

export interface LiveWeatherData {
  timestamp: string;
  temperatureC: number;
  apparentTemperatureC: number;
  relativeHumidityPercent: number;
  windSpeedKmh: number;
  solarRadiationWm2: number;
  heatIndexC: number;
  wbgtEstimateC: number;
  heatAlertLevel: 'NORMAL' | 'CAUTION' | 'EXTREME_CAUTION' | 'DANGER';
  isLive: boolean;
  forecastHourly?: {
    time: string[];
    temperature: number[];
  };
}

const CHENNAI_LAT = 13.0827;
const CHENNAI_LNG = 80.2707;
const CACHE_KEY = 'respire_live_weather_chennai';
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Calculates NOAA Heat Index from temperature in °C and relative humidity %
 */
function calculateHeatIndex(tempC: number, rh: number): number {
  const T = (tempC * 9) / 5 + 32; // Fahrenheit
  const R = rh;

  if (T < 80) {
    return Number((0.5 * (T + 61.0 + (T - 68.0) * 1.2 + R * 0.094)).toFixed(1));
  }

  // Rothfusz regression
  let hi =
    -42.379 +
    2.04901523 * T +
    10.14333127 * R -
    0.22475541 * T * R -
    0.00683783 * T * T -
    0.05481717 * R * R +
    0.00122874 * T * T * R +
    0.00085282 * T * R * R -
    0.00000199 * T * T * R * R;

  // Convert back to Celsius
  const hiC = ((hi - 32) * 5) / 9;
  return Number(hiC.toFixed(1));
}

/**
 * Calculates simplified indoor/shaded Wet-Bulb Globe Temperature (WBGT) proxy
 * Formula approximation: WBGT ≈ 0.7 * Tw + 0.3 * Ta (where Tw is wet-bulb temp)
 */
function calculateWbgtProxy(tempC: number, rh: number): number {
  // Stull (2011) wet-bulb approximation
  const Tw =
    tempC * Math.atan(0.151977 * Math.pow(rh + 8.313659, 0.5)) +
    Math.atan(tempC + rh) -
    Math.atan(rh - 1.676331) +
    0.00391838 * Math.pow(rh, 1.5) * Math.atan(0.023101 * rh) -
    4.686035;

  const wbgt = 0.7 * Tw + 0.3 * tempC;
  return Number(wbgt.toFixed(1));
}

function resolveAlertLevel(
  heatIndexC: number
): 'NORMAL' | 'CAUTION' | 'EXTREME_CAUTION' | 'DANGER' {
  if (heatIndexC >= 41.0) return 'DANGER';
  if (heatIndexC >= 36.0) return 'EXTREME_CAUTION';
  if (heatIndexC >= 30.0) return 'CAUTION';
  return 'NORMAL';
}

/**
 * Baseline fallback when offline
 */
const CALIBRATED_BASELINE: LiveWeatherData = {
  timestamp: new Date().toISOString(),
  temperatureC: 38.4,
  apparentTemperatureC: 44.2,
  relativeHumidityPercent: 68,
  windSpeedKmh: 14.5,
  solarRadiationWm2: 820,
  heatIndexC: 46.1,
  wbgtEstimateC: 31.8,
  heatAlertLevel: 'DANGER',
  isLive: false,
};

export async function fetchChennaiLiveWeather(forceRefresh = false): Promise<LiveWeatherData> {
  // 1. Check local cache if not forcing refresh
  if (!forceRefresh && typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached) as { data: LiveWeatherData; cachedAt: number };
        if (Date.now() - parsed.cachedAt < CACHE_TTL_MS) {
          return parsed.data;
        }
      }
    } catch {
      // ignore
    }
  }

  // 2. Fetch live data from Open-Meteo
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${CHENNAI_LAT}&longitude=${CHENNAI_LNG}&current=temperature_2m,relative_humidity_2m,apparent_temperature,direct_radiation,wind_speed_10m&hourly=temperature_2m&forecast_days=3&timezone=Asia%2FKolkata`;
    const response = await fetch(url, { signal: AbortSignal.timeout(5000) });

    if (!response.ok) {
      throw new Error(`Open-Meteo responded with status ${response.status}`);
    }

    const data = await response.json();
    const current = data.current;

    const tempC = Number(current.temperature_2m.toFixed(1));
    const rh = Number(current.relative_humidity_2m);
    const appTemp = Number(current.apparent_temperature.toFixed(1));
    const windSpeed = Number(current.wind_speed_10m.toFixed(1));
    const radiation = Number((current.direct_radiation || 750).toFixed(0));

    const heatIndex = calculateHeatIndex(tempC, rh);
    const wbgt = calculateWbgtProxy(tempC, rh);
    const alertLevel = resolveAlertLevel(heatIndex);

    const liveResult: LiveWeatherData = {
      timestamp: current.time || new Date().toISOString(),
      temperatureC: tempC,
      apparentTemperatureC: appTemp,
      relativeHumidityPercent: rh,
      windSpeedKmh: windSpeed,
      solarRadiationWm2: radiation,
      heatIndexC: heatIndex,
      wbgtEstimateC: wbgt,
      heatAlertLevel: alertLevel,
      isLive: true,
      forecastHourly: {
        time: data.hourly?.time?.slice(0, 24) || [],
        temperature: data.hourly?.temperature_2m?.slice(0, 24) || [],
      },
    };

    // Cache locally
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({ data: liveResult, cachedAt: Date.now() })
        );
      } catch {
        // ignore
      }
    }

    return liveResult;
  } catch (error) {
    console.warn('[RESPIRE Telemetry] Using calibrated baseline due to offline or fetch error:', error);
    return {
      ...CALIBRATED_BASELINE,
      timestamp: new Date().toISOString(),
    };
  }
}
