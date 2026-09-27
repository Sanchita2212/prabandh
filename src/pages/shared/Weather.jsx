import React, { useMemo, useState } from 'react';
import { CloudSun, Droplets, Wind, Thermometer, CalendarClock, GitCompare, MessageSquareText, ArrowRight } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import SectionHeader from '../../components/ui/SectionHeader';
import MetricCard from '../../components/ui/MetricCard';
import StatusBadge from '../../components/ui/StatusBadge';
import AlertCard from '../../components/ui/AlertCard';
import DataTable from '../../components/ui/DataTable';
import LoadingState from '../../components/ui/LoadingState';
import WeatherCard from '../../components/ui/WeatherCard';
import SimulationCard from '../../components/ui/SimulationCard';
import WeatherImpactMap from '../../components/weather/WeatherImpactMap';
import useWeather from '../../hooks/useWeather';
import { useEventData } from '../../context/EventDataContext';
import { transport, socialSignals } from '../../data/mockData';
import { PRESETS, runSimulation, slidersFromLiveWeather } from '../../services/weatherImpactEngine';

const ALL_TABS = {
  overview: { id: 'overview', label: 'Overview' },
  live: { id: 'live', label: 'Live Weather' },
  forecast: { id: 'forecast', label: 'Forecast' },
  impact: { id: 'impact', label: 'Weather Impact' },
  twin: { id: 'twin', label: 'Digital Twin' },
  whatif: { id: 'whatif', label: 'What-If Simulation' },
  map: { id: 'map', label: 'Impact Map' },
  social: { id: 'social', label: 'Social Signals' },
};

// Role-specific slices, per PRABANDH's weather + routing spec: organizers get
// the full Digital Twin toolkit; attendees get live/forecast + affected-area
// map + chatter; partners get demand/capacity impact without simulation controls.
const ROLE_TABS = {
  organizer: ['overview', 'live', 'forecast', 'impact', 'twin', 'whatif', 'map', 'social'],
  attendee: ['overview', 'live', 'forecast', 'map', 'social'],
  partner: ['overview', 'live', 'forecast', 'impact', 'social'],
};

const roleCopy = {
  organizer: { eyebrow: 'ORGANIZER · WEATHER', title: 'Weather Intelligence', subtitle: 'How live and simulated weather connects to crowd, gates, volunteers and transport.' },
  attendee: { eyebrow: 'ATTENDEE · WEATHER', title: 'Weather Intelligence', subtitle: 'Live conditions at the venue and how they may affect your journey tonight — indoor options and warnings included.' },
  partner: { eyebrow: 'PARTNER · WEATHER', title: 'Weather Intelligence', subtitle: 'How weather could shift restaurant/hotel demand, capacity and wait times.' },
};

