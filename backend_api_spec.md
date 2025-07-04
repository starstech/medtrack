# MedTrack Backend API Integration Guide

This document is auto-generated from the backend implementation and is the definitive source for frontend-backend integration. It covers every API endpoint, required headers, request/response structure, error cases, and integration notes. Use this as your contract for all frontend work.

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

### POST `/api/auth/register`
**Purpose:** Register a new user (Supabase)

**Headers:** None

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "StrongPassword123!",
  "name": "John Doe"
}
```
**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "caregiver"
  },
  "requiresVerification": true
}
```
**Error Cases:**
- Email already registered → 409 Conflict
- Weak password → 400 Bad Request
- Invalid email → 400 Bad Request

**Notes:** Uses Supabase Auth API for user creation and email verification. Rate limits registration attempts.

---

### POST `/api/auth/login`
**Purpose:** Authenticate user and issue JWT (Supabase)

**Headers:** None

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "StrongPassword123!"
}
```
**Response:**
```json
{
  "user": { "id": "uuid", "email": "user@example.com", "name": "John Doe", "role": "caregiver" },
  "token": "jwt-token"
}
```
**Error Cases:**
- Invalid credentials → 401 Unauthorized
- Unverified email → 403 Forbidden, with message

**Notes:** Uses Supabase Auth sign-in. Rate limits login attempts, logs suspicious activity.

---

### POST `/api/auth/logout`
**Purpose:** Invalidate user session (Supabase)

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{ "success": true }
```
**Error Cases:**
- Expired/invalid token → 401 Unauthorized

**Notes:** Uses Supabase Auth sign-out.

---

### POST `/api/auth/refresh`
**Purpose:** Refresh JWT using refresh token (Supabase)

**Request Body:**
```json
{ "refreshToken": "..." }
```
**Response:**
```json
{ "token": "new-jwt-token" }
```
**Error Cases:**
- Invalid/expired refresh token → 401 Unauthorized

**Notes:** Uses Supabase Auth refresh.

---

### GET `/api/auth/profile`
**Purpose:** Get current user profile

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "avatar_url": "https://...",
  "role": "caregiver",
  "created_at": "2024-06-13T12:00:00Z"
}
```
**Error Cases:**
- Expired/invalid token → 401 Unauthorized

---

### PUT `/api/auth/profile`
**Purpose:** Update user profile

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{ "name": "Jane Doe", "avatar_url": "https://..." }
```
**Response:**
```json
{ "user": { ...updated fields... } }
```
**Error Cases:**
- Invalid input → 400 Bad Request

---

### POST `/api/auth/verify-email`
**Purpose:** Verify email with token (Supabase)

**Request Body:**
```json
{ "token": "..." }
```
**Response:**
```json
{ "success": true }
```
**Error Cases:**
- Invalid/expired token → 400 Bad Request

---

### POST `/api/auth/resend-verification`
**Purpose:** Resend verification email (Supabase)

**Request Body:**
```json
{ "email": "user@example.com" }
```
**Response:**
```json
{ "success": true }
```
**Error Cases:**
- Email not found → 404 Not Found

---

### POST `/api/auth/reset-password`
**Purpose:** Send password reset email (Supabase)

**Request Body:**
```json
{ "email": "user@example.com" }
```
**Response:**
```json
{ "success": true }
```
**Error Cases:**
- Email not found → 404 Not Found

---

### POST `/api/auth/update-password`
**Purpose:** Update password (Supabase)

**Headers:** `Authorization: Bearer <token>` or token in body

**Request Body:**
```json
{ "password": "NewStrongPassword123!" }
```
**Response:**
```json
{ "success": true }
```
**Error Cases:**
- Invalid/expired token → 401 Unauthorized

---

## 2. Patient Management

### GET `/api/patients`
**Purpose:** List all patients accessible to the current user (caregiver)

**Headers:** `Authorization: Bearer <token>`

**Query:** `?search=...&conditions=...&age=...&page=1&pageSize=20`

