import { getActuals, getForecasts, getMetrics } from './mockData'

export const fetchActuals = (date) => getActuals(date)
export const fetchForecasts = (date) => getForecasts(date)
export const fetchMetrics = (date) => getMetrics(date)
