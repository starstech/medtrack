import '@ant-design/v5-patch-for-react-19'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ConfigProvider, App as AntdApp } from 'antd'
import 'antd/dist/reset.css'
import App from './App.jsx'

const theme = {
  token: {
    colorPrimary: '#1890ff',
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#ff4d4f',
    colorInfo: '#13c2c2',
    
    // Modern Typography with Inter Font
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontFamilyCode: '"JetBrains Mono", "Fira Code", "SF Mono", Monaco, Consolas, "Courier New", monospace',
    
    // Beautiful typography scale
    fontSize: 14, // Perfect base size for interfaces
    fontSizeHeading1: 36, // Hero titles
    fontSizeHeading2: 28, // Section titles
    fontSizeHeading3: 22, // Subsection titles
    fontSizeHeading4: 18, // Card titles
    fontSizeHeading5: 16, // Small headings
    fontSizeSM: 12, // Captions
    fontSizeXS: 11, // Small text
    
    // Optimized line heights for readability
    lineHeight: 1.5, // Perfect for body text
    lineHeightHeading1: 1.2,
    lineHeightHeading2: 1.3,
    lineHeightHeading3: 1.4,
    lineHeightHeading4: 1.4,
    lineHeightHeading5: 1.5,
    
    // Font weights for hierarchy
    fontWeightStrong: 600, // Semibold for emphasis
    
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
    
    // Text colors for excellent readability
    colorText: '#2d3748', // Rich dark gray
    colorTextSecondary: '#718096', // Medium gray
    colorTextTertiary: '#a0aec0', // Light gray
    
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
    Typography: {
      titleMarginTop: 0,
      titleMarginBottom: 8,
      fontWeightStrong: 600,
    }
  },
  algorithm: [
    // You can add dark theme algorithm here if needed
    // theme.darkAlgorithm
  ],
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <ConfigProvider theme={theme}>
      <AntdApp>
        <App />
      </AntdApp>
    </ConfigProvider>
  </BrowserRouter>
)

// Register Firebase service worker for push notifications
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/firebase-messaging-sw.js')
      .catch((err) => console.warn('Service worker registration failed:', err))
  })
}