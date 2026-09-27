import React,{useState} from 'react';import {MapPin, Plus, Store, Trash2, Users, HeartPulse, Droplets, Car, BusFront, Milestone} from 'lucide-react';import PageHeader from '../../components/ui/PageHeader';import EventMap from '../../components/maps/EventMap';import {locationTypes} from '../../data/mockData';import {useEventData} from '../../context/EventDataContext';
const iconFor=t=>({'Gate':<MapPin/>,'Exit':<Milestone/>,'Food Stall':<Store/>,'Restaurant':<Store/>,'Medical Point':<HeartPulse/>,'Restroom':<Droplets/>,'Water Point':<Droplets/>,'Volunteer Point':<Users/>,'Parking':<Car/>,'Shuttle Stop':<BusFront/>,'Stage':<MapPin/>}[t]||<MapPin/>);
export default function Venue(){
  const {venueLocations,addLocation,removeLocation}=useEventData();
  const [open,setOpen]=useState(false);
  const [form,setForm]=useState({name:'',type:locationTypes[0],zone:'',position:''});
  const set=k=>e=>setForm({...form,[k]:e.target.value});
  const save=()=>{ if(!form.name.trim()) return; addLocation({...form}); setForm({name:'',type:locationTypes[0],zone:'',position:''}); setOpen(false); };
  return <><PageHeader eyebrow="ORGANIZER · VENUE BUILDER" title="Venue & Stall Map" subtitle="Define the locations your attendees and partners will use during the event." action={<button className="primary-btn" onClick={()=>setOpen(o=>!o)}><Plus/> Add location</button>}/>
  {open&&<div className="form-panel"><div className="form-row"><div><label>Name</label><input value={form.name} onChange={set('name')} placeholder="e.g. Food Stall 5"/></div><div><label>Type</label><select value={form.type} onChange={set('type')}>{locationTypes.map(t=><option key={t}>{t}</option>)}</select></div></div>
  <div className="form-row"><div><label>Zone</label><input value={form.zone} onChange={set('zone')} placeholder="e.g. Zone B"/></div><div><label>Map position</label><input value={form.position} onChange={set('position')} placeholder="e.g. near Gate C"/></div></div>
  <div className="form-actions"><button className="outline-small" onClick={()=>setOpen(false)}>Cancel</button><button className="primary-small" onClick={save}>Save location</button></div></div>}
  <div className="content-grid two-one"><div className="panel map-panel"><div className="panel-head"><div><h3>Organizer map</h3><p>Place gates, stalls, volunteer points and services.</p></div></div><EventMap/></div>
  <div className="panel"><div className="panel-head"><div><h3>Locations</h3><p>{venueLocations.length} active locations</p></div></div>{venueLocations.map(z=><div className="location-row" key={z.id}><div className="location-icon">{iconFor(z.type)}</div><div><b>{z.name}</b><small>{z.type}{z.zone?` · ${z.zone}`:''}{z.wait?` · ${z.wait} wait`:''}</small></div><span className="badge green">{z.status}</span><Trash2 size={16} onClick={()=>removeLocation(z.id)} style={{cursor:'pointer'}}/></div>)}</div></div></>;
}
