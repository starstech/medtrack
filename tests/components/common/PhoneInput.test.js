import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import PhoneInput from '@/components/common/PhoneInput'

describe('PhoneInput', () => {
  const mockOnChange = vi.fn()
  const defaultProps = {
    value: '',
    onChange: mockOnChange,
    placeholder: 'Enter phone number'
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders phone input with placeholder', () => {
    render(<PhoneInput {...defaultProps} />)
    
    expect(screen.getByPlaceholderText('Enter phone number')).toBeInTheDocument()
  })

  it('displays the provided value', () => {
    render(<PhoneInput {...defaultProps} value="+1234567890" />)
    
    const input = screen.getByDisplayValue('+1234567890')
    expect(input).toBeInTheDocument()
  })

  it('calls onChange when input value changes', () => {
    render(<PhoneInput {...defaultProps} />)
    
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: '+1234567890' } })
    
    expect(mockOnChange).toHaveBeenCalledWith('+1234567890')
  })

  it('renders with custom className', () => {
    const customClass = 'custom-phone-input'
    render(<PhoneInput {...defaultProps} className={customClass} />)
    
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass(customClass)
  })

  it('handles disabled state', () => {
    render(<PhoneInput {...defaultProps} disabled />)
    
    const input = screen.getByRole('textbox')
    expect(input).toBeDisabled()
  })

  it('shows error state with error message', () => {
    const errorMessage = 'Invalid phone number'
    render(<PhoneInput {...defaultProps} error={errorMessage} />)
    
    expect(screen.getByText(errorMessage)).toBeInTheDocument()
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('error')
  })

  it('validates phone number format', () => {
    render(<PhoneInput {...defaultProps} />)
    
    const input = screen.getByRole('textbox')
    
    // Test invalid format
    fireEvent.change(input, { target: { value: '123' } })
    fireEvent.blur(input)
    
    expect(screen.getByText(/invalid phone number/i)).toBeInTheDocument()
  })

  it('accepts valid international phone numbers', () => {
    render(<PhoneInput {...defaultProps} />)
    
    const input = screen.getByRole('textbox')
    
    // Test valid format
    fireEvent.change(input, { target: { value: '+1234567890' } })
    fireEvent.blur(input)
    
    expect(screen.queryByText(/invalid phone number/i)).not.toBeInTheDocument()
  })

  it('handles country code selection', () => {
    render(<PhoneInput {...defaultProps} showCountrySelect />)
    
    const countrySelect = screen.getByRole('combobox')
    expect(countrySelect).toBeInTheDocument()
    
    fireEvent.change(countrySelect, { target: { value: 'US' } })
    expect(mockOnChange).toHaveBeenCalled()
  })

  it('formats number according to country', () => {
    render(<PhoneInput {...defaultProps} country="US" />)
    
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: '1234567890' } })
    
    // Should format as US number
    expect(mockOnChange).toHaveBeenCalledWith('+1 (123) 456-7890')
  })
}) 