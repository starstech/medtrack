import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import MedicationCard from '@/components/medications/MedicationCard'
import { useMedications } from '@/hooks/useMedications'

// Mock hooks
vi.mock('@/hooks/useMedications')

describe('MedicationCard Component', () => {
  const mockMedication = {
    id: 'med-123',
    name: 'Metformin',
    generic_name: 'Metformin Hydrochloride',
    dosage_amount: 500,
    dosage_unit: 'mg',
    route: 'oral',
    frequency: 'twice_daily',
    instructions: 'Take with food',
    start_date: '2024-01-01',
    end_date: '2024-12-31',
    active: true,
    color: '#1890ff',
    shape: 'round',
    manufacturer: 'Generic Pharma',
    notes: 'Monitor blood sugar levels',
    side_effects: ['nausea', 'diarrhea'],
    warnings: ['Do not drink alcohol'],
    interactions: ['insulin', 'aspirin'],
    patient_id: 'patient-123',
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z'
  }

  const mockDoses = [
    {
      id: 'dose-1',
      medication_id: 'med-123',
      scheduled_time: '2024-01-15T09:00:00.000Z',
      status: 'taken',
      actual_time: '2024-01-15T09:15:00.000Z'
    },
    {
      id: 'dose-2',
      medication_id: 'med-123',
      scheduled_time: '2024-01-15T21:00:00.000Z',
      status: 'pending',
      actual_time: null
    }
  ]

  const mockUseMedications = {
    medications: [mockMedication],
    updateMedication: vi.fn(),
    deleteMedication: vi.fn(),
    getDosesForMedication: vi.fn().mockReturnValue(mockDoses),
    loading: false,
    error: null
  }

  const defaultProps = {
    medication: mockMedication,
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    onViewDoses: vi.fn(),
    showDoseHistory: false,
    compact: false
  }

  beforeEach(() => {
    vi.clearAllMocks()
    useMedications.mockReturnValue(mockUseMedications)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Basic Rendering', () => {
    it('renders medication information correctly', () => {
      render(<MedicationCard {...defaultProps} />)

      expect(screen.getByText('Metformin')).toBeInTheDocument()
      expect(screen.getByText('500 mg')).toBeInTheDocument()
      expect(screen.getByText('Take with food')).toBeInTheDocument()
      expect(screen.getByText('Twice daily')).toBeInTheDocument()
      expect(screen.getByText('Oral')).toBeInTheDocument()
    })

    it('displays generic name when available', () => {
      render(<MedicationCard {...defaultProps} />)

      expect(screen.getByText('Metformin Hydrochloride')).toBeInTheDocument()
    })

    it('shows medication color indicator', () => {
      render(<MedicationCard {...defaultProps} />)

      const colorIndicator = screen.getByTestId('medication-color')
      expect(colorIndicator).toHaveStyle({ backgroundColor: '#1890ff' })
    })

    it('displays medication shape and manufacturer', () => {
      render(<MedicationCard {...defaultProps} />)

      expect(screen.getByText('Round')).toBeInTheDocument()
      expect(screen.getByText('Generic Pharma')).toBeInTheDocument()
    })

    it('shows active status badge', () => {
      render(<MedicationCard {...defaultProps} />)

      expect(screen.getByTestId('active-badge')).toHaveTextContent('Active')
      expect(screen.getByTestId('active-badge')).toHaveClass('status-active')
    })

    it('shows inactive status for discontinued medications', () => {
      const inactiveMedication = {
        ...mockMedication,
        active: false
      }

      render(<MedicationCard {...defaultProps} medication={inactiveMedication} />)

      expect(screen.getByTestId('active-badge')).toHaveTextContent('Inactive')
      expect(screen.getByTestId('active-badge')).toHaveClass('status-inactive')
    })

    it('renders in compact mode', () => {
      render(<MedicationCard {...defaultProps} compact={true} />)

      const card = screen.getByTestId('medication-card')
      expect(card).toHaveClass('compact')
    })
  })

  describe('Dose Information', () => {
    it('shows today\'s dose status', () => {
      render(<MedicationCard {...defaultProps} />)

      expect(screen.getByText('Today: 1 of 2 doses taken')).toBeInTheDocument()
    })

    it('displays next dose time', () => {
      render(<MedicationCard {...defaultProps} />)

      expect(screen.getByText('Next dose: 9:00 PM')).toBeInTheDocument()
    })

    it('shows overdue indicator for missed doses', () => {
      const overdueTime = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
      const overdueDoses = [
        {
          ...mockDoses[0],
          scheduled_time: overdueTime,
          status: 'pending'
        }
      ]

      mockUseMedications.getDosesForMedication.mockReturnValue(overdueDoses)

      render(<MedicationCard {...defaultProps} />)

      expect(screen.getByTestId('overdue-indicator')).toBeInTheDocument()
      expect(screen.getByText(/overdue/i)).toBeInTheDocument()
    })

    it('shows dose history when showDoseHistory is true', () => {
      render(<MedicationCard {...defaultProps} showDoseHistory={true} />)

      expect(screen.getByTestId('dose-history')).toBeInTheDocument()
      expect(screen.getByText('Recent Doses')).toBeInTheDocument()
    })

    it('calculates adherence percentage correctly', () => {
      render(<MedicationCard {...defaultProps} />)

      expect(screen.getByText('Adherence: 50%')).toBeInTheDocument()
    })
  })

  describe('Safety Information', () => {
    it('displays side effects when present', () => {
      render(<MedicationCard {...defaultProps} />)

      expect(screen.getByText('Side Effects:')).toBeInTheDocument()
      expect(screen.getByText('nausea')).toBeInTheDocument()
      expect(screen.getByText('diarrhea')).toBeInTheDocument()
    })

    it('shows warnings when present', () => {
      render(<MedicationCard {...defaultProps} />)

      expect(screen.getByText('Warnings:')).toBeInTheDocument()
      expect(screen.getByText('Do not drink alcohol')).toBeInTheDocument()
    })

    it('displays drug interactions when present', () => {
      render(<MedicationCard {...defaultProps} />)

      expect(screen.getByText('Interactions:')).toBeInTheDocument()
      expect(screen.getByText('insulin')).toBeInTheDocument()
      expect(screen.getByText('aspirin')).toBeInTheDocument()
    })

    it('hides safety sections when data is not present', () => {
      const medicationWithoutSafety = {
        ...mockMedication,
        side_effects: [],
        warnings: [],
        interactions: []
      }

      render(<MedicationCard {...defaultProps} medication={medicationWithoutSafety} />)

      expect(screen.queryByText('Side Effects:')).not.toBeInTheDocument()
      expect(screen.queryByText('Warnings:')).not.toBeInTheDocument()
      expect(screen.queryByText('Interactions:')).not.toBeInTheDocument()
    })

    it('shows safety alert icon for medications with warnings', () => {
      render(<MedicationCard {...defaultProps} />)

      expect(screen.getByTestId('safety-alert-icon')).toBeInTheDocument()
    })
  })

  describe('Actions', () => {
    it('shows action buttons', () => {
      render(<MedicationCard {...defaultProps} />)

      expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /view doses/i })).toBeInTheDocument()
    })

    it('calls onEdit when edit button is clicked', async () => {
      const user = userEvent.setup()
      render(<MedicationCard {...defaultProps} />)

      const editButton = screen.getByRole('button', { name: /edit/i })
      await user.click(editButton)

      expect(defaultProps.onEdit).toHaveBeenCalledWith(mockMedication)
    })

    it('calls onDelete when delete button is clicked', async () => {
      const user = userEvent.setup()
      render(<MedicationCard {...defaultProps} />)

      const deleteButton = screen.getByRole('button', { name: /delete/i })
      await user.click(deleteButton)

      expect(defaultProps.onDelete).toHaveBeenCalledWith(mockMedication)
    })

    it('calls onViewDoses when view doses button is clicked', async () => {
      const user = userEvent.setup()
      render(<MedicationCard {...defaultProps} />)

      const viewDosesButton = screen.getByRole('button', { name: /view doses/i })
      await user.click(viewDosesButton)

      expect(defaultProps.onViewDoses).toHaveBeenCalledWith(mockMedication)
    })

    it('shows confirmation dialog before deletion', async () => {
      const user = userEvent.setup()
      render(<MedicationCard {...defaultProps} />)

      const deleteButton = screen.getByRole('button', { name: /delete/i })
      await user.click(deleteButton)

      expect(screen.getByText(/confirm deletion/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /confirm/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
    })

    it('shows quick dose action buttons for pending doses', () => {
      render(<MedicationCard {...defaultProps} />)

      expect(screen.getByRole('button', { name: /mark dose taken/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /skip dose/i })).toBeInTheDocument()
    })
  })

  describe('Interactive Features', () => {
    it('expands to show detailed information when clicked', async () => {
      const user = userEvent.setup()
      render(<MedicationCard {...defaultProps} />)

      const card = screen.getByTestId('medication-card')
      await user.click(card)

      expect(screen.getByTestId('medication-details-expanded')).toBeInTheDocument()
      expect(screen.getByText('Detailed Information')).toBeInTheDocument()
    })

    it('collapses when clicked again', async () => {
      const user = userEvent.setup()
      render(<MedicationCard {...defaultProps} />)

      const card = screen.getByTestId('medication-card')
      
      // Expand
      await user.click(card)
      expect(screen.getByTestId('medication-details-expanded')).toBeInTheDocument()
      
      // Collapse
      await user.click(card)
      expect(screen.queryByTestId('medication-details-expanded')).not.toBeInTheDocument()
    })

    it('shows medication image when available', async () => {
      const user = userEvent.setup()
      const medicationWithImage = {
        ...mockMedication,
        image_url: 'https://example.com/pill.jpg'
      }

      render(<MedicationCard {...defaultProps} medication={medicationWithImage} />)

      const card = screen.getByTestId('medication-card')
      await user.click(card)

      expect(screen.getByRole('img', { name: /metformin/i })).toBeInTheDocument()
    })

    it('toggles medication active status', async () => {
      const user = userEvent.setup()
      render(<MedicationCard {...defaultProps} />)

      const toggleButton = screen.getByRole('button', { name: /toggle active/i })
      await user.click(toggleButton)

      expect(mockUseMedications.updateMedication).toHaveBeenCalledWith(
        mockMedication.id,
        { active: false }
      )
    })
  })

  describe('Date Information', () => {
    it('shows start and end dates', () => {
      render(<MedicationCard {...defaultProps} />)

      expect(screen.getByText('Started: Jan 1, 2024')).toBeInTheDocument()
      expect(screen.getByText('Ends: Dec 31, 2024')).toBeInTheDocument()
    })

    it('handles medications without end date', () => {
      const ongoingMedication = {
        ...mockMedication,
        end_date: null
      }

      render(<MedicationCard {...defaultProps} medication={ongoingMedication} />)

      expect(screen.getByText('Started: Jan 1, 2024')).toBeInTheDocument()
      expect(screen.getByText('Ongoing')).toBeInTheDocument()
    })

    it('shows days remaining for medications with end dates', () => {
      render(<MedicationCard {...defaultProps} />)

      const daysRemaining = screen.getByTestId('days-remaining')
      expect(daysRemaining).toBeInTheDocument()
    })

    it('highlights medications ending soon', () => {
      const endingSoonMedication = {
        ...mockMedication,
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 7 days from now
      }

      render(<MedicationCard {...defaultProps} medication={endingSoonMedication} />)

      expect(screen.getByTestId('ending-soon-alert')).toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('handles missing medication data gracefully', () => {
      const incompleteMedication = {
        id: 'med-123',
        name: 'Test Med'
        // Missing other fields
      }

      render(<MedicationCard {...defaultProps} medication={incompleteMedication} />)

      expect(screen.getByText('Test Med')).toBeInTheDocument()
      expect(screen.getByText('No dosage info')).toBeInTheDocument()
    })

    it('shows error state when dose data fails to load', () => {
      mockUseMedications.getDosesForMedication.mockImplementation(() => {
        throw new Error('Failed to load doses')
      })

      render(<MedicationCard {...defaultProps} />)

      expect(screen.getByText(/failed to load dose information/i)).toBeInTheDocument()
    })

    it('handles invalid date formats gracefully', () => {
      const medicationWithInvalidDates = {
        ...mockMedication,
        start_date: 'invalid-date',
        end_date: 'invalid-date'
      }

      render(<MedicationCard {...defaultProps} medication={medicationWithInvalidDates} />)

      expect(screen.getByText('Invalid start date')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has proper accessibility attributes', () => {
      render(<MedicationCard {...defaultProps} />)

      const card = screen.getByTestId('medication-card')
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
      render(<MedicationCard {...defaultProps} />)

      const card = screen.getByTestId('medication-card')
      card.focus()

      await user.keyboard('{Enter}')
      expect(screen.getByTestId('medication-details-expanded')).toBeInTheDocument()

      await user.keyboard('{Escape}')
      expect(screen.queryByTestId('medication-details-expanded')).not.toBeInTheDocument()
    })

    it('announces status changes to screen readers', async () => {
      const user = userEvent.setup()
      render(<MedicationCard {...defaultProps} />)

      const toggleButton = screen.getByRole('button', { name: /toggle active/i })
      await user.click(toggleButton)

      expect(screen.getByRole('status')).toHaveTextContent(/medication status updated/i)
    })

    it('provides proper focus management for modals', async () => {
      const user = userEvent.setup()
      render(<MedicationCard {...defaultProps} />)

      const deleteButton = screen.getByRole('button', { name: /delete/i })
      await user.click(deleteButton)

      const confirmButton = screen.getByRole('button', { name: /confirm/i })
      expect(document.activeElement).toBe(confirmButton)
    })
  })

  describe('Performance', () => {
    it('memoizes dose calculations', () => {
      const { rerender } = render(<MedicationCard {...defaultProps} />)
      
      const initialRenderTime = performance.now()
      rerender(<MedicationCard {...defaultProps} />)
      const secondRenderTime = performance.now()
      
      // Second render should be faster due to memoization
      expect(secondRenderTime - initialRenderTime).toBeLessThan(10)
    })

    it('debounces rapid toggle actions', async () => {
      const user = userEvent.setup()
      render(<MedicationCard {...defaultProps} />)

      const toggleButton = screen.getByRole('button', { name: /toggle active/i })
      
      // Rapid clicks
      await user.click(toggleButton)
      await user.click(toggleButton)
      await user.click(toggleButton)

      // Should only call once due to debouncing
      expect(mockUseMedications.updateMedication).toHaveBeenCalledTimes(1)
    })
  })

  describe('Data Validation', () => {
    it('validates dosage format', () => {
      const medicationWithInvalidDosage = {
        ...mockMedication,
        dosage_amount: 'invalid',
        dosage_unit: null
      }

      render(<MedicationCard {...defaultProps} medication={medicationWithInvalidDosage} />)

      expect(screen.getByText('Invalid dosage')).toBeInTheDocument()
    })

    it('validates frequency values', () => {
      const medicationWithInvalidFrequency = {
        ...mockMedication,
        frequency: 'invalid_frequency'
      }

      render(<MedicationCard {...defaultProps} medication={medicationWithInvalidFrequency} />)

      expect(screen.getByText('Custom frequency')).toBeInTheDocument()
    })

    it('sanitizes user-generated content', () => {
      const medicationWithHtml = {
        ...mockMedication,
        notes: '<script>alert("xss")</script>Safe notes',
        instructions: '<img src=x onerror=alert("xss")>Take daily'
      }

      render(<MedicationCard {...defaultProps} medication={medicationWithHtml} />)

      // Should not execute scripts or render dangerous HTML
      expect(screen.getByText('Safe notes')).toBeInTheDocument()
      expect(screen.getByText('Take daily')).toBeInTheDocument()
      expect(screen.queryByText('<script>')).not.toBeInTheDocument()
    })
  })
}) 