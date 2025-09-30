import express from 'express';
import { ChatController } from '../controllers/chatController.js';

const router = express.Router();

// Get welcome message
router.get('/welcome', ChatController.getWelcome);

// Handle chat messages
router.post('/message', ChatController.handleMessage);

export default router;