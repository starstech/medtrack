# MedTrack Database Setup

This directory contains all the database setup files for the MedTrack application using Supabase.

## 🚀 Quick Start

Choose your setup method:

- **[🏠 Local Development Setup](database/LOCAL_SUPABASE_SETUP.md)** - For testing and development
- **[🌐 Production Setup](database/PRODUCTION_SETUP.md)** - For live deployment

## 📖 Overview

This database setup provides a complete, enterprise-grade backend for medical data management with:
- HIPAA compliance features
- GDPR data protection
- Real-time synchronization
- Performance optimization
- Comprehensive security

## Directory Structure

```
database/
├── schemas/                # Database schema definitions
│   └── 01_initial_schema.sql
├── policies/              # Row Level Security policies
│   └── 02_rls_policies.sql
├── seeds/                 # Sample data for testing
│   └── 03_sample_data.sql
├── storage/               # Storage bucket configuration
│   └── 04_storage_setup.sql
├── functions/             # Database functions
│   └── 05_database_functions.sql
├── triggers/              # Notification triggers
│   └── 06_notification_triggers.sql
├── realtime/              # Real-time setup
│   └── 07_realtime_setup.sql
├── edge-functions/        # Edge functions support
│   └── 08_edge_functions.sql
├── validation/            # Data validation
│   └── 09_data_validation.sql
├── compliance/            # HIPAA & GDPR compliance
│   └── 10_compliance_logging.sql
├── performance/           # Performance optimizations
│   └── 11_performance_optimizations.sql
└── README.md             # This file
```

## Setup Instructions

### 1. Prerequisites

- Supabase project created
- Supabase CLI installed (optional, for local development)
- Access to Supabase SQL Editor

### 2. Database Setup Order

Execute the SQL files in this exact order:

1. **01_initial_schema.sql** - Creates all tables, triggers, and basic structure
2. **02_rls_policies.sql** - Sets up Row Level Security policies
3. **04_storage_setup.sql** - Creates storage buckets and policies (with caregiver sharing)
4. **05_database_functions.sql** - Adds utility functions
5. **06_notification_triggers.sql** - Auto-notification system
6. **07_realtime_setup.sql** - Real-time subscriptions
7. **08_edge_functions.sql** - Edge functions support
8. **09_data_validation.sql** - Data validation and constraints
9. **10_compliance_logging.sql** - HIPAA & GDPR compliance features
10. **11_performance_optimizations.sql** - Performance indexes and materialized views
11. **12_measurement_preferences.sql** - Measurement preferences and presets system
12. **03_sample_data.sql** - (Optional) Adds sample data for testing

### 3. Execution Methods

#### Option A: Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste each file's contents
4. Execute in order (1 → 2 → 4 → 5 → 3)

#### Option B: Supabase CLI (For local development)

```bash
# If using local development
supabase db reset
supabase db push

# Or execute individual files
supabase db sql --file database/schemas/01_initial_schema.sql
supabase db sql --file database/policies/02_rls_policies.sql
supabase db sql --file database/storage/04_storage_setup.sql
supabase db sql --file database/functions/05_database_functions.sql
supabase db sql --file database/seeds/03_sample_data.sql
```

### 4. Environment Setup

Make sure your `.env.local` file contains:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Schema Overview

### Core Tables

- **profiles** - User profiles extending auth.users
- **patients** - Patient information
- **patient_caregivers** - Many-to-many relationship between patients and caregivers
- **medications** - Medication prescriptions
- **doses** - Individual dose tracking
- **measurements** - Health measurements (vital signs, etc.)
- **daily_logs** - Daily observations and incidents
- **files** - File metadata for attachments
- **notifications** - System notifications
- **user_devices** - Device tokens for push notifications
- **notification_preferences** - User notification settings
- **measurement_preferences** - Patient-specific measurement visibility settings
- **measurement_presets** - Predefined measurement configurations for medical scenarios

### Key Features

- **UUID Primary Keys** - All tables use UUID for better security
- **Row Level Security (RLS)** - Data isolation between users
- **Automatic Timestamps** - Created/updated timestamps with triggers
- **JSONB Support** - Flexible data storage for attachments and metadata
- **Performance Indexes** - Optimized for common queries