**Response:**
```json
{
  "patients": [
    { "id": "uuid", "name": "Jane Smith", "dob": "2010-01-01", "gender": "female", ... },
    ...
  ],
  "total": 42,
  "page": 1,
  "pageSize": 20
}
```
**Error Cases:**
- No patients found → empty array
- Invalid query params → 400 Bad Request

**Notes:** Only returns patients the user is authorized to view. Supports pagination and filtering.

---

### POST `/api/patients`
**Purpose:** Create a new patient profile

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "Jane Smith",
  "dob": "2010-01-01",
  "gender": "female",
  "allergies": ["penicillin"],
  "medical_conditions": ["asthma"],
  "emergency_contact": { "name": "John Smith", "phone": "+1234567890", "relationship": "parent" }
}
```
**Response:**
```json
{
  "patient": { "id": "uuid", ... }
}
```
**Error Cases:**
- Duplicate patient (same name/dob) → 409 Conflict
- Invalid input → 400 Bad Request

**Notes:** Only authenticated users can create patients. Emergency contact required.

---

### GET `/api/patients/:id`
**Purpose:** Get a single patient profile and caregivers

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "patient": { "id": "uuid", ... },
  "caregivers": [ { "id": "uuid", "name": "...", "role": "primary" }, ... ]
}
```
**Error Cases:**
- Not found or not authorized → 404 Not Found

**Notes:** Only caregivers assigned to patient can view.

---

### PUT `/api/patients/:id`
**Purpose:** Update patient profile

**Headers:** `Authorization: Bearer <token>`

**Request Body:** `{ ...fields }`

**Response:**
```json
{ "patient": { ...updated fields... } }
```
**Error Cases:**
- Not found or not authorized → 404 Not Found

**Notes:** Only authorized caregivers can update. Changes are audited.

---

### DELETE `/api/patients/:id`
**Purpose:** Delete patient profile

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{ "success": true }
```
**Error Cases:**
- Not found or not authorized → 404 Not Found

**Notes:** Only primary caregiver or admin can delete. Soft delete or cascade delete in DB.

---

### GET `/api/patients/:id/caregivers`
**Purpose:** List caregivers for a patient

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
[
  { "id": "uuid", "name": "...", "email": "...", "role": "primary" },
  ...
]
```
**Error Cases:**
- Not found or not authorized → 404 Not Found

**Notes:** Only assigned caregivers can view.

---

### POST `/api/patients/:id/caregivers`
**Purpose:** Add a caregiver to a patient

**Headers:** `Authorization: Bearer <token>`

**Request Body:** `{ "caregiver_id": "uuid", "role": "secondary" }`

**Response:**
```json
{ "success": true }
```
**Error Cases:**
- Already assigned → 409 Conflict

**Notes:** Only primary caregiver or admin can add.

---

### DELETE `/api/patients/:patientId/caregivers/:caregiverId`
**Purpose:** Remove a caregiver from a patient

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{ "success": true }
```
**Error Cases:**
- Not found or not authorized → 404 Not Found

**Notes:** Only primary caregiver or admin can remove.

---

### GET `/api/patients/search`
**Purpose:** Search patients by name, condition, or age

**Headers:** `Authorization: Bearer <token>`

**Query:** `?query=...&conditions=...&age=...`

**Response:**
```json
[
  { "id": "uuid", "name": "...", ... },
  ...
]
```
**Error Cases:**
- No results → empty array

**Notes:** Uses Postgres full-text search. Only returns authorized patients.

---

## 3. Medication Management

### GET `/api/patients/:patientId/medications`
**Purpose:** List all medications for a patient

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
[
  { "id": "uuid", "name": "Aspirin", "dosage": "100mg", "form": "tablet", "frequency": "once_daily", ... },
  ...
]
```
**Error Cases:**
- No medications → empty array

**Notes:** Only caregivers for patient can view.

---

