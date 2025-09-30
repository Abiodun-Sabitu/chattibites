import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

/**
 * API service for communicating with the backend
 */
export class ApiService {
  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
    
    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }
  
  /**
   * Get welcome message
   */
  async getWelcome(deviceId) {
    try {
      const response = await this.client.get('/chat/welcome', {
        params: { deviceId }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.reply || 'Failed to get welcome message');
    }
  }
  
  /**
   * Send chat message
   */
  async sendMessage(deviceId, message) {
    try {
      const response = await this.client.post('/chat/message', {
        deviceId,
        message
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.reply || 'Failed to send message');
    }
  }
  
  /**
   * Initialize payment
   */
  async initializePayment(deviceId, orderId) {
    try {
      const response = await this.client.post('/payment/initialize', {
        deviceId,
        orderId
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to initialize payment');
    }
  }
  
  /**
   * Verify payment
   */
  async verifyPayment(reference) {
    try {
      const response = await this.client.get(`/payment/verify/${reference}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to verify payment');
    }
  }
  
  /**
   * Get payment status
   */
  async getPaymentStatus(deviceId, orderId) {
    try {
      const response = await this.client.get(`/payment/status/${deviceId}/${orderId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get payment status');
    }
  }
}

export default new ApiService();