import { SessionService } from '../services/sessionService.js';
import {
  getWelcomeMessage,
  getFoodMenuMessage,
  getAddOnsMessage,
  formatOrderSummary,
  formatOrderHistory,
  getMenuItem,
  isValidMainMenuOption,
  isValidFoodMenuOption,
  parseAddOnsSelection,
  calculateItemPrice,
  CHAT_STATES,
  MAIN_MENU_OPTIONS
} from '../services/menuService.js';

export class ChatController {
  /**
   * Handle chat messages from users
   */
  static async handleMessage(req, res) {
    try {
      const { deviceId, message } = req.body;
      
      if (!deviceId || !message) {
        return res.status(400).json({
          reply: 'Device ID and message are required.'
        });
      }
      
      const session = SessionService.getSession(deviceId);
      const userInput = message.toString().trim();
      
      let response;
      
      // Handle based on current chat state
      switch (session.chatState) {
        case CHAT_STATES.MAIN:
          response = await ChatController.handleMainMenu(deviceId, userInput);
          break;
          
        case CHAT_STATES.ORDERING:
          response = await ChatController.handleFoodOrdering(deviceId, userInput);
          break;
          
        case CHAT_STATES.ADD_ONS:
          response = await ChatController.handleAddOns(deviceId, userInput);
          break;
          
        default:
          response = { reply: getWelcomeMessage() };
          SessionService.updateSession(deviceId, { chatState: CHAT_STATES.MAIN });
      }
      
      res.json(response);
      
    } catch (error) {
      console.error('Chat error:', error);
      res.status(500).json({
        reply: 'Sorry, something went wrong. Please try again.'
      });
    }
  }
  
  /**
   * Handle main menu selections
   */
  static async handleMainMenu(deviceId, input) {
    if (!isValidMainMenuOption(input)) {
      return {
        reply: `Invalid option. ${getWelcomeMessage()}`
      };
    }
    
    const option = input;
    
    switch (option) {
      case '1': // Place an order
        SessionService.updateSession(deviceId, { chatState: CHAT_STATES.ORDERING });
        return {
          reply: getFoodMenuMessage()
        };
        
      case '99': // Checkout order
        return await ChatController.handleCheckout(deviceId);
        
      case '98': // View order history
        const history = SessionService.getOrderHistory(deviceId);
        return {
          reply: formatOrderHistory(history)
        };
        
      case '97': // View current order
        const currentOrder = SessionService.getCurrentOrder(deviceId);
        return {
          reply: formatOrderSummary(currentOrder)
        };
        
      case '0': // Cancel order
        SessionService.cancelOrder(deviceId);
        return {
          reply: '❌ Order cancelled. How can I help you today?\\n\\n' + getWelcomeMessage()
        };
        
      default:
        return {
          reply: getWelcomeMessage()
        };
    }
  }
  
  /**
   * Handle food item selection
   */
  static async handleFoodOrdering(deviceId, input) {
    // Check if user wants to go back to main menu
    if (input === '0' || input.toLowerCase() === 'back') {
      SessionService.updateSession(deviceId, { chatState: CHAT_STATES.MAIN });
      return {
        reply: getWelcomeMessage()
      };
    }
    
    if (!isValidFoodMenuOption(input)) {
      return {
        reply: 'Invalid selection. Please choose a valid item number:\\n\\n' + getFoodMenuMessage()
      };
    }
    
    const itemId = parseInt(input);
    const menuItem = getMenuItem(itemId);
    
    if (!menuItem) {
      return {
        reply: 'Item not found. Please try again:\\n\\n' + getFoodMenuMessage()
      };
    }
    
    // Check if item has add-ons
    if (menuItem.addOns && menuItem.addOns.length > 0) {
      // Store selected item in session temporarily
      SessionService.updateSession(deviceId, { 
        chatState: CHAT_STATES.ADD_ONS,
        selectedItem: menuItem
      });
      
      return {
        reply: getAddOnsMessage(menuItem)
      };
    } else {
      // Add item without add-ons
      const orderItem = {
        name: menuItem.name,
        price: menuItem.price,
        basePrice: menuItem.price,
        addOns: []
      };
      
      SessionService.addItemToOrder(deviceId, orderItem);
      const currentOrder = SessionService.getCurrentOrder(deviceId);
      
      return {
        reply: `✅ ${menuItem.name} added to your order!\\n\\n${formatOrderSummary(currentOrder)}\\n\\nContinue ordering or type '0' to return to main menu.`
      };
    }
  }
  
  /**
   * Handle add-ons selection
   */
  static async handleAddOns(deviceId, input) {
    const session = SessionService.getSession(deviceId);
    const selectedItem = session.selectedItem;
    
    if (!selectedItem) {
      SessionService.updateSession(deviceId, { chatState: CHAT_STATES.MAIN });
      return {
        reply: 'Session expired. Please start over.\\n\\n' + getWelcomeMessage()
      };
    }
    
    const selectedAddOns = parseAddOnsSelection(input, selectedItem);
    const totalPrice = calculateItemPrice(selectedItem.price, selectedAddOns);
    
    const orderItem = {
      name: selectedItem.name,
      price: totalPrice,
      basePrice: selectedItem.price,
      addOns: selectedAddOns
    };
    
    SessionService.addItemToOrder(deviceId, orderItem);
    
    // Clear selected item and return to ordering state
    SessionService.updateSession(deviceId, { 
      chatState: CHAT_STATES.ORDERING,
      selectedItem: null
    });
    
    const currentOrder = SessionService.getCurrentOrder(deviceId);
    let addOnsText = '';
    
    if (selectedAddOns.length > 0) {
      addOnsText = ' with ' + selectedAddOns.map(addon => addon.name).join(', ');
    }
    
    return {
      reply: `✅ ${selectedItem.name}${addOnsText} added to your order!\\n\\n${formatOrderSummary(currentOrder)}\\n\\nContinue ordering or type '0' to return to main menu.`
    };
  }
  
  /**
   * Handle checkout process
   */
  static async handleCheckout(deviceId) {
    const currentOrder = SessionService.getCurrentOrder(deviceId);
    
    if (!currentOrder || !currentOrder.items || currentOrder.items.length === 0) {
      return {
        reply: '🛒 No order to place. Would you like to start a new order?\\n\\n' + getWelcomeMessage()
      };
    }
    
    // Place the order (mark as placed)
    const placedOrder = SessionService.placeOrder(deviceId);
    
    return {
      reply: `🎉 Order placed successfully!\\n\\n${formatOrderSummary(placedOrder)}\\n\\n💳 Proceeding to payment...`,
      orderId: placedOrder.id,
      requiresPayment: true
    };
  }
  
  /**
   * Get initial welcome message
   */
  static async getWelcome(req, res) {
    try {
      const { deviceId } = req.query;
      
      if (!deviceId) {
        return res.status(400).json({
          reply: 'Device ID is required.'
        });
      }
      
      // Initialize session
      SessionService.getSession(deviceId);
      
      res.json({
        reply: getWelcomeMessage()
      });
      
    } catch (error) {
      console.error('Welcome error:', error);
      res.status(500).json({
        reply: 'Sorry, something went wrong. Please try again.'
      });
    }
  }
}