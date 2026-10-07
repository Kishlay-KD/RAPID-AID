import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Dimensions,
  Platform,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import API from '../services/api';
import Storage from '../services/storage';

const HomeScreen = ({ navigation, route }) => {
  const [userLocation, setUserLocation] = useState(null);
  const [ambulances, setAmbulances] = useState([]);
  const [loading, setLoading] = useState(false);
  const [requestId, setRequestId] = useState(null);
  const [user, setUser] = useState(null);
  const mapRef = useRef(null);
  const isDriver = route.params?.isDriver || false;

  useEffect(() => {
    loadUserData();
    getUserLocation();
    loadAmbulances();
    
    // Check for existing request
    checkExistingRequest();
  }, []);

  const loadUserData = async () => {
    const userData = await Storage.getUser();
    setUser(userData);
  };

  const getUserLocation = () => {
    // Default location (Chandigarh, India)
    const defaultLocation = {
      latitude: 30.6800,
      longitude: 76.6050,
    };
    
    // Try to get real location (would need permissions in production)
    if (navigator && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.log('Using default location');
          setUserLocation(defaultLocation);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setUserLocation(defaultLocation);
    }
  };

  const loadAmbulances = async () => {
    const result = await API.getAvailableAmbulances();
    if (result.ambulances) {
      setAmbulances(result.ambulances);
    }
  };

  const checkExistingRequest = async () => {
    const lastRequestId = await Storage.getLastRequestId();
    if (lastRequestId) {
      const result = await API.getRequest(lastRequestId);
      if (result.request && (result.request.status === 'pending' || result.request.status === 'accepted')) {
        setRequestId(lastRequestId);
      }
    }
  };

  const requestAmbulance = async () => {
    if (!userLocation) {
      Alert.alert('Error', 'Unable to get your location');
      return;
    }

    setLoading(true);
    try {
      const userId = await Storage.getUserId() || 1;
      const result = await API.createRequest(
        userId,
        userLocation.latitude,
        userLocation.longitude
      );

      if (result.request_id) {
        await Storage.setLastRequestId(result.request_id);
        setRequestId(result.request_id);
        
        if (result.ambulance) {
          Alert.alert(
            'Ambulance Assigned!',
            `Driver: ${result.ambulance.driver_name}\nVehicle: ${result.ambulance.vehicle_number}\nETA: ${result.eta_time}\nDistance: ${result.distance_km} km`,
            [
              { 
                text: 'Track', 
                onPress: () => navigation.navigate('Tracking', { requestId: result.request_id }) 
              }
            ]
          );
        } else {
          Alert.alert('In Queue', 'No ambulances available right now. Your request is in queue.');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to request ambulance');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          onPress: async () => {
            await Storage.clearAll();
            navigation.replace('Login');
          }
        },
      ]
    );
  };

  const initialRegion = userLocation || {
    latitude: 30.6800,
    longitude: 76.6050,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>🚑 RapidAid</Text>
          <Text style={styles.headerSubtitle}>
            {user ? `Welcome, ${user.name}` : 'Smart Emergency Response'}
          </Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Map */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={initialRegion}
          showsUserLocation={true}
          showsMyLocationButton={true}
        >
          {/* User Location Marker */}
          {userLocation && (
            <Marker
              coordinate={userLocation}
              title="Your Location"
              description="Tap SOS to request ambulance"
              pinColor="#2196F3"
            />
          )}
          
          {/* Ambulance Markers */}
          {ambulances.map((amb) => (
            <Marker
              key={amb.id}
              coordinate={{
                latitude: amb.latitude,
                longitude: amb.longitude,
              }}
              title={amb.driver_name}
              description={`Status: ${amb.status} | ${amb.vehicle_number}`}
              pinColor="#e53935"
            />
          ))}
        </MapView>
      </View>

      {/* SOS Button */}
      <View style={styles.sosContainer}>
        <TouchableOpacity
          style={[styles.sosButton, loading && styles.sosButtonDisabled]}
          onPress={requestAmbulance}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="large" color="#fff" />
          ) : (
            <>
              <Text style={styles.sosIcon}>🚑</Text>
              <Text style={styles.sosText}>SOS</Text>
            </>
          )}
        </TouchableOpacity>

        {requestId && (
          <TouchableOpacity
            style={styles.trackButton}
            onPress={() => navigation.navigate('Tracking', { requestId })}
          >
            <Text style={styles.trackButtonText}>Track Ambulance →</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Info Card */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Available Ambulances: {ambulances.length}</Text>
        <Text style={styles.infoText}>
          {ambulances.length > 0 
            ? 'Ambulances are shown on the map' 
            : 'No ambulances available at the moment'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#e53935',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.9,
  },
  logoutBtn: {
    padding: 8,
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  mapContainer: {
    flex: 1,
    margin: 10,
    borderRadius: 15,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  sosContainer: {
    alignItems: 'center',
    padding: 20,
  },
  sosButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e53935',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  sosButtonDisabled: {
    backgroundColor: '#999',
  },
  sosIcon: {
    fontSize: 30,
  },
  sosText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  trackButton: {
    marginTop: 15,
    paddingVertical: 12,
    paddingHorizontal: 25,
    backgroundColor: '#2196F3',
    borderRadius: 25,
  },
  trackButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoCard: {
    margin: 10,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 2,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
});

export default HomeScreen;

