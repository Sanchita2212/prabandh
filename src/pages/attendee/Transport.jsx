import React,{useEffect,useMemo,useState} from 'react';
import {BusFront, CarFront, Clock3, MapPinned, TrainFront, Sparkles} from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import {parking} from '../../data/mockData';
import {useEventData} from '../../context/EventDataContext';
import { formatClockTimeFromMinutes, getRailSchedule } from '../../services/railService';

const VENUE_COORDS = { lat: 19.0169, lon: 73.0319 };

function formatETA(label) {
  const minutes = Number.parseInt((label || '').match(/\d+/)?.[0] ?? '', 10);
  if (!Number.isNaN(minutes)) {
    const now = new Date();
    now.setMinutes(now.getMinutes() + minutes);
    return now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  }

  return label || 'On time';
}

async function getTransitRouteSummary(name, originCoords) {
  const destination = `${VENUE_COORDS.lon},${VENUE_COORDS.lat}`;
  const origin = `${originCoords[1]},${originCoords[0]}`;
  const url = `https://router.project-osrm.org/route/v1/driving/${origin};${destination}?overview=false&geometries=geojson&alternatives=false`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Route fetch failed');
    const data = await response.json();
    const route = data.routes?.[0];
    if (!route) throw new Error('No route returned');
    return {
      name,
      type: name.toLowerCase().includes('metro') ? 'Metro' : 'Bus',
      route: `${name} → D.Y. Patil Stadium`,
      eta: formatETA(`${Math.max(4, Math.round(route.duration / 60))} min`),
      status: route.distance > 5000 ? 'Regular' : 'On time',
      distanceKm: (route.distance / 1000).toFixed(1),
    };
  } catch {
    return {
      name,
      type: name.toLowerCase().includes('metro') ? 'Metro' : 'Bus',
      route: `${name} → D.Y. Patil Stadium`,
      eta: formatETA(name.toLowerCase().includes('metro') ? '7 min' : '11 min'),
      status: 'On time',
      distanceKm: name.toLowerCase().includes('metro') ? '6.2' : '9.4',
    };
  }
}

