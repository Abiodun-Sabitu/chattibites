/**
 * Restaurant menu items - hardcoded as specified
 */
export const MENU_ITEMS = [
  {
    id: 1,
    name: "Classic Burger",
    description: "Beef patty with lettuce, tomato, onion, and special sauce",
    price: 1500,
    category: "burgers",
    addOns: [
      { name: "Extra Cheese", price: 200 },
      { name: "Bacon", price: 300 },
      { name: "Avocado", price: 250 }
    ]
  },
  {
    id: 2,
    name: "Margherita Pizza",
    description: "Fresh mozzarella, tomato sauce, and basil",
    price: 2500,
    category: "pizza",
    addOns: [
      { name: "Extra Cheese", price: 300 },
      { name: "Pepperoni", price: 400 },
      { name: "Mushrooms", price: 200 }
    ]
  },
  {
    id: 3,
    name: "Chicken Caesar Salad",
    description: "Grilled chicken breast with romaine lettuce, croutons, and Caesar dressing",
    price: 1800,
    category: "salads",
    addOns: [
      { name: "Extra Chicken", price: 500 },
      { name: "Parmesan Cheese", price: 200 },
      { name: "Boiled Egg", price: 150 }
    ]
  },
  {
    id: 4,
    name: "Fish & Chips",
    description: "Crispy battered fish with golden fries and tartar sauce",
    price: 2200,
    category: "seafood",
    addOns: [
      { name: "Extra Fish", price: 800 },
      { name: "Mushy Peas", price: 200 },
      { name: "Coleslaw", price: 250 }
    ]
  },
  {
    id: 5,
    name: "Beef Stir Fry",
    description: "Tender beef strips with mixed vegetables and jasmine rice",
    price: 2000,
    category: "asian",
    addOns: [
      { name: "Extra Beef", price: 600 },
      { name: "Fried Rice", price: 300 },
      { name: "Spring Rolls", price: 400 }
    ]
  }
];

/**
 * Chat flow state machine and responses
 */
export const CHAT_STATES = {
  MAIN: 'main',
  ORDERING: 'ordering',
  CHECKOUT: 'checkout',
  ADD_ONS: 'addons'
};

export const MAIN_MENU_OPTIONS = {
  1: 'Place an order',
  99: 'Checkout order',
  98: 'View order history',
  97: 'View current order',
  0: 'Cancel order'
};

/**
 * Format currency in Naira
 */
export function formatCurrency(amount) {
  return `₦${amount.toLocaleString()}`;
}

/**
 * Generate welcome message with main menu
 */
export function getWelcomeMessage() {
  const options = Object.entries(MAIN_MENU_OPTIONS)
    .map(([key, value]) => `${key} → ${value}`)
    .join('\n');
    
  return `🍽️ Welcome to ChattiBites! 🍽️

Please select an option:

${options}

Just type the number of your choice!`;
}

/**
 * Generate food menu message
 */
export function getFoodMenuMessage() {
  const menuText = MENU_ITEMS
    .map(item => 
      `${item.id} → ${item.name}\n` +
      `   ${item.description}\n` +
      `   ${formatCurrency(item.price)}\n`
    )
    .join('\n');
    
  return `🍽️ Our Menu:\n\n${menuText}\nReply with the item number to add it to your order!`;
}

/**
 * Generate add-ons message for a specific item
 */
export function getAddOnsMessage(item) {
  if (!item.addOns || item.addOns.length === 0) {
    return null;
  }
  
  const addOnsText = item.addOns
    .map((addon, index) => 
      `${index + 1} → ${addon.name} (+${formatCurrency(addon.price)})`
    )
    .join('\n');
    
  return `🔥 Add-ons for ${item.name}:\n\n${addOnsText}\n\n0 → No add-ons\n\nSelect add-on numbers (e.g., "1,3" for multiple):`;
}

/**
 * Format order summary
 */
export function formatOrderSummary(order) {
  if (!order || !order.items || order.items.length === 0) {
    return "🛒 Your cart is empty.";
  }
  
  const itemsText = order.items
    .map(item => {
      let text = `• ${item.name} - ${formatCurrency(item.price)}`;
      if (item.addOns && item.addOns.length > 0) {
        const addOnsText = item.addOns
          .map(addon => `  + ${addon.name}`)
          .join('\n');
        text += `\n${addOnsText}`;
      }
      return text;
    })
    .join('\n\n');
    
  return `🛒 Current Order:\n\n${itemsText}\n\n💰 Total: ${formatCurrency(order.total)}`;
}

/**
 * Format order history
 */
export function formatOrderHistory(orders) {
  if (!orders || orders.length === 0) {
    return "📝 No previous orders found.";
  }
  
  const historyText = orders
    .slice(-5) // Show last 5 orders
    .map(order => {
      const date = new Date(order.createdAt).toLocaleDateString();
      const status = order.status.toUpperCase();
      const itemCount = order.items.length;
      
      return `📅 ${date} - ${status}\n` +
             `${itemCount} item(s) - ${formatCurrency(order.total)}`;
    })
    .join('\n\n');
    
  return `📝 Order History:\n\n${historyText}`;
}

/**
 * Get menu item by ID
 */
export function getMenuItem(itemId) {
  return MENU_ITEMS.find(item => item.id === parseInt(itemId));
}

/**
 * Validate user input for main menu
 */
export function isValidMainMenuOption(input) {
  const option = input.trim();
  return Object.keys(MAIN_MENU_OPTIONS).includes(option);
}

/**
 * Validate user input for food menu
 */
export function isValidFoodMenuOption(input) {
  const itemId = parseInt(input.trim());
  return MENU_ITEMS.some(item => item.id === itemId);
}

/**
 * Parse add-ons selection
 */
export function parseAddOnsSelection(input, item) {
  if (input.trim() === '0') {
    return [];
  }
  
  const selections = input.split(',')
    .map(s => parseInt(s.trim()) - 1)
    .filter(index => index >= 0 && index < item.addOns.length);
    
  return selections.map(index => item.addOns[index]);
}

/**
 * Calculate item price with add-ons
 */
export function calculateItemPrice(basePrice, addOns = []) {
  const addOnsTotal = addOns.reduce((sum, addon) => sum + addon.price, 0);
  return basePrice + addOnsTotal;
}