export default function Weather({ role = 'attendee' }) {
  const { loading, current, forecast } = useWeather();
  const { crowd, volunteers } = useEventData();
  const TABS = (ROLE_TABS[role] || ROLE_TABS.attendee).map(id => ALL_TABS[id]);
  const [tab, setTab] = useState('overview');
  const [sliders, setSliders] = useState(PRESETS[0].values);
  const [activePreset, setActivePreset] = useState('current');
  const [result, setResult] = useState(null);

  // Digital Twin uses the LIVE weather API as its input by default: once the
  // real reading arrives, seed the "Current Weather" preset from it (unless
  // the user has already moved off that preset to explore a what-if case).
  React.useEffect(() => {
    if (current && activePreset === 'current') setSliders(slidersFromLiveWeather(current));
  }, [current]); // eslint-disable-line react-hooks/exhaustive-deps

  const baseAvgEta = useMemo(() => {
    const mins = transport.map(t => parseInt(t.eta) || 0);
    return Math.round(mins.reduce((a, b) => a + b, 0) / mins.length);
  }, []);

  const base = useMemo(() => ({
    gates: crowd.gates,
    utilization: crowd.utilization,
    volunteerCount: volunteers.length,
    avgEtaMin: baseAvgEta,
  }), [crowd, volunteers, baseAvgEta]);

  const sim = result || runSimulation(sliders, base);
  const copy = roleCopy[role] || roleCopy.attendee;

  const onSliderChange = (key, value) => {
    setSliders(s => ({ ...s, [key]: value }));
    setActivePreset(null);
  };
  const onPreset = (p) => { setSliders(p.values); setActivePreset(p.id); setResult(null); };
  const onRun = () => setResult(runSimulation(sliders, base));

  return (
    <div className="weather-page">
      <PageHeader eyebrow={copy.eyebrow} title={copy.title} subtitle={copy.subtitle} />

      <div className="weather-tabs">
        {TABS.map(t => (
          <button key={t.id} className={'weather-tab ' + (tab === t.id ? 'active' : '')} onClick={() => setTab(t.id)}>{t.label}</button>
        ))}
      </div>

      {loading && <LoadingState label="Fetching live venue weather…" />}

      {!loading && tab === 'overview' && (
        <>
          <div className="content-grid two-one">
            <section className="panel"><SectionHeader icon={<CloudSun size={18} style={{ marginRight: 8 }} />} title="Right now at the venue" subtitle="D.Y. Patil Stadium · Navi Mumbai" /><WeatherCard current={current} /></section>
            <section className="panel">
              <SectionHeader title="Quick impact read" subtitle="Based on current weather conditions" />
              <div className="pressure-grid">
                <div><span>Crowd pressure</span><b className={sim.crowdPressureDelta > 12 ? 'red' : sim.crowdPressureDelta > 5 ? 'amber' : 'green'}>+{sim.crowdPressureDelta}%</b></div>
                <div><span>{role === 'partner' ? 'Wait time' : 'Volunteers needed'}</span><b className={sim.volunteerNeedExtra > 5 ? 'amber' : 'green'}>{role === 'partner' ? `${sim.restaurantDemandDelta >= 0 ? '+' : ''}${sim.restaurantDemandDelta}%` : `+${sim.volunteerNeedExtra}`}</b></div>
                <div><span>Transport delay</span><b className={sim.transportDelay > 15 ? 'red' : sim.transportDelay > 5 ? 'amber' : 'green'}>+{sim.transportDelay}m</b></div>
                <div><span>Food demand</span><b className={sim.restaurantDemandDelta > 20 ? 'amber' : 'green'}>{sim.restaurantDemandDelta >= 0 ? '+' : ''}{sim.restaurantDemandDelta}%</b></div>
              </div>
              {role === 'organizer' && <button className="text-btn" onClick={() => setTab('whatif')}>Open What-If Simulation <ArrowRight size={13} /></button>}
              {role === 'partner' && <button className="text-btn" onClick={() => setTab('impact')}>See demand impact <ArrowRight size={13} /></button>}
              {role === 'attendee' && <button className="text-btn" onClick={() => setTab('map')}>See affected venue areas <ArrowRight size={13} /></button>}
            </section>
          </div>
          {sim.severity > 0.5 && <AlertCard tone="amber" title="Elevated weather pressure right now" description="Conditions suggest noticeably higher gate and transport pressure than normal — check the map and warnings before you head out." />}
        </>
      )}

      {!loading && tab === 'live' && (
        <section className="panel">
          <SectionHeader icon={<CloudSun size={18} style={{ marginRight: 8 }} />} title="Live Weather" subtitle="D.Y. Patil Stadium, Navi Mumbai — refreshed on page load" />
          <WeatherCard current={current} />
          <div className="pressure-grid" style={{ marginTop: 14 }}>
            <MetricCard label="Humidity" value={current.humidity} unit="%" />
            <MetricCard label="Wind" value={current.windSpeed} unit=" km/h" />
            <MetricCard label="Rainfall (1h)" value={current.rainfallMm} unit=" mm" />
            <MetricCard label="Rain probability" value={current.rainProbability} unit="%" />
          </div>
        </section>
      )}

      {!loading && tab === 'forecast' && (
        <section className="panel">
          <SectionHeader icon={<CalendarClock size={18} style={{ marginRight: 8 }} />} title="Forecast" subtitle="Next hours at the venue" />
          <div className="forecast-cards">
            {forecast.slots.map(s => (
              <div key={s.label}>
                <span>{s.label}</span>
                <b>{s.temp}°C · {s.condition}</b>
                <small><Droplets size={11} /> {s.rainProbability}% rain</small>
              </div>
            ))}
          </div>
        </section>
      )}

      {!loading && tab === 'impact' && (
        <section className="panel">
          <SectionHeader icon={<Wind size={18} style={{ marginRight: 8 }} />} title="Weather Impact" subtitle="How the current simulation changes each PRABANDH system vs. its live baseline" />
          <DataTable
            columns={['System', 'Live baseline', 'Simulated', 'Change']}
            rows={[
              ['Crowd utilization', `${crowd.utilization}%`, `${sim.simulatedUtilization}%`, <StatusBadge tone={sim.crowdPressureDelta > 12 ? 'red' : sim.crowdPressureDelta > 5 ? 'amber' : 'green'}>+{sim.crowdPressureDelta}%</StatusBadge>],
              ['Volunteers on shift', volunteers.length, sim.simulatedVolunteers, <StatusBadge tone={sim.volunteerNeedExtra > 5 ? 'amber' : 'green'}>+{sim.volunteerNeedExtra}</StatusBadge>],
              ['Avg. transport ETA', `${baseAvgEta} min`, `${sim.simulatedEtaMin} min`, <StatusBadge tone={sim.transportDelay > 15 ? 'red' : sim.transportDelay > 5 ? 'amber' : 'green'}>+{sim.transportDelay}m</StatusBadge>],
              ['Food & beverage demand', 'Baseline', `${sim.restaurantDemandDelta >= 0 ? '+' : ''}${sim.restaurantDemandDelta}%`, <StatusBadge tone={sim.restaurantDemandDelta > 20 ? 'amber' : 'green'}>vs baseline</StatusBadge>],
              ['Hotel / stay demand', 'Baseline', `${sim.hotelDemandDelta >= 0 ? '+' : ''}${sim.hotelDemandDelta}%`, <StatusBadge tone={sim.hotelDemandDelta > 15 ? 'amber' : 'green'}>vs baseline</StatusBadge>],
            ]}
          />
          <div className="panel" style={{ marginTop: 14 }}>
            <div className="panel-head">
              <div><h3>MODEL ESTIMATE</h3><p>Predicted value, confidence and expected range for the weather-driven crowd model.</p></div>
            </div>
            <div className="pressure-grid">
              <div><span>Predicted value</span><b className={sim.crowdPressureDelta > 12 ? 'red' : sim.crowdPressureDelta > 5 ? 'amber' : 'green'}>+{sim.crowdPressureDelta}%</b></div>
              <div><span>Confidence</span><b>{sim.confidence}%</b></div>
              <div><span>Expected range</span><b>{sim.expectedRange.low}%–{sim.expectedRange.high}%</b></div>
              <div><span>Affected area</span><b>{sim.affectedArea}%</b></div>
            </div>
          </div>
        </section>
      )}

      {!loading && tab === 'twin' && (
        <section className="panel">
          <SectionHeader icon={<GitCompare size={18} style={{ marginRight: 8 }} />} title="Digital Twin" subtitle="Real event state vs. simulated state under current weather settings — simulation never modifies live data" />
          <div className="twin-grid">
            <div className="twin-col">
              <span className="twin-label">REAL STATE</span>
              {Object.entries(crowd.gates).map(([letter, val]) => (
                <div className="twin-row" key={letter}><span>Gate {letter}</span><b>{val}%</b></div>
              ))}
              <div className="twin-row"><span>Volunteers</span><b>{volunteers.length}</b></div>
              <div className="twin-row"><span>Avg. transport ETA</span><b>{baseAvgEta} min</b></div>
            </div>
            <div className="twin-col simulated">
              <span className="twin-label">SIMULATED STATE</span>
              {Object.entries(sim.simulatedGates).map(([letter, val]) => (
                <div className="twin-row" key={letter}><span>Gate {letter}</span><b>{val}%</b></div>
              ))}
              <div className="twin-row"><span>Volunteers</span><b>{sim.simulatedVolunteers}</b></div>
              <div className="twin-row"><span>Avg. transport ETA</span><b>{sim.simulatedEtaMin} min</b></div>
            </div>
          </div>
        </section>
      )}

      {!loading && tab === 'whatif' && (
        <SimulationCard values={sliders} onChange={onSliderChange} presets={PRESETS} activePreset={activePreset} onPreset={onPreset} onRun={onRun} />
      )}

      {!loading && tab === 'map' && (
        <>
          <WeatherImpactMap impactByGate={sim.impactByGate} transportDelay={sim.transportDelay} restaurantDemandDelta={sim.restaurantDemandDelta} hotelDemandDelta={sim.hotelDemandDelta} affectedArea={sim.affectedArea} />
          {role === 'attendee' && sim.severity > 0.35 && <AlertCard tone="blue" title="Indoor option recommended" description="Outdoor zones are under higher weather pressure — the Food Court and covered stalls near Gate C offer indoor/covered alternatives." />}
        </>
      )}

      {!loading && tab === 'social' && (
        <section className="panel">
          <SectionHeader icon={<MessageSquareText size={18} style={{ marginRight: 8 }} />} title="Social Signals" subtitle="Reported conditions, emerging issues and location-related chatter near the venue — situational awareness only" />
          <div className="social-list">
            {socialSignals.map(s => (
              <div className="social-row" key={s.id}>
                <StatusBadge tone={s.sentiment}>{s.source}</StatusBadge>
                <div><b>{s.handle}</b><p>{s.text}</p></div>
                <small>{s.time}</small>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
