import { test, expect } from '@playwright/test'

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Assume we have a test user already logged in
    await page.goto('/login')
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'correctpassword')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/dashboard')
  })

  test('should display dashboard overview', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Dashboard')
    
    // Check stats cards are visible
    await expect(page.locator('[data-testid="stats-cards"]')).toBeVisible()
    await expect(page.locator('text=Total Medications')).toBeVisible()
    await expect(page.locator('text=Daily Doses')).toBeVisible()
    await expect(page.locator('text=Adherence Rate')).toBeVisible()
  })

  test('should display patient selector', async ({ page }) => {
    await expect(page.locator('[data-testid="patient-selector"]')).toBeVisible()
    
    // Should show current patient or prompt to select
    const patientSelector = page.locator('[data-testid="patient-selector"]')
    await expect(patientSelector).toBeVisible()
  })

  test('should switch between patients', async ({ page }) => {
    // Click patient selector
    await page.click('[data-testid="patient-selector"] .ant-select')
    
    // Wait for dropdown to appear
    await page.waitForSelector('.ant-select-dropdown')
    
    // Select a different patient
    await page.click('.ant-select-item:nth-child(2)')
    
    // Verify dashboard updates
    await expect(page.locator('[data-testid="stats-cards"]')).toBeVisible()
  })

  test('should display recent activity', async ({ page }) => {
    await expect(page.locator('[data-testid="recent-activity"]')).toBeVisible()
    await expect(page.locator('text=Recent Activity')).toBeVisible()
  })

  test('should display medication overview', async ({ page }) => {
    await expect(page.locator('[data-testid="medication-overview"]')).toBeVisible()
    await expect(page.locator('text=Medication Overview')).toBeVisible()
  })

  test('should navigate to patients page', async ({ page }) => {
    await page.click('text=Patients')
    await expect(page).toHaveURL(/.*patients/)
  })

  test('should navigate to calendar', async ({ page }) => {
    await page.click('text=Calendar')
    await expect(page).toHaveURL(/.*calendar/)
  })

  test('should navigate to todays doses', async ({ page }) => {
    await page.click('text=Today\'s Doses')
    await expect(page).toHaveURL(/.*doses/)
  })

  test('should show loading state initially', async ({ page }) => {
    // Navigate to dashboard and check for loading states
    await page.goto('/dashboard')
    
    // Should show skeleton loaders
    await expect(page.locator('.ant-skeleton')).toBeVisible()
  })

  test('should handle no patients state', async ({ page }) => {
    // Mock empty patient state
    await page.route('**/api/patients*', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [] })
      })
    })
    
    await page.reload()
    
    await expect(page.locator('text=No patients found')).toBeVisible()
    await expect(page.locator('text=Add your first patient')).toBeVisible()
  })

  test('should display critical alerts', async ({ page }) => {
    // Mock critical alerts data
    await page.route('**/api/alerts*', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [
            { id: 1, type: 'missed_dose', message: 'Missed morning dose', severity: 'high' }
          ]
        })
      })
    })
    
    await page.reload()
    
    await expect(page.locator('[data-testid="critical-alerts"]')).toBeVisible()
    await expect(page.locator('text=Missed morning dose')).toBeVisible()
  })

  test('should refresh data', async ({ page }) => {
    // Click refresh button
    await page.click('[data-testid="refresh-button"]')
    
    // Should show loading state briefly
    await expect(page.locator('.ant-spin')).toBeVisible()
    
    // Wait for data to reload
    await page.waitForLoadState('networkidle')
  })

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Dashboard should still be functional
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('[data-testid="stats-cards"]')).toBeVisible()
    
    // Navigation should be collapsed/hamburger menu
    await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible()
  })

  test('should handle offline state', async ({ page, context }) => {
    // Simulate offline
    await context.setOffline(true)
    
    await page.reload()
    
    // Should show offline message
    await expect(page.locator('text=You are offline')).toBeVisible()
    
    // Go back online
    await context.setOffline(false)
    
    await page.reload()
    await expect(page.locator('text=You are offline')).not.toBeVisible()
  })
})

test.describe('Dashboard Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'correctpassword')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/dashboard')
  })

  test('should quick add medication from dashboard', async ({ page }) => {
    await page.click('[data-testid="quick-add-medication"]')
    
    await expect(page.locator('.ant-modal')).toBeVisible()
    await expect(page.locator('text=Add Medication')).toBeVisible()
    
    // Fill medication form
    await page.fill('input[name="name"]', 'Aspirin')
    await page.fill('input[name="dosage"]', '100mg')
    await page.click('button[type="submit"]')
    
    // Should close modal and refresh dashboard
    await expect(page.locator('.ant-modal')).not.toBeVisible()
  })

  test('should mark dose as taken from dashboard', async ({ page }) => {
    // Find a pending dose and mark as taken
    await page.click('[data-testid="pending-dose"]:first-child [data-testid="mark-taken"]')
    
    // Should show confirmation
    await expect(page.locator('text=Dose marked as taken')).toBeVisible()
    
    // Dose should be updated in UI
    await expect(page.locator('[data-testid="pending-dose"]:first-child')).toHaveClass(/taken/)
  })

  test('should view patient details from selector', async ({ page }) => {
    await page.click('[data-testid="patient-selector"] .ant-select')
    await page.click('[data-testid="view-patient-details"]')
    
    await expect(page).toHaveURL(/.*patients\/.*/)
  })
}) 