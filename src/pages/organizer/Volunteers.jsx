import React,{useState} from 'react';import {Phone, Plus, ShieldCheck, Users} from 'lucide-react';import PageHeader from '../../components/ui/PageHeader';import {volunteerRoles} from '../../data/mockData';import {useEventData} from '../../context/EventDataContext';
export default function Volunteers(){
  const {volunteers,assignVolunteer}=useEventData();
  const [open,setOpen]=useState(false);
  const [shown,setShown]=useState(null);
  const [form,setForm]=useState({name:'',role:volunteerRoles[0],zone:'',shift:''});
  const set=k=>e=>setForm({...form,[k]:e.target.value});
  const save=()=>{ if(!form.name.trim()||!form.zone.trim()) return; assignVolunteer({...form,status:'Green'}); setForm({name:'',role:volunteerRoles[0],zone:'',shift:''}); setOpen(false); };
  const needBackup=volunteers.filter(v=>v.status==='Amber').length;
  return <><PageHeader eyebrow="ORGANIZER · PEOPLE" title="Volunteer Control" subtitle="Assign roles and keep every crowd-critical point covered." action={<button className="primary-btn" onClick={()=>setOpen(o=>!o)}><Plus/> Assign volunteer</button>}/>
  {open&&<div className="form-panel"><div className="form-row"><div><label>Name</label><input value={form.name} onChange={set('name')} placeholder="Volunteer name"/></div><div><label>Role</label><select value={form.role} onChange={set('role')}>{volunteerRoles.map(r=><option key={r}>{r}</option>)}</select></div></div>
  <div className="form-row"><div><label>Assigned zone / location</label><input value={form.zone} onChange={set('zone')} placeholder="e.g. Gate B"/></div><div><label>Shift</label><input value={form.shift} onChange={set('shift')} placeholder="e.g. 16:00–22:00"/></div></div>
  <div className="form-actions"><button className="outline-small" onClick={()=>setOpen(false)}>Cancel</button><button className="primary-small" onClick={save}>Save assignment</button></div></div>}
  <div className="volunteer-stats"><div><Users/><b>{volunteers.length}</b><span>On duty</span></div><div><ShieldCheck/><b>{new Set(volunteers.map(v=>v.zone)).size}</b><span>Zones covered</span></div><div><Phone/><b>{needBackup}</b><span>Need backup</span></div></div>
  <div className="panel"><div className="panel-head"><div><h3>Role assignments</h3><p>Organizer-controlled volunteer locations.</p></div></div>{volunteers.map(v=><div className="vol-row" key={v.id}><div className="vol-avatar">{v.name[0]}</div><div className="vol-main"><b>{v.name}</b><span>{v.role} · {v.zone} · {v.shift}</span>{shown===v.id&&v.phone&&<span className="good-text">{v.phone}</span>}</div><span className={`status-dot ${v.status.toLowerCase()}`}>● {v.status}</span><button className="outline-small" onClick={()=>setShown(shown===v.id?null:v.id)}>{shown===v.id?'Hide':'Contact'}</button></div>)}</div></>;
}
