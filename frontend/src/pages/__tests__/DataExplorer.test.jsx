import React from 'react'
import { render, screen } from '@testing-library/react'
import DataExplorer from '../../pages/DataExplorer'

describe('DataExplorer', () => {
  test('renders delivery records from the local dataset', () => {
    render(<DataExplorer />)
    expect(screen.getAllByRole('row').length).toBeGreaterThanOrEqual(3)
    expect(screen.getByText('Delivery records')).toBeInTheDocument()
    expect(screen.getByText('00:00')).toBeInTheDocument()
  })
})
