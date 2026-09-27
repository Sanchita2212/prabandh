import React from 'react';
import { AlertTriangle, CheckCircle2, Info } from 'lucide-react';
// Generalised version of the existing .alert-item pattern used on Crowd Pulse etc.
const icons = { red: <AlertTriangle size={19} />, amber: <AlertTriangle size={19} />, green: <CheckCircle2 size={19} />, blue: <Info size={19} /> };
export default function AlertCard({ tone = 'blue', title, description }) {
  return (
    <div className={`alert-item ${tone}`}>
      {icons[tone] || icons.blue}
      <div><b>{title}</b><p>{description}</p></div>
    </div>
  );
}
