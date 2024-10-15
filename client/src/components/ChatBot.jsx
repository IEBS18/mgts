// import React, { useState } from 'react';
// import { Avatar, AvatarFallback } from "@/components/ui/avatar";
// import { Textarea } from "@/components/ui/textarea";
// import { Button } from "@/components/ui/button";
// import { Send } from 'lucide-react';

// export default function ChatBot({ chatMessages, setChatMessages, list, fulldata }) {
//   const [newMessage, setNewMessage] = useState("");
//   const [isAnalyzing, setIsAnalyzing] = useState(false); // Track analyzing state

//   const handleSendMessage = async () => {
//     if (newMessage.trim() === "") return; // Avoid sending empty messages

//     // Add the user's message to the chat
//     setChatMessages((prev) => [
//       ...prev,
//       { type: 'user', content: newMessage }
//     ]);

//     // Show "Analyzing..." as the bot's initial response
//     setChatMessages((prev) => [
//       ...prev,
//       { type: 'bot', content: 'Analyzing...' }
//     ]);

//     setIsAnalyzing(true); // Set analyzing state to true

//     try {
//       // Make a POST request to the backend
//       const response = await fetch('http://54.211.78.164:5000/chatbot', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ query: newMessage, list: list , results: fulldata })
//       });

//       const result = await response.json();
//       console.log(result.list);

//       // Replace "Analyzing..." with the actual response from the backend
//       setChatMessages((prev) => [
//         ...prev.slice(0, -1), // Remove the "Analyzing..." message
//         { type: 'bot', content: result.results }
//       ]);
//     } catch (error) {
//       console.error('Error making POST request:', error);
//       setChatMessages((prev) => [
//         ...prev.slice(0, -1), // Remove the "Analyzing..." message
//         { type: 'bot', content: 'Error fetching response' }
//       ]);
//     } finally {
//       setIsAnalyzing(false); // Reset analyzing state
//     }

//     // Clear the input
//     setNewMessage("");
//   };

//   return (
//     <div className="w-1/3 bg-white border-l border-gray-500 flex flex-col h-screen fixed top-0 right-0">
//       <div className="p-4 border-b border-gray-500">
//         <h2 className="text-lg font-semibold">Chat with Copilot</h2>
//       </div>
//       <div className="flex-1 overflow-auto p-4 space-y-4">
//         {chatMessages.map((message, index) => (
//           <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
//             <div className={`flex items-start space-x-2 ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
//               <Avatar className={`w-8 h-8 ${message.type === 'user' ? 'bg-blue-500' : 'bg-gray-200'}`}>
//                 <AvatarFallback>{message.type === 'user' ? 'U' : 'B'}</AvatarFallback>
//               </Avatar>
//               <div className={`p-2 rounded-xl shadow-md ${message.type === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
//                 <p className="text-sm">{message.content}</p>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>
//       <div className="p-4 border-t border-gray-200">
//         <div className="flex items-center space-x-2">
//           <Textarea
//             placeholder="Type your message..."
//             className="flex-1 rounded-lg"
//             value={newMessage}
//             onChange={(e) => setNewMessage(e.target.value)}
//             disabled={isAnalyzing} // Disable input while analyzing
//           />
//           <Button size="icon" onClick={handleSendMessage} disabled={isAnalyzing}>
//             <Send className="h-4 w-4" />
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// }


// import React, { useState } from 'react';
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { Textarea } from "@/components/ui/textarea";
// import { Button } from "@/components/ui/button";
// import { Send } from 'lucide-react';
// import { motion } from 'framer-motion'; // Framer Motion for animations

// export default function ChatBot({ chatMessages, setChatMessages, list, fulldata }) {
//   const [newMessage, setNewMessage] = useState("");
//   const [isAnalyzing, setIsAnalyzing] = useState(false);

//   const handleSendMessage = async () => {
//     if (newMessage.trim() === "") return;

//     // Add the user's message to the chat
//     setChatMessages((prev) => [...prev, { type: 'user', content: newMessage }]);
//     setChatMessages((prev) => [...prev, { type: 'bot', content: 'Analyzing...' }]);

//     setIsAnalyzing(true);

//     try {
//       const response = await fetch('http://54.211.78.164:5000/chatbot', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ query: newMessage, list, results: fulldata })
//       });

//       const result = await response.json();

