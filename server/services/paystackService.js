import axios from 'axios';

export class PaystackService {
  constructor() {
    this.secretKey = process.env.PAYSTACK_SECRET_KEY;
    this.publicKey = process.env.PAYSTACK_PUBLIC_KEY;
    this.baseURL = 'https://api.paystack.co';
    
    if (!this.secretKey) {
      console.warn('⚠️ PAYSTACK_SECRET_KEY not found in environment variables');
    }
  }
  
  /**
   * Initialize a payment transaction
   */
  async initializePayment(orderData) {
    try {
      const { orderId, amount, customerEmail = 'customer@chattibites.com', deviceId } = orderData;
      
      const payload = {
        email: customerEmail,
        amount: amount * 100, // Paystack expects amount in kobo
        reference: `CB_${orderId}_${Date.now()}`,
        callback_url: `${process.env.CLIENT_URL}/payment/callback`,
        metadata: {
          orderId,
          deviceId,
          custom_fields: [
            {
              display_name: "Order ID",
              variable_name: "order_id",
              value: orderId
            },
            {
              display_name: "Device ID", 
              variable_name: "device_id",
              value: deviceId
            }
          ]
        }
      };
      
      const response = await axios.post(
        `${this.baseURL}/transaction/initialize`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data.status) {
        return {
          success: true,
          data: response.data.data,
          reference: payload.reference
        };
      } else {
        return {
          success: false,
          message: response.data.message
        };
      }
      
    } catch (error) {
      console.error('Paystack initialization error:', error.response?.data || error.message);
      return {
        success: false,
        message: 'Payment initialization failed'
      };
    }
  }
  
  /**
   * Verify a payment transaction
   */
  async verifyPayment(reference) {
    try {
      const response = await axios.get(
        `${this.baseURL}/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`
          }
        }
      );
      
      if (response.data.status) {
        return {
          success: true,
          data: response.data.data
        };
      } else {
        return {
          success: false,
          message: response.data.message
        };
      }
      
    } catch (error) {
      console.error('Paystack verification error:', error.response?.data || error.message);
      return {
        success: false,
        message: 'Payment verification failed'
      };
    }
  }
  
  /**
   * Handle webhook verification
   */
  verifyWebhook(payload, signature) {
    const crypto = require('crypto');
    const hash = crypto
      .createHmac('sha512', this.secretKey)
      .update(JSON.stringify(payload))
      .digest('hex');
    
    return hash === signature;
  }
  
  /**
   * Get transaction details
   */
  async getTransaction(transactionId) {
    try {
      const response = await axios.get(
        `${this.baseURL}/transaction/${transactionId}`,
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`
          }
        }
      );
      
      return response.data;
      
    } catch (error) {
      console.error('Get transaction error:', error.response?.data || error.message);
      throw error;
    }
  }
}

export default new PaystackService();