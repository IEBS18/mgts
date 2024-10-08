import React, { useState } from 'react'
import { Bell, ChevronLeft, ChevronRight } from 'lucide-react'
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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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
      setCurrentPage(1); // Reset to first page on new search
    } catch (error) {
      console.error('Error making POST request:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentData = data ? data.slice(indexOfFirstItem, indexOfLastItem) : [];

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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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
              <Pagination
                totalItems={data.length}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
              />
            </>
          )}
        </div>
      </main>
    </div>
  )
}

function Pagination({ totalItems, itemsPerPage, currentPage, setCurrentPage }) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <Button
          key={i}
          variant={currentPage === i ? "default" : "outline"}
          size="sm"
          onClick={() => goToPage(i)}
          className="mx-1"
        >
          {i}
        </Button>
      );
    }

    return pageNumbers;
  };

  return (
    <nav className="flex justify-center items-center space-x-2 mt-8" aria-label="Pagination">
      <Button
        variant="outline"
        size="sm"
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="sr-only">Previous page</span>
      </Button>
      {renderPageNumbers()}
      <Button
        variant="outline"
        size="sm"
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <ChevronRight className="h-4 w-4" />
        <span className="sr-only">Next page</span>
      </Button>
    </nav>
  );
}