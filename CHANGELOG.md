# Changelog

All notable changes to the MedTrack project will be documented in this file.

## [Unreleased] - 2024-01-XX

### 🚀 Added
- Comprehensive measurement preferences system
- Medical scenario presets (Comprehensive, Basic Care, Diabetes Management, etc.)
- Self-contained modal architecture with integrated preference loading
- REST API service layer with centralized HTTP client
- User-specific measurement preferences per patient

### ✨ Enhanced
- **VitalSignsModal**: Now loads preferences on open and filters available measurements
- **PhysicalMeasurementsModal**: Conditional rendering based on measurement preferences
- **SubjectiveMeasurementsModal**: Integrated preference checking for pain/mood tracking
- **MeasurementSection**: Real-time preference updates and smart filtering

### 🔧 Changed
- **Architecture Simplification**: Removed enhanced modal wrapper pattern
- **Direct Integration**: Modals now directly load and check preferences
- **API Client**: Centralized HTTP client with proper error handling
- **Service Layer**: Updated to use REST API endpoints instead of direct database calls

### 🗑️ Removed
- **Enhanced Modal Wrappers**: Removed `EnhancedVitalSignsModal`, `EnhancedPhysicalMeasurementsModal`, `EnhancedSubjectiveMeasurementsModal`
- **Supabase Dependencies**: Removed direct database integration files
- **Local Setup**: Removed `LOCAL_SUPABASE_SETUP.md` and `supabase_schema.sql`

### 🐛 Fixed
- **AuthContext Import**: Fixed `useAuth` vs `useAuthContext` import inconsistency
- **API Integration**: Proper error handling and response parsing
- **Preference Loading**: Consistent preference loading across all modals
- **Category Filtering**: Proper category-level disable functionality

### 📚 Documentation
- Updated `MEASUREMENT_PREFERENCES.md` with new architecture details
- Added comprehensive `PROJECT_README.md`
- Updated API service documentation
- Added changelog for tracking changes

### 🔄 Technical Debt
- Consolidated modal architecture for better maintainability
- Improved error handling patterns
- Better separation of concerns between UI and data layers
- More consistent API response handling

---

## Development Notes

### Migration from Enhanced Modals
The previous architecture used wrapper components (`EnhancedVitalSignsModal`, etc.) that would load preferences and pass them to the base modals. This created unnecessary complexity and potential for props drilling.

**Before:**
```jsx
<EnhancedVitalSignsModal>
  <VitalSignsModal availableMeasurements={...} />
</EnhancedVitalSignsModal>
```

**After:**
```jsx
<VitalSignsModal /> // Self-contained with integrated preference loading
```

### API Service Pattern
All services now use the centralized `apiClient` with consistent patterns:
- Proper error handling
- Authentication headers
- Base URL configuration
- Request/response interceptors

### Preference Loading Pattern
All modals now follow the same pattern:
1. Load preferences on modal open
2. Check category-level enablement
3. Close with warning if category disabled
4. Filter individual measurements
5. Conditionally render form fields 