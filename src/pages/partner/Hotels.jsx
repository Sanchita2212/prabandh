import React,{useState} from 'react';
import {BedDouble, Minus, Plus, Save, Star, MapPin} from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import Badge from '../../components/ui/Badge';
import {useEventData} from '../../context/EventDataContext';

export default function Hotels(){
  const {hotels,publishHotelRooms}=useEventData();
  const [rooms,setRooms]=useState(()=>Object.fromEntries(hotels.map(h=>[h.name,h.rooms])));
  const [published,setPublished]=useState('');
  const set=(name,val)=>setRooms(r=>({...r,[name]:Math.max(0,val)}));
  const publish=(h)=>{ publishHotelRooms(h.name,rooms[h.name]); setPublished(h.name); };

  return <><PageHeader eyebrow="PARTNER · HOTELS" title="Hotel availability" subtitle="Publish live room counts — attendees and organizers see changes instantly."/>
  <div className="availability-grid">{hotels.map(h=><div className="panel control-panel" key={h.name}>
    <div className="panel-head"><div><h3><BedDouble/> {h.name}</h3><p><MapPin size={12}/> {h.address || 'Near venue'}</p></div><Badge tone={rooms[h.name]<3?'amber':'green'}>{rooms[h.name]} available</Badge></div>
    <div className="counter"><button onClick={()=>set(h.name,rooms[h.name]-1)}><Minus/></button><strong>{rooms[h.name]}</strong><button onClick={()=>set(h.name,rooms[h.name]+1)}><Plus/></button></div>
    <div className="range-row"><span><Star size={12}/> {h.rating} rating</span><span>18 Jan · 16:00–23:00</span></div>
    <a className="muted" href={h.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${h.name} ${h.address || 'Navi Mumbai'}`)}`} target="_blank" rel="noreferrer" style={{display:'inline-flex', margin:'10px 0 12px', alignItems:'center', gap:6, textDecoration:'underline'}}><MapPin size={12}/> Open in Google Maps</a>
    <button className="primary-btn full" onClick={()=>publish(h)}><Save/> Publish availability</button>
    {published===h.name&&<p className="muted" style={{marginTop:8}}>Published — attendees now see {rooms[h.name]} rooms available.</p>}
  </div>)}</div>
  </>;
}
