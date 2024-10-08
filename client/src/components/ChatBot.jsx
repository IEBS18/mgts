import React, { useState } from 'react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send } from 'lucide-react';

export default function ChatBot({ chatMessages, setChatMessages, list }) {
  const [newMessage, setNewMessage] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false); // Track analyzing state

  const handleSendMessage = async () => {
    if (newMessage.trim() === "") return; // Avoid sending empty messages

    // Add the user's message to the chat
    setChatMessages((prev) => [
      ...prev,
      { type: 'user', content: newMessage }
    ]);

    // Show "Analyzing..." as the bot's initial response
    setChatMessages((prev) => [
      ...prev,
      { type: 'bot', content: 'Analyzing...' }
    ]);

    setIsAnalyzing(true); // Set analyzing state to true

    try {
      // Make a POST request to the backend
      const response = await fetch('http://localhost:5000/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: newMessage, list: list })
      });

      const result = await response.json();
      console.log(result.list);

      // Replace "Analyzing..." with the actual response from the backend
      setChatMessages((prev) => [
        ...prev.slice(0, -1), // Remove the "Analyzing..." message
        { type: 'bot', content: result.results }
      ]);
    } catch (error) {
      console.error('Error making POST request:', error);
      setChatMessages((prev) => [
        ...prev.slice(0, -1), // Remove the "Analyzing..." message
        { type: 'bot', content: 'Error fetching response' }
      ]);
    } finally {
      setIsAnalyzing(false); // Reset analyzing state
    }

    // Clear the input
    setNewMessage("");
  };

  return (
    <div className="w-1/3 bg-white border-l border-gray-500 flex flex-col h-screen fixed top-0 right-0">
      <div className="p-4 border-b border-gray-500">
        <h2 className="text-lg font-semibold">Chat with Copilot</h2>
      </div>
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {chatMessages.map((message, index) => (
          <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex items-start space-x-2 ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <Avatar className={`w-8 h-8 ${message.type === 'user' ? 'bg-blue-500' : 'bg-gray-200'}`}>
                <AvatarFallback>{message.type === 'user' ? 'U' : 'B'}</AvatarFallback>
              </Avatar>
              <div className={`p-2 rounded-xl shadow-md ${message.type === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
                <p className="text-sm">{message.content}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-2">
          <Textarea
            placeholder="Type your message..."
            className="flex-1 rounded-lg"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={isAnalyzing} // Disable input while analyzing
          />
          <Button size="icon" onClick={handleSendMessage} disabled={isAnalyzing}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
