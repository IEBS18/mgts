import React from 'react'
import { Search, Grid, Calendar, Eye, Briefcase, Bell } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"

export default function Dashboard() {
  const workflows = [
    { title: "Search Drugs", description: "Find approved and pipeline drugs" },
    { title: "Research Disease Epidemiology", description: "Research disease epidemiology and patient population" },
    { title: "Summarize Company Earnings", description: "Summarize company earnings for a given timeframe" },
    { title: "Find Clinical Data", description: "Access and analyze clinical trial data" },
  ]

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-16 bg-white shadow-md">
        <div className="flex flex-col items-center py-4">
          <div className="w-10 h-10 bg-gray-200 rounded-full mb-8"></div>
          <Button variant="ghost" size="icon" className="mb-4"><Grid className="h-6 w-6" /></Button>
          <Button variant="ghost" size="icon" className="mb-4"><Search className="h-6 w-6" /></Button>
          <Button variant="ghost" size="icon" className="mb-4"><Calendar className="h-6 w-6" /></Button>
          <Button variant="ghost" size="icon" className="mb-4"><Eye className="h-6 w-6" /></Button>
          <Button variant="ghost" size="icon" className="mb-4"><Briefcase className="h-6 w-6" /></Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <header className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Welcome to Mindgram Copilot <span className="text-sm font-normal bg-yellow-200 px-2 py-1 rounded">BETA</span></h1>
            <Bell className="h-6 w-6" />
          </header>

          <div className="mb-8">
            <Input type="text" placeholder="prevalence of multiple myeloma in the us" className="w-full" />
          </div>

          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-semibold">Select a workflow</h2>
            <div className="flex items-center">
              <span className="mr-2 text-sm">Search Internal Documents Only</span>
              <Switch />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {workflows.map((workflow, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle>{workflow.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{workflow.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
