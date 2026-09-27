import React from 'react';import {Check, Clock3, MessageSquare, X} from 'lucide-react';import PageHeader from '../../components/ui/PageHeader';import {useEventData} from '../../context/EventDataContext';
export default function Requests(){
  const {requests,respondRequest}=useEventData();
  return <><PageHeader eyebrow="PARTNER · REQUESTS" title="Requests & coordination" subtitle="Accepting a request updates your live availability — organizer and attendee views change immediately."/>
  <div className="request-list">{requests.map(r=><div className={`request-card ${r.status!=='pending'?'done':''}`} key={r.id}><div className="request-id">{r.id}<span>{r.priority}</span></div><div className="request-main"><b>{r.text}</b><small>{r.from} · <Clock3/> 6 min ago</small></div><div className="request-actions">{r.status!=='pending'?<span className="done-text"><Check/> {r.status}</span>:<><button className="icon-btn" onClick={()=>respondRequest(r.id,true)}><Check/></button><button className="icon-btn"><MessageSquare/></button><button className="icon-btn" onClick={()=>respondRequest(r.id,false)}><X/></button></>}</div></div>)}</div></>;
}
