// Browser requests stay on the current Vercel domain. The /api rewrite sends
// them to the internal FastAPI service without exposing a second hostname.
const apiBase = import.meta.env.VITE_API_BASE_URL || '/api'

async function request(path) {
  const response = await fetch(`${apiBase}${path}`, {
    headers: import.meta.env.VITE_API_TOKEN
      ? { Authorization: `Bearer ${import.meta.env.VITE_API_TOKEN}` }
      : {},
  })
  if (!response.ok) throw new Error(`API request failed: ${response.status}`)
  return response.json()
}

export const fetchActuals = (date) => request(`/actuals/${date}`)
export const fetchForecasts = (date) => request(`/forecasts/${date}`)
export const fetchMetrics = (date) => request(`/metrics/${date}`)
