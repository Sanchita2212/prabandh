const API_BASE = 'http://localhost:8200';

export async function fetchDynamicEventState() {
  try {
    const response = await fetch(`${API_BASE}/api/dashboard`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.warn('Dynamic backend unavailable, falling back to local seed data:', error.message);
    return null;
  }
}

export async function fetchPrediction(gate = 'B', restaurant = 'The Food Court') {
  try {
    const response = await fetch(`${API_BASE}/api/predict?gate=${encodeURIComponent(gate)}&restaurant=${encodeURIComponent(restaurant)}`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Prediction API returned ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.warn('Prediction API unavailable:', error.message);
    return null;
  }
}
