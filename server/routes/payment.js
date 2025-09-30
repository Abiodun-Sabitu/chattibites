import express from 'express';
import { PaymentController } from '../controllers/paymentController.js';

const router = express.Router();

// Initialize payment
router.post('/initialize', PaymentController.initializePayment);

// Verify payment
router.get('/verify/:reference', PaymentController.verifyPayment);

// Payment webhooks from Paystack
router.post('/webhook', PaymentController.handleWebhook);

// Get payment status
router.get('/status/:deviceId/:orderId', PaymentController.getPaymentStatus);

export default router;