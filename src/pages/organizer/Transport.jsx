import React from 'react';
import { BusFront, CarFront, MapPinned, Route, Users } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import { transport, parking } from '../../data/mockData';
import { useEventData } from '../../context/EventDataContext';

export default function Transport(){
  const { crowd } = useEventData();
  const busiest = Object.entries(crowd.gates).sort((a,b)=>b[1]-a[1])[0];
  return <><PageHeader eyebrow="ORGANIZER · TRANSPORT OPERATIONS" title="Move people before queues become problems." subtitle="Monitor event transport, parking and departure pressure from one operational view."/>
    <div className="stats-row"><div className="metric-card"><span>Critical departure gate</span><strong className="red">Gate {busiest[0]}</strong><small>{busiest[1]}% current pressure</small></div><div className="metric-card"><span>Shuttle status</span><strong className="green">3 active</strong><small>Live partner feed required for production</small></div><div className="metric-card"><span>Parking</span><strong>2 open</strong><small>1 restricted zone</small></div><div className="metric-card"><span>Routing</span><strong>Dynamic</strong><small>OSM + OSRM road routing</small></div></div>
    <div className="content-grid two-one"><section className="panel"><div className="panel-head"><div><h3><BusFront/> Transport services</h3><p>Seed data for the prototype; replace with operator feeds later.</p></div></div>{transport.map(t=><div className="location-row" key={t.name}><div className="location-icon"><BusFront/></div><div><b>{t.name}</b><small>{t.type} · {t.status} · ETA {t.eta}</small></div><span className="status-badge green">MONITOR</span></div>)}</section>
    <section className="panel"><div className="panel-head"><div><h3><CarFront/> Parking capacity</h3><p>Organizer-defined parking assets and status.</p></div></div>{parking.map(p=><div className="location-row" key={p.name}><div className="location-icon"><CarFront/></div><div><b>{p.name}</b><small>{p.distance} from venue</small></div><span className={`badge ${p.status==='Open'?'green':'amber'}`}>{p.status}</span></div>)}</section></div>
    <section className="panel"><div className="panel-head"><div><h3><Route/> Dynamic route operations</h3><p>Road routes should be calculated from the user's current location to the selected gate, parking area or shuttle stop.</p></div></div><div className="recommend-strip"><MapPinned/><div><b>Next implementation</b><p>Give every transport asset latitude/longitude and expose them through the event API. The attendee journey service can then route to the selected asset instead of a single fixed venue destination.</p></div></div></section>
  </>;
}
