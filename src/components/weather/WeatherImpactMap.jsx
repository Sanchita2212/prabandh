import React, { useEffect, useMemo, useState } from 'react';
import { Bus, Hotel, Utensils, MapPinned, CloudRain, Wind, Droplets, Thermometer } from 'lucide-react';
import { Circle, CircleMarker, MapContainer, Marker, Popup, Polyline, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { fetchWeatherBundle, VENUE_COORDS } from '../../services/weatherService';

const locationPins = [
  { id: 'venue', name: 'D.Y. Patil Stadium', type: 'Venue', coords: [VENUE_COORDS.lat, VENUE_COORDS.lon], tone: '#75c5ff' },
  { id: 'gate-c', name: 'Gate C', type: 'Gate', coords: [19.0318, 73.0308], tone: '#ffcf7a' },
  { id: 'gate-a', name: 'Gate A', type: 'Gate', coords: [19.0341, 73.0282], tone: '#ffe38a' },
  { id: 'hotel-a', name: 'Hotel A', type: 'Hotel', coords: [19.0364, 73.0247], tone: '#7fe0a5' },
  { id: 'restaurant', name: 'Spice Route', type: 'Restaurant', coords: [19.0327, 73.0265], tone: '#ff9b7a' },
  { id: 'parking', name: 'P1 Main Parking', type: 'Parking', coords: [19.0373, 73.0314], tone: '#8db3ff' },
  { id: 'medical', name: 'Medical Point', type: 'Medical', coords: [19.0308, 73.0279], tone: '#ff8ca1' },
  { id: 'dombivli', name: 'Dombivli', type: 'Origin', coords: [19.2159, 73.0868], tone: '#d9f2ff' },
];

const getWeatherTone = (condition, rainProbability, windSpeed) => {
  if (!condition) return '#6dd3ff';
  if (condition === 'Rain' || rainProbability >= 60) return '#60b5ff';
  if (windSpeed >= 30) return '#ffb36b';
  if (condition === 'Clouds' || rainProbability >= 30) return '#7cc8ff';
  return '#7ee7b2';
};

const createIcon = (color) => L.divIcon({
  className: 'weather-map-marker',
  html: `<span style="background:${color}; box-shadow: 0 0 0 4px rgba(255,255,255,0.12);" />`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

export default function WeatherImpactMap({ impactByGate, transportDelay, restaurantDemandDelta, hotelDemandDelta, affectedArea = 0 }) {
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    let cancelled = false;

    fetchWeatherBundle().then((bundle) => {
      if (!cancelled) setWeather(bundle);
    }).catch(() => {
      if (!cancelled) setWeather({ current: { temp: 28, condition: 'Clear', description: 'clear skies', humidity: 64, windSpeed: 14, rainProbability: 10 }, forecast: { slots: [] } });
    });

    return () => { cancelled = true; };
  }, []);

  const current = weather?.current || { temp: 28, condition: 'Clear', description: 'clear skies', humidity: 64, windSpeed: 14, rainProbability: 10 };
  const mapCenter = useMemo(() => [19.0338, 73.028], []);

  return (
    <div className="content-grid two-one" style={{ alignItems: 'stretch' }}>
      <section className="panel map-panel" style={{ minHeight: 460 }}>
        <div className="panel-head">
          <div>
            <h3><MapPinned size={17} /> Weather Impact Map</h3>
            <p>Geospatial view of the venue, affected entities and live weather at the site.</p>
          </div>
        </div>

        <div style={{ height: 360, width: '100%', borderRadius: 18, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', marginTop: 12 }}>
          <MapContainer center={mapCenter} zoom={13} scrollWheelZoom style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <Polyline
              positions={[[19.2159, 73.0868], [19.0338, 73.028], [19.0364, 73.0247]]}
              pathOptions={{ color: '#66df97', weight: 5, opacity: 0.8 }}
            />

            {locationPins.map((pin) => (
              <Marker
                key={pin.id}
                position={pin.coords}
                icon={createIcon(pin.tone)}
              >
                <Popup>
                  <strong>{pin.name}</strong><br />
                  {pin.type}<br />
                  {pin.id === 'venue' ? `${current.condition} · ${current.temp}°C` : 'Relevant entity'}
                </Popup>
              </Marker>
            ))}

            <CircleMarker center={[VENUE_COORDS.lat, VENUE_COORDS.lon]} radius={Math.max(18, 18 + current.rainProbability / 2)} pathOptions={{ color: getWeatherTone(current.condition, current.rainProbability, current.windSpeed), fillColor: getWeatherTone(current.condition, current.rainProbability, current.windSpeed), fillOpacity: 0.2 }} />
            <Circle center={[VENUE_COORDS.lat, VENUE_COORDS.lon]} radius={900} pathOptions={{ color: getWeatherTone(current.condition, current.rainProbability, current.windSpeed), fillColor: getWeatherTone(current.condition, current.rainProbability, current.windSpeed), fillOpacity: 0.12 }} />
          </MapContainer>
        </div>
      </section>

      <section className="panel">
        <div className="panel-head"><div><h3>Affected Systems</h3><p>Current live weather and what it is affecting.</p></div></div>

        <div style={{ display: 'grid', gap: 12 }}>
          <div style={{ padding: '12px 14px', borderRadius: 12, background: 'rgba(102, 223, 151, 0.08)', border: '1px solid rgba(130, 232, 177, 0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <strong style={{ fontSize: 15 }}>{current.condition}</strong>
              <span style={{ fontSize: 14, fontWeight: 700 }}>{current.temp}°C</span>
            </div>
            <small style={{ opacity: 0.8, display: 'block', marginTop: 6 }}>{current.description}</small>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '8px 10px', borderRadius: 10, background: 'rgba(255,255,255,0.04)' }}><div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Thermometer size={14} /><span>Feels like</span></div><b>{current.temp}°C</b></div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '8px 10px', borderRadius: 10, background: 'rgba(255,255,255,0.04)' }}><div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Droplets size={14} /><span>Humidity</span></div><b>{current.humidity}%</b></div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '8px 10px', borderRadius: 10, background: 'rgba(255,255,255,0.04)' }}><div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Wind size={14} /><span>Wind</span></div><b>{current.windSpeed} km/h</b></div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '8px 10px', borderRadius: 10, background: 'rgba(255,255,255,0.04)' }}><div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><CloudRain size={14} /><span>Rain</span></div><b>{current.rainProbability}%</b></div>
          </div>
        </div>

        <div className="service-row"><Bus /><div><b>Transport</b><small>Average delay +{transportDelay} min across shuttle & bus routes</small></div></div>
        <div className="service-row"><Utensils /><div><b>Food & Beverage</b><small>Demand at indoor stalls {restaurantDemandDelta >= 0 ? '+' : ''}{restaurantDemandDelta}% vs baseline</small></div></div>
        <div className="service-row"><Hotel /><div><b>Hotels & Stays</b><small>Nearby room requests {hotelDemandDelta >= 0 ? '+' : ''}{hotelDemandDelta}% vs baseline</small></div></div>

        <div style={{ marginTop: 12, padding: '10px 12px', borderRadius: 10, background: 'rgba(95, 199, 255, 0.08)', border: '1px solid rgba(95,199,255,0.18)' }}>
          <small style={{ display: 'block', textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.8 }}>MODEL ESTIMATE</small>
          <strong style={{ display: 'block', marginTop: 4 }}>Affected venue area: {affectedArea}%</strong>
          <small>Based on current conditions and the venue risk model.</small>
        </div>

        <p className="muted" style={{ marginTop: 12 }}>OpenWeather data drives the live map, while the simulation overlay remains non-destructive to the event state.</p>
      </section>
    </div>
  );
}
