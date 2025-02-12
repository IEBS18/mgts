// import React, { useState } from "react";
// import { useLocation } from "react-router-dom";
// import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
// import { Card } from "@/components/ui/card";

// // 1. Helper to flatten any nested object that might contain arrays.
// function flattenData(data) {
//   if (Array.isArray(data)) return data;

//   let results = [];
//   if (data && typeof data === "object") {
//     Object.keys(data).forEach((key) => {
//       const value = data[key];
//       if (Array.isArray(value)) {
//         // Push all array items into results.
//         results = results.concat(value);
//       } else if (value && typeof value === "object") {
//         // Recursively flatten nested objects.
//         results = results.concat(flattenData(value));
//       }
//     });
//   }
//   return results;
// }

// // 2. Helper to safely retrieve a value from an object by a "trimmed" key.
// function getValueByTrimmedKey(obj, targetKey) {
//   const foundKey = Object.keys(obj).find((key) => key.trim() === targetKey);
//   return foundKey ? obj[foundKey] : null;
// }

// // 3. Helper to truncate text to a given word limit (30 by default here).
// function truncateText(text, wordLimit = 30) {
//   if (!text) return "";
//   const words = text.split(/\s+/);
//   return words.length <= wordLimit
//     ? text
//     : words.slice(0, wordLimit).join(" ") + " ...";
// }

// const RNDFormulation = () => {
//   const location = useLocation();
//   const { searchResults, ingredientName } = location.state || {};

//   // Flatten the data into a single array.
//   const flattenedResults = flattenData(searchResults) || [];

//   // Sort so that items with a Publication_Date appear first.
//   flattenedResults.sort((a, b) => {
//     const aHasPubDate = getValueByTrimmedKey(a, "Publication_Date") ? 1 : 0;
//     const bHasPubDate = getValueByTrimmedKey(b, "Publication_Date") ? 1 : 0;
//     // Descending sort: if bHasPubDate > aHasPubDate, b goes first.
//     // We want the item that *has* Publication_Date to appear earlier (i.e., a negative return).
//     return bHasPubDate - aHasPubDate;
//   });

//   const [dialogOpen, setDialogOpen] = useState(false);
//   const [selectedResult, setSelectedResult] = useState(null);

//   // Handler to open a PubMed page in a new tab using the PMC ID
//   const handlePubmedClick = (pmcId, event) => {
//     if (event) {
//       event.stopPropagation();
//     }
//     window.open(`https://pubmed.ncbi.nlm.nih.gov/${pmcId}`, "_blank");
//   };

//   // For items that have a Publication_Date, we open a dialog with all details.
//   const handleCardClick = (result) => {
//     setSelectedResult(result);
//     setDialogOpen(true);
//   };

//   return (
//     <div className="w-full p-4">
//       <h1 className="text-2xl font-bold mb-4 text-gray-800">
//         Results for "{ingredientName}"
//       </h1>

//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//         {flattenedResults.map((result, index) => {
//           // Safely extract relevant fields by trimming keys
//           const pmcId = getValueByTrimmedKey(result, "PMC_ID");
//           const title = getValueByTrimmedKey(result, "Title");
//           const abstract = getValueByTrimmedKey(result, "Abstract");
//           const pubDate = getValueByTrimmedKey(result, "Publication_Date");
//           const assignee = getValueByTrimmedKey(result, "Assignee_Applicant");

