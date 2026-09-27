import React from 'react';
import { Wrench } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import Badge from '../../components/ui/Badge';
import { useEventData } from '../../context/EventDataContext';

export default function Services(){
  const { partnerServices, toggleService } = useEventData();
  const active = partnerServices.filter(s=>s.active).length;
  return <><PageHeader eyebrow="PARTNER · SERVICES" title="Additional services" subtitle={`Toggle the extra services you're offering for this event — ${active} active.`}/>
  <section className="panel">
    <div className="panel-head"><div><h3><Wrench/> Service catalog</h3><p>Visible to organizers coordinating attendee requests.</p></div></div>
    {partnerServices.map(s=><div className="service-toggle-row" key={s.id}>
      <div><b>{s.name}</b><small>{s.category}</small></div>
      <Badge tone={s.active?'green':'amber'}>{s.active?'ACTIVE':'OFF'}</Badge>
      <button className={`switch ${s.active?'on':''}`} onClick={()=>toggleService(s.id)}><span/></button>
    </div>)}
  </section>
  </>;
}
