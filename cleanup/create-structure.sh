#!/bin/bash

# Ensure script is run from project root and src/ exists
if [ ! -d "src" ]; then
  echo "❌ 'src/' directory not found. Run this script from your project's root where 'src/' exists."
  exit 1
fi

# Array of file paths to create
files=(
  "src/components/common/Layout.jsx"
  "src/components/common/Sidebar.jsx"
  "src/components/common/Header.jsx"
  "src/components/common/LoadingSpinner.jsx"

  "src/components/auth/LoginForm.jsx"
  "src/components/auth/RegisterForm.jsx"

  "src/components/dashboard/StatsCards.jsx"
  "src/components/dashboard/RecentActivity.jsx"
  "src/components/dashboard/MedicationOverview.jsx"
  "src/components/dashboard/PatientSelector.jsx"

  "src/components/patients/PatientList.jsx"
  "src/components/patients/PatientCard.jsx"
  "src/components/patients/PatientDetails.jsx"
  "src/components/patients/AddPatientModal.jsx"
  "src/components/patients/MedicationSection.jsx"
  "src/components/patients/MeasurementSection.jsx"
  "src/components/patients/DailyLogs.jsx"

  "src/components/doses/TodaysDoses.jsx"
  "src/components/doses/DoseCard.jsx"
  "src/components/doses/MarkDoseModal.jsx"

  "src/components/calendar/CalendarView.jsx"
  "src/components/calendar/AppointmentModal.jsx"
  "src/components/calendar/CalendarControls.jsx"

  "src/components/profile/ProfileSettings.jsx"
  "src/components/profile/CaregiverManagement.jsx"
  "src/components/profile/NotificationSettings.jsx"

  "src/contexts/AuthContext.jsx"
  "src/contexts/PatientContext.jsx"
  "src/contexts/NotificationContext.jsx"

  "src/hooks/useAuth.js"
  "src/hooks/usePatients.js"
  "src/hooks/useNotifications.js"

  "src/pages/AuthPage.jsx"
  "src/pages/DashboardPage.jsx"
  "src/pages/PatientsPage.jsx"
  "src/pages/PatientDetailsPage.jsx"
  "src/pages/TodaysDosesPage.jsx"
  "src/pages/CalendarPage.jsx"
  "src/pages/ProfilePage.jsx"

  "src/utils/mockData.js"
  "src/utils/dateHelpers.js"
  "src/utils/constants.js"

  "src/styles/global.css"
)

# Create directories and empty files
for file in "${files[@]}"; do
  dir=$(dirname "$file")
  mkdir -p "$dir"
  touch "$file"
done

echo "✅ Folder structure and files created successfully."
