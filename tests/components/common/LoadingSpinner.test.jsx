import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import LoadingSpinner from '../../../src/components/common/LoadingSpinner'

describe('LoadingSpinner', () => {
  it('renders loading spinner', () => {
    render(<LoadingSpinner />)
    
    // Check for the Ant Design Spin component with aria-busy attribute
    const spinner = screen.getByRole('img', { name: /loading/i })
    expect(spinner).toBeInTheDocument()
  })

  it('renders with custom message', () => {
    const customMessage = 'Loading patients...'
    render(<LoadingSpinner message={customMessage} />)
    
    expect(screen.getByText(customMessage)).toBeInTheDocument()
  })

  it('renders default loading message when no message provided', () => {
    render(<LoadingSpinner />)
    
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('applies custom size correctly', () => {
    render(<LoadingSpinner size="small" />)
    
    // Check that the Spin component renders
    const spinner = screen.getByRole('img', { name: /loading/i })
    expect(spinner).toBeInTheDocument()
  })

  it('uses large size by default', () => {
    render(<LoadingSpinner />)
    
    // Check that the Spin component renders with default styling
    const spinContainer = document.querySelector('.ant-spin-lg')
    expect(spinContainer).toBeInTheDocument()
  })

  it('has proper accessibility attributes', () => {
    render(<LoadingSpinner />)
    
    // Check for the Spin component with accessibility attributes
    const spinContainer = document.querySelector('.ant-spin')
    expect(spinContainer).toHaveAttribute('aria-busy', 'true')
    expect(spinContainer).toHaveAttribute('aria-live', 'polite')
  })

  it('renders within a container with proper structure', () => {
    render(<LoadingSpinner />)
    
    const container = document.querySelector('.loading-container')
    expect(container).toBeInTheDocument()
    
    const space = container.querySelector('.ant-space')
    expect(space).toBeInTheDocument()
  })

  it('displays text with secondary styling', () => {
    const message = 'Custom loading message'
    render(<LoadingSpinner message={message} />)
    
    const text = screen.getByText(message)
    expect(text).toBeInTheDocument()
    expect(text).toHaveClass('ant-typography-secondary')
  })
}) 