### POST `/api/patients/:patientId/medications`
**Purpose:** Add a new medication for a patient

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "Aspirin",
  "dosage": "100mg",
  "form": "tablet",
  "frequency": "once_daily",
  "instructions": "Take with food",
  "prescribed_by": "Dr. Smith",
  "start_date": "2024-06-01",
  "end_date": "2024-06-30"
}
```
**Response:**
```json
{
  "medication": { "id": "uuid", ... }
}
```
**Error Cases:**
- Duplicate medication (same name/dates) → 409 Conflict
- Invalid input → 400 Bad Request

**Notes:** Only authorized caregivers can add. Dates must be valid.

---

### GET `/api/medications/:id`
**Purpose:** Get a single medication

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{ "medication": { ... } }
```
**Error Cases:**
- Not found or not authorized → 404 Not Found

**Notes:** Only authorized caregivers can view.

---

### PUT `/api/medications/:id`
**Purpose:** Update a medication

**Headers:** `Authorization: Bearer <token>`

**Request Body:** `{ ...fields }`

**Response:**
```json
{ "medication": { ...updated fields... } }
```
**Error Cases:**
- Not found or not authorized → 404 Not Found

**Notes:** Only authorized caregivers can update.

---

### DELETE `/api/medications/:id`
**Purpose:** Delete (soft) a medication

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{ "success": true }
```
**Error Cases:**
- Not found or not authorized → 404 Not Found

**Notes:** Only authorized caregivers can delete. Sets `is_active=false`.

---

### GET `/api/medications/:id/schedule`
**Purpose:** Get medication schedule

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{ "schedule": { ... } }
```
**Error Cases:**
- Not found or not authorized → 404 Not Found

**Notes:** Only authorized caregivers can view.

---

### PUT `/api/medications/:id/schedule`
**Purpose:** Update medication schedule

**Headers:** `Authorization: Bearer <token>`

**Request Body:** `{ "schedule": { ... } }`

**Response:**
```json
{ "medication": { ...updated fields... } }
```
**Error Cases:**
- Not found or not authorized → 404 Not Found

**Notes:** Only authorized caregivers can update. Schedule must be valid JSON.

---

### GET `/api/medications/:id/history`
**Purpose:** Get medication history

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{ "history": [ ... ] }
```
**Error Cases:**
- Not found or not authorized → 404 Not Found

**Notes:** Returns all doses and status changes for the medication.

---

### GET `/api/medications/:id/adherence`
**Purpose:** Get medication adherence data

**Headers:** `Authorization: Bearer <token>`

**Query:** `?period=30`

**Response:**
```json
{ "adherence": { ... } }
```
**Error Cases:**
- Not found or not authorized → 404 Not Found

**Notes:** Calculates adherence from doses. Only authorized caregivers can view.

---

## 4. Dose Management

### GET `/api/patients/:patientId/doses`
**Purpose:** List all doses for a patient

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
[
  { "id": "uuid", "medication_id": "uuid", "scheduled_time": "2024-06-13T08:00:00Z", "status": "pending", ... },
  ...
]
```
**Error Cases:**
- No doses → empty array

**Notes:** Only caregivers for patient can view.

---

### POST `/api/doses/:id/mark`
**Purpose:** Mark a dose as taken, missed, or skipped

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{ "status": "taken", "notes": "Patient took dose late" }
```
**Response:**
```json
{ "dose": { ...updated fields... } }
```
**Error Cases:**
- Not found or not authorized → 404 Not Found

**Notes:** Only authorized caregivers can mark. Status must be one of [taken, missed, skipped].

---

### GET `/api/doses/today`
**Purpose:** List all doses scheduled for today for the current user

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
[ ... ]
```
**Error Cases:**
- No doses → empty array

**Notes:** Only authorized caregivers can view. Returns today's doses for all their patients.

---

## 5. Measurement Management

### GET `/api/patients/:patientId/measurements`
**Purpose:** List all measurements for a patient

**Headers:** `Authorization: Bearer <token>`

**Query:** `?type=...&period=...&startDate=...&endDate=...&limit=100`

**Response:**
```json
[
  { "id": "uuid", "type": "blood_pressure", "value": 120, "recordedAt": "2024-06-13T08:00:00Z", ... },
  ...
]
```
**Error Cases:**
- No measurements → empty array

