// API client for wind data backend
// Adjust BASE_URL if backend runs on a different host/port.
const BASE_URL = 'http://localhost:8000'

/**
 * Helper to perform a GET request and return parsed JSON.
 * Throws an error if the response is not ok.
 */
const authHeader = 'Basic ' + btoa('admin:password')

async function getJson(path) {
  const resp = await fetch(`${BASE_URL}${path}`, {
    headers: { Authorization: authHeader },
  })
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}))
    throw new Error(err.detail || `Request failed with status ${resp.status}`)
  }
  return resp.json()
}

/** Fetch actual wind generation for a given ISO date string (YYYY-MM-DD). */
export async function fetchActuals(date) {
  return getJson(`/actuals/${date}`)
}

/** Fetch wind forecasts for a given ISO date string (YYYY-MM-DD). */
export async function fetchForecasts(date) {
  return getJson(`/forecasts/${date}`)
}

/** Fetch error metrics for a given ISO date string (YYYY-MM-DD). */
export async function fetchMetrics(date) {
  return getJson(`/metrics/${date}`)
}
