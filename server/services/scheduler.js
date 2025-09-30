import cron from 'node-cron';
import { SessionService } from './sessionService.js';

/**
 * Initialize cron jobs for scheduled orders and cleanup
 */
export function initializeCronJobs() {
  // Check for scheduled orders every minute
  cron.schedule('* * * * *', () => {
    const scheduledOrders = SessionService.getScheduledOrders();
    
    scheduledOrders.forEach(({ deviceId, order }) => {
      console.log(`⏰ Processing scheduled order ${order.id} for device ${deviceId}`);
      
      // Here you could trigger notifications, send to kitchen, etc.
      // For now, we'll just log it
      
      // Mark as processed (optional)
      order.scheduledAt = null;
    });
  });
  
  // Cleanup old sessions every hour
  cron.schedule('0 * * * *', () => {
    SessionService.cleanupOldSessions();
    console.log('🧹 Cleaned up old sessions');
  });
  
  console.log('📅 Cron jobs initialized');
}