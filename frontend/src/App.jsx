import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { Card, CardContent, Typography, Box } from '@mui/material'
import LatestForecast from './pages/LatestForecast.jsx'
import HistoricalView from './pages/HistoricalView.jsx'
import MetricsDashboard from './pages/MetricsDashboard.jsx'

function App() {
  return (
    <BrowserRouter>
      <Box sx={{ p: 2 }}>
        <Card>
          <CardContent>
            <Typography variant="h4" gutterBottom>
              UK Wind Generation Dashboard
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Link to="/">Latest</Link>
              <Link to="/historical">Historical</Link>
              <Link to="/metrics">Metrics</Link>
            </Box>
            <Routes>
              <Route path="/" element={<LatestForecast />} />
              <Route path="/historical" element={<HistoricalView />} />
              <Route path="/metrics" element={<MetricsDashboard />} />
            </Routes>
          </CardContent>
        </Card>
      </Box>
    </BrowserRouter>
  )
}

export default App
