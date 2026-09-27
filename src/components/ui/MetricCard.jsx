import React from 'react';
// Compact metric tile — like the existing .big-metric / .pressure-grid cells,
// generalised so any page can drop in a labelled number.
export default function MetricCard({ label, value, unit, tone = '', hint }) {
  return (
    <div className="metric-card">
      <span>{label}</span>
      <strong className={tone}>{value}{unit && <em>{unit}</em>}</strong>
      {hint && <small>{hint}</small>}
    </div>
  );
}
