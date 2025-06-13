// Country detection utility with caching and fallback methods
// Detects user's country for phone input and validation

const CACHE_KEY = 'medtrack_user_country'
const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours in milliseconds
const DEFAULT_COUNTRY = 'ca' // Canada as default fallback

/**
 * Get cached country from localStorage
 * @returns {string|null} - Cached country code or null if expired/not found
 */
const getCachedCountry = () => {
  try {
    const cached = localStorage.getItem(CACHE_KEY)
    if (!cached) return null

    const { country, timestamp } = JSON.parse(cached)
    const now = Date.now()
    
    // Check if cache is still valid (within 24 hours)
    if (now - timestamp < CACHE_DURATION) {
      return country
    }
    
    // Cache expired, remove it
    localStorage.removeItem(CACHE_KEY)
    return null
  } catch (error) {
    console.warn('Error reading cached country:', error)
    localStorage.removeItem(CACHE_KEY)
    return null
  }
}

/**
 * Cache country in localStorage
 * @param {string} country - Country code to cache
 */
const setCachedCountry = (country) => {
  try {
    const cacheData = {
      country,
      timestamp: Date.now()
    }
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData))
  } catch (error) {
    console.warn('Error caching country:', error)
  }
}

/**
 * Detect country using IP-based geolocation
 * @returns {Promise<string>} - Country code
 */
const detectCountryFromIP = async () => {
  // Try multiple IP geolocation services for reliability
  const services = [
    {
      url: 'https://ipapi.co/json/',
      extractCountry: (data) => data.country_code?.toLowerCase()
    },
    {
      url: 'https://ip-api.com/json/',
      extractCountry: (data) => data.countryCode?.toLowerCase()
    },
    {
      url: 'https://ipinfo.io/json',
      extractCountry: (data) => data.country?.toLowerCase()
    }
  ]

  for (const service of services) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout

      const response = await fetch(service.url, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json'
        }
      })
      
      clearTimeout(timeoutId)
      
      if (!response.ok) continue

      const data = await response.json()
      const country = service.extractCountry(data)
      
      if (country && country.length === 2) {
        console.log(`Country detected from ${service.url}:`, country)
        return country
      }
    } catch (error) {
      console.warn(`Failed to detect country from ${service.url}:`, error.message)
      continue
    }
  }
  
  throw new Error('All IP geolocation services failed')
}

/**
 * Detect country from browser locale
 * @returns {string|null} - Country code from locale or null
 */
const detectCountryFromLocale = () => {
  try {
    // Get primary language from browser
    const locale = navigator.language || navigator.languages?.[0]
    if (!locale) return null

    // Extract country code from locale (e.g., 'en-CA' -> 'ca')
    const parts = locale.split('-')
    if (parts.length >= 2) {
      const countryCode = parts[1].toLowerCase()
      // Validate it's a 2-letter country code
      if (countryCode.length === 2 && /^[a-z]{2}$/.test(countryCode)) {
        return countryCode
      }
    }
    
    return null
  } catch (error) {
    console.warn('Error detecting country from locale:', error)
    return null
  }
}

/**
 * Detect country from timezone (additional fallback)
 * @returns {string|null} - Country code from timezone or null
 */
const detectCountryFromTimezone = () => {
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    
    // Common timezone to country mappings
    const timezoneCountryMap = {
      // North America
      'America/Toronto': 'ca',
      'America/Vancouver': 'ca',
      'America/Montreal': 'ca',
      'America/Halifax': 'ca',
      'America/New_York': 'us',
      'America/Los_Angeles': 'us',
      'America/Chicago': 'us',
      'America/Denver': 'us',
      
      // Europe
      'Europe/London': 'gb',
      'Europe/Paris': 'fr',
      'Europe/Berlin': 'de',
      'Europe/Rome': 'it',
      'Europe/Madrid': 'es',
      
      // Middle East
      'Asia/Dubai': 'ae',
      'Asia/Riyadh': 'sa',
      'Asia/Kuwait': 'kw',
      'Asia/Qatar': 'qa',
      'Asia/Bahrain': 'bh',
      
      // Asia Pacific
      'Asia/Tokyo': 'jp',
      'Asia/Shanghai': 'cn',
      'Australia/Sydney': 'au',
      'Australia/Melbourne': 'au'
    }
    
    return timezoneCountryMap[timezone] || null
  } catch (error) {
    console.warn('Error detecting country from timezone:', error)
    return null
  }
}

