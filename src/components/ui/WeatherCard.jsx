import React from 'react';
import { CloudRain, CloudSun, Cloud, Sun, Droplets, Wind, Thermometer, CloudLightning } from 'lucide-react';

const iconFor = (condition) => {
  const c = (condition || '').toLowerCase();
  if (c.includes('rain') || c.includes('drizzle')) return <CloudRain size={26} />;
  if (c.includes('thunder') || c.includes('storm')) return <CloudLightning size={26} />;
  if (c.includes('cloud')) return <Cloud size={26} />;
  if (c.includes('clear')) return <Sun size={26} />;
  return <CloudSun size={26} />;
};

// Reusable live-weather summary card — used on the attendee Home stat row and
// as the "Live Weather" section of the Weather Intelligence page.
export default function WeatherCard({ current, compact = false }) {
  if (!current) return null;
  return (
    <div className={`weather-card ${compact ? 'compact' : ''}`}>
      <div className="weather-card-icon">{iconFor(current.condition)}</div>
      <div className="weather-card-body">
        <div className="weather-card-top">
          <strong>{current.temp}°C</strong>
          <span>Feels {current.feelsLike}°C</span>
        </div>
        <p className="weather-card-condition">{current.description}</p>
        {!compact && (
          <div className="weather-card-meta">
            <span><Droplets size={13} /> {current.humidity}% humidity</span>
            <span><Wind size={13} /> {current.windSpeed} km/h</span>
            <span><Thermometer size={13} /> {current.rainProbability}% rain chance</span>
          </div>
        )}
      </div>
    </div>
  );
}