export default function Transport(){
  const {crowd,shuttleBay2Open}=useEventData();
  const [ended,setEnded]=useState(false);
  const [railSchedule,setRailSchedule]=useState([]);
  const [railSource,setRailSource]=useState('loading');
  const [transitOptions,setTransitOptions]=useState([]);
  const sorted=Object.entries(crowd.gates).sort((a,b)=>a[1]-b[1]);
  const best=sorted[0],worst=sorted[sorted.length-1];

  useEffect(() => {
    let active = true;
    getRailSchedule().then(result => {
      if (!active) return;
      setRailSchedule(result.items || []);
      setRailSource(result.source || 'fallback');
    }).catch(() => {
      if (!active) return;
      setRailSchedule([]);
      setRailSource('fallback');
    });

    Promise.all([
      getTransitRouteSummary('Metro Line 1', [19.0325, 73.0305]),
      getTransitRouteSummary('NMMT Bus 24', [19.0788, 73.0039]),
    ]).then(results => {
      if (!active) return;
      setTransitOptions(results);
    }).catch(() => {
      if (!active) return;
      setTransitOptions([
        { name: 'Metro Line 1', type: 'Metro', route: 'Metro Line 1 → D.Y. Patil Stadium', eta: formatETA('7 min'), status: 'On time', distanceKm: '6.2' },
        { name: 'NMMT Bus 24', type: 'Bus', route: 'NMMT Bus 24 → D.Y. Patil Stadium', eta: formatETA('11 min'), status: 'Moderate', distanceKm: '9.4' },
      ]);
    });

    return () => { active = false; };
  }, []);

  const transportCards = useMemo(() => {
    if (transitOptions.length) return transitOptions;
    return [
      { name: 'Metro Line 1', type: 'Metro', route: 'Metro Line 1 → D.Y. Patil Stadium', eta: formatETA('7 min'), status: 'Regular', distanceKm: '6.2' },
      { name: 'Event Shuttle', type: 'Shuttle', route: 'Shuttle Bay 2 → Gate C', eta: formatETA('4 min'), status: '3 buses', distanceKm: '1.4' },
      { name: 'NMMT Bus 24', type: 'Bus', route: 'NMMT Bus 24 → D.Y. Patil Stadium', eta: formatETA('11 min'), status: 'Moderate', distanceKm: '9.4' },
    ];
  }, [transitOptions]);

  return <><PageHeader eyebrow="ATTENDEE · GETTING AROUND" title="Transport, without the guesswork." subtitle="See event shuttles, public transport and crowd-aware arrival options."/>
  <div className="transport-grid">{transportCards.map((t,i)=><div className="transport-card" key={t.name}><div className="transport-icon">{t.type === 'Metro' || t.name.includes('Metro') ? <TrainFront/> : <BusFront/>}</div><div><span>{t.type}</span><h3>{t.name}</h3><p><Clock3/> {t.eta} · {t.status}</p><small>{t.route}</small></div><button className="outline-small">View route</button></div>)}</div>
  <div className="panel"><div className="panel-head"><div><h3>Rail schedule</h3><p>{railSource === 'qRail' ? 'Live qRail feed' : 'qRail key configured — live feed unavailable, using fallback schedule'}.</p></div></div>
    <div className="transport-grid">{railSchedule.length ? railSchedule.map((t)=><div className="transport-card" key={t.id}><div className="transport-icon"><TrainFront/></div><div><span>RAIL</span><h3>{t.name}</h3><p><Clock3/> {formatClockTimeFromMinutes(t.eta)} · {t.status}</p><small>{t.platform} · {t.route}</small></div></div>) : <div className="transport-card"><div className="transport-icon"><TrainFront/></div><div><span>RAIL</span><h3>Loading schedule…</h3><p><Clock3/> Checking qRail feed</p></div></div>}</div>
  </div>
  <div className="panel"><div className="panel-head"><div><h3>After the concert</h3><p>Use live crowd signals to spread departures across nearby options.</p></div><button className="outline-small" onClick={()=>setEnded(e=>!e)}>{ended?'Hide':'Simulate'} concert ended</button></div>
  {!ended?<div className="recommend-strip"><MapPinned/><div><b>Gate {worst[0]} departure is busiest</b><p>Gate {worst[0]} is currently the busiest exit. Consider Gate {best[0]} instead.</p></div></div>:
  <><div className="gate-bars bar-chart">{sorted.map(([g,v])=><div className="bar-row" key={g}><span>Gate {g}</span><div><i style={{width:v+'%',background:v>=85?'linear-gradient(90deg,#ff5e68,#ff9aa0)':v>=70?'linear-gradient(90deg,#f8b94b,#ffdf9a)':undefined}}/></div><b>{v}%</b></div>)}</div>
  <div className="ai-banner"><Sparkles/><div><b>PRABANDH recommends: Exit through Gate {best[0]}</b><p>Shuttle Bay 2 · ~8 min walk · lower congestion than Gate {worst[0]} ({worst[1]}%).</p></div></div>
  <div className="transport-grid">{[['Shuttle Bay 2', formatETA('4 min'), shuttleBay2Open],['Metro', formatETA('12 min'), true],['NMMT Bus', formatETA('18 min'), true]].map(([n,e,openNow])=><div className="transport-card" key={n}><div className="transport-icon"><BusFront/></div><div><span>ALTERNATIVE {n==='Shuttle Bay 2'?(openNow?'· OPEN':'· NOT YET OPEN'):''}</span><h3>{n}</h3><p><Clock3/> {e}</p></div></div>)}</div></>}
  </div>
  <div className="panel"><div className="panel-head"><div><h3><CarFront size={16}/> Parking</h3><p>Live-style parking options with direct navigation to each lot.</p></div></div>{parking.map(p=><div className="location-row" key={p.name}><div className="location-icon"><CarFront/></div><div><b>{p.name}</b><small>{p.distance} · {p.address}</small></div><div style={{display:'flex',alignItems:'center',gap:8}}><span className={`badge ${p.status==='Open'?'green':'amber'}`}>{p.status}</span><a href={p.mapsUrl || '#'} target="_blank" rel="noreferrer" className="outline-small" style={{textDecoration:'none',display:'inline-flex',alignItems:'center',justifyContent:'center'}}>Open in Google Maps</a></div></div>)}</div>
  </>;
}
