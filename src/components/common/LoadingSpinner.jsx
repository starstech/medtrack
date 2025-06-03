import { Spin, Typography, Space } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'

const { Text } = Typography

const LoadingSpinner = ({ message = 'Loading...', size = 'large' }) => {
  const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />

  return (
    <div className="loading-container">
      <Space direction="vertical" align="center" size="middle">
        <Spin indicator={antIcon} size={size} />
        <Text type="secondary">{message}</Text>
      </Space>
    </div>
  )
}

export default LoadingSpinner