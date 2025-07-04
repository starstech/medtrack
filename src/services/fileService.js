// File service for handling uploads, downloads, and attachment management
import apiClient from './api'

export const fileService = {
  // Upload file
  async uploadFile(file, metadata = {}) {
    try {
      const response = await apiClient.uploadFile('/files/upload', file, metadata)
      return { data: response, error: null }
    } catch (error) {
      return { data: null, error: error.message }
    }
  },

  // Upload multiple files
  async uploadMultipleFiles(files, metadata = {}) {
    const uploads = files.map(f => this.uploadFile(f, metadata))
    const results = await Promise.all(uploads)
    const data = results.map(r => r.data).filter(Boolean)
    const errors = results.filter(r => r.error)
    return { data, error: errors.length ? errors.map(e => e.error).join(', ') : null }
  },

  // Get file by ID
  async getFile(fileId) {
    try {
      const data = await apiClient.get(`/files/${fileId}`)
      return { data, error: null }
    } catch (error) {
      console.error('Error fetching file:', error)
      return { data: null, error: error.message }
    }
  },

  // Download file => return signed URL and let browser fetch
  async downloadFile(fileId) {
    return this.getFileUrl(fileId).then(res => { if(res.data) window.open(res.data,'_blank'); return res })
  },

  // Get file URL
  async getFileUrl(fileId, expires = 3600) {
    try {
      const { url } = await apiClient.get(`/files/${fileId}/url`, { expires })
      return { data: url, error: null }
    } catch (error) {
      return { data: null, error: error.message }
    }
  },

  // Delete file
  async deleteFile(fileId) {
    try {
      await apiClient.delete(`/files/${fileId}`)
      return { data: true, error: null }
    } catch (error) {
      console.error('Error deleting file:', error)
      return { data: null, error: error.message }
    }
  },

  // Get user files
  async getUserFiles(filters = {}) {
    try {
      const data = await apiClient.get('/files/user', filters)
      return { data, error: null }
    } catch (error) {
      console.error('Error fetching user files:', error)
      return { data: null, error: error.message }
    }
  },

  // Get patient files
  async getPatientFiles(patientId, filters = {}) {
    try {
      const data = await apiClient.get(`/files/patient/${patientId}`, filters)
      return { data, error: null }
    } catch (error) {
      console.error('Error fetching patient files:', error)
      return { data: null, error: error.message }
    }
  },

  // Upload patient file
  async uploadPatientFile(patientId, file, metadata = {}) {
    return this.uploadFile(file, { patientId, ...metadata })
  },

  // Upload log attachment
  async uploadLogAttachment(logId, file, description = '') {
    return apiClient.uploadFile(`/logs/${logId}/attachments`, file, { customMetadata: { description } })
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
    try {
      const { data, error } = await apiClient.get(`/files/${fileId}/metadata`)
      if (error) throw error
      return { data: data.metadata || {}, error: null }
    } catch (error) {
      console.error('Error fetching file metadata:', error)
      return { data: null, error: error.message }
    }
  },

  // Update file metadata
  async updateFileMetadata(fileId, metadata) {
    try {
      const { data, error } = await apiClient.put(`/files/${fileId}/metadata`, { metadata })
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error updating file metadata:', error)
      return { data: null, error: error.message }
    }
  },

  // Get file sharing settings
  async getFileSharing(fileId) {
    return apiClient.get(`/files/${fileId}/sharing`)
  },

  // Update file sharing
  async updateFileSharing(fileId, sharingSettings) {
    return apiClient.put(`/files/${fileId}/sharing`, { sharing: sharingSettings })
  },

  // Share file with caregiver
  async shareFileWithCaregiver(fileId, caregiverId, permissions = 'read') {
    return apiClient.put(`/files/${fileId}/sharing`, { sharing: { ...sharingSettings, [caregiverId]: permissions } })
  },

  // Unshare file
  async unshareFile(fileId, caregiverId) {
    return apiClient.put(`/files/${fileId}/sharing`, { sharing: { ...sharingSettings, [caregiverId]: null } })
  },

  // Get file versions
  async getFileVersions(fileId) {
    return apiClient.get(`/files/${fileId}/versions`)
  },

  // Upload new file version
  async uploadFileVersion(fileId, file, versionNotes = '') {
    return apiClient.put(`/files/${fileId}/versions`, { versions: { ...versions, [versionNotes]: file } })
  },

  // Restore file version
  async restoreFileVersion(fileId, versionId) {
    return apiClient.put(`/files/${fileId}/versions`, { versions: { ...versions, [versionId]: file } })
  },

  // Get storage usage
  async getStorageUsage() {
    return apiClient.get('/files/storage-usage')
  },

  // Get file categories
  async getFileCategories() {
    return apiClient.get('/files/categories')
  },

  // Search files
  async searchFiles(query, filters = {}) {
    try {
      const { data: { user } } = await apiClient.getUser()
      if (!user) throw new Error('User not authenticated')

      let apiClientQuery = apiClient.get('/files')
        .query({
          eq: {
            uploaded_by: user.id,
            filename: { ilike: `%${query}%` }
          },
          order: { created_at: { ascending: false } }
        })

      if (filters.type) {
        apiClientQuery = apiClientQuery.query({ eq: { mime_type: filters.type } })
      }

      if (filters.limit) {
        apiClientQuery = apiClientQuery.query({ limit: filters.limit })
      }

      const { data, error } = await apiClientQuery

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error searching files:', error)
      return { data: null, error: error.message }
    }
  },

  // Get recent files
  async getRecentFiles(limit = 10) {
    try {
      const { data: { user } } = await apiClient.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await apiClient
        .get('/files')
        .query({
          eq: {
            uploaded_by: user.id,
            created_at: { ascending: false }
          },
          limit: limit
        })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error fetching recent files:', error)
      return { data: null, error: error.message }
    }
  },

  // Create folder
  async createFolder(name, parentId = null) {
    return apiClient.post('/files', { name, parentId })
  },

  // Get folder contents
  async getFolderContents(folderId) {
    return apiClient.get('/files').query({ eq: { parentId: folderId } })
  },

  // Move file to folder
  async moveFileToFolder(fileId, folderId) {
    return apiClient.put(`/files/${fileId}/parent`, { parentId: folderId })
  },

  // Get file access logs
  async getFileAccessLogs(fileId, limit = 50) {
    try {
      const data = await apiClient.get(`/files/${fileId}/access-logs`, { limit })
      return { data, error: null }
    } catch (error) {
      return { data: null, error: error.message }
    }
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