import React, { useState, useRef } from "react";
import { Bell } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import SearchResults from "./SearchResults";
import Pagination from "./Pagination";
import ChatBot from "./ChatBot";

export default function Dashboard() {
  const workflows = [
    { id: 1, title: "Search Drugs and Diseases", description: "Find approved and pipeline drugs" },
    { id: 2, title: "Research Paper and Patents", description: "Find scientific research papers and patents " },
    { id: 3, title: "Find Clinical Data", description: "Access and analyze clinical trial data" }
  ];

  const [query, setQuery] = useState("");
  const [resultquery, setResultQuery] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchData, setSearchData] = useState([]);
  const [list, setList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isChatMinimized, setIsChatMinimized] = useState(true);
  const itemsPerPage = 10;
  const searchResultsRef = useRef(null);
  const [allData, setAllData] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [summaryResponse, setSummaryResponse] = useState(""); // To store summary

  const handleSearch = async () => {
    setIsLoading(true);
    setIsChatMinimized(false);
    setChatMessages([{ type: "user", content: query }]);
    setChatMessages((prev) => [...prev, { type: "bot", content: "Working on it...", bgColor: "bg-blue-200" }]);

    try {
      const response = await fetch("http://localhost:5000/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword: query }),
      });

      const result = await response.json();
      setAllData(result.documents);
      setSearchData(result.documents);
      setResultQuery(result.query);
      setList(result.drugdisease);

      setChatMessages((prev) => [
        ...prev,
        { type: 'bot', content: `Showing ${result?.documents?.length} Relevant Documents`, bgColor: 'bg-blue-200' }
      ]);
    } catch (error) {
      console.error("Error making POST request:", error);
      setChatMessages((prev) => [
        ...prev,
        {
          type: "bot",
          content: "Sorry, an error occurred while processing your request.",
          bgColor: "bg-red-200",
        },
      ]);
    } finally {
      setIsLoading(false);
      if (searchResultsRef.current) {
        searchResultsRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const handleChatToggle = () => {
    setIsChatMinimized(!isChatMinimized);
  };

  const handleWorkflowClick = (id) => {
    if (selectedCard === id) {
      setSearchData(allData);
      setSelectedCard(null);
    } else {
      setSelectedCard(id);
      if (id === 1) {
        const filteredData = allData.filter((doc) => doc.type === "drugdisease");
        setSearchData(filteredData);
      }
      else if (id === 2) {
        const filteredData = allData.filter((doc) => doc.type === "pubmed" || doc.type === "pregranted");
        setSearchData(filteredData);
        setCurrentPage(1);
      }
      else if (id === 3) {
        const filteredData = allData.filter((doc) => doc.type === "clinicaltrial");
        setSearchData(filteredData);
        setCurrentPage(1);
      }
      // Add logic for other workflows if needed
    }
    setCurrentPage(1);
  };

  const handleSummaryGenerated = (summary) => {
    setSummaryResponse(summary);  // Save the generated summary
    // Remove the raw "Summary:" message and pass it only as markdown
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentData = searchData ? searchData?.slice(indexOfFirstItem, indexOfLastItem) : [];
  const totalPages = searchData ? Math.ceil(searchData?.length / itemsPerPage) : 0;

  return (
    <div className={`flex h-full bg-gray-100 transition-all duration-300 ${isChatMinimized ? "w-full" : "w-2/3"}`}>
      <div className="flex-1">
        <main className="flex-1 p-8 overflow-auto">
          <div className={`${isChatMinimized ? "max-w-4xl" : "max-w-2xl"} mx-auto`}>
            <header className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold">
                Welcome to <span className="text-[#95D524]">PharmaX</span> Copilot
                <span className="text-sm font-normal bg-yellow-200 px-2 py-1 rounded ml-2">BETA</span>
              </h1>
              <Bell className="h-6 w-6" />
            </header>

            <div className="mb-8 flex">
              <Input
                type="text"
                placeholder="Enter your search query"
                className="w-full mr-2 rounded-lg border-2 border-[#95D524] focus:border-[#95D524] focus:ring-[#95D524] hover:border-[#95D524] transition duration-200 ease-in-out"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <Button
                variant="secondary"
                onClick={handleSearch}
                className="ml-2 bg-[#95D524] rounded-lg hover:bg-black hover:text-white"
                disabled={isLoading}
              >
                {isLoading ? "Searching..." : "Search"}
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
                  className={`p-6 bg-white rounded-lg shadow-lg cursor-pointer transition-transform ${selectedCard === workflow.id ? 'translate-y-2' : ''}`}
                  style={{
                    border: selectedCard === workflow.id ? '2px solid #000' : '2px solid #95D524',
                    borderRadius: '8px',
                    boxShadow: '0px 6px 15px rgba(0, 0, 0, 0.1)',
                    minHeight: '100px',
                  }}
                  onClick={() => handleWorkflowClick(workflow.id)}
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
            {searchData?.length > 0 && (
              <div className="space-y-8" ref={searchResultsRef}>
                <SearchResults data={currentData} length={searchData.length} fulldata={searchData} query={resultquery} onSummaryGenerated={handleSummaryGenerated} />
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
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
        summaryResponse={summaryResponse} // Pass the summary response to chatbot
      />
    </div>
  );
}

