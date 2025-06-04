import React, { useState } from 'react'
import { Upload, Button, message, Image, Card, Space, Typography, Popconfirm } from 'antd'
import { 
  CameraOutlined, 
  FileImageOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  PlusOutlined 
} from '@ant-design/icons'
import { fileValidation } from '../../services/fileService'
import './FileUpload.css'

const { Text } = Typography

const FileUpload = ({
  value = [],
  onChange,
  maxFiles = 3,
  accept = 'image/*',
  category = 'image',
  placeholder = 'Upload photos',
  showPreview = true,
  listType = 'picture-card',
  disabled = false
}) => {
  const [previewVisible, setPreviewVisible] = useState(false)
  const [previewImage, setPreviewImage] = useState('')
  const [previewTitle, setPreviewTitle] = useState('')

  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj)
    }

    setPreviewImage(file.url || file.preview)
    setPreviewVisible(true)
    setPreviewTitle(file.name || file.url.substring(file.url.lastIndexOf('/') + 1))
  }

  const getBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result)
      reader.onerror = (error) => reject(error)
    })

  const beforeUpload = (file) => {
    // Validate file
    const validation = fileValidation.validateFile(file, category)
    if (!validation.valid) {
      message.error(validation.error)
      return false
    }

    // Check max files limit
    if (value.length >= maxFiles) {
      message.error(`Maximum ${maxFiles} files allowed`)
      return false
    }

    return true
  }

  const handleChange = ({ fileList }) => {
    // Process fileList to ensure proper format
    const processedFileList = fileList.map(file => {
      if (file.response && file.response.url) {
        // File successfully uploaded
        return {
          ...file,
          url: file.response.url,
          status: 'done'
        }
      }
      return file
    })

    onChange?.(processedFileList)
  }

  const handleRemove = (file) => {
    const newFileList = value.filter(item => item.uid !== file.uid)
    onChange?.(newFileList)
  }

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>
        {placeholder}
      </div>
    </div>
  )

  return (
    <div className="file-upload-component">
      <Upload
        accept={accept}
        listType={listType}
        fileList={value}
        onPreview={showPreview ? handlePreview : undefined}
        onChange={handleChange}
        onRemove={handleRemove}
        beforeUpload={beforeUpload}
        disabled={disabled}
        customRequest={({ file, onSuccess, onError }) => {
          // Custom upload logic will be implemented when connecting to backend
          // For now, simulate success with a delay
          setTimeout(() => {
            onSuccess({
              url: URL.createObjectURL(file),
              name: file.name
            })
          }, 1000)
        }}
      >
        {value.length >= maxFiles ? null : uploadButton}
      </Upload>

      {/* Preview Modal */}
      {showPreview && (
        <Image
          wrapperStyle={{ display: 'none' }}
          preview={{
            visible: previewVisible,
            onVisibleChange: setPreviewVisible,
            afterOpenChange: (visible) => {
              if (!visible) {
                setPreviewImage('')
                setPreviewTitle('')
              }
            }
          }}
          src={previewImage}
          title={previewTitle}
        />
      )}

      {/* File List Info */}
      {value.length > 0 && (
        <div style={{ marginTop: 8 }}>
          <Text type="secondary" size="small">
            {value.length} of {maxFiles} files selected
          </Text>
        </div>
      )}
    </div>
  )
}

// Helper component for measurement-specific file upload
export const MeasurementImageUpload = ({ value, onChange, disabled = false }) => {
  return (
    <FileUpload
      value={value}
      onChange={onChange}
      maxFiles={2}
      category="image"
      placeholder="Add photo"
      listType="picture-card"
      disabled={disabled}
    />
  )
}

// Helper component for log attachments
export const LogAttachmentUpload = ({ value, onChange, disabled = false }) => {
  return (
    <FileUpload
      value={value}
      onChange={onChange}
      maxFiles={3}
      category="image"
      placeholder="Add photos"
      listType="picture-card"
      disabled={disabled}
    />
  )
}

// Compact version for smaller spaces
export const CompactFileUpload = ({ value, onChange, disabled = false }) => {
  return (
    <div className="compact-file-upload">
      <Upload
        accept="image/*"
        showUploadList={false}
        beforeUpload={(file) => {
          const validation = fileValidation.validateFile(file, 'image')
          if (!validation.valid) {
            message.error(validation.error)
            return false
          }
          return true
        }}
        customRequest={({ file, onSuccess }) => {
          setTimeout(() => {
            const newFile = {
              uid: Date.now().toString(),
              name: file.name,
              status: 'done',
              url: URL.createObjectURL(file),
              originFileObj: file
            }
            onChange?.([...(value || []), newFile])
            onSuccess()
          }, 1000)
        }}
        disabled={disabled}
      >
        <Button 
          icon={<CameraOutlined />} 
          size="small"
          disabled={disabled}
        >
          Add Photo
        </Button>
      </Upload>
      
      {value && value.length > 0 && (
        <div style={{ marginTop: 8 }}>
          <Space wrap size={4}>
            {value.map((file, index) => (
              <Card
                key={file.uid}
                size="small"
                style={{ width: 60 }}
                bodyStyle={{ padding: 4 }}
                cover={
                  <Image
                    src={file.url}
                    alt={file.name}
                    style={{ height: 40, objectFit: 'cover' }}
                    preview={{
                      mask: <EyeOutlined />
                    }}
                  />
                }
                actions={[
                  <Popconfirm
                    key="delete"
                    title="Remove photo?"
                    onConfirm={() => {
                      const newFileList = value.filter((_, i) => i !== index)
                      onChange?.(newFileList)
                    }}
                  >
                    <DeleteOutlined />
                  </Popconfirm>
                ]}
              />
            ))}
          </Space>
        </div>
      )}
    </div>
  )
}

export default FileUpload 