import { useState, useEffect, useCallback } from 'react'
import PhoneInput from 'antd-phone-input'
import { detectUserCountry, getUserCountrySync } from '../../utils/countryDetection'

// Re-export the antd-phone-input component with auto-detected country
const CustomPhoneInput = ({ 
  defaultCountry,
  enableSearch = true,
  distinct = true,
  enableArrow = true,
  ...props 
}) => {
  const [detectedCountry, setDetectedCountry] = useState(() => {
    // Only auto-detect if no explicit defaultCountry is provided
    return defaultCountry || getUserCountrySync()
  })

  // Memoize the country detection to prevent unnecessary re-runs
  const detectCountry = useCallback(async () => {
    if (defaultCountry) return // Don't detect if explicit country provided
    
    try {
      const country = await detectUserCountry()
      setDetectedCountry(country)
    } catch (error) {
      console.warn('Country detection failed:', error)
      // Keep the current detectedCountry value (from getUserCountrySync)
    }
  }, [defaultCountry])

  useEffect(() => {
    detectCountry()
  }, [detectCountry])

  // Use defaultCountry if provided, otherwise use detected country
  const countryToUse = defaultCountry || detectedCountry

  return (
    <PhoneInput
      country={countryToUse}
      enableSearch={enableSearch}
      distinct={distinct}
      enableArrow={enableArrow}
      {...props}
    />
  )
}

export default CustomPhoneInput 