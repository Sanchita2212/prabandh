import React from 'react';import {Link} from 'react-router-dom';import {BedDouble, Bell, Clock3, Hotel, MapPin, MessageSquare} from 'lucide-react';import PageHeader from '../../components/ui/PageHeader';import {useEventData} from '../../context/EventDataContext';import Badge from '../../components/ui/Badge';
function UtensilsIcon(){return <span className="service-mini">🍴</span>}
export default function Dashboard(){
  const {hotels,restaurants,requests}=useEventData();
  const openRequests=requests.filter(r=>r.status==='pending').length;
  const myBusiness=(typeof window!=='undefined'&&localStorage.getItem('nexora_partner_business'))||'Sunset Grand Hotel';
  const myLocations=[
    {name:'Food Stall 03',sub:'Food Court · Zone B',status:'Active'},
    {name:hotels[0].name,sub:'1.2 km from venue',status:`${hotels[0].rooms} rooms`},
    {name:restaurants[1].name,sub:'Zone B',status:`${restaurants[1].wait} wait`},
  ];
  return <><PageHeader eyebrow="PARTNER · BUSINESS VIEW" title={`Your live availability — ${myBusiness}.`} subtitle="Publish capacity and service estimates to PRABANDH attendees and organizers." action={<Link className="primary-btn" to="/partner/hotels">Update availability</Link>}/>
  <div className="stats-row"><div className="stat-card"><div className="stat-icon"><BedDouble/></div><div><span>Rooms available</span><strong>{hotels.reduce((s,h)=>s+h.rooms,0)}</strong><small className="good">Across {hotels.length} properties</small></div></div><div className="stat-card"><div className="stat-icon"><Clock3/></div><div><span>Restaurant wait</span><strong>{restaurants[0].wait}–{restaurants[3].wait}</strong><small>Live estimates</small></div></div><div className="stat-card"><div className="stat-icon"><Bell/></div><div><span>Open requests</span><strong>{openRequests}</strong><small>need response</small></div></div></div>
  <div className="content-grid two-one"><div className="panel"><div className="panel-head"><div><h3><Hotel/> Hotel availability</h3><p>Shown to attendees when they search nearby stays.</p></div></div>{hotels.map(h=><div className="partner-row" key={h.name}><div className="partner-art"></div><div><b>{h.name}</b><small>★ {h.rating} · 1.2 km from venue</small></div><Badge tone={h.rooms<=2?'amber':'green'}>{h.rooms} rooms</Badge></div>)}</div>
  <div className="panel"><div className="panel-head"><div><h3><MessageSquare/> Service pulse</h3><p>Partner-facing signal.</p></div></div>{restaurants.slice(0,3).map(r=><div className="service-row" key={r.name}><UtensilsIcon/><div><b>{r.name}</b><small>{r.wait} estimated wait</small></div><span className="good-text">{r.capacity}</span></div>)}</div></div>
  <div className="panel"><div className="panel-head"><div><h3><MapPin/> My Locations</h3><p>Where your business appears on the PRABANDH venue map.</p></div></div>{myLocations.map(l=><div className="location-row" key={l.name}><div className="location-icon"><MapPin/></div><div><b>{l.name}</b><small>{l.sub}</small></div><span className={`badge ${l.name===myBusiness?'blue':'green'}`}>{l.name===myBusiness?'You manage this':l.status}</span></div>)}</div>
  </>;
}
