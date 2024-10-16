// import React, { useState, useRef } from 'react';
// import { Bell } from 'lucide-react';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import SearchResults from './SearchResults';
// import Pagination from './Pagination';
// import ChatBot from './ChatBot'; // Import the new ChatBot component

// export default function Dashboard() {
//   const workflows = [
//     { title: "Search Drugs", description: "Find approved and pipeline drugs" },
//     { title: "Research Disease Epidemiology", description: "Research disease epidemiology and patient population" },
//     { title: "Summarize Company Earnings", description: "Summarize company earnings for a given timeframe" },
//     { title: "Find Clinical Data", description: "Access and analyze clinical trial data" },
//   ];

//   const [query, setQuery] = useState("");
//   const [chatMessages, setChatMessages] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [searchData, setSearchData] = useState([]);
//   const [list, setList] = useState([]);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [isChatOpen, setIsChatOpen] = useState(false);
//   const itemsPerPage = 10;
//   const searchResultsRef = useRef(null);

//   const handleSearch = async () => {
//     setIsLoading(true);
//     setIsChatOpen(true); // Open the chat when a search is performed
//     setChatMessages([{ type: 'user', content: query }]);
//     setChatMessages(prev => [...prev, { type: 'bot', content: 'Working on it...', bgColor: 'bg-blue-200' }]);

//     try {
//       const response = await fetch('http://54.211.78.164:5000/search', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ 'keyword': query }),
//       });

//       const result = await response.json();
//       setSearchData(result.results); // Update search data state
//       setList(result.list);
//       // Once results are fetched, update chatbot message with the count
//       setChatMessages(prev => [
//         ...prev,
//         { type: 'bot', content: `Showing ${(result?.results).length} Relevant Documents`, bgColor: 'bg-blue-200' }
//       ]);
//     } catch (error) {
//       console.error('Error making POST request:', error);
//       setChatMessages(prev => [
//         ...prev,
//         { type: 'bot', content: 'Sorry, an error occurred while processing your request.', bgColor: 'bg-red-200' }
//       ]);
//     } finally {
//       setIsLoading(false);
//       if (searchResultsRef.current) {
//         searchResultsRef.current.scrollIntoView({ behavior: 'smooth' }); // Scroll to search results
//       }
//     }
//   };

//   const indexOfLastItem = currentPage * itemsPerPage;
//   const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//   const currentData = searchData ? searchData.slice(indexOfFirstItem, indexOfLastItem) : [];

//   const totalPages = searchData ? Math.ceil(searchData.length / itemsPerPage) : 0;

//   return (
//     <div className={`flex h-full bg-gray-100 ${isChatOpen ? 'w-2/3' : 'w-full'} transition-all duration-300`}>
//       <div className={`flex-1`}>
//         {/* Main Content */}
//         <main className="flex-1 p-8 overflow-auto">
//           <div className="max-w-4xl mx-auto">
//             <header className="flex justify-between items-center mb-8">
//               <h1 className="text-3xl font-bold">
//                 Welcome to PharmaX Copilot <span className="text-sm font-normal bg-yellow-200 px-2 py-1 rounded">BETA</span>
//               </h1>
//               <Bell className="h-6 w-6" />
//             </header>

