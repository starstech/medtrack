# API Requirements for File Upload & Attachment Functionality

## Overview
This document outlines all the API endpoints required to support the file upload and attachment functionality implemented in the MedTrack application.

## Core File Management APIs

### 1. General File Upload
```
POST /files/upload
Content-Type: multipart/form-data
Authorization: Bearer {token}

Body:
- file: File (binary)
- metadata: Object (optional)
  - category: string (image, document, video, etc.)
  - description: string
  - tags: string[]

Response:
{
  id: string,
  filename: string,
  originalName: string,
  mimeType: string,
  size: number,
  url: string,
  metadata: object,
  uploadedAt: string,
  uploadedBy: string
}
```

### 2. File Retrieval
```
GET /files/{fileId}
Authorization: Bearer {token}

Response:
{
  id: string,
  filename: string,
  originalName: string,
  mimeType: string,
  size: number,
  url: string,
  metadata: object,
  uploadedAt: string,
  uploadedBy: string
}
```

### 3. File Download
```
GET /files/{fileId}/download
Authorization: Bearer {token}

Response: File binary data with appropriate headers
```

### 4. File URL (with expiration)
```
GET /files/{fileId}/url?expires=3600
Authorization: Bearer {token}

Response:
{
  url: string,
  expiresAt: string
}
```

### 5. File Deletion
```
DELETE /files/{fileId}
Authorization: Bearer {token}

Response:
{
  success: boolean,
  message: string
}
```

## Measurement-Specific APIs

### 6. Create Measurement with Attachments
```
POST /patients/{patientId}/measurements
Content-Type: application/json
Authorization: Bearer {token}

Body:
{
  type: string,
  value: number,
  unit: string,
  notes: string,
  attachments: Array<{
    uid: string,
    name: string,
    url: string,
    status: "done"
  }>,
  recordedAt: string,
  recordedBy: string
}

Response:
{
  id: string,
  patientId: string,
  type: string,
  value: number,
  unit: string,
  notes: string,
  attachments: Array<FileObject>,
  recordedAt: string,
  recordedBy: string
}
```

### 7. Upload Measurement Image (Alternative approach)
```
POST /measurements/{measurementId}/image
Content-Type: multipart/form-data
Authorization: Bearer {token}

Body:
- file: File (binary)

Response:
{
  id: string,
  measurementId: string,
  filename: string,
  url: string,
  uploadedAt: string
}
```

### 8. Get Patient Measurements (with attachments)
```
GET /patients/{patientId}/measurements?include=attachments
Authorization: Bearer {token}

Response:
[
  {
    id: string,
    type: string,
    value: number,
    unit: string,
    notes: string,
    attachments: Array<FileObject>,
    recordedAt: string,
    recordedBy: string
  }
]
```

## Daily Log APIs

### 9. Create Daily Log with Attachments
```
POST /patients/{patientId}/logs
Content-Type: application/json
Authorization: Bearer {token}

Body:
{
  title: string,
  description: string,
  type: string,
  severity: string,
  tags: string[],
  attachments: Array<{
    uid: string,
    name: string,
    url: string,
    status: "done"
  }>,
  timestamp: string,
  recordedBy: string,
  followUpRequired: boolean
}

Response:
{
  id: string,
  patientId: string,
  title: string,
  description: string,
  type: string,
  severity: string,
  tags: string[],
  attachments: Array<FileObject>,
  timestamp: string,
  recordedBy: string,
  followUpRequired: boolean
}
```

### 10. Add Attachment to Existing Log
```
POST /logs/{logId}/attachments
Content-Type: multipart/form-data
Authorization: Bearer {token}

Body:
- file: File (binary)
- description: string (optional)

Response:
{
  id: string,
  logId: string,
  filename: string,
  url: string,
  description: string,
  uploadedAt: string
}
```

### 11. Get Log Attachments
```
GET /logs/{logId}/attachments
Authorization: Bearer {token}

Response:
[
  {
    id: string,
    logId: string,
    filename: string,
    originalName: string,
    url: string,
    description: string,
    uploadedAt: string,
    uploadedBy: string
  }
]
```

### 12. Delete Log Attachment
```
DELETE /logs/{logId}/attachments/{attachmentId}
Authorization: Bearer {token}

Response:
{
  success: boolean,
  message: string
}
```

