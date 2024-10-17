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

// export default function SearchResults({ data, length, fulldata, query }) {
//   const [exporting, setExporting] = useState(false);
//   const [dialogOpen, setDialogOpen] = useState(false);
//   const [selectedPub, setSelectedPub] = useState(null);
//   console.log(data);

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

//   const highlightText = (text = '', highlight = '', wordLimit = 150) => {
//     if (!text || !highlight.trim()) {
//       return text;
//     }

//     // Split the highlight string into individual words
//     const highlightWords = highlight.split(' ').filter(Boolean); // Removes empty strings
//     const regexPattern = highlightWords.map(word => `(${word})`).join('|'); // Create regex pattern for each word
//     const regex = new RegExp(regexPattern, 'gi');

//     const matches = text.match(regex);

//     if (matches) {
//       // Find the index of the first match
//       const index = text.search(regex);

//       // Get a snippet of words around the highlighted part
//       const start = Math.max(0, index - wordLimit);  // Start of snippet
//       const end = Math.min(text.length, index + wordLimit);  // End of snippet
//       const snippet = text.substring(start, end);

//       return (
//         <>
//           <i>{snippet.split(regex).map((part, i) =>
//             regex.test(part) ? (
//               <mark key={i} className="bg-yellow-200">{part}</mark>
//             ) : (
//               part
//             )
//           )}</i>
//         </>
//       );
//     }

//     // If no match found, return default truncated text
//     return <i>{text.substring(0, wordLimit)}...</i>;
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
//           pub.type === 'pregranted' ? (
//             <div
//               key={`pregranted-${index}`}  // Unique key for pregranted items
//               className="bg-white p-6 rounded-lg border bg-background md:shadow-xl flex flex-row justify-between items-start "
//             >
//               {/* Left Side - Publication Info */}
//               <div className="w-1/2 pr-4">
//                 <div className="flex justify-between items-start mb-2">
//                   <h2 className="text-lg font-semibold">{pub.title}</h2>
//                   <Button variant="ghost" size="sm" onClick={() => openDialog(pub)}>
//                     <FileText className="h-4 w-4" color="green" />
//                   </Button>
//                 </div>
//                 <div className="text-sm text-gray-600 mb-2">
//                   {pub.assignee_applicant} • {pub.jurisdiction}
//                 </div>
//                 <div className="text-sm text-gray-600 mb-4">
//                   Published: {pub.publication_date}
//                 </div>
//                 <p className="text-sm text-gray-800 break-words">
//                   CPC Classifications: {pub.cpc_classifications}
//                 </p>
//               </div>

//               {/* Right Side - Relevant Match (with abstract and highlight search query) */}
//               <div className="w-1/2 bg-gray-100 p-4 rounded-lg">
//                 <h3 className="text-sm font-semibold mb-2">Relevant Match:</h3>
//                 <p className="text-sm italic break-words">
//                   {highlightText(pub.abstract, query, 150)}
//                 </p>
//               </div>
//             </div>
//           ) : pub.type === 'drugdisease' ? (
//             <div
//               key={`drugdisease-${index}`}  // Unique key for drugdisease items
//               className="bg-white p-6 rounded-lg border bg-background md:shadow-xl"
//             >
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
//           ) : null // Handle other cases if needed
//         ))}

//       </div>

//       {/* Dialog Box for Detailed View */}
//       <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
//         <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-white">
//           <DialogHeader>
//             <DialogTitle>{selectedPub?.title}</DialogTitle>
//             <DialogDescription>
//               {selectedPub?.assignee_applicant} • {selectedPub?.jurisdiction}
//             </DialogDescription>
//           </DialogHeader>
//           <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
//             <X className="h-4 w-4" />
//             <span className="sr-only">Close</span>
//           </DialogClose>
//           <div className="space-y-4">
//             <div>
//               <h3 className="font-semibold">Abstract</h3>
//               <p>{highlightText(selectedPub?.abstract || '', query)}</p>
//             </div>
//             <div>
//               <h3 className="font-semibold">Claim</h3>
//               <p>{selectedPub?.claim}</p>
//             </div>
//             {selectedPub?.relevantText && (
//               <div>
//                 <h3 className="font-semibold">Relevant Match</h3>
//                 <p>{highlightText(selectedPub.relevantText, query)}</p>
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

