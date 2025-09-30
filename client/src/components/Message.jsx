import React from 'react';

/**
 * Individual message component
 */
export function Message({ message, onPaymentClick }) {
  const { type, content, timestamp, orderId, requiresPayment } = message;
  
  const formatTime = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  const formatMessageContent = (text) => {
    // Replace \n with actual line breaks
    return text.split('\\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        {index < text.split('\\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };
  
  return (
    <div className={`message ${type}`}>
      <div className="message-avatar">
        {type === 'bot' ? '🤖' : '👤'}
      </div>
      <div className="message-content">
        <div className="message-bubble">
          {formatMessageContent(content)}
          
          {/* Payment button for checkout responses */}
          {requiresPayment && orderId && (
            <div style={{ marginTop: '0.75rem' }}>
              <button 
                className="payment-button"
                onClick={() => onPaymentClick(orderId)}
              >
                💳 Pay Now
              </button>
            </div>
          )}
        </div>
        <div className="message-time">
          {formatTime(timestamp)}
        </div>
      </div>
    </div>
  );
}

/**
 * Typing indicator component
 */
export function TypingIndicator() {
  return (
    <div className="message bot">
      <div className="message-avatar">🤖</div>
      <div className="typing-indicator">
        <span>ChattiBites is typing</span>
        <div className="typing-dots">
          <div className="typing-dot"></div>
          <div className="typing-dot"></div>
          <div className="typing-dot"></div>
        </div>
      </div>
    </div>
  );
}