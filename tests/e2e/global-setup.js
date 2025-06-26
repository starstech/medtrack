import { test as setup } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'http://localhost:54321';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-key';

// Create admin client for seeding
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const testUsers = [
  {
    email: 'testuser@example.com',
    password: 'TestPass123!',
    userData: {
      full_name: 'Test User',
      phone: '+1234567890',
      role: 'caregiver'
    }
  },
  {
    email: 'caregiver@example.com', 
    password: 'CaregiverPass123!',
    userData: {
      full_name: 'Jane Caregiver',
      phone: '+1987654321',
      role: 'caregiver'
    }
  },
  {
    email: 'patient@example.com',
    password: 'PatientPass123!',
    userData: {
      full_name: 'John Patient',
      phone: '+1555666777',
      role: 'patient'
    }
  }
];

const testPatients = [
  {
    first_name: 'Alice',
    last_name: 'Johnson',
    date_of_birth: '1985-06-15',
    phone: '+1234567890',
    email: 'alice@example.com',
    emergency_contact: 'Bob Johnson +1234567891',
    medical_conditions: ['Diabetes Type 2', 'Hypertension'],
    allergies: ['Penicillin'],
    notes: 'Test patient for E2E testing'
  },
  {
    first_name: 'Bob',
    last_name: 'Smith', 
    date_of_birth: '1978-03-22',
    phone: '+1234567892',
    email: 'bob@example.com',
    emergency_contact: 'Alice Smith +1234567893',
    medical_conditions: ['Asthma'],
    allergies: [],
    notes: 'Second test patient'
  }
];

const testMedications = [
  {
    name: 'Metformin',
    dosage: '500mg',
    frequency: 'twice_daily',
    instructions: 'Take with food',
    start_date: new Date().toISOString().split('T')[0],
    end_date: null,
    is_active: true
  },
  {
    name: 'Lisinopril',
    dosage: '10mg',
    frequency: 'once_daily',
    instructions: 'Take in the morning',
    start_date: new Date().toISOString().split('T')[0],
    end_date: null,
    is_active: true
  },
  {
    name: 'Albuterol',
    dosage: '2 puffs',
    frequency: 'as_needed',
    instructions: 'Use as needed for breathing difficulties',
    start_date: new Date().toISOString().split('T')[0],
    end_date: null,
    is_active: true
  }
];

const testAppointments = [
  {
    title: 'Regular Checkup',
    type: 'checkup',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    time: '10:00',
    doctor_name: 'Dr. Smith',
    location: 'Main Clinic',
    notes: 'Annual physical exam'
  },
  {
    title: 'Diabetes Follow-up',
    type: 'follow_up',
    date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now  
    time: '14:30',
    doctor_name: 'Dr. Johnson',
    location: 'Endocrinology Center',
    notes: 'Review blood sugar levels'
  }
];

