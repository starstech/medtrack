import { Row, Col, Empty, Typography } from 'antd'
import { UserAddOutlined } from '@ant-design/icons'
import PatientCard from './PatientCard'
import './PatientList.css'

const { Text } = Typography

const PatientList = ({ patients, searchTerm }) => {
  if (patients.length === 0 && !searchTerm) {
    return (
      <div className="patients-empty-state">
        <Empty
          image={<UserAddOutlined className="empty-icon" />}
          styles={{ image: { fontSize: 64, color: '#d9d9d9' } }}
          description={
            <div className="empty-description">
              <Text strong>No patients added yet</Text>
              <br />
              <Text type="secondary">
                Add your first patient to start managing their medications and care
              </Text>
            </div>
          }
        />
      </div>
    )
  }

  if (patients.length === 0 && searchTerm) {
    return (
      <div className="patients-empty-state">
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <div className="empty-description">
              <Text strong>No patients found</Text>
              <br />
              <Text type="secondary">
                No patients match your search for "{searchTerm}"
              </Text>
            </div>
          }
        />
      </div>
    )
  }

  return (
    <div className="patient-list">
      <Row gutter={[16, 16]}>
        {patients.map(patient => (
          <Col
            key={patient.id}
            xs={24}
            sm={12}
            lg={8}
            xl={6}
          >
            <PatientCard patient={patient} />
          </Col>
        ))}
      </Row>
    </div>
  )
}

export default PatientList