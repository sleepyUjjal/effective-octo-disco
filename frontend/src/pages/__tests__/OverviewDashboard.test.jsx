import React from 'react'
import { render, screen } from '@testing-library/react'
import OverviewDashboard from '../../pages/OverviewDashboard'

describe('OverviewDashboard', () => {
  test('renders deterministic generation metrics', () => {
    render(<OverviewDashboard />)
    expect(screen.getByText(/forecast generation/i)).toBeInTheDocument()
    expect(screen.getByText(/actual generation/i)).toBeInTheDocument()
    expect(screen.getByText('83,752 MW')).toBeInTheDocument()
    expect(screen.getByText('83,808 MW')).toBeInTheDocument()
  })
})
