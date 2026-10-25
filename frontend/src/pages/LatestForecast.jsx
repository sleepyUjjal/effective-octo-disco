import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchForecasts } from '../api'
import { format } from 'date-fns'
import { Card, CardContent, Typography, CircularProgress, Alert } from '@mui/material'

// Show forecast for today (or a given date via prop)
export default function LatestForecast({ date }) {
  const targetDate = date || format(new Date(), 'yyyy-MM-dd')
  const { data, isLoading, error } = useQuery({ queryKey: ['forecast', targetDate], queryFn: () => fetchForecasts(targetDate) })

  if (isLoading) return <CircularProgress />
  if (error) return <Alert severity="error">{error.message}</Alert>

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Forecast for {targetDate}
        </Typography>
        {data.map((f) => (
          <Typography key={f.start_time} variant="body2">
            {f.start_time} – {f.generation} MW (published {f.publish_time})
          </Typography>
        ))}
      </CardContent>
    </Card>
  )
}