**Notes:** Only caregivers for patient can view. Supports filtering by type/date.

---

### POST `/api/patients/:patientId/measurements`
**Purpose:** Add a new measurement for a patient

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "type": "blood_pressure",
  "value": 120,
  "recordedAt": "2024-06-13T08:00:00Z",
  "notes": "Morning reading",
  "attachments": ["fileId1", "fileId2"]
}
```
**Response:**
```json
{
  "measurement": { "id": "uuid", ... }
}
```
**Error Cases:**
- Invalid type/value → 400 Bad Request

**Notes:** Only authorized caregivers can add. Attachments are optional.

---

### PUT `/api/measurements/:id`
**Purpose:** Update a measurement

**Headers:** `Authorization: Bearer <token>`

**Request Body:** `{ ...fields }`

**Response:**
```json
{ "measurement": { ...updated fields... } }
```
**Error Cases:**
- Not found or not authorized → 404 Not Found

**Notes:** Only authorized caregivers can update.

---

### DELETE `/api/measurements/:id`
**Purpose:** Delete a measurement

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{ "success": true }
```
**Error Cases:**
- Not found or not authorized → 404 Not Found

**Notes:** Only authorized caregivers can delete.

---

### GET `/api/measurements/presets`
**Purpose:** List available measurement presets

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
[
  { "name": "comprehensive", "settings": { ... } },
  ...
]
```
**Error Cases:**
- No presets → empty array

**Notes:** Only authenticated users can view.

---

### POST `/api/measurements/preferences`
**Purpose:** Set measurement preferences for a patient

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "patientId": "uuid",
  "preferences": { ... }
}
```
**Response:**
```json
{ "preferences": { ... } }
```
**Error Cases:**
- Invalid input → 400 Bad Request

**Notes:** Only authorized caregivers can set. Preferences object must match schema.

---

### GET `/api/measurements/preferences?patientId=...`
**Purpose:** Get measurement preferences for a patient

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{ "preferences": { ... } }
```
**Error Cases:**
- Not found → return default

**Notes:** Only authorized caregivers can view.

---

## 6. Daily Logs

### GET `/api/patients/:patientId/logs`
**Purpose:** List all daily logs for a patient

**Headers:** `Authorization: Bearer <token>`

**Query:** `?type=...&severity=...&startDate=...&endDate=...&limit=100`

**Response:**
```json
[
  { "id": "uuid", "type": "incident", "value": "Fell in bathroom", "recordedAt": "2024-06-13T08:00:00Z", ... },
  ...
]
```
**Error Cases:**
- No logs → empty array

**Notes:** Only caregivers for patient can view. Supports filtering by type/severity/date.

---

### POST `/api/patients/:patientId/logs`
**Purpose:** Add a new daily log for a patient

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "type": "incident",
  "value": "Fell in bathroom",
  "recordedAt": "2024-06-13T08:00:00Z",
  "notes": "No injury",
  "attachments": ["fileId1"]
}
```
**Response:**
```json
{
  "log": { "id": "uuid", ... }
}
```
**Error Cases:**
- Invalid input → 400 Bad Request

**Notes:** Only authorized caregivers can add. Attachments are optional.

---

### PUT `/api/logs/:id`
**Purpose:** Update a daily log

**Headers:** `Authorization: Bearer <token>`

**Request Body:** `{ ...fields }`

**Response:**
```json
{ "log": { ...updated fields... } }
```
**Error Cases:**
- Not found or not authorized → 404 Not Found

**Notes:** Only authorized caregivers can update.

---

