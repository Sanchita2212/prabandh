import React,{createContext,useCallback,useContext,useEffect,useState} from 'react';
import * as seed from '../data/mockData';
import { fetchDynamicEventState } from '../services/dynamicBackendService';

const Ctx=createContext(null);

function isLegacyAttendeeFeed(value){
  if(!Array.isArray(value)) return false;
  const legacySignals=['High Crowd','Shuttle Bus','Food Stall 3','Crowd Flow'];
  return value.some(item=>legacySignals.some(label=>
    (item?.title && item.title.includes(label)) ||
    (item?.meta && item.meta.includes(label))
  ));
}

function hydrateWithSeed(current,seedData){
  if(!Array.isArray(current) || !Array.isArray(seedData)) return current;
  const map=new Map(seedData.map(item=>[item.name,item]));
  return current.map(item => {
    const source = map.get(item.name) || {};
    return { ...source, ...item };
  });
}

function useLocal(key,seedVal,normalize){
  const [state,setState]=useState(()=>{
    try{
      const raw=localStorage.getItem(key);
      const value=raw?JSON.parse(raw):seedVal;
      return normalize ? normalize(value,seedVal) : value;
    }catch{ return seedVal; }
  });
  useEffect(()=>{
    try{
      const next=normalize ? normalize(state,seedVal) : state;
      if(JSON.stringify(next)!==JSON.stringify(state)){
        setState(next);
      }
      localStorage.setItem(key,JSON.stringify(next));
    }catch{}
  },[key,state,seedVal,normalize]);
  return [state,setState];
}

