import React,{useMemo} from 'react';
import { BarChart3, TrendingUp, Users, ShieldCheck, CheckCircle2, MapPinned } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import { useEventData } from '../../context/EventDataContext';

export default function Analytics(){
  const { crowd, volunteers, recommendations, venueLocations } = useEventData();

  const applied = recommendations.filter(r=>r.status==='Applied').length;
  const dismissed = recommendations.filter(r=>r.status==='Dismissed').length;
  const pending = recommendations.filter(r=>r.status==='pending').length;
  const total = recommendations.length || 1;

  const zonesCovered = useMemo(()=>new Set(volunteers.map(v=>v.zone)).size,[volunteers]);
  const avgGate = Math.round(Object.values(crowd.gates).reduce((a,b)=>a+b,0)/Object.values(crowd.gates).length);
  const gates = venueLocations.filter(l=>l.type==='Gate');

  return <><PageHeader eyebrow="ORGANIZER · ANALYTICS" title="Analytics" subtitle="Attendance, crowd distribution and AI-operations effectiveness for this event."/>
  <div className="kpi-row">
    <div className="stat-card"><div className="stat-icon"><Users/></div><div><span>Verified attendance</span><strong>{crowd.total.toLocaleString()}</strong><small className="good">{crowd.utilization}% of capacity</small></div></div>
    <div className="stat-card"><div className="stat-icon"><TrendingUp/></div><div><span>Average gate load</span><strong>{avgGate}%</strong><small>across {gates.length} gates</small></div></div>
    <div className="stat-card"><div className="stat-icon"><ShieldCheck/></div><div><span>Zones covered</span><strong>{zonesCovered}</strong><small>{volunteers.length} volunteers on duty</small></div></div>
    <div className="stat-card"><div className="stat-icon"><CheckCircle2/></div><div><span>AI recs approved</span><strong>{applied}/{total}</strong><small className="good">{Math.round((applied/total)*100)}% approval rate</small></div></div>
  </div>

  <div className="analytics-grid">
    <section className="panel">
      <div className="panel-head"><div><h3><BarChart3/> Gate distribution</h3><p>Live occupancy by entry gate.</p></div></div>
      <div className="bar-chart">{Object.entries(crowd.gates).map(([g,v])=><div className="bar-row" key={g}><span>Gate {g}</span><div><i style={{width:v+'%'}}/></div><b>{v}%</b></div>)}</div>
    </section>
    <section className="panel">
      <div className="panel-head"><div><h3><MapPinned/> Venue footprint</h3><p>Active locations by type.</p></div></div>
      {Object.entries(venueLocations.reduce((acc,l)=>{acc[l.type]=(acc[l.type]||0)+1;return acc;},{})).map(([type,count])=><div className="rank-row" key={type}><span>{count}</span><div><b>{type}</b><small>active on the venue map</small></div></div>)}
    </section>
    <section className="panel">
      <div className="panel-head"><div><h3>AI Operations effectiveness</h3><p>How organizer decisions on Nugen recommendations trend.</p></div></div>
      <div className="bar-chart">
        <div className="bar-row"><span>Approved</span><div><i style={{width:`${(applied/total)*100}%`}}/></div><b>{applied}</b></div>
        <div className="bar-row"><span>Dismissed</span><div><i style={{width:`${(dismissed/total)*100}%`,background:'linear-gradient(90deg,#ff5e68,#ff9aa0)'}}/></div><b>{dismissed}</b></div>
        <div className="bar-row"><span>Pending</span><div><i style={{width:`${(pending/total)*100}%`,background:'linear-gradient(90deg,#f8b94b,#ffdf9a)'}}/></div><b>{pending}</b></div>
      </div>
    </section>
    <section className="panel">
      <div className="panel-head"><div><h3>Volunteer coverage</h3><p>On-duty status breakdown.</p></div></div>
      {['Green','Amber','Blue'].map(status=>{const count=volunteers.filter(v=>v.status===status).length;return <div className="rank-row" key={status}><span>{count}</span><div><b>{status==='Green'?'Fully covered':status==='Amber'?'Needs backup':'Support role'}</b><small>{status} status</small></div></div>;})}
    </section>
  </div>
  </>;
}
