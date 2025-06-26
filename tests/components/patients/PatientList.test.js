import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import PatientList from '@/components/patients/PatientList'
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

const TestWrapper = ({ children }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
)

describe('PatientList Component', () => {
  const mockPatients = [
    {
      id: 'patient-1',
      name: 'John Doe',
      date_of_birth: '1990-01-01',
      gender: 'male',
      email: 'john@example.com',
      phone: '+1234567890',
      medical_record_number: 'MRN001',
      emergency_contact: {
        name: 'Jane Doe',
        phone: '+0987654321',
        relationship: 'spouse'
      },
      allergies: ['Penicillin'],
      medical_conditions: ['Diabetes'],
      created_at: '2024-01-01T00:00:00.000Z'
    },
    {
      id: 'patient-2',
      name: 'Alice Smith',
      date_of_birth: '1985-05-15',
      gender: 'female',
      email: 'alice@example.com',
      phone: '+1555666777',
      medical_record_number: 'MRN002',
      emergency_contact: {
        name: 'Bob Smith',
        phone: '+1555666888',
        relationship: 'husband'
      },
      allergies: ['Shellfish'],
      medical_conditions: ['Hypertension'],
      created_at: '2024-01-02T00:00:00.000Z'
    },
    {
      id: 'patient-3',
      name: 'Bob Johnson',
      date_of_birth: '1975-12-25',
      gender: 'male',
      email: 'bob@example.com',
      phone: '+1999888777',
      medical_record_number: 'MRN003',
      emergency_contact: null,
      allergies: [],
      medical_conditions: [],
      created_at: '2024-01-03T00:00:00.000Z'
    }
  ]

  const mockUsePatients = {
    patients: mockPatients,
    selectedPatient: null,
    loading: false,
    error: null,
    selectPatient: vi.fn(),
    addPatient: vi.fn(),
    updatePatient: vi.fn(),
    deletePatient: vi.fn(),
    refreshPatients: vi.fn()
  }

  const defaultProps = {
    onSelectPatient: vi.fn(),
    onEditPatient: vi.fn(),
    onDeletePatient: vi.fn(),
    showAddButton: true,
    viewMode: 'grid'
  }

  beforeEach(() => {
    vi.clearAllMocks()
    usePatients.mockReturnValue(mockUsePatients)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Basic Rendering', () => {
    it('renders patient list with all patients', () => {
      render(
        <TestWrapper>
          <PatientList {...defaultProps} />
        </TestWrapper>
      )

      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('Alice Smith')).toBeInTheDocument()
      expect(screen.getByText('Bob Johnson')).toBeInTheDocument()
    })

    it('shows loading state', () => {
      usePatients.mockReturnValue({
        ...mockUsePatients,
        loading: true,
        patients: []
      })

      render(
        <TestWrapper>
          <PatientList {...defaultProps} />
        </TestWrapper>
      )

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
    })

    it('shows error state', () => {
      usePatients.mockReturnValue({
        ...mockUsePatients,
        error: 'Failed to load patients',
        patients: []
      })

      render(
        <TestWrapper>
          <PatientList {...defaultProps} />
        </TestWrapper>
      )

      expect(screen.getByText(/failed to load patients/i)).toBeInTheDocument()
    })

    it('shows empty state when no patients', () => {
      usePatients.mockReturnValue({
        ...mockUsePatients,
        patients: []
      })

      render(
        <TestWrapper>
          <PatientList {...defaultProps} />
        </TestWrapper>
      )

      expect(screen.getByText(/no patients found/i)).toBeInTheDocument()
    })

    it('renders add patient button when showAddButton is true', () => {
      render(
        <TestWrapper>
          <PatientList {...defaultProps} showAddButton={true} />
        </TestWrapper>
      )

      expect(screen.getByRole('button', { name: /add patient/i })).toBeInTheDocument()
    })

    it('hides add patient button when showAddButton is false', () => {
      render(
        <TestWrapper>
          <PatientList {...defaultProps} showAddButton={false} />
        </TestWrapper>
      )

      expect(screen.queryByRole('button', { name: /add patient/i })).not.toBeInTheDocument()
    })
  })

  describe('Search Functionality', () => {
    it('filters patients by name', async () => {
      const user = userEvent.setup()
      render(
        <TestWrapper>
          <PatientList {...defaultProps} />
        </TestWrapper>
      )

      const searchInput = screen.getByPlaceholderText(/search patients/i)
      await user.type(searchInput, 'John')

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument()
        expect(screen.queryByText('Alice Smith')).not.toBeInTheDocument()
        expect(screen.queryByText('Bob Johnson')).not.toBeInTheDocument()
      })
    })

    it('filters patients by email', async () => {
      const user = userEvent.setup()
      render(
        <TestWrapper>
          <PatientList {...defaultProps} />
        </TestWrapper>
      )

      const searchInput = screen.getByPlaceholderText(/search patients/i)
      await user.type(searchInput, 'alice@example.com')

      await waitFor(() => {
        expect(screen.getByText('Alice Smith')).toBeInTheDocument()
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument()
        expect(screen.queryByText('Bob Johnson')).not.toBeInTheDocument()
      })
    })

    it('filters patients by medical record number', async () => {
      const user = userEvent.setup()
      render(
        <TestWrapper>
          <PatientList {...defaultProps} />
        </TestWrapper>
      )

      const searchInput = screen.getByPlaceholderText(/search patients/i)
      await user.type(searchInput, 'MRN002')

      await waitFor(() => {
        expect(screen.getByText('Alice Smith')).toBeInTheDocument()
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument()
        expect(screen.queryByText('Bob Johnson')).not.toBeInTheDocument()
      })
    })

    it('shows no results message when search returns empty', async () => {
      const user = userEvent.setup()
      render(
        <TestWrapper>
          <PatientList {...defaultProps} />
        </TestWrapper>
      )

      const searchInput = screen.getByPlaceholderText(/search patients/i)
      await user.type(searchInput, 'nonexistent')

      await waitFor(() => {
        expect(screen.getByText(/no patients match your search/i)).toBeInTheDocument()
      })
    })

    it('clears search when clear button is clicked', async () => {
      const user = userEvent.setup()
      render(
        <TestWrapper>
          <PatientList {...defaultProps} />
        </TestWrapper>
      )

      const searchInput = screen.getByPlaceholderText(/search patients/i)
      await user.type(searchInput, 'John')

      const clearButton = screen.getByRole('button', { name: /clear/i })
      await user.click(clearButton)

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument()
        expect(screen.getByText('Alice Smith')).toBeInTheDocument()
        expect(screen.getByText('Bob Johnson')).toBeInTheDocument()
      })
    })
  })

  describe('Filter Functionality', () => {
    it('filters patients by gender', async () => {
      render(
        <TestWrapper>
          <PatientList {...defaultProps} />
        </TestWrapper>
      )

      const genderFilter = screen.getByLabelText(/filter by gender/i)
      fireEvent.change(genderFilter, { target: { value: 'female' } })

      await waitFor(() => {
        expect(screen.getByText('Alice Smith')).toBeInTheDocument()
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument()
        expect(screen.queryByText('Bob Johnson')).not.toBeInTheDocument()
      })
    })

    it('filters patients by age range', async () => {
      render(
        <TestWrapper>
          <PatientList {...defaultProps} />
        </TestWrapper>
      )

      const ageFilter = screen.getByLabelText(/filter by age/i)
      fireEvent.change(ageFilter, { target: { value: '30-40' } })

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument() // 34 years old
        expect(screen.getByText('Alice Smith')).toBeInTheDocument() // 39 years old
        expect(screen.queryByText('Bob Johnson')).not.toBeInTheDocument() // 49 years old
      })
    })

    it('resets filters when reset button is clicked', async () => {
      const user = userEvent.setup()
      render(
        <TestWrapper>
          <PatientList {...defaultProps} />
        </TestWrapper>
      )

      // Apply gender filter
      const genderFilter = screen.getByLabelText(/filter by gender/i)
      fireEvent.change(genderFilter, { target: { value: 'female' } })

      // Click reset
      const resetButton = screen.getByRole('button', { name: /reset filters/i })
      await user.click(resetButton)

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument()
        expect(screen.getByText('Alice Smith')).toBeInTheDocument()
        expect(screen.getByText('Bob Johnson')).toBeInTheDocument()
      })
    })
  })

  describe('Sort Functionality', () => {
    it('sorts patients by name ascending', async () => {
      render(
        <TestWrapper>
          <PatientList {...defaultProps} />
        </TestWrapper>
      )

      const sortSelect = screen.getByLabelText(/sort by/i)
      fireEvent.change(sortSelect, { target: { value: 'name-asc' } })

      await waitFor(() => {
        const patientNames = screen.getAllByTestId('patient-name')
        expect(patientNames[0]).toHaveTextContent('Alice Smith')
        expect(patientNames[1]).toHaveTextContent('Bob Johnson')
        expect(patientNames[2]).toHaveTextContent('John Doe')
      })
    })

    it('sorts patients by creation date descending', async () => {
      render(
        <TestWrapper>
          <PatientList {...defaultProps} />
        </TestWrapper>
      )

      const sortSelect = screen.getByLabelText(/sort by/i)
      fireEvent.change(sortSelect, { target: { value: 'created-desc' } })

      await waitFor(() => {
        const patientNames = screen.getAllByTestId('patient-name')
        expect(patientNames[0]).toHaveTextContent('Bob Johnson') // Most recent
        expect(patientNames[1]).toHaveTextContent('Alice Smith')
        expect(patientNames[2]).toHaveTextContent('John Doe') // Oldest
      })
    })
  })

  describe('View Mode', () => {
    it('renders in grid view mode', () => {
      render(
        <TestWrapper>
          <PatientList {...defaultProps} viewMode="grid" />
        </TestWrapper>
      )

      expect(screen.getByTestId('patient-grid')).toBeInTheDocument()
    })

    it('renders in list view mode', () => {
      render(
        <TestWrapper>
          <PatientList {...defaultProps} viewMode="list" />
        </TestWrapper>
      )

      expect(screen.getByTestId('patient-list')).toBeInTheDocument()
    })

    it('toggles view mode when view toggle is clicked', async () => {
      const user = userEvent.setup()
      render(
        <TestWrapper>
          <PatientList {...defaultProps} viewMode="grid" />
        </TestWrapper>
      )

      const viewToggle = screen.getByRole('button', { name: /list view/i })
      await user.click(viewToggle)

      expect(screen.getByTestId('patient-list')).toBeInTheDocument()
    })
  })

  describe('Patient Interactions', () => {
    it('calls onSelectPatient when patient is clicked', async () => {
      const user = userEvent.setup()
      render(
        <TestWrapper>
          <PatientList {...defaultProps} />
        </TestWrapper>
      )

      const patientCard = screen.getByTestId('patient-card-patient-1')
      await user.click(patientCard)

      expect(defaultProps.onSelectPatient).toHaveBeenCalledWith(mockPatients[0])
    })

    it('calls onEditPatient when edit button is clicked', async () => {
      const user = userEvent.setup()
      render(
        <TestWrapper>
          <PatientList {...defaultProps} />
        </TestWrapper>
      )

      const editButton = screen.getAllByRole('button', { name: /edit/i })[0]
      await user.click(editButton)

      expect(defaultProps.onEditPatient).toHaveBeenCalledWith(mockPatients[0])
    })

    it('calls onDeletePatient when delete button is confirmed', async () => {
      const user = userEvent.setup()
      render(
        <TestWrapper>
          <PatientList {...defaultProps} />
        </TestWrapper>
      )

      const deleteButton = screen.getAllByRole('button', { name: /delete/i })[0]
      await user.click(deleteButton)

      // Confirm deletion in modal
      const confirmButton = screen.getByRole('button', { name: /confirm/i })
      await user.click(confirmButton)

      expect(defaultProps.onDeletePatient).toHaveBeenCalledWith(mockPatients[0])
    })
  })

  describe('Accessibility', () => {
    it('has proper accessibility attributes', () => {
      render(
        <TestWrapper>
          <PatientList {...defaultProps} />
        </TestWrapper>
      )

      const searchInput = screen.getByPlaceholderText(/search patients/i)
      expect(searchInput).toHaveAttribute('aria-label')

      const patientCards = screen.getAllByTestId(/patient-card/)
      patientCards.forEach(card => {
        expect(card).toHaveAttribute('tabindex', '0')
        expect(card).toHaveAttribute('role', 'button')
      })
    })

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup()
      render(
        <TestWrapper>
          <PatientList {...defaultProps} />
        </TestWrapper>
      )

      const firstPatientCard = screen.getByTestId('patient-card-patient-1')
      firstPatientCard.focus()

      await user.keyboard('{Enter}')

      expect(defaultProps.onSelectPatient).toHaveBeenCalledWith(mockPatients[0])
    })
  })

  describe('Performance', () => {
    it('handles large number of patients efficiently', () => {
      const manyPatients = Array.from({ length: 100 }, (_, i) => ({
        ...mockPatients[0],
        id: `patient-${i}`,
        name: `Patient ${i}`,
        email: `patient${i}@example.com`
      }))

      usePatients.mockReturnValue({
        ...mockUsePatients,
        patients: manyPatients
      })

      const startTime = performance.now()
      render(
        <TestWrapper>
          <PatientList {...defaultProps} />
        </TestWrapper>
      )
      const endTime = performance.now()

      // Should render within reasonable time (less than 100ms)
      expect(endTime - startTime).toBeLessThan(100)
    })

    it('debounces search input', async () => {
      const user = userEvent.setup()
      render(
        <TestWrapper>
          <PatientList {...defaultProps} />
        </TestWrapper>
      )

      const searchInput = screen.getByPlaceholderText(/search patients/i)
      
      // Type quickly
      await user.type(searchInput, 'John')
      
      // Should not filter immediately
      expect(screen.getByText('Alice Smith')).toBeInTheDocument()
      
      // Wait for debounce
      await waitFor(() => {
        expect(screen.queryByText('Alice Smith')).not.toBeInTheDocument()
      }, { timeout: 1000 })
    })
  })
}) 