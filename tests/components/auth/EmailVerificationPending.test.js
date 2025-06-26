import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import EmailVerificationPending from '@/components/auth/EmailVerificationPending'
import * as authService from '@/services/authService'

// Mock authService
vi.mock('@/services/authService')

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

describe('EmailVerificationPending', () => {
  const mockEmail = 'test@example.com'
  
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders email verification pending message', () => {
    renderWithRouter(<EmailVerificationPending email={mockEmail} />)
    
    expect(screen.getByText(/verify your email/i)).toBeInTheDocument()
    expect(screen.getByText(/we've sent a verification link/i)).toBeInTheDocument()
    expect(screen.getByText(mockEmail)).toBeInTheDocument()
  })

  it('renders resend verification button', () => {
    renderWithRouter(<EmailVerificationPending email={mockEmail} />)
    
    expect(screen.getByRole('button', { name: /resend verification/i })).toBeInTheDocument()
  })

  it('calls resendVerification when resend button is clicked', async () => {
    const mockResendVerification = vi.spyOn(authService, 'resendVerification').mockResolvedValue()
    
    renderWithRouter(<EmailVerificationPending email={mockEmail} />)
    
    const resendButton = screen.getByRole('button', { name: /resend verification/i })
    fireEvent.click(resendButton)
    
    await waitFor(() => {
      expect(mockResendVerification).toHaveBeenCalledWith(mockEmail)
    })
  })

  it('shows loading state when resending verification', async () => {
    const mockResendVerification = vi.spyOn(authService, 'resendVerification')
      .mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
    
    renderWithRouter(<EmailVerificationPending email={mockEmail} />)
    
    const resendButton = screen.getByRole('button', { name: /resend verification/i })
    fireEvent.click(resendButton)
    
    expect(resendButton).toBeDisabled()
    
    await waitFor(() => {
      expect(mockResendVerification).toHaveBeenCalledWith(mockEmail)
    })
  })

  it('handles resend verification error', async () => {
    const mockResendVerification = vi.spyOn(authService, 'resendVerification')
      .mockRejectedValue(new Error('Network error'))
    
    renderWithRouter(<EmailVerificationPending email={mockEmail} />)
    
    const resendButton = screen.getByRole('button', { name: /resend verification/i })
    fireEvent.click(resendButton)
    
    await waitFor(() => {
      expect(screen.getByText(/error sending verification/i)).toBeInTheDocument()
    })
  })

  it('renders back to login link', () => {
    renderWithRouter(<EmailVerificationPending email={mockEmail} />)
    
    const backLink = screen.getByRole('link', { name: /back to login/i })
    expect(backLink).toBeInTheDocument()
    expect(backLink).toHaveAttribute('href', '/login')
  })

  it('renders with proper accessibility attributes', () => {
    renderWithRouter(<EmailVerificationPending email={mockEmail} />)
    
    const mainContent = screen.getByRole('main')
    expect(mainContent).toBeInTheDocument()
    
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toBeInTheDocument()
  })
}) 