//             <div className="mb-8 flex">
//               <Input
//                 type="text"
//                 placeholder="Enter your search query"
//                 className="w-full mr-2"
//                 value={query}
//                 onChange={(e) => setQuery(e.target.value)}
//               />
//               <Button variant="secondary" onClick={handleSearch} className="ml-2" disabled={isLoading}>
//                 {isLoading ? 'Searching...' : 'Search'}
//               </Button>
//             </div>
//             {searchData.length === 0 && (
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 {workflows.map((workflow, index) => (
//                   <Card key={index} className='rounded-lg border bg-background shadow-sm'>
//                     <CardHeader>
//                       <CardTitle>{workflow.title}</CardTitle>
//                     </CardHeader>
//                     <CardContent>
//                       <CardDescription>{workflow.description}</CardDescription>
//                     </CardContent>
//                   </Card>
//                 ))}
//               </div>
//             )}

//             {/* Display Search Results */}
//             {searchData.length > 0 && (
//               <div className="space-y-8">
//                 <SearchResults data={currentData} length={searchData.length} fulldata={searchData} />
//                 <Pagination
//                   currentPage={currentPage}
//                   totalPages={totalPages}
//                   onPageChange={setCurrentPage}
//                 />
//               </div>
//             )}
//           </div>
//         </main>
//       </div>

//       {/* ChatBot */}
//       {isChatOpen && (
//         <ChatBot chatMessages={chatMessages} setChatMessages={setChatMessages} list={list} fulldata ={searchData} />
//       )}
//     </div>
//   );
// }

// import React, { useState, useRef } from 'react';
// import { Bell } from 'lucide-react';
// import { motion } from 'framer-motion'; // Import Framer Motion
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import SearchResults from './SearchResults';
// import Pagination from './Pagination';
// import ChatBot from './ChatBot';

// export default function Dashboard() {
//   const workflows = [
//     { title: "Search Drugs", description: "Find approved and pipeline drugs" },
//     { title: "Research Disease Epidemiology", description: "Research disease epidemiology and patient population" },
//     { title: "Summarize Company Earnings", description: "Summarize company earnings for a given timeframe" },
//     { title: "Find Clinical Data", description: "Access and analyze clinical trial data" },
//   ];

//   const [query, setQuery] = useState("");
//   const [chatMessages, setChatMessages] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [searchData, setSearchData] = useState([]);
//   const [list, setList] = useState([]);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [isChatOpen, setIsChatOpen] = useState(false);
//   const itemsPerPage = 10;
//   const searchResultsRef = useRef(null);

//   const handleSearch = async () => {
//     setIsLoading(true);
//     setIsChatOpen(true); // Open the chat when a search is performed
//     setChatMessages([{ type: 'user', content: query }]);
//     setChatMessages(prev => [...prev, { type: 'bot', content: 'Working on it...', bgColor: 'bg-blue-200' }]);

//     try {
//       const response = await fetch('http://54.211.78.164:5000/search', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ 'keyword': query }),
//       });

//       const result = await response.json();
//       setSearchData(result.results);
//       setList(result.list);

//       // Update chatbot with the number of results
//       setChatMessages(prev => [
//         ...prev,
//         { type: 'bot', content: `Showing ${(result?.results).length} Relevant Documents`, bgColor: 'bg-blue-200' }
//       ]);
//     } catch (error) {
//       console.error('Error making POST request:', error);
//       setChatMessages(prev => [
//         ...prev,
//         { type: 'bot', content: 'Sorry, an error occurred while processing your request.', bgColor: 'bg-red-200' }
//       ]);
//     } finally {
//       setIsLoading(false);
//       if (searchResultsRef.current) {
//         searchResultsRef.current.scrollIntoView({ behavior: 'smooth' });
//       }
//     }
//   };

//   const indexOfLastItem = currentPage * itemsPerPage;
//   const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//   const currentData = searchData ? searchData.slice(indexOfFirstItem, indexOfLastItem) : [];

//   const totalPages = searchData ? Math.ceil(searchData.length / itemsPerPage) : 0;

//   return (
//     <div className={`flex h-full bg-gray-100 ${isChatOpen ? 'w-2/3' : 'w-full'} transition-all duration-300`}>
//       <div className="flex-1">
//         <main className="flex-1 p-8 overflow-auto">
//           <div className="max-w-4xl mx-auto">
//             <header className="flex justify-between items-center mb-8">
//               <h1 className="text-3xl font-bold">
//                 Welcome to PharmaX Copilot <span className="text-sm font-normal bg-yellow-200 px-2 py-1 rounded">BETA</span>
//               </h1>
//               <Bell className="h-6 w-6" />
//             </header>

//             <div className="mb-8 flex">
//               <Input
//                 type="text"
//                 placeholder="Enter your search query"
//                 className="w-full mr-2"
//                 value={query}
//                 onChange={(e) => setQuery(e.target.value)}
//               />
//               <Button variant="secondary" onClick={handleSearch} className="ml-2" disabled={isLoading}>
//                 {isLoading ? 'Searching...' : 'Search'}
//               </Button>
//             </div>

//             {searchData.length === 0 && (
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 {workflows.map((workflow, index) => (
//                   <motion.div 
//                     key={index} 
//                     initial={{ opacity: 0, y: 20 }} 
//                     animate={{ opacity: 1, y: 0 }} 
//                     transition={{ delay: index * 0.1 }}
//                   >
//                     <Card className='rounded-lg border bg-background shadow-sm'>
//                       <CardHeader>
//                         <CardTitle>{workflow.title}</CardTitle>
//                       </CardHeader>
//                       <CardContent>
//                         <CardDescription>{workflow.description}</CardDescription>
//                       </CardContent>
//                     </Card>
//                   </motion.div>
//                 ))}
//               </div>
//             )}

//             {/* Display Search Results */}
//             {searchData.length > 0 && (
//               <div className="space-y-8" ref={searchResultsRef}>
//                 <SearchResults data={currentData} length={searchData.length} fulldata={searchData} />
//                 <Pagination
//                   currentPage={currentPage}
//                   totalPages={totalPages}
//                   onPageChange={setCurrentPage}
//                 />
//               </div>
//             )}
//           </div>
//         </main>
//       </div>

//       {/* ChatBot */}
//       {isChatOpen && (
//         <ChatBot chatMessages={chatMessages} setChatMessages={setChatMessages} list={list} fulldata={searchData} />
//       )}
//     </div>
//   );
// }

import React, { useState, useRef } from 'react';
import { Bell } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import SearchResults from './SearchResults';
import Pagination from './Pagination';
import ChatBot from './ChatBot';

export default function Dashboard() {
  const workflows = [
    { title: "Search Drugs and Diseases", description: "Find approved and pipeline drugs" },
    { title: "Research Disease Epidemiology", description: "Research disease epidemiology and patient population" },
    { title: "Find Clinical Data", description: "Access and analyze clinical trial data" }
  ];

  const [query, setQuery] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchData, setSearchData] = useState([]);
  const [list, setList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isChatMinimized, setIsChatMinimized] = useState(true); // Start with chat minimized
  const itemsPerPage = 10;
  const searchResultsRef = useRef(null);

  const handleSearch = async () => {
    setIsLoading(true);
    setIsChatMinimized(false); // Automatically expand chatbot on search
    setChatMessages([{ type: 'user', content: query }]);
    setChatMessages(prev => [...prev, { type: 'bot', content: 'Working on it...', bgColor: 'bg-blue-200' }]);

    try {
      const response = await fetch('http://localhost:5000/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 'keyword': query }),
      });

      const result = await response.json();
      console.log(result);
      setSearchData(result);
      setList(result);

      setChatMessages(prev => [
        ...prev,
        { type: 'bot', content: `Showing ${result?.length} Relevant Documents`, bgColor: 'bg-blue-200' }
      ]);
    } catch (error) {
      console.error('Error making POST request:', error);
      setChatMessages(prev => [
        ...prev,
        { type: 'bot', content: 'Sorry, an error occurred while processing your request.', bgColor: 'bg-red-200' }
      ]);
    } finally {
      setIsLoading(false);
      if (searchResultsRef.current) {
        searchResultsRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleChatToggle = () => {
    setIsChatMinimized(!isChatMinimized); // Toggle chat minimized state
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentData = searchData ? searchData.slice(indexOfFirstItem, indexOfLastItem) : [];
  const totalPages = searchData ? Math.ceil(searchData.length / itemsPerPage) : 0;

  return (
    <div className={`flex h-full bg-gray-100 transition-all duration-300 ${isChatMinimized ? 'w-full' : 'w-2/3'}`}>
      <div className="flex-1">
        <main className="flex-1 p-8 overflow-auto">
          <div className="max-w-4xl mx-auto">
            <header className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold">
                Welcome to PharmaX Copilot <span className="text-sm font-normal bg-yellow-200 px-2 py-1 rounded">BETA</span>
              </h1>
              <Bell className="h-6 w-6" />
            </header>

            <div className="mb-8 flex">
              <Input
                type="text"
                placeholder="Enter your search query"
                className="w-full mr-2 rounded-lg"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <Button variant="secondary" onClick={handleSearch} className="ml-2 bg-[#95D524] rounded-lg hover:bg-black hover:text-white" disabled={isLoading}>
                {isLoading ? 'Searching...' : 'Search'}
              </Button>
            </div>

            {/* Workflow Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {workflows.map((workflow, index) => (
                  <motion.div 
                    key={index} 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    whileHover={{ boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.1)' }}
                    transition={{ delay: index * 0.1 }}
                    className="p-6 bg-white rounded-lg shadow-lg cursor-pointer"
                    style={{
                      border: '2px solid #95D524', // Green border
                      borderRadius: '8px',
                      boxShadow: '0px 6px 15px rgba(0, 0, 0, 0.1)', // Regular box shadow
                      minHeight: '100px', // Uniform height for all boxes
                    }}
                  >
                    <Card className='border-none'>
                      <CardHeader>
                        <CardTitle className="text-[20px] font-bold">{workflow.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription>{workflow.description}</CardDescription>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            

            {/* Display Search Results */}
            {searchData.length > 0 && (
              <div className="space-y-8" ref={searchResultsRef}>
                <SearchResults data={currentData} length={searchData.length} fulldata={searchData} />
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ChatBot with Minimize Button */}
      <ChatBot
        chatMessages={chatMessages}
        setChatMessages={setChatMessages}
        list={list}
        fulldata={searchData}
        isMinimized={isChatMinimized}
        onToggle={handleChatToggle}
      />
    </div>
  );
}
