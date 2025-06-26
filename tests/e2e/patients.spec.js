import { test, expect } from '@playwright/test'

test.describe('Patients - Basic UI', () => {
  // Skip all tests that require authentication for now
  test.skip('should display patients list', async ({ page }) => {
    await page.goto('/patients')
    
    await expect(page.locator('h1')).toContainText('Patients')
    await expect(page.locator('[data-testid="patients-list"]')).toBeVisible()
  })

  test.skip('should show add patient button', async ({ page }) => {
    await page.goto('/patients')
    
    await expect(page.locator('[data-testid="add-patient-btn"]')).toBeVisible()
  })

  test.skip('should open add patient modal', async ({ page }) => {
    await page.goto('/patients')
    
    await page.click('[data-testid="add-patient-btn"]')
    
    await expect(page.locator('.ant-modal')).toBeVisible()
    await expect(page.locator('text=Add New Patient')).toBeVisible()
  })

  test.skip('should add new patient', async ({ page }) => {
    await page.goto('/patients')
    
    await page.click('[data-testid="add-patient-btn"]')
    
    // Fill patient form
    await page.fill('input[name="firstName"]', 'John')
    await page.fill('input[name="lastName"]', 'Doe')
    await page.fill('input[name="dateOfBirth"]', '1990-01-01')
    await page.fill('input[name="phone"]', '+1234567890')
    
    await page.click('button[type="submit"]')
    
    // Should close modal and show success message
    await expect(page.locator('text=Patient added successfully')).toBeVisible()
    await expect(page.locator('.ant-modal')).not.toBeVisible()
  })

  test.skip('should search patients', async ({ page }) => {
    await page.goto('/patients')
    
    await page.fill('[data-testid="patient-search"]', 'John')
    
    // Should filter patients list
    await expect(page.locator('[data-testid="patient-card"]')).toHaveCount(1)
  })

  test.skip('should view patient details', async ({ page }) => {
    await page.goto('/patients')
    
    await page.click('[data-testid="patient-card"]:first-child')
    
    await expect(page).toHaveURL(/.*patients\/.*/)
    await expect(page.locator('[data-testid="patient-details"]')).toBeVisible()
  })

  test.skip('should edit patient information', async ({ page }) => {
    await page.goto('/patients')
    
    await page.click('[data-testid="patient-card"]:first-child')
    await page.click('[data-testid="edit-patient-btn"]')
    
    await expect(page.locator('.ant-modal')).toBeVisible()
    
    await page.fill('input[name="firstName"]', 'Jane')
    await page.click('button[type="submit"]')
    
    await expect(page.locator('text=Patient updated successfully')).toBeVisible()
  })

  test.skip('should delete patient', async ({ page }) => {
    await page.goto('/patients')
    
    await page.click('[data-testid="patient-card"]:first-child [data-testid="delete-patient-btn"]')
    
    // Should show confirmation dialog
    await expect(page.locator('.ant-modal')).toBeVisible()
    await expect(page.locator('text=Are you sure')).toBeVisible()
    
    await page.click('button:has-text("Yes")')
    
    await expect(page.locator('text=Patient deleted successfully')).toBeVisible()
  })
})

test.describe('Patients - Responsive Design', () => {
  test.skip('should work on mobile devices', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/patients')
    
    // Should show mobile-optimized layout
    await expect(page.locator('[data-testid="mobile-patient-list"]')).toBeVisible()
  })

  test.skip('should work on tablet devices', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/patients')
    
    // Should show tablet-optimized layout
    await expect(page.locator('[data-testid="tablet-patient-grid"]')).toBeVisible()
  })
})

test.describe('Patient Form Validation', () => {
  test.skip('should validate required fields', async ({ page }) => {
    await page.goto('/patients')
    
    await page.click('[data-testid="add-patient-btn"]')
    await page.click('button[type="submit"]')
    
    // Should show validation errors
    await expect(page.locator('text=First name is required')).toBeVisible()
    await expect(page.locator('text=Last name is required')).toBeVisible()
  })

  test.skip('should validate phone number format', async ({ page }) => {
    await page.goto('/patients')
    
    await page.click('[data-testid="add-patient-btn"]')
    await page.fill('input[name="phone"]', '123')
    await page.click('input[name="firstName"]') // trigger validation
    
    await expect(page.locator('text=Invalid phone number')).toBeVisible()
  })

  test.skip('should validate date of birth', async ({ page }) => {
    await page.goto('/patients')
    
    await page.click('[data-testid="add-patient-btn"]')
    await page.fill('input[name="dateOfBirth"]', '2025-01-01') // future date
    await page.click('input[name="firstName"]') // trigger validation
    
    await expect(page.locator('text=Date of birth cannot be in the future')).toBeVisible()
  })
}) 