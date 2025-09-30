# ChattiBites - Restaurant Chatbot Web App

A modern restaurant chatbot web application built with React and Express.js, featuring automated ordering, payment processing via Paystack, and session management.

## 🚀 Features

### Core Functionality
- **Chat Interface**: Interactive chat-style interface with bot and user message bubbles
- **Session Management**: Device-based user tracking without authentication
- **Order Management**: Place, view, modify, and cancel orders
- **Payment Integration**: Secure payment processing with Paystack
- **Order History**: View previous orders and their status
- **Responsive Design**: Works seamlessly on desktop and mobile devices

### Menu System
- **Hardcoded Menu**: 5 delicious food items with descriptions and prices
- **Add-ons Support**: Optional extras for each menu item
- **Real-time Pricing**: Dynamic price calculation with add-ons
- **Order Summary**: Live cart updates and total calculation

### Payment Processing
- **Paystack Integration**: Secure payment gateway with test and live modes
- **Payment Verification**: Automatic payment status checking
- **Webhook Support**: Real-time payment status updates
- **Order Status Tracking**: From pending to paid status updates

### Optional Features
- **Order Scheduling**: Schedule orders for later (with cron job support)
- **Session Cleanup**: Automatic cleanup of old sessions

## 🛠 Tech Stack

### Backend
- **Node.js** with **Express.js** framework
- **ES6 Modules** for modern JavaScript
- **In-memory storage** using Map (easily replaceable with database)
- **Paystack SDK** for payment processing
- **node-cron** for scheduled tasks
- **CORS** and **Helmet** for security

### Frontend
- **React 18** with functional components and hooks
- **Vite** for fast development and building
- **Axios** for API communication
- **UUID** for device ID generation
- **Modern CSS** with flexbox and animations

## 📁 Project Structure

```
chattibites/
├── server/                     # Backend API
│   ├── controllers/           # Request handlers
│   │   ├── chatController.js  # Chat logic
│   │   └── paymentController.js # Payment processing
│   ├── routes/               # Express routes
│   │   ├── chat.js          # Chat endpoints
│   │   └── payment.js       # Payment endpoints
│   ├── services/            # Business logic
│   │   ├── sessionService.js # Session management
│   │   ├── menuService.js   # Menu and formatting
│   │   ├── paystackService.js # Payment integration
│   │   └── scheduler.js     # Cron jobs
│   ├── index.js            # Server entry point
│   ├── package.json        # Dependencies
│   └── .env.example        # Environment template
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── ChatHeader.jsx
│   │   │   ├── ChatMessages.jsx
│   │   │   ├── ChatInput.jsx
│   │   │   └── Message.jsx
│   │   ├── hooks/         # Custom hooks
│   │   │   └── useChat.js
│   │   ├── services/      # API services
│   │   │   ├── api.js
│   │   │   └── deviceId.js
│   │   ├── App.jsx        # Main component
│   │   ├── main.jsx       # React entry point
│   │   └── index.css      # Styles
│   ├── index.html         # HTML template
│   ├── vite.config.js     # Vite configuration
│   ├── package.json       # Dependencies
│   └── .env.example       # Environment template
├── package.json           # Workspace scripts
└── README.md             # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Paystack account (for payment processing)

### 1. Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd chattibites

# Install all dependencies
npm run install:all
```

### 2. Environment Setup

#### Server Configuration
```bash
cd server
cp .env.example .env
```

Edit `server/.env`:
```env
NODE_ENV=development
PORT=3001
CLIENT_URL=http://localhost:5173
PAYSTACK_SECRET_KEY=sk_test_your_secret_key_here
PAYSTACK_PUBLIC_KEY=pk_test_your_public_key_here
```

#### Client Configuration
```bash
cd ../client
cp .env.example .env
```

Edit `client/.env`:
```env
VITE_API_URL=http://localhost:3001/api
```

### 3. Get Paystack Keys

