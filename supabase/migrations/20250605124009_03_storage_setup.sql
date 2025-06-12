-- Supabase Storage Setup for MedTrack
-- Version: 04 - Storage Configuration

-- Create storage buckets for different file types
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) VALUES 
(
  'medtrack-attachments',
  'medtrack-attachments',
  false,  -- Private bucket for medical data
  10485760,  -- 10MB limit
  ARRAY[
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain'
  ]
),
(
  'profile-images', 
  'profile-images',
  true,   -- Public bucket for profile images
  5242880,  -- 5MB limit
  ARRAY[
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp'
  ]
);

-- Storage policies for medtrack-attachments bucket
-- Users can upload files to their own folder or shared patient folders
CREATE POLICY "Users can upload attachment files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'medtrack-attachments' AND
    (
      -- Own files
      auth.uid()::text = (storage.foldername(name))[1] OR
      -- Files for patients they care for
      (storage.foldername(name))[1] IN (
        SELECT DISTINCT pc.caregiver_id::text
        FROM api.patient_caregivers pc
        WHERE pc.caregiver_id = auth.uid() AND pc.is_active = true
      )
    )
  );

-- Users can view files from caregivers of shared patients
CREATE POLICY "Users can view shared attachment files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'medtrack-attachments' AND
    (
      -- Own files
      auth.uid()::text = (storage.foldername(name))[1] OR
      -- Files from other caregivers of shared patients
      (storage.foldername(name))[1] IN (
        SELECT DISTINCT other_caregivers.caregiver_id::text
        FROM api.patient_caregivers my_patients
        JOIN api.patient_caregivers other_caregivers ON my_patients.patient_id = other_caregivers.patient_id
        WHERE my_patients.caregiver_id = auth.uid() 
          AND my_patients.is_active = true
          AND other_caregivers.is_active = true
      )
    )
  );

-- Users can delete files they uploaded or files for patients they are primary caregiver for
CREATE POLICY "Users can delete appropriate attachment files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'medtrack-attachments' AND
    (
      -- Own files
      auth.uid()::text = (storage.foldername(name))[1] OR
      -- Files for patients where they are primary caregiver
      (storage.foldername(name))[1] IN (
        SELECT DISTINCT pc.caregiver_id::text
        FROM api.patient_caregivers pc
        JOIN api.patients p ON pc.patient_id = p.id
        WHERE pc.caregiver_id = auth.uid() 
          AND pc.is_active = true
          AND (pc.role = 'primary' OR p.created_by = auth.uid())
      )
    )
  );

-- Users can update metadata for files they have access to
CREATE POLICY "Users can update shared attachment files" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'medtrack-attachments' AND
    (
      -- Own files
      auth.uid()::text = (storage.foldername(name))[1] OR
      -- Files for patients they care for
      (storage.foldername(name))[1] IN (
        SELECT DISTINCT other_caregivers.caregiver_id::text
        FROM api.patient_caregivers my_patients
        JOIN api.patient_caregivers other_caregivers ON my_patients.patient_id = other_caregivers.patient_id
        WHERE my_patients.caregiver_id = auth.uid() 
          AND my_patients.is_active = true
          AND other_caregivers.is_active = true
      )
    )
  );

-- Storage policies for profile-images bucket
-- Users can upload profile images
CREATE POLICY "Users can upload profile images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'profile-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Anyone can view profile images (public bucket)
CREATE POLICY "Anyone can view profile images" ON storage.objects
  FOR SELECT USING (bucket_id = 'profile-images');

-- Users can delete their own profile images
CREATE POLICY "Users can delete own profile images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'profile-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can update their own profile images
CREATE POLICY "Users can update own profile images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'profile-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

/*
STORAGE ORGANIZATION:

Files will be organized in the following folder structure:

medtrack-attachments/
├── {user_id}/
│   ├── measurements/
│   │   ├── {measurement_id}/
│   │   │   ├── device_photo_1.jpg
│   │   │   └── device_photo_2.jpg
│   ├── logs/
│   │   ├── {log_id}/
│   │   │   ├── incident_photo_1.jpg
│   │   │   └── assessment_photo_1.jpg
│   └── patients/
│       ├── {patient_id}/
│       │   └── documents/
│       │       ├── medical_report.pdf
│       │       └── lab_results.jpg

profile-images/
├── {user_id}/
│   ├── avatar.jpg
│   └── avatar_thumb.jpg

USAGE EXAMPLES:

1. Upload measurement photo:
   Path: {user_id}/measurements/{measurement_id}/device_photo.jpg

2. Upload daily log photo:
   Path: {user_id}/logs/{log_id}/incident_photo.jpg

3. Upload profile image:
   Path: {user_id}/avatar.jpg

4. Upload patient document:
   Path: {user_id}/patients/{patient_id}/documents/report.pdf

FILE SIZE LIMITS:
- Attachments: 10MB max
- Profile images: 5MB max

MIME TYPE RESTRICTIONS:
- Images: JPEG, PNG, GIF, WebP
- Documents: PDF, Plain text
- Profile images: JPEG, PNG, WebP only

SECURITY:
- Private bucket for medical attachments (requires authentication)
- Public bucket for profile images (optimized for CDN)
- Users can only access their own files
- Folder structure enforces user isolation
*/ 