import React from 'react'
import { ChevronDown, FileText } from 'lucide-react'
import { Button } from "@/components/ui/button"

// const publications = [
//   {
//     title: "US Budget Impact Model for Selinexor in Relapsed or Refractory Multiple Myeloma",
//     journal: "Clinicoecon Outcomes Res, Vol 12",
//     date: "Feb 25, 2020",
//     citations: 6,
//     relevantText: "Introduction Multiple myeloma (MM) is a cancer that develops as a plasma cell malignancy in the bone marrow.1 Clinical manifestations of ... co..."
//   },
//   {
//     title: "Patterns of bisphosphonate treatment among patients with multiple myeloma treated at oncology clinics across the USA: observations from real-world data",
//     journal: "Support Care Cancer, Vol 26 Issue 8",
//     date: "Aug 01, 2018",
//     citations: 13,
//     relevantText: "CONCLUSIONS Real-world data from US indicate that many patients with multiple receive optimal therapy for bone disease ... More"
//   },
//   // Add more publications as needed
// ]

export default function SearchResults({data}) {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar (same as in Dashboard component) */}
      
      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <header className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold">Showing 308 Most Relevant Documents</h1>
            <Button variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              Export
            </Button>
          </header>

          <div className="space-y-6">
            {data.map((pub, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-lg font-semibold">{pub.title}</h2>
                  <Button variant="ghost" size="sm">
                    <FileText className="h-4 w-4" />
                  </Button>
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  {pub.journal} • {pub.citations} citations
                </div>
                <div className="text-sm text-gray-600 mb-4">
                  Published: {pub.date} | <Button variant="link" size="sm" className="p-0">View</Button>
                </div>
                <p className="text-sm text-gray-800">{pub.relevantText}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
