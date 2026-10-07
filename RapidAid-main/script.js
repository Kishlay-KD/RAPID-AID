/**
 * RapidAid - Smart Emergency Ambulance Response System
 * Main JavaScript File
 */

// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// Global variables
let currentUserId = 1;
let userLatitude = null;
let userLongitude = null;

/**
 * Get user's current location using Geolocation API
 */
function getLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported by this browser'));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                userLatitude = position.coords.latitude;
                userLongitude = position.coords.longitude;
                console.log('Location obtained: ' + userLatitude + ', ' + userLongitude);
                resolve({
                    latitude: userLatitude,
                    longitude: userLongitude
                });
            },
            (error) => {
                let errorMessage = 'Unable to get location. ';
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage += 'Location access was denied. Please allow location access in your browser settings.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage += 'Location information is unavailable.';
                        break;
                    case error.TIMEOUT:
                        errorMessage += 'Location request timed out.';
                        break;
                    default:
                        errorMessage += 'Using default location for demo.';
                }
                console.error('Geolocation error:', error.message);
                // Use default location for demo
                userLatitude = 30.6800;
                userLongitude = 76.6050;
                resolve({
                    latitude: userLatitude,
                    longitude: userLongitude,
                    isDefault: true,
                    error: errorMessage
                });
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    });
}

/**
 * Send SOS request to the server
 */
async function sendSOSRequest(userId, latitude, longitude) {
    try {
        const response = await fetch(`${API_BASE_URL}/sos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user_id: userId,
                latitude: latitude,
                longitude: longitude
            })
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error sending SOS:', error);
        throw error;
    }
}

/**
 * Get request details by ID
 */
async function getRequestDetails(requestId) {
    try {
        const response = await fetch(`${API_BASE_URL}/requests/${requestId}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching request:', error);
        throw error;
    }
}

/**
 * Get user's request history
 */
async function getUserRequests(userId) {
    try {
        const response = await fetch(`${API_BASE_URL}/users/${userId}/requests`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching requests:', error);
        throw error;
    }
}

/**
 * Get available ambulances
 */
async function getAvailableAmbulances() {
    try {
        const response = await fetch(`${API_BASE_URL}/ ambulances/available`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching ambulances:', error);
        throw error;
    }
}

/**
 * Find nearest ambulance
 */
async function findNearestAmbulance(lat, lng) {
    try {
        const response = await fetch(`${API_BASE_URL}/ambulances/nearest?lat=${lat}&lng=${lng}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error finding nearest ambulance:', error);
        throw error;
    }
}

/**
 * Update request status
 */
async function updateRequestStatus(requestId, status) {
    try {
        const response = await fetch(`${API_BASE_URL}/requests/${requestId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: status })
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error updating status:', error);
        throw error;
    }
}

/**
 * Show loading overlay
 */
function showLoadingOverlay(text = 'Loading...') {
    const overlay = document.getElementById('loadingOverlay');
    const textElement = document.getElementById('loadingText');
    
    if (overlay) {
        if (textElement) {
            textElement.textContent = text;
        }
        overlay.style.display = 'flex';
    }
}

/**
 * Hide loading overlay
 */
function hideLoadingOverlay() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}

/**
 * Show alert message
 */
function showAlert(message, type = 'info') {
    alert(message);
}

/**
 * Format date for display
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString();
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function toRad(deg) {
    return deg * (Math.PI / 180);
}

/**
 * Store data in localStorage
 */
function storeData(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error('Error storing data:', error);
    }
}

/**
 * Retrieve data from localStorage
 */
function retrieveData(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Error retrieving data:', error);
        return null;
    }
}

/**
 * Clear all stored data
 */
function clearStoredData() {
    try {
        localStorage.clear();
    } catch (error) {
        console.error('Error clearing data:', error);
    }
}

// Export functions for use in other scripts
window.RapidAid = {
    getLocation,
    sendSOSRequest,
    getRequestDetails,
    getUserRequests,
    getAvailableAmbulances,
    findNearestAmbulance,
    updateRequestStatus,
    showLoadingOverlay,
    hideLoadingOverlay,
    showAlert,
    formatDate,
    calculateDistance,
    storeData,
    retrieveData,
    clearStoredData
};

