import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should redirect to login when not authenticated', async ({ page }) => {
    await expect(page).toHaveURL(/.*login/)
  })

  test('should show login form', async ({ page }) => {
    await page.goto('/login')
    
    await expect(page.locator('h1')).toContainText('Login')
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('should show validation errors for empty form', async ({ page }) => {
    await page.goto('/login')
    
    await page.click('button[type="submit"]')
    
    await expect(page.locator('text=Email is required')).toBeVisible()
    await expect(page.locator('text=Password is required')).toBeVisible()
  })

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login')
    
    await page.fill('input[type="email"]', 'invalid@example.com')
    await page.fill('input[type="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')
    
    await expect(page.locator('text=Invalid credentials')).toBeVisible()
  })

  test('should login successfully with valid credentials', async ({ page }) => {
    await page.goto('/login')
    
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'correctpassword')
    await page.click('button[type="submit"]')
    
    await expect(page).toHaveURL(/.*dashboard/)
    await expect(page.locator('h1')).toContainText('Dashboard')
  })

  test('should navigate to register page', async ({ page }) => {
    await page.goto('/login')
    
    await page.click('text=Don\'t have an account?')
    
    await expect(page).toHaveURL(/.*register/)
    await expect(page.locator('h1')).toContainText('Register')
  })

  test('should register new user successfully', async ({ page }) => {
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

  test('should show password mismatch error', async ({ page }) => {
    await page.goto('/register')
    
    await page.fill('input[name="password"]', 'password123')
    await page.fill('input[name="confirmPassword"]', 'differentpassword')
    
    await page.click('button[type="submit"]')
    
    await expect(page.locator('text=Passwords do not match')).toBeVisible()
  })

  test('should logout successfully', async ({ page }) => {
    // First login
    await page.goto('/login')
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'correctpassword')
    await page.click('button[type="submit"]')
    
    // Then logout
    await page.click('[data-testid="user-menu"]')
    await page.click('text=Logout')
    
    await expect(page).toHaveURL(/.*login/)
  })

  test('should handle password reset flow', async ({ page }) => {
    await page.goto('/login')
    
    await page.click('text=Forgot password?')
    await expect(page).toHaveURL(/.*reset-password/)
    
    await page.fill('input[type="email"]', 'test@example.com')
    await page.click('button[type="submit"]')
    
    await expect(page.locator('text=Reset instructions sent')).toBeVisible()
  })

  test('should remember user session', async ({ page, context }) => {
    // Login
    await page.goto('/login')
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'correctpassword')
    await page.click('button[type="submit"]')
    
    // Create new page with same context
    const newPage = await context.newPage()
    await newPage.goto('/')
    
    // Should not redirect to login
    await expect(newPage).toHaveURL(/.*dashboard/)
  })
})

test.describe('Phone Number Validation', () => {
  test('should validate phone numbers during registration', async ({ page }) => {
    await page.goto('/register')
    
    await page.fill('input[name="phone"]', '123')
    await page.click('input[name="email"]') // blur the phone input
    
    await expect(page.locator('text=Invalid phone number')).toBeVisible()
  })

  test('should accept valid phone numbers', async ({ page }) => {
    await page.goto('/register')
    
    await page.fill('input[name="phone"]', '+1234567890')
    await page.click('input[name="email"]') // blur the phone input
    
    await expect(page.locator('text=Invalid phone number')).not.toBeVisible()
  })

  test('should format phone number correctly', async ({ page }) => {
    await page.goto('/register')
    
    await page.fill('input[name="phone"]', '1234567890')
    await page.click('input[name="email"]') // blur the phone input
    
    const phoneValue = await page.inputValue('input[name="phone"]')
    expect(phoneValue).toMatch(/^\+1 \(\d{3}\) \d{3}-\d{4}$/)
  })
}) 