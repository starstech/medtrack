import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { 
  detectUserCountry, 
  getUserCountrySync, 
  clearCountryCache, 
  isCountrySupported,
  getCountryByTimezone,
  getCountryByLocale,
  validateCountryCode,
  formatCountryName
} from '@/utils/countryDetection'

// Mock global fetch
global.fetch = vi.fn()

// Mock Intl object
Object.defineProperty(Intl, 'DateTimeFormat', {
  value: vi.fn(() => ({
    resolvedOptions: vi.fn(() => ({ timeZone: 'America/New_York' }))
  })),
  configurable: true
})

// Mock navigator
Object.defineProperty(navigator, 'language', {
  value: 'en-US',
  configurable: true
})

Object.defineProperty(navigator, 'languages', {
  value: ['en-US', 'en'],
  configurable: true
})

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}
global.localStorage = localStorageMock

describe('countryDetection utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
    global.fetch.mockClear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('detectUserCountry', () => {
    it('detects country from IP successfully using first service', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ country_code: 'US' })
      })

      const country = await detectUserCountry()

      expect(country).toBe('us')
      expect(global.fetch).toHaveBeenCalledWith(
        'https://ipapi.co/json/',
        { signal: expect.any(AbortSignal) }
      )
      expect(localStorageMock.setItem).toHaveBeenCalledWith('userCountry', 'us')
      expect(localStorageMock.setItem).toHaveBeenCalledWith('countryCacheTime', expect.any(String))
    })

    it('falls back to second service when first fails', async () => {
      global.fetch
        .mockRejectedValueOnce(new Error('Service 1 failed'))
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ countryCode: 'CA' })
        })

      const country = await detectUserCountry()

      expect(country).toBe('ca')
      expect(global.fetch).toHaveBeenCalledTimes(2)
      expect(global.fetch).toHaveBeenNthCalledWith(2, 
        'https://api.country.is/',
        { signal: expect.any(AbortSignal) }
      )
    })

    it('falls back to third service when second fails', async () => {
      global.fetch
        .mockRejectedValueOnce(new Error('Service 1 failed'))
        .mockRejectedValueOnce(new Error('Service 2 failed'))
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ country: 'GB' })
        })

      const country = await detectUserCountry()

      expect(country).toBe('gb')
      expect(global.fetch).toHaveBeenCalledTimes(3)
    })

    it('returns default country when all services fail', async () => {
      global.fetch.mockRejectedValue(new Error('All services failed'))

      const country = await detectUserCountry()

      expect(country).toBe('us') // Default fallback
      expect(global.fetch).toHaveBeenCalledTimes(3)
    })

    it('handles timeout correctly', async () => {
      // Mock a slow response
      global.fetch.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({
          ok: true,
          json: () => Promise.resolve({ country_code: 'US' })
        }), 6000))
      )

      const country = await detectUserCountry()

      expect(country).toBe('us') // Should fallback to sync detection
    })

    it('uses cached result when available and valid', async () => {
      const now = Date.now()
      localStorageMock.getItem
        .mockReturnValueOnce('fr')
        .mockReturnValueOnce(now.toString())

      const country = await detectUserCountry()

      expect(country).toBe('fr')
      expect(global.fetch).not.toHaveBeenCalled()
    })

    it('ignores expired cache', async () => {
      const expiredTime = Date.now() - (25 * 60 * 60 * 1000) // 25 hours ago
      localStorageMock.getItem
        .mockReturnValueOnce('old_country')
        .mockReturnValueOnce(expiredTime.toString())

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ country_code: 'DE' })
      })

      const country = await detectUserCountry()

      expect(country).toBe('de')
      expect(global.fetch).toHaveBeenCalled()
    })

    it('handles invalid JSON responses', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.reject(new Error('Invalid JSON'))
      })

      const country = await detectUserCountry()

      expect(country).toBe('us') // Should fallback
    })

    it('handles network errors gracefully', async () => {
      global.fetch.mockRejectedValue(new TypeError('Network error'))

      const country = await detectUserCountry()

      expect(country).toBe('us') // Should fallback
    })

    it('normalizes country codes to lowercase', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ country_code: 'FR' })
      })

      const country = await detectUserCountry()

      expect(country).toBe('fr')
    })

    it('handles missing country code in response', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({})
      })

      const country = await detectUserCountry()

      expect(country).toBe('us') // Should fallback
    })
  })

  describe('getUserCountrySync', () => {
    it('detects country from timezone', () => {
      Intl.DateTimeFormat.mockReturnValue({
        resolvedOptions: () => ({ timeZone: 'Asia/Dubai' })
      })

      const country = getUserCountrySync()

      expect(country).toBe('ae')
    })

    it('detects country from browser locale', () => {
      Intl.DateTimeFormat.mockReturnValue({
        resolvedOptions: () => ({ timeZone: 'UTC' }) // No specific timezone
      })
      
      Object.defineProperty(navigator, 'language', {
        value: 'en-CA',
        configurable: true
      })

      const country = getUserCountrySync()

      expect(country).toBe('ca')
    })

    it('uses navigator.languages array as fallback', () => {
      Intl.DateTimeFormat.mockReturnValue({
        resolvedOptions: () => ({ timeZone: 'UTC' })
      })
      
      Object.defineProperty(navigator, 'language', {
        value: 'unknown',
        configurable: true
      })

      Object.defineProperty(navigator, 'languages', {
        value: ['unknown', 'fr-FR'],
        configurable: true
      })

      const country = getUserCountrySync()

      expect(country).toBe('fr')
    })

    it('returns default when no detection method works', () => {
      Intl.DateTimeFormat.mockReturnValue({
        resolvedOptions: () => ({ timeZone: 'UTC' })
      })
      
      Object.defineProperty(navigator, 'language', {
        value: 'unknown',
        configurable: true
      })

      Object.defineProperty(navigator, 'languages', {
        value: ['unknown'],
        configurable: true
      })

      const country = getUserCountrySync()

      expect(country).toBe('us')
    })

    it('handles missing Intl support', () => {
      const originalIntl = global.Intl
      delete global.Intl

      const country = getUserCountrySync()

      expect(country).toBe('us')

      global.Intl = originalIntl
    })

    it('handles missing navigator', () => {
      const originalNavigator = global.navigator
      delete global.navigator

      const country = getUserCountrySync()

      expect(country).toBe('us')

      global.navigator = originalNavigator
    })
  })

  describe('clearCountryCache', () => {
    it('removes cached country data', () => {
      clearCountryCache()

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('userCountry')
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('countryCacheTime')
    })

    it('handles localStorage errors gracefully', () => {
      localStorageMock.removeItem.mockImplementation(() => {
        throw new Error('localStorage error')
      })

      expect(() => clearCountryCache()).not.toThrow()
    })
  })

  describe('isCountrySupported', () => {
    it('returns true for supported countries', () => {
      const supportedCountries = ['us', 'ca', 'gb', 'au', 'fr', 'de', 'ae', 'sa']
      
      supportedCountries.forEach(country => {
        expect(isCountrySupported(country)).toBe(true)
      })
    })

    it('returns false for unsupported countries', () => {
      const unsupportedCountries = ['xx', 'zz', 'invalid', '']
      
      unsupportedCountries.forEach(country => {
        expect(isCountrySupported(country)).toBe(false)
      })
    })

    it('handles uppercase country codes', () => {
      expect(isCountrySupported('US')).toBe(true)
      expect(isCountrySupported('GB')).toBe(true)
    })

    it('handles null and undefined inputs', () => {
      expect(isCountrySupported(null)).toBe(false)
      expect(isCountrySupported(undefined)).toBe(false)
    })
  })

  describe('getCountryByTimezone', () => {
    it('maps common timezones to countries correctly', () => {
      const timezoneMap = {
        'America/New_York': 'us',
        'America/Toronto': 'ca',
        'Europe/London': 'gb',
        'Europe/Paris': 'fr',
        'Asia/Dubai': 'ae',
        'Asia/Riyadh': 'sa',
        'Australia/Sydney': 'au'
      }

      Object.entries(timezoneMap).forEach(([timezone, expectedCountry]) => {
        expect(getCountryByTimezone(timezone)).toBe(expectedCountry)
      })
    })

    it('returns null for unknown timezones', () => {
      expect(getCountryByTimezone('Unknown/Timezone')).toBe(null)
      expect(getCountryByTimezone('UTC')).toBe(null)
    })

    it('handles invalid inputs', () => {
      expect(getCountryByTimezone('')).toBe(null)
      expect(getCountryByTimezone(null)).toBe(null)
      expect(getCountryByTimezone(undefined)).toBe(null)
    })
  })

  describe('getCountryByLocale', () => {
    it('extracts country from locale strings correctly', () => {
      const localeMap = {
        'en-US': 'us',
        'en-CA': 'ca',
        'en-GB': 'gb',
        'fr-FR': 'fr',
        'de-DE': 'de',
        'ar-AE': 'ae',
        'ar-SA': 'sa'
      }

      Object.entries(localeMap).forEach(([locale, expectedCountry]) => {
        expect(getCountryByLocale(locale)).toBe(expectedCountry)
      })
    })

    it('handles locale without country code', () => {
      expect(getCountryByLocale('en')).toBe(null)
      expect(getCountryByLocale('fr')).toBe(null)
    })

    it('handles invalid locale formats', () => {
      expect(getCountryByLocale('invalid')).toBe(null)
      expect(getCountryByLocale('en_US')).toBe('us') // Should handle underscore
      expect(getCountryByLocale('')).toBe(null)
    })
  })

  describe('validateCountryCode', () => {
    it('validates correct ISO country codes', () => {
      const validCodes = ['US', 'CA', 'GB', 'FR', 'DE', 'AE', 'SA']
      
      validCodes.forEach(code => {
        expect(validateCountryCode(code)).toBe(true)
      })
    })

    it('rejects invalid country codes', () => {
      const invalidCodes = ['XX', 'ZZ', 'USA', 'INVALID', '']
      
      invalidCodes.forEach(code => {
        expect(validateCountryCode(code)).toBe(false)
      })
    })

    it('handles lowercase codes', () => {
      expect(validateCountryCode('us')).toBe(true)
      expect(validateCountryCode('gb')).toBe(true)
    })

    it('validates length', () => {
      expect(validateCountryCode('U')).toBe(false) // Too short
      expect(validateCountryCode('USA')).toBe(false) // Too long
    })
  })

  describe('formatCountryName', () => {
    it('formats country names correctly', () => {
      const countryNames = {
        'us': 'United States',
        'ca': 'Canada',
        'gb': 'United Kingdom',
        'fr': 'France',
        'de': 'Germany',
        'ae': 'United Arab Emirates',
        'sa': 'Saudi Arabia'
      }

      Object.entries(countryNames).forEach(([code, expectedName]) => {
        expect(formatCountryName(code)).toBe(expectedName)
      })
    })

    it('handles uppercase country codes', () => {
      expect(formatCountryName('US')).toBe('United States')
      expect(formatCountryName('GB')).toBe('United Kingdom')
    })

    it('returns country code for unknown countries', () => {
      expect(formatCountryName('xx')).toBe('XX')
      expect(formatCountryName('unknown')).toBe('UNKNOWN')
    })

    it('handles edge cases', () => {
      expect(formatCountryName('')).toBe('')
      expect(formatCountryName(null)).toBe('')
      expect(formatCountryName(undefined)).toBe('')
    })
  })

  describe('Error Handling and Edge Cases', () => {
    it('handles localStorage quota exceeded', async () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('QuotaExceededError')
      })

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ country_code: 'US' })
      })

      const country = await detectUserCountry()

      expect(country).toBe('us')
      // Should not throw error even if localStorage fails
    })

    it('handles concurrent detection calls', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ country_code: 'US' })
      })

      const promises = Array.from({ length: 5 }, () => detectUserCountry())
      const results = await Promise.all(promises)

      results.forEach(result => {
        expect(result).toBe('us')
      })

      // Should have made only one API call due to caching
      expect(global.fetch).toHaveBeenCalledTimes(1)
    })

    it('handles malformed cache data', async () => {
      localStorageMock.getItem
        .mockReturnValueOnce('invalid_country_code')
        .mockReturnValueOnce('not_a_number')

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ country_code: 'US' })
      })

      const country = await detectUserCountry()

      expect(country).toBe('us')
      expect(global.fetch).toHaveBeenCalled()
    })

    it('handles browser without geolocation support', async () => {
      const originalNavigator = global.navigator
      global.navigator = {}

      const country = await detectUserCountry()

      expect(typeof country).toBe('string')
      expect(country.length).toBe(2)

      global.navigator = originalNavigator
    })

    it('handles very slow network responses', async () => {
      vi.useFakeTimers()

      const slowPromise = new Promise(resolve => {
        setTimeout(() => resolve({
          ok: true,
          json: () => Promise.resolve({ country_code: 'US' })
        }), 10000)
      })

      global.fetch.mockReturnValue(slowPromise)

      const countryPromise = detectUserCountry()

      // Fast forward time to trigger timeout
      vi.advanceTimersByTime(6000)

      const country = await countryPromise

      expect(country).toBe('us') // Should fallback to sync detection

      vi.useRealTimers()
    })
  })

  describe('Performance and Caching', () => {
    it('caches detection results properly', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ country_code: 'JP' })
      })

      // First call should hit API
      const country1 = await detectUserCountry()
      expect(country1).toBe('jp')
      expect(global.fetch).toHaveBeenCalledTimes(1)

      // Second call should use cache
      const country2 = await detectUserCountry()
      expect(country2).toBe('jp')
      expect(global.fetch).toHaveBeenCalledTimes(1) // No additional API call
    })

    it('respects cache expiration time', async () => {
      const now = Date.now()
      localStorageMock.getItem
        .mockReturnValueOnce('kr')
        .mockReturnValueOnce((now - 25 * 60 * 60 * 1000).toString()) // 25 hours ago

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ country_code: 'IN' })
      })

      const country = await detectUserCountry()

      expect(country).toBe('in')
      expect(global.fetch).toHaveBeenCalled() // Should refresh expired cache
    })

    it('measures detection performance', async () => {
      const startTime = performance.now()

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ country_code: 'BR' })
      })

      await detectUserCountry()

      const endTime = performance.now()
      const duration = endTime - startTime

      expect(duration).toBeLessThan(5000) // Should complete within 5 seconds
    })
  })
}) 