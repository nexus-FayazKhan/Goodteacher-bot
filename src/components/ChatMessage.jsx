import React from 'react';
import { format } from 'date-fns';

const ChatMessage = ({ message, isUser }) => {
  const formattedTime = message.timestamp 
    ? format(new Date(message.timestamp), 'h:mm a')
    : '';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-2xl p-3 ${
          isUser
            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-tr-none'
            : 'bg-gradient-to-r from-pink-400 to-purple-500 text-white rounded-tl-none'
        }`}
      >
        <div className="text-sm">{message.text}</div>
        <div className={`text-xs mt-1 ${isUser ? 'text-blue-100' : 'text-pink-100'}`}>
          {formattedTime}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;