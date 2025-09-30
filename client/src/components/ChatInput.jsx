import React, { useState } from 'react';

/**
 * Chat input component
 */
export function ChatInput({ onSendMessage, isLoading }) {
  const [message, setMessage] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message);
      setMessage('');
    }
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="input-container">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Type your message..."
        className="message-input"
        disabled={isLoading}
        autoFocus
      />
      <button 
        type="submit" 
        className="send-button" 
        disabled={!message.trim() || isLoading}
      >
        {isLoading ? '...' : 'Send'}
      </button>
    </form>
  );
}