### DELETE `/api/logs/:id`
**Purpose:** Delete a daily log

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{ "success": true }
```
**Error Cases:**
- Not found or not authorized → 404 Not Found

**Notes:** Only authorized caregivers can delete.

---

### GET `/api/patients/:patientId/logs/stats`
**Purpose:** Get statistics for daily logs

**Headers:** `Authorization: Bearer <token>`

**Query:** `?period=30`

**Response:**
```json
{ "stats": { ... } }
```
**Error Cases:**
- No data → empty stats

**Notes:** Only caregivers for patient can view. Aggregates daily_logs table.

---

### GET `/api/patients/:patientId/logs/trends`
**Purpose:** Get trends for daily logs

**Headers:** `Authorization: Bearer <token>`

**Query:** `?type=...&period=30`

**Response:**
```json
{ "trends": { ... } }
```
**Error Cases:**
- No data → empty trends

**Notes:** Only caregivers for patient can view. Aggregates daily_logs table.

---

### GET `/api/logs/templates`
**Purpose:** List available log templates

**Headers:** `Authorization: Bearer <token>`

**Query:** `?type=...`

**Response:**
```json
[ ... ]
```
**Error Cases:**
- No templates → empty array

**Notes:** Only authenticated users can view.

---

## 7. Appointments

### GET `/api/appointments`
**Purpose:** List all appointments for the current user

**Headers:** `Authorization: Bearer <token>`

**Query:** `?patientId=...&type=...&status=...&startDate=...&endDate=...&limit=100`

**Response:**
```json
[
  { "id": "uuid", "title": "Checkup", "dateTime": "2024-06-13T10:00:00Z", "duration": 30, ... },
  ...
]
```
**Error Cases:**
- No appointments → empty array

**Notes:** Only authorized users can view. Supports filtering by patient, type, status, and date.

---

### POST `/api/appointments`
**Purpose:** Create a new appointment

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "Checkup",
  "doctor": "Dr. Smith",
  "dateTime": "2024-06-13T10:00:00Z",
  "duration": 30,
  "location": "Clinic",
  "address": "123 Main St",
  "type": "medical",
  "notes": "Bring previous reports",
  "reminders": ["24_hours", "1_hour"],
  "patientId": "uuid"
}
```
**Response:**
```json
{
  "appointment": { "id": "uuid", ... }
}
```
**Error Cases:**
- Overlapping/conflicting appointment → 409 Conflict
- Invalid input → 400 Bad Request

**Notes:** Only authorized users can create. Checks for conflicts.

---

### GET `/api/appointments/:id`
**Purpose:** Get a single appointment

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{ "appointment": { ... } }
```
**Error Cases:**
- Not found or not authorized → 404 Not Found

**Notes:** Only authorized users can view.

---

### PUT `/api/appointments/:id`
**Purpose:** Update an appointment

**Headers:** `Authorization: Bearer <token>`

**Request Body:** `{ ...fields }`

**Response:**
```json
{ "appointment": { ...updated fields... } }
```
**Error Cases:**
- Not found or not authorized → 404 Not Found

**Notes:** Only authorized users can update.

---

### DELETE `/api/appointments/:id`
**Purpose:** Delete an appointment

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{ "success": true }
```
**Error Cases:**
- Not found or not authorized → 404 Not Found

**Notes:** Only authorized users can delete.

---

### GET `/api/appointments/upcoming`
**Purpose:** List upcoming appointments

**Headers:** `Authorization: Bearer <token>`

**Query:** `?days=7&patientId=...`

**Response:**
```json
[ ... ]
```
**Error Cases:**
- No appointments → empty array

**Notes:** Only authorized users can view. Returns appointments for the next N days.

---

### GET `/api/appointments/stats`
**Purpose:** Get appointment statistics

**Headers:** `Authorization: Bearer <token>`

**Query:** `?patientId=...&period=30`

**Response:**
```json
{ "stats": { ... } }
```
**Error Cases:**
- No data → empty stats

**Notes:** Only authorized users can view. Aggregates appointments table.

---

## 8. Caregiver Management

### GET `/api/caregivers`
**Purpose:** List all caregivers for the current user

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
[
  { "id": "uuid", "name": "...", "email": "...", "role": "primary", ... },
  ...
]
```
**Error Cases:**
- No caregivers → empty array

**Notes:** Only authenticated users can view. Returns caregivers linked to the user.

---

### POST `/api/caregivers/invite`
**Purpose:** Invite a new caregiver to a patient

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "email": "caregiver@example.com",
  "patientId": "uuid",
  "role": "secondary"
}
```
**Response:**
```json
{
  "invitation": { "id": "uuid", ... }
}
```
**Error Cases:**
- Already invited/assigned → 409 Conflict

