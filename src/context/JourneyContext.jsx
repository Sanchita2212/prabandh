import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { computeRoute, geocode, DESTINATION } from '../services/routingService';

const Ctx = createContext(null);
const KEY = 'nexora_journey';

export function JourneyProvider({ children }) {
  const [journey, setJourney] = useState(() => {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const [status, setStatus] = useState(() => (journey ? 'ready' : 'idle'));
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      if (journey) {
        localStorage.setItem(KEY, JSON.stringify(journey));
      } else {
        localStorage.removeItem(KEY);
      }
    } catch {
      // localStorage may be unavailable in some private browsing contexts
    }
  }, [journey]);

  const planJourney = useCallback(async (originInput, destinationInput = DESTINATION, mode = 'driving', preference = 'fastest') => {
    setStatus('loading');
    setError(null);

    try {
      const origin = originInput && typeof originInput === 'object' && 'lat' in originInput && 'lon' in originInput
        ? { ...originInput, name: originInput.name || 'Selected start point' }
        : await geocode(originInput);
      const destination = typeof destinationInput === 'string' ? await geocode(destinationInput) : destinationInput;
      const route = await computeRoute(origin, destination, mode, preference);
      const nextJourney = {
        originName: origin.name,
        destinationName: destination.name || DESTINATION.name,
        origin,
        destination,
        mode,
        preference,
        route,
        plannedAt: new Date().toISOString(),
      };

      setJourney(nextJourney);
      setStatus('ready');
      return route;
    } catch (e) {
      setStatus('error');
      setError(e?.message || 'Could not plan journey');
      throw e;
    }
  }, []);

  const updateJourney = useCallback(async (patch) => {
    if (!journey) return null;
    const nextOrigin = patch.originName || journey.originName;
    let nextDestination = patch.destination || journey.destination || DESTINATION;
    const nextMode = patch.mode || journey.mode || 'driving';
    const nextPreference = patch.preference || journey.preference || 'fastest';

    setStatus('loading');
    setError(null);

    try {
      const origin = typeof nextOrigin === 'object' && nextOrigin && 'lat' in nextOrigin && 'lon' in nextOrigin
        ? { ...nextOrigin, name: nextOrigin.name || 'Selected start point' }
        : await geocode(nextOrigin);
      if (typeof nextDestination === 'string') {
        nextDestination = await geocode(nextDestination);
      } else if (!nextDestination?.lat || !nextDestination?.lon) {
        nextDestination = await geocode(nextDestination?.name || DESTINATION.name);
      }

      const route = await computeRoute(origin, nextDestination, nextMode, nextPreference);
      const updated = {
        ...journey,
        originName: origin.name,
        origin,
        destinationName: nextDestination.name || journey.destinationName || DESTINATION.name,
        destination: nextDestination,
        mode: nextMode,
        preference: nextPreference,
        route,
      };
      setJourney(updated);
      setStatus('ready');
      return route;
    } catch (e) {
      setStatus('error');
      setError(e?.message || 'Could not update route');
      throw e;
    }
  }, [journey]);

  const clearJourney = useCallback(() => {
    setJourney(null);
    setStatus('idle');
    setError(null);
  }, []);

  const value = {
    journey,
    status,
    error,
    destination: DESTINATION,
    planJourney,
    updateJourney,
    clearJourney,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useJourney() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useJourney must be used within JourneyProvider');
  return ctx;
}