//       // Replace "Analyzing..." with actual bot response
//       setChatMessages((prev) => [
//         ...prev.slice(0, -1),
//         { type: 'bot', content: result.results }
//       ]);
//     } catch (error) {
//       setChatMessages((prev) => [
//         ...prev.slice(0, -1),
//         { type: 'bot', content: 'Error fetching response' }
//       ]);
//     } finally {
//       setIsAnalyzing(false);
//     }

//     setNewMessage("");
//   };

//   return (
//     <div className="w-1/3 bg-white border-l border-gray-500 flex flex-col h-screen fixed top-0 right-0">
//       <div className="p-4 border-b border-gray-500">
//         <h2 className="text-lg font-semibold">Chat with Copilot</h2>
//       </div>

//       <div className="flex-1 overflow-auto p-4 space-y-4">
//         {chatMessages.map((message, index) => (
//           <motion.div 
//             key={index} 
//             initial={{ opacity: 0, x: message.type === 'user' ? 50 : -50 }} 
//             animate={{ opacity: 1, x: 0 }} 
//             transition={{ type: 'spring', stiffness: 300, damping: 30 }}
//             className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
//           >
//             <div className={`flex items-start space-x-2 ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
//               <Avatar className={`w-8 h-8 ${message.type === 'user' ? 'bg-blue-500' : 'bg-gray-200'}`}>
//                 <AvatarImage 
//                   src={message.type === 'user' ? '/path-to-user-avatar.png' : '/path-to-bot-avatar.png'} 
//                   alt={message.type === 'user' ? 'User' : 'Bot'} 
//                 />
//                 <AvatarFallback>{message.type === 'user' ? 'U' : 'B'}</AvatarFallback>
//               </Avatar>

//               <div className={`p-2 rounded-xl shadow-md ${message.type === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
//                 <p className="text-sm">{message.content}</p>
//               </div>
//             </div>
//           </motion.div>
//         ))}
//       </div>

//       <div className="p-4 border-t border-gray-200">
//         <div className="flex items-center space-x-2">
//           <Textarea
//             placeholder="Type your message..."
//             className="flex-1 rounded-lg"
//             value={newMessage}
//             onChange={(e) => setNewMessage(e.target.value)}
//             disabled={isAnalyzing}
//           />
//           <Button size="icon" onClick={handleSendMessage} disabled={isAnalyzing}>
//             <Send className="h-4 w-4" />
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// }

// import React, { useState } from 'react';
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { Textarea } from "@/components/ui/textarea";
// import { Button } from "@/components/ui/button";
// import { Send, Minimize, ChevronUp } from 'lucide-react';
// import { motion } from 'framer-motion';

// export default function ChatBot({ chatMessages, setChatMessages, list, fulldata, isMinimized, onToggle }) {
//   const [newMessage, setNewMessage] = useState("");
//   const [isAnalyzing, setIsAnalyzing] = useState(false);

//   const handleSendMessage = async () => {
//     if (newMessage.trim() === "") return;

//     setChatMessages((prev) => [...prev, { type: 'user', content: newMessage }]);
//     setChatMessages((prev) => [...prev, { type: 'bot', content: 'Analyzing...' }]);

//     setIsAnalyzing(true);

//     try {
//       const response = await fetch('http://54.211.78.164:5000/chatbot', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ query: newMessage, list, results: fulldata })
//       });

//       const result = await response.json();

//       setChatMessages((prev) => [
//         ...prev.slice(0, -1),
//         { type: 'bot', content: result.results }
//       ]);
//     } catch (error) {
//       setChatMessages((prev) => [
//         ...prev.slice(0, -1),
//         { type: 'bot', content: 'Error fetching response' }
//       ]);
//     } finally {
//       setIsAnalyzing(false);
//     }

//     setNewMessage("");
//   };

//   if (isMinimized) {
//     return (
//       <motion.div
//         initial={{ height: '40px' }}
//         animate={{ height: '40px' }} // Reduced height for minimized state
//         exit={{ height: 0 }}
//         className="fixed bottom-0 right-0 w-1/3 bg-white border-t border-gray-300 flex items-center justify-between shadow-lg z-50"
//       >
//         <span className="ml-4">Chat with Copilot</span>
//         <Button variant="ghost" onClick={onToggle}>
//           <ChevronUp className="h-6 w-6" />
//         </Button>
//       </motion.div>
//     );
//   }

