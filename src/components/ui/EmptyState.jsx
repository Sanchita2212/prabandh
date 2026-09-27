import React from 'react';
import { Inbox } from 'lucide-react';
export default function EmptyState({ icon, title = 'Nothing here yet', subtitle }) {
  return (
    <div className="empty-state">
      {icon || <Inbox size={26} />}
      <b>{title}</b>
      {subtitle && <span>{subtitle}</span>}
    </div>
  );
}
