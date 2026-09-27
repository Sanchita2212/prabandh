import React,{useState} from 'react';
import {Save, UtensilsCrossed, MapPin} from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import Badge from '../../components/ui/Badge';
import {stallStatuses} from '../../data/mockData';
import {useEventData} from '../../context/EventDataContext';

export default function Restaurants(){
  const {restaurants,publishRestaurantStatus}=useEventData();
  const [waits,setWaits]=useState(()=>Object.fromEntries(restaurants.map(r=>[r.name,parseInt(r.wait)])));
  const [statuses,setStatuses]=useState(()=>Object.fromEntries(restaurants.map(r=>[r.name,r.stallStatus||'OPEN'])));
  const [published,setPublished]=useState('');

  return <><PageHeader eyebrow="PARTNER · RESTAURANTS" title="Restaurant wait & status" subtitle="Publish live wait time estimates and stall status for your food outlet(s)."/>
  <div className="availability-grid">{restaurants.map(r=><div className="panel control-panel" key={r.name}>
    <div className="panel-head"><div><h3><UtensilsCrossed/> {r.name}</h3><p>{r.type} · {r.address || 'Zone B'}</p></div><Badge tone={waits[r.name]>20?'amber':'green'}>{waits[r.name]} min</Badge></div>
    <input type="range" min="0" max="60" value={waits[r.name]} onChange={e=>setWaits(w=>({...w,[r.name]:+e.target.value}))} className="range"/>
    <div className="wait-big">{waits[r.name]}<small>minutes</small></div>
    <div className="form-row full" style={{marginTop:12}}><label>Stall status</label><select value={statuses[r.name]} onChange={e=>setStatuses(s=>({...s,[r.name]:e.target.value}))}>{stallStatuses.map(s=><option key={s}>{s}</option>)}</select></div>
    <p className="muted">Attendees see this as an estimated wait, not a reservation.</p>
    <a className="muted" href={r.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${r.name} ${r.address || 'Navi Mumbai'}`)}`} target="_blank" rel="noreferrer" style={{display:'inline-flex', margin:'10px 0 12px', alignItems:'center', gap:6, textDecoration:'underline'}}><MapPin size={12}/> Open in Google Maps</a>
    <button className="primary-btn full" onClick={()=>{publishRestaurantStatus(r.name,waits[r.name],r.capacity.replace('%',''),statuses[r.name]);setPublished(r.name);}}><Save/> Publish wait & status</button>
    {published===r.name&&<p className="muted" style={{marginTop:8}}>Published to attendees just now.</p>}
  </div>)}</div>
  </>;
}
