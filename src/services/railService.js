// qRail schedule integration with graceful fallback. The key is kept in a single
// place so production deployments can swap the real service without changing UI.
// If the public qRail endpoint is unavailable or rate-limited, the UI falls back
// to a small local schedule so the attendee flow remains usable.

export const QRAIL_API_KEY = import.meta.env.VITE_QRAIL_API_KEY || 'z7HMoDxQe0tZMvXhPDTFV0533X6KY8CmjtrMHn6CBAGt8moBY8hOQPikChTP';

export function formatClockTimeFromMinutes(etaValue) {
  const minutes = Number.parseInt((etaValue || '').match(/\d+/)?.[0] ?? '', 10);
  if (Number.isNaN(minutes)) {
    if (/^\d{1,2}[:.]\d{2}$/.test(String(etaValue || '').trim())) {
      return String(etaValue).trim().replace('.', ':');
    }
    return String(etaValue || 'On time');
  }

  const now = new Date();
  now.setMinutes(now.getMinutes() + minutes);
  return now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

const FALLBACK_SCHEDULE = [
  { id: 'rail-1', name: 'Panvel Local', platform: 'Platform 2', eta: '7 min', status: 'On time' },
  { id: 'rail-2', name: 'Belapur Express', platform: 'Platform 4', eta: '12 min', status: 'On time' },
  { id: 'rail-3', name: 'Nerul Fast', platform: 'Platform 1', eta: '18 min', status: 'Slight delay' },
];

const CANDIDATE_URLS = [
  `https://api.qrail.in/v1/schedule?api_key=${encodeURIComponent(QRAIL_API_KEY)}`,
  `https://api.qrail.in/v1/trains?api_key=${encodeURIComponent(QRAIL_API_KEY)}`,
  `https://api.qrail.in/v1/rail/schedule?api_key=${encodeURIComponent(QRAIL_API_KEY)}`,
];

function normalizeRailSchedule(payload) {
  const items = Array.isArray(payload) ? payload : payload?.data || payload?.trains || payload?.schedule || payload?.results || [];
  if (!Array.isArray(items) || items.length === 0) return null;

  return items.slice(0, 4).map((item, index) => ({
    id: item.id || item.trainNumber || `rail-${index + 1}`,
    name: item.name || item.trainName || item.service || `Service ${index + 1}`,
    platform: item.platform || item.platformNo || 'Platform TBD',
    eta: item.eta || item.departure || item.arrival || 'On time',
    status: item.status || item.delay || 'On time',
    route: item.route || item.line || item.destination || 'Local route',
  }));
}

export async function getRailSchedule() {
  for (const url of CANDIDATE_URLS) {
    try {
      const res = await fetch(url, { headers: { Accept: 'application/json' } });
      if (!res.ok) continue;
      const data = await res.json();
      const normalized = normalizeRailSchedule(data);
      if (normalized && normalized.length) {
        return { source: 'qRail', items: normalized };
      }
    } catch (error) {
      // Ignore individual endpoint failures and try the next configured qRail URL.
    }
  }

  return {
    source: 'fallback',
    items: FALLBACK_SCHEDULE,
  };
}
