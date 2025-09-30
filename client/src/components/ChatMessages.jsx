import React from 'react';
import { Message, TypingIndicator } from './Message';

/**
 * Chat messages container
 */
export function ChatMessages({ messages, isLoading, onPaymentClick, messagesEndRef }) {
  return (
    <div className="messages-container">
      {messages.map((message) => (
        <Message 
          key={message.id} 
          message={message} 
          onPaymentClick={onPaymentClick}
        />
      ))}
      
      {isLoading && <TypingIndicator />}
      
      <div ref={messagesEndRef} />
    </div>
  );
}