// Nugen Intelligence adapter. Keep provider-specific request/response mapping here.
// Set VITE_NUGEN_ALIGNMENT_URL and VITE_NUGEN_INFERENCE_URL in .env when credentials/API details are provided.
const ALIGNMENT_URL = import.meta.env.VITE_NUGEN_ALIGNMENT_URL;
const INFERENCE_URL = import.meta.env.VITE_NUGEN_INFERENCE_URL;
const MODEL_ID = import.meta.env.VITE_NUGEN_MODEL_ID || 'nexora-event-ops-aligned';

export function isNugenConfigured() { return Boolean(INFERENCE_URL); }

export async function runNugenInference(input) {
  if (!INFERENCE_URL) return { configured: false, demo: true, message: 'Nugen endpoint not configured yet.' };
  const res = await fetch(INFERENCE_URL, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: MODEL_ID, input }),
  });
  if (!res.ok) throw new Error(`Nugen inference failed (${res.status})`);
  return { configured: true, demo: false, ...(await res.json()) };
}

export async function requestAlignment(payload) {
  if (!ALIGNMENT_URL) return { configured: false, demo: true, message: 'Add the Nugen alignment endpoint before running customization.' };
  const res = await fetch(ALIGNMENT_URL, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Nugen alignment failed (${res.status})`);
  return { configured: true, demo: false, ...(await res.json()) };
}
