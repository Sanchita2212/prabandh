// ============================================================================
// DEMO OPERATIONAL DATA
// ----------------------------------------------------------------------------
// Small, readable seed values for NEXORA's internal event-operation entities
// that don't have a live backend yet (crowd, gates, volunteers, parking,
// restaurant/hotel capacity, event resources, requests, social chatter).
// This file NEVER contains weather or route data — weather comes exclusively
// from the OpenWeather API (src/services/weatherService.js) and routes come
// exclusively from the live routing/geocoding API (src/services/
// routingService.js), each with its own clearly-labelled offline fallback.
// EventDataContext seeds real, editable app state from these values; nothing
// here is hard-coded directly into a UI component.
// ============================================================================

export const event={name:'COLDPLAY · MUSIC OF THE SPHERES',date:'18 Jan 2026',time:'6:00 PM onwards',venue:'D.Y. Patil Stadium · Navi Mumbai',attendees:58420};

export const crowd={total:43812,utilization:74,gates:{A:68,B:91,C:54,D:72},forecast:[{label:'+15 min',level:'Moderate',detail:'Gate B 86%'},{label:'+30 min',level:'High',detail:'Gate B 94%'},{label:'+60 min',level:'High',detail:'North exit 89%'}]};

export const venueLocations=[
 {id:'gate-a',name:'Gate A',type:'Gate',zone:'North',position:'pin-a',status:'Active'},
 {id:'gate-b',name:'Gate B',type:'Gate',zone:'North-East',position:'pin-b',status:'Active'},
 {id:'gate-c',name:'Gate C',type:'Gate',zone:'South',position:'pin-c',status:'Active'},
 {id:'gate-d',name:'Gate D',type:'Gate',zone:'South-East',position:'pin-d',status:'Active'},
 {id:'food-court',name:'Food Court',type:'Food Stall',zone:'Zone B',status:'Active'},
 {id:'medical-01',name:'Medical 01',type:'Medical Point',zone:'Zone C',status:'Active'},
 {id:'stall-3',name:'Food Stall 3',type:'Food Stall',zone:'Zone B',wait:'7 min',status:'Active'},
];

export const volunteers=[
 {id:'v1',name:'Riya',role:'Gate Management',zone:'Gate A',shift:'16:00–22:00',status:'Green',phone:'+91 98200 11234'},
 {id:'v2',name:'Arjun',role:'Crowd Control',zone:'Gate B',shift:'16:00–22:00',status:'Amber',phone:'+91 98200 55678'},
 {id:'v3',name:'Meera',role:'Medical Support',zone:'Zone C',shift:'15:00–23:00',status:'Green',phone:'+91 98200 99012'},
 {id:'v4',name:'Kabir',role:'Parking Guidance',zone:'Parking',shift:'14:00–23:00',status:'Blue',phone:'+91 98200 34456'},
];

export const volunteerRoles=['Gate Management','Crowd Control','Medical Support','Information Desk','Food Zone','Transport / Shuttle','Parking Guidance','Emergency Response'];
export const locationTypes=['Gate','Exit','Food Stall','Restaurant','Medical Point','Restroom','Water Point','Volunteer Point','Parking','Shuttle Stop','Stage'];
export const stallStatuses=['OPEN','BUSY','TEMPORARILY CLOSED'];

export const restaurants=[
 {name:'The Food Court',wait:'8 min',capacity:'62%',type:'Food & Beverage',updatedAt:'2 min ago',stallStatus:'OPEN',address:'D.Y. Patil Stadium Food Court, Sector 7, Nerul, Navi Mumbai',lat:19.0194,lng:73.0318,mapsUrl:'https://www.google.com/maps/search/?api=1&query=19.0194,73.0318'},
 {name:'Spice Route',wait:'17 min',capacity:'82%',type:'Restaurant',updatedAt:'2 min ago',stallStatus:'OPEN',address:'Near Gate C, Sector 7, Nerul, Navi Mumbai',lat:19.0188,lng:73.0334,mapsUrl:'https://www.google.com/maps/search/?api=1&query=19.0188,73.0334'},
 {name:'Green Bowl',wait:'4 min',capacity:'38%',type:'Quick Service',updatedAt:'6 min ago',stallStatus:'OPEN',address:'Main Concourse, D.Y. Patil Stadium, Navi Mumbai',lat:19.0182,lng:73.0327,mapsUrl:'https://www.google.com/maps/search/?api=1&query=19.0182,73.0327'},
 {name:'Sky Lounge',wait:'25 min',capacity:'91%',type:'Premium Dining',updatedAt:'9 min ago',stallStatus:'BUSY',address:'Upper terrace, D.Y. Patil Stadium, Nerul, Navi Mumbai',lat:19.0178,lng:73.0309,mapsUrl:'https://www.google.com/maps/search/?api=1&query=19.0178,73.0309'},
];

