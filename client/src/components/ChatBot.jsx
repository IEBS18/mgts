"use client";

import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { XCircle, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ReactMarkdown from "react-markdown";
import BotIcon from "../assets/BotIcon.png";

function ChatBot({ chatMessages, setChatMessages, fulldata, isMinimized, onToggle }) {
  const [newMessage, setNewMessage] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const lastMessageRef = useRef(null); // Reference to last message

  // Scroll to the start of the last message
  useEffect(() => {
    lastMessageRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [chatMessages]);

  const handleSendMessage = async () => {
    if (newMessage.trim() === "") return;

    const now = new Date();
    const timestamp = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    setChatMessages((prev) => [...prev, { type: "user", content: newMessage, timestamp }]);
    setChatMessages((prev) => [...prev, { type: "bot", content: "Analyzing...", timestamp }]);

    setIsAnalyzing(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: newMessage, results: fulldata }),
      });

      const result = await response.json();
      setChatMessages((prev) => [
        ...prev.slice(0, -1),
        { type: "bot", content: <ReactMarkdown>{result.results}</ReactMarkdown>, timestamp },
      ]);
    } catch (error) {
      setChatMessages((prev) => [
        ...prev.slice(0, -1),
        { type: "bot", content: "Error fetching response", timestamp },
      ]);
    } finally {
      setIsAnalyzing(false);
    }

    setNewMessage("");
  };

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <Button
        size="icon"
        className="w-14 h-14 rounded-full bg-[#688C05] hover:bg-[#4B6601] shadow-lg"
        onClick={onToggle}
      >
        <img src={BotIcon} alt="Bot Icon" className="w-12 h-12" />
      </Button>

      <AnimatePresence>
        {!isMinimized && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute bottom-20 right-0"
          >
            {/* Chat Bubble Pointer */}
            <div className="absolute -bottom-2 right-3 -translate-x-1/2 w-0 h-0 
              border-l-[10px] border-l-transparent 
              border-r-[10px] border-r-transparent 
              border-t-[10px] border-t-white
              z-[20]"
            ></div>
            
            <div className="w-[380px] bg-white rounded-lg shadow-lg overflow-hidden relative z-10">
              
              {/* Chat Header */}
              <div className="bg-[#4B6601] py-3 px-4">  
                <div className="flex items-center justify-between">
                  <h2 className="text-white font-semibold">PharmaX Bot</h2>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-white hover:text-white/80 hover:bg-white/10"
                    onClick={onToggle}
                  >
                    <XCircle className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="h-[250px] overflow-y-auto p-4 space-y-4">
                {chatMessages.map((message, index) => (
                  <div
                    key={index}
                    ref={index === chatMessages.length - 1 ? lastMessageRef : null} // Attach ref to last message
                    className={`flex flex-col ${message.type === "user" ? "items-end" : "items-start"}`}
                  >
                    {message.type === "bot" && (
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-8 h-8 rounded-full bg-[#688C05] flex items-center justify-center">
                          <img src={BotIcon} alt="Bot Icon" className="w-8 h-8" />
                        </div>
                        <span className="text-xs font-medium">Assistant</span>
                      </div>
                    )}
                    <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${message.type === "user" ? "bg-[#688C05] text-white rounded-br-none" : "bg-[#F1F7FF] text-gray-800 rounded-tl-none"}`}>
                      {typeof message.content === "string" ? message.content : message.content}
                    </div>
                    <span className="text-xs text-gray-500 mt-1">{message.timestamp}</span>
                  </div>
                ))}
              </div>

              {/* Input Field */}
              <div className="p-4 border-t">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex gap-2"
                >
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    disabled={isAnalyzing}
                    className="flex-1 bg-gray-100 border-0 focus-visible:ring-1 focus-visible:ring-[#688C05]"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={isAnalyzing}
                    className="bg-[#688C05] hover:bg-[#4B6601] text-white rounded-full"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


export default ChatBot;
