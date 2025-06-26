import React from 'react'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FileUpload, { MeasurementImageUpload, LogAttachmentUpload, CompactFileUpload } from '@/components/common/FileUpload'
import { fileValidation } from '@/services/fileService'

// Mock file service
vi.mock('@/services/fileService', () => ({
  fileValidation: {
    validateFile: vi.fn(() => ({ valid: true }))
  }
}))

// Mock Ant Design message
vi.mock('antd', async () => {
  const actual = await vi.importActual('antd')
  return {
    ...actual,
    message: {
      error: vi.fn(),
      success: vi.fn()
    }
  }
})

// Mock URL.createObjectURL
global.URL.createObjectURL = vi.fn(() => 'mock-url')

const createMockFile = (name = 'test.jpg', type = 'image/jpeg', size = 1024) => {
  const file = new File(['dummy content'], name, { type })
  Object.defineProperty(file, 'size', { value: size })
  return file
}

describe('FileUpload Component', () => {
  const mockOnChange = vi.fn()
  const defaultProps = {
    value: [],
    onChange: mockOnChange,
    maxFiles: 3,
    accept: 'image/*',
    category: 'image'
  }

  beforeEach(() => {
    vi.clearAllMocks()
    global.URL.createObjectURL.mockReturnValue('mock-url')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Basic Functionality', () => {
    it('renders upload component with default props', () => {
      render(<FileUpload {...defaultProps} />)
      
      expect(screen.getByText('Upload photos')).toBeInTheDocument()
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('displays current file count', () => {
      const files = [
        { uid: '1', name: 'test1.jpg', status: 'done', url: 'url1' },
        { uid: '2', name: 'test2.jpg', status: 'done', url: 'url2' }
      ]
      
      render(<FileUpload {...defaultProps} value={files} />)
      
      expect(screen.getByText('2 of 3 files selected')).toBeInTheDocument()
    })

    it('handles file selection', async () => {
      const user = userEvent.setup()
      render(<FileUpload {...defaultProps} />)
      
      const file = createMockFile()
      const input = screen.getByRole('button').querySelector('input[type="file"]')
      
      await user.upload(input, file)
      
      expect(mockOnChange).toHaveBeenCalled()
    })

    it('prevents upload when max files reached', async () => {
      const maxFiles = 2
      const files = [
        { uid: '1', name: 'test1.jpg', status: 'done' },
        { uid: '2', name: 'test2.jpg', status: 'done' }
      ]
      
      render(<FileUpload {...defaultProps} value={files} maxFiles={maxFiles} />)
      
      // Upload button should be hidden when max files reached
      expect(screen.queryByText('Upload photos')).not.toBeInTheDocument()
    })
  })

  describe('File Validation', () => {
    it('validates file type and size', async () => {
      fileValidation.validateFile.mockReturnValue({
        valid: false,
        error: 'File size too large'
      })
      
      const user = userEvent.setup()
      render(<FileUpload {...defaultProps} />)
      
      const file = createMockFile('large.jpg', 'image/jpeg', 10 * 1024 * 1024) // 10MB
      const input = screen.getByRole('button').querySelector('input[type="file"]')
      
      await user.upload(input, file)
      
      expect(fileValidation.validateFile).toHaveBeenCalledWith(file, 'image')
    })

    it('shows error message for invalid files', async () => {
      const { message } = await import('antd')
      fileValidation.validateFile.mockReturnValue({
        valid: false,
        error: 'Invalid file type'
      })
      
      const user = userEvent.setup()
      render(<FileUpload {...defaultProps} />)
      
      const file = createMockFile('test.txt', 'text/plain')
      const input = screen.getByRole('button').querySelector('input[type="file"]')
      
      await user.upload(input, file)
      
      expect(message.error).toHaveBeenCalledWith('Invalid file type')
    })

    it('accepts valid files', async () => {
      fileValidation.validateFile.mockReturnValue({ valid: true })
      
      const user = userEvent.setup()
      render(<FileUpload {...defaultProps} />)
      
      const file = createMockFile()
      const input = screen.getByRole('button').querySelector('input[type="file"]')
      
      await user.upload(input, file)
      
      expect(mockOnChange).toHaveBeenCalled()
    })
  })

  describe('File Management', () => {
    it('removes files when delete is clicked', async () => {
      const files = [
        { uid: '1', name: 'test1.jpg', status: 'done', url: 'url1' },
        { uid: '2', name: 'test2.jpg', status: 'done', url: 'url2' }
      ]
      
      render(<FileUpload {...defaultProps} value={files} />)
      
      // Find and click remove button
      const removeButton = screen.getAllByRole('button').find(btn => 
        btn.querySelector('.anticon-delete')
      )
      
      if (removeButton) {
        fireEvent.click(removeButton)
        
        await waitFor(() => {
          expect(mockOnChange).toHaveBeenCalledWith(
            expect.arrayContaining([
              expect.objectContaining({ uid: '2' })
            ])
          )
        })
      }
    })

    it('handles file preview', async () => {
      const files = [
        { uid: '1', name: 'test1.jpg', status: 'done', url: 'url1' }
      ]
      
      render(<FileUpload {...defaultProps} value={files} showPreview={true} />)
      
      // Find and click preview button
      const previewButton = screen.getAllByRole('button').find(btn => 
        btn.querySelector('.anticon-eye')
      )
      
      if (previewButton) {
        fireEvent.click(previewButton)
        
        await waitFor(() => {
          expect(screen.getByRole('img')).toBeInTheDocument()
        })
      }
    })

    it('disables upload when disabled prop is true', () => {
      render(<FileUpload {...defaultProps} disabled={true} />)
      
      const uploadButton = screen.getByRole('button')
      expect(uploadButton).toBeDisabled()
    })
  })

  describe('Custom Upload Handling', () => {
    it('handles successful upload', async () => {
      const user = userEvent.setup()
      render(<FileUpload {...defaultProps} />)
      
      const file = createMockFile()
      const input = screen.getByRole('button').querySelector('input[type="file"]')
      
      await user.upload(input, file)
      
      // Wait for upload simulation to complete
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({
              name: 'test.jpg',
              status: 'done'
            })
          ])
        )
      }, { timeout: 2000 })
    })

    it('processes file list correctly', async () => {
      const user = userEvent.setup()
      render(<FileUpload {...defaultProps} />)
      
      const file = createMockFile()
      const input = screen.getByRole('button').querySelector('input[type="file"]')
      
      await user.upload(input, file)
      
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({
              url: expect.stringContaining('mock-url')
            })
          ])
        )
      })
    })
  })

  describe('Different List Types', () => {
    it('renders with picture-card list type', () => {
      render(<FileUpload {...defaultProps} listType="picture-card" />)
      
      expect(screen.getByText('Upload photos')).toBeInTheDocument()
    })

    it('renders with text list type', () => {
      render(<FileUpload {...defaultProps} listType="text" />)
      
      expect(screen.getByText('Upload photos')).toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('handles upload errors gracefully', async () => {
      // Mock upload failure
      const originalFetch = global.fetch
      global.fetch = vi.fn().mockRejectedValue(new Error('Upload failed'))
      
      const user = userEvent.setup()
      render(<FileUpload {...defaultProps} />)
      
      const file = createMockFile()
      const input = screen.getByRole('button').querySelector('input[type="file"]')
      
      await user.upload(input, file)
      
      // Component should handle error gracefully
      expect(screen.getByText('Upload photos')).toBeInTheDocument()
      
      global.fetch = originalFetch
    })

    it('handles invalid file formats', async () => {
      const { message } = await import('antd')
      fileValidation.validateFile.mockReturnValue({
        valid: false,
        error: 'Unsupported file format'
      })
      
      const user = userEvent.setup()
      render(<FileUpload {...defaultProps} accept="image/*" />)
      
      const file = createMockFile('document.pdf', 'application/pdf')
      const input = screen.getByRole('button').querySelector('input[type="file"]')
      
      await user.upload(input, file)
      
      expect(message.error).toHaveBeenCalledWith('Unsupported file format')
    })
  })
})

