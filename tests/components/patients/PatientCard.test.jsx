import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import PatientCard from '../../../src/components/patients/PatientCard'

// Mock the usePatients hook
vi.mock('../../../src/hooks/usePatients', () => ({
  usePatients: vi.fn(() => ({
    selectPatient: vi.fn()
  }))
}))

// Mock react-router-dom navigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate
  }
})

const mockPatient = {
  id: 'patient-1',
  name: 'John Doe',
  dateOfBirth: '1990-01-15',
  gender: 'male',
  phone: '+1234567890',
  email: 'john.doe@example.com',
  emergencyContact: 'Jane Doe +1234567891',
  medicalConditions: ['Diabetes', 'Hypertension'],
  allergies: ['Penicillin'],
  createdAt: '2024-01-01T00:00:00Z'
}

const renderWithRouter = (component) => {
  return render(
    <MemoryRouter>
      {component}
    </MemoryRouter>
  )
}

describe('PatientCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders patient information correctly', () => {
    renderWithRouter(<PatientCard patient={mockPatient} />)
    
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText(/34 years old/)).toBeInTheDocument() // Age calculated from 1990
    expect(screen.getByText(/♂/)).toBeInTheDocument() // Gender symbol
  })

  it('displays medical conditions', () => {
    renderWithRouter(<PatientCard patient={mockPatient} />)
    
    expect(screen.getByText('Diabetes')).toBeInTheDocument()
    expect(screen.getByText('Hypertension')).toBeInTheDocument()
    expect(screen.getByText(/2 conditions/)).toBeInTheDocument()
  })

  it('displays allergies', () => {
    renderWithRouter(<PatientCard patient={mockPatient} />)
    
    expect(screen.getByText('Penicillin')).toBeInTheDocument()
    expect(screen.getByText(/1 allergy/)).toBeInTheDocument()
  })

  it('handles click events', async () => {
    renderWithRouter(<PatientCard patient={mockPatient} />)
    
    const card = document.querySelector('.patient-card')
    fireEvent.click(card)
    
    expect(mockNavigate).toHaveBeenCalledWith('/patients/patient-1')
  })

  it('shows critical badge for critical conditions', () => {
    const criticalPatient = {
      ...mockPatient,
      medicalConditions: ['Diabetes Type 2', 'Severe Hypertension']
    }
    
    renderWithRouter(<PatientCard patient={criticalPatient} />)
    
    const criticalBadge = screen.getByText('Critical')
    expect(criticalBadge).toBeInTheDocument()
  })

  it('handles view dashboard button click', () => {
    const { usePatients } = require('../../../src/hooks/usePatients')
    const mockSelectPatient = vi.fn()
    usePatients.mockReturnValue({ selectPatient: mockSelectPatient })
    
    renderWithRouter(<PatientCard patient={mockPatient} />)
    
    const dashboardButton = screen.getByText('View Dashboard')
    fireEvent.click(dashboardButton)
    
    expect(mockSelectPatient).toHaveBeenCalledWith('patient-1')
    expect(mockNavigate).toHaveBeenCalledWith('/')
  })

  it('handles missing optional fields gracefully', () => {
    const minimalPatient = {
      id: 'patient-2',
      name: 'Jane Smith',
      dateOfBirth: '1985-05-20',
      gender: 'female',
      createdAt: '2024-01-01T00:00:00Z'
    }
    
    renderWithRouter(<PatientCard patient={minimalPatient} />)
    
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    expect(screen.getByText('No medical conditions recorded')).toBeInTheDocument()
    expect(screen.queryByText(/Allergies:/)).not.toBeInTheDocument()
  })

  it('displays correct age calculation', () => {
    const youngPatient = {
      ...mockPatient,
      dateOfBirth: '2020-01-01'
    }
    
    renderWithRouter(<PatientCard patient={youngPatient} />)
    
    expect(screen.getByText(/4 years old/)).toBeInTheDocument()
  })

  it('shows gender symbol correctly', () => {
    const femalePatient = {
      ...mockPatient,
      gender: 'female'
    }
    
    renderWithRouter(<PatientCard patient={femalePatient} />)
    
    expect(screen.getByText(/♀/)).toBeInTheDocument()
  })

  it('displays relative time for creation date', () => {
    renderWithRouter(<PatientCard patient={mockPatient} />)
    
    // Should show some relative time text
    expect(screen.getByText(/Added/)).toBeInTheDocument()
  })

  it('limits displayed conditions and shows count', () => {
    const patientWithManyConditions = {
      ...mockPatient,
      medicalConditions: ['Diabetes', 'Hypertension', 'Asthma', 'Arthritis']
    }
    
    renderWithRouter(<PatientCard patient={patientWithManyConditions} />)
    
    expect(screen.getByText('Diabetes')).toBeInTheDocument()
    expect(screen.getByText('Hypertension')).toBeInTheDocument()
    expect(screen.getByText('+2')).toBeInTheDocument() // Shows remaining count
  })

  it('limits displayed allergies and shows count', () => {
    const patientWithManyAllergies = {
      ...mockPatient,
      allergies: ['Penicillin', 'Nuts', 'Shellfish', 'Latex']
    }
    
    renderWithRouter(<PatientCard patient={patientWithManyAllergies} />)
    
    expect(screen.getByText('Penicillin')).toBeInTheDocument()
    expect(screen.getByText('Nuts')).toBeInTheDocument()
    expect(screen.getByText('+2')).toBeInTheDocument() // Shows remaining count
  })
}) 