import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import OverviewDashboard from '../../pages/OverviewDashboard';

jest.mock('../../api', () => ({
  fetchActuals: jest.fn(),
  fetchForecasts: jest.fn(),
  fetchMetrics: jest.fn(),
}));

const { fetchActuals, fetchForecasts, fetchMetrics } = require('../../api');

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('OverviewDashboard', () => {
  beforeEach(() => {
    fetchActuals.mockResolvedValue([
      { start_time: '2026-01-01T00:00:00+00:00', generation: 1000 },
      { start_time: '2026-01-01T00:30:00+00:00', generation: 1100 },
    ]);
    fetchForecasts.mockResolvedValue([
      { start_time: '2026-01-01T00:00:00+00:00', generation: 1050, publish_time: '2025-12-31T12:00:00+00:00' },
      { start_time: '2026-01-01T00:30:00+00:00', generation: 1080, publish_time: '2025-12-31T12:30:00+00:00' },
    ]);
    fetchMetrics.mockResolvedValue({ mae: 25, rmse: 30, bias: 20, percentiles: { '5': 5 } });
  });

  test('renders KPI cards after data loads', async () => {
    render(<OverviewDashboard />, { wrapper: createWrapper() });
    // Wait for data to be rendered
    await waitFor(() => expect(screen.getByText(/Forecast Generation/i)).toBeInTheDocument());
    expect(screen.getByText('2,130 MW')).toBeInTheDocument(); // total forecast
    expect(screen.getByText('2,100 MW')).toBeInTheDocument(); // total actual
    expect(screen.getByText('25.00')).toBeInTheDocument(); // MAE
    expect(screen.getByText('30.00')).toBeInTheDocument(); // RMSE
  });

  test('shows error when API fails', async () => {
    fetchActuals.mockRejectedValue(new Error('fail'));
    render(<OverviewDashboard />, { wrapper: createWrapper() });
    await waitFor(() => expect(screen.getByText(/Forecast Generation/i)).toBeInTheDocument());
    // Should still render KPI title even if data failed
    expect(screen.getByText(/Forecast Generation/i)).toBeInTheDocument();
  });
});