/**
 * Main function to detect user's country
 * Uses multiple detection methods with caching
 * @param {boolean} forceRefresh - Force refresh cache (optional)
 * @returns {Promise<string>} - Country code (always returns a valid code)
 */
export const detectUserCountry = async (forceRefresh = false) => {
  // Check cache first (unless force refresh)
  if (!forceRefresh) {
    const cached = getCachedCountry()
    if (cached) {
      return cached
    }
  }

  let detectedCountry = DEFAULT_COUNTRY

  try {
    // Method 1: IP-based detection (most accurate)
    detectedCountry = await detectCountryFromIP()
    console.log('Country detected via IP:', detectedCountry)
  } catch (error) {
    console.warn('IP-based country detection failed, trying fallback methods')
    
    // Method 2: Browser locale
    const localeCountry = detectCountryFromLocale()
    if (localeCountry) {
      detectedCountry = localeCountry
      console.log('Country detected via locale:', detectedCountry)
    } else {
      // Method 3: Timezone
      const timezoneCountry = detectCountryFromTimezone()
      if (timezoneCountry) {
        detectedCountry = timezoneCountry
        console.log('Country detected via timezone:', detectedCountry)
      } else {
        console.log('Using default country:', detectedCountry)
      }
    }
  }

  // Cache the result
  setCachedCountry(detectedCountry)
  
  return detectedCountry
}

/**
 * Get country synchronously (returns cached value or default)
 * Useful for immediate rendering while async detection happens
 * @returns {string} - Country code
 */
export const getUserCountrySync = () => {
  // Check cache first
  const cached = getCachedCountry()
  if (cached) {
    console.log('Using cached country:', cached)
    return cached
  }

  // Try timezone first (more reliable for location than locale)
  const timezoneCountry = detectCountryFromTimezone()
  if (timezoneCountry) {
    console.log('Sync country detected via timezone:', timezoneCountry, 'from:', Intl.DateTimeFormat().resolvedOptions().timeZone)
    return timezoneCountry
  }

  // Then try locale (language preference)
  const localeCountry = detectCountryFromLocale()
  if (localeCountry) {
    console.log('Sync country detected via locale:', localeCountry, 'from:', navigator.language)
    return localeCountry
  }

  console.log('Using default country for sync detection:', DEFAULT_COUNTRY)
  return DEFAULT_COUNTRY
}

/**
 * Clear cached country (useful for testing or user preference changes)
 */
export const clearCountryCache = () => {
  try {
    localStorage.removeItem(CACHE_KEY)
  } catch (error) {
    console.warn('Error clearing country cache:', error)
  }
}

/**
 * Validate if a country code is supported by antd-phone-input
 * @param {string} countryCode - Country code to validate
 * @returns {boolean} - Whether the country is supported
 */
export const isCountrySupported = (countryCode) => {
  // Common countries supported by antd-phone-input
  const supportedCountries = [
    'us', 'ca', 'gb', 'au', 'de', 'fr', 'it', 'es', 'nl', 'se', 'no', 'dk', 'fi',
    'jp', 'kr', 'cn', 'in', 'br', 'mx', 'ar', 'za', 'eg', 'ng', 'ke', 'ae', 'sa',
    'il', 'tr', 'ru', 'pl', 'cz', 'hu', 'gr', 'pt', 'ie', 'be', 'ch', 'at', 'lu', 'is'
  ]
  
  return supportedCountries.includes(countryCode?.toLowerCase())
}

/**
 * Get country with validation (ensures it's supported)
 * @param {boolean} forceRefresh - Force refresh cache
 * @returns {Promise<string>} - Supported country code
 */
export const getValidatedUserCountry = async (forceRefresh = false) => {
  const country = await detectUserCountry(forceRefresh)
  return isCountrySupported(country) ? country : DEFAULT_COUNTRY
} 