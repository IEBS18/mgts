// import React, { useState, useRef } from 'react'
// import { Bell, Send } from 'lucide-react'
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Input } from "@/components/ui/input"
// import { Button } from "@/components/ui/button"
// import { Avatar, AvatarFallback } from "@/components/ui/avatar"
// import { Textarea } from "@/components/ui/textarea"
// import SearchResults from './SearchResults'
// import Pagination from './Pagination'

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
//   const [currentPage, setCurrentPage] = useState(1)
//   const [isChatOpen, setIsChatOpen] = useState(false);
//   const itemsPerPage = 10
//   const searchResultsRef = useRef(null);

//   const handleSearch = async () => {
//     setIsLoading(true);
//     setIsChatOpen(true);
//     setChatMessages([{ type: 'user', content: query }]);
//     setChatMessages(prev => [...prev, { type: 'bot', content: 'Working on it...', bgColor: 'bg-blue-200' }]);

//     try {
//       const response = await fetch('http://localhost:5000/search', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ 'keyword': query }),
//       });

//       const result = await response.json();
//       setSearchData(result); // Update search data state

//       // Once results are fetched, update chatbot message with the count
//       setChatMessages(prev => [
//         ...prev,
//         { type: 'bot', content: `Showing ${result.length} Relevant Documents`, bgColor: 'bg-blue-200' }
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

//   const indexOfLastItem = currentPage * itemsPerPage
//   const indexOfFirstItem = indexOfLastItem - itemsPerPage
//   const currentData = searchData ? searchData.slice(indexOfFirstItem, indexOfLastItem) : []

//   const totalPages = searchData ? Math.ceil(searchData.length / itemsPerPage) : 0

//   return (
//     <div className={`flex h-full bg-gray-100 ${isChatOpen ? "w-2/3" : "w-full"}`}>
//       <div className="flex-1 flex">
//         {/* Main Content */}
//         <main className="flex-1 p-8 overflow-auto">
//           <div className="max-w-4xl mx-auto">
//             <header className="flex justify-between items-center mb-8">
//               <h1 className="text-3xl font-bold">Welcome to PharmaX Copilot <span className="text-sm font-normal bg-yellow-200 px-2 py-1 rounded">BETA</span></h1>
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
//             <div className="space-y-8">
//             <SearchResults data={currentData} length={searchData.length} fulldata={searchData} />
//             <Pagination
//               currentPage={currentPage}
//               totalPages={totalPages}
//               onPageChange={setCurrentPage}
//             />
//           </div>
//             )}
//           </div>
//         </main>

//         {/* Chat Interface */}
//         {chatMessages.length > 0 && (
//           <div className="w-1/3 bg-white border-l border-gray-500 flex flex-col h-screen fixed top-0 right-0">
//             <div className="p-4 border-b border-gray-500">
//               <h2 className="text-lg font-semibold">Chat with Copilot</h2>
//             </div>
//             <div className="flex-1 overflow-auto p-4 space-y-4">
//               {chatMessages.map((message, index) => (
//                 <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
//                   <div className={`flex items-start space-x-2 ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
//                     <Avatar className={`w-8 h-8 ${message.type === 'user' ? 'bg-blue-500' : 'bg-gray-200'}`}>
//                       <AvatarFallback>{message.type === 'user' ? 'U' : 'B'}</AvatarFallback>
//                     </Avatar>
//                     <div className={`p-2 rounded-xl shadow-md ${message.type === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
//                       <p className="text-sm">{message.content}</p>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//             <div className="p-4 border-t border-gray-200">
//               <div className="flex items-center space-x-2">
//                 <Textarea placeholder="Type your message..." className="flex-1 rounded-lg" />
//                 <Button size="icon">
//                   <Send className="h-4 w-4" />
//                 </Button>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }


import React, { useState, useRef } from 'react';
import { Bell } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import SearchResults from './SearchResults';
import Pagination from './Pagination';
import ChatBot from './ChatBot'; // Import the new ChatBot component

export default function Dashboard() {
  const workflows = [
    { title: "Search Drugs", description: "Find approved and pipeline drugs" },
    { title: "Research Disease Epidemiology", description: "Research disease epidemiology and patient population" },
    { title: "Summarize Company Earnings", description: "Summarize company earnings for a given timeframe" },
    { title: "Find Clinical Data", description: "Access and analyze clinical trial data" },
  ];

  const [query, setQuery] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchData, setSearchData] = useState([]);
  const [list, setList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const itemsPerPage = 10;
  const searchResultsRef = useRef(null);

  const handleSearch = async () => {
    setIsLoading(true);
    setIsChatOpen(true); // Open the chat when a search is performed
    setChatMessages([{ type: 'user', content: query }]);
    setChatMessages(prev => [...prev, { type: 'bot', content: 'Working on it...', bgColor: 'bg-blue-200' }]);

    try {
      const response = await fetch('http://54.211.78.164:5000/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 'keyword': query }),
      });

      const result = await response.json();
      setSearchData(result.results); // Update search data state
      setList(result.list);
      // Once results are fetched, update chatbot message with the count
      setChatMessages(prev => [
        ...prev,
        { type: 'bot', content: `Showing ${(result?.results).length} Relevant Documents`, bgColor: 'bg-blue-200' }
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
        searchResultsRef.current.scrollIntoView({ behavior: 'smooth' }); // Scroll to search results
      }
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentData = searchData ? searchData.slice(indexOfFirstItem, indexOfLastItem) : [];

  const totalPages = searchData ? Math.ceil(searchData.length / itemsPerPage) : 0;

  return (
    <div className={`flex h-full bg-gray-100 ${isChatOpen ? 'w-2/3' : 'w-full'} transition-all duration-300`}>
      <div className={`flex-1`}>
        {/* Main Content */}
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
                className="w-full mr-2"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <Button variant="secondary" onClick={handleSearch} className="ml-2" disabled={isLoading}>
                {isLoading ? 'Searching...' : 'Search'}
              </Button>
            </div>
            {searchData.length === 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {workflows.map((workflow, index) => (
                  <Card key={index} className='rounded-lg border bg-background shadow-sm'>
                    <CardHeader>
                      <CardTitle>{workflow.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription>{workflow.description}</CardDescription>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Display Search Results */}
            {searchData.length > 0 && (
              <div className="space-y-8">
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

      {/* ChatBot */}
      {isChatOpen && (
        <ChatBot chatMessages={chatMessages} setChatMessages={setChatMessages} list={list} fulldata ={searchData} />
      )}
    </div>
  );
}


