import React,{useMemo,useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {ArrowRight,Clock3,HeartPulse,MapPin,Navigation,Search,ShoppingBag,Utensils,Warehouse,Droplets,Car,Milestone} from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import Badge from '../../components/ui/Badge';
import {useEventData} from '../../context/EventDataContext';

const resourceMeta={
 'Food Stall':{icon:Utensils,label:'Food'},'Restaurant':{icon:Utensils,label:'Food'},'Medical Point':{icon:HeartPulse,label:'Medical'},'Restroom':{icon:Warehouse,label:'Restroom'},'Merchandise':{icon:ShoppingBag,label:'Merch'},'Water Point':{icon:Droplets,label:'Water'},'Parking':{icon:Car,label:'Parking'},'Exit':{icon:Milestone,label:'Exit'}
};

const stadiumSections=[
  {label:'VIP', angle:0, tone:'vip'},
  {label:'VIP', angle:30, tone:'vip'},
  {label:'VIP', angle:60, tone:'vip'},
  {label:'COUPLE', angle:90, tone:'couple'},
  {label:'COUPLE', angle:120, tone:'couple'},
  {label:'STANDING', angle:150, tone:'standing'},
  {label:'STANDING', angle:180, tone:'standing'},
  {label:'BAY', angle:210, tone:'bay'},
  {label:'BAY', angle:240, tone:'bay'},
  {label:'ENTRY', angle:270, tone:'entry'},
  {label:'ENTRY', angle:300, tone:'entry'},
  {label:'ENTRY', angle:330, tone:'entry'}
];

const gateBadges=[
  {label:'ENTRY 1', angle:215},
  {label:'ENTRY 2', angle:245},
  {label:'ENTRY 3', angle:275},
  {label:'ENTRY 4', angle:305},
  {label:'ENTRY 5', angle:335},
  {label:'ENTRY 6', angle:15},
  {label:'ENTRY 7', angle:45},
  {label:'ENTRY 8', angle:75},
];

// Attendee "Event Map" — gates, exits, food, medical, restrooms and parking
// in one place, replacing the previous separate Venue / Map pages.
export default function EventMap(){
 const {venueLocations,crowd,restaurants}=useEventData();
 const [filter,setFilter]=useState('All');
 const [q,setQ]=useState('');
 const [selected,setSelected]=useState(null);
 const [rotation,setRotation]=useState(18);
 const navigate=useNavigate();

 const resources=venueLocations.filter(x=>x.type!=='Gate');
 const all=[...resources,{id:'merch-1',name:'Official Merchandise',type:'Merchandise',zone:'Zone A',status:'Active'},{id:'restroom-1',name:'Restroom A',type:'Restroom',zone:'Zone A',status:'Active'},{id:'restroom-2',name:'Restroom B',type:'Restroom',zone:'Zone C',status:'Active'},{id:'water-1',name:'Water Point 1',type:'Water Point',zone:'Zone B',status:'Active'},{id:'park-1',name:'Parking P1',type:'Parking',zone:'North',status:'Active'}];
 const gateZones=venueLocations.filter(x=>x.type==='Gate');

 const filtered=(filter==='All'?all:all.filter(x=>resourceMeta[x.type]?.label===filter))
   .filter(x=>!q.trim()||x.name.toLowerCase().includes(q.toLowerCase()));

 const bestFood=useMemo(()=>restaurants.slice().sort((a,b)=>parseInt(a.wait)-parseInt(b.wait))[0],[restaurants]);

 const gateVal=letter=>crowd.gates[letter];
 const pick=r=>setSelected(r);

 const gates=[
  {label:'Gate A', className:'gate gate-a', style:{left:'16%',top:'23%'}},
  {label:'Gate B', className:'gate gate-b', style:{right:'15%',top:'23%'}},
  {label:'Gate C', className:'gate gate-c', style:{left:'16%',bottom:'18%'}},
  {label:'Gate D', className:'gate gate-d', style:{right:'15%',bottom:'18%'}}
 ];

 const services=[
  {icon:'★',label:'Stage'},
  {icon:'✓',label:'Food & Beverages'},
  {icon:'⛭',label:'Restrooms'},
  {icon:'✚',label:'Medical'},
  {icon:'◌',label:'Water Stations'},
  {icon:'P',label:'Parking'}
 ];

 const facilityPins=[
  {label:'Restrooms', className:'facility-pin restroom-pin', style:{left:'12%', top:'47%'}},
  {label:'Medical', className:'facility-pin medical-pin', style:{right:'12%', top:'48%'}},
  {label:'Water', className:'facility-pin water-pin', style:{left:'36%', bottom:'6%'}},
  {label:'Parking', className:'facility-pin parking-pin', style:{right:'15%', bottom:'7%'}}
 ];

 return <>
  <PageHeader eyebrow="EVENT MAP" title="Event Map" subtitle="Explore the venue, find your way, and discover nearby services." action={<Badge tone="green">INSIDE VENUE</Badge>} />

  <div className="event-map-panel">
   <div className="map-viewport">
    <div className="map-toolbar-floating">
     <button className="map-tool">+</button>
     <button className="map-tool">−</button>
     <button className="map-tool">⌂</button>
    </div>

    <div className="stadium-dome-wrapper">
     <div className="stadium-dome">
      <div className="stadium-dome-inner">
       <div className="stadium-stage">STAGE</div>
       <div className="stadium-bloom" />
       <div className="stadium-bloom stadium-bloom-small" />
      </div>

      <div className="stadium-amenity amenity-food">✦</div>
      <div className="stadium-amenity amenity-rest">⛭</div>
      <div className="stadium-amenity amenity-med">✚</div>
      <div className="stadium-amenity amenity-water">◌</div>
      <div className="stadium-amenity amenity-parking">P</div>

      {facilityPins.map(pin => <div key={pin.label} className={pin.className} style={pin.style}><span>{pin.label}</span></div>)}
      {gates.map(gate => <div key={gate.label} className={gate.className} style={gate.style}>{gate.label}</div>)}
     </div>
    </div>

    <div className="service-strip">
     {services.map(service => <div key={service.label} className="service-chip"><span>{service.icon}</span> {service.label}</div>)}
    </div>
   </div>
  </div>
 </>;
}
