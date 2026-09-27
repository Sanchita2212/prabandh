import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, ArrowRight, BusFront, CarFront, CheckCircle2, Clock3, CloudRain, Footprints, MapPin, Navigation as Nav, Route as RouteIcon, Sparkles, Users } from 'lucide-react';
import { CircleMarker, MapContainer, Polyline, TileLayer, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import PageHeader from '../../components/ui/PageHeader';
import Badge from '../../components/ui/Badge';
import LoadingState from '../../components/ui/LoadingState';
import { activeEvent } from '../../config/eventConfig';
import { useEventData } from '../../context/EventDataContext';
import { useJourney } from '../../context/JourneyContext';
import { ORIGIN_SUGGESTIONS, ROUTE_PREFERENCES, TRAVEL_MODES, haversineKm } from '../../services/routingService';
import useWeather from '../../hooks/useWeather';

const stadiumStops = [
  { id: 'metro', name: 'Navi Mumbai Metro', type: 'Transit', eta: '8 min', coords: [19.0325, 73.0305], route: 'Metro station → Gate A' },
  { id: 'shuttle', name: 'Event Shuttle Bay', type: 'Shuttle', eta: '5 min', coords: [19.0176, 73.0351], route: 'Shuttle bay → Entrance path' },
  { id: 'parking', name: 'Main Parking P1', type: 'Parking', eta: '12 min', coords: [19.0134, 73.0292], route: 'Parking → Gate C' },
  { id: 'food', name: 'Food Court', type: 'Food', eta: '6 min', coords: [19.0198, 73.0338], route: 'Gate B → food court' },
  { id: 'medical', name: 'Medical Point', type: 'Medical', eta: '4 min', coords: [19.0197, 73.0295], route: 'Central lane → medical point' },
  { id: 'gate-a', name: 'Gate A', type: 'Entry', eta: '3 min', coords: [19.0221, 73.0280], route: 'North entry lane' },
  { id: 'gate-c', name: 'Gate C', type: 'Entry', eta: '4 min', coords: [19.0145, 73.0328], route: 'South entry lane' },
];

const stadiumRoutes = [
  { id: 'metro-gate-a', points: [[19.0325, 73.0305], [19.0281, 73.0301], [19.0221, 73.0280]], color: '#7ee7b2' },
  { id: 'parking-gate-c', points: [[19.0134, 73.0292], [19.0148, 73.0312], [19.0145, 73.0328]], color: '#f6c86a' },
  { id: 'shuttle-centre', points: [[19.0176, 73.0351], [19.0186, 73.0338], [19.0198, 73.0338]], color: '#58b7ff' },
  { id: 'food-medical', points: [[19.0198, 73.0338], [19.0197, 73.0295]], color: '#ff9a86' },
];

const CITY_START_OPTIONS = ['Mumbai, Maharashtra', 'Navi Mumbai, Maharashtra', 'Thane, Maharashtra', 'Pune, Maharashtra', 'Panvel, Maharashtra', 'Kalyan, Maharashtra', 'Dombivli, Maharashtra'];

const modeIcon = { driving: <CarFront />, walking: <Footprints />, publicTransport: <BusFront /> };
const APPLE_MAP_LAYER = {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
};

function FitMapToRoute({ points }) {
  const map = useMap();

  useEffect(() => {
    if (!points || points.length === 0) return;
    if (points.length === 1) {
      map.setView(points[0], 13);
      return;
    }

    const bounds = L.latLngBounds(points);
    map.fitBounds(bounds.pad(0.35));
  }, [map, points]);

  return null;
}

export default function Navigate() {
  const { crowd, venueLocations } = useEventData();
  const { journey, status, error, planJourney, updateJourney } = useJourney();
  const { current: weather, loading: weatherLoading } = useWeather();

  const [originName, setOriginName] = useState(journey?.originName || ORIGIN_SUGGESTIONS[0]);
  const [selectedOriginPoint, setSelectedOriginPoint] = useState(journey?.origin || null);
  const [destinationName, setDestinationName] = useState(journey?.destinationName || activeEvent.destination.name);
  const [originSuggestions, setOriginSuggestions] = useState([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState([]);
  const [mode, setMode] = useState(journey?.mode || 'driving');
  const [preference, setPreference] = useState(journey?.preference || 'fastest');
  const [after, setAfter] = useState(false);
  const [showTripSimulation, setShowTripSimulation] = useState(false);

  const fetchSuggestions = async (query, setSuggestions) => {
    const clean = (query || '').trim();
    if (clean.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&q=${encodeURIComponent(clean)}`);
      if (!res.ok) throw new Error('Search failed');
      const data = await res.json();
      const normalized = (data || []).map(item => ({
        id: `${item.place_id}-${item.display_name}`,
        name: item.display_name,
        lat: Number(item.lat),
        lon: Number(item.lon),
      }));
      setSuggestions(normalized);
    } catch {
      const fallback = [...ORIGIN_SUGGESTIONS, ...CITY_START_OPTIONS].filter(item => item.toLowerCase().includes(clean.toLowerCase())).slice(0, 5).map(item => ({
        id: item,
        name: item,
        lat: null,
        lon: null,
      }));
      setSuggestions(fallback);
    }
  };

  useEffect(() => {
    if (journey) {
      setOriginName(journey.originName || originName);
      setSelectedOriginPoint(journey.origin || null);
      setDestinationName(journey.destinationName || destinationName);
      setMode(journey.mode || mode);
      setPreference(journey.preference || preference);
    }
  }, [journey]);

  const destinationOptions = useMemo(() => {
    const values = [
      { id: 'venue', name: activeEvent.destination.name, type: 'Venue' },
      ...venueLocations.filter(item => item.type === 'Gate').map(item => ({ id: item.id, name: item.name, type: item.type })),
      { id: 'food-court', name: 'Food Court', type: 'Food' },
      { id: 'parking', name: 'Main Parking', type: 'Parking' },
    ];

    return values.filter((item, index, arr) => arr.findIndex(entry => entry.name === item.name) === index);
  }, [venueLocations]);

  const bestGate = useMemo(() => Object.entries(crowd.gates).sort((a, b) => a[1] - b[1])[0], [crowd]);
  const planned = status === 'ready' && !!journey;
  const route = journey?.route?.primary || null;
  const routePoints = route?.geometry?.coordinates ? route.geometry.coordinates.map(([lng, lat]) => [lat, lng]) : [];
  const routeOriginPoint = journey?.route?.origin ? [journey.route.origin.lat, journey.route.origin.lon] : selectedOriginPoint && selectedOriginPoint.lat != null && selectedOriginPoint.lon != null ? [selectedOriginPoint.lat, selectedOriginPoint.lon] : [19.033, 73.0297];
  const destinationPoint = journey?.route?.destination ? [journey.route.destination.lat, journey.route.destination.lon] : [activeEvent.destination.lat, activeEvent.destination.lon];
  const previewRoutePoints = useMemo(() => {
    if (routePoints.length > 0) return routePoints;
    const originLat = routeOriginPoint[0];
    const originLng = routeOriginPoint[1];
    const destLat = destinationPoint[0];
    const destLng = destinationPoint[1];
    const segments = 18;
    const points = [];
    const latStep = (destLat - originLat) / segments;
    const lngStep = (destLng - originLng) / segments;
    for (let index = 0; index <= segments; index += 1) {
      points.push([originLat + (latStep * index), originLng + (lngStep * index)]);
    }
    return points;
  }, [routePoints, routeOriginPoint, destinationPoint]);
  const rainy = weather && !weatherLoading && /rain|storm|drizzle|thunder/i.test(weather.condition || '');
  const windy = weather && !weatherLoading && weather.windSpeed >= 30;

  const tripSimulation = useMemo(() => {
    const gateStats = Object.entries(crowd?.gates || {}).map(([name, pressure]) => ({ gate: name, pressure: Number(pressure || 0) }));
    const bestGateChoice = gateStats.length ? [...gateStats].sort((a, b) => a.pressure - b.pressure)[0] : { gate: 'C', pressure: 54 };
    const distanceKm = route?.distanceKm || Math.max(8, (haversineKm(
      { lat: routeOriginPoint[0], lon: routeOriginPoint[1] },
      { lat: destinationPoint[0], lon: destinationPoint[1] }
    ) * 1.2));
    const weatherDelay = rainy ? 12 : windy ? 8 : 0;
    const crowdDelay = crowd?.utilization > 75 ? 10 : crowd?.utilization > 60 ? 6 : 0;
    const routeMinutes = Math.max(18, Math.round((route?.durationMin || distanceKm / (mode === 'walking' ? 4.5 : mode === 'publicTransport' ? 18 : 32) * 60) + weatherDelay + crowdDelay));
    const originIsDombivli = /(dombivli)/i.test(originName || '');
    const recommendedModeKey = originIsDombivli && distanceKm > 22 ? 'publicTransport' : mode;
    const recommendedModeLabel = TRAVEL_MODES.find(item => item.id === recommendedModeKey)?.label || 'Driving';
    const gateAdvice = bestGateChoice.gate === 'B' ? 'Gate C is the calmer option for a faster arrival today.' : `Gate ${bestGateChoice.gate} has the lowest crowd pressure and is recommended.`;

    return {
      recommendedModeKey,
      recommendedModeLabel,
      bestGate: bestGateChoice.gate,
      bestGatePressure: bestGateChoice.pressure,
      estimatedArrivalMinutes: routeMinutes,
      distanceKm: Math.round(distanceKm * 10) / 10,
      recommendation: gateAdvice,
      resourcePlan: [
        `Route buffer: ${Math.max(6, weatherDelay + crowdDelay)} min added for live conditions`,
        `Recommended gate: Gate ${bestGateChoice.gate} with ${bestGateChoice.pressure}% crowd pressure`,
        originIsDombivli ? 'Dombivli-to-Nerul path should prioritise the smoother transit route and avoid Gate B queues.' : 'Use the lightest queue and keep your arrival buffer intact.'
      ],
    };
  }, [crowd, rainy, windy, route, routeOriginPoint, destinationPoint, mode, originName]);

  const handlePlanRoute = async (nextOrigin = originName, nextDestination = destinationName, nextMode = mode, nextPreference = preference) => {
    if (!nextOrigin || !nextDestination) return;
    try {
      const originInput = selectedOriginPoint && typeof selectedOriginPoint === 'object' && selectedOriginPoint.lat != null && selectedOriginPoint.lon != null
        ? { ...selectedOriginPoint, name: originName || selectedOriginPoint.name || 'Selected start point' }
        : nextOrigin;
      await planJourney(originInput, nextDestination, nextMode, nextPreference);
    } catch {
      // Error is surfaced in the UI from context.
    }
  };

  const handleModeChange = async (nextMode) => {
    setMode(nextMode);
    if (journey) {
      try {
        await updateJourney({ mode: nextMode });
      } catch {
        // Error is already surfaced via context.
      }
      return;
    }
    await handlePlanRoute(originName, destinationName, nextMode, preference);
  };

  const handleDestinationChange = async (nextDestination) => {
    setDestinationName(nextDestination);
    if (journey) {
      const nextDestinationObj = destinationOptions.find(item => item.name === nextDestination) || { name: nextDestination };
      try {
        await updateJourney({ destination: nextDestinationObj });
      } catch {
        // Error is already surfaced via context.
      }
      return;
    }
    await handlePlanRoute(originName, nextDestination, mode, preference);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSuggestions(originName, setOriginSuggestions);
    }, 250);

    return () => clearTimeout(timer);
  }, [originName]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSuggestions(destinationName, setDestinationSuggestions);
    }, 250);

    return () => clearTimeout(timer);
  }, [destinationName]);

  const onPlan = async (e) => {
    e.preventDefault();
    await handlePlanRoute();
  };

  const handleOriginSuggestionSelect = (suggestion) => {
    const selected = suggestion && suggestion.lat != null && suggestion.lon != null
      ? { lat: suggestion.lat, lon: suggestion.lon, name: suggestion.name }
      : null;

    setOriginName(suggestion?.name || suggestion || originName);
    setSelectedOriginPoint(selected);
    setOriginSuggestions([]);

    if (selected && journey) {
      updateJourney({ originName: suggestion.name, origin: selected }).catch(() => {});
    }
  };

  const handleDestinationSuggestionSelect = (suggestion) => {
    setDestinationName(suggestion?.name || suggestion || destinationName);
    setDestinationSuggestions([]);
  };

  const handleMapOriginSelect = (latlng) => {
    const lat = Number(latlng.lat);
    const lon = Number(latlng.lng);
    const customName = `Selected start point (${lat.toFixed(4)}, ${lon.toFixed(4)})`;
    setSelectedOriginPoint({ lat, lon, name: customName });
    setOriginName(customName);
    if (journey) {
      updateJourney({ originName: customName, origin: { lat, lon, name: customName } }).catch(() => {});
    }
  };

  return <>
    <PageHeader eyebrow="ATTENDEE · NAVIGATE" title="Plan your trip." subtitle="Choose your start, destination and route preference — the route updates in real time from the live service." action={<Badge tone="green">LIVE ROUTE</Badge>} />

    <div className="content-grid two-one">
      <div className="panel">
        <div className="panel-head"><div><h3><MapPin /> Route preview</h3><p>Live route map for your selected start and destination.</p></div></div>

        <div style={{ height: 320, width: '100%', marginTop: 10, borderRadius: 18, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 18px 30px rgba(15, 20, 22, 0.18)' }}>
          <MapContainer center={routeOriginPoint} zoom={11} scrollWheelZoom style={{ height: '100%', width: '100%', filter: 'saturate(0.78) contrast(1.06) brightness(1.03)' }}>
            <TileLayer
              attribution={APPLE_MAP_LAYER.attribution}
              url={APPLE_MAP_LAYER.url}
            />
            {previewRoutePoints.length > 0 && <Polyline positions={previewRoutePoints} pathOptions={{ color: '#66df97', weight: 6 }} />}
            <FitMapToRoute points={previewRoutePoints.length > 0 ? previewRoutePoints : [routeOriginPoint, destinationPoint]} />
            <CircleMarker center={routeOriginPoint} radius={8} pathOptions={{ color: '#7ee7b2', fillColor: '#7ee7b2', fillOpacity: 1 }} />
            <CircleMarker center={destinationPoint} radius={8} pathOptions={{ color: '#ffe38a', fillColor: '#ffe38a', fillOpacity: 1 }} />
          </MapContainer>
        </div>

        <div className="panel-head" style={{ marginTop: 18 }}><div><h3><MapPin /> Build your journey</h3><p>Origin, destination and route preference are all dynamic.</p></div></div>
        <form className="journey-form" onSubmit={onPlan}>
          <label>
            Starting point
            <input
              value={originName}
              onChange={e => setOriginName(e.target.value)}
              placeholder="Search start location"
              autoComplete="off"
            />
            {originSuggestions.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8, background: 'rgba(10, 15, 18, 0.76)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 8, maxHeight: 180, overflowY: 'auto' }}>
                {originSuggestions.map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleOriginSuggestionSelect(item)}
                    style={{ textAlign: 'left', background: 'transparent', border: 'none', color: '#ebf7fb', padding: '6px 8px', borderRadius: 8, cursor: 'pointer' }}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            )}
          </label>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
            {[...ORIGIN_SUGGESTIONS, ...CITY_START_OPTIONS].slice(0, 8).map(city => (
              <button
                key={city}
                type="button"
                onClick={() => handleOriginSuggestionSelect({ id: city, name: city, lat: null, lon: null })}
                style={{
                  border: '1px solid rgba(255,255,255,0.12)',
                  background: originName === city ? 'rgba(110, 228, 181, 0.18)' : 'rgba(13, 21, 26, 0.78)',
                  color: '#edf7f9',
                  borderRadius: 999,
                  padding: '8px 12px',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {city.replace(', Maharashtra', '')}
              </button>
            ))}
          </div>

          <label>
            Destination
            <input
              value={destinationName}
              onChange={e => setDestinationName(e.target.value)}
              placeholder="Search destination"
              autoComplete="off"
            />
            {destinationSuggestions.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8, background: 'rgba(10, 15, 18, 0.76)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 8, maxHeight: 180, overflowY: 'auto' }}>
                {destinationSuggestions.map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleDestinationSuggestionSelect(item)}
                    style={{ textAlign: 'left', background: 'transparent', border: 'none', color: '#ebf7fb', padding: '6px 8px', borderRadius: 8, cursor: 'pointer' }}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            )}
          </label>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
            {destinationOptions.map(option => (
              <button
                key={option.id}
                type="button"
                onClick={() => handleDestinationChange(option.name)}
                style={{
                  border: '1px solid rgba(255,255,255,0.12)',
                  background: destinationName === option.name ? 'rgba(110, 228, 181, 0.18)' : 'rgba(13, 21, 26, 0.78)',
                  color: '#edf7f9',
                  borderRadius: 999,
                  padding: '8px 12px',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {option.name}
              </button>
            ))}
          </div>

          <label>
            Travel mode
            <select value={mode} onChange={event => handleModeChange(event.target.value)}>
              {TRAVEL_MODES.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}
            </select>
          </label>

          <label>
            Route preference
            <select value={preference} onChange={event => {
              const nextPreference = event.target.value;
              setPreference(nextPreference);
              if (journey) {
                updateJourney({ preference: nextPreference }).catch(() => {});
              } else {
                handlePlanRoute(originName, destinationName, mode, nextPreference);
              }
            }}>
              {ROUTE_PREFERENCES.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}
            </select>
          </label>
        </form>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="primary-btn" onClick={onPlan} disabled={status === 'loading'} style={{ flex: 1, minWidth: 180 }}>
            <Nav /> {status === 'loading' ? 'Calculating route…' : 'Plan my route'} <ArrowRight />
          </button>
          <button type="button" className="secondary-btn" onClick={() => setShowTripSimulation(value => !value)} style={{ flex: 1, minWidth: 180 }}>
            <Sparkles /> {showTripSimulation ? 'Hide simulation' : 'Simulate trip plan'}
          </button>
        </div>

        {status === 'error' && error && <p style={{ color: '#ff8a90', fontSize: 11, marginTop: 8 }}><AlertTriangle size={13} /> {error}</p>}
      </div>

      <div className="panel journey-summary">
        <div className="panel-head"><div><h3><Sparkles /> Arrival guidance</h3><p>Route data is based on the current selection and live routing service.</p></div></div>

        <div className="journey-summary-main">
          <span>Current route</span>
          <strong>{originName} → {destinationName}</strong>
          <Badge tone={bestGate[1] >= 70 ? 'amber' : 'green'}>{bestGate[1]}% gate pressure</Badge>
        </div>

        <div className="summary-row"><Clock3 /><div><b>Estimated arrival</b><small>{planned && route ? `${route.durationMin} min by ${modeIcon[mode]}` : 'Plan a route to see ETA'}</small></div></div>
        <div className="summary-row"><Users /><div><b>Travel mode</b><small>{TRAVEL_MODES.find(item => item.id === mode)?.label || mode}</small></div></div>
        <div className="summary-row"><RouteIcon /><div><b>Preference</b><small>{ROUTE_PREFERENCES.find(item => item.id === preference)?.label || preference}</small></div></div>

        {rainy && <div className="summary-row"><CloudRain /><div><b>Weather note</b><small>{weather.description} at the venue — allow extra time on arrival.</small></div></div>}
      </div>
    </div>

    {status === 'loading' && <LoadingState label="Calculating a live route for your trip…" />}

    {status === 'error' && !journey && (
      <div className="panel" style={{ marginTop: 16 }}>
        <div className="alert-item amber"><AlertTriangle /><div><b>Route unavailable</b><p>We could not calculate a route from your selected origin. Try another location or mode.</p></div></div>
      </div>
    )}

    {(showTripSimulation || planned) && (
      <div className="panel" style={{ marginTop: 18 }}>
        <div className="panel-head">
          <div><h3><Sparkles /> Dynamic trip simulation</h3><p>Generated from live route, weather and crowd pressure so each recommendation stays data-driven.</p></div>
          <Badge tone={tripSimulation.bestGatePressure >= 75 ? 'amber' : 'green'}>BEST {tripSimulation.bestGate}</Badge>
        </div>

        <div className="route-summary">
          <b>Recommended travel option</b>
          <strong>{tripSimulation.recommendedModeLabel}</strong>
          <span>{tripSimulation.distanceKm} km · approx. {tripSimulation.estimatedArrivalMinutes} min</span>
        </div>

        <div className="route-summary">
          <b>Best gate to reduce crowd</b>
          <strong>Gate {tripSimulation.bestGate}</strong>
          <span>{tripSimulation.recommendation}</span>
        </div>

        <div className="route-summary">
          <b>Resource allocation plan</b>
          <strong>Arrival buffer enabled</strong>
          <span>{tripSimulation.resourcePlan[0]}</span>
        </div>

        <div style={{ display: 'grid', gap: 8, marginTop: 14 }}>
          {tripSimulation.resourcePlan.map((item, index) => (
            <div key={item} className="journey-option">
              <div className="mode-icon"><CheckCircle2 size={15} /></div>
              <div>
                <b>Simulation step {index + 1}</b>
                <small>{item}</small>
              </div>
            </div>
          ))}
        </div>
      </div>
    )}

    {planned && route && (
      <div className="content-grid two-one" style={{ marginTop: 18 }}>
        <div className="panel">
          <div className="panel-head">
            <div><h3>{modeIcon[journey.mode || mode]} Route result</h3><p>{journey.originName} → {journey.destinationName || destinationName}</p></div>
            <Badge tone={route.isDemo ? 'amber' : 'green'}>{route.isDemo ? 'OFFLINE ESTIMATE' : route.isEstimate ? 'ESTIMATED ROUTE' : 'LIVE ROUTE'}</Badge>
          </div>

          <div className="route-summary">
            <b>Origin / Destination</b>
            <strong>{journey.originName}</strong>
            <span>{journey.destinationName || destinationName}</span>
          </div>

          <div className="route-summary">
            <b>Distance / ETA</b>
            <strong>{route.durationMin} min</strong>
            <span>{route.distanceKm} km · {mode}</span>
          </div>

          {journey.route.alternative && (
            <div className="journey-option" style={{ marginTop: 14 }}>
              <div className="mode-icon"><RouteIcon /></div>
              <div>
                <b>Alternative route available</b>
                <small>{journey.route.alternative.distanceKm} km · {journey.route.alternative.durationMin} min</small>
              </div>
              <Badge tone="blue">ALT</Badge>
            </div>
          )}
        </div>

        <div className="panel">
          <div className="panel-head"><div><h3><Sparkles /> Route steps</h3><p>Turn-by-turn guidance from the calculated route.</p></div></div>

          {route.steps && route.steps.length ? route.steps.slice(0, 6).map((step, index) => (
            <div className="journey-option" key={`${step.instruction}-${index}`}>
              <div className="mode-icon">{index === 0 ? modeIcon[journey.mode || mode] : <ArrowRight size={16} />}</div>
              <div>
                <b>{step.instruction}</b>
                {step.distanceKm > 0 && <small>{step.distanceKm} km</small>}
              </div>
            </div>
          )) : <div className="alert-item amber"><AlertTriangle /><div><b>Route steps unavailable</b><p>The live route was returned without step metadata.</p></div></div>}

          <div className="panel-head" style={{ marginTop: 14 }}><div><h3>Smart arrival</h3></div></div>
          <div className="route-summary"><b>Recommended gate</b><strong>Gate {bestGate[0]}</strong><span>{bestGate[1]}% occupancy · lowest crowd pressure right now</span></div>
          {rainy && <div className="alert-item amber"><CloudRain /><div><b>Rain warning</b><p>Leave a little extra buffer to stay comfortable and avoid wet-surface delays.</p></div></div>}
          {windy && <div className="alert-item amber"><AlertTriangle /><div><b>High wind</b><p>Consider the shorter covered route if one is available near your destination.</p></div></div>}
          {!rainy && !windy && <div className="alert-item green"><CheckCircle2 /><div><b>Conditions look good</b><p>Current weather is stable for the route you selected.</p></div></div>}
        </div>
      </div>
    )}

    {!planned && status !== 'loading' && status !== 'error' && (
      <div className="panel" style={{ marginTop: 18 }}>
        <div className="alert-item blue"><MapPin /><div><b>No route planned yet</b><p>Select your origin and destination to generate a route and live navigation guidance.</p></div></div>
      </div>
    )}

    {journey && journey.route?.alternative && (
      <div className="panel" style={{ marginTop: 18 }}>
        <div className="panel-head"><div><h3><RouteIcon /> Alternative route</h3><p>Alternate path when you prefer a different balance of speed and distance.</p></div></div>
        <div className="route-summary"><b>Alternative</b><strong>{journey.route.alternative.durationMin} min</strong><span>{journey.route.alternative.distanceKm} km · {journey.mode}</span></div>
      </div>
    )}

    {status === 'ready' && journey && !route && (
      <div className="panel" style={{ marginTop: 16 }}>
        <div className="alert-item amber"><AlertTriangle /><div><b>Selected route is unavailable</b><p>We have a saved route selection but no valid return payload from the routing service.</p></div></div>
      </div>
    )}
  </>;
}
