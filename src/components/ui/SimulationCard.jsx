import React from 'react';
import { Wand2 } from 'lucide-react';

const SLIDERS = [
  { key: 'rain', label: 'Rain intensity', min: 0, max: 100, unit: '%' },
  { key: 'temp', label: 'Temperature', min: 10, max: 45, unit: '°C' },
  { key: 'wind', label: 'Wind speed', min: 0, max: 80, unit: ' km/h' },
  { key: 'storm', label: 'Storm duration', min: 0, max: 180, unit: ' min' },
  { key: 'area', label: 'Affected area', min: 0, max: 100, unit: '%' },
];

// What-If simulation control panel: sliders + presets + run button.
// Purely a controlled UI component — the parent (Weather page) owns state
// and decides what "running" the simulation actually computes.
export default function SimulationCard({ values, onChange, presets, activePreset, onPreset, onRun }) {
  return (
    <div className="panel simulation-card">
      <div className="panel-head">
        <div><h3><Wand2 size={17} /> What-If Simulation</h3><p>Model how changing weather would ripple through the event — demo logic, not a forecast.</p></div>
      </div>
      <div className="preset-row">
        {presets.map(p => (
          <button
            key={p.id}
            className={'preset-pill ' + (activePreset === p.id ? 'active' : '')}
            onClick={() => onPreset(p)}
          >{p.label}</button>
        ))}
      </div>
      <div className="slider-grid">
        {SLIDERS.map(s => (
          <div className="slider-row" key={s.key}>
            <div className="slider-row-label"><span>{s.label}</span><b>{values[s.key]}{s.unit}</b></div>
            <input
              type="range"
              className="range"
              min={s.min}
              max={s.max}
              value={values[s.key]}
              onChange={e => onChange(s.key, Number(e.target.value))}
            />
          </div>
        ))}
      </div>
      <button className="primary-btn full" onClick={onRun}>RUN SIMULATION</button>
    </div>
  );
}
