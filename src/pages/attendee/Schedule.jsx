import React,{useState} from 'react';
import { CalendarClock, Info, Phone } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import { schedule, infoSections, emergencyContacts } from '../../data/mockData';

export default function Schedule(){
  const [tab,setTab]=useState('schedule');
  return <><PageHeader eyebrow="ATTENDEE · SCHEDULE & INFO" title="Schedule & Information" subtitle="The full run-of-show, plus practical information for the night."/>
  <div className="mode-tabs"><button className={tab==='schedule'?'active':''} onClick={()=>setTab('schedule')}>Schedule</button><button className={tab==='info'?'active':''} onClick={()=>setTab('info')}>Information</button></div>

  {tab==='schedule'?
  <section className="panel">
    <div className="panel-head"><div><h3><CalendarClock/> Run of show</h3><p>Times are approximate and may shift with live crowd conditions.</p></div></div>
    <div className="timeline">{schedule.map((s,i)=><div className="timeline-row" key={s.id}><div className="timeline-time">{s.time}</div><div className="timeline-dot-wrap"><div className="timeline-dot"/>{i<schedule.length-1&&<div className="timeline-line"/>}</div><div className="timeline-body"><b>{s.title}</b><p>{s.detail}</p></div></div>)}</div>
  </section>
  :
  <>
  <section className="panel">
    <div className="panel-head"><div><h3><Info/> Good to know</h3><p>Entry rules, accessibility and venue policies.</p></div></div>
    <div className="info-accordion">{infoSections.map(s=><div className="info-item" key={s.id}><b>{s.title}</b><p>{s.body}</p></div>)}</div>
  </section>
  <section className="panel" style={{marginTop:14}}>
    <div className="panel-head"><div><h3><Phone/> Emergency contacts</h3><p>Save these before you head out.</p></div></div>
    <div className="contact-grid">{emergencyContacts.map(c=><div className="contact-card" key={c.label}><span>{c.label}</span><strong>{c.value}</strong></div>)}</div>
  </section>
  </>}
  </>;
}
