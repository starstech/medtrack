# MedTrack - Personal Health Monitoring System

## 📋 Overview

MedTrack is a comprehensive personal health monitoring system designed to help caregivers track and manage patient health data. The system provides a modern, user-friendly interface for recording, viewing, and analyzing health measurements.

## ✨ Key Features

### Patient Management
- Multi-patient support for caregivers
- Patient profile management
- Appointment scheduling
- Health timeline tracking

### Measurement Tracking
- **Vital Signs**: Blood pressure, heart rate, temperature, oxygen saturation
- **Physical Measurements**: Height, weight, BMI calculation
- **Subjective Measurements**: Pain level, mood assessment
- **Customizable Preferences**: Per-patient measurement preferences

### Measurement Preferences System
- **Medical Scenario Presets**: Pre-configured measurement sets for different conditions
- **Custom Configuration**: Full control over which measurements to track
- **Smart Filtering**: Hide unwanted measurements from entry forms
- **User-Specific Settings**: Different preferences per caregiver

### Data Visualization
- Interactive charts and graphs
- Trend analysis
- Export capabilities
- Historical data views

## 🏗️ Architecture

### Frontend
- **React 18** with Vite build system
- **Ant Design** component library
- **Chart.js** for data visualization
- **Context API** for state management

### Backend (Planned)
- **Node.js/Express** API server
- **PostgreSQL** database
- **REST API** architecture
- **JWT Authentication**

### Current State
- Frontend-only implementation with mock data
- Local storage for persistence
- Service layer architecture ready for backend integration

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- pnpm (recommended package manager)

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd medtrack

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

### Development Scripts
```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm preview      # Preview production build
pnpm lint         # Run ESLint
```

## 📁 Project Structure

```
src/
├── components/           # React components
│   ├── auth/            # Authentication components
│   ├── common/          # Shared components
│   ├── dashboard/       # Dashboard components
│   │   ├── modals/      # Measurement entry modals
│   │   └── ...
│   └── preferences/     # Measurement preferences
├── contexts/            # React contexts
│   └── AuthContext.jsx  # Authentication context
├── services/            # API service layer
│   ├── apiClient.js     # HTTP client
│   ├── measurementPreferencesService.js
│   └── ...
├── utils/               # Utility functions
├── styles/              # CSS files
└── App.jsx              # Main application component
```

## 🔧 Key Services

### measurementPreferencesService
Handles all measurement preference operations:
- Load user preferences
- Apply medical scenario presets
- Custom measurement configuration
- Real-time preference updates

### apiClient
Centralized HTTP client for API communication:
- Request/response interceptors
- Error handling
- Authentication headers
- Base URL configuration

## 🎨 UI Components

### Measurement Modals
- **VitalSignsModal**: Blood pressure, heart rate, temperature, oxygen saturation
- **PhysicalMeasurementsModal**: Height, weight with BMI calculation
- **SubjectiveMeasurementsModal**: Pain level, mood assessment

All modals integrate with the measurement preferences system:
- Load preferences on open
- Filter available fields
- Show appropriate warnings
- Self-contained preference handling

### MeasurementPreferences
Comprehensive preference management interface:
- Medical scenario preset selection
- Category-level toggles
- Individual measurement controls
- Real-time UI updates

## 📊 Medical Scenario Presets

1. **Comprehensive** - All measurements enabled (default)
2. **Basic Care** - Essential measurements for routine monitoring
3. **Diabetes Management** - Glucose-focused with mood tracking
4. **Heart Health** - Cardiovascular measurements
5. **Pediatric Care** - Age-appropriate measurements
6. **Post-Surgery Recovery** - Recovery monitoring with pain focus

## 🔐 Authentication

Current implementation uses a mock authentication system:
- Context-based authentication state
- Local storage persistence
- Mock login/registration flow
- Email verification simulation

## 📈 Development Status

### ✅ Completed Features
- Patient dashboard with measurement tracking
- All measurement entry modals
- Measurement preferences system
- Medical scenario presets
- Self-contained modal architecture
- Local data persistence

### 🚧 In Progress
- Backend API integration
- Real authentication system
- Data export functionality

### 📋 Planned Features
- Real-time notifications
- Advanced analytics
- Mobile app companion
- Healthcare provider integration

## 🧪 Testing

```bash
# Run tests (when implemented)
pnpm test

# Run tests in watch mode
pnpm test:watch

# Generate coverage report
pnpm test:coverage
```

## 📚 Documentation

- [Measurement Preferences Documentation](docs/MEASUREMENT_PREFERENCES.md)
- [API Documentation](docs/API.md) *(planned)*
- [Component Documentation](docs/COMPONENTS.md) *(planned)*

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For questions or support, please contact the development team or create an issue in the repository. 