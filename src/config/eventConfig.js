// Central event configuration. Keep event-specific coordinates/details here or load them from your backend later.
export const activeEvent = {
  id: 'coldplay-mumbai-2026',
  name: 'COLDPLAY · MUSIC OF THE SPHERES',
  date: '18 Jan 2026',
  time: '6:00 PM onwards',
  venue: 'D.Y. Patil Stadium · Navi Mumbai',
  destination: { lat: 19.0169, lon: 73.0319, name: 'D.Y. Patil Stadium, Navi Mumbai' },
  expectedAttendees: 58420,
};

export const routeDataSources = {
  road: 'OpenStreetMap + OSRM',
  geocoding: 'Nominatim / OpenStreetMap',
  publicTransit: 'Operator GTFS/GTFS-RT where available; otherwise a transit routing provider',
  venueRoutes: 'Organizer-defined gates, exits, shuttle stops and internal paths',
};
