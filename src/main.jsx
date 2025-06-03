import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import 'antd/dist/reset.css'
import App from './App.jsx'

const theme = {
  token: {
    colorPrimary: '#1890ff',
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#ff4d4f',
    colorInfo: '#13c2c2',
    
    // Typography
    fontSize: 14,
    fontSizeHeading1: 38,
    fontSizeHeading2: 30,
    fontSizeHeading3: 24,
    fontSizeHeading4: 20,
    fontSizeHeading5: 16,
    
    // Spacing and sizing
    borderRadius: 6,
    borderRadiusLG: 12,
    borderRadiusSM: 6,
    
    // Layout
    padding: 16,
    paddingLG: 24,
    paddingSM: 12,
    paddingXS: 8,
    
    // Colors for better contrast and modern feel
    colorBgContainer: '#ffffff',
    colorBgElevated: '#ffffff',
    colorBgLayout: '#f5f7fa',
    colorBorder: '#e8eaed',
    colorBorderSecondary: '#f0f2f5',
    
    // Text colors
    colorText: '#1f2937',
    colorTextSecondary: '#6b7280',
    colorTextTertiary: '#9ca3af',
    
    // Box shadows for depth
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
    boxShadowSecondary: '0 4px 16px rgba(0, 0, 0, 0.12)',
  },
  components: {
    Layout: {
      headerBg: '#ffffff',
      headerHeight: 64,
      siderBg: '#ffffff',
      bodyBg: '#f5f7fa',
    },
    Card: {
      borderRadius: 8,
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      headerBg: 'transparent',
      paddingLG: 16,
      padding: 16
    },
    Button: {
      borderRadius: 8,
      controlHeight: 40,
      controlHeightLG: 48,
      controlHeightSM: 32,
      fontWeight: 500,
      primaryShadow: '0 4px 12px rgba(24, 144, 255, 0.3)',
    },
    Input: {
      borderRadius: 8,
      controlHeight: 40,
      controlHeightLG: 48,
    },
    Select: {
      borderRadius: 8,
      controlHeight: 40,
      controlHeightLG: 48,
    },
    DatePicker: {
      borderRadius: 8,
      controlHeight: 40,
      controlHeightLG: 48,
    },
    Table: {
      borderRadius: 12,
      headerBg: '#fafbfc',
    },
    Menu: {
      itemBorderRadius: 8,
      itemMarginBlock: 4,
      itemPaddingInline: 16,
      iconMarginInlineEnd: 12,
    },
    Drawer: {
      borderRadius: 0,
    },
    Modal: {
      borderRadius: 12,
    },
    Notification: {
      borderRadius: 12,
    },
    Message: {
      borderRadius: 8,
    },
    Statistic: {
      titleFontSize: 14,
      contentFontSize: 24,
    },
    Progress: {
      remainingColor: '#f0f2f5',
    },
    Badge: {
      borderRadius: 10,
    },
    Tag: {
      borderRadius: 6,
      fontSize: 12,
      fontSizeSM: 11,
    },
    Tabs: {
      itemColor: '#6b7280',
      itemSelectedColor: '#1890ff',
      itemHoverColor: '#1890ff',
      inkBarColor: '#1890ff',
      cardBg: '#ffffff',
    },
  },
  algorithm: [
    // You can add dark theme algorithm here if needed
    // theme.darkAlgorithm
  ],
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