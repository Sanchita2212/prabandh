// Shared routing/maps service for NEXORA's Journey Planner + Navigation.
// Routes are computed from live geocoding and routing APIs. The only demo seed
// data kept here is the origin suggestions list and a graceful offline fallback
// when the public APIs are blocked or rate limited.

import { VENUE_COORDS, fetchLiveWeather } from './weatherService';
import { activeEvent } from '../config/eventConfig';

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
const OSRM_URL = 'https://router.project-osrm.org/route/v1';

export const DESTINATION = { ...activeEvent.destination, ...VENUE_COORDS, name: activeEvent.destination.name };
export const ORIGIN_SUGGESTIONS = ['Dombivli, Maharashtra', 'Thane, Maharashtra', 'Vashi, Navi Mumbai', 'Kalyan, Maharashtra', 'Panvel, Navi Mumbai', 'Mumbai CST'];
export const ROUTE_PREFERENCES = [
  { id: 'fastest', label: 'Fastest' },
  { id: 'shortest', label: 'Shortest' },
  { id: 'weather-aware', label: 'Weather-aware' },
];

const KNOWN_PLACES = {
  dombivli: { lat: 19.2183, lon: 73.0864 },
  thane: { lat: 19.2183, lon: 72.9781 },
  vashi: { lat: 19.0771, lon: 73.0004 },
  kalyan: { lat: 19.2437, lon: 73.1355 },
  panvel: { lat: 18.9894, lon: 73.1175 },
  mumbai: { lat: 18.9401, lon: 72.8352 },
  'navi mumbai': { lat: 19.0330, lon: 73.0297 },
  pune: { lat: 18.5204, lon: 73.8567 },
};

const MODES = {
  driving: { label: 'Driving', osrmProfile: 'driving', avgKmh: 32 },
  walking: { label: 'Walking', osrmProfile: 'foot', avgKmh: 4.8 },
  publicTransport: { label: 'Public Transport', osrmProfile: 'driving', avgKmh: 18 },
};
export const TRAVEL_MODES = Object.keys(MODES).map(id => ({ id, label: MODES[id].label }));

function toRad(v) { return (v * Math.PI) / 180; }
export function haversineKm(a, b) {
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}

export async function geocode(query) {
  const q = (query || '').trim();
  if (!q) throw new Error('Enter a starting location');

  try {
    const url = `${NOMINATIM_URL}?format=json&limit=1&q=${encodeURIComponent(q)}`;
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error('Geocoding request failed');
    const data = await res.json();
    if (data && data[0]) {
      return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon), name: q, isDemo: false };
    }
    throw new Error('No geocode match found');
  } catch (error) {
    const key = Object.keys(KNOWN_PLACES).find(k => q.toLowerCase().includes(k));
    const coords = KNOWN_PLACES[key] || KNOWN_PLACES.mumbai;
    return { ...coords, name: q, isDemo: true };
  }
}

function maneuverText(step) {
  const m = step.maneuver || {};
  const road = step.name ? ` onto ${step.name}` : '';
  if (m.type === 'arrive') return 'Arrive at destination';
  if (m.type === 'depart') return `Head out${road}`;
  if (m.type === 'roundabout') return `Go through the roundabout${road}`;
  if (m.modifier) return `Turn ${m.modifier}${road}`;
  return `Continue${road}`;
}

async function osrmRoute(origin, destination, modeId = 'driving') {
  const profile = MODES[modeId]?.osrmProfile || 'driving';
  const url = `${OSRM_URL}/${profile}/${origin.lon},${origin.lat};${destination.lon},${destination.lat}?overview=full&geometries=geojson&steps=true&alternatives=true`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Routing request failed');
  const data = await res.json();
  if (!data.routes || !data.routes.length) throw new Error('No route found');
  return data.routes;
}

function buildFallbackGeometry(origin, destination, segments = 18) {
  const coords = [];
  const latStep = (destination.lat - origin.lat) / segments;
  const lonStep = (destination.lon - origin.lon) / segments;

  for (let index = 0; index <= segments; index += 1) {
    coords.push([
      origin.lon + (lonStep * index),
      origin.lat + (latStep * index),
    ]);
  }

  return { type: 'LineString', coordinates: coords };
}

function estimateRoute(origin, destination, modeId = 'driving') {
  const mode = MODES[modeId] || MODES.driving;
  const baseDistanceKm = haversineKm(origin, destination) * (modeId === 'publicTransport' ? 1.5 : 1.25);
  const durationMin = Math.max(3, Math.round((baseDistanceKm / mode.avgKmh) * 60));

  return {
    isEstimate: true,
    distanceKm: Math.round(baseDistanceKm * 10) / 10,
    durationMin,
    steps: [
      { instruction: `Start from ${origin.name} and head towards ${destination.name}`, distanceKm: Math.round(baseDistanceKm * 10) / 10 },
      { instruction: `Arrive at ${destination.name}`, distanceKm: 0 },
    ],
    geometry: buildFallbackGeometry(origin, destination),
  };
}

function selectPreferredRoute(routes, preference = 'fastest') {
  const normalized = [...routes].map(route => ({
    ...route,
    score: preference === 'shortest' ? route.distanceKm : preference === 'weather-aware' ? route.durationMin + route.distanceKm * 0.75 : route.durationMin,
  }));
  normalized.sort((a, b) => a.score - b.score);
  return normalized;
}

export async function computeRoute(origin, destination = DESTINATION, modeId = 'driving', preference = 'fastest') {
  const target = destination && typeof destination === 'object' ? destination : DESTINATION;
  const safeMode = MODES[modeId] ? modeId : 'driving';

  try {
    const liveWeather = await fetchLiveWeather();
    const weatherPenalty = liveWeather && (liveWeather.condition === 'Rain' || liveWeather.condition === 'Drizzle' || liveWeather.condition === 'Thunderstorm' || liveWeather.windSpeed >= 30) ? 1.15 : 1;

    if (MODES[safeMode]?.osrmProfile) {
      const routes = await osrmRoute(origin, target, safeMode);
      const toRoute = (r, index) => {
        const distanceKm = Math.round((r.distance / 1000) * 10) / 10;
        const durationMin = Math.max(3, Math.round((r.duration / 60) * (safeMode === 'publicTransport' ? 1.2 : 1) * weatherPenalty));
        return {
          id: `${safeMode}-route-${index}`,
          isEstimate: false,
          distanceKm,
          durationMin,
          steps: (r.legs?.[0]?.steps || []).map(s => ({
            instruction: maneuverText(s),
            distanceKm: Math.round((s.distance / 1000) * 10) / 10,
          })).filter(s => s.distanceKm > 0 || s.instruction.startsWith('Arrive')),
          geometry: r.geometry,
        };
      };

      const built = routes.map((route, index) => toRoute(route, index));
      const ordered = selectPreferredRoute(built, preference);
      const [primary, alternative] = ordered;

      return {
        primary,
        alternative: alternative && alternative.id !== primary.id ? alternative : null,
        origin,
        destination: target,
        mode: safeMode,
        preference,
      };
    }

    const estimate = estimateRoute(origin, target, safeMode);
    return { primary: estimate, alternative: null, origin, destination: target, mode: safeMode, preference };
  } catch (error) {
    const fallback = estimateRoute(origin, target, safeMode);
    fallback.isDemo = true;
    fallback.geometry = buildFallbackGeometry(origin, target);
    return { primary: fallback, alternative: null, origin, destination: target, mode: safeMode, preference };
  }
}