export default function SearchResults({ data, length, fulldata, query }) {
  const [exporting, setExporting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPub, setSelectedPub] = useState(null);
  const [selectedCards, setSelectedCards] = useState([]); // Track selected cards

  const handleExport = () => {
    setExporting(true);
    const worksheet = XLSX.utils.json_to_sheet(fulldata);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "SearchResults");
    XLSX.writeFile(workbook, "search_results.xlsx");
    setExporting(false);
  };

  const handleGenerateSummary = async () => {
    try {
      const response = await fetch('http://localhost:5000/generate-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selectedCards }), // Send selected cards to backend
      });

      const result = await response.json();
      console.log("Summary result:", result);
      // Handle result (you could display the summary here)
    } catch (error) {
      console.error('Error generating summary:', error);
    }
  };

  const toggleCardSelection = (pub) => {
    setSelectedCards((prevSelected) => {
      if (prevSelected.includes(pub)) {
        return prevSelected.filter((selected) => selected !== pub); // Unselect card
      } else {
        return [...prevSelected, pub]; // Select card
      }
    });
  };

  const openDialog = (pub) => {
    setSelectedPub(pub);
    setDialogOpen(true);
  };

  const highlightText = (text = '', highlight = '', wordLimit = 150) => {
    if (!text || !highlight.trim()) {
      return text;
    }

    // Split the highlight string into individual words
    const highlightWords = highlight.split(' ').filter(Boolean); // Removes empty strings
    const regexPattern = highlightWords.map(word => `(${word})`).join('|'); // Create regex pattern for each word
    const regex = new RegExp(regexPattern, 'gi');

    const matches = text.match(regex);

    if (matches) {
      // Find the index of the first match
      const index = text.search(regex);

      // Get a snippet of words around the highlighted part
      const start = Math.max(0, index - wordLimit);  // Start of snippet
      const end = Math.min(text.length, index + wordLimit);  // End of snippet
      const snippet = text.substring(start, end);

      return (
        <>
          <i>{snippet.split(regex).map((part, i) =>
            regex.test(part) ? (
              <mark key={i} className="bg-yellow-200">{part}</mark>
            ) : (
              part
            )
          )}</i>
        </>
      );
    }

    // If no match found, return default truncated text
    return <i>{text.substring(0, wordLimit)}...</i>;
  };

  return (
    <div className="flex-1 mt-6">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">
          Showing {length} Relevant Documents
        </h1>
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            className="text-black border-green border-2 rounded-lg"
            onClick={handleExport}
            disabled={exporting}
          >
            <FileText className="mr-2 h-4 w-4" color="green" />
            {exporting ? "Exporting..." : "Export"}
          </Button>
          <Button
            variant="outline"
            className="text-black border-green border-2 rounded-lg"
            onClick={handleGenerateSummary}
            disabled={selectedCards.length === 0} // Disable if no cards selected
          >
            Generate Summary ({selectedCards.length}) {/* Show count */}
          </Button>
        </div>
      </header>

      <div className="space-y-6">
        {data.map((pub, index) => (
          <div
            key={index}
            className={`bg-white p-6 rounded-lg border bg-background md:shadow-xl flex flex-row justify-between items-start 
            ${selectedCards.includes(pub) ? 'border-2 border-[#95D524] bg-green-100' : ''}`}  // Highlight selected cards
            onClick={() => toggleCardSelection(pub)}  // Toggle selection on click
          >
            {/* Left Side - Publication Info */}
            <div className="w-1/2 pr-4">
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-lg font-semibold">{pub.title}</h2>
                <Button variant="ghost" size="sm" onClick={(e) => {e.stopPropagation(); openDialog(pub);}}>
                  <FileText className="h-4 w-4" color="green" />
                </Button>
              </div>
              <div className="text-sm text-gray-600 mb-2">
                {pub.assignee_applicant} • {pub.jurisdiction}
              </div>
              <div className="text-sm text-gray-600 mb-4">
                Published: {pub.publication_date}
              </div>
              <p className="text-sm text-gray-800 break-words">
                CPC Classifications: {pub.cpc_classifications}
              </p>
            </div>

            {/* Right Side - Relevant Match (with abstract and highlight search query) */}
            <div className="w-1/2 bg-gray-100 p-4 rounded-lg">
              <h3 className="text-sm font-semibold mb-2">Relevant Match:</h3>
              <p className="text-sm italic break-words">
                {highlightText(pub.abstract, query, 150)}
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
