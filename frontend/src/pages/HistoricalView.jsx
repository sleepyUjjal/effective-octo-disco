import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchActuals, fetchForecasts } from '../api'
import { Card, CardContent, Typography, TextField, Button, CircularProgress, Alert } from '@mui/material'
import { format } from 'date-fns'

export default function HistoricalView() {
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const { data: actuals, isLoading: loadingActuals, error: errActuals, refetch: refetchActuals } = useQuery({ queryKey: ['actuals', date], queryFn: () => fetchActuals(date), enabled: false })
  const { data: forecasts, isLoading: loadingForecasts, error: errForecasts, refetch: refetchForecasts } = useQuery({ queryKey: ['forecasts', date], queryFn: () => fetchForecasts(date), enabled: false })

  const handleFetch = () => {
    refetchActuals()
    refetchForecasts()
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>Historical View</Typography>
        <TextField
          label="Date (YYYY-MM-DD)"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <Button variant="contained" onClick={handleFetch} sx={{ ml: 2 }}>Load</Button>
        {loadingActuals || loadingForecasts ? (
          <CircularProgress sx={{ mt: 2 }} />
        ) : (
          <>
            {errActuals && <Alert severity="error" sx={{ mt: 2 }}>{errActuals.message}</Alert>}
            {actuals && (
              <Typography variant="h6" sx={{ mt: 2 }}>Actuals</Typography>,
              actuals.map((a) => (
                <Typography key={a.start_time} variant="body2">{a.start_time} – {a.generation} MW</Typography>
              ))
            )}
            {forecasts && (
              <Typography variant="h6" sx={{ mt: 2 }}>Forecasts</Typography>,
              forecasts.map((f) => (
                <Typography key={f.start_time} variant="body2">{f.start_time} – {f.generation} MW (published {f.publish_time})</Typography>
              ))
            )}
            {errForecasts && <Alert severity="error" sx={{ mt: 2 }}>{errForecasts.message}</Alert>}
          </>
        )}
      </CardContent>
    </Card>
  )
}
