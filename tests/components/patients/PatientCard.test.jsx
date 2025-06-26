import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import PatientCard from '../../../src/components/patients/PatientCard'

const mockPatient = {
  id: 'patient-1',
  first_name: 'John',
  last_name: 'Doe',
  date_of_birth: '1990-01-15',
  phone: '+1234567890',
  email: 'john.doe@example.com',
  emergency_contact: 'Jane Doe +1234567891',
  medical_conditions: ['Diabetes', 'Hypertension'],
  allergies: ['Penicillin'],
  notes: 'Test patient notes'
}

describe('PatientCard', () => {
  it('renders patient information correctly', () => {
    render(<PatientCard patient={mockPatient} />)
    
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('john.doe@example.com')).toBeInTheDocument()
    expect(screen.getByText('+1234567890')).toBeInTheDocument()
  })

  it('displays age calculated from date of birth', () => {
    render(<PatientCard patient={mockPatient} />)
    
    // Should show age (calculated from 1990-01-15)
    const ageText = screen.getByText(/\d+ years old/)
    expect(ageText).toBeInTheDocument()
  })

  it('shows medical conditions', () => {
    render(<PatientCard patient={mockPatient} />)
    
    expect(screen.getByText('Diabetes')).toBeInTheDocument()
    expect(screen.getByText('Hypertension')).toBeInTheDocument()
  })

  it('shows allergies', () => {
    render(<PatientCard patient={mockPatient} />)
    
    expect(screen.getByText('Penicillin')).toBeInTheDocument()
  })

  it('handles click events', () => {
    const onClickMock = vi.fn()
    render(<PatientCard patient={mockPatient} onClick={onClickMock} />)
    
    const card = screen.getByTestId('patient-card')
    fireEvent.click(card)
    
    expect(onClickMock).toHaveBeenCalledWith(mockPatient)
  })

  it('shows edit and delete buttons when showActions is true', () => {
    const onEditMock = vi.fn()
    const onDeleteMock = vi.fn()
    
    render(
      <PatientCard 
        patient={mockPatient} 
        showActions 
        onEdit={onEditMock}
        onDelete={onDeleteMock}
      />
    )
    
    expect(screen.getByLabelText('Edit patient')).toBeInTheDocument()
    expect(screen.getByLabelText('Delete patient')).toBeInTheDocument()
  })

  it('calls onEdit when edit button is clicked', () => {
    const onEditMock = vi.fn()
    
    render(
      <PatientCard 
        patient={mockPatient} 
        showActions 
        onEdit={onEditMock}
      />
    )
    
    const editButton = screen.getByLabelText('Edit patient')
    fireEvent.click(editButton)
    
    expect(onEditMock).toHaveBeenCalledWith(mockPatient)
  })

  it('calls onDelete when delete button is clicked', () => {
    const onDeleteMock = vi.fn()
    
    render(
      <PatientCard 
        patient={mockPatient} 
        showActions 
        onDelete={onDeleteMock}
      />
    )
    
    const deleteButton = screen.getByLabelText('Delete patient')
    fireEvent.click(deleteButton)
    
    expect(onDeleteMock).toHaveBeenCalledWith(mockPatient)
  })

  it('displays inactive status when patient is not active', () => {
    const inactivePatient = { ...mockPatient, is_active: false }
    render(<PatientCard patient={inactivePatient} />)
    
    expect(screen.getByText('Inactive')).toBeInTheDocument()
  })

  it('handles missing optional fields gracefully', () => {
    const minimalPatient = {
      id: 'patient-2',
      first_name: 'Jane',
      last_name: 'Smith',
      date_of_birth: '1985-06-20'
    }
    
    render(<PatientCard patient={minimalPatient} />)
    
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    expect(screen.queryByText('@')).not.toBeInTheDocument() // No email
  })

  it('shows loading state when loading prop is true', () => {
    render(<PatientCard loading />)
    
    expect(screen.getByTestId('patient-card-skeleton')).toBeInTheDocument()
  })

  it('applies selected styling when selected prop is true', () => {
    render(<PatientCard patient={mockPatient} selected />)
    
    const card = screen.getByTestId('patient-card')
    expect(card).toHaveClass('patient-card-selected')
  })
}) 