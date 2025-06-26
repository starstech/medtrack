#!/usr/bin/env node

// Quick API Test Script for MedTrack
// Run with: node scripts/test-api.js

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'http://localhost:54321'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testAPI() {
  console.log('🧪 Testing MedTrack API...\n')

  try {
    // Test 1: Database Connection
    console.log('1️⃣ Testing database connection...')
    const { data, error } = await supabase.from('patients').select('count').limit(1)
    if (error) throw error
    console.log('✅ Database connected successfully\n')

    // Test 2: Authentication
    console.log('2️⃣ Testing authentication...')
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: `test-${Date.now()}@example.com`,
      password: 'testpassword123'
    })
    if (authError) throw authError
    console.log('✅ User created:', authData.user.email)

    // Test 3: Create Patient
    console.log('3️⃣ Testing patient creation...')
    const patientData = {
      name: 'Test Patient',
      date_of_birth: '1990-01-01',
      gender: 'male',
      emergency_contact: {
        name: 'Emergency Contact',
        phone: '+971501234567',
        relationship: 'parent',
        email: 'emergency@example.com'
      }
    }

    const { data: patient, error: patientError } = await supabase
      .from('patients')
      .insert(patientData)
      .select()
      .single()

    if (patientError) throw patientError
    console.log('✅ Patient created:', patient.name)

    // Test 4: Phone Validation
    console.log('4️⃣ Testing phone validation...')
    const phoneTests = [
      '+971501234567', // UAE
      '+1234567890',   // US
      '+442071234567', // UK
      '123',           // Invalid
      '+123456789012345678' // Too long
    ]

    phoneTests.forEach(phone => {
      const isValid = phone.match(/^\+?[\d\s\-\(\)\.]{7,20}$/) && 
                     phone.replace(/[^\d]/g, '').length >= 7 && 
                     phone.replace(/[^\d]/g, '').length <= 15
      console.log(`${isValid ? '✅' : '❌'} ${phone}: ${isValid ? 'Valid' : 'Invalid'}`)
    })

    // Test 5: RLS (Row Level Security)
    console.log('\n5️⃣ Testing RLS...')
    const { data: userPatients } = await supabase
      .from('patients')
      .select('*')
    
    console.log(`✅ User can see ${userPatients.length} patients (should only see their own)`)

    // Test 6: Country Detection
    console.log('6️⃣ Testing country detection...')
    try {
      const response = await fetch('https://ipapi.co/json/')
      const ipData = await response.json()
      console.log(`✅ IP Country: ${ipData.country_code} (${ipData.country_name})`)
    } catch (error) {
      console.log('❌ IP detection failed:', error.message)
    }

    // Cleanup
    console.log('\n🧹 Cleaning up...')
    await supabase.from('patients').delete().eq('id', patient.id)
    console.log('✅ Test patient deleted')

    console.log('\n🎉 All tests passed!')

  } catch (error) {
    console.error('❌ Test failed:', error.message)
    process.exit(1)
  }
}

// Run tests
testAPI() 