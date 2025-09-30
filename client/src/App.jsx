import React from 'react';
import { useChat } from './hooks/useChat';
import { ChatHeader } from './components/ChatHeader';
import { ChatMessages } from './components/ChatMessages';
import { ChatInput } from './components/ChatInput';

function App() {
  const {
    messages,
    isLoading,
    sendMessage,
    initializePayment,
    messagesEndRef
  } = useChat();
  
  const handlePaymentClick = (orderId) => {
    initializePayment(orderId);
  };
  
  return (
    <div className="chat-container">
      <ChatHeader />
      
      <ChatMessages 
        messages={messages}
        isLoading={isLoading}
        onPaymentClick={handlePaymentClick}
        messagesEndRef={messagesEndRef}
      />
      
      <ChatInput 
        onSendMessage={sendMessage}
        isLoading={isLoading}
      />
    </div>
  );
}

export default App;