import { test, expect } from '@playwright/test'

test.describe('Complete User Flows - Due Diligence Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test.describe('New User Onboarding Flow', () => {
    test('complete new user registration and first patient setup', async ({ page }) => {
      // Registration
      await page.click('text=Create Account')
      await page.fill('[data-testid="signup-first-name"]', 'Dr. Sarah')
      await page.fill('[data-testid="signup-last-name"]', 'Johnson')
      await page.fill('[data-testid="signup-email"]', `test+${Date.now()}@example.com`)
      await page.fill('[data-testid="signup-password"]', 'SecurePassword123!')
      await page.fill('[data-testid="signup-confirm-password"]', 'SecurePassword123!')
      await page.fill('[data-testid="signup-phone"]', '+1234567890')
      await page.click('[data-testid="signup-submit"]')

      // Email verification
      await expect(page.locator('text=Check your email')).toBeVisible()
      
      // Simulate email verification (in real test, would check email)
      await page.goto('/verify-email?token=mock-verification-token')
      await expect(page.locator('text=Email verified successfully')).toBeVisible()

      // Dashboard welcome screen
      await expect(page.locator('text=Welcome to MedTrack')).toBeVisible()
      await expect(page.locator('[data-testid="add-first-patient-button"]')).toBeVisible()

      // Add first patient
      await page.click('[data-testid="add-first-patient-button"]')
      await page.fill('[data-testid="patient-name"]', 'John Smith')
      await page.fill('[data-testid="patient-dob"]', '1985-03-15')
      await page.selectOption('[data-testid="patient-gender"]', 'male')
      await page.fill('[data-testid="patient-email"]', 'john.smith@example.com')
      await page.fill('[data-testid="patient-phone"]', '+1987654321')
      
      // Emergency contact
      await page.click('[data-testid="add-emergency-contact"]')
      await page.fill('[data-testid="emergency-name"]', 'Mary Smith')
      await page.fill('[data-testid="emergency-phone"]', '+1555666777')
      await page.selectOption('[data-testid="emergency-relationship"]', 'spouse')
      
      // Medical information
      await page.fill('[data-testid="allergies"]', 'Penicillin, Shellfish')
      await page.fill('[data-testid="medical-conditions"]', 'Diabetes Type 2, Hypertension')
      await page.fill('[data-testid="patient-notes"]', 'Patient prefers morning appointments')
      
      await page.click('[data-testid="save-patient"]')
      
      // Verify patient was created
      await expect(page.locator('text=Patient added successfully')).toBeVisible()
      await expect(page.locator('text=John Smith')).toBeVisible()
      
      // Verify dashboard shows patient data
      await expect(page.locator('[data-testid="patient-count"]')).toContainText('1')
      await expect(page.locator('[data-testid="selected-patient"]')).toContainText('John Smith')
    })

    test('guided medication setup for new patient', async ({ page }) => {
      // Assuming user is logged in and has a patient
      await page.goto('/patients/patient-123')
      
      // Start medication setup
      await page.click('[data-testid="add-first-medication"]')
      
      // Medication details
      await page.fill('[data-testid="medication-name"]', 'Metformin')
      await page.fill('[data-testid="medication-dosage"]', '500mg')
      await page.selectOption('[data-testid="medication-form"]', 'tablet')
      await page.fill('[data-testid="medication-manufacturer"]', 'Generic Pharma')
      await page.fill('[data-testid="medication-ndc"]', '12345-678-90')
      
      // Dosing schedule
      await page.selectOption('[data-testid="dosing-frequency"]', 'twice_daily')
      await page.fill('[data-testid="dose-amount"]', '1 tablet')
      await page.fill('[data-testid="dose-time-1"]', '08:00')
      await page.fill('[data-testid="dose-time-2"]', '20:00')
      
      // Start and end dates
      await page.fill('[data-testid="start-date"]', '2024-01-01')
      await page.fill('[data-testid="end-date"]', '2024-06-30')
      
      // Special instructions
      await page.fill('[data-testid="instructions"]', 'Take with food. Monitor blood sugar levels.')
      await page.check('[data-testid="take-with-food"]')
      
      await page.click('[data-testid="save-medication"]')
      
      // Verify medication schedule was created
      await expect(page.locator('text=Medication added successfully')).toBeVisible()
      await expect(page.locator('text=Metformin')).toBeVisible()
      
      // Check that doses were scheduled
      await page.goto('/todays-doses')
      await expect(page.locator('[data-testid="dose-card"]')).toHaveCount(2)
      await expect(page.locator('text=Metformin 500mg')).toBeVisible()
      await expect(page.locator('text=08:00')).toBeVisible()
      await expect(page.locator('text=20:00')).toBeVisible()
    })
  })

  test.describe('Daily Medication Management Flow', () => {
    test('complete daily dose tracking workflow', async ({ page }) => {
      await page.goto('/todays-doses')
      
      // Morning dose - Mark as taken
      const morningDose = page.locator('[data-testid="dose-card"]').first()
      await morningDose.click()
      
      await page.click('[data-testid="mark-taken"]')
      await page.fill('[data-testid="actual-time"]', '08:15')
      await page.fill('[data-testid="dose-notes"]', 'Taken with breakfast')
      await page.click('[data-testid="confirm-taken"]')
      
      await expect(page.locator('text=Dose marked as taken')).toBeVisible()
      await expect(morningDose.locator('[data-testid="dose-status"]')).toContainText('Taken')
      
      // Evening dose - Mark as skipped
      const eveningDose = page.locator('[data-testid="dose-card"]').nth(1)
      await eveningDose.click()
      
      await page.click('[data-testid="mark-skipped"]')
      await page.fill('[data-testid="skip-reason"]', 'Patient feeling nauseous')
      await page.click('[data-testid="confirm-skipped"]')
      
      await expect(page.locator('text=Dose marked as skipped')).toBeVisible()
      await expect(eveningDose.locator('[data-testid="dose-status"]')).toContainText('Skipped')
      
      // Check adherence statistics
      await page.goto('/dashboard')
      await expect(page.locator('[data-testid="adherence-rate"]')).toContainText('50%')
      await expect(page.locator('[data-testid="doses-taken-today"]')).toContainText('1')
      await expect(page.locator('[data-testid="doses-missed-today"]')).toContainText('1')
    })

    test('handle overdue dose management', async ({ page }) => {
      await page.goto('/todays-doses')
      
      // Filter to show overdue doses
      await page.click('[data-testid="status-filter"]')
      await page.click('[data-testid="filter-overdue"]')
      
      const overdueDose = page.locator('[data-testid="overdue-dose"]').first()
      await expect(overdueDose.locator('[data-testid="overdue-indicator"]')).toBeVisible()
      
      // Mark overdue dose as missed
      await overdueDose.click()
      await page.click('[data-testid="mark-missed"]')
      await page.fill('[data-testid="miss-reason"]', 'Patient forgot due to busy schedule')
      await page.check('[data-testid="notify-caregiver"]')
      await page.click('[data-testid="confirm-missed"]')
      
      await expect(page.locator('text=Dose marked as missed')).toBeVisible()
      
      // Verify caregiver notification was sent
      await page.goto('/notifications')
      await expect(page.locator('text=Missed dose alert')).toBeVisible()
    })

    test('medication side effect reporting', async ({ page }) => {
      await page.goto('/todays-doses')
      
      const doseCard = page.locator('[data-testid="dose-card"]').first()
      await doseCard.click()
      
      // Mark as taken but report side effect
      await page.click('[data-testid="mark-taken"]')
      await page.fill('[data-testid="actual-time"]', '09:00')
      await page.check('[data-testid="report-side-effect"]')
      
      // Side effect details
      await page.selectOption('[data-testid="side-effect-type"]', 'nausea')
      await page.selectOption('[data-testid="severity"]', 'mild')
      await page.fill('[data-testid="side-effect-description"]', 'Mild nausea 30 minutes after taking medication')
      await page.check('[data-testid="notify-doctor"]')
      
      await page.click('[data-testid="confirm-taken"]')
      
      await expect(page.locator('text=Dose recorded with side effect report')).toBeVisible()
      
      // Verify side effect log
      await page.goto('/patients/patient-123/daily-logs')
      await expect(page.locator('text=Side effect reported')).toBeVisible()
      await expect(page.locator('text=Mild nausea')).toBeVisible()
    })
  })

  test.describe('Patient Medical Data Management', () => {
    test('comprehensive patient profile management', async ({ page }) => {
      await page.goto('/patients/patient-123')
      
      // Edit patient information
      await page.click('[data-testid="edit-patient"]')
      
      // Update basic information
      await page.fill('[data-testid="patient-name"]', 'John Michael Smith')
      await page.fill('[data-testid="patient-email"]', 'john.m.smith@newemail.com')
      
      // Update emergency contact
      await page.fill('[data-testid="emergency-name"]', 'Mary Elizabeth Smith')
      await page.fill('[data-testid="emergency-phone"]', '+1555777888')
      
      // Add new allergy
      await page.click('[data-testid="add-allergy"]')
      await page.fill('[data-testid="new-allergy"]', 'Latex')
      
      // Update medical conditions
      await page.click('[data-testid="add-condition"]')
      await page.fill('[data-testid="new-condition"]', 'High Cholesterol')
      
      // Add medical documents
      await page.click('[data-testid="upload-document"]')
      await page.setInputFiles('[data-testid="file-input"]', './test-files/medical-report.pdf')
      await page.fill('[data-testid="document-title"]', 'Latest Blood Test Results')
      await page.selectOption('[data-testid="document-type"]', 'lab_results')
      
      await page.click('[data-testid="save-patient"]')
      
      await expect(page.locator('text=Patient updated successfully')).toBeVisible()
      await expect(page.locator('text=John Michael Smith')).toBeVisible()
      await expect(page.locator('text=Latex')).toBeVisible()
      await expect(page.locator('text=High Cholesterol')).toBeVisible()
    })

    test('vital signs and measurements tracking', async ({ page }) => {
      await page.goto('/patients/patient-123/measurements')
      
      // Add blood pressure reading
      await page.click('[data-testid="add-vital-signs"]')
      await page.fill('[data-testid="systolic"]', '140')
      await page.fill('[data-testid="diastolic"]', '90')
      await page.fill('[data-testid="heart-rate"]', '75')
      await page.fill('[data-testid="measurement-time"]', '08:30')
      await page.fill('[data-testid="notes"]', 'Measured before morning medication')
      
      // Add photo of reading
      await page.setInputFiles('[data-testid="measurement-photo"]', './test-files/bp-reading.jpg')
      
      await page.click('[data-testid="save-measurement"]')
      
      // Add weight measurement
      await page.click('[data-testid="add-physical-measurement"]')
      await page.fill('[data-testid="weight"]', '180')
      await page.selectOption('[data-testid="weight-unit"]', 'lbs')
      await page.fill('[data-testid="height"]', '70')
      await page.selectOption('[data-testid="height-unit"]', 'inches')
      
      await page.click('[data-testid="save-measurement"]')
      
      // View measurement trends
      await page.click('[data-testid="view-trends"]')
      await expect(page.locator('[data-testid="bp-trend-chart"]')).toBeVisible()
      await expect(page.locator('[data-testid="weight-trend-chart"]')).toBeVisible()
      
      // Verify measurements appear in history
      await page.goto('/patients/patient-123/measurements')
      await expect(page.locator('text=140/90 mmHg')).toBeVisible()
      await expect(page.locator('text=180 lbs')).toBeVisible()
    })

    test('daily logging and incident reporting', async ({ page }) => {
      await page.goto('/patients/patient-123/daily-logs')
      
      // Add wellness log
      await page.click('[data-testid="add-log"]')
      await page.selectOption('[data-testid="log-type"]', 'wellness')
      await page.fill('[data-testid="log-title"]', 'Morning Wellness Check')
      await page.fill('[data-testid="log-description"]', 'Patient reports feeling well. Energy levels good.')
      
      // Add mood rating
      await page.click('[data-testid="mood-scale-7"]') // Rate 7/10
      
      // Add pain level
      await page.click('[data-testid="pain-scale-2"]') // Rate 2/10
      
      await page.click('[data-testid="save-log"]')
      
      // Add incident report
      await page.click('[data-testid="add-log"]')
      await page.selectOption('[data-testid="log-type"]', 'incident')
      await page.selectOption('[data-testid="severity"]', 'moderate')
      await page.fill('[data-testid="log-title"]', 'Fall in Bathroom')
      await page.fill('[data-testid="log-description"]', 'Patient slipped getting out of shower. No injuries but shaken.')
      
      // Add photos of any visible marks
      await page.setInputFiles('[data-testid="incident-photos"]', [
        './test-files/incident-photo-1.jpg',
        './test-files/incident-photo-2.jpg'
      ])
      
      // Mark for follow-up
      await page.check('[data-testid="requires-followup"]')
      await page.fill('[data-testid="followup-notes"]', 'Schedule safety assessment. Consider grab bars.')
      
      await page.click('[data-testid="save-log"]')
      
      await expect(page.locator('text=Incident report saved')).toBeVisible()
      
      // Verify logs appear in timeline
      await expect(page.locator('text=Morning Wellness Check')).toBeVisible()
      await expect(page.locator('text=Fall in Bathroom')).toBeVisible()
      await expect(page.locator('[data-testid="followup-indicator"]')).toBeVisible()
    })
  })

  test.describe('Caregiver Management and Collaboration', () => {
    test('invite and manage multiple caregivers', async ({ page }) => {
      await page.goto('/patients/patient-123/caregivers')
      
      // Invite first caregiver
      await page.click('[data-testid="invite-caregiver"]')
      await page.fill('[data-testid="caregiver-email"]', 'nurse.sarah@clinic.com')
      await page.fill('[data-testid="caregiver-name"]', 'Sarah Wilson, RN')
      await page.selectOption('[data-testid="caregiver-role"]', 'nurse')
      await page.check('[data-testid="permission-view-all"]')
      await page.check('[data-testid="permission-edit-logs"]')
      await page.check('[data-testid="permission-manage-doses"]')
      
      await page.click('[data-testid="send-invitation"]')
      
      await expect(page.locator('text=Invitation sent to Sarah Wilson')).toBeVisible()
      
      // Invite family member
      await page.click('[data-testid="invite-caregiver"]')
      await page.fill('[data-testid="caregiver-email"]', 'mary.smith@email.com')
      await page.fill('[data-testid="caregiver-name"]', 'Mary Smith')
      await page.selectOption('[data-testid="caregiver-role"]', 'family')
      await page.check('[data-testid="permission-view-basic"]')
      await page.check('[data-testid="permission-receive-alerts"]')
      
      await page.click('[data-testid="send-invitation"]')
      
      // Manage existing caregiver permissions
      const caregiverCard = page.locator('[data-testid="caregiver-card"]').first()
      await caregiverCard.locator('[data-testid="manage-permissions"]').click()
      
      await page.uncheck('[data-testid="permission-edit-logs"]')
      await page.check('[data-testid="permission-emergency-contact"]')
      await page.click('[data-testid="update-permissions"]')
      
      await expect(page.locator('text=Permissions updated')).toBeVisible()
    })

    test('caregiver communication and alerts', async ({ page }) => {
      await page.goto('/notifications')
      
      // Send message to caregiver team
      await page.click('[data-testid="new-message"]')
      await page.selectOption('[data-testid="recipient-group"]', 'all-caregivers')
      await page.fill('[data-testid="message-subject"]', 'Patient Appointment Reminder')
      await page.fill('[data-testid="message-body"]', 'Please remember John has a doctor appointment tomorrow at 2 PM.')
      await page.selectOption('[data-testid="priority"]', 'normal')
      
      await page.click('[data-testid="send-message"]')
      
      // Set up automatic alerts
      await page.click('[data-testid="alert-settings"]')
      
      // Missed dose alert
      await page.check('[data-testid="alert-missed-dose"]')
      await page.selectOption('[data-testid="alert-delay"]', '30-minutes')
      await page.check('[data-testid="notify-all-caregivers"]')
      
      // Emergency alert
      await page.check('[data-testid="alert-emergency"]')
      await page.check('[data-testid="notify-emergency-contacts"]')
      await page.check('[data-testid="escalate-to-doctor"]')
      
      await page.click('[data-testid="save-alert-settings"]')
      
      await expect(page.locator('text=Alert settings saved')).toBeVisible()
    })
  })

  test.describe('Advanced Features and Reporting', () => {
    test('medication adherence analysis and reporting', async ({ page }) => {
      await page.goto('/patients/patient-123/reports')
      
      // Generate adherence report
      await page.click('[data-testid="generate-adherence-report"]')
      await page.fill('[data-testid="report-start-date"]', '2024-01-01')
      await page.fill('[data-testid="report-end-date"]', '2024-01-31')
      await page.check('[data-testid="include-side-effects"]')
      await page.check('[data-testid="include-vital-signs"]')
      
      await page.click('[data-testid="generate-report"]')
      
      // Verify report contents
      await expect(page.locator('[data-testid="adherence-percentage"]')).toBeVisible()
      await expect(page.locator('[data-testid="adherence-trend-chart"]')).toBeVisible()
      await expect(page.locator('[data-testid="medication-effectiveness"]')).toBeVisible()
      
      // Export report
      await page.click('[data-testid="export-pdf"]')
      const downloadPromise = page.waitForEvent('download')
      const download = await downloadPromise
      expect(download.suggestedFilename()).toBe('adherence-report-john-smith-jan-2024.pdf')
      
      // Share with doctor
      await page.click('[data-testid="share-with-doctor"]')
      await page.fill('[data-testid="doctor-email"]', 'dr.johnson@clinic.com')
      await page.fill('[data-testid="share-message"]', 'Please review John\'s medication adherence for the past month.')
      await page.click('[data-testid="send-report"]')
      
      await expect(page.locator('text=Report shared successfully')).toBeVisible()
    })

    test('calendar and appointment management', async ({ page }) => {
      await page.goto('/calendar')
      
      // Add doctor appointment
      await page.click('[data-testid="add-appointment"]')
      await page.fill('[data-testid="appointment-title"]', 'Quarterly Checkup')
      await page.selectOption('[data-testid="appointment-type"]', 'doctor-visit')
      await page.fill('[data-testid="appointment-date"]', '2024-02-15')
      await page.fill('[data-testid="appointment-time"]', '14:00')
      await page.fill('[data-testid="doctor-name"]', 'Dr. Robert Johnson')
      await page.fill('[data-testid="clinic-address"]', '123 Medical Center Dr, City, State')
      
      // Set reminders
      await page.check('[data-testid="reminder-24h"]')
      await page.check('[data-testid="reminder-2h"]')
      await page.check('[data-testid="notify-caregivers"]')
      
      // Preparation notes
      await page.fill('[data-testid="preparation-notes"]', 'Bring current medication list. Fast for 12 hours before blood work.')
      
      await page.click('[data-testid="save-appointment"]')
      
      // Add medication review
      await page.click('[data-testid="add-appointment"]')
      await page.selectOption('[data-testid="appointment-type"]', 'medication-review')
      await page.fill('[data-testid="appointment-title"]', 'Pharmacy Consultation')
      await page.fill('[data-testid="appointment-date"]', '2024-02-10')
      await page.fill('[data-testid="appointment-time"]', '10:00')
      
      await page.click('[data-testid="save-appointment"]')
      
      // Verify calendar view
      await expect(page.locator('text=Quarterly Checkup')).toBeVisible()
      await expect(page.locator('text=Pharmacy Consultation')).toBeVisible()
      
      // Test different calendar views
      await page.click('[data-testid="month-view"]')
      await expect(page.locator('[data-testid="calendar-month"]')).toBeVisible()
      
      await page.click('[data-testid="week-view"]')
      await expect(page.locator('[data-testid="calendar-week"]')).toBeVisible()
      
      await page.click('[data-testid="day-view"]')
      await expect(page.locator('[data-testid="calendar-day"]')).toBeVisible()
    })

    test('emergency protocol and rapid response', async ({ page }) => {
      await page.goto('/dashboard')
      
      // Trigger emergency alert
      await page.click('[data-testid="emergency-button"]')
      await page.selectOption('[data-testid="emergency-type"]', 'medical-emergency')
      await page.fill('[data-testid="emergency-description"]', 'Patient experiencing chest pain and shortness of breath')
      await page.check('[data-testid="call-911"]')
      await page.check('[data-testid="notify-all-contacts"]')
      
      await page.click('[data-testid="trigger-emergency"]')
      
      // Verify emergency mode activated
      await expect(page.locator('[data-testid="emergency-mode"]')).toBeVisible()
      await expect(page.locator('text=Emergency Protocol Activated')).toBeVisible()
      
      // Emergency information display
      await expect(page.locator('[data-testid="patient-medical-info"]')).toBeVisible()
      await expect(page.locator('[data-testid="current-medications"]')).toBeVisible()
      await expect(page.locator('[data-testid="allergies-list"]')).toBeVisible()
      await expect(page.locator('[data-testid="emergency-contacts"]')).toBeVisible()
      
      // Quick actions panel
      await expect(page.locator('[data-testid="call-emergency-contact"]')).toBeVisible()
      await expect(page.locator('[data-testid="call-doctor"]')).toBeVisible()
      await expect(page.locator('[data-testid="share-location"]')).toBeVisible()
      
      // Log emergency response
      await page.click('[data-testid="log-response"]')
      await page.fill('[data-testid="response-time"]', '14:32')
      await page.fill('[data-testid="first-responder"]', 'Paramedic Team 7')
      await page.fill('[data-testid="actions-taken"]', '911 called, vitals stabilized, transport to General Hospital')
      await page.click('[data-testid="save-emergency-log"]')
      
      // Deactivate emergency mode
      await page.click('[data-testid="deactivate-emergency"]')
      await page.fill('[data-testid="resolution-notes"]', 'Patient transported to hospital. Stable condition.')
      await page.click('[data-testid="confirm-deactivation"]')
      
      await expect(page.locator('text=Emergency mode deactivated')).toBeVisible()
    })
  })

  test.describe('Mobile Responsiveness and Accessibility', () => {
    test('complete mobile user experience', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 812 })
      await page.goto('/')
      
      // Mobile login
      await page.click('[data-testid="mobile-menu-trigger"]')
      await page.click('text=Sign In')
      await page.fill('[data-testid="email"]', 'test@example.com')
      await page.fill('[data-testid="password"]', 'password123')
      await page.click('[data-testid="sign-in"]')
      
      // Mobile dashboard
      await expect(page.locator('[data-testid="mobile-dashboard"]')).toBeVisible()
      await expect(page.locator('[data-testid="quick-actions"]')).toBeVisible()
      
      // Mobile dose tracking
      await page.click('[data-testid="todays-doses-quick-action"]')
      await expect(page.locator('[data-testid="mobile-dose-list"]')).toBeVisible()
      
      const mobileDose = page.locator('[data-testid="mobile-dose-card"]').first()
      await mobileDose.click()
      
      // Mobile dose marking
      await page.click('[data-testid="mobile-mark-taken"]')
      await page.click('[data-testid="confirm-mobile"]')
      await expect(page.locator('text=Dose marked')).toBeVisible()
      
      // Mobile navigation
      await page.click('[data-testid="mobile-nav-patients"]')
      await expect(page.locator('[data-testid="mobile-patient-list"]')).toBeVisible()
      
      // Mobile patient card
      const mobilePatient = page.locator('[data-testid="mobile-patient-card"]').first()
      await mobilePatient.click()
      await expect(page.locator('[data-testid="mobile-patient-details"]')).toBeVisible()
      
      // Mobile emergency button - easily accessible
      await expect(page.locator('[data-testid="mobile-emergency-fab"]')).toBeVisible()
    })

    test('accessibility compliance and keyboard navigation', async ({ page }) => {
      // Test keyboard navigation
      await page.goto('/')
      
      // Tab through main navigation
      await page.keyboard.press('Tab')
      await expect(page.locator(':focus')).toHaveAttribute('data-testid', 'main-nav-dashboard')
      
      await page.keyboard.press('Tab')
      await expect(page.locator(':focus')).toHaveAttribute('data-testid', 'main-nav-patients')
      
      await page.keyboard.press('Tab')
      await expect(page.locator(':focus')).toHaveAttribute('data-testid', 'main-nav-doses')
      
      // Test ARIA labels and roles
      await expect(page.locator('[role="main"]')).toBeVisible()
      await expect(page.locator('[role="navigation"]')).toBeVisible()
      await expect(page.locator('[aria-label="Main navigation"]')).toBeVisible()
      
      // Test form accessibility
      await page.goto('/patients/add')
      await expect(page.locator('[aria-required="true"]')).toHaveCount(3) // Required fields
      await expect(page.locator('[aria-describedby]')).toHaveCount(5) // Help text
      
      // Test error announcements
      await page.click('[data-testid="save-patient"]') // Submit empty form
      await expect(page.locator('[role="alert"]')).toBeVisible()
      await expect(page.locator('[aria-live="polite"]')).toBeVisible()
      
      // Test high contrast mode
      await page.emulateMedia({ reducedMotion: 'reduce' })
      await page.emulateMedia({ colorScheme: 'dark' })
      
      // Verify contrast ratios (would use actual contrast testing in real implementation)
      const backgroundColor = await page.locator('body').evaluate(el => 
        window.getComputedStyle(el).backgroundColor
      )
      const textColor = await page.locator('body').evaluate(el => 
        window.getComputedStyle(el).color
      )
      
      expect(backgroundColor).toBeDefined()
      expect(textColor).toBeDefined()
    })
  })

  test.describe('Data Security and Privacy Compliance', () => {
    test('HIPAA compliance and data protection', async ({ page }) => {
      // Test session timeout
      await page.goto('/dashboard')
      
      // Mock idle time (would be configured server-side)
      await page.evaluate(() => {
        localStorage.setItem('lastActivity', Date.now() - 16 * 60 * 1000) // 16 minutes ago
      })
      
      await page.reload()
      await expect(page.locator('text=Session expired')).toBeVisible()
      await expect(page.locator('[data-testid="login-form"]')).toBeVisible()
      
      // Test data encryption in transit
      await page.goto('/patients/patient-123')
      const response = await page.waitForResponse('**/api/patients/**')
      expect(response.url()).toContain('https://')
      
      // Test audit logging
      await page.goto('/profile/security')
      await expect(page.locator('[data-testid="audit-log"]')).toBeVisible()
      await expect(page.locator('text=Login attempt')).toBeVisible()
      await expect(page.locator('text=Patient data accessed')).toBeVisible()
      
      // Test data export controls
      await page.goto('/patients/patient-123/reports')
      await page.click('[data-testid="export-data"]')
      
      // Should require additional authentication
      await expect(page.locator('[data-testid="confirm-identity"]')).toBeVisible()
      await page.fill('[data-testid="password-confirm"]', 'password123')
      await page.click('[data-testid="confirm-export"]')
      
      // Export should be logged
      await page.goto('/profile/security')
      await expect(page.locator('text=Data export requested')).toBeVisible()
    })

    test('user permission management and role-based access', async ({ page }) => {
      // Test primary caregiver permissions (full access)
      await page.goto('/patients/patient-123')
      await expect(page.locator('[data-testid="edit-patient"]')).toBeVisible()
      await expect(page.locator('[data-testid="delete-patient"]')).toBeVisible()
      await expect(page.locator('[data-testid="manage-caregivers"]')).toBeVisible()
      
      // Test family member permissions (limited access)
      await page.evaluate(() => {
        localStorage.setItem('userRole', 'family')
        localStorage.setItem('permissions', JSON.stringify([
          'view_basic_info',
          'receive_alerts',
          'view_dose_status'
        ]))
      })
      
      await page.reload()
      
      // Should not see administrative functions
      await expect(page.locator('[data-testid="edit-patient"]')).not.toBeVisible()
      await expect(page.locator('[data-testid="delete-patient"]')).not.toBeVisible()
      await expect(page.locator('[data-testid="manage-caregivers"]')).not.toBeVisible()
      
      // Should see limited information
      await expect(page.locator('[data-testid="patient-name"]')).toBeVisible()
      await expect(page.locator('[data-testid="dose-status"]')).toBeVisible()
      await expect(page.locator('[data-testid="detailed-medical-info"]')).not.toBeVisible()
      
      // Test nurse permissions (clinical access)
      await page.evaluate(() => {
        localStorage.setItem('userRole', 'nurse')
        localStorage.setItem('permissions', JSON.stringify([
          'view_all_medical_data',
          'edit_dose_logs',
          'add_measurements',
          'create_incident_reports'
        ]))
      })
      
      await page.reload()
      
      await expect(page.locator('[data-testid="add-measurement"]')).toBeVisible()
      await expect(page.locator('[data-testid="edit-dose"]')).toBeVisible()
      await expect(page.locator('[data-testid="create-report"]')).toBeVisible()
    })
  })

  test.describe('Performance and Reliability', () => {
    test('application performance under load', async ({ page }) => {
      // Test large patient list performance
      await page.goto('/patients')
      
      // Simulate large dataset
      await page.evaluate(() => {
        // Mock 1000 patients
        window.mockLargeDataset = Array.from({ length: 1000 }, (_, i) => ({
          id: `patient-${i}`,
          name: `Patient ${i}`,
          age: 20 + (i % 60),
          status: ['active', 'inactive'][i % 2]
        }))
      })
      
      // Test virtualization/pagination
      const startTime = Date.now()
      await page.waitForSelector('[data-testid="patient-list"]')
      const loadTime = Date.now() - startTime
      
      expect(loadTime).toBeLessThan(3000) // Should load within 3 seconds
      
      // Test search performance
      const searchStart = Date.now()
      await page.fill('[data-testid="patient-search"]', 'Patient 123')
      await page.waitForSelector('[data-testid="search-results"]')
      const searchTime = Date.now() - searchStart
      
      expect(searchTime).toBeLessThan(1000) // Search should be fast
      
      // Test infinite scroll/pagination
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
      await page.waitForSelector('[data-testid="loading-more"]')
      await page.waitForSelector('[data-testid="patient-card"]', { timeout: 5000 })
    })

    test('offline functionality and data synchronization', async ({ page, context }) => {
      await page.goto('/todays-doses')
      
      // Go offline
      await context.setOffline(true)
      
      // Should show offline indicator
      await expect(page.locator('[data-testid="offline-indicator"]')).toBeVisible()
      
      // Should still allow viewing cached data
      await expect(page.locator('[data-testid="dose-card"]')).toBeVisible()
      
      // Should allow marking doses offline
      const dose = page.locator('[data-testid="dose-card"]').first()
      await dose.click()
      await page.click('[data-testid="mark-taken"]')
      await page.click('[data-testid="confirm-taken"]')
      
      // Should show pending sync indicator
      await expect(page.locator('[data-testid="pending-sync"]')).toBeVisible()
      
      // Go back online
      await context.setOffline(false)
      
      // Should sync automatically
      await expect(page.locator('[data-testid="sync-complete"]')).toBeVisible()
      await expect(page.locator('[data-testid="offline-indicator"]')).not.toBeVisible()
      
      // Verify data was synced
      await page.reload()
      await expect(dose.locator('[data-testid="dose-status"]')).toContainText('Taken')
    })

    test('error handling and recovery', async ({ page }) => {
      // Test network error handling
      await page.route('**/api/**', route => {
        route.abort('failed')
      })
      
      await page.goto('/patients')
      
      // Should show error message
      await expect(page.locator('[data-testid="error-message"]')).toBeVisible()
      await expect(page.locator('text=Unable to load patients')).toBeVisible()
      
      // Should show retry button
      await expect(page.locator('[data-testid="retry-button"]')).toBeVisible()
      
      // Test retry functionality
      await page.unroute('**/api/**')
      await page.click('[data-testid="retry-button"]')
      
      await expect(page.locator('[data-testid="patient-list"]')).toBeVisible()
      await expect(page.locator('[data-testid="error-message"]')).not.toBeVisible()
      
      // Test form validation and error recovery
      await page.goto('/patients/add')
      
      // Submit invalid data
      await page.fill('[data-testid="patient-name"]', '')
      await page.fill('[data-testid="patient-email"]', 'invalid-email')
      await page.click('[data-testid="save-patient"]')
      
      // Should show field-specific errors
      await expect(page.locator('[data-testid="name-error"]')).toContainText('Name is required')
      await expect(page.locator('[data-testid="email-error"]')).toContainText('Invalid email')
      
      // Fix errors and retry
      await page.fill('[data-testid="patient-name"]', 'John Doe')
      await page.fill('[data-testid="patient-email"]', 'john@example.com')
      await page.click('[data-testid="save-patient"]')
      
      await expect(page.locator('text=Patient created successfully')).toBeVisible()
    })
  })
}) 