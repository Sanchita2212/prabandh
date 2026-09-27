# NEXORA — Spotify-inspired Event Intelligence UI

React + Vite frontend matching the supplied dark music/event dashboard reference. It uses a Spotify-inspired dark, green-accent visual language without relying on Spotify assets.

## Run
```bash
npm install
npm run dev
```

## Roles
- `/login` — role selector
- Organizer — crowd pulse, venue map/stalls, volunteers, AI recommendations
- Attendee — event home, map, transport, restaurants/wait times, internal/external navigation
- Partner — hotel room availability, restaurant wait estimates, requests

All data is local mock data in `src/data/mockData.js`, ready to replace with FastAPI/Supabase calls.


## NEXORA implementation roadmap

### 1. Current prototype
- Role-based Organizer / Attendee / Partner workspaces.
- Weather is fetched through the weather service.
- Road journey planning uses Nominatim geocoding + OSRM routing with a labelled fallback estimate.
- Internal operational values are intentionally seeded in `src/data/mockData.js`.
- Nugen integration is isolated in `src/services/nugenService.js`.

### 2. Make the event dynamic
Create a backend `GET /events/:eventId` response containing: event details, venue coordinates, gates, exits, stages, stalls, medical points, parking, shuttle stops, volunteer posts and capacity limits. Remove event-specific constants from UI components.

### 3. Make routes dynamic
Do not hard-code route strings such as “Metro 7 min”. Store each transport/venue node with `{id,name,type,lat,lon,status}`. Use OSRM for road routes and alternatives; use a transit routing provider or operator GTFS/GTFS-RT for public transport. The user selects an origin + destination, and the frontend requests a fresh route.

### 4. Crowd intelligence
Replace seeded `crowd` state with a backend/WebSocket feed from ticket scans, counters, CCTV/people-counting service or simulated sensor events. Normalize all sources into `{timestamp,zoneId,count,capacity}`.

### 5. Nugen requirement
Use Nugen to customize/aligned a base model with event-operation examples: crowd surge -> gate redistribution; high exit pressure -> alternative exit; volunteer shortage -> reassignment; transport delay -> alternate pickup recommendation. Store the aligned model ID and call that model for NEXORA inference. Do not replace this with a generic LLM API call.

### 6. Production data priority
1. Organizer event configuration/backend
2. Crowd/occupancy feed
3. Routing + transit data
4. Weather API
5. Partner availability
6. Nugen-aligned inference
7. UI recommendation/action layer

### Route data sources
For road routing, NEXORA currently uses OpenStreetMap/Nominatim for geocoding and OSRM for route geometry, distance, ETA and alternative road routes. OSRM also exposes table/matrix routing useful for comparing multiple gates or exits. For public transport, prefer official operator GTFS/GTFS-RT feeds where available; otherwise use a transit routing provider.
