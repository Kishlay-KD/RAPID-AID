// Storage Service - Using AsyncStorage instead of localStorage
import AsyncStorage from '@react-native-async-storage/async-storage';

const Storage = {
  // User data
  async setUser(user) {
    try {
      await AsyncStorage.setItem('rapidAid_user', JSON.stringify(user));
    } catch (error) {
      console.error('Error saving user:', error);
    }
  },

  async getUser() {
    try {
      const user = await AsyncStorage.getItem('rapidAid_user');
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  },

  // User ID
  async setUserId(userId) {
    try {
      await AsyncStorage.setItem('userId', userId.toString());
    } catch (error) {
      console.error('Error saving userId:', error);
    }
  },

  async getUserId() {
    try {
      const userId = await AsyncStorage.getItem('userId');
      return userId ? parseInt(userId) : null;
    } catch (error) {
      console.error('Error getting userId:', error);
      return null;
    }
  },

  // Last request ID
  async setLastRequestId(requestId) {
    try {
      await AsyncStorage.setItem('lastRequestId', requestId.toString());
    } catch (error) {
      console.error('Error saving requestId:', error);
    }
  },

  async getLastRequestId() {
    try {
      const requestId = await AsyncStorage.getItem('lastRequestId');
      return requestId ? parseInt(requestId) : null;
    } catch (error) {
      console.error('Error getting requestId:', error);
      return null;
    }
  },

  // Driver/Ambulance data
  async setDriver(driver) {
    try {
      await AsyncStorage.setItem('rapidAid_driver', JSON.stringify(driver));
    } catch (error) {
      console.error('Error saving driver:', error);
    }
  },

  async getDriver() {
    try {
      const driver = await AsyncStorage.getItem('rapidAid_driver');
      return driver ? JSON.parse(driver) : null;
    } catch (error) {
      console.error('Error getting driver:', error);
      return null;
    }
  },

  // Clear all data (logout)
  async clearAll() {
    try {
      await AsyncStorage.multiRemove([
        'rapidAid_user',
        'userId',
        'lastRequestId',
        'rapidAid_driver',
      ]);
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  },
};

export default Storage;