//           // 4A. If we have a PMC_ID, render the "PMC" type card
//           if (pmcId) {
//             return (
//               <Card
//                 key={index}
//                 className="bg-white border border-[#a6ce39] rounded-[12px] shadow-sm  p-4 hover:shadow-md transition-shadow cursor-pointer"
//                 onClick={() => handlePubmedClick(pmcId)}
//               >
//                 <h2 className="text-xl font-semibold mb-2 text-gray-900">
//                   {title || "No Title"}
//                 </h2>
//                 <p className="text-sm text-gray-600 mb-2">PMC ID: {pmcId}</p>
//                 <p className="text-gray-800">
//                   {truncateText(abstract, 30)}
//                   {abstract && abstract.split(/\s+/).length > 30 && (
//                     <span
//                       className="text-blue-500 underline ml-1"
//                       onClick={(e) => handlePubmedClick(pmcId, e)}
//                     >
//                       Show More
//                     </span>
//                   )}
//                 </p>
//               </Card>
//             );
//           }
//           // 4B. If we have a Publication_Date, render the "Publication" type card
//           else if (pubDate) {
//             return (
//               <Card
//                 key={index}
//                 className="bg-white border border-[#a6ce39] rounded-[12px] shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer"
//                 onClick={() => handleCardClick(result)}
//               >
//                 <h2 className="text-xl font-semibold mb-2 text-gray-900">
//                   {title || "No Title"}
//                 </h2>
//                 {assignee && (
//                   <p className="text-sm text-gray-600 mb-1">
//                     Assignee/Applicant: {assignee}
//                   </p>
//                 )}
//                 <p className="text-sm text-gray-600">
//                   Publication Date: {pubDate}
//                 </p>
//               </Card>
//             );
//           }
//           // 4C. Fallback if neither PMC_ID nor Publication_Date is found
//           else {
//             return (
//               <Card
//                 key={index}
//                 className="bg-white border border-[#a6ce39] rounded-[12px] shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer"
//                 onClick={() => {
//                   setSelectedResult(result);
//                   setDialogOpen(true);
//                 }}
//               >
//                 <h2 className="text-xl font-semibold mb-2 text-gray-900">
//                   {title || "Untitled"}
//                 </h2>
//                 <pre className="text-xs text-gray-600">
//                   {JSON.stringify(result, null, 2)}
//                 </pre>
//               </Card>
//             );
//           }
//         })}
//       </div>

//       {/* Dialog for detailed view */}
//       {dialogOpen && selectedResult && (
//         <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
//           <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-white p-4">
//             <DialogTitle className="text-2xl font-bold mb-4 text-gray-800">
//               Detailed Information
//             </DialogTitle>
//             <div className="space-y-2 ">
//               {Object.entries(selectedResult).map(([rawKey, value]) => {
//                 const cleanKey = rawKey.trim().replace(/_/g, " ");
//                 return (
//                   <div key={rawKey}>
//                     <strong>{cleanKey}:</strong> <span>{value}</span>
//                   </div>
//                 );
//               })}
//             </div>
//           </DialogContent>
//         </Dialog>
//       )}
//     </div>
//   );
// };

// export default RNDFormulation;



import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import FormatText from "../FormatText";

/**
 * 1) Flatten helper: collects all arrays nested inside an object into a single array.
 */
function flattenData(data) {
  if (Array.isArray(data)) return data;

  let results = [];
  if (data && typeof data === "object") {
    Object.keys(data).forEach((key) => {
      const value = data[key];
      if (Array.isArray(value)) {
        results = results.concat(value);
      } else if (value && typeof value === "object") {
        results = results.concat(flattenData(value));
      }
    });
  }
  return results;
}

/**
 * 2) Trimmed key lookup: tolerates extra whitespace in the field names.
 */
function getValueByTrimmedKey(obj, targetKey) {
  const foundKey = Object.keys(obj).find((key) => key.trim() === targetKey);
  return foundKey ? obj[foundKey] : null;
}

/**
 * 3) Truncate text to a specified word limit (30 default).
 */
function truncateText(text, wordLimit = 30) {
  if (!text) return "";
  const words = text.split(/\s+/);
  return words.length <= wordLimit
    ? text
    : words.slice(0, wordLimit).join(" ") + " ...";
}

/**
 * Removes non-ASCII characters, returns "" if it’s literally "Not Found".
 */
function cleanValue(value) {
  if (!value) return "";
  // Remove all non-ASCII characters
  const asciiOnly = value.replace(/[^\x00-\x7F]+/g, "");
  if (asciiOnly.trim() === "Not Found") return "";
  return asciiOnly.trim();
}

/**
 * Renders pipe-delimited strings as tag-like badges.
 */
