import React,{useEffect,useMemo,useState} from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CalendarDays, CarFront, ChevronRight, CloudSun, MapPin, Users, Compass, AlertTriangle, Bus, Utensils, Activity, ExternalLink } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import StatCard from '../../components/ui/StatCard';
import EventMap from '../../components/maps/EventMap';
import Badge from '../../components/ui/Badge';
import { useEventData } from '../../context/EventDataContext';
import useWeather from '../../hooks/useWeather';
import hero from '../../assets/concert-hero.jpg';
import restaurantImg from '../../assets/restaurant.jpg';
import { activeEvent } from '../../config/eventConfig';

const toneIcon = { amber:<AlertTriangle size={15}/>, blue:<Bus size={15}/>, green:<Activity size={15}/> };
const defaultUserLocation = { lat: 19.0218, lng: 73.0305 };

function haversineKm(a,b){
  const toRad = value => (value * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat/2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng/2) ** 2;
  return 2 * 6371 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

export default function Home(){
  const { crowd, liveUpdates, restaurants } = useEventData();
  const { loading: weatherLoading, current: weather } = useWeather();
  const [userLocation, setUserLocation] = useState(defaultUserLocation);

  useEffect(() => {
    if (!navigator || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      pos => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setUserLocation(defaultUserLocation),
      { enableHighAccuracy: true, timeout: 5000 }
    );
  }, []);

  const busiest = Object.entries(crowd.gates).sort((a,b)=>b[1]-a[1])[0];
  const density = busiest[1] >= 85 ? 'High' : busiest[1] >= 70 ? 'Moderate' : 'Low';
  const nearby = useMemo(() => restaurants.slice(0,3).map(r => {
    const distanceKm = r.lat && r.lng ? haversineKm(userLocation, { lat: r.lat, lng: r.lng }) : 1.2;
    const minutes = Math.max(5, Math.min(28, Math.round(distanceKm * 4.5 + 5)));
    return {
      ...r,
      travelMinutes: minutes,
      waitLabel: parseInt(r.wait) <= 10 ? 'Low wait' : 'Medium wait',
      distanceLabel: `${distanceKm.toFixed(1)} km away`,
      image: restaurantImg,
    };
  }), [restaurants, userLocation]);

  return <div className="dashboard">
    <PageHeader eyebrow="LIVE EVENT · ATTENDEE" title="Everything you need, in one place." subtitle="Event info, weather, announcements and live crowd status for tonight." action={<Link className="outline-btn" to="/attendee/navigate">Navigate <ChevronRight size={17}/></Link>}/>
    <div className="home-layout">
      <div className="home-main">
        <section className="hero-card"><img src={hero}/><div className="hero-overlay"/><div className="hero-copy"><Badge>● LIVE EVENT</Badge><h2>{activeEvent.name}</h2><div className="hero-meta"><span><CalendarDays/> {activeEvent.date}<small>{activeEvent.time}</small></span><span><MapPin/> {activeEvent.venue}</span><span><Users/> {activeEvent.expectedAttendees.toLocaleString()}+ expected</span></div></div></section>
        <div className="stats-row"><StatCard icon={<Users/>} title="Crowd Density" value={density} meta={`● Gate ${busiest[0]} busiest`} trend/><StatCard icon={<MapPin/>} title="Gates" value={Object.keys(crowd.gates).join(' · ')} meta={`Gate ${busiest[0]} at ${busiest[1]}%`}/><Link to="/attendee/weather"><StatCard icon={<CloudSun/>} title="Weather" value={weatherLoading?'—':`${weather.temp}°C`} meta={weatherLoading?'Fetching…':weather.description}/></Link><StatCard icon={<CarFront/>} title="Transport" value="Regular" meta="Next shuttle · 4 min" trend/></div>
        <div className="content-grid two-one">
          <section className="panel map-panel"><div className="panel-head"><div><h3>Event Map</h3><p>Explore the venue, find your way, and discover nearby services.</p></div><Link className="outline-small" to="/attendee/map">Open full map</Link></div><EventMap/><div className="quick-pills"><span>Stage</span><span>Food & Beverages</span><span>Restrooms</span><span>Medical</span><span>Water</span><span>Parking</span></div></section>
          <section className="panel"><div className="panel-head"><div><h3>Arrival checklist</h3><p>Quick actions for a smoother event experience.</p></div></div><div className="alert-item green"><Activity/><div><b>Check crowd pressure</b><p>Gate {busiest[0]} is currently at {busiest[1]}%. Use the map for alternatives.</p></div></div><div className="alert-item blue"><RouteIcon/><div><b>Plan your route</b><p>Use Navigate to calculate a route from your location.</p></div></div><div className="alert-item amber"><CloudSun/><div><b>Check weather</b><p>Weather conditions can affect arrival and departure time.</p></div></div></section>
        </div>
        <div className="section-title"><div><h2>Announcements</h2><p>Live event information and attendee services.</p></div></div>
        <div className="event-cards"><div className="event-tile active"><img src={hero}/><div><Badge>LIVE</Badge><h3>{activeEvent.venue}</h3><p><MapPin/> {activeEvent.date} · {activeEvent.time}</p><div className="tile-stats"><span>{activeEvent.expectedAttendees.toLocaleString()} expected</span><span>{crowd.utilization}% utilization</span><span>{Object.values(crowd.gates).filter(v=>v>=70).length} pressure gates</span></div><Link className="primary-small" to="/attendee/schedule">SEE SCHEDULE <ArrowRight size={15}/></Link></div></div></div>
      </div>
      <aside className="home-rail">
        <div className="rail-panel"><div className="rail-head"><h3>Live Updates</h3><span>LIVE</span></div>{liveUpdates.map(u=><div className="friend" key={u.id}><div className={`friend-avatar tone-${u.tone}`}>{toneIcon[u.tone]||<Utensils size={15}/>}</div><div><b>{u.title}</b><small>{u.meta}</small></div><span>{u.time}</span></div>)}</div>
        <div className="rail-panel"><div className="rail-head"><h3>Nearby Food</h3><span>See all</span></div>{nearby.map(n=><div className="nearby-row" key={n.name}><img src={n.image}/><div><b>{n.name}</b><small>{n.address}</small><small>{n.distanceLabel} · {n.travelMinutes} min away</small></div><div className="nearby-tags"><Badge tone={n.waitLabel === 'Low wait' ? 'green' : 'amber'}>{n.waitLabel}</Badge><a href={n.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(n.address)}`} target="_blank" rel="noreferrer" style={{display:'inline-flex', alignItems:'center', gap:4, color:'inherit', textDecoration:'none', marginTop:6}}><MapPin size={12}/> Open map</a><span>Updated {n.updatedAt}</span></div></div>)}</div>
        <div className="vibe-card"><img src={hero}/><div><Compass/><b>Explore The<br/>Venue Map.</b><small>Find gates, food and transport near you.</small></div><Link to="/attendee/map"><ArrowRight size={18}/></Link></div>
      </aside>
    </div>
  </div>;
}

function RouteIcon(){ return <ArrowRight size={16}/>; }
