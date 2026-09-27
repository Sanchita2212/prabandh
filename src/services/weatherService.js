// Shared weather service for NEXORA.
// Wraps the OpenWeather API (current + forecast) for the event venue and
// falls back to clearly-labelled demo data whenever the API key is missing
// or a request fails, so the UI never breaks.

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// D.Y. Patil Stadium, Nerul, Navi Mumbai
export const VENUE_COORDS = { lat: 19.0330, lon: 73.0297 };

function demoCurrent() {
  return {
    isDemo: true,
    temp: 28,
    feelsLike: 31,
    condition: 'Clear',
    description: 'clear skies',
    humidity: 64,
    windSpeed: 14,
    rainfallMm: 0,
    rainProbability: 8,
    updatedAt: new Date().toISOString(),
  };
}

function demoForecast() {
  const base = [
    { label: '+3h', temp: 29, condition: 'Clear', rainProbability: 5 },
    { label: '+6h', temp: 27, condition: 'Clouds', rainProbability: 18 },
    { label: '+9h', temp: 25, condition: 'Clouds', rainProbability: 22 },
    { label: '+12h', temp: 24, condition: 'Rain', rainProbability: 46 },
    { label: '+24h', temp: 26, condition: 'Clear', rainProbability: 10 },
  ];
  return { isDemo: true, slots: base };
}

function mapCondition(main) {
  return main || 'Clear';
}

export async function fetchLiveWeather() {
  if (!API_KEY) return demoCurrent();
  try {
    const url = `${BASE_URL}/weather?lat=${VENUE_COORDS.lat}&lon=${VENUE_COORDS.lon}&units=metric&appid=${API_KEY}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('weather request failed');
    const data = await res.json();
    return {
      isDemo: false,
      temp: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      condition: mapCondition(data.weather?.[0]?.main),
      description: data.weather?.[0]?.description || '—',
      humidity: data.main.humidity,
      windSpeed: Math.round(data.wind?.speed * 3.6), // m/s -> km/h
      rainfallMm: data.rain?.['1h'] || 0,
      rainProbability: data.clouds?.all ?? 0,
      updatedAt: new Date().toISOString(),
    };
  } catch (e) {
    return demoCurrent();
  }
}

export async function fetchForecast() {
  if (!API_KEY) return demoForecast();
  try {
    const url = `${BASE_URL}/forecast?lat=${VENUE_COORDS.lat}&lon=${VENUE_COORDS.lon}&units=metric&appid=${API_KEY}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('forecast request failed');
    const data = await res.json();
    const slots = (data.list || []).slice(0, 5).map((item, i) => ({
      label: i === 0 ? '+3h' : `+${(i + 1) * 3}h`,
      temp: Math.round(item.main.temp),
      condition: mapCondition(item.weather?.[0]?.main),
      rainProbability: Math.round((item.pop || 0) * 100),
    }));
    return { isDemo: false, slots };
  } catch (e) {
    return demoForecast();
  }
}

export async function fetchWeatherBundle() {
  const [current, forecast] = await Promise.all([fetchLiveWeather(), fetchForecast()]);
  return { current, forecast };
}
