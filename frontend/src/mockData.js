const DAYS = ['2026-01-13', '2026-01-14', '2026-01-15', '2026-01-16', '2026-01-17']
const iso = (day, slot) => `${day}T${String(Math.floor(slot / 2)).padStart(2, '0')}:${slot % 2 ? '30' : '00'}:00Z`
const round = (n) => Math.round(n)
function makeDay(day) {
  const dayOffset = DAYS.indexOf(day) * 23
  return Array.from({ length: 48 }, (_, slot) => {
    const actual = round(1700 + Math.sin((slot - 11) * Math.PI / 24) * 460 + Math.cos(slot * Math.PI / 8) * 95 + dayOffset)
    const oldError = round(Math.sin(slot * 1.37 + dayOffset) * 138 + Math.cos(slot / 3) * 58)
    const cutoffError = round(Math.sin(slot * 1.78 + dayOffset) * 74 + Math.cos(slot / 4) * 32)
    const lateError = round(Math.sin(slot * 2.1 + dayOffset) * 35)
    return { id: `${day}-${slot}`, slot, delivery: iso(day, slot), time: `${String(Math.floor(slot / 2)).padStart(2, '0')}:${slot % 2 ? '30' : '00'}`, actual, revisions: [
      { published: `${day}T00:30:00Z`, generation: actual + oldError }, { published: `${day}T06:00:00Z`, generation: actual + cutoffError }, { published: `${day}T12:00:00Z`, generation: actual + lateError },
    ] }
  })
}
export const dataset = Object.fromEntries(DAYS.map((day) => [day, makeDay(day)]))
export const dates = DAYS
export function rowsFor(date = '2026-01-15', cutoff = '06:00') {
  const cutoffHour = Number(cutoff.slice(0, 2))
  return (dataset[date] || dataset['2026-01-15']).map((row) => {
    const eligible = row.revisions.filter((r) => Number(r.published.slice(11, 13)) <= cutoffHour)
    const chosen = eligible.at(-1) || row.revisions[0]; const error = chosen.generation - row.actual
    return { ...row, forecast: chosen.generation, published: chosen.published, error, absoluteError: Math.abs(error), eligible: Boolean(eligible.length) }
  })
}
export function metrics(rows) { const errors = rows.map((r) => r.error); const sum = (key) => rows.reduce((n, r) => n + r[key], 0); return { forecast: sum('forecast'), actual: sum('actual'), mae: errors.reduce((n, v) => n + Math.abs(v), 0) / errors.length, rmse: Math.sqrt(errors.reduce((n, v) => n + v ** 2, 0) / errors.length), bias: errors.reduce((n, v) => n + v, 0) / errors.length, valid: rows.length } }
export function errorDistribution(rows) { const bins = new Map(); rows.forEach(({ absoluteError }) => { const n = Math.floor(absoluteError / 25) * 25; bins.set(n, (bins.get(n) || 0) + 1) }); return [...bins.entries()].sort(([a], [b]) => a - b).map(([start, count]) => ({ range: `${start}–${start + 24}`, count })) }
export function getActuals(date) { return Promise.resolve(rowsFor(date).map(({ delivery, actual }) => ({ start_time: delivery, generation: actual }))) }
export function getForecasts(date) { return Promise.resolve(rowsFor(date).map(({ delivery, forecast, published }) => ({ start_time: delivery, generation: forecast, publish_time: published }))) }
export function getMetrics(date) { return Promise.resolve(metrics(rowsFor(date))) }