describe('MeasurementImageUpload Component', () => {
  const mockOnChange = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders with measurement-specific configuration', () => {
    render(<MeasurementImageUpload value={[]} onChange={mockOnChange} />)
    
    expect(screen.getByText('Add photo')).toBeInTheDocument()
  })

  it('limits to 2 files maximum', () => {
    const files = [
      { uid: '1', name: 'test1.jpg', status: 'done' },
      { uid: '2', name: 'test2.jpg', status: 'done' }
    ]
    
    render(<MeasurementImageUpload value={files} onChange={mockOnChange} />)
    
    // Upload button should be hidden when max files reached
    expect(screen.queryByText('Add photo')).not.toBeInTheDocument()
  })

  it('handles disabled state', () => {
    render(<MeasurementImageUpload value={[]} onChange={mockOnChange} disabled={true} />)
    
    const uploadButton = screen.getByRole('button')
    expect(uploadButton).toBeDisabled()
  })
})

describe('LogAttachmentUpload Component', () => {
  const mockOnChange = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders with log-specific configuration', () => {
    render(<LogAttachmentUpload value={[]} onChange={mockOnChange} />)
    
    expect(screen.getByText('Add photos')).toBeInTheDocument()
  })

  it('limits to 3 files maximum', () => {
    const files = [
      { uid: '1', name: 'test1.jpg', status: 'done' },
      { uid: '2', name: 'test2.jpg', status: 'done' },
      { uid: '3', name: 'test3.jpg', status: 'done' }
    ]
    
    render(<LogAttachmentUpload value={files} onChange={mockOnChange} />)
    
    // Upload button should be hidden when max files reached
    expect(screen.queryByText('Add photos')).not.toBeInTheDocument()
  })
})