export const hotels=[
 {name:'Sunset Grand Hotel',rooms:2,rating:4.6,address:'Sector 7, Nerul, Navi Mumbai',lat:19.0256,lng:73.0282,mapsUrl:'https://www.google.com/maps/search/?api=1&query=19.0256,73.0282'},
 {name:'Navi Mumbai Suites',rooms:7,rating:4.3,address:'Plot 12, Palm Beach Road, Navi Mumbai',lat:19.0245,lng:73.0201,mapsUrl:'https://www.google.com/maps/search/?api=1&query=19.0245,73.0201'},
 {name:'Stadium View Inn',rooms:3,rating:4.1,address:'Near D.Y. Patil Stadium, Nerul, Navi Mumbai',lat:19.0168,lng:73.0289,mapsUrl:'https://www.google.com/maps/search/?api=1&query=19.0168,73.0289'},
];

export const transport=[
 {name:'Metro Line 1',status:'Regular',eta:'7 min',type:'Metro'},
 {name:'Event Shuttle',status:'3 buses',eta:'4 min',type:'Shuttle'},
 {name:'NMMT Bus 24',status:'Moderate',eta:'11 min',type:'Bus'},
];

export const parking=[
 {name:'P1 — Main Parking',distance:'1.2 km',status:'Open',lat:19.0187,lng:73.0324,address:'D.Y. Patil Stadium, Navi Mumbai',mapsUrl:'https://www.google.com/maps/search/?api=1&query=19.0187,73.0324'},
 {name:'P2 — East Parking',distance:'1.8 km',status:'Open',lat:19.0198,lng:73.0362,address:'Near Gate C, D.Y. Patil Stadium',mapsUrl:'https://www.google.com/maps/search/?api=1&query=19.0198,73.0362'},
 {name:'P3 — Staff Parking',distance:'2.1 km',status:'Restricted',lat:19.0138,lng:73.0278,address:'Service road, D.Y. Patil Stadium',mapsUrl:'https://www.google.com/maps/search/?api=1&query=19.0138,73.0278'},
];

export const liveUpdates=[
 {id:'u1',tone:'amber',title:'Best gate for you',meta:'Gate C is moving more smoothly than Gate B right now',time:'2 mins ago'},
 {id:'u2',tone:'blue',title:'Weather notice',meta:'Light rain near the venue — carry a light jacket or use the covered walkways',time:'5 mins ago'},
 {id:'u3',tone:'green',title:'Metro update',meta:'Metro Line 1 arrives at 6:28 PM · 4 min walk to Gate A',time:'8 mins ago'},
 {id:'u4',tone:'green',title:'Food wait times',meta:'Food Court is now down to 6 min — best nearby option',time:'12 mins ago'},
 {id:'u5',tone:'blue',title:'Parking tip',meta:'P1 Main Parking has the easiest exit for tonight’s departure',time:'16 mins ago'},
];

export const recommendations=[
 {id:'rec-1',title:'Redirect Gate B traffic',reason:'Move the next 800–1,000 attendees toward Gate C for 15 minutes.',impact:'High impact',type:'redirect',payload:{from:'B',to:'C',amount:15},status:'pending'},
 {id:'rec-2',title:'Add 2 food counters',reason:'Food Court wait time is projected to cross 18 min.',impact:'Medium impact',type:'food',status:'pending'},
 {id:'rec-3',title:'Open Shuttle Bay 2',reason:'After-event departure pressure is building near Gate B.',impact:'High impact',type:'shuttle',status:'pending'},
 {id:'rec-4',title:'Move volunteers to Gate B',reason:'Shift coverage from low-pressure Parking to Gate B.',impact:'Medium impact',type:'volunteer',payload:{fromZone:'Parking',toZone:'Gate B',count:1},status:'pending'},
];