function renderTagList(value) {
  const clean = cleanValue(value);
  if (!clean) return null;
  const parts = clean.split("|").map((p) => p.trim()).filter(Boolean);
  return parts.length > 0 ? (
    <div className="flex flex-wrap gap-2">
      {parts.map((tag, idx) => (
        <span key={idx} className="bg-gray-200 px-2 py-1 rounded-lg text-sm text-gray-700">
          {tag}
        </span>
      ))}
    </div>
  ) : null;
}

const RNDFormulation = () => {
  const location = useLocation();
  const { searchResults, ingredientName } = location.state || {};
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Flatten any nested structure into a single array of results.
  const flattenedResults = flattenData(searchResults) || [];

  // Sort so that items with Publication_Date appear first.
  flattenedResults.sort((a, b) => {
    const aHasPubDate = getValueByTrimmedKey(a, "Publication_Date") ? 1 : 0;
    const bHasPubDate = getValueByTrimmedKey(b, "Publication_Date") ? 1 : 0;
    // Descending sort: if bHasPubDate > aHasPubDate, b goes first.
    return bHasPubDate - aHasPubDate;
  });

  /**
   * Handler: Open PubMed for results with PMC_ID
   */
  const handlePubmedClick = (pmcId, event) => {
    if (event) event.stopPropagation();
    window.open(`https://pubmed.ncbi.nlm.nih.gov/${pmcId}`, "_blank");
  };

  /**
   * Handler: For items with a Publication_Date or fallback, open a dialog
   */
  const handleCardClick = (result) => {
    setSelectedResult(result);
    setDialogOpen(true);
  };

  /**
   * Specialized rendering for data with a Publication_Date.
   */
  const renderPublicationDetails = (result) => {
    const title = cleanValue(getValueByTrimmedKey(result, "Title"));
    const publicationDate = cleanValue(getValueByTrimmedKey(result, "Publication_Date"));
    const assignee = cleanValue(getValueByTrimmedKey(result, "Assignee_Applicant"));
    const abstractVal = cleanValue(getValueByTrimmedKey(result, "Abstract"));
    const claimVal = cleanValue(getValueByTrimmedKey(result, "Claim"));
    const cpcVal = cleanValue(getValueByTrimmedKey(result, "CPC_Classifications"));
    const ipcVal = cleanValue(getValueByTrimmedKey(result, "IPC_Classifications"));
    const inventorVal = cleanValue(getValueByTrimmedKey(result, "Inventor"));
    const displayKey = cleanValue(getValueByTrimmedKey(result, "Display_Key"));

    return (
      <div className="space-y-4 text-gray-800">
        {title && (
          <h2 className="text-xl font-bold">{title}</h2>
        )}

        {publicationDate && (
          <p>
            <strong>Publication Date:</strong> {publicationDate}
          </p>
        )}

        {assignee && (
          <p>
            <strong>Assignee/Applicant:</strong> {assignee}
          </p>
        )}

        {abstractVal && (
          <div>
            <strong>Abstract:</strong>
            <FormatText text={abstractVal} />
          </div>
        )}

        {claimVal && (
          <div>
            <strong>Claim:</strong>
            <FormatText text={claimVal} />
          </div>
        )}

        {cpcVal && (
          <p>
            <strong>CPC Classifications:</strong> {cpcVal}
          </p>
        )}

        {ipcVal && (
          <div>
            <strong>IPC Classifications:</strong>
            {renderTagList(ipcVal)}
          </div>
        )}

        {inventorVal && (
          <div>
            <strong>Inventor:</strong>
            {renderTagList(inventorVal)}
          </div>
        )}

        {displayKey && (
          <p>
            <strong>Display Key:</strong> {displayKey}
          </p>
        )}
      </div>
    );
  };

  /**
   * Export all data to Excel by sending it to the backend route /api/export-excel
   */
  const handleExport = async () => {
    try {
      setIsSubmitting(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/rnd-excel-export`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: flattenedResults }),
      });
      if (!response.ok) {
        throw new Error("Failed to export data to Excel.");
      }

      // We expect a file; let's download via a Blob.
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "exported_data.xlsx";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error exporting data:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full p-4">
      {/* Export Button */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800">
          Results for "{ingredientName}"
        </h1>
        <button
          onClick={handleExport}
          disabled={isSubmitting}
          className={`bg-[#a6ce39] p-2 text-white hover:bg-[#95b833] rounded-[12px] flex items-center gap-2 ${
            isSubmitting ? "cursor-not-allowed opacity-50" : ""
          }`}
        >
          {isSubmitting ? "Exporting..." : "Export"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {flattenedResults.map((result, index) => {
          // Common fields
          const pmcId = getValueByTrimmedKey(result, "PMC_ID");
          const title = cleanValue(getValueByTrimmedKey(result, "Title"));
          const pubDate = cleanValue(getValueByTrimmedKey(result, "Publication_Date"));

          // For PMC card
          const rawAbstract = getValueByTrimmedKey(result, "Abstract");
          const abstractClean = cleanValue(rawAbstract);

          // For Publication card
          const assignee = cleanValue(getValueByTrimmedKey(result, "Assignee_Applicant"));

          // If we have a PMC_ID, show the "PMC" card
          if (pmcId) {
            return (
              <Card
                key={index}
                className="bg-white border border-[#a6ce39] rounded-[12px] shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handlePubmedClick(pmcId)}
              >
                {/* Only display the Title if it's not empty */}
                {title && (
                  <h2 className="text-xl font-semibold mb-2 text-gray-900">
                    {title}
                  </h2>
                )}

                <p className="text-sm text-gray-600 mb-2">
                  PMC ID: {pmcId}
                </p>

                {/* Show abstract only if it's non-empty and not "Not Found" */}
                {abstractClean && (
                  <p className="text-gray-800">
                    {truncateText(rawAbstract || "", 30)}
                    {rawAbstract && rawAbstract.split(/\s+/).length > 30 && (
                      <span
                        className="text-blue-500 underline ml-1"
                        onClick={(e) => handlePubmedClick(pmcId, e)}
                      >
                        Show More
                      </span>
                    )}
                  </p>
                )}
              </Card>
            );
          }
          // If we have a Publication_Date, show the "Publication" card
          else if (pubDate) {
            return (
              <Card
                key={index}
                className="bg-white border border-[#a6ce39] rounded-[12px] shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleCardClick(result)}
              >
                {title && (
                  <h2 className="text-xl font-semibold mb-2 text-gray-900">
                    {title}
                  </h2>
                )}

                {assignee && (
                  <p className="text-sm text-gray-600 mb-1">
                    Assignee/Applicant: {assignee}
                  </p>
                )}

                <p className="text-sm text-gray-600">
                  Publication Date: {pubDate}
                </p>
              </Card>
            );
          }
          // Fallback if neither PMC_ID nor Publication_Date
          else {
            return (
              <Card
                key={index}
                className="bg-white border border-[#a6ce39] rounded-[12px] shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => {
                  setSelectedResult(result);
                  setDialogOpen(true);
                }}
              >
                {title && (
                  <h2 className="text-xl font-semibold mb-2 text-gray-900">
                    {title}
                  </h2>
                )}
                <pre className="text-xs text-gray-600">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </Card>
            );
          }
        })}
      </div>

      {/* Dialog for detailed view */}
      {dialogOpen && selectedResult && (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-white p-4">
            <DialogTitle className="text-2xl font-bold mb-4 text-gray-800">
              Detailed Information
            </DialogTitle>

            {cleanValue(getValueByTrimmedKey(selectedResult, "Publication_Date")) ? (
              // If it has a Publication_Date, display in required order
              renderPublicationDetails(selectedResult)
            ) : (
              // Otherwise, fallback rendering all fields except "Not Found" or empty
              <div className="space-y-2">
                {Object.entries(selectedResult).map(([rawKey, val]) => {
                  const cleanKey = rawKey.trim().replace(/_/g, " ");
                  const safeVal = cleanValue(val);
                  if (!safeVal) return null;
                  return (
                    <div key={rawKey}>
                      <strong>{cleanKey}:</strong> <span>{safeVal}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default RNDFormulation;
