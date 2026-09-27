import React from 'react';
export default function LoadingState({ label = 'Loading live data…' }) {
  return (
    <div className="loading-state">
      <span className="loading-dot" /><span className="loading-dot" /><span className="loading-dot" />
      <small>{label}</small>
    </div>
  );
}