async function cleanDatabase() {
  console.log('🧹 Cleaning test database...');
  
  try {
    // Delete in reverse dependency order
    await supabaseAdmin.from('doses').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('appointments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('medications').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('patients').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('caregivers').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    // Clean auth users (be careful with this in production!)
    const { data: users } = await supabaseAdmin.auth.admin.listUsers();
    for (const user of users.users) {
      if (user.email?.includes('@example.com')) {
        await supabaseAdmin.auth.admin.deleteUser(user.id);
      }
    }
    
    console.log('✅ Database cleaned');
  } catch (error) {
    console.error('❌ Error cleaning database:', error);
  }
}

async function seedTestData() {
  console.log('🌱 Seeding test data...');
  
  try {
    // Create test users
    const createdUsers = [];
    for (const user of testUsers) {
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email: user.email,
        password: user.password,
        user_metadata: user.userData,
        email_confirm: true
      });
      
      if (error) {
        console.error(`Error creating user ${user.email}:`, error);
        continue;
      }
      
      createdUsers.push({ ...data.user, password: user.password });
      console.log(`✅ Created user: ${user.email}`);
    }

    // Create caregivers
    const caregiverUsers = createdUsers.filter(u => u.user_metadata?.role === 'caregiver');
    const createdCaregivers = [];
    
    for (const user of caregiverUsers) {
      const { data, error } = await supabaseAdmin
        .from('caregivers')
        .insert({
          id: user.id,
          first_name: user.user_metadata.full_name?.split(' ')[0] || 'Test',
          last_name: user.user_metadata.full_name?.split(' ')[1] || 'User',
          email: user.email,
          phone: user.user_metadata.phone,
          specialization: 'General Care',
          is_active: true
        })
        .select()
        .single();
        
      if (error) {
        console.error('Error creating caregiver:', error);
        continue;
      }
      
      createdCaregivers.push(data);
      console.log(`✅ Created caregiver: ${data.email}`);
    }

    // Create patients 
    const createdPatients = [];
    for (let i = 0; i < testPatients.length; i++) {
      const patient = testPatients[i];
      const caregiver = createdCaregivers[i % createdCaregivers.length]; // Rotate caregivers
      
      const { data, error } = await supabaseAdmin
        .from('patients')
        .insert({
          ...patient,
          caregiver_id: caregiver.id,
          is_active: true
        })
        .select()
        .single();
        
      if (error) {
        console.error('Error creating patient:', error);
        continue;
      }
      
      createdPatients.push(data);
      console.log(`✅ Created patient: ${data.first_name} ${data.last_name}`);
    }

    // Create medications
    const createdMedications = [];
    for (let i = 0; i < testMedications.length; i++) {
      const medication = testMedications[i];
      const patient = createdPatients[i % createdPatients.length]; // Rotate patients
      
      const { data, error } = await supabaseAdmin
        .from('medications')
        .insert({
          ...medication,
          patient_id: patient.id
        })
        .select()
        .single();
        
      if (error) {
        console.error('Error creating medication:', error);
        continue;
      }
      
      createdMedications.push(data);
      console.log(`✅ Created medication: ${data.name} for ${patient.first_name}`);
    }

    // Create appointments
    for (let i = 0; i < testAppointments.length; i++) {
      const appointment = testAppointments[i];
      const patient = createdPatients[i % createdPatients.length];
      
      const { data, error } = await supabaseAdmin
        .from('appointments')
        .insert({
          ...appointment,
          patient_id: patient.id,
          date: appointment.date.split('T')[0],
          time: appointment.time
        })
        .select()
        .single();
        
      if (error) {
        console.error('Error creating appointment:', error);
        continue;
      }
      
      console.log(`✅ Created appointment: ${data.title} for ${patient.first_name}`);
    }

    // Create some doses for testing
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    for (const medication of createdMedications) {
      // Create today's doses
      const { error } = await supabaseAdmin
        .from('doses')
        .insert([
          {
            medication_id: medication.id,
            patient_id: medication.patient_id,
            scheduled_time: `${today.toISOString().split('T')[0]}T08:00:00Z`,
            status: 'pending',
            dosage: medication.dosage
          },
          {
            medication_id: medication.id,
            patient_id: medication.patient_id,
            scheduled_time: `${today.toISOString().split('T')[0]}T20:00:00Z`,
            status: 'pending',
            dosage: medication.dosage
          },
          // Tomorrow's doses
          {
            medication_id: medication.id,
            patient_id: medication.patient_id,
            scheduled_time: `${tomorrow.toISOString().split('T')[0]}T08:00:00Z`,
            status: 'pending',
            dosage: medication.dosage
          }
        ]);
        
      if (error) {
        console.error('Error creating doses:', error);
      }
    }

    console.log('✅ Test data seeding completed successfully');
    
    // Store test data for use in tests
    global.testData = {
      users: createdUsers,
      caregivers: createdCaregivers,
      patients: createdPatients,
      medications: createdMedications
    };
    
  } catch (error) {
    console.error('❌ Error seeding test data:', error);
    throw error;
  }
}

setup('global setup', async () => {
  console.log('🚀 Starting E2E test environment setup...');
  
  // Clean existing test data
  await cleanDatabase();
  
  // Seed fresh test data
  await seedTestData();
  
  console.log('✅ E2E test environment ready');
});

export { testUsers, testPatients, testMedications, testAppointments }; 