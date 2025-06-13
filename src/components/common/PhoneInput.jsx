import { useState, useEffect } from 'react'
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
  // Initialize with a more reliable default
  const [country, setCountry] = useState(() => {
    if (defaultCountry) {
      return defaultCountry
    }
    
    // Try to get a better initial country
    const syncCountry = getUserCountrySync()
    
    // Ensure we always have a valid fallback and it's Canada
    const finalCountry = syncCountry || 'ca'
    return finalCountry
  })

  useEffect(() => {
    // Only run detection if no explicit defaultCountry provided
    if (defaultCountry) {
      return
    }

    let isMounted = true

    const runDetection = async () => {
      try {
        const detectedCountry = await detectUserCountry()
        
        if (isMounted && detectedCountry) {
          setCountry(detectedCountry)
        }
      } catch (error) {
        console.warn('PhoneInput: Country detection failed:', error)
        // Keep the current country value
      }
    }

    runDetection()

    return () => {
      isMounted = false
    }
  }, [defaultCountry])

  return (
    <PhoneInput
      country={country}
      enableSearch={enableSearch}
      distinct={distinct}
      enableArrow={enableArrow}
      {...props}
    />
  )
}

export default CustomPhoneInput 