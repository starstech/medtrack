# MedTrack Database Schema & Migration Plan

This document is generated from the backend implementation and API contract. It lists every required table, column, index, and relationship. Use this as the source for all migration scripts and DB setup.

---

## Table of Contents
1. Authentication & User Management
2. Patient Management
3. Medication Management
4. Dose Management
5. Measurement Management
6. Daily Logs
7. Appointments
8. Caregiver Management
9. Notifications
10. File Uploads
11. Dashboard & Analytics
12. Sync & Export
13. Miscellaneous

---

## 1. Authentication & User Management

### Table: users
- id: UUID PRIMARY KEY
- email: TEXT NOT NULL UNIQUE
- name: TEXT NOT NULL
- avatar_url: TEXT
- role: TEXT NOT NULL DEFAULT 'caregiver'
- created_at: TIMESTAMP WITH TIME ZONE DEFAULT now()
- updated_at: TIMESTAMP WITH TIME ZONE DEFAULT now()

**Indexes:**
- (email) UNIQUE

**Example Migration SQL:**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'caregiver',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

---

### Table: profiles
- id: UUID PRIMARY KEY
- email: TEXT NOT NULL UNIQUE
- name: TEXT NOT NULL
- avatar_url: TEXT
- role: TEXT NOT NULL DEFAULT 'caregiver'
- created_at: TIMESTAMP WITH TIME ZONE DEFAULT now()
- updated_at: TIMESTAMP WITH TIME ZONE DEFAULT now()

**Indexes:**
- (email) UNIQUE

**Example Migration SQL:**
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'caregiver',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**Note:** Some parts of the backend use 'users', others use 'profiles' for user identity. You may consolidate these in production, but both are included for compatibility with all backend code.

---

## 2. Patient Management

### Table: patients
- id: UUID PRIMARY KEY
- name: TEXT NOT NULL
- dob: DATE NOT NULL
- gender: TEXT NOT NULL CHECK (gender IN ('male', 'female', 'other'))
- allergies: TEXT[] DEFAULT '{}'
- medical_conditions: TEXT[] DEFAULT '{}'
- emergency_contact: JSONB NOT NULL -- { name, phone, relationship }
- created_by: UUID NOT NULL REFERENCES users(id)
- created_at: TIMESTAMP WITH TIME ZONE DEFAULT now()
- updated_at: TIMESTAMP WITH TIME ZONE DEFAULT now()
- is_deleted: BOOLEAN DEFAULT FALSE

**Indexes:**
- (name, dob) UNIQUE
- (created_by)

**Example Migration SQL:**
```sql
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  dob DATE NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female', 'other')),
  allergies TEXT[] DEFAULT '{}',
  medical_conditions TEXT[] DEFAULT '{}',
  emergency_contact JSONB NOT NULL,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  is_deleted BOOLEAN DEFAULT FALSE,
  UNIQUE (name, dob)
);
CREATE INDEX idx_patients_created_by ON patients(created_by);
```

---

### Table: patient_caregivers
- id: UUID PRIMARY KEY
- patient_id: UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE
- caregiver_id: UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
- role: TEXT NOT NULL CHECK (role IN ('primary', 'secondary', 'viewer'))
- permissions: JSONB DEFAULT '{}'
- is_active: BOOLEAN DEFAULT TRUE
- accepted_at: TIMESTAMP WITH TIME ZONE
- created_at: TIMESTAMP WITH TIME ZONE DEFAULT now()
- updated_at: TIMESTAMP WITH TIME ZONE DEFAULT now()

**Indexes:**
- (patient_id, caregiver_id) UNIQUE
- (caregiver_id)

**Example Migration SQL:**
```sql
CREATE TABLE patient_caregivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  caregiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('primary', 'secondary', 'viewer')),
  permissions JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (patient_id, caregiver_id)
);
CREATE INDEX idx_patient_caregivers_caregiver_id ON patient_caregivers(caregiver_id);
```

---

**Notes:**
- RLS (Row Level Security) should be enabled for both tables to restrict access to authorized caregivers only.
- All changes to patient data should be audited (see audit tables).
- Soft delete is implemented via `is_deleted` on patients.
- Emergency contact is stored as a JSON object for flexibility.

---

**[Next: Medication Management tables will be filled in]** 

---

## 10. File Uploads

### Table: files
- id: UUID PRIMARY KEY
- patient_id: UUID REFERENCES patients(id)
- measurement_id: UUID REFERENCES measurements(id)
- log_id: UUID REFERENCES daily_logs(id)
- file_name: TEXT NOT NULL
- original_name: TEXT
- filename: TEXT
- mime_type: TEXT NOT NULL
- size: BIGINT
- storage_path: TEXT
- url: TEXT
- metadata: JSONB DEFAULT '{}'
- uploaded_by: UUID REFERENCES users(id)
- uploaded_at: TIMESTAMP WITH TIME ZONE DEFAULT now()

**Indexes:**
- (patient_id)
- (measurement_id)
- (log_id)

**Example Migration SQL:**
```sql
CREATE TABLE files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id),
  measurement_id UUID REFERENCES measurements(id),
  log_id UUID REFERENCES daily_logs(id),
  file_name TEXT NOT NULL,
  original_name TEXT,
  filename TEXT,
  mime_type TEXT NOT NULL,
  size BIGINT,
  storage_path TEXT,
  url TEXT,
  metadata JSONB DEFAULT '{}',
  uploaded_by UUID REFERENCES users(id),
  uploaded_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_files_patient_id ON files(patient_id);
CREATE INDEX idx_files_measurement_id ON files(measurement_id);
CREATE INDEX idx_files_log_id ON files(log_id);
```

---

### Table: file_shares
- id: UUID PRIMARY KEY
- file_id: UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE
- shared_with: UUID NOT NULL REFERENCES users(id)
- permissions: JSONB DEFAULT '{}'
- shared_by: UUID REFERENCES users(id)
- created_at: TIMESTAMP WITH TIME ZONE DEFAULT now()

**Indexes:**
- (file_id)
- (shared_with)

**Example Migration SQL:**
```sql
CREATE TABLE file_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  shared_with UUID NOT NULL REFERENCES users(id),
  permissions JSONB DEFAULT '{}',
  shared_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_file_shares_file_id ON file_shares(file_id);
CREATE INDEX idx_file_shares_shared_with ON file_shares(shared_with);
```

---

# (All other sections remain as previously written, unless new columns/tables are found in the backend.) 