export function EventDataProvider({children}){
  const activePartnerBusiness = typeof window !== 'undefined' ? (localStorage.getItem('nexora_partner_business') || 'Sunset Grand Hotel') : 'Sunset Grand Hotel';
  const [crowd,setCrowd]=useLocal('nexora_crowd',seed.crowd);
  const [venueLocations,setVenueLocations]=useLocal('nexora_venueLocations',seed.venueLocations);
  const [volunteers,setVolunteers]=useLocal('nexora_volunteers',seed.volunteers);
  const [hotels,setHotels]=useLocal('nexora_hotels',seed.hotels,(value,seedData)=>hydrateWithSeed(value,seedData));
  const [restaurants,setRestaurants]=useLocal('nexora_restaurants',seed.restaurants,(value,seedData)=>hydrateWithSeed(value,seedData));
  const [liveUpdates,setLiveUpdates]=useLocal('nexora_liveUpdates',seed.liveUpdates,(value,seedData)=>
    isLegacyAttendeeFeed(value) ? seedData : value
  );
  const [recommendations,setRecommendations]=useLocal('nexora_recommendations',seed.recommendations);
  const [requests,setRequests]=useLocal('nexora_requests',seed.requests);
  const [shuttleBay2Open,setShuttleBay2Open]=useLocal('nexora_shuttleBay2',false);
  const [partnerServices,setPartnerServices]=useLocal('nexora_partnerServices',seed.partnerServiceCatalog);

  const pushUpdate=useCallback((title,meta,tone='blue')=>{
    setLiveUpdates(list=>[{id:'u-'+Date.now(),tone,title,meta,time:'just now'},...list].slice(0,8));
  },[setLiveUpdates]);

  const addLocation=useCallback((loc)=>{
    const entry={id:'loc-'+Date.now(),status:'Active',...loc};
    setVenueLocations(list=>[...list,entry]);
    pushUpdate('New location added',`${entry.name} · ${entry.type}`,'green');
    return entry;
  },[pushUpdate,setVenueLocations]);

  const removeLocation=useCallback((id)=>{
    setVenueLocations(list=>list.filter(l=>l.id!==id));
  },[setVenueLocations]);

  const assignVolunteer=useCallback((v)=>{
    const entry={id:'vol-'+Date.now(),status:'Active',...v};
    setVolunteers(list=>[entry,...list]);
    pushUpdate('Volunteer assigned',`${entry.name} · ${entry.role} · ${entry.zone}`,'blue');
    return entry;
  },[pushUpdate,setVolunteers]);

  const applyRecommendation=useCallback((id)=>{
    setRecommendations(list=>{
      const rec=list.find(r=>r.id===id);
      if(!rec||rec.status==='Applied') return list;
      if(rec.type==='redirect'&&rec.payload){
        const {from,to,amount}=rec.payload;
        setCrowd(c=>({...c,gates:{...c.gates,[from]:Math.max(10,c.gates[from]-amount),[to]:Math.min(99,c.gates[to]+Math.round(amount/2))}}));
        pushUpdate('Recommendation applied',`Redirected attendees from Gate ${from} to Gate ${to}`,'green');
      }else if(rec.type==='volunteer'&&rec.payload){
        const {fromZone,toZone,count}=rec.payload;
        setVolunteers(vs=>{let moved=0;return vs.map(v=>{if(moved<count&&v.zone===fromZone){moved++;return {...v,zone:toZone};}return v;});});
        pushUpdate('Recommendation applied',`Moved ${count} volunteer(s) from ${fromZone} to ${toZone}`,'green');
      }else if(rec.type==='food'){
        setRestaurants(rs=>rs.map(r=>r.name==='The Food Court'?{...r,wait:Math.max(3,parseInt(r.wait)-6)+' min',capacity:Math.max(20,parseInt(r.capacity)-15)+'%',updatedAt:'just now'}:r));
        pushUpdate('Recommendation applied','2 extra food counters opened at Food Court — wait time reduced','green');
      }else if(rec.type==='shuttle'){
        setShuttleBay2Open(true);
        pushUpdate('Recommendation applied','Shuttle Bay 2 is now open for departures','green');
      }else{
        pushUpdate('Recommendation applied',rec.title,'green');
      }
      return list.map(r=>r.id===id?{...r,status:'Applied'}:r);
    });
  },[pushUpdate,setRecommendations,setCrowd,setVolunteers,setRestaurants,setShuttleBay2Open]);

  const dismissRecommendation=useCallback((id)=>{
    setRecommendations(list=>{
      const rec=list.find(r=>r.id===id);
      if(!rec||rec.status!=='pending') return list;
      pushUpdate('Recommendation dismissed',rec.title,'blue');
      return list.map(r=>r.id===id?{...r,status:'Dismissed'}:r);
    });
  },[pushUpdate,setRecommendations]);

  const toggleService=useCallback((id)=>{
    setPartnerServices(list=>list.map(s=>s.id===id?{...s,active:!s.active}:s));
  },[setPartnerServices]);

  const scanTicket=useCallback((gate,ticketId)=>{
    setCrowd(c=>{
      const nextGates={...c.gates,[gate]:Math.min(99,Math.round(c.gates[gate]+1))};
      const total=Math.min(99999,c.total+1);
      const utilization=Math.round((Object.values(nextGates).reduce((a,b)=>a+b,0)/Object.keys(nextGates).length));
      return {...c,total,utilization,gates:nextGates,forecast:c.forecast};
    });
    pushUpdate('Valid ticket scan',`${ticketId} · Gate ${gate} verified`,'green');
  },[pushUpdate,setCrowd]);

  const simulateSurge=useCallback((gate)=>{
    setCrowd(c=>{
      const next=Math.min(99,Math.max(c.gates[gate]+8,90));
      const nextGates={...c.gates,[gate]:next};
      return {...c,total:c.total+350,utilization:Math.min(99,c.utilization+5),gates:nextGates,forecast:c.forecast.map((f,i)=>i===0?{...f,level:'High',detail:`Gate ${gate} ${Math.min(99,next-3)}%`}:f)};
    });
  },[setCrowd]);

  const publishHotelRooms=useCallback((name,rooms)=>{
    setHotels(list=>list.map(h=>h.name===name?{...h,rooms,partner:activePartnerBusiness,updatedAt:'just now'}:h));
    pushUpdate('Hotel availability updated',`${name} · ${rooms} rooms available for ${activePartnerBusiness}`,'blue');
  },[activePartnerBusiness,pushUpdate,setHotels]);

  const publishRestaurantStatus=useCallback((name,wait,capacity,stallStatus)=>{
    setRestaurants(list=>list.map(r=>r.name===name?{...r,wait:`${wait} min`,capacity:`${capacity}%`,partner:activePartnerBusiness,updatedAt:'just now',...(stallStatus?{stallStatus}:{})}:r));
    pushUpdate('Wait time updated',`${name} · ${wait} min wait${stallStatus?` · ${stallStatus}`:''}`,'blue');
  },[activePartnerBusiness,pushUpdate,setRestaurants]);

  const respondRequest=useCallback((id,accept)=>{
    setRequests(list=>{
      const req=list.find(r=>r.id===id);
      if(!req) return list;
      if(accept&&req.type==='hotel-rooms'){
        setHotels(hs=>hs.map((h,i)=>i===0?{...h,rooms:Math.max(0,h.rooms-req.amount)}:h));
        pushUpdate('Rooms allocated',`${req.amount} rooms released for organizer request`,'amber');
      }
      return list.map(r=>r.id===id?{...r,status:accept?'Accepted':'Rejected'}:r);
    });
  },[pushUpdate,setHotels,setRequests]);

  const resetDemoData=useCallback(()=>{
    ['nexora_crowd','nexora_venueLocations','nexora_volunteers','nexora_hotels','nexora_restaurants','nexora_liveUpdates','nexora_recommendations','nexora_requests','nexora_shuttleBay2','nexora_partnerServices'].forEach(k=>localStorage.removeItem(k));
    window.location.reload();
  },[]);

  useEffect(() => {
    let isMounted = true;
    const syncDashboard = async () => {
      const payload = await fetchDynamicEventState();
      if (!payload || !isMounted) return;

      if (payload.crowd) setCrowd(payload.crowd);
      if (payload.hotels) setHotels(payload.hotels);
      if (payload.restaurants) setRestaurants(payload.restaurants);
      if (payload.liveUpdates) setLiveUpdates(payload.liveUpdates);
      if (payload.recommendations) setRecommendations(payload.recommendations);
    };

    syncDashboard();
    const interval = window.setInterval(syncDashboard, 15000);

    return () => {
      isMounted = false;
      window.clearInterval(interval);
    };
  }, []);

  const value={crowd,venueLocations,volunteers,hotels,restaurants,liveUpdates,recommendations,requests,shuttleBay2Open,partnerServices,activePartnerBusiness,
    addLocation,removeLocation,assignVolunteer,applyRecommendation,dismissRecommendation,scanTicket,simulateSurge,publishHotelRooms,publishRestaurantStatus,respondRequest,toggleService,pushUpdate,resetDemoData};
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useEventData(){
  const ctx=useContext(Ctx);
  if(!ctx) throw new Error('useEventData must be used within EventDataProvider');
  return ctx;
}
