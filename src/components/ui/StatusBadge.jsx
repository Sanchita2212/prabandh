import React from 'react';
// Small status pill for tables/lists — green/amber/red/blue, matching the
// existing badge/status-dot palette used across attendee, organizer & partner pages.
const dot = { green: '●', amber: '●', red: '●', blue: '●' };
export default function StatusBadge({ tone = 'green', children }) {
  return <span className={`status-badge ${tone}`}>{dot[tone] || '●'} {children}</span>;
}
