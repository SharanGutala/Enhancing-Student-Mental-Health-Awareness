import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Message } from '../types';
import { startChat } from '../services/geminiService';
import MessageBubble from './MessageBubble';
import { SendIcon, Gamepad2 } from './IconComponents';
import type { Chat } from '@google/genai';
import type { FontSize } from '../App';


interface ChatInterfaceProps {
  onSwitchToGame: () => void;
  fontSize: FontSize;
}

const ChatInterface = ({ onSwitchToGame, fontSize }: ChatInterfaceProps): React.ReactNode => {
  const [messages, setMessages] = useState<Message[]>([
    { id: 'init', text: "Hi there, it's nice to see you. I'm KRISH. Feel free to share what's on your mind—I'm here to listen without judgment.", sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatRef.current = startChat();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = useCallback(async () => {
    if (input.trim() === '' || isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    const botMessageId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: botMessageId, text: '...', sender: 'bot' }]);
    
    try {
        if (!chatRef.current) {
            throw new Error("Chat not initialized");
        }
        const stream = await chatRef.current.sendMessageStream({ message: currentInput });

        let fullResponse = '';
        for await (const chunk of stream) {
            fullResponse += chunk.text;
            setMessages(prev => prev.map(msg => 
                msg.id === botMessageId ? { ...msg, text: fullResponse } : msg
            ));
        }
    } catch (error) {
        console.error("Error sending message:", error);
        setMessages(prev => prev.map(msg => 
            msg.id === botMessageId ? { ...msg, text: "Sorry, I encountered an error. Please try again." } : msg
        ));
    } finally {
        setIsLoading(false);
    }
  }, [input, isLoading]);

  return (
    <div className="flex flex-col h-full p-4">
      <div className="flex-1 overflow-y-auto px-4 -mx-4">
        <div className="px-4">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} fontSize={fontSize} />
            ))}
            <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="mt-auto border-t-2 border-black pt-4 bg-gray-50">
        <div className="flex items-center gap-2">
           <button
            onClick={onSwitchToGame}
            className="p-3 text-black border-2 border-black bg-white shadow-hard hover:bg-gray-100 transition-all active:shadow-none active:translate-y-px active:translate-x-px"
            aria-label="Play a game"
          >
            <Gamepad2 />
          </button>
          <form
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex-1 flex items-center bg-white border-2 border-black shadow-hard"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="w-full bg-transparent p-2.5 pl-4 text-black focus:outline-none"
              disabled={isLoading}
              aria-label="Chat input"
            />
            <button
              type="submit"
              disabled={isLoading || input.trim() === ''}
              className="p-3 text-black bg-brand-accent border-l-2 border-black hover:bg-red-400 disabled:bg-gray-400 disabled:text-gray-600 disabled:cursor-not-allowed transition-colors"
              aria-label="Send message"
            >
              <SendIcon />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;