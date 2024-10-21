import React, { useState, useEffect } from "react";
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

export default function SearchResults({ data, length, fulldata, query, onSummaryGenerated }) {
  const [exporting, setExporting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPub, setSelectedPub] = useState(null);
  const [selectedCards, setSelectedCards] = useState([]); // Track selected cards
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  useEffect(() => {
    setSelectedCards([]); // Reset selected cards when new data is fetched
  }, [data]);
  
  function cleanParagraph(paragraph) {
    return paragraph.replace(/_x000D_/g, '');
  }

  function formatParagraph(paragraph) {
    return paragraph.replace(/\n/g, `<br/>`);
  }

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

  const highlightText = (text = '', highlight = '', wordLimit) => {
    if (!text || !highlight.trim()) {
      return text;
    }

    const highlightWords = highlight.split(' ').filter(Boolean);
    const regexPattern = highlightWords.map(word => `(${word})`).join('|');
    const regex = new RegExp(regexPattern, 'gi');

    // Find matches in the text
    const matches = text.match(regex);

    if (matches) {
      const index = text.search(regex);

      // If wordLimit is provided, trim the text
      if (wordLimit && wordLimit > 0) {
        const start = Math.max(0, index - wordLimit);
        const end = Math.min(text.length, index + wordLimit);
        const snippet = text.substring(start, end);

        // Highlight matching parts within the snippet
        return (
          <>
            <i>{snippet.split(regex).map((part, i) =>
              regex.test(part) ? (
                <mark key={i} className="bg-yellow-200">{part}</mark>
              ) : (
                part
              )
            )}</i>
            {end < text.length && '...'} {/* Add ellipsis if text is trimmed */}
          </>
        );
      }

      // If no wordLimit is provided, highlight throughout the entire text
      return (
        <>
          <i>{text.split(regex).map((part, i) =>
            regex.test(part) ? (
              <mark key={i} className="bg-yellow-200">{part}</mark>
            ) : (
              part
            )
          )}</i>
        </>
      );
    }

    // If no match is found, return the text as is (or trimmed if wordLimit is provided)
    return <i>{wordLimit ? text.substring(0, wordLimit) + '...' : text}</i>;
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

  const handleGenerateSummary = async () => {
    setIsGeneratingSummary(true);
    try {
      const response = await fetch('http://localhost:5000/generate-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selectedCards }),
      });

      const result = await response.json();
      onSummaryGenerated(result.summary); // Send summary to parent component
    } catch (error) {
      console.error('Error generating summary:', error);
    } finally {
      setIsGeneratingSummary(false);
    }
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
            {exporting ? "Exporting..." : `Export (${selectedCards.length})`}
          </Button>
          <Button
            variant="outline"
            className="text-black border-green border-2 rounded-lg"
            onClick={handleGenerateSummary}
            disabled={selectedCards.length === 0 || isGeneratingSummary}
          >
            {isGeneratingSummary ? "Generating Summary..." : `Generate Summary (${selectedCards.length})`}
          </Button>
        </div>
      </header>

      <div className="space-y-6">
        {data.map((pub, index) => (
          pub.type === 'pregranted' ? (
            <div
              key={`pregranted-${index}`} // Unique key for pregranted items
              className={`bg-white p-6 rounded-lg border bg-background md:shadow-xl flex flex-row justify-between items-start 
              ${selectedCards.includes(pub) ? 'border-2 border-[#95D524] bg-green-100' : ''}`}
              onClick={() => toggleCardSelection(pub)}
            >
              <div className="w-1/2 pr-4">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-lg font-semibold">{highlightText(pub.Title, query)}</h2>
                  <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); openDialog(pub); }}>
                    <FileText className="h-4 w-4" color="green" />
                  </Button>
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  {pub.Assignee_Applicant} • {pub.Jurisdiction}
                </div>
                <div className="text-sm text-gray-600 mb-4">
                  Published: {pub.Publication_Date}
                </div>
                <p className="text-sm text-gray-800 break-words">
                  CPC Classifications: {pub.CPC_Classifications}
                </p>
              </div>
              <div className="w-1/2 bg-gray-100 p-4 rounded-lg">
                <h3 className="text-sm font-semibold mb-2">Relevant Match:</h3>
                <p className="text-sm italic break-words">
                  {highlightText(pub.Abstract, query, 150)}
                </p>
              </div>
            </div>
          ) : pub.type === 'drugdisease' ? (
            <div
              key={`drugdisease-${index}`} // Unique key for drugdisease items
              className={`bg-white p-6 rounded-lg border bg-background md:shadow-xl 
              ${selectedCards.includes(pub) ? 'border-2 border-[#95D524] bg-green-100' : ''}`}
              onClick={() => toggleCardSelection(pub)}
            >
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-lg font-semibold">{highlightText(pub.Product_Name, query)}</h2>
                <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); openDialog(pub); }}>
                  <FileText className="h-4 w-4" color="green" />
                </Button>
              </div>
              <div className="text-sm text-gray-600 mb-2">
                {pub.Organization_Name} • {pub.Territory_Code}
              </div>
              <div className="text-sm text-gray-600 mb-4">
                Routes of Administration: {pub.Routes_of_Administration}
              </div>
              <div className="text-sm text-gray-600 mb-4">
                Diseases: {highlightText(pub.Diseases, query)}
              </div>
              <p className="text-sm text-gray-800">
                Ingredients: {highlightText(pub.Ingredients, query)}
              </p>
            </div>
          ) : pub.type === 'clinicaltrial' ? (
            <div
              key={`clinicaltrial-${index}`} // Unique key for clinical trial items
              className={`bg-white p-6 rounded-lg border bg-background md:shadow-xl flex flex-row justify-between items-start
              ${selectedCards.includes(pub) ? 'border-2 border-[#95D524] bg-green-100' : ''}`} // Highlight selected cards
              onClick={() => toggleCardSelection(pub)} // Toggle selection on click
            >
              <div className="w-1/2 pr-4">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-lg font-semibold">{highlightText(pub["Study Title"], query)} • {pub["NCT Number"]} </h2>
                  <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); openDialog(pub); }}>
                    <FileText className="h-4 w-4" color="green" />
                  </Button>
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  {pub["Sponsor"]} • {pub["Locations"]}
                </div>
                <div className="text-sm text-gray-600 mb-4">
                  Completion Date: {pub["Completion Date"]}
                </div>
                <p className="text-sm text-gray-800 break-words">
                  Conditions: {highlightText(pub["Conditions"], query)}
                </p>
                <div>
                  <a href={`https://clinicaltrials.gov/study/${pub['NCT Number']}`} target="_blank" className="text-blue-700">
                    View  Study Record
                  </a>
                </div>
              </div>
              <div className="w-1/2 bg-gray-100 p-4 rounded-lg">
                <h3 className="text-sm font-semibold mb-2">Brief Summary:</h3>
                <p className="text-sm italic break-words">
                  {highlightText(cleanParagraph(pub["Brief Summary"]), query, 150)}
                </p>
              </div>
            </div>
          ) : pub.type === 'pubmed' ? (
            <div
              key={`pubmed-${index}`} // Unique key for pregranted items
              className={`bg-white p-6 rounded-lg border bg-background md:shadow-xl flex flex-row justify-between items-start 
              ${selectedCards.includes(pub) ? 'border-2 border-[#95D524] bg-green-100' : ''}`}
              onClick={() => toggleCardSelection(pub)}
            >
              <div className="w-1/2 pr-4">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-lg font-semibold">{highlightText(pub['Title'], query)}</h2>
                  <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); openDialog(pub); }}>
                    <FileText className="h-4 w-4" color="green" />
                  </Button>
                </div>
                <p>{pub['Journal Issue']} • {pub['Country']}</p>


                <div className="text-sm text-gray-600 mb-2 flex flex-row gap-x-1 mt-2">
                  <p className="text-sm font-semibold">Published: {pub['PubDate']} |</p>
                  {/* <p className="text-sm text-gray-600 mb-2 flex flex-row">ISSN Type: {pub['ISSN Type']} |</p> */}
                  <a href={`https://pubmed.ncbi.nlm.nih.gov/${pub.PMID}`} target="_blank" className="text-blue-700">View</a>
                </div>
              </div>
              <div className="w-1/2 bg-gray-100 p-4 rounded-lg">
                <h3 className="text-sm font-semibold mb-2">Relevant Match:</h3>
                <p className="text-sm italic break-words">
                  {highlightText(pub['AbstractText'], query, 150)}
                </p>
              </div>
            </div>
          ) : null
        ))}
      </div>

      {/* Dialog Box for Detailed View */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle>{selectedPub?.Title || selectedPub?.["Study Title"] || selectedPub?.Product_Name || selectedPub?.Title}</DialogTitle>
            <DialogDescription>
              {selectedPub?.Assignee_Applicant || selectedPub?.Organization_Name || selectedPub?.Sponsor || selectedPub?.["Journal Issue"]}, <br></br>
              {selectedPub?.Jurisdiction || selectedPub?.Territory_Code || selectedPub?.["NCT Number"] || selectedPub?.Country}
            </DialogDescription>
          </DialogHeader>
          <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogClose>
          <div className="space-y-4">
            {/* Render content conditionally based on the type */}
            {selectedPub?.type === 'pregranted' && (
              <>
                <div>
                  <h3 className="font-semibold">Abstract</h3>
                  <p>{highlightText(selectedPub?.Abstract || '', query)}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Description</h3>
                  <p>{highlightText(selectedPub?.English_Description || '', query)}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Claim</h3>
                  <div dangerouslySetInnerHTML={{ __html: (formatParagraph((selectedPub?.Claim))) }} />
                </div>
                <div>
                  <h3 className="font-semibold">CPC Classifications</h3>
                  <p>{selectedPub?.CPC_Classifications}</p>
                </div>
              </>
            )}

            {selectedPub?.type === 'drugdisease' && (
              <>
                <div>
                  <h3 className="font-semibold">Routes of Administration</h3>
                  <p>{selectedPub?.Routes_of_Administration}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Diseases</h3>
                  <p>{highlightText(selectedPub?.Diseases, query)}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Ingredients</h3>
                  <p>{highlightText(selectedPub?.Ingredients, query)}</p>
                </div>
              </>
            )}

            {selectedPub?.type === 'clinicaltrial' && (
              <>
                {/* <div>
                  <h3 className="font-semibold">Study Title</h3>
                  <p>{highlightText(selectedPub['Study Title'], query)}</p>
                </div> */}
                <div>
                  <h3 className="font-semibold">Study Status</h3>
                  <p>{selectedPub['Study Status']}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Locations</h3>
                  <p>{selectedPub['Locations']}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Brief Summary</h3>
                  <p>{highlightText(cleanParagraph(selectedPub["Brief Summary"]), query)}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Study Description</h3>
                  <p>{highlightText(cleanParagraph(selectedPub['Study Description']), query)}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Interventions</h3>
                  <p>{highlightText(selectedPub?.['Interventions'], query)}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Conditions</h3>
                  <p>{selectedPub?.Conditions}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Completion Date</h3>
                  <p>{selectedPub?.["Completion Date"]}</p>
                </div>
                <div>
                  <a href={`https://clinicaltrials.gov/study/${selectedPub?.['NCT Number']}`} target="_blank" className="text-blue-700">
                    View  Study Record
                  </a>
                </div>
              </>
            )}

            {selectedPub?.type === 'pubmed' && (
              <>
                <div>
                  <h3 className="font-semibold">Abstract</h3>
                  <p>{highlightText(selectedPub?.AbstractText || '', query)}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Publication Date</h3>
                  <p>{selectedPub?.PubDate}</p>
                </div>
                <div>
                  <a href={`https://pubmed.ncbi.nlm.nih.gov/${selectedPub?.PMID}`} target="_blank" className="text-blue-700">
                    View PubMed Article
                  </a>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

