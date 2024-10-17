// import React, { useState } from "react";
// import { FileText, X } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription,
//   DialogClose,
// } from "@/components/ui/dialog";
// import * as XLSX from "xlsx";

// export default function SearchResults({ data, length, fulldata }) {
//   const [exporting, setExporting] = useState(false);
//   const [dialogOpen, setDialogOpen] = useState(false);
//   const [selectedPub, setSelectedPub] = useState(null);

//   const handleExport = () => {
//     setExporting(true);

//     // Create Excel file
//     const worksheet = XLSX.utils.json_to_sheet(fulldata);
//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, "SearchResults");

//     // Export the file and reset the button state
//     XLSX.writeFile(workbook, "search_results.xlsx");
//     setExporting(false);
//   };

//   const openDialog = (pub) => {
//     setSelectedPub(pub);
//     setDialogOpen(true);
//   };

//   return (
//     <div className="flex-1 mt-6">
//       <header className="flex justify-between items-center mb-8">
//         <h1 className="text-2xl font-bold">
//           Showing {length} Relevant Documents
//         </h1>
//         <Button variant="outline" className='text-black border-green border-2 rounded-lg'onClick={handleExport} disabled={exporting}>
//           <FileText className="mr-2 h-4 w-4" color="green" />
//           {exporting ? "Exporting..." : "Export"}
//         </Button>
//       </header>

//       <div className="space-y-6">
//         {data.map((pub, index) => (
//           <div
//             key={index}
//             className="bg-white p-6 rounded-lg border bg-background md:shadow-xl"
//           >
//             <div className="flex justify-between items-start mb-2">
//               <h2 className="text-lg font-semibold">{pub.Product_Name}</h2>
//               <Button variant="ghost" size="sm" onClick={() => openDialog(pub)}>
//                 <FileText className="h-4 w-4" color="green" />
//               </Button>
//             </div>
//             <div className="text-sm text-gray-600 mb-2">
//               {pub.Organization_Name} • {pub.Territory_Code}
//             </div>
//             <div className="text-sm text-gray-600 mb-4">
//               Routes of Administration: {pub.Routes_of_Administration}
//             </div>
//             <p className="text-sm text-gray-800">
//               Ingredients: {pub.Ingredients}
//             </p>
//           </div>
//         ))}
//       </div>

//       <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
//         <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-white">
//           <DialogHeader>
//             <DialogTitle>{selectedPub?.Product_Name}</DialogTitle>
//             <DialogDescription>
//               {selectedPub?.Organization_Name} • {selectedPub?.Territory_Code}
//             </DialogDescription>
//           </DialogHeader>
//           <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
//             <X className="h-4 w-4" />
//             <span className="sr-only">Close</span>
//           </DialogClose>
//           <div className="space-y-4">
//             <div>
//               <h3 className="font-semibold">Routes of Administration</h3>
//               <p>{selectedPub?.Routes_of_Administration}</p>
//             </div>
//             <div>
//               <h3 className="font-semibold">Ingredients</h3>
//               <p>{selectedPub?.Ingredients}</p>
//             </div>

//             {selectedPub?.Dosage_and_Administration && (
//               <div>
//                 <h3 className="font-semibold">Clinical Pharmacology</h3>
//                 <p>{selectedPub?.Clinical_Pharmacology}</p>
//               </div>
//             )}

//             {selectedPub?.Indications_and_Usage && (
//               <div>
//                 <h3 className="font-semibold">Indications and Usage</h3>
//                 <p>{selectedPub?.Indications_and_Usage}</p>
//               </div>
//             )}
//             {selectedPub?.Warnings && (
//               <div>
//                 <h3 className="font-semibold">Warnings</h3>
//                 <p>{selectedPub?.Warnings}</p>
//               </div>
//             )}
//           </div>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }


// import React, { useState } from "react";
// import { FileText, X } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription,
//   DialogClose,
// } from "@/components/ui/dialog";
// import * as XLSX from "xlsx";

// // Helper function to highlight text
// const highlightText = (text, highlight) => {
//   if (!highlight.trim()) {
//     return text;
//   }
//   const regex = new RegExp(`(${highlight})`, 'gi');
//   return text.split(regex).map((part, i) => 
//     regex.test(part) ? <mark key={i} className="bg-yellow-200">{part}</mark> : part
//   );
// };

