// Application Constants
// These constants are used throughout the application for consistent data handling

export const MEDICATION_FREQUENCIES = [
  { value: 'once_daily', label: 'Once daily' },
  { value: 'twice_daily', label: 'Twice daily' },
  { value: 'three_times_daily', label: 'Three times daily' },
  { value: 'four_times_daily', label: 'Four times daily' },
  { value: 'as_needed', label: 'As needed' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' }
]

export const MEDICATION_FORMS = [
  { value: 'tablet', label: 'Tablet' },
  { value: 'capsule', label: 'Capsule' },
  { value: 'liquid', label: 'Liquid' },
  { value: 'injection', label: 'Injection' },
  { value: 'inhaler', label: 'Inhaler' },
  { value: 'cream', label: 'Cream/Ointment' },
  { value: 'drops', label: 'Drops' },
  { value: 'patch', label: 'Patch' }
]

export const MEASUREMENT_TYPES = [
  // Vital Signs
  { value: 'temperature', label: 'Temperature', unit: '°C' },
  { value: 'heart_rate', label: 'Heart Rate', unit: 'bpm' },
  { value: 'blood_pressure_systolic', label: 'Systolic Blood Pressure', unit: 'mmHg' },
  { value: 'blood_pressure_diastolic', label: 'Diastolic Blood Pressure', unit: 'mmHg' },
  { value: 'respiratory_rate', label: 'Respiratory Rate', unit: '/min' },
  { value: 'oxygen_saturation', label: 'Oxygen Saturation', unit: '%' },
  
  // Physical Measurements
  { value: 'weight', label: 'Weight', unit: 'kg' },
  { value: 'height', label: 'Height', unit: 'cm' },
  
  // Blood Tests - Glucose & Diabetes
  { value: 'blood_glucose', label: 'Blood Glucose', unit: 'mg/dL' },
  
  // Blood Tests - Lipid Panel
  { value: 'cholesterol_total', label: 'Total Cholesterol', unit: 'mg/dL' },
  { value: 'cholesterol_ldl', label: 'LDL Cholesterol', unit: 'mg/dL' },
  { value: 'cholesterol_hdl', label: 'HDL Cholesterol', unit: 'mg/dL' },
  { value: 'triglycerides', label: 'Triglycerides', unit: 'mg/dL' },
  
  // Blood Tests - Complete Blood Count
  { value: 'hemoglobin', label: 'Hemoglobin', unit: 'g/dL' },
  { value: 'hematocrit', label: 'Hematocrit', unit: '%' },
  { value: 'white_blood_cell_count', label: 'White Blood Cell Count', unit: '/μL' },
  { value: 'red_blood_cell_count', label: 'Red Blood Cell Count', unit: 'million/μL' },
  { value: 'platelet_count', label: 'Platelet Count', unit: '/μL' },
  
  // Urine Tests
  { value: 'urine_protein', label: 'Urine Protein', unit: 'mg/dL' },
  { value: 'urine_glucose', label: 'Urine Glucose', unit: 'mg/dL' },
  { value: 'urine_ketones', label: 'Urine Ketones', unit: 'mg/dL' },
  { value: 'urine_specific_gravity', label: 'Urine Specific Gravity', unit: '' },
  { value: 'urine_ph', label: 'Urine pH', unit: '' },
  { value: 'urine_blood', label: 'Urine Blood', unit: 'RBC/hpf' },
  { value: 'urine_leukocytes', label: 'Urine Leukocytes', unit: 'WBC/hpf' },
  
  // Kidney Function
  { value: 'creatinine', label: 'Creatinine', unit: 'mg/dL' },
  { value: 'blood_urea_nitrogen', label: 'Blood Urea Nitrogen (BUN)', unit: 'mg/dL' },
  
  // Thyroid Function
  { value: 'thyroid_tsh', label: 'Thyroid Stimulating Hormone (TSH)', unit: 'mIU/L' },
  { value: 'thyroid_t3', label: 'Triiodothyronine (T3)', unit: 'ng/dL' },
  { value: 'thyroid_t4', label: 'Thyroxine (T4)', unit: 'μg/dL' },
  
  // Vitamins & Minerals
  { value: 'vitamin_d', label: 'Vitamin D', unit: 'ng/mL' },
  { value: 'vitamin_b12', label: 'Vitamin B12', unit: 'pg/mL' },
  { value: 'iron', label: 'Iron', unit: 'μg/dL' },
  { value: 'calcium', label: 'Calcium', unit: 'mg/dL' },
  
  // Electrolytes
  { value: 'potassium', label: 'Potassium', unit: 'mEq/L' },
  { value: 'sodium', label: 'Sodium', unit: 'mEq/L' },
  { value: 'chloride', label: 'Chloride', unit: 'mEq/L' },
  
  // Respiratory & Other
  { value: 'peak_flow', label: 'Peak Flow', unit: 'L/min' },
  
  // Subjective Measurements
  { value: 'pain_level', label: 'Pain Level', unit: '/10' },
  { value: 'mood_rating', label: 'Mood Rating', unit: '/10' }
]

export const LOG_TYPES = [
  { value: 'incident', label: 'Incident', color: '#ff4d4f' },
  { value: 'symptom', label: 'Symptom', color: '#ff7a45' },
  { value: 'behavior', label: 'Behavior', color: '#1890ff' },
  { value: 'activity', label: 'Activity', color: '#52c41a' },
  { value: 'meal', label: 'Meal', color: '#fa8c16' },
  { value: 'sleep', label: 'Sleep', color: '#722ed1' },
  { value: 'medication', label: 'Medication', color: '#13c2c2' },
  { value: 'general', label: 'General', color: '#8c8c8c' }
]

export const SEVERITY_LEVELS = [
  { value: 'positive', label: 'Positive', color: '#52c41a' },
  { value: 'normal', label: 'Normal', color: '#1890ff' },
  { value: 'mild', label: 'Mild', color: '#fa8c16' },
  { value: 'moderate', label: 'Moderate', color: '#ff7a45' },
  { value: 'severe', label: 'Severe', color: '#ff4d4f' }
] 