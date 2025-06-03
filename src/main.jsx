import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import App from './App.jsx'
import './styles/global.css'

// Ant Design theme configuration for mobile-first approach
const theme = {
  token: {
    colorPrimary: '#1890ff',
    borderRadius: 8,
    fontSize: 16, // Larger base font size for mobile
  },
  components: {
    Button: {
      controlHeight: 44, // Larger touch targets for mobile
    },
    Input: {
      controlHeight: 44,
    },
    Select: {
      controlHeight: 44,
    },
  },
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ConfigProvider theme={theme}>
        <App />
      </ConfigProvider>
    </BrowserRouter>
  </React.StrictMode>,
)