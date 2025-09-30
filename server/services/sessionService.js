import { v4 as uuidv4 } from 'uuid';

/**
 * In-memory session store
 * Key: deviceId (string)
 * Value: session object with user data and orders
 */
const sessions = new Map();

/**
 * Session structure:
 * {
 *   deviceId: string,
 *   currentOrder: {
 *     id: string,
 *     items: [],
 *     total: number,
 *     status: 'pending' | 'placed' | 'paid' | 'cancelled',
 *     createdAt: Date,
 *     scheduledAt?: Date
 *   },
 *   orderHistory: [],
 *   chatState: 'main' | 'ordering' | 'checkout',
 *   lastActivity: Date
 * }
 */

export class SessionService {
  static getSession(deviceId) {
    if (!sessions.has(deviceId)) {
      sessions.set(deviceId, {
        deviceId,
        currentOrder: null,
        orderHistory: [],
        chatState: 'main',
        lastActivity: new Date()
      });
    }
    
    const session = sessions.get(deviceId);
    session.lastActivity = new Date();
    return session;
  }

  static updateSession(deviceId, updates) {
    const session = this.getSession(deviceId);
    Object.assign(session, updates, { lastActivity: new Date() });
    sessions.set(deviceId, session);
    return session;
  }

  static createOrder(deviceId) {
    const session = this.getSession(deviceId);
    const orderId = uuidv4();
    
    session.currentOrder = {
      id: orderId,
      items: [],
      total: 0,
      status: 'pending',
      createdAt: new Date(),
      scheduledAt: null
    };
    
    sessions.set(deviceId, session);
    return session.currentOrder;
  }

  static addItemToOrder(deviceId, item) {
    const session = this.getSession(deviceId);
    
    if (!session.currentOrder) {
      this.createOrder(deviceId);
    }
    
    session.currentOrder.items.push({
      id: uuidv4(),
      ...item,
      addedAt: new Date()
    });
    
    // Recalculate total
    session.currentOrder.total = session.currentOrder.items.reduce(
      (sum, orderItem) => sum + orderItem.price, 0
    );
    
    sessions.set(deviceId, session);
    return session.currentOrder;
  }

  static placeOrder(deviceId) {
    const session = this.getSession(deviceId);
    
    if (!session.currentOrder || session.currentOrder.items.length === 0) {
      return null;
    }
    
    session.currentOrder.status = 'placed';
    session.currentOrder.placedAt = new Date();
    
    sessions.set(deviceId, session);
    return session.currentOrder;
  }

  static completePayment(deviceId, paymentReference) {
    const session = this.getSession(deviceId);
    
    if (!session.currentOrder) {
      return null;
    }
    
    session.currentOrder.status = 'paid';
    session.currentOrder.paidAt = new Date();
    session.currentOrder.paymentReference = paymentReference;
    
    // Move to order history
    session.orderHistory.push({ ...session.currentOrder });
    session.currentOrder = null;
    session.chatState = 'main';
    
    sessions.set(deviceId, session);
    return session.orderHistory[session.orderHistory.length - 1];
  }

  static cancelOrder(deviceId) {
    const session = this.getSession(deviceId);
    
    if (session.currentOrder) {
      session.currentOrder.status = 'cancelled';
      session.currentOrder.cancelledAt = new Date();
      
      // Move to order history
      session.orderHistory.push({ ...session.currentOrder });
      session.currentOrder = null;
    }
    
    session.chatState = 'main';
    sessions.set(deviceId, session);
    return true;
  }

  static getOrderHistory(deviceId) {
    const session = this.getSession(deviceId);
    return session.orderHistory.filter(order => order.status !== 'cancelled');
  }

  static getCurrentOrder(deviceId) {
    const session = this.getSession(deviceId);
    return session.currentOrder;
  }

  static scheduleOrder(deviceId, scheduledAt) {
    const session = this.getSession(deviceId);
    
    if (session.currentOrder) {
      session.currentOrder.scheduledAt = new Date(scheduledAt);
      sessions.set(deviceId, session);
      return session.currentOrder;
    }
    
    return null;
  }

  static getScheduledOrders() {
    const now = new Date();
    const scheduledOrders = [];
    
    for (const [deviceId, session] of sessions) {
      if (session.currentOrder && 
          session.currentOrder.scheduledAt && 
          session.currentOrder.scheduledAt <= now &&
          session.currentOrder.status === 'placed') {
        scheduledOrders.push({
          deviceId,
          order: session.currentOrder
        });
      }
    }
    
    return scheduledOrders;
  }

  // Cleanup old sessions (optional)
  static cleanupOldSessions(maxAge = 24 * 60 * 60 * 1000) { // 24 hours
    const cutoff = new Date(Date.now() - maxAge);
    
    for (const [deviceId, session] of sessions) {
      if (session.lastActivity < cutoff) {
        sessions.delete(deviceId);
      }
    }
  }

  // Get all sessions (for debugging)
  static getAllSessions() {
    return Array.from(sessions.entries());
  }
}