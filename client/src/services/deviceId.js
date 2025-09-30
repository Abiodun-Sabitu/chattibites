import { v4 as uuidv4 } from 'uuid';

/**
 * Device ID service for tracking users
 */
export class DeviceIdService {
  static STORAGE_KEY = 'chattibites_device_id';
  
  /**
   * Get or create device ID
   */
  static getDeviceId() {
    let deviceId = localStorage.getItem(this.STORAGE_KEY);
    
    if (!deviceId) {
      deviceId = uuidv4();
      localStorage.setItem(this.STORAGE_KEY, deviceId);
    }
    
    return deviceId;
  }
  
  /**
   * Clear device ID (for testing)
   */
  static clearDeviceId() {
    localStorage.removeItem(this.STORAGE_KEY);
  }
  
  /**
   * Set specific device ID (for testing)
   */
  static setDeviceId(deviceId) {
    localStorage.setItem(this.STORAGE_KEY, deviceId);
  }
}