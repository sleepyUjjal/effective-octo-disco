import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import DataExplorer from '../../pages/DataExplorer';

jest.mock('../../api', () => ({
  fetchActuals: jest.fn(),
  fetchForecasts: jest.fn(),
}));

const { fetchActuals, fetchForecasts } = require('../../api');

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('DataExplorer', () => {
  beforeEach(() => {
    fetchActuals.mockResolvedValue([
      { start_time: '2026-01-01T00:00:00+00:00', generation: 1000 },
      { start_time: '2026-01-01T00:30:00+00:00', generation: 1100 },
    ]);
    fetchForecasts.mockResolvedValue([
      { start_time: '2026-01-01T00:00:00+00:00', generation: 1050, publish_time: '2025-12-31T12:00:00+00:00' },
      { start_time: '2026-01-01T00:30:00+00:00', generation: 1080, publish_time: '2025-12-31T12:30:00+00:00' },
    ]);
  });

  test('renders table rows after load', async () => {
    render(<DataExplorer />, { wrapper: createWrapper() });
    // Wait for rows to appear (including header)
    const rows = await screen.findAllByRole('row');
    expect(rows.length).toBeGreaterThanOrEqual(3);
    expect(screen.getByText('2026-01-01T00:00:00+00:00')).toBeInTheDocument();
  });
});