describe('CompactFileUpload Component', () => {
  const mockOnChange = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders compact version', () => {
    render(<CompactFileUpload value={[]} onChange={mockOnChange} />)
    
    expect(screen.getByText('Add Photo')).toBeInTheDocument()
  })

  it('handles file upload in compact mode', async () => {
    const user = userEvent.setup()
    render(<CompactFileUpload value={[]} onChange={mockOnChange} />)
    
    const file = createMockFile()
    const input = screen.getByRole('button').querySelector('input[type="file"]')
    
    await user.upload(input, file)
    
    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalled()
    })
  })

  it('validates files in compact mode', async () => {
    const { message } = await import('antd')
    fileValidation.validateFile.mockReturnValue({
      valid: false,
      error: 'File too large'
    })
    
    const user = userEvent.setup()
    render(<CompactFileUpload value={[]} onChange={mockOnChange} />)
    
    const file = createMockFile('large.jpg', 'image/jpeg', 20 * 1024 * 1024)
    const input = screen.getByRole('button').querySelector('input[type="file"]')
    
    await user.upload(input, file)
    
    expect(message.error).toHaveBeenCalledWith('File too large')
  })

  it('adds file to existing list', async () => {
    const existingFiles = [
      { uid: '1', name: 'existing.jpg', status: 'done', url: 'url1' }
    ]
    
    const user = userEvent.setup()
    render(<CompactFileUpload value={existingFiles} onChange={mockOnChange} />)
    
    const file = createMockFile('new.jpg')
    const input = screen.getByRole('button').querySelector('input[type="file"]')
    
    await user.upload(input, file)
    
    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ uid: '1' }),
          expect.objectContaining({ name: 'new.jpg' })
        ])
      )
    })
  })
}) 