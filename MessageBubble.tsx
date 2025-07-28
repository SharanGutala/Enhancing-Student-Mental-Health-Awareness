import React from 'react';
import { Message } from '../types';
import { BotIcon, UserIcon } from './IconComponents';
import type { FontSize } from '../App';

const TypingIndicator = (): React.ReactNode => (
  <div className="flex items-center space-x-1.5 p-3">
    <div className="w-2 h-2 bg-black rounded-full animate-bounce [animation-delay:-0.3s]"></div>
    <div className="w-2 h-2 bg-black rounded-full animate-bounce [animation-delay:-0.15s]"></div>
    <div className="w-2 h-2 bg-black rounded-full animate-bounce"></div>
  </div>
);


interface MessageBubbleProps {
  message: Message;
  fontSize: FontSize;
}

const MessageBubble = ({ message, fontSize }: MessageBubbleProps): React.ReactNode => {
  const isBot = message.sender === 'bot';

  const fontClass = {
    sm: 'text-xs',
    base: 'text-sm',
    lg: 'text-base',
  }[fontSize];

  if (isBot && message.text === '...') {
    return (
      <div className="flex items-start gap-3 my-4 justify-start">
        <div className="w-10 h-10 flex-shrink-0 bg-white border-2 border-black flex items-center justify-center text-black">
          <BotIcon />
        </div>
        <div
          className="max-w-md bg-white border-2 border-black shadow-hard"
        >
          <TypingIndicator />
        </div>
      </div>
    );
  }


  return (
    <div className={`flex items-start gap-3 my-4 ${isBot ? 'justify-start' : 'justify-end'}`}>
      {isBot && (
        <div className="w-10 h-10 flex-shrink-0 bg-white border-2 border-black flex items-center justify-center text-black">
          <BotIcon />
        </div>
      )}
      <div
        className={`max-w-md p-3 border-2 border-black shadow-hard text-black ${
          isBot ? 'bg-white' : 'bg-brand-accent'
        }`}
      >
        <p className={`${fontClass} leading-relaxed whitespace-pre-wrap`}>{message.text}</p>
      </div>
       {!isBot && (
        <div className="w-10 h-10 flex-shrink-0 bg-white border-2 border-black flex items-center justify-center text-black">
          <UserIcon />
        </div>
      )}
    </div>
  );
};

export default MessageBubble;