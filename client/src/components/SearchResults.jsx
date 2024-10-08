import React from 'react'
import { useState } from 'react'
import { ChevronDown, FileText, X } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog"

import * as XLSX from 'xlsx'; 

export default function SearchResults({data}) {
  // const handleExport = () => {
  //   console.log('exporting');
  //   // Create a new workbook and add data to the sheet
  //   const worksheet = XLSX.utils.json_to_sheet(data); // Convert JSON to worksheet
  //   const workbook = XLSX.utils.book_new(); // Create a new workbook
  //   XLSX.utils.book_append_sheet(workbook, worksheet, "SearchResults"); // Append the sheet
    
  //   // Export the Excel file
  //   XLSX.writeFile(workbook, 'search_results.xlsx');
  // };
  const [exporting, setExporting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPub, setSelectedPub] = useState(null)

  const handleExport = () => {
    setExporting(true);

    // Create Excel file
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "SearchResults");
    
    // Export the file and reset the button state
    XLSX.writeFile(workbook, 'search_results.xlsx');
    setExporting(false);
  };

  const openDialog = (pub) => {
    setSelectedPub(pub)
    setDialogOpen(true)
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar (same as in Dashboard component) */}
      
      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <header className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold">Showing {data.length} Relevant Documents</h1>
            <Button 
              variant="outline" 
              onClick={handleExport} 
              disabled={exporting}
            >
              <FileText className="mr-2 h-4 w-4" />
              {exporting ? 'Exporting...' : 'Export'}
            </Button>
          </header>

          <div className="space-y-6">
            {data.map((pub, index) => (
              <div key={index} className="bg-white p-6 rounded-lg border bg-background md:shadow-xl">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-lg font-semibold">{pub.Product_Name}</h2>
                  <Button variant="ghost" size="sm" onClick={() => openDialog(pub)}>
                    <FileText className="h-4 w-4" />
                  </Button>
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  {pub.Organization_Name} • {pub.Territory_Code}
                </div>
                <div className="text-sm text-gray-600 mb-4">
                  Routes of Administration: {pub.Routes_of_Administration}
                </div>
                <p className="text-sm text-gray-800">Ingredients: {pub.Ingredients}</p>
                {/* <p className="text-sm text-gray-800">Clinical Pharmacology: {pub.Clinical_Pharmacology}</p>
                <p className="text-sm text-gray-800">Indications and Usage: {pub.Indications_and_Usage}</p>
                <p className="text-sm text-gray-800">Warnings: {pub.Warnings}</p> */}
              </div>
            ))}
          </div>
        </div>
      </main>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen} className='bg-white'>
        <DialogContent className="max-w-4xl max-h-[80vh] bg-white overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedPub?.Product_Name}</DialogTitle>
            <DialogDescription>
              {selectedPub?.Organization_Name} • {selectedPub?.Territory_Code}
            </DialogDescription>
          </DialogHeader>
          <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogClose>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Routes of Administration</h3>
              <p>{selectedPub?.Routes_of_Administration}</p>
            </div>
            <div>
              <h3 className="font-semibold">Ingredients</h3>
              <p>{selectedPub?.Ingredients}</p>
            </div>
            <div>
              <h3 className="font-semibold">Clinical Pharmacology</h3>
              <p>{selectedPub?.Clinical_Pharmacology}</p>
            </div>
            <div>
              <h3 className="font-semibold">Indications and Usage</h3>
              <p>{selectedPub?.Indications_and_Usage}</p>
            </div>
            <div>
              <h3 className="font-semibold">Warnings</h3>
              <p>{selectedPub?.Warnings}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
