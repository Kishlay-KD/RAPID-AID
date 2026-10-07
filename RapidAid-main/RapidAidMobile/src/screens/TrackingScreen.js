import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import API from '../services/api';
import Storage from '../services/storage';

const TrackingScreen = ({ navigation, route }) => {
  const [requestData, setRequestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const mapRef = useRef(null);
  
  const requestId = route.params?.requestId;

  useEffect(() => {
    if (requestId) {
      loadRequestData();
      // Auto-refresh every 10 seconds
      const interval = setInterval(loadRequestData, 10000);
      return () => clearInterval(interval);
    }
  }, [requestId]);

  const loadRequestData = async () => {
    try {
      const result = await API.getRequest(requestId);
      if (result.request) {
        setRequestData(result);
        
        // Fit map to show both user and ambulance
        if (result.ambulance && result.request && mapRef.current) {
          const coordinates = [
            {
              latitude: result.request.user_lat,
              longitude: result.request.user_lng,
            },
            {
              latitude: result.ambulance.latitude,
              longitude: result.ambulance.longitude,
            },
          ];
          mapRef.current.fitToCoordinates(coordinates, {
            edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
            animated: true,
          });
        }
      }
    } catch (error) {
      console.error('Error loading request:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadRequestData();
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel Request',
      'Are you sure you want to cancel this ambulance request?',
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Yes, Cancel', 
          style: 'destructive',
          onPress: async () => {
            await API.updateRequestStatus(requestId, 'cancelled');
            await Storage.setLastRequestId(null);
            navigation.goBack();
          }
        },
      ]
    );
  };

  const handleComplete = async () => {
    await API.updateRequestStatus(requestId, 'completed');
    await Storage.setLastRequestId(null);
    Alert.alert('Completed', 'Ambulance request completed successfully!', [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#e53935" />
        <Text style={styles.loadingText}>Loading request details...</Text>
      </View>
    );
  }

  if (!requestData || !requestData.request) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Request not found</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { request, ambulance, distance_km, eta_minutes, eta_time } = requestData;

  // Map region
  const userLocation = {
    latitude: request.user_lat || 30.6800,
    longitude: request.user_lng || 76.6050,
  };

  const ambulanceLocation = ambulance ? {
    latitude: ambulance.latitude,
    longitude: ambulance.longitude,
  } : null;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Track Ambulance</Text>
        <Text style={styles.headerSubtitle}>Request #{request.id}</Text>
      </View>

      {/* Map */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={{
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
          showsUserLocation={true}
        >
          {/* User Location */}
          <Marker
            coordinate={userLocation}
            title="Your Location"
            pinColor="#2196F3"
          />
          
          {/* Ambulance Location */}
          {ambulanceLocation && (
            <Marker
              coordinate={ambulanceLocation}
              title={ambulance.driver_name}
              description={ambulance.vehicle_number}
              pinColor="#e53935"
            />
          )}

          {/* Route Line */}
          {ambulanceLocation && (
            <Polyline
              coordinates={[userLocation, ambulanceLocation]}
              strokeColor="#e53935"
              strokeWidth={3}
              lineDashPattern={[5, 5]}
            />
          )}
        </MapView>
      </View>

      {/* Status Card */}
      <View style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <Text style={styles.statusTitle}>
            Status: <Text style={styles.statusValue}>{request.status?.toUpperCase()}</Text>
          </Text>
          <TouchableOpacity onPress={handleRefresh} disabled={refreshing}>
            <Text style={styles.refreshText}>
              {refreshing ? '⟳ Updating...' : '↻ Refresh'}
            </Text>
          </TouchableOpacity>
        </View>

        {ambulance && (
          <>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Driver:</Text>
              <Text style={styles.infoValue}>{ambulance.driver_name}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Vehicle:</Text>
              <Text style={styles.infoValue}>{ambulance.vehicle_number}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Contact:</Text>
              <Text style={styles.infoValue}>{ambulance.phone}</Text>
            </View>
          </>
        )}

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{distance_km || '—'} km</Text>
            <Text style={styles.statLabel}>Distance</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{eta_time || '—'}</Text>
            <Text style={styles.statLabel}>ETA</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{ambulance?.status || '—'}</Text>
            <Text style={styles.statLabel}>Status</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          {request.status === 'pending' && (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
            >
              <Text style={styles.cancelButtonText}>Cancel Request</Text>
            </TouchableOpacity>
          )}
          
          {request.status === 'accepted' && (
            <TouchableOpacity
              style={styles.completeButton}
              onPress={handleComplete}
            >
              <Text style={styles.completeButtonText}>Mark as Completed</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  header: {
    padding: 15,
    backgroundColor: '#e53935',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
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
  statusCard: {
    margin: 10,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 15,
    elevation: 3,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statusValue: {
    color: '#e53935',
  },
  refreshText: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    width: 80,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e53935',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  buttonContainer: {
    marginTop: 15,
  },
  cancelButton: {
    backgroundColor: '#f44336',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  completeButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    padding: 15,
    backgroundColor: '#e53935',
    borderRadius: 10,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default TrackingScreen;