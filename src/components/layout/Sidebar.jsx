import React from 'react';
import { NavLink } from 'react-router-dom';
import { Activity, ScanLine, Bell, BusFront, CalendarDays, ChevronRight, Hotel, LayoutDashboard, Map, MapPinned, Navigation, Users, WandSparkles, CloudSun, BarChart3, UtensilsCrossed, Wrench, UserCircle } from 'lucide-react';
import { activeEvent } from '../../config/eventConfig';

// Each role only sees the navigation it needs — no cross-role controls,
// no duplicate destinations, no dead links. Every entry here has a matching
// <Route> in App.jsx.
const menus={
 organizer:[
  ['Command Center','/organizer',LayoutDashboard],
  ['Ticket Scanner','/organizer/scanner',ScanLine],
  ['Crowd & Zones','/organizer/crowd',Activity],
  ['Venue Map','/organizer/venue',MapPinned],
  ['Volunteers','/organizer/volunteers',Users],
  ['Weather Intelligence','/organizer/weather',CloudSun],
  ['AI Operations','/organizer/ai-operations',WandSparkles],
  ['Analytics','/organizer/analytics',BarChart3],
 ],
 attendee:[
  ['Home','/attendee',LayoutDashboard],
  ['Event Map','/attendee/map',Map],
  ['Navigate','/attendee/navigate',Navigation],
  ['Transport','/attendee/transport',BusFront],
  ['Schedule & Info','/attendee/schedule',CalendarDays],
  ['Weather','/attendee/weather',CloudSun],
 ],
 partner:[
  ['Dashboard','/partner',LayoutDashboard],
  ['Hotels','/partner/hotels',Hotel],
  ['Restaurants','/partner/restaurants',UtensilsCrossed],
  ['Services','/partner/services',Wrench],
  ['Requests','/partner/requests',Bell],
  ['Profile','/partner/profile',UserCircle],
 ],
};
export default function Sidebar({role}){return <aside className="sidebar">
  <div className="brand-mark">◉</div>
  <div className="brand"><strong>PRABANDH</strong><span>EVENT INTELLIGENCE</span></div>
  <nav className="side-nav"><div className="nav-caption">{role.toUpperCase()} SPACE</div>{menus[role].map(([label,path,Icon])=><NavLink key={path} to={path} end={path===`/${role}`} className={({isActive})=>'side-link '+(isActive?'active':'')}><Icon size={19}/><span>{label}</span><ChevronRight size={15} className="side-chevron"/></NavLink>)}</nav>
  <div className="divider"/>
  <div className="nav-caption">YOUR EVENT</div>
  <div className="side-static"><CalendarDays size={18}/><span>{activeEvent.date} · Event</span></div>
  <div className="side-static"><Users size={18}/><span>{activeEvent.expectedAttendees.toLocaleString()} expected</span></div>
  <div className="sidebar-spacer"/>
  <div className="side-footer">● LIVE DATA <span>2 sec ago</span></div>
</aside>}
