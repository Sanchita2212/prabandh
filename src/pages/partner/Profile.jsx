import React,{useState} from 'react';
import { Building2, Mail, MapPin, Phone, Save } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import Badge from '../../components/ui/Badge';

const partnerBusinesses=['Sunset Grand Hotel','Spice Route','Food Stall 03'];

export default function Profile(){
  const business=(typeof window!=='undefined'&&localStorage.getItem('nexora_partner_business'))||partnerBusinesses[0];
  const [phone,setPhone]=useState('+91 98200 11234');
  const [email,setEmail]=useState(`${business.toLowerCase().replace(/[^a-z0-9]+/g,'.')}@prabandh.ai`);
  const [saved,setSaved]=useState(false);

  return <><PageHeader eyebrow="PARTNER · PROFILE" title="Business profile" subtitle="How your business appears to organizers and attendees on PRABANDH."/>
  <div className="profile-card"><div className="profile-avatar">{business[0]}</div><div><h2>{business}</h2><p><MapPin size={12}/> 1.2 km from venue · Navi Mumbai</p><Badge tone="green">VERIFIED PARTNER</Badge></div></div>
  <section className="panel">
    <div className="panel-head"><div><h3><Building2/> Contact details</h3><p>Used for coordination requests from organizers.</p></div></div>
    <div className="form-row"><div><label><Mail size={12}/> Email</label><input value={email} onChange={e=>setEmail(e.target.value)}/></div><div><label><Phone size={12}/> Phone</label><input value={phone} onChange={e=>setPhone(e.target.value)}/></div></div>
    <button className="primary-btn full" onClick={()=>setSaved(true)}><Save/> Save profile</button>
    {saved&&<p className="muted" style={{marginTop:8}}>Profile saved.</p>}
  </section>
  </>;
}
