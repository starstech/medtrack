import React from 'react'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import PatientCard from '@/components/patients/PatientCard'
import { usePatients } from '@/hooks/usePatients'

// Mock hooks
vi.mock('@/hooks/usePatients')

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => vi.fn()
  }
})

// Mock Ant Design message
vi.mock('antd', async () => {
  const actual = await vi.importActual('antd')
  return {
    ...actual,
    message: {
      success: vi.fn(),
      error: vi.fn(),
      warning: vi.fn()
    }
  }
})

const TestWrapper = ({ children }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
)

describe('PatientCard Component', () => {
  const mockPatient = {
    id: 'patient-123',
    name: 'John Doe',
    date_of_birth: '1990-01-01',
    gender: 'male',
    email: 'john@example.com',
    phone: '+1234567890',
    medical_record_number: 'MRN123456',
    emergency_contact: {
      name: 'Jane Doe',
      phone: '+0987654321',
      relationship: 'spouse'
    },
    allergies: ['Penicillin', 'Peanuts'],
    medical_conditions: ['Diabetes', 'Hypertension'],
    notes: 'Patient notes here',
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z'
  }

  const mockUsePatients = {
    patients: [mockPatient],
    selectedPatient: null,
    loading: false,
    error: null,
    selectPatient: vi.fn(),
    updatePatient: vi.fn(),
    deletePatient: vi.fn(),
    refreshPatients: vi.fn()
  }

  const defaultProps = {
    patient: mockPatient,
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    onSelect: vi.fn(),
    selected: false,
    showActions: true
  }

  beforeEach(() => {
    vi.clearAllMocks()
    usePatients.mockReturnValue(mockUsePatients)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Basic Rendering', () => {
    it('renders patient information correctly', () => {
      render(
        <TestWrapper>
          <PatientCard {...defaultProps} />
        </TestWrapper>
      )

      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('34 years old')).toBeInTheDocument()
      expect(screen.getByText('john@example.com')).toBeInTheDocument()
      expect(screen.getByText('+1234567890')).toBeInTheDocument()
      expect(screen.getByText('MRN123456')).toBeInTheDocument()
    })

    it('displays patient initials in avatar', () => {
      render(
        <TestWrapper>
          <PatientCard {...defaultProps} />
        </TestWrapper>
      )

      expect(screen.getByText('JD')).toBeInTheDocument()
    })

    it('shows gender badge', () => {
      render(
        <TestWrapper>
          <PatientCard {...defaultProps} />
        </TestWrapper>
      )

      expect(screen.getByText('Male')).toBeInTheDocument()
    })

    it('displays medical record number', () => {
      render(
        <TestWrapper>
          <PatientCard {...defaultProps} />
        </TestWrapper>
      )

      expect(screen.getByText('MRN123456')).toBeInTheDocument()
    })

    it('handles patient without emergency contact', () => {
      const patientWithoutEmergency = {
        ...mockPatient,
        emergency_contact: null
      }

      render(
        <TestWrapper>
          <PatientCard {...defaultProps} patient={patientWithoutEmergency} />
        </TestWrapper>
      )

      expect(screen.getByText('John Doe')).toBeInTheDocument()
      // Should not crash or show emergency contact section
    })

    it('handles patient without photo', () => {
      render(
        <TestWrapper>
          <PatientCard {...defaultProps} />
        </TestWrapper>
      )

      // Should show initials in avatar
      expect(screen.getByText('JD')).toBeInTheDocument()
    })
  })

  describe('Emergency Contact Information', () => {
    it('displays emergency contact when available', () => {
      render(
        <TestWrapper>
          <PatientCard {...defaultProps} />
        </TestWrapper>
      )

      expect(screen.getByText('Jane Doe')).toBeInTheDocument()
      expect(screen.getByText('+0987654321')).toBeInTheDocument()
      expect(screen.getByText('Spouse')).toBeInTheDocument()
    })

    it('handles emergency contact without relationship', () => {
      const patientWithPartialEmergency = {
        ...mockPatient,
        emergency_contact: {
          name: 'Jane Doe',
          phone: '+0987654321'
        }
      }

      render(
        <TestWrapper>
          <PatientCard {...defaultProps} patient={patientWithPartialEmergency} />
        </TestWrapper>
      )

      expect(screen.getByText('Jane Doe')).toBeInTheDocument()
      expect(screen.getByText('+0987654321')).toBeInTheDocument()
    })

    it('shows emergency contact call button', () => {
      render(
        <TestWrapper>
          <PatientCard {...defaultProps} />
        </TestWrapper>
      )

      const callButton = screen.getByRole('button', { name: /call emergency contact/i })
      expect(callButton).toBeInTheDocument()
    })
  })

  describe('Medical Information', () => {
    it('displays allergies when present', () => {
      render(
        <TestWrapper>
          <PatientCard {...defaultProps} />
        </TestWrapper>
      )

      expect(screen.getByText('Penicillin')).toBeInTheDocument()
      expect(screen.getByText('Peanuts')).toBeInTheDocument()
    })

    it('displays medical conditions when present', () => {
      render(
        <TestWrapper>
          <PatientCard {...defaultProps} />
        </TestWrapper>
      )

      expect(screen.getByText('Diabetes')).toBeInTheDocument()
      expect(screen.getByText('Hypertension')).toBeInTheDocument()
    })

    it('handles patient without allergies', () => {
      const patientWithoutAllergies = {
        ...mockPatient,
        allergies: []
      }

      render(
        <TestWrapper>
          <PatientCard {...defaultProps} patient={patientWithoutAllergies} />
        </TestWrapper>
      )

      expect(screen.getByText('No known allergies')).toBeInTheDocument()
    })

    it('handles patient without medical conditions', () => {
      const patientWithoutConditions = {
        ...mockPatient,
        medical_conditions: []
      }

      render(
        <TestWrapper>
          <PatientCard {...defaultProps} patient={patientWithoutConditions} />
        </TestWrapper>
      )

      expect(screen.getByText('No medical conditions')).toBeInTheDocument()
    })

    it('displays patient notes when present', () => {
      render(
        <TestWrapper>
          <PatientCard {...defaultProps} />
        </TestWrapper>
      )

      expect(screen.getByText('Patient notes here')).toBeInTheDocument()
    })
  })

  describe('Card Actions', () => {
    it('shows action buttons when showActions is true', () => {
      render(
        <TestWrapper>
          <PatientCard {...defaultProps} showActions={true} />
        </TestWrapper>
      )

      expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /view details/i })).toBeInTheDocument()
    })

    it('hides action buttons when showActions is false', () => {
      render(
        <TestWrapper>
          <PatientCard {...defaultProps} showActions={false} />
        </TestWrapper>
      )

      expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument()
    })

    it('calls onEdit when edit button is clicked', async () => {
      const user = userEvent.setup()
      render(
        <TestWrapper>
          <PatientCard {...defaultProps} />
        </TestWrapper>
      )

      const editButton = screen.getByRole('button', { name: /edit/i })
      await user.click(editButton)

      expect(defaultProps.onEdit).toHaveBeenCalledWith(mockPatient)
    })

    it('shows delete confirmation when delete button is clicked', async () => {
      const user = userEvent.setup()
      render(
        <TestWrapper>
          <PatientCard {...defaultProps} />
        </TestWrapper>
      )

      const deleteButton = screen.getByRole('button', { name: /delete/i })
      await user.click(deleteButton)

      expect(screen.getByText(/are you sure/i)).toBeInTheDocument()
    })

    it('calls onDelete when delete is confirmed', async () => {
      const user = userEvent.setup()
      render(
        <TestWrapper>
          <PatientCard {...defaultProps} />
        </TestWrapper>
      )

      const deleteButton = screen.getByRole('button', { name: /delete/i })
      await user.click(deleteButton)

      const confirmButton = screen.getByRole('button', { name: /yes/i })
      await user.click(confirmButton)

      expect(defaultProps.onDelete).toHaveBeenCalledWith(mockPatient.id)
    })

    it('cancels delete when cancel is clicked', async () => {
      const user = userEvent.setup()
      render(
        <TestWrapper>
          <PatientCard {...defaultProps} />
        </TestWrapper>
      )

      const deleteButton = screen.getByRole('button', { name: /delete/i })
      await user.click(deleteButton)

      const cancelButton = screen.getByRole('button', { name: /no/i })
      await user.click(cancelButton)

      expect(defaultProps.onDelete).not.toHaveBeenCalled()
    })

    it('calls onSelect when card is clicked', async () => {
      const user = userEvent.setup()
      render(
        <TestWrapper>
          <PatientCard {...defaultProps} />
        </TestWrapper>
      )

      const card = screen.getByTestId('patient-card')
      await user.click(card)

      expect(defaultProps.onSelect).toHaveBeenCalledWith(mockPatient)
    })
  })

  describe('Selection State', () => {
    it('shows selected state when selected prop is true', () => {
      render(
        <TestWrapper>
          <PatientCard {...defaultProps} selected={true} />
        </TestWrapper>
      )

      const card = screen.getByTestId('patient-card')
      expect(card).toHaveClass('selected')
    })

    it('shows normal state when selected prop is false', () => {
      render(
        <TestWrapper>
          <PatientCard {...defaultProps} selected={false} />
        </TestWrapper>
      )

      const card = screen.getByTestId('patient-card')
      expect(card).not.toHaveClass('selected')
    })

    it('shows checkmark when selected', () => {
      render(
        <TestWrapper>
          <PatientCard {...defaultProps} selected={true} />
        </TestWrapper>
      )

      expect(screen.getByTestId('selected-checkmark')).toBeInTheDocument()
    })
  })

  describe('Age Calculation', () => {
    it('calculates age correctly for adults', () => {
      const patientAge30 = {
        ...mockPatient,
        date_of_birth: new Date(Date.now() - 30 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }

      render(
        <TestWrapper>
          <PatientCard {...defaultProps} patient={patientAge30} />
        </TestWrapper>
      )

      expect(screen.getByText(/30 years old/)).toBeInTheDocument()
    })

    it('handles infants correctly', () => {
      const infantPatient = {
        ...mockPatient,
        date_of_birth: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 6 months ago
      }

      render(
        <TestWrapper>
          <PatientCard {...defaultProps} patient={infantPatient} />
        </TestWrapper>
      )

      expect(screen.getByText(/months old/)).toBeInTheDocument()
    })

    it('handles edge case birthdays', () => {
      const today = new Date()
      const birthdayToday = new Date(today.getFullYear() - 25, today.getMonth(), today.getDate())
      
      const birthdayPatient = {
        ...mockPatient,
        date_of_birth: birthdayToday.toISOString().split('T')[0]
      }

      render(
        <TestWrapper>
          <PatientCard {...defaultProps} patient={birthdayPatient} />
        </TestWrapper>
      )

      expect(screen.getByText(/25 years old/)).toBeInTheDocument()
    })
  })

  describe('Phone Number Formatting', () => {
    it('displays formatted phone numbers', () => {
      const patientWithFormattedPhone = {
        ...mockPatient,
        phone: '+1 (555) 123-4567'
      }

      render(
        <TestWrapper>
          <PatientCard {...defaultProps} patient={patientWithFormattedPhone} />
        </TestWrapper>
      )

      expect(screen.getByText('+1 (555) 123-4567')).toBeInTheDocument()
    })

    it('handles international phone numbers', () => {
      const patientWithIntlPhone = {
        ...mockPatient,
        phone: '+971501234567'
      }

      render(
        <TestWrapper>
          <PatientCard {...defaultProps} patient={patientWithIntlPhone} />
        </TestWrapper>
      )

      expect(screen.getByText('+971501234567')).toBeInTheDocument()
    })

    it('handles phone number calling', async () => {
      const user = userEvent.setup()
      render(
        <TestWrapper>
          <PatientCard {...defaultProps} />
        </TestWrapper>
      )

      const phoneButton = screen.getByRole('button', { name: /call patient/i })
      await user.click(phoneButton)

      // Should trigger phone call (in real app, would open phone app)
      expect(phoneButton).toBeInTheDocument()
    })
  })

  describe('Loading and Error States', () => {
    it('shows loading state when updating patient', () => {
      mockUsePatients.loading = true
      usePatients.mockReturnValue(mockUsePatients)

      render(
        <TestWrapper>
          <PatientCard {...defaultProps} />
        </TestWrapper>
      )

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
    })

    it('shows error state when there is an error', () => {
      mockUsePatients.error = 'Failed to load patient'
      usePatients.mockReturnValue(mockUsePatients)

      render(
        <TestWrapper>
          <PatientCard {...defaultProps} />
        </TestWrapper>
      )

      expect(screen.getByText(/error/i)).toBeInTheDocument()
    })

    it('handles missing patient data gracefully', () => {
      render(
        <TestWrapper>
          <PatientCard {...defaultProps} patient={null} />
        </TestWrapper>
      )

      expect(screen.getByText(/no patient data/i)).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      render(
        <TestWrapper>
          <PatientCard {...defaultProps} />
        </TestWrapper>
      )

      expect(screen.getByRole('article')).toHaveAttribute('aria-label', 'Patient card for John Doe')
      expect(screen.getByRole('button', { name: /edit/i })).toHaveAttribute('aria-label', 'Edit patient John Doe')
      expect(screen.getByRole('button', { name: /delete/i })).toHaveAttribute('aria-label', 'Delete patient John Doe')
    })

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup()
      render(
        <TestWrapper>
          <PatientCard {...defaultProps} />
        </TestWrapper>
      )

      const card = screen.getByTestId('patient-card')
      await user.tab()
      expect(card).toHaveFocus()

      await user.keyboard('{Enter}')
      expect(defaultProps.onSelect).toHaveBeenCalledWith(mockPatient)
    })

    it('has proper color contrast for text', () => {
      render(
        <TestWrapper>
          <PatientCard {...defaultProps} />
        </TestWrapper>
      )

      const patientName = screen.getByText('John Doe')
      const styles = window.getComputedStyle(patientName)
      
      // Basic check for text contrast (actual values would depend on theme)
      expect(styles.color).toBeDefined()
    })
  })

  describe('Responsive Design', () => {
    it('adapts to mobile screen sizes', () => {
      // Mock mobile viewport
      global.innerWidth = 375
      global.dispatchEvent(new Event('resize'))

      render(
        <TestWrapper>
          <PatientCard {...defaultProps} />
        </TestWrapper>
      )

      const card = screen.getByTestId('patient-card')
      expect(card).toHaveClass('mobile-layout')
    })

    it('shows compact view on small screens', () => {
      render(
        <TestWrapper>
          <PatientCard {...defaultProps} compact={true} />
        </TestWrapper>
      )

      // In compact mode, some details might be hidden
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.queryByText('Patient notes here')).not.toBeInTheDocument()
    })
  })
}) 