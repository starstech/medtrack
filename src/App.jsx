import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { PatientProvider } from './contexts/PatientContext'
import { NotificationProvider } from './contexts/NotificationContext'
import AppLayout from './components/common/Layout'
import PasswordResetHandler from './components/auth/PasswordResetHandler'

import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import EmailVerificationPage from './pages/EmailVerificationPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import PasswordResetCodeEntry from './components/auth/PasswordResetCodeEntry'
import DashboardPage from './pages/DashboardPage'
import PatientsPage from './pages/PatientsPage'
import PatientDetailsPage from './pages/PatientDetailsPage'
import TodaysDosesPage from './pages/TodaysDosesPage'
import CalendarPage from './pages/CalendarPage'
import ProfilePage from './pages/ProfilePage'
import NotificationsPage from './pages/NotificationsPage'
import { useAuth } from './hooks/useAuth'

function AppContent() {
  const { user, loading } = useAuth()

  if (loading) {
    return <div style={{ padding: '50px', textAlign: 'center' }}>Loading...</div>
  }

  return (
    <PasswordResetHandler>
      <Routes>
        {/* Public routes - only show when not authenticated */}
        {!user ? (
          <>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/verify-email" element={<EmailVerificationPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/reset-password-code" element={<PasswordResetCodeEntry />} />
            {/* Redirect all other routes to login when not authenticated */}
            <Route path="*" element={<LoginPage />} />
          </>
        ) : (
          /* Protected routes - only show when authenticated */
          <Route path="*" element={
            <AppLayout>
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/patients" element={<PatientsPage />} />
                <Route path="/patients/:id" element={<PatientDetailsPage />} />
                <Route path="/todays-doses" element={<TodaysDosesPage />} />
                <Route path="/calendar" element={<CalendarPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                {/* Redirect any unmatched routes to dashboard when authenticated */}
                <Route path="*" element={<DashboardPage />} />
              </Routes>
            </AppLayout>
          } />
        )}
      </Routes>
    </PasswordResetHandler>
  )
}

// Wrapper component to conditionally provide Patient and Notification contexts
function AuthenticatedProviders({ children }) {
  const { user } = useAuth()
  
  if (user) {
    return (
      <PatientProvider>
        <NotificationProvider>
          {children}
        </NotificationProvider>
      </PatientProvider>
    )
  }
  
  return children
}

function App() {
  return (
    <AuthProvider>
      <AuthenticatedProviders>
        <AppContent />
      </AuthenticatedProviders>
    </AuthProvider>
  )
}

export default App