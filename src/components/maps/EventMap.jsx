import React from 'react';
import { Layers, MapPin, Minus, Plus, Utensils, HeartPulse, Droplets, Car, Users, CloudRain } from 'lucide-react';
import mapImg from '../../assets/venue-map.jpg';
import {useEventData} from '../../context/EventDataContext';
const toneClass=v=>v>=85?'#ff7178':v>=70?'#ffcf51':'#5cffb0';
// weatherImpact (optional): { [gateLetterOrZoneId]: 0-1 severity } used to render
// a translucent "Weather Impact" overlay on top of the existing venue map,
// e.g. from the Digital Twin / What-If simulation. Purely additive — omitting
// the prop renders the map exactly as before.
export default function EventMap({compact=false,highlightId,weatherImpact}){
  const {crowd,venueLocations}=useEventData();
  const gatePins=venueLocations.filter(l=>l.type==='Gate'&&l.position);
  const showImpact=!!weatherImpact;
  return <div className={`event-map ${compact?'compact':''}`}>
  <img src={mapImg} alt="Venue map"/><div className="map-shade"/>
  {showImpact&&<div className="map-weather-shade"/>}
  <div className="map-controls"><button><Plus size={17}/></button><button><Minus size={17}/></button><button><Layers size={17}/></button></div>
  {gatePins.map(g=>{const letter=g.name.replace('Gate ','');const val=crowd.gates[letter];const impact=showImpact?weatherImpact[letter]:null;return <div key={g.id} className={`map-pin ${g.position} ${impact>=0.6?'impact-pulse':''}`} style={{background:toneClass(val),outline:highlightId===g.id?'3px solid #fff':(impact>=0.6?'3px solid #5fc7ff':'none')}} title={`Gate ${letter} · ${val}%${impact!=null?` · weather impact ${Math.round(impact*100)}%`:''}`}>{letter}</div>;})}
  <div className="map-stage">STAGE</div><div className="map-me">● YOU</div>
  {!compact&&<div className="map-legend">{showImpact?<><span><CloudRain/> Weather Impact</span><span><MapPin/> Gate</span><span><Users/> Crowd</span><span><Car/> Transport</span></>:<><span><MapPin/> Gate</span><span><Utensils/> Food</span><span><Users/> Crowd</span><span><HeartPulse/> Medical</span><span><Droplets/> Water</span><span><Car/> Parking</span></>}</div>}
</div>;}