1. Sign up at [Paystack](https://paystack.com)
2. Get your test keys from the dashboard
3. Add them to your `server/.env` file

### 4. Run the Application

```bash
# From the root directory, run both server and client
npm run dev

# Or run separately:
npm run dev:server  # Runs on http://localhost:3001
npm run dev:client  # Runs on http://localhost:5173
```

## 💬 How to Use

### For Users

1. **Open the app** at `http://localhost:5173`
2. **Start chatting** - The bot will greet you with menu options
3. **Select option** by typing the number:
   - `1` → Place an order
   - `99` → Checkout order  
   - `98` → View order history
   - `97` → View current order
   - `0` → Cancel order

### Ordering Flow

1. **Type `1`** to start ordering
2. **Choose items** by typing the item number (1-5)
3. **Select add-ons** if available (comma-separated for multiple)
4. **Continue ordering** or type `0` to return to main menu
5. **Type `99`** to checkout when ready
6. **Click "Pay Now"** to complete payment via Paystack

### Menu Items

1. **Classic Burger** - ₦1,500
   - Add-ons: Extra Cheese (+₦200), Bacon (+₦300), Avocado (+₦250)

2. **Margherita Pizza** - ₦2,500
   - Add-ons: Extra Cheese (+₦300), Pepperoni (+₦400), Mushrooms (+₦200)

3. **Chicken Caesar Salad** - ₦1,800
   - Add-ons: Extra Chicken (+₦500), Parmesan (+₦200), Boiled Egg (+₦150)

4. **Fish & Chips** - ₦2,200
   - Add-ons: Extra Fish (+₦800), Mushy Peas (+₦200), Coleslaw (+₦250)

5. **Beef Stir Fry** - ₦2,000
   - Add-ons: Extra Beef (+₦600), Fried Rice (+₦300), Spring Rolls (+₦400)

## 🔧 API Endpoints

### Chat Endpoints
- `GET /api/chat/welcome?deviceId={id}` - Get welcome message
- `POST /api/chat/message` - Send chat message

### Payment Endpoints
- `POST /api/payment/initialize` - Initialize payment
- `GET /api/payment/verify/{reference}` - Verify payment
- `POST /api/payment/webhook` - Paystack webhook
- `GET /api/payment/status/{deviceId}/{orderId}` - Get payment status

### Health Check
- `GET /health` - Server health check

## 🔒 Security Features

- **CORS Protection**: Configured for specific origins
- **Helmet Security**: HTTP security headers
- **Input Validation**: All user inputs are validated
- **Environment Variables**: Sensitive data in environment files
- **Webhook Verification**: Paystack webhook signature verification

## 🎨 Customization

### Adding New Menu Items

Edit `server/services/menuService.js`:

```javascript
export const MENU_ITEMS = [
  {
    id: 6,
    name: "New Item",
    description: "Description here",
    price: 1000,
    category: "category",
    addOns: [
      { name: "Add-on", price: 200 }
    ]
  },
  // ... existing items
];
```

### Modifying Chat Responses

Update messages in `server/services/menuService.js`:

```javascript
export function getWelcomeMessage() {
  return `🍽️ Welcome to ChattiBites! 🍽️
  
Custom welcome message here...`;
}
```

### Styling Changes

Modify `client/src/index.css` for visual customizations:

```css
.chat-container {
  /* Your custom styles */
}
```

## 🚀 Deployment

### Server Deployment (Heroku Example)

```bash
# In server directory
echo "web: node index.js" > Procfile

# Set environment variables in Heroku dashboard
heroku config:set NODE_ENV=production
heroku config:set PAYSTACK_SECRET_KEY=sk_live_...
heroku config:set CLIENT_URL=https://your-client-domain.com
```

### Client Deployment (Vercel Example)

```bash
# In client directory
npm run build

# Deploy to Vercel
vercel --prod

# Set environment variable
# VITE_API_URL=https://your-server-domain.com/api
```

### Environment Variables for Production

#### Server (Production)
```env
NODE_ENV=production
PORT=443
CLIENT_URL=https://your-frontend-domain.com
PAYSTACK_SECRET_KEY=sk_live_your_live_secret_key
PAYSTACK_PUBLIC_KEY=pk_live_your_live_public_key
```

#### Client (Production)
```env
VITE_API_URL=https://your-backend-domain.com/api
```

## 🧪 Testing

### Manual Testing Checklist

1. **Chat Flow**
   - [ ] Welcome message displays
   - [ ] All menu options work (1, 97, 98, 99, 0)
   - [ ] Food ordering works
   - [ ] Add-ons selection works
   - [ ] Order summary displays correctly

2. **Payment Flow**
   - [ ] Checkout initiates payment
   - [ ] Payment URL opens correctly
   - [ ] Payment verification works
   - [ ] Order status updates after payment

3. **Session Management**
   - [ ] Device ID persists across refreshes
   - [ ] Order history saves correctly
   - [ ] Current order maintains state

### Testing with Paystack

Use Paystack test cards:
- **Success**: `4084084084084081`
- **Insufficient Funds**: `4084084084084099`
- **Invalid PIN**: `4084084084084016`

## 🐛 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check `CLIENT_URL` in server `.env`
   - Ensure correct API URL in client `.env`

2. **Payment Initialization Fails**
   - Verify Paystack keys are correct
   - Check if using test keys in development

3. **Messages Not Sending**
   - Check server is running on correct port
   - Verify API endpoints are accessible

4. **Session Issues**
   - Clear localStorage: `localStorage.clear()`
   - Check device ID generation

### Debug Mode

Set `NODE_ENV=development` for detailed error messages.

## 📝 License

MIT License - feel free to use this project for learning and development.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For issues and questions:
1. Check this README
2. Review the code comments
3. Test with Paystack test cards
4. Check browser console for errors

---

**Happy coding! 🍽️ Enjoy building with ChattiBites!**