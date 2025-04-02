"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatBubbleLeftIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [conversationId, setConversationId] = useState<string | null>(null);

  // Check for dark mode on mount
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('light-mode') ? false : true;
    setIsDarkMode(isDark);
  }, []);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle sending messages
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now(),
      text: inputMessage,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Use environment-aware API URL
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      console.log('Using API URL:', apiUrl);
      
      const response = await fetch(`${apiUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
          conversation_id: conversationId,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API response not OK:', response.status, errorText);
        throw new Error(`Failed to get response from chatbot: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      
      // Update conversation ID if it's a new conversation
      if (!conversationId) {
        setConversationId(data.conversation_id);
      }

      // Add bot response to messages
      const botMessage: Message = {
        id: Date.now(),
        text: data.response,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error:', error);
      // Add error message to chat
      const errorMessage: Message = {
        id: Date.now(),
        text: "I apologize, but I'm having trouble connecting to the server. Please try again later.",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Chat Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 p-4 rounded-full shadow-lg z-50 ${
          isDarkMode 
            ? 'bg-gradient-to-r from-red-600 to-yellow-500 text-white' 
            : 'bg-gradient-to-r from-blue-600 to-blue-400 text-white'
        }`}
        aria-label="Open chat"
      >
        <ChatBubbleLeftIcon className="w-6 h-6" />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`fixed bottom-24 right-6 w-96 h-[600px] rounded-lg shadow-xl z-50 overflow-hidden ${
              isDarkMode 
                ? 'bg-[#1a1a1a] border border-gray-800' 
                : 'bg-white border border-gray-200'
            }`}
          >
            {/* Chat Header */}
            <div className={`p-4 border-b ${
              isDarkMode ? 'border-gray-800' : 'border-gray-200'
            } flex justify-between items-center`}>
              <h3 className={`font-semibold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>Chat with me</h3>
              <button
                onClick={() => setIsOpen(false)}
                className={`p-1 rounded-full hover:bg-opacity-20 ${
                  isDarkMode ? 'hover:bg-white' : 'hover:bg-gray-900'
                }`}
              >
                <XMarkIcon className={`w-5 h-5 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`} />
              </button>
            </div>

            {/* Messages Container */}
            <div className="h-[calc(100%-8rem)] overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.isUser
                        ? isDarkMode
                          ? 'bg-gradient-to-r from-red-600 to-yellow-500 text-white'
                          : 'bg-gradient-to-r from-blue-600 to-blue-400 text-white'
                        : isDarkMode
                          ? 'bg-gray-800 text-white'
                          : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                    <span className={`text-xs mt-1 block ${
                      message.isUser
                        ? isDarkMode
                          ? 'text-white/70'
                          : 'text-white/70'
                        : isDarkMode
                          ? 'text-gray-400'
                          : 'text-gray-500'
                    }`}>
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className={`max-w-[80%] rounded-lg p-3 ${
                    isDarkMode ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-900'
                  }`}>
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className={`p-4 border-t ${
              isDarkMode ? 'border-gray-800' : 'border-gray-200'
            }`}>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Type your message..."
                  disabled={isLoading}
                  className={`flex-1 rounded-lg px-4 py-2 text-sm focus:outline-none ${
                    isDarkMode
                      ? 'bg-gray-800 text-white placeholder-gray-400'
                      : 'bg-gray-100 text-gray-900 placeholder-gray-500'
                  }`}
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    isDarkMode
                      ? 'bg-gradient-to-r from-red-600 to-yellow-500 text-white'
                      : 'bg-gradient-to-r from-blue-600 to-blue-400 text-white'
                  } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  Send
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbot; 