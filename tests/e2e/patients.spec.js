import { test, expect } from '@playwright/test'

test.describe('Patient Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/login')
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'correctpassword')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/dashboard')
    
    // Navigate to patients page
    await page.click('text=Patients')
    await page.waitForURL('**/patients')
  })

  test('should display patients list', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Patients')
    await expect(page.locator('[data-testid="patients-list"]')).toBeVisible()
  })

  test('should add new patient', async ({ page }) => {
    await page.click('[data-testid="add-patient-button"]')
    
    await expect(page.locator('.ant-modal')).toBeVisible()
    await expect(page.locator('text=Add New Patient')).toBeVisible()
    
    // Fill patient form
    await page.fill('input[name="firstName"]', 'Jane')
    await page.fill('input[name="lastName"]', 'Smith')
    await page.fill('input[name="dateOfBirth"]', '1985-05-15')
    await page.fill('input[name="phone"]', '+1234567890')
    await page.fill('input[name="email"]', 'jane.smith@example.com')
    await page.fill('input[name="emergencyContact"]', '+0987654321')
    
    await page.click('button[type="submit"]')
    
    // Should close modal and show new patient
    await expect(page.locator('.ant-modal')).not.toBeVisible()
    await expect(page.locator('text=Jane Smith')).toBeVisible()
    await expect(page.locator('text=Patient added successfully')).toBeVisible()
  })

  test('should validate required fields when adding patient', async ({ page }) => {
    await page.click('[data-testid="add-patient-button"]')
    
    // Try to submit empty form
    await page.click('button[type="submit"]')
    
    await expect(page.locator('text=First name is required')).toBeVisible()
    await expect(page.locator('text=Last name is required')).toBeVisible()
    await expect(page.locator('text=Date of birth is required')).toBeVisible()
  })

  test('should validate phone number format', async ({ page }) => {
    await page.click('[data-testid="add-patient-button"]')
    
    await page.fill('input[name="phone"]', '123')
    await page.click('input[name="firstName"]') // blur phone input
    
    await expect(page.locator('text=Invalid phone number')).toBeVisible()
  })

  test('should edit existing patient', async ({ page }) => {
    // Click edit button on first patient
    await page.click('[data-testid="patient-card"]:first-child [data-testid="edit-patient"]')
    
    await expect(page.locator('text=Edit Patient')).toBeVisible()
    
    // Update phone number
    await page.fill('input[name="phone"]', '+1555666777')
    await page.click('button[type="submit"]')
    
    await expect(page.locator('text=Patient updated successfully')).toBeVisible()
    await expect(page.locator('text=+1555666777')).toBeVisible()
  })

  test('should delete patient with confirmation', async ({ page }) => {
    // Click delete button on first patient
    await page.click('[data-testid="patient-card"]:first-child [data-testid="delete-patient"]')
    
    // Should show confirmation dialog
    await expect(page.locator('text=Are you sure you want to delete this patient?')).toBeVisible()
    
    await page.click('button:has-text("Yes, Delete")')
    
    await expect(page.locator('text=Patient deleted successfully')).toBeVisible()
  })

  test('should cancel patient deletion', async ({ page }) => {
    const initialPatientCount = await page.locator('[data-testid="patient-card"]').count()
    
    await page.click('[data-testid="patient-card"]:first-child [data-testid="delete-patient"]')
    
    // Cancel deletion
    await page.click('button:has-text("Cancel")')
    
    // Patient should still be there
    const finalPatientCount = await page.locator('[data-testid="patient-card"]').count()
    expect(finalPatientCount).toBe(initialPatientCount)
  })

  test('should search patients', async ({ page }) => {
    await page.fill('[data-testid="patient-search"]', 'John')
    
    // Should filter patients
    await expect(page.locator('[data-testid="patient-card"]')).toContainText('John')
    
    // Clear search
    await page.fill('[data-testid="patient-search"]', '')
    
    // Should show all patients again
    const patientCount = await page.locator('[data-testid="patient-card"]').count()
    expect(patientCount).toBeGreaterThan(0)
  })

  test('should view patient details', async ({ page }) => {
    await page.click('[data-testid="patient-card"]:first-child [data-testid="view-patient"]')
    
    await expect(page).toHaveURL(/.*patients\/.*/)
    await expect(page.locator('h1')).toContainText('Patient Details')
  })

  test('should handle empty patients state', async ({ page }) => {
    // Mock empty patients response
    await page.route('**/api/patients*', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [] })
      })
    })
    
    await page.reload()
    
    await expect(page.locator('text=No patients found')).toBeVisible()
    await expect(page.locator('text=Add your first patient to get started')).toBeVisible()
  })

  test('should sort patients by name', async ({ page }) => {
    await page.click('[data-testid="sort-dropdown"]')
    await page.click('text=Name (A-Z)')
    
    const patientNames = await page.locator('[data-testid="patient-name"]').allTextContents()
    const sortedNames = [...patientNames].sort()
    expect(patientNames).toEqual(sortedNames)
  })

  test('should filter patients by status', async ({ page }) => {
    await page.click('[data-testid="filter-dropdown"]')
    await page.click('text=Active Only')
    
    // Should only show active patients
    const activePatients = page.locator('[data-testid="patient-card"][data-status="active"]')
    expect(await activePatients.count()).toBeGreaterThan(0)
    
    const inactivePatients = page.locator('[data-testid="patient-card"][data-status="inactive"]')
    expect(await inactivePatients.count()).toBe(0)
  })

  test('should export patients list', async ({ page }) => {
    const downloadPromise = page.waitForEvent('download')
    
    await page.click('[data-testid="export-patients"]')
    
    const download = await downloadPromise
    expect(download.suggestedFilename()).toMatch(/patients.*\.csv/)
  })

  test('should handle bulk actions', async ({ page }) => {
    // Select multiple patients
    await page.check('[data-testid="patient-card"]:first-child input[type="checkbox"]')
    await page.check('[data-testid="patient-card"]:nth-child(2) input[type="checkbox"]')
    
    // Bulk actions should be available
    await expect(page.locator('[data-testid="bulk-actions"]')).toBeVisible()
    
    await page.click('[data-testid="bulk-delete"]')
    
    await expect(page.locator('text=Delete 2 patients?')).toBeVisible()
  })

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Should show mobile-optimized layout
    await expect(page.locator('[data-testid="mobile-patient-list"]')).toBeVisible()
    
    // Add button should be a floating action button
    await expect(page.locator('[data-testid="fab-add-patient"]')).toBeVisible()
  })
})

