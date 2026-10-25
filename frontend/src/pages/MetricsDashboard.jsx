import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchMetrics } from '../api'
import { Card, CardContent, Typography, CircularProgress, Alert } from '@mui/material'
import { format } from 'date-fns'

export default function MetricsDashboard({ date }) {
  const targetDate = date || format(new Date(), 'yyyy-MM-dd')
  const { data, isLoading, error } = useQuery({ queryKey: ['metrics', targetDate], queryFn: () => fetchMetrics(targetDate) })

  if (isLoading) return <CircularProgress />
  if (error) return <Alert severity="error">{error.message}</Alert>

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>Metrics for {targetDate}</Typography>
        <ul>
          <li>MAE: {data.mae}</li>
          <li>RMSE: {data.rmse}</li>
          <li>Bias: {data.bias}</li>
          <li>Percentiles:
            <ul>
              {Object.entries(data.percentiles).map(([p, v]) => (
                <li key={p}>{p}%: {v}</li>
              ))}
            </ul>
          </li>
        </ul>
      </CardContent>
    </Card>
  )
}
