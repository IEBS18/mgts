import React, { useState } from 'react'
import { Bell } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import SearchResults from './SearchResults'
import Pagination from './Pagination'

export default function Dashboard1() {
  const workflows = [
    { title: "Search Drugs", description: "Find approved and pipeline drugs" },
    { title: "Research Disease Epidemiology", description: "Research disease epidemiology and patient population" },
    { title: "Summarize Company Earnings", description: "Summarize company earnings for a given timeframe" },
    { title: "Find Clinical Data", description: "Access and analyze clinical trial data" },
  ]

  const [query, setQuery] = useState("")
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const handleSearch = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('http://54.211.78.164:5000/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 'keyword': query }),
      })

      const result = await response.json()
      setData(result)
      setCurrentPage(1) // Reset to first page on new search
    } catch (error) {
      console.error('Error making POST request:', error)
    } finally {
      
      setIsLoading(false)
    }
  }

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentData = data ? data.slice(indexOfFirstItem, indexOfLastItem) : []

  const totalPages = data ? Math.ceil(data.length / itemsPerPage) : 0

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
            <div className="space-y-8">
              <SearchResults data={currentData} length={data.length} fulldata={data} />
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
  )
}