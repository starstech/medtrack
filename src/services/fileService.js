// File service for handling uploads, downloads, and attachment management
import apiClient from './api'

export const fileService = {
  // Upload file
  async uploadFile(file, metadata = {}) {
    return apiClient.uploadFile('/files/upload', file, metadata)
  },

  // Upload multiple files
  async uploadMultipleFiles(files, metadata = {}) {
    const uploads = files.map(file => 
      apiClient.uploadFile('/files/upload', file, metadata)
    )
    return Promise.all(uploads)
  },

  // Get file by ID
  async getFile(fileId) {
    return apiClient.get(`/files/${fileId}`)
  },

  // Download file
  async downloadFile(fileId) {
    return apiClient.get(`/files/${fileId}/download`)
  },

  // Get file URL
  async getFileUrl(fileId, expires = 3600) {
    return apiClient.get(`/files/${fileId}/url`, { expires })
  },

  // Delete file
  async deleteFile(fileId) {
    return apiClient.delete(`/files/${fileId}`)
  },

  // Get user files
  async getUserFiles(filters = {}) {
    return apiClient.get('/files', filters)
  },

  // Get patient files
  async getPatientFiles(patientId, filters = {}) {
    return apiClient.get(`/patients/${patientId}/files`, filters)
  },

  // Upload patient file
  async uploadPatientFile(patientId, file, metadata = {}) {
    return apiClient.uploadFile(`/patients/${patientId}/files`, file, metadata)
  },

  // Upload log attachment
  async uploadLogAttachment(logId, file, description = '') {
    return apiClient.uploadFile(`/logs/${logId}/attachments`, file, { description })
  },

  // Upload measurement image
  async uploadMeasurementImage(measurementId, file) {
    return apiClient.uploadFile(`/measurements/${measurementId}/image`, file)
  },

  // Upload medication image
  async uploadMedicationImage(medicationId, file) {
    return apiClient.uploadFile(`/medications/${medicationId}/image`, file)
  },

  // Get file metadata
  async getFileMetadata(fileId) {
    return apiClient.get(`/files/${fileId}/metadata`)
  },

  // Update file metadata
  async updateFileMetadata(fileId, metadata) {
    return apiClient.put(`/files/${fileId}/metadata`, metadata)
  },

  // Get file sharing settings
  async getFileSharing(fileId) {
    return apiClient.get(`/files/${fileId}/sharing`)
  },

  // Update file sharing
  async updateFileSharing(fileId, sharingSettings) {
    return apiClient.put(`/files/${fileId}/sharing`, sharingSettings)
  },

  // Share file with caregiver
  async shareFileWithCaregiver(fileId, caregiverId, permissions = 'read') {
    return apiClient.post(`/files/${fileId}/share`, {
      caregiverId,
      permissions
    })
  },

  // Unshare file
  async unshareFile(fileId, caregiverId) {
    return apiClient.delete(`/files/${fileId}/share/${caregiverId}`)
  },

  // Get file versions
  async getFileVersions(fileId) {
    return apiClient.get(`/files/${fileId}/versions`)
  },

  // Upload new file version
  async uploadFileVersion(fileId, file, versionNotes = '') {
    return apiClient.uploadFile(`/files/${fileId}/versions`, file, { versionNotes })
  },

  // Restore file version
  async restoreFileVersion(fileId, versionId) {
    return apiClient.post(`/files/${fileId}/versions/${versionId}/restore`)
  },

  // Get storage usage
  async getStorageUsage() {
    return apiClient.get('/files/storage/usage')
  },

  // Get file categories
  async getFileCategories() {
    return apiClient.get('/files/categories')
  },

  // Search files
  async searchFiles(query, filters = {}) {
    return apiClient.get('/files/search', { query, ...filters })
  },

  // Get recent files
  async getRecentFiles(limit = 10) {
    return apiClient.get('/files/recent', { limit })
  },

  // Create folder
  async createFolder(name, parentId = null) {
    return apiClient.post('/files/folders', { name, parentId })
  },

  // Get folder contents
  async getFolderContents(folderId) {
    return apiClient.get(`/files/folders/${folderId}/contents`)
  },

  // Move file to folder
  async moveFileToFolder(fileId, folderId) {
    return apiClient.patch(`/files/${fileId}/move`, { folderId })
  },

  // Get file access logs
  async getFileAccessLogs(fileId, limit = 50) {
    return apiClient.get(`/files/${fileId}/access-logs`, { limit })
  }
}

// File validation utilities
export const fileValidation = {
  // Maximum file sizes (in bytes)
  MAX_FILE_SIZES: {
    image: 10 * 1024 * 1024,      // 10MB
    document: 50 * 1024 * 1024,   // 50MB
    video: 100 * 1024 * 1024,     // 100MB
    default: 25 * 1024 * 1024     // 25MB
  },

  // Allowed file types
  ALLOWED_TYPES: {
    image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    document: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ],
    video: ['video/mp4', 'video/webm', 'video/ogg'],
    audio: ['audio/mp3', 'audio/wav', 'audio/ogg']
  },

  // Validate file type
  validateFileType(file, category = 'default') {
    if (!this.ALLOWED_TYPES[category]) {
      return { valid: false, error: 'Invalid file category' }
    }

    if (!this.ALLOWED_TYPES[category].includes(file.type)) {
      return { 
        valid: false, 
        error: `File type ${file.type} not allowed for ${category}` 
      }
    }

    return { valid: true }
  },

  // Validate file size
  validateFileSize(file, category = 'default') {
    const maxSize = this.MAX_FILE_SIZES[category] || this.MAX_FILE_SIZES.default

    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File size exceeds maximum allowed size of ${this.formatFileSize(maxSize)}`
      }
    }

    return { valid: true }
  },

  // Format file size for display
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes'

    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  },

  // Validate file (combines type and size validation)
  validateFile(file, category = 'default') {
    const typeValidation = this.validateFileType(file, category)
    if (!typeValidation.valid) return typeValidation

    const sizeValidation = this.validateFileSize(file, category)
    if (!sizeValidation.valid) return sizeValidation

    return { valid: true }
  }
}

export default fileService 