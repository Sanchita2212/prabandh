import React,{useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {ArrowRight, ShieldCheck, Sparkles} from 'lucide-react';
import hero from '../../assets/concert-hero.jpg';
const partnerBusinesses=['Sunset Grand Hotel','Spice Route','Food Stall 03'];
export default function Login(){
  const [role,setRole]=useState('attendee');
  const [business,setBusiness]=useState(partnerBusinesses[0]);
  const nav=useNavigate();
  return <div className="login-page"><img src={hero} className="login-bg"/><div className="login-overlay"/><div className="login-card"><div className="login-logo">◉</div><span className="eyebrow">PRABANDH EVENT INTELLIGENCE</span><h1>From Chaos<br/><i>to Coordination.</i></h1><p>One connected layer for crowd, venue, transport, partners and attendees.</p>
  <div className="role-tabs">{['organizer','attendee','partner'].map(r=><button key={r} className={role===r?'selected':''} onClick={()=>setRole(r)}>{r}</button>)}</div>
  {role==='partner'&&<label>Your business<select value={business} onChange={e=>setBusiness(e.target.value)} style={{display:'block',width:'100%',marginTop:6,padding:11,border:'1px solid #23373c',borderRadius:8,background:'#091419',color:'#fff'}}>{partnerBusinesses.map(b=><option key={b}>{b}</option>)}</select></label>}
  <label>Email<input defaultValue={`${role}@prabandh.ai`}/></label><label>Password<input type="password" defaultValue="prabandh123"/></label>
  <button className="primary-btn" onClick={()=>{localStorage.setItem('nexora_role',role); if(role==='partner') localStorage.setItem('nexora_partner_business',business); nav('/'+role)}}>Continue as {role}<ArrowRight size={18}/></button>
  </div><div className="login-copy"><Sparkles size={16}/> SMARTER EVENTS. HAPPIER PEOPLE.</div></div>;
}