### 13. Get Patient Logs (with attachments)
```
GET /patients/{patientId}/logs?include=attachments
Authorization: Bearer {token}

Response:
[
  {
    id: string,
    title: string,
    description: string,
    type: string,
    severity: string,
    tags: string[],
    attachments: Array<FileObject>,
    timestamp: string,
    recordedBy: string,
    followUpRequired: boolean
  }
]
```

## Patient File Management

### 14. Upload Patient File
```
POST /patients/{patientId}/files
Content-Type: multipart/form-data
Authorization: Bearer {token}

Body:
- file: File (binary)
- metadata: Object (optional)

Response:
{
  id: string,
  patientId: string,
  filename: string,
  url: string,
  uploadedAt: string
}
```

## File Metadata Management

### 15. Get File Metadata
```
GET /files/{fileId}/metadata
Authorization: Bearer {token}

Response:
{
  id: string,
  metadata: object,
  tags: string[],
  description: string,
  category: string
}
```

### 16. Update File Metadata
```
PUT /files/{fileId}/metadata
Content-Type: application/json
Authorization: Bearer {token}

Body:
{
  metadata: object,
  tags: string[],
  description: string,
  category: string
}

Response:
{
  success: boolean,
  file: FileObject
}
```

## File Sharing & Permissions

### 17. Get File Sharing Settings
```
GET /files/{fileId}/sharing
Authorization: Bearer {token}

Response:
{
  fileId: string,
  isPublic: boolean,
  sharedWith: Array<{
    userId: string,
    permissions: string,
    sharedAt: string
  }>
}
```

### 18. Share File with Caregiver
```
POST /files/{fileId}/share
Content-Type: application/json
Authorization: Bearer {token}

Body:
{
  caregiverId: string,
  permissions: string (read, write, delete)
}

Response:
{
  success: boolean,
  sharing: SharingObject
}
```

## Storage & Utilities

### 19. Get Storage Usage
```
GET /files/storage/usage
Authorization: Bearer {token}

Response:
{
  totalUsed: number,
  totalLimit: number,
  byCategory: {
    images: number,
    documents: number,
    videos: number
  },
  fileCount: number
}
```

## Error Responses

All endpoints should return appropriate HTTP status codes and error responses:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "File size exceeds maximum allowed size",
    "details": {
      "maxSize": 10485760,
      "actualSize": 15728640
    }
  }
}
```

Common error codes:
- `VALIDATION_ERROR` - File validation failed
- `UNAUTHORIZED` - Invalid or missing authentication
- `FORBIDDEN` - Insufficient permissions
- `NOT_FOUND` - File or resource not found
- `STORAGE_LIMIT_EXCEEDED` - Storage quota exceeded
- `UNSUPPORTED_FILE_TYPE` - File type not allowed

## File Validation Requirements

### File Size Limits
- Images: 10MB maximum
- Documents: 50MB maximum  
- Videos: 100MB maximum
- Default: 25MB maximum

### Allowed File Types
- **Images**: `image/jpeg`, `image/png`, `image/gif`, `image/webp`
- **Documents**: `application/pdf`, `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`, `text/plain`
- **Videos**: `video/mp4`, `video/webm`, `video/ogg`
- **Audio**: `audio/mp3`, `audio/wav`, `audio/ogg`

## Security Considerations

1. **Authentication**: All endpoints require valid Bearer token
2. **Authorization**: Users can only access files they own or have been granted access to
3. **File Scanning**: Uploaded files should be scanned for malware
4. **Content Validation**: Verify file headers match declared MIME types
5. **Rate Limiting**: Implement upload rate limiting per user
6. **Storage Quotas**: Enforce per-user storage limits
7. **Access Logging**: Log all file access and modifications

## Integration Notes

The frontend components expect the following data structure for attachments:

```javascript
{
  uid: string,           // Unique identifier
  name: string,          // Display name
  url: string,           // Access URL
  status: "done",        // Upload status
  size?: number,         // File size in bytes
  type?: string          // MIME type
}
```

When creating measurements or logs, attachments are included in the main request body rather than uploaded separately, allowing for atomic operations. 