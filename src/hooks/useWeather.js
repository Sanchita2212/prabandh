import { useEffect, useState } from 'react';
import { fetchWeatherBundle } from '../services/weatherService';

export default function useWeather() {
  const [state, setState] = useState({ loading: true, current: null, forecast: null });

  useEffect(() => {
    let alive = true;
    fetchWeatherBundle().then(({ current, forecast }) => {
      if (!alive) return;
      setState({ loading: false, current, forecast });
    });
    return () => { alive = false; };
  }, []);

  return state;
}
