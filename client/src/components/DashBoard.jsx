import React, { useState } from 'react'
import { Bell } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import SearchResults from './SearchResults'

export default function Dashboard() {
  const workflows = [
    { title: "Search Drugs", description: "Find approved and pipeline drugs" },
    { title: "Research Disease Epidemiology", description: "Research disease epidemiology and patient population" },
    { title: "Summarize Company Earnings", description: "Summarize company earnings for a given timeframe" },
    { title: "Find Clinical Data", description: "Access and analyze clinical trial data" },
  ]

  const [query, setQuery] = useState("");
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1); // Track the current page
  const itemsPerPage = 10; // Number of items to show per page

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 'keyword': query }),
      });

      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error making POST request:', error);
    } finally {
      setIsLoading(false);
    }
  }

  // Get current page data
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentData = data ? data.slice(indexOfFirstItem, indexOfLastItem) : [];

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="flex h-full">
      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <header className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Welcome to PharmaX Copilot <span className="text-sm font-normal bg-yellow-200 px-2 py-1 rounded">BETA</span></h1>
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
            <Button onClick={handleSearch} className="ml-2" disabled={isLoading}>
              {isLoading ? 'Searching...' : 'Search'}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {workflows.map((workflow, index) => (
              <Card key={index} className='rounded-lg border bg-background md:shadow-xl'>
                <CardHeader>
                  <CardTitle>{workflow.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{workflow.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>

          {data && (
            <>
              <SearchResults data={currentData} />
              {/* Pagination controls */}
              <div className="mt-4">
                <Pagination
                  totalItems={data.length}
                  itemsPerPage={itemsPerPage}
                  paginate={paginate}
                  currentPage={currentPage}
                />
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}

const Pagination = ({ totalItems, itemsPerPage, paginate, currentPage }) => {
  const pageNumbers = [];

  for (let i = 1; i <= Math.ceil(totalItems / itemsPerPage); i++) {
    pageNumbers.push(i);
  }

  return (
    <nav>
      <ul className="flex justify-center space-x-2">
        {pageNumbers.map(number => (
          <li key={number}>
            <button
              onClick={() => paginate(number)}
              className={`px-4 py-2 ${currentPage === number ? 'bg-gray-300' : 'bg-white'}`}
            >
              {number}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};