## Security Features

### Row Level Security Policies

- Users can only access their own data
- Caregivers can access data for patients they're assigned to
- File access is restricted to uploaders
- Notification preferences are user-specific

### Storage Security

- **medtrack-attachments** - Private bucket for medical files
- **profile-images** - Public bucket for user avatars
- File organization by user ID prevents cross-user access
- MIME type restrictions for security

## Database Functions

### Patient Management
- `get_patient_summary(patient_id)` - Get patient info with stats
- Calculate medication counts, pending doses, recent activity

### Medication Adherence
- `calculate_adherence(medication_id, days)` - Calculate adherence percentage
- `get_adherence_summary(patient_id, days)` - Comprehensive adherence report

### Dose Management
- `generate_doses(medication_id, start_date, end_date)` - Auto-generate doses
- Supports daily, twice daily, three times daily, four times daily frequencies

### Notifications
- `get_overdue_doses(user_id)` - Find overdue medications
- `get_upcoming_doses(user_id, hours)` - Find upcoming doses

### Analytics
- `get_measurement_trends(patient_id, type, days)` - Measurement data over time

### Measurement Preferences
- `get_or_create_measurement_preferences(patient_id, user_id)` - Get or create default preferences
- `is_measurement_enabled(patient_id, user_id, category, type)` - Check if measurement is enabled
- `apply_measurement_preset(patient_id, user_id, preset_name)` - Apply a predefined preset

### Maintenance
- `cleanup_old_notifications(days)` - Remove old read notifications
- `mark_overdue_doses_as_missed(hours)` - Auto-mark missed doses

## Sample Data

The sample data includes:

- 2 test patients (Emma Johnson, Michael Chen)
- Multiple medications with different frequencies
- Realistic dose tracking with various statuses
- Health measurements over time
- Daily logs with different types and severities
- Sample notifications

### Using Sample Data

1. Create a test user account through your app
2. Get the user UUID from the auth.users table
3. Replace 'user-uuid-here' in `03_sample_data.sql`
4. Generate new UUIDs for all other records
5. Execute the SQL

## Storage Organization

```
medtrack-attachments/           # Private bucket
├── {user_id}/
│   ├── measurements/
│   │   └── {measurement_id}/
│   │       └── device_photos/
│   │   
│   ├── logs/
│   │   └── {log_id}/
│   │       └── incident_photos/
│   └── patients/
│       └── {patient_id}/
│           └── documents/

profile-images/                 # Public bucket
└── {user_id}/
    ├── avatar.jpg
    └── avatar_thumb.jpg
```

## Performance Considerations

### Indexes Created

- Patient-caregiver relationships
- Medication lookups by patient
- Dose scheduling queries
- Measurement queries by patient and type
- Notification queries by user and read status

### Query Optimization

- Use prepared statements
- Leverage RLS for automatic filtering
- Use JSONB operators for attachment queries
- Consider pagination for large datasets

## Maintenance Tasks

### Regular Cleanup (Recommended)

```sql
-- Run weekly
SELECT api.cleanup_old_notifications(30);
SELECT api.mark_overdue_doses_as_missed(6);
```

### Monitoring Queries

```sql
-- Check table sizes
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'api';

-- Check recent activity
SELECT COUNT(*) as new_users_today FROM auth.users WHERE created_at > CURRENT_DATE;
SELECT COUNT(*) as doses_marked_today FROM api.doses WHERE taken_at > CURRENT_DATE;
```

## Troubleshooting

### Common Issues

1. **RLS Policies Not Working**
   - Check if RLS is enabled on tables
   - Verify user authentication
   - Check policy conditions

2. **Storage Upload Fails**
   - Verify bucket policies
   - Check file size limits
   - Validate MIME types

3. **Function Execution Errors**
   - Check function permissions
   - Verify parameter types
   - Review error logs in Supabase dashboard

### Support

- Supabase Documentation: https://supabase.io/docs
- SQL Reference: https://supabase.io/docs/guides/database
- Storage Guide: https://supabase.io/docs/guides/storage 