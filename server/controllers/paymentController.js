import { SessionService } from '../services/sessionService.js';
import PaystackService from '../services/paystackService.js';
import crypto from 'crypto';

export class PaymentController {
  /**
   * Initialize payment for an order
   */
  static async initializePayment(req, res) {
    try {
      const { deviceId, orderId } = req.body;
      
      if (!deviceId || !orderId) {
        return res.status(400).json({
          success: false,
          message: 'Device ID and Order ID are required'
        });
      }
      
      const session = SessionService.getSession(deviceId);
      const currentOrder = session.currentOrder;
      
      if (!currentOrder || currentOrder.id !== orderId) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }
      
      if (currentOrder.status !== 'placed') {
        return res.status(400).json({
          success: false,
          message: 'Order is not ready for payment'
        });
      }
      
      // Initialize payment with Paystack
      const paymentData = {
        orderId: currentOrder.id,
        amount: currentOrder.total,
        deviceId: deviceId,
        customerEmail: `customer-${deviceId}@chattibites.com`
      };
      
      const result = await PaystackService.initializePayment(paymentData);
      
      if (result.success) {
        // Store payment reference in session
        SessionService.updateSession(deviceId, {
          currentOrder: {
            ...currentOrder,
            paymentReference: result.reference
          }
        });
        
        res.json({
          success: true,
          paymentUrl: result.data.authorization_url,
          reference: result.reference
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message || 'Payment initialization failed'
        });
      }
      
    } catch (error) {
      console.error('Payment initialization error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
  
  /**
   * Verify payment status
   */
  static async verifyPayment(req, res) {
    try {
      const { reference } = req.params;
      
      if (!reference) {
        return res.status(400).json({
          success: false,
          message: 'Payment reference is required'
        });
      }
      
      const result = await PaystackService.verifyPayment(reference);
      
      if (result.success && result.data.status === 'success') {
        const { metadata } = result.data;
        const deviceId = metadata?.device_id;
        const orderId = metadata?.order_id;
        
        if (deviceId && orderId) {
          // Complete payment in session
          const completedOrder = SessionService.completePayment(deviceId, reference);
          
          if (completedOrder) {
            res.json({
              success: true,
              message: 'Payment verified successfully',
              order: completedOrder
            });
          } else {
            res.status(404).json({
              success: false,
              message: 'Order not found'
            });
          }
        } else {
          res.status(400).json({
            success: false,
            message: 'Invalid payment metadata'
          });
        }
      } else {
        res.status(400).json({
          success: false,
          message: result.message || 'Payment verification failed'
        });
      }
      
    } catch (error) {
      console.error('Payment verification error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
  
  /**
   * Handle Paystack webhooks
   */
  static async handleWebhook(req, res) {
    try {
      const signature = req.headers['x-paystack-signature'];
      const payload = req.body;
      
      // Verify webhook signature
      const hash = crypto
        .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
        .update(JSON.stringify(payload))
        .digest('hex');
      
      if (hash !== signature) {
        return res.status(400).json({
          success: false,
          message: 'Invalid signature'
        });
      }
      
      const { event, data } = payload;
      
      if (event === 'charge.success') {
        const { reference, status, metadata } = data;
        
        if (status === 'success') {
          const deviceId = metadata?.device_id;
          const orderId = metadata?.order_id;
          
          if (deviceId && orderId) {
            const completedOrder = SessionService.completePayment(deviceId, reference);
            
            if (completedOrder) {
              console.log(`✅ Payment completed for order ${orderId}`);
              
              // Here you could send notifications, trigger other services, etc.
              // For now, we'll just log it
            }
          }
        }
      }
      
      res.status(200).json({ success: true });
      
    } catch (error) {
      console.error('Webhook error:', error);
      res.status(500).json({
        success: false,
        message: 'Webhook processing failed'
      });
    }
  }
  
  /**
   * Get payment status for an order
   */
  static async getPaymentStatus(req, res) {
    try {
      const { deviceId, orderId } = req.params;
      
      const session = SessionService.getSession(deviceId);
      const currentOrder = session.currentOrder;
      
      // Check current order
      if (currentOrder && currentOrder.id === orderId) {
        return res.json({
          success: true,
          status: currentOrder.status,
          order: currentOrder
        });
      }
      
      // Check order history
      const orderHistory = SessionService.getOrderHistory(deviceId);
      const historicalOrder = orderHistory.find(order => order.id === orderId);
      
      if (historicalOrder) {
        return res.json({
          success: true,
          status: historicalOrder.status,
          order: historicalOrder
        });
      }
      
      res.status(404).json({
        success: false,
        message: 'Order not found'
      });
      
    } catch (error) {
      console.error('Get payment status error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}