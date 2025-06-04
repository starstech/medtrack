import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { PatientProvider } from './contexts/PatientContext'
import { NotificationProvider } from './contexts/NotificationContext'
import AppLayout from './components/common/Layout'
import AuthPage from './pages/AuthPage'
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

  if (!user) {
    return <AuthPage />
  }

  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/patients" element={<PatientsPage />} />
        <Route path="/patients/:id" element={<PatientDetailsPage />} />
        <Route path="/todays-doses" element={<TodaysDosesPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
      </Routes>
    </AppLayout>
  )
}

function App() {
  return (
    <AuthProvider>
      <PatientProvider>
        <NotificationProvider>
          <AppContent />
        </NotificationProvider>
      </PatientProvider>
    </AuthProvider>
  )
}

export default App