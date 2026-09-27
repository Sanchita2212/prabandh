# NEXORA prototype changes

## Cleaned
- Removed the attendee Home `NEXORA Intelligence` panel.
- Removed the Spotify-style mini music player from the sidebar.
- Removed the fake secondary event card from attendee Home.
- Centralized active-event details in `src/config/eventConfig.js`.
- Removed direct attendee Journey dependency on seeded event data.

## Added
- Organizer `Transport & Parking` workspace.
- Nugen adapter + inference action on Organizer → NEXORA AI.
- Central route/data-source configuration.
- Dynamic event-aware attendee Home and Journey labels.
- Implementation roadmap covering backend, crowd feeds, routing, transit and Nugen alignment.

## Still intentionally demo/seeded
`src/data/mockData.js` still provides crowd, volunteer, venue, parking, restaurant/hotel and recommendation seed data. These should be replaced by backend/event feeds for the final version.
