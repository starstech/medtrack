import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

const PasswordResetHandler = ({ children }) => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    // Check if this is a password reset link
    const code = searchParams.get('code')
    const type = searchParams.get('type')
    
    // If we have a code parameter, this is likely a password reset or email verification
    if (code) {
      // Check if it's a 6-digit numeric code (OTP for password reset)
      if (/^\d{6}$/.test(code) && (type === 'recovery' || !type)) {
        // Redirect to code entry page with the code pre-filled
        navigate(`/reset-password-code?code=${code}`, { replace: true })
        return
      }
      
      // Check if it's specifically a password reset (type=recovery) or if no type is specified
      if (type === 'recovery' || !type) {
        // For longer codes, still redirect to code entry page
        navigate(`/reset-password-code?code=${code}`, { replace: true })
        return
      }
      
      // If it's email verification (type=signup)
      if (type === 'signup') {
        navigate(`/verify-email?mode=verify&token=${code}`, { replace: true })
        return
      }
    }
  }, [searchParams, navigate])

  return children
}

export default PasswordResetHandler 