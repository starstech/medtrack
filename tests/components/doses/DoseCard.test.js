import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import DoseCard from '@/components/doses/DoseCard'
import { usePatients } from '@/hooks/usePatients'
import dayjs from 'dayjs'

// Mock hooks
vi.mock('@/hooks/usePatients')

// Mock dayjs to ensure consistent time in tests
const mockNow = dayjs('2024-01-15T10:30:00.000Z')
vi.mock('dayjs', () => ({
  default: vi.fn(() => mockNow),
  extend: vi.fn()
}))

describe('DoseCard Component', () => {
  const mockDose = {
    id: 'dose-123',
    medication_id: 'med-456',
    patient_id: 'patient-789',
    scheduled_time: '2024-01-15T09:00:00.000Z',
    actual_time: null,
    status: 'pending',
    notes: 'Take with food',
    side_effects: [],
    medication: {
      id: 'med-456',
      name: 'Metformin',
      dosage_amount: 500,
      dosage_unit: 'mg',
      route: 'oral',
      frequency: 'twice_daily',
      color: '#1890ff'
    },
    patient: {
      id: 'patient-789',
      name: 'John Doe'
    }
  }

  const mockUsePatients = {
    markDose: vi.fn(),
    updateDose: vi.fn(),
    getDoses: vi.fn(),
    loading: false,
    error: null
  }

  const defaultProps = {
    dose: mockDose,
    onMarkDose: vi.fn(),
    onEdit: vi.fn(),
    showPatientName: false,
    compact: false
  }

  beforeEach(() => {
    vi.clearAllMocks()
    usePatients.mockReturnValue(mockUsePatients)
    dayjs.mockReturnValue(mockNow)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Basic Rendering', () => {
    it('renders dose information correctly', () => {
      render(<DoseCard {...defaultProps} />)

      expect(screen.getByText('Metformin')).toBeInTheDocument()
      expect(screen.getByText('500 mg')).toBeInTheDocument()
      expect(screen.getByText('Take with food')).toBeInTheDocument()
      expect(screen.getByText('9:00 AM')).toBeInTheDocument()
    })

    it('displays medication color indicator', () => {
      render(<DoseCard {...defaultProps} />)

      const colorIndicator = screen.getByTestId('medication-color')
      expect(colorIndicator).toHaveStyle({ backgroundColor: '#1890ff' })
    })

    it('shows patient name when showPatientName is true', () => {
      render(<DoseCard {...defaultProps} showPatientName={true} />)

      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })

    it('hides patient name when showPatientName is false', () => {
      render(<DoseCard {...defaultProps} showPatientName={false} />)

      expect(screen.queryByText('John Doe')).not.toBeInTheDocument()
    })

    it('renders in compact mode', () => {
      render(<DoseCard {...defaultProps} compact={true} />)

      const card = screen.getByTestId('dose-card')
      expect(card).toHaveClass('compact')
    })

    it('renders route and frequency information', () => {
      render(<DoseCard {...defaultProps} />)

      expect(screen.getByText(/oral/i)).toBeInTheDocument()
      expect(screen.getByText(/twice daily/i)).toBeInTheDocument()
    })
  })

  describe('Dose Status Display', () => {
    it('shows pending status correctly', () => {
      render(<DoseCard {...defaultProps} />)

      expect(screen.getByTestId('status-badge')).toHaveTextContent('Pending')
      expect(screen.getByTestId('status-badge')).toHaveClass('status-pending')
    })

    it('shows taken status correctly', () => {
      const takenDose = {
        ...mockDose,
        status: 'taken',
        actual_time: '2024-01-15T09:15:00.000Z'
      }

      render(<DoseCard {...defaultProps} dose={takenDose} />)

      expect(screen.getByTestId('status-badge')).toHaveTextContent('Taken')
      expect(screen.getByTestId('status-badge')).toHaveClass('status-taken')
      expect(screen.getByText('Taken at 9:15 AM')).toBeInTheDocument()
    })

    it('shows skipped status correctly', () => {
      const skippedDose = {
        ...mockDose,
        status: 'skipped',
        actual_time: '2024-01-15T09:30:00.000Z'
      }

      render(<DoseCard {...defaultProps} dose={skippedDose} />)

      expect(screen.getByTestId('status-badge')).toHaveTextContent('Skipped')
      expect(screen.getByTestId('status-badge')).toHaveClass('status-skipped')
    })

    it('shows missed status correctly', () => {
      const missedDose = {
        ...mockDose,
        status: 'missed',
        scheduled_time: '2024-01-15T08:00:00.000Z' // Past time
      }

      render(<DoseCard {...defaultProps} dose={missedDose} />)

      expect(screen.getByTestId('status-badge')).toHaveTextContent('Missed')
      expect(screen.getByTestId('status-badge')).toHaveClass('status-missed')
    })

    it('shows overdue indicator for pending doses past scheduled time', () => {
      const overdueDose = {
        ...mockDose,
        scheduled_time: '2024-01-15T08:00:00.000Z' // 2.5 hours ago
      }

      render(<DoseCard {...defaultProps} dose={overdueDose} />)

      expect(screen.getByTestId('overdue-indicator')).toBeInTheDocument()
      expect(screen.getByText(/2h 30m overdue/i)).toBeInTheDocument()
    })

    it('shows upcoming indicator for future doses', () => {
      const futureDose = {
        ...mockDose,
        scheduled_time: '2024-01-15T14:00:00.000Z' // 3.5 hours from now
      }

      render(<DoseCard {...defaultProps} dose={futureDose} />)

      expect(screen.getByTestId('upcoming-indicator')).toBeInTheDocument()
      expect(screen.getByText(/in 3h 30m/i)).toBeInTheDocument()
    })
  })

  describe('Side Effects Display', () => {
    it('shows side effects when present', () => {
      const doseWithSideEffects = {
        ...mockDose,
        side_effects: ['nausea', 'dizziness', 'headache']
      }

      render(<DoseCard {...defaultProps} dose={doseWithSideEffects} />)

      expect(screen.getByText('Side Effects:')).toBeInTheDocument()
      expect(screen.getByText('nausea')).toBeInTheDocument()
      expect(screen.getByText('dizziness')).toBeInTheDocument()
      expect(screen.getByText('headache')).toBeInTheDocument()
    })

    it('hides side effects section when none present', () => {
      render(<DoseCard {...defaultProps} />)

      expect(screen.queryByText('Side Effects:')).not.toBeInTheDocument()
    })

    it('shows side effects with severity indicators', () => {
      const doseWithSevereSideEffects = {
        ...mockDose,
        side_effects: [
          { effect: 'nausea', severity: 'mild' },
          { effect: 'dizziness', severity: 'moderate' },
          { effect: 'headache', severity: 'severe' }
        ]
      }

      render(<DoseCard {...defaultProps} dose={doseWithSevereSideEffects} />)

      expect(screen.getByTestId('side-effect-mild')).toBeInTheDocument()
      expect(screen.getByTestId('side-effect-moderate')).toBeInTheDocument()
      expect(screen.getByTestId('side-effect-severe')).toBeInTheDocument()
    })
  })

  describe('Actions', () => {
    it('shows action buttons for pending doses', () => {
      render(<DoseCard {...defaultProps} />)

      expect(screen.getByRole('button', { name: /mark as taken/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /skip dose/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument()
    })

    it('hides action buttons for completed doses', () => {
      const takenDose = {
        ...mockDose,
        status: 'taken',
        actual_time: '2024-01-15T09:15:00.000Z'
      }

      render(<DoseCard {...defaultProps} dose={takenDose} />)

      expect(screen.queryByRole('button', { name: /mark as taken/i })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /skip dose/i })).not.toBeInTheDocument()
    })

    it('calls onMarkDose when mark as taken is clicked', async () => {
      const user = userEvent.setup()
      render(<DoseCard {...defaultProps} />)

      const markTakenButton = screen.getByRole('button', { name: /mark as taken/i })
      await user.click(markTakenButton)

      expect(defaultProps.onMarkDose).toHaveBeenCalledWith(mockDose, 'taken')
    })

    it('calls onMarkDose when skip dose is clicked', async () => {
      const user = userEvent.setup()
      render(<DoseCard {...defaultProps} />)

      const skipButton = screen.getByRole('button', { name: /skip dose/i })
      await user.click(skipButton)

      expect(defaultProps.onMarkDose).toHaveBeenCalledWith(mockDose, 'skipped')
    })

    it('calls onEdit when edit button is clicked', async () => {
      const user = userEvent.setup()
      render(<DoseCard {...defaultProps} />)

      const editButton = screen.getByRole('button', { name: /edit/i })
      await user.click(editButton)

      expect(defaultProps.onEdit).toHaveBeenCalledWith(mockDose)
    })

    it('shows confirmation dialog before marking as taken', async () => {
      const user = userEvent.setup()
      render(<DoseCard {...defaultProps} />)

      const markTakenButton = screen.getByRole('button', { name: /mark as taken/i })
      await user.click(markTakenButton)

      expect(screen.getByText(/confirm dose taken/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /confirm/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
    })

    it('shows time picker when marking dose as taken', async () => {
      const user = userEvent.setup()
      render(<DoseCard {...defaultProps} />)

      const markTakenButton = screen.getByRole('button', { name: /mark as taken/i })
      await user.click(markTakenButton)

      expect(screen.getByLabelText(/time taken/i)).toBeInTheDocument()
    })
  })

  describe('Interactive Features', () => {
    it('expands to show more details when clicked', async () => {
      const user = userEvent.setup()
      render(<DoseCard {...defaultProps} />)

      const card = screen.getByTestId('dose-card')
      await user.click(card)

      expect(screen.getByTestId('dose-details-expanded')).toBeInTheDocument()
      expect(screen.getByText(/medication instructions/i)).toBeInTheDocument()
    })

    it('collapses when clicked again', async () => {
      const user = userEvent.setup()
      render(<DoseCard {...defaultProps} />)

      const card = screen.getByTestId('dose-card')
      
      // Expand
      await user.click(card)
      expect(screen.getByTestId('dose-details-expanded')).toBeInTheDocument()
      
      // Collapse
      await user.click(card)
      expect(screen.queryByTestId('dose-details-expanded')).not.toBeInTheDocument()
    })

    it('shows medication details in expanded view', async () => {
      const user = userEvent.setup()
      const doseWithDetails = {
        ...mockDose,
        medication: {
          ...mockDose.medication,
          instructions: 'Take with food and plenty of water',
          warnings: ['Do not take with alcohol', 'May cause drowsiness'],
          interactions: ['Aspirin', 'Warfarin']
        }
      }

      render(<DoseCard {...defaultProps} dose={doseWithDetails} />)

      const card = screen.getByTestId('dose-card')
      await user.click(card)

      expect(screen.getByText('Take with food and plenty of water')).toBeInTheDocument()
      expect(screen.getByText('Do not take with alcohol')).toBeInTheDocument()
      expect(screen.getByText('Aspirin')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has proper accessibility attributes', () => {
      render(<DoseCard {...defaultProps} />)

      const card = screen.getByTestId('dose-card')
      expect(card).toHaveAttribute('role', 'article')
      expect(card).toHaveAttribute('tabindex', '0')
      expect(card).toHaveAttribute('aria-label')

      const actionButtons = screen.getAllByRole('button')
      actionButtons.forEach(button => {
        expect(button).toHaveAttribute('aria-label')
      })
    })

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup()
      render(<DoseCard {...defaultProps} />)

      const card = screen.getByTestId('dose-card')
      card.focus()

      await user.keyboard('{Enter}')
      expect(screen.getByTestId('dose-details-expanded')).toBeInTheDocument()

      await user.keyboard('{Escape}')
      expect(screen.queryByTestId('dose-details-expanded')).not.toBeInTheDocument()
    })

    it('announces status changes to screen readers', async () => {
      const user = userEvent.setup()
      render(<DoseCard {...defaultProps} />)

      const markTakenButton = screen.getByRole('button', { name: /mark as taken/i })
      await user.click(markTakenButton)

      const confirmButton = screen.getByRole('button', { name: /confirm/i })
      await user.click(confirmButton)

      expect(screen.getByRole('status')).toHaveTextContent(/dose marked as taken/i)
    })
  })

  describe('Error Handling', () => {
    it('handles missing medication data gracefully', () => {
      const doseWithoutMedication = {
        ...mockDose,
        medication: null
      }

      render(<DoseCard {...defaultProps} dose={doseWithoutMedication} />)

      expect(screen.getByText('Unknown Medication')).toBeInTheDocument()
    })

    it('handles invalid time data gracefully', () => {
      const doseWithInvalidTime = {
        ...mockDose,
        scheduled_time: 'invalid-date'
      }

      render(<DoseCard {...defaultProps} dose={doseWithInvalidTime} />)

      expect(screen.getByText('Invalid Time')).toBeInTheDocument()
    })

    it('shows error state when dose action fails', async () => {
      const user = userEvent.setup()
      mockUsePatients.markDose.mockRejectedValueOnce(new Error('Network error'))
      
      render(<DoseCard {...defaultProps} />)

      const markTakenButton = screen.getByRole('button', { name: /mark as taken/i })
      await user.click(markTakenButton)

      const confirmButton = screen.getByRole('button', { name: /confirm/i })
      await user.click(confirmButton)

      await waitFor(() => {
        expect(screen.getByText(/failed to mark dose/i)).toBeInTheDocument()
      })
    })
  })

  describe('Performance', () => {
    it('memoizes expensive calculations', () => {
      const { rerender } = render(<DoseCard {...defaultProps} />)
      
      const initialRenderTime = performance.now()
      rerender(<DoseCard {...defaultProps} />)
      const secondRenderTime = performance.now()
      
      // Second render should be faster due to memoization
      expect(secondRenderTime - initialRenderTime).toBeLessThan(10)
    })

    it('debounces rapid status changes', async () => {
      const user = userEvent.setup()
      render(<DoseCard {...defaultProps} />)

      const markTakenButton = screen.getByRole('button', { name: /mark as taken/i })
      
      // Rapid clicks
      await user.click(markTakenButton)
      await user.click(markTakenButton)
      await user.click(markTakenButton)

      // Should only call once
      expect(defaultProps.onMarkDose).toHaveBeenCalledTimes(1)
    })
  })
}) 