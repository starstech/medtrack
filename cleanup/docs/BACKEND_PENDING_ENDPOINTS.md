# Backend TODO – Pending Endpoints for Front-End Stubs

This document aggregates **all REST endpoints still missing** from the Express backend that the React front-end currently marks as "not implemented" or "backend endpoint pending". They are grouped by service / feature area with brief notes on purpose and suggested route designs. Implementing these will remove most console warnings and unblock remaining UI work.

> NOTE: All routes assume the common prefix `/api` and require `Authorization: Bearer <jwt>` unless otherwise stated.

---
## 1. Sync & Device Management
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/sync/patient/:patientId` (query: `lastSync`) | Return delta data (medications, doses, measurements, logs) for a single patient. |
| GET | `/sync/all` (query: `lastSync`) | Return full dataset for current user (used in mobile sync/offline mode). **Implemented in backend – but per-patient variant above still missing.** |
| GET | `/sync/status` | Quick ping to return `{ lastSync, status }` for current device. |
| GET | `/sync/pending` | List pending offline operations queued by client (optional). |
| POST | `/sync/bulk` | Accept batch of offline changes created while offline. |
| POST | `/devices` | Register / update mobile device info and push token. |
| DELETE | `/devices/:deviceId` | Unregister device. |
| GET | `/devices` | List registered devices for current user. |

---
## 2. Measurement Extras
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/measurements/stats` (query: `patientId`, `type`, `period`) | Aggregated stats (avg, min, max) for charts. |
| GET | `/measurements/ranges` (query: `patientId`, `type`) | Fetch custom acceptable ranges for alerts. |
| PUT | `/measurements/ranges` | Update custom ranges. Body: `{ patientId, type, min, max }` |
| GET | `/measurements/alerts` (query: `patientId`) | Return measurement-based alert list. |

---
## 3. Medication
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/medications/:id/history` | Full dosage / status change history (currently stubbed). |

---
## 4. Daily Logs
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/patients/:patientId/logs/stats` (query: `period`) | Aggregated counts per log type / severity. |
| GET | `/patients/:patientId/logs/trends` (query: `type`, `period`) | Time-series trend data. |
| POST | `/logs/:id/attachments` | Add attachment to a log entry. |
| GET | `/logs/:id/attachments` | List attachments. |
| DELETE | `/logs/attachments/:attachmentId` | Remove attachment. |
| GET | `/logs/templates` (query: `type`) | Provide log templates for quick entry. |
| POST | `/logs/from-template` | Create a log using template. |
| GET | `/export/logs` | Export logs (CSV, PDF, etc.). |

---
## 5. Files
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/files/:id` | Fetch metadata for a file. |
| DELETE | `/files/:id` | Delete a file (soft-delete). |
| GET | `/files/user` (query: `limit`) | List files uploaded by current user. |
| GET | `/files/patient/:patientId` (query: `limit`) | List files linked to a patient. |

---
## 6. Notifications & Push
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/notifications/read-all` | Mark all notifications as read. |
| GET | `/notifications/unread-count` | Return count of unread notifications. |
| POST | `/push/subscribe` | Register browser/device push subscription. |
| POST | `/push/unsubscribe` | Remove push subscription. |
| POST | `/push/test` | Send a test push to current user. |

(The service also contains admin-level bulk send helpers – defer for now.)

---
## 7. Patient Extras
| Method | Endpoint | Purpose |
|--------|----------|---------|
| PUT | `/patients/:id/caregivers/:caregiverId` | Update caregiver role / relationship. |
| GET | `/patients/:id/stats` | Summary stats (dose adherence %, upcoming appointments, etc.). |
| GET | `/patients/:id/activity` | Recent activity feed (log entries, dose actions). |

---
## 8. Caregiver Management (Extended)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/caregivers/invitations` | List invitations sent *by* current user. |
| GET | `/caregivers/invitations/received` | List invitations *received* by current user (when non-user invited). |
| POST | `/caregivers/invitations/:id/accept` | Accept invite. |
| POST | `/caregivers/invitations/:id/decline` | Decline invite. |
| POST | `/caregivers/invitations/:id/resend` | Resend email. |
| GET | `/caregivers/:id/permissions` | Fetch caregiver-level permissions. |
| PUT | `/caregivers/:id/permissions` | Update permissions. |
| GET | `/caregivers/:id/activity` | Caregiver activity timeline. |
| GET | `/caregivers/shared-patients` | Patients shared with / to current user. |

---
## 9. Dashboard Widgets
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/dashboard/recent-activity` (query: `patientId`, `limit`) | Chronological feed of doses, logs, measurements, etc. |
| GET | `/dashboard/upcoming-doses` (query: `patientId`, `days`) | Next scheduled doses. |

---
## 10. Appointments (Advanced)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/appointments/conflicts` | Check for scheduling conflicts before creating/updating. |
| GET | `/appointments/:id/reminders` | List reminders for an appointment. |
| POST | `/appointments/:id/reminders` | Create reminder. |
| DELETE | `/appointments/:id/reminders/:reminderId` | Cancel reminder. |
| GET | `/appointments/:id/recurring` | Return generated instances for a recurring series. |
| PUT | `/appointments/:id/recurring` | Update recurring series (`updateType=series|future`). |
| DELETE | `/appointments/:id/recurring` | Cancel recurring series (`cancelType=series|future`). |
| GET | `/appointments/availability` (query: `providerId`, `date`, `duration`) | Available time slots lookup. |
| POST | `/appointments/export` | Export appointments (ical/csv) per filters. |
| POST | `/appointments/:id/invitations` | Send email invitations. |

---
## 11. Dashboard Service (mobile/desktop parity)
_(covered by section 9 – added for completeness)_

---
## 12. Miscellaneous Helpers
| Service | Function | Suggested Endpoint |
|---------|----------|--------------------|
| FileService | `getFileAccessLogs` | GET `/files/:id/access-logs` (already spec'd but still stubbed) |
| NotificationService | bulk delete / schedule | POST `/notifications/bulk-delete`, etc. |
| SyncService | conflict resolution helpers | Various endpoints under `/sync/conflicts` (list, resolve). |

---
### Next Steps
1. Backend team confirms route names & payloads, implements controllers and DB queries.
2. Once each endpoint is live, frontend stubs can be replaced with real calls (search for `console.warn('not implemented'...)`).
3. Remove default fallbacks and mock data.

Please keep this doc updated as additional stubs are identified or endpoints go live. 