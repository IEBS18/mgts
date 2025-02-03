// Chatbot.jsx
import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Send, Minimize, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Input } from './ui/input';
import ReactMarkdown from 'react-markdown'; // Import react-markdown
import BotIcon from '../assets/BotIcon.png'

export default function ChatBot({ chatMessages, setChatMessages, fulldata, isMinimized, onToggle }) {
  const [newMessage, setNewMessage] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleSendMessage = async () => {
    if (newMessage.trim() === "") return;

    setChatMessages((prev) => [...prev, { type: 'user', content: newMessage }]);
    setChatMessages((prev) => [...prev, { type: 'bot', content: 'Analyzing...' }]);

    setIsAnalyzing(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: newMessage, results: fulldata })
      });

      const result = await response.json();
      setChatMessages((prev) => [
        ...prev.slice(0, -1),
        { type: 'bot', content: <ReactMarkdown>{result.results}</ReactMarkdown> }
      ]);
    } catch (error) {
      setChatMessages((prev) => [
        ...prev.slice(0, -1),
        { type: 'bot', content: 'Error fetching response' }
      ]);
    } finally {
      setIsAnalyzing(false);
    }

    setNewMessage("");
  };

  // Only display the floating icon when minimized
  if (isMinimized) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed bottom-6 right-6 z-50"
        style={{ height: 'auto' }}
      >
        <Button
          variant="ghost"
          className=""
          onClick={onToggle}
        >
          {/* <MessageCircle className="h-6 w-6" /> */}
          <img src={BotIcon} alt="Bot Icon" className="w-12 h-12" />
        </Button>
      </motion.div>
    );
  }

  return (

    <motion.div
      initial={{ height: '100px' }}
      animate={{ height: '75vh' }}
      exit={{ height: 0 }}
      className="fixed right-0 w-1/3 bg-white border-l border-gray-300 flex flex-col shadow-lg z-50"
      style={{ borderRadius: '16px', backdropFilter: 'blur(10px)', top: 'calc(25vh)' }}
    >
      <div className="p-4 flex justify-between bg-[#4B6601] rounded-t-[16px] items-center border-b border-gray-300">
        <h2 className="text-lg font-semibold text-white">PharmaX Bot</h2>
        <Button variant="ghost" onClick={onToggle}>
          <Minimize className="h-6 w-6 text-white" />
        </Button>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-4">
        {chatMessages.map((message, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: message.type === 'user' ? 50 : -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex items-start space-x-2 ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
              {message.type === 'bot' && (
                <div className="w-8 h-8 flex justify-center items-center">
                  <img src={BotIcon} alt="Bot Icon" className="w-8 h-8" />
                </div>
              )}

              <div
                className={`p-2 shadow-md ${message.type === 'bot' ? 'bg-[#F1F7FF] rounded-b-[12px] rounded-tr-[12px] text-black' : 'bg-[#688C05] rounded-b-[12px] rounded-tl-[12px] text-white'
                  }`}
              >
                <p className="text-sm font-medium">{message.content}</p>
              </div>
            </div>

          </motion.div>
        ))}
      </div>

      <div className="p-4 border-t border-gray-300">
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Type your message..."
            className="flex-1 rounded-lg border-2 border-[#95D524] focus:border-[#95D524] focus:ring-[#95D524] hover:border-[#95D524] transition duration-200 ease-in-out"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={isAnalyzing}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSendMessage();
              }
            }}
          />
          <Button size="icon" onClick={handleSendMessage} disabled={isAnalyzing}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
