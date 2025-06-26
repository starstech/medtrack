import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import LoadingSpinner from '../../../src/components/common/LoadingSpinner'

describe('LoadingSpinner', () => {
  it('renders loading spinner', () => {
    render(<LoadingSpinner />)
    
    const spinner = screen.getByTestId('loading-spinner')
    expect(spinner).toBeInTheDocument()
  })

  it('renders with custom text', () => {
    const customText = 'Loading patients...'
    render(<LoadingSpinner text={customText} />)
    
    expect(screen.getByText(customText)).toBeInTheDocument()
  })

  it('renders default loading text when no text provided', () => {
    render(<LoadingSpinner />)
    
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('applies custom size class', () => {
    render(<LoadingSpinner size="large" />)
    
    const spinner = screen.getByTestId('loading-spinner')
    expect(spinner).toHaveClass('spinner-large')
  })

  it('applies default size when no size specified', () => {
    render(<LoadingSpinner />)
    
    const spinner = screen.getByTestId('loading-spinner')
    expect(spinner).toHaveClass('spinner-default')
  })

  it('has proper accessibility attributes', () => {
    render(<LoadingSpinner />)
    
    const spinner = screen.getByTestId('loading-spinner')
    expect(spinner).toHaveAttribute('role', 'status')
    expect(spinner).toHaveAttribute('aria-live', 'polite')
  })

  it('can be centered', () => {
    render(<LoadingSpinner centered />)
    
    const container = screen.getByTestId('loading-spinner').parentElement
    expect(container).toHaveClass('spinner-centered')
  })

  it('shows overlay when overlay prop is true', () => {
    render(<LoadingSpinner overlay />)
    
    const overlay = screen.getByTestId('loading-overlay')
    expect(overlay).toBeInTheDocument()
    expect(overlay).toHaveClass('spinner-overlay')
  })
}) 