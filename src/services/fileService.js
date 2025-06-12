// File service for handling uploads, downloads, and attachment management
import { supabase } from '../lib/supabase'

export const fileService = {
  // Upload file
  async uploadFile(file, metadata = {}) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const fileName = `${Date.now()}_${file.name}`
      const filePath = `${user.id}/uploads/${fileName}`

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('medtrack-files')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // Save file metadata to database
      const { data, error } = await supabase
        .from('files')
        .insert({
          filename: file.name,
          file_path: uploadData.path,
          file_size: file.size,
          mime_type: file.type,
          uploaded_by: user.id,
          metadata: metadata
        })
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error uploading file:', error)
      return { data: null, error: error.message }
    }
  },

  // Upload multiple files
  async uploadMultipleFiles(files, metadata = {}) {
    try {
      const uploads = files.map(file => this.uploadFile(file, metadata))
      const results = await Promise.all(uploads)
      
      const data = results.map(result => result.data).filter(Boolean)
      const errors = results.filter(result => result.error)
      
      return { 
        data, 
        error: errors.length > 0 ? errors.map(e => e.error).join(', ') : null 
      }
    } catch (error) {
      console.error('Error uploading multiple files:', error)
      return { data: null, error: error.message }
    }
  },

  // Get file by ID
  async getFile(fileId) {
    try {
      const { data, error } = await supabase
        .from('files')
        .select('*')
        .eq('id', fileId)
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error fetching file:', error)
      return { data: null, error: error.message }
    }
  },

  // Download file
  async downloadFile(fileId) {
    try {
      const { data: file, error: fileError } = await this.getFile(fileId)
      if (fileError) throw new Error(fileError)

      const { data, error } = await supabase.storage
        .from('medtrack-files')
        .download(file.file_path)

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error downloading file:', error)
      return { data: null, error: error.message }
    }
  },

  // Get file URL
  async getFileUrl(fileId, expires = 3600) {
    try {
      const { data: file, error: fileError } = await this.getFile(fileId)
      if (fileError) throw new Error(fileError)

      const { data, error } = await supabase.storage
        .from('medtrack-files')
        .createSignedUrl(file.file_path, expires)

      if (error) throw error
      return { data: data.signedUrl, error: null }
    } catch (error) {
      console.error('Error getting file URL:', error)
      return { data: null, error: error.message }
    }
  },

  // Delete file
  async deleteFile(fileId) {
    try {
      const { data: file, error: fileError } = await this.getFile(fileId)
      if (fileError) throw new Error(fileError)

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('medtrack-files')
        .remove([file.file_path])

      if (storageError) throw storageError

      // Delete from database
      const { error } = await supabase
        .from('files')
        .delete()
        .eq('id', fileId)

      if (error) throw error
      return { data: true, error: null }
    } catch (error) {
      console.error('Error deleting file:', error)
      return { data: null, error: error.message }
    }
  },

  // Get user files
  async getUserFiles(filters = {}) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      let query = supabase
        .from('files')
        .select('*')
        .eq('uploaded_by', user.id)
        .order('created_at', { ascending: false })

      if (filters.type) {
        query = query.eq('mime_type', filters.type)
      }

      if (filters.limit) {
        query = query.limit(filters.limit)
      }

      const { data, error } = await query

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error fetching user files:', error)
      return { data: null, error: error.message }
    }
  },

  // Get patient files
  async getPatientFiles(patientId, filters = {}) {
    try {
      let query = supabase
        .from('files')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })

      if (filters.type) {
        query = query.eq('mime_type', filters.type)
      }

      if (filters.limit) {
        query = query.limit(filters.limit)
      }

      const { data, error } = await query

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error fetching patient files:', error)
      return { data: null, error: error.message }
    }
  },

  // Upload patient file
  async uploadPatientFile(patientId, file, metadata = {}) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const fileName = `${Date.now()}_${file.name}`
      const filePath = `${user.id}/patients/${patientId}/${fileName}`

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('medtrack-files')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // Save file metadata to database
      const { data, error } = await supabase
        .from('files')
        .insert({
          filename: file.name,
          file_path: uploadData.path,
          file_size: file.size,
          mime_type: file.type,
          uploaded_by: user.id,
          patient_id: patientId,
          metadata: metadata
        })
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error uploading patient file:', error)
      return { data: null, error: error.message }
    }
  },

  // Upload log attachment
  async uploadLogAttachment(logId, file, description = '') {
    return supabase.storage
      .from('medtrack-files')
      .upload(`logs/${logId}/attachments`, file, {
        customMetadata: { description }
      })
  },

  // Upload measurement image
  async uploadMeasurementImage(measurementId, file) {
    return supabase.storage
      .from('medtrack-files')
      .upload(`measurements/${measurementId}/image`, file)
  },

  // Upload medication image
  async uploadMedicationImage(medicationId, file) {
    return supabase.storage
      .from('medtrack-files')
      .upload(`medications/${medicationId}/image`, file)
  },

  // Get file metadata
  async getFileMetadata(fileId) {
    try {
      const { data, error } = await supabase
        .from('files')
        .select('metadata')
        .eq('id', fileId)
        .single()

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
      const { data, error } = await supabase
        .from('files')
        .update({ metadata })
        .eq('id', fileId)
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error updating file metadata:', error)
      return { data: null, error: error.message }
    }
  },

  // Get file sharing settings
  async getFileSharing(fileId) {
    return supabase.from('files').select('sharing').eq('id', fileId).single()
  },

  // Update file sharing
  async updateFileSharing(fileId, sharingSettings) {
    return supabase.from('files').update({ sharing: sharingSettings }).eq('id', fileId).select().single()
  },

  // Share file with caregiver
  async shareFileWithCaregiver(fileId, caregiverId, permissions = 'read') {
    return supabase.from('files').update({ sharing: { ...sharingSettings, [caregiverId]: permissions } }).eq('id', fileId).select().single()
  },

  // Unshare file
  async unshareFile(fileId, caregiverId) {
    return supabase.from('files').update({ sharing: { ...sharingSettings, [caregiverId]: null } }).eq('id', fileId).select().single()
  },

  // Get file versions
  async getFileVersions(fileId) {
    return supabase.from('files').select('versions').eq('id', fileId).single()
  },

  // Upload new file version
  async uploadFileVersion(fileId, file, versionNotes = '') {
    return supabase.from('files').update({ versions: { ...versions, [versionNotes]: file } }).eq('id', fileId).select().single()
  },

  // Restore file version
  async restoreFileVersion(fileId, versionId) {
    return supabase.from('files').update({ versions: { ...versions, [versionId]: file } }).eq('id', fileId).select().single()
  },

  // Get storage usage
  async getStorageUsage() {
    return supabase.from('files').select('file_size').sum('file_size')
  },

  // Get file categories
  async getFileCategories() {
    return supabase.from('files').select('mime_type').group('mime_type')
  },

  // Search files
  async searchFiles(query, filters = {}) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      let supabaseQuery = supabase
        .from('files')
        .select('*')
        .eq('uploaded_by', user.id)
        .ilike('filename', `%${query}%`)
        .order('created_at', { ascending: false })

      if (filters.type) {
        supabaseQuery = supabaseQuery.eq('mime_type', filters.type)
      }

      if (filters.limit) {
        supabaseQuery = supabaseQuery.limit(filters.limit)
      }

      const { data, error } = await supabaseQuery

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
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('files')
        .select('*')
        .eq('uploaded_by', user.id)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error fetching recent files:', error)
      return { data: null, error: error.message }
    }
  },

  // Create folder
  async createFolder(name, parentId = null) {
    return supabase.from('files').insert({ name, parentId }).select().single()
  },

  // Get folder contents
  async getFolderContents(folderId) {
    return supabase.from('files').select('*').eq('parentId', folderId)
  },

  // Move file to folder
  async moveFileToFolder(fileId, folderId) {
    return supabase.from('files').update({ parentId: folderId }).eq('id', fileId).select().single()
  },

  // Get file access logs
  async getFileAccessLogs(fileId, limit = 50) {
    return supabase.from('files').select('access-logs').eq('id', fileId).limit(limit)
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