export const socialSignals=[
 {id:'s1',source:'X / Twitter',handle:'@NaviMumbaiTraffic',text:'Light drizzle reported near D.Y. Patil Stadium approach roads. Drive safe.',time:'6 min ago',sentiment:'amber'},
 {id:'s2',source:'Instagram',handle:'@coldplayfans_in',text:'Anyone know if there is covered seating if it rains tonight? 👀',time:'11 min ago',sentiment:'blue'},
 {id:'s3',source:'X / Twitter',handle:'@EventGoerMumbai',text:'Wind picking up near Gate B, tents holding fine so far.',time:'14 min ago',sentiment:'amber'},
 {id:'s4',source:'Community App',handle:'NEXORA Attendee Chat',text:'Queue at Food Court moving fast despite the weather, no complaints here.',time:'20 min ago',sentiment:'green'},
 {id:'s5',source:'X / Twitter',handle:'@MumbaiWeatherWatch',text:'Isolated showers possible in Navi Mumbai this evening, nothing severe expected.',time:'32 min ago',sentiment:'blue'},
];

export const requests=[
 {id:'R-1042',from:'Organizer',text:'Need 2 extra hotel rooms for artist support',priority:'High',type:'hotel-rooms',amount:2,status:'pending'},
 {id:'R-1043',from:'Organizer',text:'Confirm food counter capacity for Gate C',priority:'Medium',type:'info',status:'pending'},
 {id:'R-1044',from:'Organizer',text:'Share updated restaurant wait estimate',priority:'Medium',type:'info',status:'pending'},
 {id:'R-1045',from:'Attendee support',text:'Check 2-room availability',priority:'Low',type:'info',status:'pending'},
];

// Attendee "Schedule + Information" page — event run-of-show and static
// venue/attendee information. Editable seed data, not hard-coded in the UI.
export const schedule=[
 {id:'sch-1',time:'4:00 PM',title:'Gates open',detail:'Entry begins at all gates. Security and bag checks in effect.'},
 {id:'sch-2',time:'4:30 PM',title:'Opening act',detail:'Warm-up performance at the Main Stage.'},
 {id:'sch-3',time:'6:00 PM',title:'Main event begins',detail:'Doors close to general standing area; premium entry continues.'},
 {id:'sch-4',time:'8:30 PM',title:'Interval',detail:'Short break — food counters remain open.'},
 {id:'sch-5',time:'10:00 PM',title:'Event ends',detail:'Phased exit begins; follow volunteer and signage guidance.'},
 {id:'sch-6',time:'10:30 PM',title:'Last shuttle departs',detail:'Final shuttle leaves from Shuttle Bay 2.'},
];

export const infoSections=[
 {id:'info-1',title:'Entry & security',body:'Carry a valid photo ID and your e-ticket (digital or printed). Bags are subject to security screening at every gate. Outside food, drinks and professional cameras are not permitted.'},
 {id:'info-2',title:'Prohibited items',body:'Weapons, glass bottles, drones, laser pointers and fireworks are strictly prohibited and will be confiscated at entry.'},
 {id:'info-3',title:'Accessibility',body:'Accessible viewing platforms are available near Gate A and Gate D. Volunteers wearing teal armbands can guide you to the nearest accessible entry.'},
 {id:'info-4',title:'Lost & found',title2:'Lost & found',body:'Report lost items or missing persons at any Information Desk or Medical Point — details are shared with all volunteers in real time.'},
];

export const emergencyContacts=[
 {label:'Event control room',value:'+91 22 6100 0000'},
 {label:'Medical emergency',value:'108'},
 {label:'Police control room',value:'100'},
 {label:'NEXORA attendee support',value:'+91 90000 12345'},
];

// Partner "Services" — additional offerings a partner business can toggle on
// for this event, separate from room/wait-time availability.
export const partnerServiceCatalog=[
 {id:'svc-1',name:'Early check-in',category:'Hotel',active:true},
 {id:'svc-2',name:'Airport / station pickup',category:'Transport',active:true},
 {id:'svc-3',name:'Group dining reservation',category:'Restaurant',active:false},
 {id:'svc-4',name:'Late checkout',category:'Hotel',active:false},
 {id:'svc-5',name:'Event merchandise pickup point',category:'Venue',active:true},
];