// export default function SearchResults({ data, length, fulldata, query }) {  // Added `query` as a prop
//   const [exporting, setExporting] = useState(false);
//   const [dialogOpen, setDialogOpen] = useState(false);
//   const [selectedPub, setSelectedPub] = useState(null);

//   const handleExport = () => {
//     setExporting(true);
//     const worksheet = XLSX.utils.json_to_sheet(fulldata);
//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, "SearchResults");
//     XLSX.writeFile(workbook, "search_results.xlsx");
//     setExporting(false);
//   };

//   const openDialog = (pub) => {
//     setSelectedPub(pub);
//     setDialogOpen(true);
//   };

//   return (
//     <div className="flex-1 mt-6">
//       <header className="flex justify-between items-center mb-8">
//         <h1 className="text-2xl font-bold">
//           Showing {length} Relevant Documents
//         </h1>
//         <Button variant="outline" className='text-black border-green border-2 rounded-lg' onClick={handleExport} disabled={exporting}>
//           <FileText className="mr-2 h-4 w-4" color="green" />
//           {exporting ? "Exporting..." : "Export"}
//         </Button>
//       </header>

//       <div className="space-y-6">
//         {data.map((pub, index) => (
//           <div
//             key={index}
//             className="bg-white p-6 rounded-lg border bg-background md:shadow-xl flex justify-between"  // Use flex to layout two columns
//           >
//             {/* Left Side - Publication Info */}
//             <div className="w-1/2 pr-4">  {/* Left half */}
//               <div className="flex justify-between items-start mb-2">
//                 <h2 className="text-lg font-semibold">{pub.Product_Name}</h2>
//                 <Button variant="ghost" size="sm" onClick={() => openDialog(pub)}>
//                   <FileText className="h-4 w-4" color="green" />
//                 </Button>
//               </div>
//               <div className="text-sm text-gray-600 mb-2">
//                 {pub.Organization_Name} • {pub.Territory_Code}
//               </div>
//               <div className="text-sm text-gray-600 mb-4">
//                 Routes of Administration: {pub.Routes_of_Administration}
//               </div>
//               <p className="text-sm text-gray-800">
//                 Ingredients: {pub.Ingredients}
//               </p>
//             </div>

//             {/* Right Side - Relevant Match (Highlight Search Term) */}
//             <div className="w-1/2 bg-gray-100 p-4 rounded-lg">
//               <h3 className="text-sm font-semibold mb-2">Relevant Match:</h3>
//               <p className="text-sm">
//                 {/* Highlight the relevant text using highlightText function */}
//                 {highlightText(pub.relevantText || "", query)}
//               </p>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Dialog Box for Detailed View */}
//       <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
//         <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-white">
//           <DialogHeader>
//             <DialogTitle>{selectedPub?.Product_Name}</DialogTitle>
//             <DialogDescription>
//               {selectedPub?.Organization_Name} • {selectedPub?.Territory_Code}
//             </DialogDescription>
//           </DialogHeader>
//           <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
//             <X className="h-4 w-4" />
//             <span className="sr-only">Close</span>
//           </DialogClose>
//           <div className="space-y-4">
//             <div>
//               <h3 className="font-semibold">Routes of Administration</h3>
//               <p>{selectedPub?.Routes_of_Administration}</p>
//             </div>
//             <div>
//               <h3 className="font-semibold">Ingredients</h3>
//               <p>{selectedPub?.Ingredients}</p>
//             </div>
//             {selectedPub?.Clinical_Pharmacology && (
//               <div>
//                 <h3 className="font-semibold">Clinical Pharmacology</h3>
//                 <p>{selectedPub?.Clinical_Pharmacology}</p>
//               </div>
//             )}
//             {selectedPub?.Indications_and_Usage && (
//               <div>
//                 <h3 className="font-semibold">Indications and Usage</h3>
//                 <p>{selectedPub?.Indications_and_Usage}</p>
//               </div>
//             )}
//             {selectedPub?.Warnings && (
//               <div>
//                 <h3 className="font-semibold">Warnings</h3>
//                 <p>{selectedPub?.Warnings}</p>
//               </div>
//             )}
//             {selectedPub?.relevantText && (
//               <div>
//                 <h3 className="font-semibold">Relevant Match</h3>
//                 <p>{highlightText(selectedPub.relevantText, selectedPub.Product_Name)}</p>
//               </div>
//             )}
//           </div>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }

