import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { PatientProvider } from './contexts/PatientContext'
import { NotificationProvider } from './contexts/NotificationContext'
import Layout from './components/common/Layout'
import AuthPage from './pages/AuthPage'
import DashboardPage from './pages/DashboardPage'
import PatientsPage from './pages/PatientsPage'
import PatientDetailsPage from './pages/PatientDetailsPage'
import TodaysDosesPage from './pages/TodaysDosesPage'
import CalendarPage from './pages/CalendarPage'
import ProfilePage from './pages/ProfilePage'
import { useAuth } from './hooks/useAuth'
import './App.css'

function AppContent() {
  const { user, loading } = useAuth()

  if (loading) {
    return <div>Loading...</div>
  }

  if (!user) {
    return <AuthPage />
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/patients" element={<PatientsPage />} />
        <Route path="/patients/:id" element={<PatientDetailsPage />} />
        <Route path="/todays-doses" element={<TodaysDosesPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </Layout>
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