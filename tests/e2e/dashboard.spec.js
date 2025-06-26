import { test, expect } from '@playwright/test'

test.describe('Dashboard - UI Elements', () => {
  // Skip all dashboard tests that require authentication for now
  test.skip('should display dashboard correctly after login', async ({ page }) => {
    // This test requires authentication setup
    await page.goto('/dashboard')
    
    await expect(page.locator('h1')).toContainText('Dashboard')
    await expect(page.locator('[data-testid="stats-cards"]')).toBeVisible()
    await expect(page.locator('[data-testid="recent-activity"]')).toBeVisible()
  })

  test.skip('should show patient switcher', async ({ page }) => {
    await page.goto('/dashboard')
    
    await expect(page.locator('[data-testid="patient-switcher"]')).toBeVisible()
  })

  test.skip('should navigate to different sections', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Test navigation
    await page.click('text=Patients')
    await expect(page).toHaveURL(/.*patients/)
    
    await page.click('text=Calendar')
    await expect(page).toHaveURL(/.*calendar/)
    
    await page.click('text=Dashboard')
    await expect(page).toHaveURL(/.*dashboard/)
  })

  test.skip('should handle patient selection', async ({ page }) => {
    await page.goto('/dashboard')
    
    await page.click('[data-testid="patient-switcher"]')
    await page.click('[data-testid="patient-option-1"]')
    
    // Should update dashboard content
    await expect(page.locator('[data-testid="patient-name"]')).toBeVisible()
  })

  test.skip('should display medication alerts', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Should show any urgent medication alerts
    const alertElements = page.locator('[data-testid="medication-alert"]')
    const count = await alertElements.count()
    
    if (count > 0) {
      await expect(alertElements.first()).toBeVisible()
    }
  })

  test.skip('should show upcoming doses', async ({ page }) => {
    await page.goto('/dashboard')
    
    await expect(page.locator('[data-testid="upcoming-doses"]')).toBeVisible()
  })
})

test.describe('Dashboard - Responsive Design', () => {
  test.skip('should adapt to mobile view', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/dashboard')
    
    // Should show mobile navigation
    await expect(page.locator('[data-testid="mobile-menu-trigger"]')).toBeVisible()
  })

  test.skip('should work on tablet view', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/dashboard')
    
    // Should adapt layout for tablet
    await expect(page.locator('[data-testid="sidebar"]')).toBeVisible()
  })
}) 