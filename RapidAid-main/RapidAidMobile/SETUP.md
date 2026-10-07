# RapidAid Mobile - React Native App

A React Native mobile application for the RapidAid ambulance service. This connects to your existing Flask backend.

## 🚀 Quick Start

### Prerequisites
1. **Node.js** - Download and install from https://nodejs.org
2. **Python** - Already installed (for Flask backend)

### Step 1: Start Your Backend
Open a terminal and run:
```bash
cd c:/Users/gaura/OneDrive/Desktop/Rapid/RapidAid/backend
python app.py
```
The backend should start on http://localhost:5000

### Step 2: Install Dependencies
Open a NEW terminal and run:
```bash
cd c:/Users/gaura/OneDrive/Desktop/Rapid/RapidAid/RapidAidMobile
npm install
```

### Step 3: Run the App

**For Android Emulator:**
```bash
npx expo start --android
```

**For iOS Simulator:**
```bash
npx expo start --ios
```

**For Web:**
```bash
npx expo start --web
```

## 📱 App Features

| Feature | Description |
|---------|-------------|
| Patient Login | Login with phone/password |
| Patient Register | Create new account |
| Driver Login | Login with ambulance ID |
| SOS Request | Request ambulance with one tap |
| Live Tracking | See ambulance location on map |
| Real-time Updates | Auto-refresh every 10 seconds |

## 🔧 Configuration

### Connecting to Backend

The app is configured to connect to:
- **Android Emulator**: http://10.0.2.2:5000/api
- **iOS Simulator**: http://localhost:5000/api
- **Physical Device**: Use your computer's local IP address

To change the API URL, edit:
```
src/services/api.js
```

Change this line:
```javascript
const API_BASE_URL = 'http://10.0.2.2:5000/api';
```

## 📂 Project Structure

```
RapidAidMobile/
├── App.js                 # Main entry with navigation
├── package.json           # Dependencies
├── app.json              # Expo configuration
├── babel.config.js       # Babel config
├── src/
│   ├── services/
│   │   ├── api.js        # API connections to Flask
│   │   └── storage.js    # AsyncStorage (like localStorage)
│   └── screens/
│       ├── LoginScreen.js
│       ├── RegisterScreen.js
│       ├── DriverLoginScreen.js
│       ├── DriverRegisterScreen.js
│       ├── HomeScreen.js
│       └── TrackingScreen.js
└── assets/               # App icons and splash
```

## 🐛 Troubleshooting

### "npx not found" error
- Install Node.js from https://nodejs.org
- Restart your terminal after installation

### "Unable to connect to server"
- Make sure Flask backend is running on port 5000
- Check the API URL in src/services/api.js matches your network

### Maps not showing
- For Android: Add Google Maps API key to app.json
- For development: Maps should work with default OpenStreetMap

### Location not working
- Add location permissions to app.json
- On physical device: Enable location services

## 📝 Test Credentials

**Patient (from your database):**
- Phone: 9876543210
- Password: password123

**Driver (from your database):**
- Ambulance ID: 1, 2, 3, or 4

## ✅ Uninstallation

Don't like the React Native app? Simply delete the folder:
```
c:/Users/gaura/OneDrive/Desktop/Rapid/RapidAid/RapidAidMobile
```

Your original web files remain completely unchanged!

