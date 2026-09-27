// weatherImpactEngine — NEXORA's Digital Twin causal model.
// Takes the LIVE weather (real API values, or What-If slider values) plus
// the real EventDataContext baseline and derives simulated downstream state:
//   Heavy Rain -> outdoor movement down -> indoor occupancy up -> routes may
//   run longer -> transport demand shifts -> arrival clustering may rise ->
//   gate pressure changes -> volunteer requirement changes -> restaurant
//   demand/wait time may change.
// These are NEXORA model estimates, not guaranteed real-world predictions.
// The formulas are transparent/illustrative and NEVER write back to the
// real EventDataContext — callers only ever receive a derived copy.

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

export const PRESETS = [
  { id: 'current', label: 'Current Weather', values: { rain: 5, temp: 28, wind: 12, storm: 0, area: 18 } },
  { id: 'heavy-rain', label: 'Heavy Rain', values: { rain: 75, temp: 24, wind: 28, storm: 45, area: 68 } },
  { id: 'extreme-heat', label: 'Extreme Heat', values: { rain: 0, temp: 42, wind: 8, storm: 0, area: 34 } },
  { id: 'severe-storm', label: 'Severe Storm', values: { rain: 95, temp: 22, wind: 65, storm: 90, area: 86 } },
];

// Converts the live OpenWeather reading into this engine's slider space, so
// the Digital Twin's "Current Weather" baseline is driven by the real API
// rather than a hardcoded guess. Storm intensity is inferred from a
// thunderstorm condition since OpenWeather doesn't expose it directly.
export function slidersFromLiveWeather(current) {
  if (!current) return PRESETS[0].values;
  const isStorm = /thunder|storm/i.test(current.condition || '');
  return {
    rain: clamp(Math.round(current.rainProbability ?? 0), 0, 100),
    temp: current.temp ?? 28,
    wind: clamp(Math.round(current.windSpeed ?? 12), 0, 80),
    storm: isStorm ? 60 : 0,
    area: clamp(Math.round((current.rainProbability ?? 10) * 0.55 + (current.windSpeed ?? 12) * 0.35), 0, 100),
  };
}

export function runSimulation({ rain, temp, wind, storm, area }, base) {
  // Normalised 0..1 pressure factors from each slider.
  const rainF = rain / 100;
  const windF = wind / 80;
  const stormF = storm / 180;
  const heatF = clamp((temp - 28) / 17, 0, 1); // above 28°C starts adding heat pressure
  const coldF = clamp((15 - temp) / 5, 0, 1);  // below 15°C adds a smaller cold pressure

  // Overall severity used for the map overlay / gate pulsing.
  const severity = clamp(rainF * 0.45 + windF * 0.25 + stormF * 0.2 + heatF * 0.1, 0, 1);

  // Per-gate impact: covered/queue-heavy gates (B, D in this venue) feel rain
  // and storm more; all gates feel some crowd-bunching under shelter.
  const gateWeights = { A: 0.8, B: 1.1, C: 0.75, D: 1.0 };
  const impactByGate = {};
  const simulatedGates = {};
  Object.entries(base.gates).forEach(([letter, val]) => {
    const w = gateWeights[letter] ?? 1;
    const impact = clamp(severity * w, 0, 1);
    impactByGate[letter] = impact;
    simulatedGates[letter] = clamp(Math.round(val + impact * 18 + heatF * 4), 5, 99);
  });

  const crowdPressureDelta = Math.round(severity * 22 + heatF * 8);
  const simulatedUtilization = clamp(base.utilization + crowdPressureDelta, 10, 99);

  const volunteerNeedExtra = Math.round(severity * 10 + heatF * 3 + coldF * 2);
  const simulatedVolunteers = base.volunteerCount + volunteerNeedExtra;

  const transportDelay = Math.round(severity * 25 + windF * 6);
  const simulatedEtaMin = base.avgEtaMin + transportDelay;

  const restaurantDemandDelta = Math.round(severity * 35 + heatF * 15 - coldF * 5);
  const hotelDemandDelta = Math.round(severity * 20 + stormF * 15);

  const affectedArea = clamp(Math.round((area ?? Math.round(severity * 100)) + (stormF * 12) + (rainF * 10)), 0, 100);
  const confidence = clamp(Math.round(76 + (1 - severity) * 18 - (stormF * 8)), 55, 96);
  const rangeLow = Math.max(0, crowdPressureDelta - 8);
  const rangeHigh = crowdPressureDelta + 10;

  return {
    severity,
    affectedArea,
    confidence,
    expectedRange: { low: rangeLow, high: rangeHigh },
    modelLabel: 'MODEL ESTIMATE',
    impactByGate,
    simulatedGates,
    crowdPressureDelta,
    simulatedUtilization,
    volunteerNeedExtra,
    simulatedVolunteers,
    transportDelay,
    simulatedEtaMin,
    restaurantDemandDelta,
    hotelDemandDelta,
  };
}
