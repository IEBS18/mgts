import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send, Minimize, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Input } from './ui/input';
import ReactMarkdown from 'react-markdown'; // Import react-markdown

export default function ChatBot({ chatMessages, setChatMessages, list, fulldata, isMinimized, onToggle, summaryResponse }) {
  const [newMessage, setNewMessage] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleSendMessage = async () => {
    if (newMessage.trim() === "") return;

    setChatMessages((prev) => [...prev, { type: 'user', content: newMessage }]);
    setChatMessages((prev) => [...prev, { type: 'bot', content: 'Analyzing...' }]);

    setIsAnalyzing(true);

    try {
      const response = await fetch('http://localhost:5000/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: newMessage, list, results: fulldata })
      });

      const result = await response.json();
      setChatMessages((prev) => [
        ...prev.slice(0, -1),
        { type: 'bot', content: <ReactMarkdown>{result.results}</ReactMarkdown>  }
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
          className="bg-[#95D524] text-white rounded-full p-4 shadow-lg h-12 w-12 flex justify-center items-center"
          onClick={onToggle}
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ height: '100px' }}
      animate={{ height: '100vh' }}
      exit={{ height: 0 }}
      className="fixed bottom-0 right-0 w-1/3 bg-white border-l border-gray-300 flex flex-col shadow-lg z-50"
      style={{ borderRadius: '16px', backdropFilter: 'blur(10px)' }}
    >
      <div className="p-4 flex justify-between items-center border-b border-gray-300">
        <h2 className="text-lg font-semibold">Chat with Copilot</h2>
        <Button variant="ghost" onClick={onToggle}>
          <Minimize className="h-6 w-6" />
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
              <Avatar className={`w-8 h-8 ${message.type === 'user' ? 'bg-blue-500' : 'bg-gray-200'}`}>
                <AvatarImage
                  src={message.type === 'user' ? '/path-to-user-avatar.png' : '/path-to-bot-avatar.png'}
                  alt={message.type === 'user' ? 'User' : 'Bot'}
                />
                <AvatarFallback>{message.type === 'user' ? 'U' : 'B'}</AvatarFallback>
              </Avatar>

              <div className={`p-2 rounded-xl shadow-md ${message.type === 'user' ? 'bg-blue-500 text-white' : 'bg-[#95D524] text-white'}`}>
                <p className="text-sm">
                  {message.content}
                </p>
              </div>
            </div>
          </motion.div>
        ))}

        {/* Display only markdown rendered content for summary */}
        {summaryResponse && (
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="flex justify-start"
          >
            <div className="flex items-start space-x-2">
              <Avatar className="w-8 h-8 bg-gray-200">
                <AvatarFallback>B</AvatarFallback>
              </Avatar>
              <div className="p-2 rounded-xl shadow-md bg-[#95D524] text-white">
                <ReactMarkdown>{summaryResponse}</ReactMarkdown> {/* Only markdown-rendered content */}
              </div>
            </div>
          </motion.div>
        )}
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
