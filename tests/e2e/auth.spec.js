import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should show login form when not authenticated', async ({ page }) => {
    // The app shows LoginPage component for unauthenticated users, not a redirect
    await expect(page.locator('h3')).toContainText('Sign In')
    await expect(page.locator('input[placeholder="Enter your email"]')).toBeVisible()
    await expect(page.locator('input[placeholder="Enter your password"]')).toBeVisible()
  })

  test('should show login form', async ({ page }) => {
    await page.goto('/login')
    
    await expect(page.locator('h3')).toContainText('Sign In')
    await expect(page.locator('input[placeholder="Enter your email"]')).toBeVisible()
    await expect(page.locator('input[placeholder="Enter your password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('should show validation errors for empty form', async ({ page }) => {
    await page.goto('/login')
    
    await page.click('button[type="submit"]')
    
    // Wait for Ant Design form validation messages
    await expect(page.locator('text=Please enter your email address')).toBeVisible()
    await expect(page.locator('text=Please enter your password')).toBeVisible()
  })

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login')
    
    await page.fill('input[placeholder="Enter your email"]', 'invalid@example.com')
    await page.fill('input[placeholder="Enter your password"]', 'wrongpassword')
    await page.click('button[type="submit"]')
    
    // Wait for the error alert to appear
    await expect(page.locator('.ant-alert-error')).toBeVisible({ timeout: 10000 })
  })

  test('should handle forgot password modal', async ({ page }) => {
    await page.goto('/login')
    
    await page.click('text=Forgot your password?')
    
    // Check if modal is visible
    await expect(page.locator('.ant-modal')).toBeVisible()
    await expect(page.locator('text=Reset Password')).toBeVisible()
  })

  test('should navigate to register page', async ({ page }) => {
    await page.goto('/login')
    
    await page.click('text=Create one now')
    
    await expect(page).toHaveURL(/.*register/)
  })

  // Skip login tests that require actual authentication for now
  test.skip('should login successfully with valid credentials', async ({ page }) => {
    await page.goto('/login')
    
    await page.fill('input[placeholder="Enter your email"]', 'test@example.com')
    await page.fill('input[placeholder="Enter your password"]', 'correctpassword')
    await page.click('button[type="submit"]')
    
    await expect(page).toHaveURL(/.*dashboard/)
  })

  test.skip('should register new user successfully', async ({ page }) => {
    await page.goto('/register')
    
    await page.fill('input[name="firstName"]', 'John')
    await page.fill('input[name="lastName"]', 'Doe')
    await page.fill('input[name="email"]', 'newuser@example.com')
    await page.fill('input[name="password"]', 'strongpassword123')
    await page.fill('input[name="confirmPassword"]', 'strongpassword123')
    
    await page.click('button[type="submit"]')
    
    await expect(page).toHaveURL(/.*email-verification/)
    await expect(page.locator('text=Check your email')).toBeVisible()
  })

  test.skip('should show password mismatch error', async ({ page }) => {
    await page.goto('/register')
    
    await page.fill('input[name="password"]', 'password123')
    await page.fill('input[name="confirmPassword"]', 'differentpassword')
    
    await page.click('button[type="submit"]')
    
    await expect(page.locator('text=Passwords do not match')).toBeVisible()
  })

  test.skip('should logout successfully', async ({ page }) => {
    // First login
    await page.goto('/login')
    await page.fill('input[placeholder="Enter your email"]', 'test@example.com')
    await page.fill('input[placeholder="Enter your password"]', 'correctpassword')
    await page.click('button[type="submit"]')
    
    // Then logout
    await page.click('[data-testid="user-menu"]')
    await page.click('text=Logout')
    
    await expect(page).toHaveURL(/.*login/)
  })

  test.skip('should handle password reset flow', async ({ page }) => {
    await page.goto('/login')
    
    await page.click('text=Forgot password?')
    await expect(page).toHaveURL(/.*reset-password/)
    
    await page.fill('input[type="email"]', 'test@example.com')
    await page.click('button[type="submit"]')
    
    await expect(page.locator('text=Reset instructions sent')).toBeVisible()
  })

  test.skip('should remember user session', async ({ page, context }) => {
    // Login
    await page.goto('/login')
    await page.fill('input[placeholder="Enter your email"]', 'test@example.com')
    await page.fill('input[placeholder="Enter your password"]', 'correctpassword')
    await page.click('button[type="submit"]')
    
    // Create new page with same context
    const newPage = await context.newPage()
    await newPage.goto('/')
    
    // Should not redirect to login
    await expect(newPage).toHaveURL(/.*dashboard/)
  })
})

test.describe('UI Elements and Navigation', () => {
  test('should display brand elements correctly', async ({ page }) => {
    await page.goto('/login')
    
    await expect(page.locator('text=MedTrack')).toBeVisible()
    await expect(page.locator('text=Welcome Back')).toBeVisible()
    await expect(page.locator('text=Medication Tracking')).toBeVisible()
  })

  test('should show loading state during form submission', async ({ page }) => {
    await page.goto('/login')
    
    await page.fill('input[placeholder="Enter your email"]', 'test@example.com')
    await page.fill('input[placeholder="Enter your password"]', 'testpassword')
    
    // Start the submission and immediately check for loading state
    await page.click('button[type="submit"]')
    
    // Should show loading text briefly
    await expect(page.locator('text=Signing In...')).toBeVisible({ timeout: 1000 })
  })
})

// Simplified phone validation tests that don't require backend
test.describe('Phone Number Validation - UI Only', () => {
  test.skip('should validate phone numbers during registration', async ({ page }) => {
    await page.goto('/register')
    
    await page.fill('input[name="phone"]', '123')
    await page.click('input[name="email"]') // blur the phone input
    
    await expect(page.locator('text=Invalid phone number')).toBeVisible()
  })

  test.skip('should accept valid phone numbers', async ({ page }) => {
    await page.goto('/register')
    
    await page.fill('input[name="phone"]', '+1234567890')
    await page.click('input[name="email"]') // blur the phone input
    
    await expect(page.locator('text=Invalid phone number')).not.toBeVisible()
  })

  test.skip('should format phone number correctly', async ({ page }) => {
    await page.goto('/register')
    
    await page.fill('input[name="phone"]', '1234567890')
    await page.click('input[name="email"]') // blur the phone input
    
    const phoneValue = await page.inputValue('input[name="phone"]')
    expect(phoneValue).toMatch(/^\+1 \(\d{3}\) \d{3}-\d{4}$/)
  })
}) 