**Notes:** Only authorized users can invite. Sends email invitation.

---

### DELETE `/api/caregivers/:id`
**Purpose:** Remove a caregiver from all patients

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{ "success": true }
```
**Error Cases:**
- Not found or not authorized → 404 Not Found

**Notes:** Only authorized users can remove. Removes from all patient_caregivers and invitations.

---

### POST `/api/caregivers/accept/:token`
**Purpose:** Accept a caregiver invitation

**Request Body:**
```json
{ "token": "..." }
```
**Response:**
```json
{ "success": true }
```
**Error Cases:**
- Invalid/expired token → 400 Bad Request

**Notes:** Token must be single-use and time-limited. Marks invitation as accepted.

---

## 9. Notifications

### GET `/api/notifications`
**Purpose:** List notifications for the current user

**Headers:** `Authorization: Bearer <token>`

**Query:** `?limit=50`

**Response:**
```json
[
  { "id": "uuid", "type": "medication_reminder", "title": "Take Aspirin", "message": "It's time for your dose.", "read": false, "timestamp": "2024-06-13T08:00:00Z", ... },
  ...
]
```
**Error Cases:**
- No notifications → empty array

**Notes:** Only authenticated users can view. Combines DB and push notifications.

---

### POST `/api/notifications/:id/read`
**Purpose:** Mark a notification as read

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{ "success": true }
```
**Error Cases:**
- Not found or not authorized → 404 Not Found

**Notes:** Only owner can mark as read.

---

### GET `/api/notifications/preferences`
**Purpose:** Get notification preferences

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{ "preferences": { ... } }
```
**Error Cases:**
- Not found → return default

**Notes:** Only owner can view.

---

### POST `/api/notifications/preferences`
**Purpose:** Set notification preferences

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{ "preferences": { ... } }
```
**Response:**
```json
{ "preferences": { ... } }
```
**Error Cases:**
- Invalid input → 400 Bad Request

**Notes:** Only owner can set. Preferences object must match schema.

---

## 10. File Uploads

### POST `/api/files/upload`
**Purpose:** Upload a file (image, document, etc.)

**Headers:** `Authorization: Bearer <token>`

**FormData:** `file`, `patientId`, `type`, ...

**Validation:**
- `file`: required, max size 10MB, allowed types (jpg, png, pdf, ...)
- `patientId`: required, uuid
- `type`: required, enum [measurement, log, ...]

**Response:**
```json
{
  "fileId": "uuid",
  "url": "https://wasabi-bucket/..."
}
```
**Error Cases:**
- Invalid file/type → 400 Bad Request

**Notes:** Uploads to Wasabi, stores metadata in DB, returns signed URL. Only authorized users can upload. Virus scan files.

---

### GET `/api/files/:id/url`
**Purpose:** Get a signed URL for a file

**Headers:** `Authorization: Bearer <token>`

**Query:** `?expires=3600`

**Response:**
```json
{ "url": "https://wasabi-bucket/..." }
```
**Error Cases:**
- Not found or not authorized → 404 Not Found

**Notes:** Generates signed URL from Wasabi. Only authorized users can access.

---

### GET `/api/files/:id/access-logs`
**Purpose:** Get file access logs

**Headers:** `Authorization: Bearer <token>`

**Query:** `?limit=50`

**Response:**
```json
[ ... ]
```
**Error Cases:**
- No logs → empty array

**Notes:** Only authorized users can view. Queries file access logs table.

---

## 11. Dashboard & Analytics

### GET `/api/dashboard/medication-overview`
**Purpose:** Get medication overview for dashboard

**Headers:** `Authorization: Bearer <token>`

**Query:** `?patientId=...`

**Response:**
```json
{ ... }
```
**Error Cases:**
- No data → empty object

**Notes:** Aggregates medications/doses for dashboard. Only authorized users can view.

---

