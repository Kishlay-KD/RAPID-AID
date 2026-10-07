// API Service - Connects to Flask Backend
// This connects your React Native app to your existing Flask backend

const API_BASE_URL = 'http://10.0.2.2:5000/api'; // Android Emulator
// Use 'http://localhost:5000/api' for iOS Simulator or physical device on same network

const API = {
  // Health check
  healthCheck: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      return await response.json();
    } catch (error) {
      console.error('Health check error:', error);
      return { status: 'error', message: error.message };
    }
  },

  // Patient Authentication
  patientLogin: async (phone, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
      });
      return await response.json();
    } catch (error) {
      console.error('Login error:', error);
      return { status: 'error', message: error.message };
    }
  },

  patientRegister: async (userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      return await response.json();
    } catch (error) {
      console.error('Register error:', error);
      return { status: 'error', message: error.message };
    }
  },

  // Driver Authentication
  driverLogin: async (ambulanceId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/driver/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ambulance_id: ambulanceId }),
      });
      return await response.json();
    } catch (error) {
      console.error('Driver login error:', error);
      return { status: 'error', message: error.message };
    }
  },

  // Ambulance Operations
  getAvailableAmbulances: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/ambulances/available`);
      return await response.json();
    } catch (error) {
      console.error('Get ambulances error:', error);
      return { status: 'error', ambulances: [] };
    }
  },

  getNearestAmbulance: async (lat, lng) => {
    try {
      const response = await fetch(`${API_BASE_URL}/ambulances/nearest?lat=${lat}&lng=${lng}`);
      return await response.json();
    } catch (error) {
      console.error('Get nearest ambulance error:', error);
      return { status: 'error', message: error.message };
    }
  },

  // Request Operations
  createRequest: async (userId, latitude, longitude) => {
    try {
      const response = await fetch(`${API_BASE_URL}/requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          latitude,
          longitude,
        }),
      });
      return await response.json();
    } catch (error) {
      console.error('Create request error:', error);
      return { status: 'error', message: error.message };
    }
  },

  getRequest: async (requestId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/requests/${requestId}`);
      return await response.json();
    } catch (error) {
      console.error('Get request error:', error);
      return { status: 'error', message: error.message };
    }
  },

  getUserRequests: async (userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/requests`);
      return await response.json();
    } catch (error) {
      console.error('Get user requests error:', error);
      return { status: 'error', requests: [] };
    }
  },

  updateRequestStatus: async (requestId, status) => {
    try {
      const response = await fetch(`${API_BASE_URL}/requests/${requestId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      return await response.json();
    } catch (error) {
      console.error('Update status error:', error);
      return { status: 'error', message: error.message };
    }
  },
};

export default API;

