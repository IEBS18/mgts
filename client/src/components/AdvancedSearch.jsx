import React from 'react'
import { Calendar } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function AdvancedSearch() {
  const scopes = [
    "All", "News", "Deals", "Publications", "Meeting Abstracts", "Preprints", "FDA Labels",
    "FDA Meeting Materials", "Clinical Trials", "Clinical Data", "Patents",
    "Posters / Presentations", "SEC Filings", "Data Tables", "SEC Tables"
  ]

  const entities = ["All", "Company", "Drug", "Indication", "Target"]

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar (same as in Dashboard component) */}
      
      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto bg-white rounded-lg shadow p-8">
          <h1 className="text-2xl font-bold mb-6">Advanced Search</h1>
          
          <div className="grid grid-cols-3 gap-8">
            <div>
              <h2 className="text-lg font-semibold mb-4">Search Parameters</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="company">Company</Label>
                  <Input id="company" placeholder="Enter company name" />
                </div>
                <div>
                  <Label htmlFor="indication">Indication</Label>
                  <Input id="indication" placeholder="Enter indication" />
                </div>
                <div>
                  <Label htmlFor="target">Target</Label>
                  <Input id="target" placeholder="Enter target" />
                </div>
                <div>
                  <Label htmlFor="drug">Drug</Label>
                  <Input id="drug" placeholder="Enter drug name" />
                </div>
              </div>
            </div>
            
            <div>
              <h2 className="text-lg font-semibold mb-4">Scope</h2>
              <div className="space-y-2">
                {scopes.map((scope, index) => (
                  <div key={index} className="flex items-center">
                    <Checkbox id={`scope-${index}`} />
                    <label htmlFor={`scope-${index}`} className="ml-2 text-sm">{scope}</label>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h2 className="text-lg font-semibold mb-4">Entities to Retrieve</h2>
              <div className="space-y-2">
                {entities.map((entity, index) => (
                  <div key={index} className="flex items-center">
                    <Checkbox id={`entity-${index}`} defaultChecked={entity === "All"} />
                    <label htmlFor={`entity-${index}`} className="ml-2 text-sm">{entity}</label>
                  </div>
                ))}
              </div>
              
              <h2 className="text-lg font-semibold mt-8 mb-4">Timeframe</h2>
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="mr-2 h-4 w-4" />
                Select Date Range
              </Button>
            </div>
          </div>
          
          <div className="flex justify-end mt-8 space-x-4">
            <Button variant="outline">Reset</Button>
            <Button>Apply</Button>
          </div>
        </div>
      </main>
    </div>
  )
}
