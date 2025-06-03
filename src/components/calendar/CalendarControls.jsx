import { Button, Space } from 'antd'
import { 
  CalendarOutlined,
  UnorderedListOutlined,
  TableOutlined 
} from '@ant-design/icons'

const CalendarControls = ({ viewType, onViewChange }) => {
  const viewOptions = [
    {
      key: 'month',
      label: 'Month',
      icon: <CalendarOutlined />
    },
    {
      key: 'week',
      label: 'Week',
      icon: <TableOutlined />
    },
    {
      key: 'day',
      label: 'Day',
      icon: <UnorderedListOutlined />
    }
  ]

  return (
    <div className="calendar-controls">
      <Space size="small">
        {viewOptions.map(option => (
          <Button
            key={option.key}
            type={viewType === option.key ? 'primary' : 'default'}
            icon={option.icon}
            onClick={() => onViewChange(option.key)}
            size="large"
            className="view-control-btn"
          >
            <span className="desktop-only">{option.label}</span>
          </Button>
        ))}
      </Space>
    </div>
  )
}

export default CalendarControls