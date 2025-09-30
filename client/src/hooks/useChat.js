import { useState, useEffect, useRef } from 'react';
import { DeviceIdService } from '../services/deviceId';
import ApiService from '../services/api';

/**
 * Custom hook for managing chat functionality
 */
export function useChat() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deviceId] = useState(() => DeviceIdService.getDeviceId());
  const messagesEndRef = useRef(null);
  
  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Initialize chat on mount
  useEffect(() => {
    const initializeChat = async () => {
      try {
        setIsLoading(true);
        const response = await ApiService.getWelcome(deviceId);
        
        addMessage('bot', response.reply);
      } catch (error) {
        console.error('Failed to initialize chat:', error);
        addMessage('bot', 'Welcome to ChattiBites! How can I help you today?');
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeChat();
  }, [deviceId]);
  
  /**
   * Add a message to the chat
   */
  const addMessage = (type, content, metadata = {}) => {
    const message = {
      id: Date.now() + Math.random(),
      type,
      content,
      timestamp: new Date(),
      ...metadata
    };
    
    setMessages(prev => [...prev, message]);
    return message;
  };
  
  /**
   * Send a message to the backend
   */
  const sendMessage = async (messageText) => {
    if (!messageText.trim()) return;
    
    // Add user message
    addMessage('user', messageText.trim());
    
    try {
      setIsLoading(true);
      
      // Send to backend
      const response = await ApiService.sendMessage(deviceId, messageText.trim());
      
      // Add bot response
      const botMessage = addMessage('bot', response.reply, {
        orderId: response.orderId,
        requiresPayment: response.requiresPayment,
        payUrl: response.payUrl
      });
      
      return botMessage;
      
    } catch (error) {
      console.error('Failed to send message:', error);
      addMessage('bot', 'Sorry, something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Handle payment initialization
   */
  const initializePayment = async (orderId) => {
    try {
      setIsLoading(true);
      
      const response = await ApiService.initializePayment(deviceId, orderId);
      
      if (response.success && response.paymentUrl) {
        // Open payment URL in new tab
        window.open(response.paymentUrl, '_blank');
        
        addMessage('bot', '💳 Payment window opened. Please complete your payment and return here.');
        
        // Start polling for payment status
        pollPaymentStatus(orderId, response.reference);
      } else {
        addMessage('bot', 'Sorry, payment initialization failed. Please try again.');
      }
      
    } catch (error) {
      console.error('Payment initialization failed:', error);
      addMessage('bot', 'Sorry, payment initialization failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Poll payment status
   */
  const pollPaymentStatus = async (orderId, reference, attempts = 0) => {
    const maxAttempts = 30; // 5 minutes with 10-second intervals
    
    if (attempts >= maxAttempts) {
      addMessage('bot', '⏰ Payment verification timed out. Please contact support if you completed the payment.');
      return;
    }
    
    try {
      const response = await ApiService.verifyPayment(reference);
      
      if (response.success) {
        addMessage('bot', '✅ Payment successful! Your order has been confirmed. Thank you for using ChattiBites!');
      } else {
        // Continue polling
        setTimeout(() => {
          pollPaymentStatus(orderId, reference, attempts + 1);
        }, 10000); // Poll every 10 seconds
      }
      
    } catch (error) {
      // Continue polling on error
      setTimeout(() => {
        pollPaymentStatus(orderId, reference, attempts + 1);
      }, 10000);
    }
  };
  
  /**
   * Clear chat history
   */
  const clearChat = () => {
    setMessages([]);
  };
  
  return {
    messages,
    isLoading,
    deviceId,
    sendMessage,
    initializePayment,
    clearChat,
    messagesEndRef
  };
}