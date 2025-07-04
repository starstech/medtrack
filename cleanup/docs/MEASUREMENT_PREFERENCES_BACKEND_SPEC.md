# Measurement Preferences – Backend Specification

This document defines the **database schema** and **REST endpoints** required to enable the _measurement preferences & presets_ feature in MedTrack.

The frontend currently contains a `measurementPreferencesService` that works against Supabase tables (`measurement_preferences`, `measurement_presets`).  These tables and endpoints do **not** yet exist in the Node/Express backend, so the service is in a stubbed state.  Implementing the specs below will allow us to finish the migration and remove the remaining Supabase dependency.

---
## 1. Database Schema

### 1.1 `measurement_preferences`
Stores per–patient, per–caregiver visibility & filtering rules for measurement categories and individual measurement types.

| Column                       | Type           | Constraints / Description                                            |
|------------------------------|----------------|----------------------------------------------------------------------|
| `id`                         | `uuid`         | PRIMARY KEY, default `uuid_generate_v4()`                            |
| `patient_id`                 | `uuid`         | NOT NULL, FK → `patients(id)`                                        |
| `user_id`                    | `uuid`         | NOT NULL, FK → `users(id)` (the caregiver who owns these settings)    |
| `vital_signs_enabled`        | `boolean`      | Enable/disable whole Vital-Signs category                            |
| `physical_measurements_enabled` | `boolean`   | Enable/disable whole Physical-Measurements category                  |
| `subjective_measurements_enabled` | `boolean` | Enable/disable whole Subjective-Measurements category                |
| `blood_tests_enabled`        | `boolean`      | Enable/disable Blood-Test category                                   |
| `urine_tests_enabled`        | `boolean`      | Enable/disable Urine-Test category                                   |
| `enabled_measurements`       | `jsonb`        | Fine-grained ON/OFF map for individual measurement types             |
| `preset_name`                | `text`         | Name of preset applied (nullable)                                    |
| `is_custom`                  | `boolean`      | `true` if user modified after preset                                 |
| `created_at`                 | `timestamptz`  | default `now()`                                                      |
| `updated_at`                 | `timestamptz`  | default `now()`, updated via trigger                                 |

**Indexes / Constraints**
1. `UNIQUE (patient_id, user_id)` – a caregiver has at most one preference set per patient.
2. Standard FK indexes on `patient_id`, `user_id`.

---
### 1.2 `measurement_presets`
Curated presets that front-end can present as quick options (e.g. "Comprehensive", "Basic Care").

| Column                             | Type          | Constraints / Description                            |
|------------------------------------|---------------|------------------------------------------------------|
| `id`                               | `uuid`        | PRIMARY KEY, default `uuid_generate_v4()`            |
| `name`                             | `text`        | UNIQUE – snake_case identifier (used by frontend)    |
| `display_name`                     | `text`        | Human-friendly label                                 |
| `description`                      | `text`        | Optional                                             |
| `vital_signs_enabled`              | `boolean`     | Category default flags (same as preferences cols)    |
| `physical_measurements_enabled`    | `boolean`     |                                                      |
| `subjective_measurements_enabled`  | `boolean`     |                                                      |
| `blood_tests_enabled`              | `boolean`     |                                                      |
| `urine_tests_enabled`              | `boolean`     |                                                      |
| `enabled_measurements`             | `jsonb`       | Default fine-grained ON/OFF map                      |
| `target_condition`                 | `text`        | (Optional) Condition this preset is tailored for     |
| `is_default`                       | `boolean`     | Mark default suggestions                             |
| `sort_order`                       | `integer`     | For predictable ordering                             |
| `created_at`                       | `timestamptz` | default `now()`                                      |
| `updated_at`                       | `timestamptz` | default `now()`                                      |

---
## 2. REST API Endpoints

All routes require a valid `Authorization: Bearer <jwt>` header.

| Method | Endpoint                                     | Purpose / Notes                                                   |
|--------|----------------------------------------------|-------------------------------------------------------------------|
| GET    | `/api/measurements/presets`                  | List all presets. (No params.)                                    |
| GET    | `/api/measurements/preferences`              | Get preferences for **current user**. **Query param:** `patientId` (required). Returns defaults if none saved. |
| POST   | `/api/measurements/preferences`              | Create/replace preferences for current user. Body → same shape as response object (see below). Acts as _upsert_. |
| DELETE | `/api/measurements/preferences`              | Delete preferences for current user. **Query param:** `patientId` (required). Returns `{ success: true }`. |
| POST   | `/api/measurements/preferences/apply-preset` | Convenience: apply preset for patient. Body → `{ patientId, presetName }`. Could also be handled client-side via POST above. |

### 2.1 Response Shapes

```jsonc
// GET  /api/measurements/preferences?patientId=...
{
  "preferences": {
    "patientId": "uuid",
    "userId": "uuid",
    "vitalSignsEnabled": true,
    "physicalMeasurementsEnabled": true,
    "subjectiveMeasurementsEnabled": true,
    "bloodTestsEnabled": true,
    "urineTestsEnabled": true,
    "enabledMeasurements": {
      "vital_signs": ["blood_pressure", "heart_rate", ...],
      "physical": ["height", "weight"],
      "subjective": ["mood"],
      "blood_tests": ["cholesterol_total"],
      "urine_tests": ["protein"]
    },
    "presetName": "comprehensive",
    "isCustom": false,
    "createdAt": "2024-06-13T12:00:00Z",
    "updatedAt": "2024-06-13T12:00:00Z"
  }
}
```

```jsonc
// POST /api/measurements/preferences (Upsert)
{
  "patientId": "uuid",
  "vitalSignsEnabled": false,
  "physicalMeasurementsEnabled": true,
  "subjectiveMeasurementsEnabled": false,
  "bloodTestsEnabled": false,
  "urineTestsEnabled": false,
  "enabledMeasurements": {
    "vital_signs": ["blood_pressure", "heart_rate"],
    "physical": ["weight"]
  },
  "presetName": null,
  "isCustom": true
}

// Response => { "preferences": { ...same fields..., "createdAt": ..., "updatedAt": ... } }
```

### 2.2 Error Handling
Return standard JSON errors with `message` and optional `field` details. Use `404` when patient not found/authorized, `400` for validation, `409` for unique-constraint conflicts (shouldn't happen with upsert).

### 2.3 Validation Rules
* `patientId` must reference a patient the caregiver has access to.
* Arrays in `enabledMeasurements` must only contain valid measurement identifiers (use enum list from medical taxonomy table or constant list).

---
## 3. Recommended Implementation Notes
1. **Upsert Logic** – Use `INSERT … ON CONFLICT (patient_id, user_id) DO UPDATE …` for preferences.
2. **Triggers** – Add `updated_at` auto-update trigger on both tables.
3. **Seed Data** – Insert the two presets provided in the frontend:
   * `comprehensive` (all on)
   * `basic_care` (minimal set)
4. **Permissions** – Only caregivers linked via `patient_caregivers` should be allowed to read/write preferences for that patient.
5. **Future** – When we add Firebase push support, we may extend preferences with `notificationSettings` – design JSON columns accordingly.

---
## 4. Outstanding Front-End Work After Backend Delivery
* Replace Supabase calls in `measurementPreferencesService` with the new REST endpoints.
* Remove default/mock data fallbacks.

---
Please review and confirm – once the backend implements the schema and routes above the front-end team will complete the migration. 