### GET `/api/dashboard/alerts`
**Purpose:** Get dashboard alerts

**Headers:** `Authorization: Bearer <token>`

**Query:** `?patientId=...`

**Response:**
```json
{ ... }
```
**Error Cases:**
- No alerts → empty object

**Notes:** Aggregates alerts from various tables. Only authorized users can view.

---

### GET `/api/dashboard/quick-stats`
**Purpose:** Get quick stats for dashboard

**Headers:** `Authorization: Bearer <token>`

**Query:** `?patientId=...`

**Response:**
```json
{ ... }
```
**Error Cases:**
- No data → empty object

**Notes:** Aggregates stats from various tables. Only authorized users can view.

---

### GET `/api/dashboard/adherence-trends`
**Purpose:** Get adherence trends for dashboard

**Headers:** `Authorization: Bearer <token>`

**Query:** `?patientId=...&period=30`

**Response:**
```json
{ ... }
```
**Error Cases:**
- No data → empty object

**Notes:** Aggregates adherence from doses/medications. Only authorized users can view.

---

### GET `/api/dashboard/upcoming-events`
**Purpose:** Get upcoming events for dashboard

**Headers:** `Authorization: Bearer <token>`

**Query:** `?patientId=...&days=7`

**Response:**
```json
{ ... }
```
**Error Cases:**
- No events → empty object

**Notes:** Aggregates from appointments/doses. Only authorized users can view.

---

### GET `/api/dashboard/health-metrics`
**Purpose:** Get health metrics summary for dashboard

**Headers:** `Authorization: Bearer <token>`

**Query:** `?patientId=...&period=30`

**Response:**
```json
{ ... }
```
**Error Cases:**
- No data → empty object

**Notes:** Aggregates from measurements. Only authorized users can view.

---

### GET `/api/dashboard/care-team-activity`
**Purpose:** Get care team activity for dashboard

**Headers:** `Authorization: Bearer <token>`

**Query:** `?patientId=...&limit=5`

**Response:**
```json
{ ... }
```
**Error Cases:**
- No activity → empty object

**Notes:** Aggregates from patient_caregivers/logs. Only authorized users can view.

---

### GET `/api/dashboard/critical-alerts`
**Purpose:** Get critical alerts for dashboard

**Headers:** `Authorization: Bearer <token>`

**Query:** `?patientId=...`

**Response:**
```json
{ ... }
```
**Error Cases:**
- No alerts → empty object

**Notes:** Aggregates from alerts/notifications. Only authorized users can view.

---

## 12. Sync & Export

### GET `/api/sync/all`
**Purpose:** Get all user data for sync

**Headers:** `Authorization: Bearer <token>`

**Query:** `?lastSync=...`

**Response:**
```json
{
  "patients": [ ... ],
  "medications": [ ... ],
  "doses": [ ... ],
  "measurements": [ ... ],
  "daily_logs": [ ... ],
  "notifications": [ ... ]
}
```
**Error Cases:**
- No data → empty arrays

**Notes:** Queries all relevant tables, filters by user and lastSync. Only authorized users can sync.

---

### GET `/api/export/appointments`
**Purpose:** Export appointments (e.g., iCal)

**Headers:** `Authorization: Bearer <token>`

**Query:** `?format=ical&...`

**Response:**
- File download or URL

**Error Cases:**
- No appointments → empty file

**Notes:** Generates export from appointments table. Only authorized users can export.

---

## 13. Miscellaneous

### GET `/api/measurements/availability?patientId=...`
**Purpose:** Get measurement availability for a patient

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{ "categories": { ... }, "measurements": { ... } }
```
**Error Cases:**
- Not found → return default

**Notes:** Queries measurement_preferences and presets. Only authorized caregivers can view.

---

### GET `/api/logs/templates`
**Purpose:** List available log templates

**Headers:** `Authorization: Bearer <token>`

**Query:** `?type=...`

**Response:**
```json
[ ... ]
```
**Error Cases:**
- No templates → empty array

**Notes:** Only authenticated users can view.

---

# End of API Integration Guide

--- 