//   return (
//     <motion.div
//       initial={{ height: '100px' }}
//       animate={{ height: '100vh' }} // Full height when expanded
//       exit={{ height: 0 }}
//       className="fixed bottom-0 right-0 w-1/3 bg-white border-l border-gray-300 flex flex-col shadow-lg z-50"
//       style={{ borderRadius: '16px', backdropFilter: 'blur(10px)' }}
//     >
//       <div className="p-4 flex justify-between items-center border-b border-gray-300">
//         <h2 className="text-lg font-semibold">Chat with Copilot</h2>
//         <Button variant="ghost" onClick={onToggle}>
//           <Minimize className="h-6 w-6" />
//         </Button>
//       </div>

//       <div className="flex-1 overflow-auto p-4 space-y-4">
//         {chatMessages.map((message, index) => (
//           <motion.div
//             key={index}
//             initial={{ opacity: 0, x: message.type === 'user' ? 50 : -50 }}
//             animate={{ opacity: 1, x: 0 }}
//             transition={{ type: 'spring', stiffness: 300, damping: 30 }}
//             className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
//           >
//             <div className={`flex items-start space-x-2 ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
//               <Avatar className={`w-8 h-8 ${message.type === 'user' ? 'bg-blue-500' : 'bg-gray-200'}`}>
//                 <AvatarImage
//                   src={message.type === 'user' ? '/path-to-user-avatar.png' : '/path-to-bot-avatar.png'}
//                   alt={message.type === 'user' ? 'User' : 'Bot'}
//                 />
//                 <AvatarFallback>{message.type === 'user' ? 'U' : 'B'}</AvatarFallback>
//               </Avatar>

//               <div className={`p-2 rounded-xl shadow-md ${message.type === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
//                 <p className="text-sm">{message.content}</p>
//               </div>
//             </div>
//           </motion.div>
//         ))}
//       </div>

//       <div className="p-4 border-t border-gray-300">
//         <div className="flex items-center space-x-2">
//           <Textarea
//             placeholder="Type your message..."
//             className="flex-1 rounded-lg"
//             value={newMessage}
//             onChange={(e) => setNewMessage(e.target.value)}
//             disabled={isAnalyzing}
//           />
//           <Button size="icon" onClick={handleSendMessage} disabled={isAnalyzing}>
//             <Send className="h-4 w-4" />
//           </Button>
//         </div>
//       </div>
//     </motion.div>
//   );
// }


import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send, Minimize, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Input } from './ui/input';

export default function ChatBot({ chatMessages, setChatMessages, list, fulldata, isMinimized, onToggle }) {
  const [newMessage, setNewMessage] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleSendMessage = async () => {
    if (newMessage.trim() === "") return;

    setChatMessages((prev) => [...prev, { type: 'user', content: newMessage }]);
    setChatMessages((prev) => [...prev, { type: 'bot', content: 'Analyzing...' }]);

    setIsAnalyzing(true);

    try {
      const response = await fetch('http://54.211.78.164:5000/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: newMessage, list, results: fulldata })
      });

      const result = await response.json();

      setChatMessages((prev) => [
        ...prev.slice(0, -1),
        { type: 'bot', content: result.results }
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

  if (isMinimized) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }} // Ensure smooth fade-in effect
        className="fixed bottom-6 right-6 z-50"
        style={{ height: 'auto' }} // Fix height issue by explicitly setting it to auto
      >
        <Button
          variant="ghost"
          className="bg-[#95D524] text-white rounded-full p-4 shadow-lg h-12 w-12 flex justify-center items-center" // Fixed size for button
          onClick={onToggle}
        >
          <MessageCircle className="h-6 w-6" /> {/* Chat icon */}
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ height: '100px' }}
      animate={{ height: '100vh' }} // Full height when expanded
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

              <div
                className={`p-2 rounded-xl shadow-md ${message.type === 'user' ? 'bg-blue-500 text-white' : 'bg-[#95D524] text-white'}`} // Bot message with green background
              >
                <p className="text-sm">{message.content}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="p-4 border-t border-gray-300">
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Type your message..."
            className="flex-1 rounded-lg"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={isAnalyzing}
          />
          <Button size="icon" onClick={handleSendMessage} disabled={isAnalyzing}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