test.describe('Patient Details', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'correctpassword')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/dashboard')
    
    await page.click('text=Patients')
    await page.waitForURL('**/patients')
    
    // Navigate to first patient details
    await page.click('[data-testid="patient-card"]:first-child [data-testid="view-patient"]')
    await page.waitForURL('**/patients/*')
  })

  test('should display patient information', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Patient Details')
    await expect(page.locator('[data-testid="patient-info"]')).toBeVisible()
    await expect(page.locator('[data-testid="patient-medications"]')).toBeVisible()
    await expect(page.locator('[data-testid="patient-appointments"]')).toBeVisible()
  })

  test('should add medication to patient', async ({ page }) => {
    await page.click('[data-testid="add-medication"]')
    
    await expect(page.locator('text=Add Medication')).toBeVisible()
    
    await page.fill('input[name="name"]', 'Aspirin')
    await page.fill('input[name="dosage"]', '100mg')
    await page.select('select[name="frequency"]', 'Daily')
    await page.fill('textarea[name="instructions"]', 'Take with food')
    
    await page.click('button[type="submit"]')
    
    await expect(page.locator('text=Medication added successfully')).toBeVisible()
    await expect(page.locator('text=Aspirin')).toBeVisible()
  })

  test('should schedule appointment', async ({ page }) => {
    await page.click('[data-testid="schedule-appointment"]')
    
    await expect(page.locator('text=Schedule Appointment')).toBeVisible()
    
    await page.fill('input[name="title"]', 'Annual Checkup')
    await page.fill('input[name="date"]', '2024-02-15')
    await page.fill('input[name="time"]', '10:00')
    await page.fill('input[name="doctor"]', 'Dr. Johnson')
    
    await page.click('button[type="submit"]')
    
    await expect(page.locator('text=Appointment scheduled successfully')).toBeVisible()
    await expect(page.locator('text=Annual Checkup')).toBeVisible()
  })

  test('should view medication history', async ({ page }) => {
    await page.click('[data-testid="medication-history"]')
    
    await expect(page.locator('text=Medication History')).toBeVisible()
    await expect(page.locator('[data-testid="dose-log"]')).toBeVisible()
  })

  test('should generate patient report', async ({ page }) => {
    const downloadPromise = page.waitForEvent('download')
    
    await page.click('[data-testid="generate-report"]')
    
    const download = await downloadPromise
    expect(download.suggestedFilename()).toMatch(/patient-report.*\.pdf/)
  })
}) 