import React, { useState } from "react";
import { FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import * as XLSX from "xlsx";

// Helper function to highlight text and return a snippet around it
const highlightText = (text = '', highlight = '', wordLimit = 150) => {
  if (!text || !highlight.trim()) {
    return text;
  }

  // Create a regex to find the highlighted word
  const regex = new RegExp(`(${highlight})`, 'gi');
  const matches = text.match(regex);

  if (matches) {
    const index = text.search(regex);  // Find where the highlight starts

    // Get a snippet of 100-150 words around the highlighted part
    const start = Math.max(0, index - wordLimit);  // Start of snippet
    const end = Math.min(text.length, index + wordLimit);  // End of snippet
    const snippet = text.substring(start, end);

    return (
      <>
        <i>{snippet.split(regex).map((part, i) =>
          regex.test(part) ? <mark key={i} className="bg-yellow-200">{part}</mark> : part
        )}</i>
      </>
    );
  }

  // If no match found, return default truncated text
  return <i>{text.substring(0, wordLimit)}...</i>;
};

export default function SearchResults({ data, length, fulldata, query }) {
  const [exporting, setExporting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPub, setSelectedPub] = useState(null);

  const handleExport = () => {
    setExporting(true);
    const worksheet = XLSX.utils.json_to_sheet(fulldata);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "SearchResults");
    XLSX.writeFile(workbook, "search_results.xlsx");
    setExporting(false);
  };

  const openDialog = (pub) => {
    setSelectedPub(pub);
    setDialogOpen(true);
  };

  return (
    <div className="flex-1 mt-6">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">
          Showing {length} Relevant Documents
        </h1>
        <Button variant="outline" className='text-black border-green border-2 rounded-lg' onClick={handleExport} disabled={exporting}>
          <FileText className="mr-2 h-4 w-4" color="green" />
          {exporting ? "Exporting..." : "Export"}
        </Button>
      </header>

      <div className="space-y-6">
        {data.map((pub, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-lg border bg-background md:shadow-xl flex justify-between"  // Flex for side-by-side layout
          >
            {/* Left Side - Publication Info */}
            <div className="w-1/2 pr-4">  {/* Left half */}
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-lg font-semibold">{pub.title}</h2>
                <Button variant="ghost" size="sm" onClick={() => openDialog(pub)}>
                  <FileText className="h-4 w-4" color="green" />
                </Button>
              </div>
              <div className="text-sm text-gray-600 mb-2">
                {pub.assignee_applicant} • {pub.jurisdiction}
              </div>
              <div className="text-sm text-gray-600 mb-4">
                Published: {pub.publication_date}
              </div>
              <p className="text-sm text-gray-800 break-words"> {/* Added break-words to avoid long text overflow */}
                CPC Classifications: {pub.cpc_classifications}
              </p>
            </div>

            {/* Right Side - Relevant Match (with abstract and highlight search query) */}
            <div className="w-1/2 bg-gray-100 p-4 rounded-lg">
              <h3 className="text-sm font-semibold mb-2">Relevant Match:</h3>
              <p className="text-sm italic break-words"> {/* Italicized snippet */}
                {/* Highlight the abstract with search query and show 100-150 words around it */}
                {highlightText(pub.abstract, query, 350)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Dialog Box for Detailed View */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle>{selectedPub?.title}</DialogTitle>
            <DialogDescription>
              {selectedPub?.assignee_applicant} • {selectedPub?.jurisdiction}
            </DialogDescription>
          </DialogHeader>
          <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogClose>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Abstract</h3>
              <p>{highlightText(selectedPub?.abstract || '', query)}</p>
            </div>
            <div>
              <h3 className="font-semibold">Claim</h3>
              <p>{selectedPub?.claim}</p>
            </div>
            {selectedPub?.relevantText && (
              <div>
                <h3 className="font-semibold">Relevant Match</h3>
                <p>{highlightText(selectedPub.relevantText, query)}</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
