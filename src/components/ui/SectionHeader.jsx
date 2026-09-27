import React from 'react';
// Reusable sub-section heading used inside panels/pages (distinct from PageHeader,
// which is for the top of a whole page).
export default function SectionHeader({ icon, title, subtitle, action }) {
  return (
    <div className="section-title">
      <div>
        <h2>{icon}{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
