# React Native Conversion Plan for RapidAid

## Project Overview
Convert the existing web-based RapidAid application to React Native for iOS/Android mobile platforms.

## Current Stack (Will Remain Unchanged)
- Backend: Python Flask (existing)
- Database: SQLite (existing)
- API: REST endpoints (existing)

## New React Native Stack
- Framework: Expo (recommended for easy setup)
- Navigation: @react-navigation/native
- Maps: react-native-maps
- Storage: @react-native-async-storage/async-storage
- HTTP: Built-in fetch API

## Files to Create

### 1. Project Configuration
- package.json
- app.json
- babel.config.js

### 2. Navigation Setup
- App.js (main entry with navigation)
- src/navigation/AppNavigator.js

### 3. API Service
- src/services/api.js (connects to existing Flask backend)

### 4. Screens (src/screens/)
- PatientLoginScreen.js
- PatientRegisterScreen.js
- DriverLoginScreen.js
- DriverRegisterScreen.js
- HomeScreen.js (SOS functionality)
- TrackingScreen.js

### 5. Components (src/components/)
- Navbar.js
- MapView.js
- SOSButton.js

## Key Differences from Web Version

| Web (Leaflet) | React Native |
|---------------|--------------|
| Leaflet maps | react-native-maps |
| localStorage | AsyncStorage |
| HTML/CSS | StyleSheet (JS objects) |
| <a> tags | TouchableOpacity + Navigation |
| window.location | Navigation props |

## Installation Commands
```bash
npx create-expo-app RapidAidMobile
cd RapidAidMobile
npm install @react-navigation/native @react-navigation/native-stack
npm install react-native-maps @react-native-async-storage/async-storage
```

## Testing
- Backend should run on localhost:5000
- React Native app will connect to http://10.0.2.2:5000 (Android emulator)
- For iOS simulator: http://localhost:5000

