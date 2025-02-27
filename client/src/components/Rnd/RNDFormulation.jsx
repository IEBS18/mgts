// "use client";

// import React, { useState, useEffect } from "react";
// import { useLocation } from "react-router-dom";
// import { Loader2 } from "lucide-react";
// import ReactMarkdown from "react-markdown";

// // UI Components
// import { Button } from "@/components/ui/button";
// import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// import { toast, ToastContainer } from "react-toastify";

// // Topics become table rows by default
// const topics = [
//   "Title",
//   "Publication Number",
//   "Stability Conditions",
//   "Interaction",
//   "Composition",
//   "Composition Characteristics",
//   "Interaction Components",
//   "Solution Form",
//   "Testing Conditions",
//   "Stability Test Results",
//   "Dissolution Study",
//   "Safety Study Results",
//   "Efficacy Studies",
//   "Toxicity Studies",
//   "Application",
//   "IEB Comment (Summary)",
// ];

// // Dots for fields not yet received
// function LoadingDots() {
//   return (
//     <div className="flex items-center justify-center">
//       <div className="animate-pulse flex space-x-1">
//         <div className="w-2 h-2 bg-[#a6ce39] rounded-full"></div>
//         <div className="w-2 h-2 bg-[#a6ce39] rounded-full"></div>
//         <div className="w-2 h-2 bg-[#a6ce39] rounded-full"></div>
//       </div>
//     </div>
//   );
// }

// // Show up to `maxWords` words, then "Show More/Less"
// function TruncatedMarkdown({ content, maxWords = 30 }) {
//   const [showMore, setShowMore] = useState(false);

//   if (!content) {
//     return <span className="text-gray-400 italic">Not mentioned</span>;
//   }

//   const words = content.split(/\s+/);
//   if (words.length <= maxWords) {
//     return <ReactMarkdown>{content}</ReactMarkdown>;
//   }

//   const truncated = words.slice(0, maxWords).join(" ") + "...";
//   return (
//     <div>
//       <ReactMarkdown>{showMore ? content : truncated}</ReactMarkdown>
//       <button
//         onClick={() => setShowMore(!showMore)}
//         className="text-blue-600 underline mt-2"
//       >
//         {showMore ? "Show Less" : "Show More"}
//       </button>
//     </div>
//   );
// }

// /**
//  * Ensures each partial data object has a stable key (data.__stableKey).
//  * We do this once so updates won't generate new columns in SSE.
//  */
// function ensureStableKey(data) {
//   // If we already assigned a stableKey on a prior SSE chunk, reuse it
//   if (data.__stableKey) return data.__stableKey;

//   // Priority #1: Non-N/A Publication Number
//   if (data["Publication Number"] && data["Publication Number"] !== "N/A") {
//     data.__stableKey = data["Publication Number"];
//     return data.__stableKey;
//   }

//   // Priority #2: Non-N/A Title
//   if (data["Title"] && data["Title"] !== "N/A") {
//     data.__stableKey = data["Title"];
//     return data.__stableKey;
//   }

//   // Fallback: generate random
//   data.__stableKey = "Unknown_" + Math.random().toString(36).substring(7);
//   return data.__stableKey;
// }

// /**
//  * Decide how to render each cell:
//  * - If content === undefined => SSE not arrived => show LoadingDots()
//  * - If content is "Not mentioned" or empty => italic text
//  * - Otherwise => truncated markdown
//  */
// function renderCellContent(record, topic) {
//   const content = record[topic];
//   if (content === undefined) {
//     return <LoadingDots />;
//   }
//   if (!content || content.trim().length === 0 || content === "Not mentioned") {
//     return <span className="text-gray-400 italic">Not mentioned</span>;
//   }
//   return <TruncatedMarkdown content={String(content)} />;
// }

// export default function RNDFormulation() {
//   const location = useLocation();
//   const { userQuery = "" } = location.state || {};

//   // SSE-collected columns (each element in tableData is a "column" in the final table)
//   const [tableData, setTableData] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [sseError, setSseError] = useState(null);

//   // AI column handling
//   const [aiColumnDialogOpen, setAiColumnDialogOpen] = useState(false);
//   const [aiColumnName, setAiColumnName] = useState("");
//   const [aiColumnDescription, setAiColumnDescription] = useState("");
//   const [aiColumns, setAiColumns] = useState([]);
//   const [isAiColumnLoading, setIsAiColumnLoading] = useState(false);

//   useEffect(() => {
//     if (!userQuery) return;

//     setIsLoading(true);
//     const endpoint = `${import.meta.env.VITE_API_URL}/api/rnd-formulation-llama?user_query=${encodeURIComponent(
//       userQuery
//     )}&size=5`;

//     const eventSource = new EventSource(endpoint);

//     // Handles normal partial SSE data
//     eventSource.onmessage = (event) => {
//       setIsLoading(false);
//       if (!event.data) return;

//       try {
//         const partialData = JSON.parse(event.data);
//         const stableKey = ensureStableKey(partialData);

//         setTableData((prev) => {
//           const existingIndex = prev.findIndex(
//             (col) => ensureStableKey(col) === stableKey
//           );
//           if (existingIndex !== -1) {
//             // Merge new fields into that column
//             const updated = [...prev];
//             updated[existingIndex] = {
//               ...updated[existingIndex],
//               ...partialData,
//             };
//             return updated;
//           } else {
//             return [...prev, partialData];
//           }
//         });
//       } catch (err) {
//         console.error("Error parsing SSE data:", err);
//       }
//     };

//     // If the backend sends a "done" event
//     eventSource.addEventListener("done", (e) => {
//       console.log("SSE complete:", e.data);
//       eventSource.close();
//       setIsLoading(false);
//     });

//     // Error or abrupt close
//     eventSource.onerror = (error) => {
//       console.error("SSE Error:", error);
//       setSseError("Error receiving updates from the server.");
//       eventSource.close();
//     };

//     return () => {
//       eventSource.close();
//     };
//   }, [userQuery]);

//   /**
//    * Submit a new AI column (which is effectively a new "topic" row in the final table).
//    * We'll send the userQuery and column info to the backend to get an array of strings,
//    * one for each SSE column in the same order as tableData.
//    */
//   const handleSubmitAiColumn = () => {
//     if (!aiColumnName || !aiColumnDescription) {
//       toast.warn("Please fill out both fields before adding an AI column.");
//       return;
//     }

//     setIsAiColumnLoading(true);

//     fetch(`${import.meta.env.VITE_API_URL}/add-ai-column-rnd`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         columnName: aiColumnName,
//         columnDescription: aiColumnDescription,
//         userQuery,
//       }),
//     })
//       .then((response) => {
//         if (!response.ok) {
//           throw new Error("Failed to add AI column");
//         }
//         return response.json();
//       })
//       .then((responseData) => {
//         // "updated_ai_responses" is an array of strings for each existing SSE column in tableData
//         const { updated_ai_responses } = responseData;
//         if (!updated_ai_responses) {
//           throw new Error("No updated_ai_responses found in the response");
//         }

//         // Merge data into our existing tableData columns by index
//         const mergedTableData = tableData.map((col, i) => {
//           // If there's a matching string in updated_ai_responses, use it
//           if (updated_ai_responses[i]) {
//             return {
//               ...col,
//               [aiColumnName]: updated_ai_responses[i], // e.g. { Title: '...', [aiColumnName]: 'text' }
//             };
//           }
//           // Otherwise, keep the column as-is
//           return col;
//         });

//         setTableData(mergedTableData);
//         setAiColumns((prev) => [...prev, aiColumnName]);

//         setAiColumnDialogOpen(false);
//         setIsAiColumnLoading(false);
//         toast.success("AI column added successfully!");
//       })
//       .catch((error) => {
//         console.error("Error adding AI column:", error);
//         toast.warn("Error adding AI column");
//         setIsAiColumnLoading(false);
//       });
//   };

//   return (
//     <div className="p-4 bg-gray-100 min-h-screen">
//       {/* Toast for success/failure messages */}
//       <ToastContainer position="top-right" autoClose={5000} />

//       <h1 className="text-2xl font-bold mb-4 text-gray-800">
//         R&D Formulation Results for "{userQuery}"
//       </h1>

//       <div className="flex items-center gap-4 mb-4">
//         {sseError && <p className="text-red-500">{sseError}</p>}
//         {isLoading && (
//           <div className="flex items-center gap-2 text-gray-500">
//             <Loader2 className="animate-spin" />
//             <span>Loading real-time LLM data...</span>
//           </div>
//         )}

//         <Button
//           onClick={() => setAiColumnDialogOpen(true)}
//           variant="outline"
//           className="bg-white text-[#a6ce39] border border-[#a6ce39] hover:bg-[#f0f8e5] rounded-lg ml-auto"
//           disabled={isAiColumnLoading}
//         >
//           {isAiColumnLoading ? "Loading..." : "Add AI Column"}
//         </Button>
//       </div>

//       <div className="overflow-x-auto border border-gray-300 rounded-lg bg-white shadow-md">
//         <table className="min-w-max text-sm text-gray-700">
//           <tbody>
//             {/* Render all default topics + newly added AI columns as table rows */}
//             {[...topics, ...aiColumns].map((topic) => {
//               const isTitleRow = topic === "Title";
//               return (
//                 <tr key={topic} className="border-b hover:bg-gray-50">
//                   {/* Sticky row label */}
//                   <th
//                     className="sticky left-0 bg-[#a6ce39] px-2 py-3 font-medium text-white whitespace-nowrap z-10"
//                     style={{ minWidth: "180px" }}
//                   >
//                     {topic}
//                   </th>
//                   {/* Render each SSE column (record in tableData) across this row */}
//                   {tableData.map((record, colIndex) => (
//                     <td
//                       key={colIndex}
//                       className={`px-2 py-3 align-top w-[400px] max-w-[400px] break-words ${
//                         isTitleRow ? "font-bold" : ""
//                       }`}
//                     >
//                       {renderCellContent(record, topic)}
//                     </td>
//                   ))}
//                 </tr>
//               );
//             })}
//           </tbody>
//         </table>
//       </div>

//       {/* The dialog to gather AI column info */}
//       <Dialog open={aiColumnDialogOpen} onOpenChange={setAiColumnDialogOpen}>
//         <DialogContent className="bg-white">
//           <DialogTitle>Add AI Column</DialogTitle>
//           <DialogDescription>
//             Enter a name and description for the new AI column.
//           </DialogDescription>
//           <div className="space-y-4 mt-4">
//             <Input
//               value={aiColumnName}
//               onChange={(e) => setAiColumnName(e.target.value)}
//               placeholder="Column Name"
//               className="w-full p-2 border border-gray-200 rounded-lg text-gray-800"
//             />
//             <Input
//               value={aiColumnDescription}
//               onChange={(e) => setAiColumnDescription(e.target.value)}
//               placeholder="Column Description"
//               className="w-full p-2 border border-gray-200 rounded-lg text-gray-800"
//             />
//           </div>
//           <DialogFooter className="mt-4">
//             <Button
//               onClick={handleSubmitAiColumn}
//               disabled={isAiColumnLoading}
//               className="bg-[#a6ce39] text-white hover:bg-[#95b833] rounded-lg"
//             >
//               {isAiColumnLoading ? "Adding..." : "Add Column"}
//             </Button>
//             <Button
//               onClick={() => setAiColumnDialogOpen(false)}
//               variant="outline"
//               className="bg-white text-[#a6ce39] border border-[#a6ce39] hover:bg-[#f0f8e5] flex items-center rounded-lg gap-2"
//             >
//               Cancel
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }





"use client";

import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

// UI Components
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast, ToastContainer } from "react-toastify";

// We no longer define a static array of all topics here
// We'll have defaultTopics and will append user-selected topics.

// Dots for fields not yet received
function LoadingDots() {
  return (
    <div className="flex items-center justify-center">
      <div className="animate-pulse flex space-x-1">
        <div className="w-2 h-2 bg-[#a6ce39] rounded-full"></div>
        <div className="w-2 h-2 bg-[#a6ce39] rounded-full"></div>
        <div className="w-2 h-2 bg-[#a6ce39] rounded-full"></div>
      </div>
    </div>
  );
}

// Show up to `maxWords` words, then "Show More/Less"
function TruncatedMarkdown({ content, maxWords = 30 }) {
  const [showMore, setShowMore] = useState(false);

  if (!content) {
    return <span className="text-gray-400 italic">Not mentioned</span>;
  }

  const words = content.split(/\s+/);
  if (words.length <= maxWords) {
    return <ReactMarkdown>{content}</ReactMarkdown>;
  }

  const truncated = words.slice(0, maxWords).join(" ") + "...";
  return (
    <div>
      <ReactMarkdown>{showMore ? content : truncated}</ReactMarkdown>
      <button
        onClick={() => setShowMore(!showMore)}
        className="text-blue-600 underline mt-2"
      >
        {showMore ? "Show Less" : "Show More"}
      </button>
    </div>
  );
}

/**
 * Ensures each partial data object has a stable key (data.__stableKey).
 */
function ensureStableKey(data) {
  if (data.__stableKey) return data.__stableKey;

  // Priority #1: Non-N/A Publication Number
  if (data["Publication Number"] && data["Publication Number"] !== "N/A") {
    data.__stableKey = data["Publication Number"];
    return data.__stableKey;
  }

  // Priority #2: Non-N/A Title
  if (data["Title"] && data["Title"] !== "N/A") {
    data.__stableKey = data["Title"];
    return data.__stableKey;
  }

  // Fallback: random
  data.__stableKey = "Unknown_" + Math.random().toString(36).substring(7);
  return data.__stableKey;
}

/**
 * Decide how to render each cell
 */
function renderCellContent(record, topic) {
  const content = record[topic];
  if (content === undefined) {
    return <LoadingDots />;
  }
  if (!content || content.trim().length === 0 || content === "Not mentioned") {
    return <span className="text-gray-400 italic">Not mentioned</span>;
  }
  return <TruncatedMarkdown content={String(content)} />;
}

export default function RNDFormulation() {
  const location = useLocation();
  // Receive the user query and any optional tabs
  const { userQuery = "", selectedTabs = [] } = location.state || {};

  // Define which topics are always shown
  const defaultTopics = ["Title", "Publication Number"];
  // SSE-collected columns
  const [tableData, setTableData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sseError, setSseError] = useState(null);

  // AI columns
  const [aiColumnDialogOpen, setAiColumnDialogOpen] = useState(false);
  const [aiColumnName, setAiColumnName] = useState("");
  const [aiColumnDescription, setAiColumnDescription] = useState("");
  const [aiColumns, setAiColumns] = useState([]);
  const [isAiColumnLoading, setIsAiColumnLoading] = useState(false);

  // Combine default topics, user-selected topics, and AI columns
  // (If user didn’t select anything, it remains just Title + Pub. #)
  const topics = [...defaultTopics, ...selectedTabs, ...aiColumns];

  useEffect(() => {
    if (!userQuery) return;

  // Suppose `topics` holds the list of user-selected fields + default fields
  // e.g. ["Title", "Publication Number", "Stability Conditions", ...]

    const requestedFields = topics.join(","); 
  // If the user only has ["Title", "Publication Number"], it becomes "Title,Publication Number"

    setIsLoading(true);

    const endpoint = `${import.meta.env.VITE_API_URL}/api/rnd-formulation-llama`
      + `?user_query=${encodeURIComponent(userQuery)}`
      + `&size=5`
      + `&requested_fields=${encodeURIComponent(requestedFields)}`;

  const eventSource = new EventSource(endpoint);

    // Handles normal partial SSE data
    eventSource.onmessage = (event) => {
      setIsLoading(false);
      if (!event.data) return;

      try {
        const partialData = JSON.parse(event.data);
        const stableKey = ensureStableKey(partialData);

        setTableData((prev) => {
          const existingIndex = prev.findIndex(
            (col) => ensureStableKey(col) === stableKey
          );
          if (existingIndex !== -1) {
            // Merge new fields
            const updated = [...prev];
            updated[existingIndex] = {
              ...updated[existingIndex],
              ...partialData,
            };
            return updated;
          } else {
            return [...prev, partialData];
          }
        });
      } catch (err) {
        console.error("Error parsing SSE data:", err);
      }
    };

    // "done" event
    eventSource.addEventListener("done", (e) => {
      console.log("SSE complete:", e.data);
      eventSource.close();
      setIsLoading(false);
    });

    // SSE errors
    eventSource.onerror = (error) => {
      console.error("SSE Error:", error);
      setSseError("Error receiving updates from the server.");
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [userQuery]);

  /**
   * Submit a new AI column
   */
  const handleSubmitAiColumn = () => {
    if (!aiColumnName || !aiColumnDescription) {
      toast.warn("Please fill out both fields before adding an AI column.");
      return;
    }

    setIsAiColumnLoading(true);

    fetch(`${import.meta.env.VITE_API_URL}/add-ai-column-rnd`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        columnName: aiColumnName,
        columnDescription: aiColumnDescription,
        userQuery,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to add AI column");
        }
        return response.json();
      })
      .then((responseData) => {
        // "updated_ai_responses" is an array of strings for each column in tableData
        const { updated_ai_responses } = responseData;
        if (!updated_ai_responses) {
          throw new Error("No updated_ai_responses found in the response");
        }

        // Merge AI column data into each SSE column (tableData)
        const mergedTableData = tableData.map((col, i) => {
          if (updated_ai_responses[i]) {
            return {
              ...col,
              [aiColumnName]: updated_ai_responses[i],
            };
          }
          return col;
        });

        setTableData(mergedTableData);
        setAiColumns((prev) => [...prev, aiColumnName]);

        setAiColumnDialogOpen(false);
        setIsAiColumnLoading(false);
        toast.success("AI column added successfully!");
      })
      .catch((error) => {
        console.error("Error adding AI column:", error);
        toast.warn("Error adding AI column");
        setIsAiColumnLoading(false);
      });
  };

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <ToastContainer position="top-right" autoClose={5000} />

      <h1 className="text-2xl font-bold mb-4 text-gray-800">
        R&D Formulation Results for "{userQuery}"
      </h1>

      <div className="flex items-center gap-4 mb-4">
        {sseError && <p className="text-red-500">{sseError}</p>}
        {isLoading && (
          <div className="flex items-center gap-2 text-gray-500">
            <Loader2 className="animate-spin" />
            <span>Loading real-time LLM data...</span>
          </div>
        )}

        <Button
          onClick={() => setAiColumnDialogOpen(true)}
          variant="outline"
          className="bg-white text-[#a6ce39] border border-[#a6ce39] hover:bg-[#f0f8e5] rounded-lg ml-auto"
          disabled={isAiColumnLoading}
        >
          {isAiColumnLoading ? "Loading..." : "Add AI Column"}
        </Button>
      </div>
      <div className="flex items-center gap-4 mb-4">
        {sseError && <p className="text-red-500">{sseError}</p>}
        {isLoading && (
          <div className="flex items-center gap-2 text-gray-500">
            <Loader2 className="animate-spin" />
            <span>Loading real-time LLM data...</span>
          </div>
        )}

        <Button
          onClick={() => setAiColumnDialogOpen(true)}
          variant="outline"
          className="bg-white text-[#a6ce39] border border-[#a6ce39] hover:bg-[#f0f8e5] rounded-lg ml-auto"
          disabled={isAiColumnLoading}
        >
          {isAiColumnLoading ? "Loading..." : "Add AI Column"}
        </Button>
      </div>

      <div className="overflow-x-auto border border-gray-300 rounded-lg bg-white shadow-md">
        <table className="min-w-max text-sm text-gray-700">
          <tbody>
            {/* Render only the chosen topics + AI columns */}
            {topics.map((topic) => {
              const isTitleRow = topic === "Title";
              return (
                <tr key={topic} className="border-b hover:bg-gray-50">
                  {/* Sticky row label */}
                  <th
                    className="sticky left-0 bg-[#a6ce39] px-2 py-3 font-medium text-white whitespace-nowrap z-10"
                    style={{ minWidth: "180px" }}
                  >
                    {topic}
                  </th>
                  {/* Each SSE column is one <td> across this row */}
                  {tableData.map((record, colIndex) => (
                    <td
                      key={colIndex}
                      className={`px-2 py-3 align-top w-[400px] max-w-[400px] break-words ${
                        isTitleRow ? "font-bold" : ""
                      }`}
                    >
                      {renderCellContent(record, topic)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Dialog to gather AI column info */}
      <Dialog open={aiColumnDialogOpen} onOpenChange={setAiColumnDialogOpen}>
        <DialogContent className="bg-white">
          <DialogTitle>Add AI Column</DialogTitle>
          <DialogDescription>
            Enter a name and description for the new AI column.
          </DialogDescription>
          <div className="space-y-4 mt-4">
            <Input
              value={aiColumnName}
              onChange={(e) => setAiColumnName(e.target.value)}
              placeholder="Column Name"
              className="w-full p-2 border border-gray-200 rounded-lg text-gray-800"
            />
            <Input
              value={aiColumnDescription}
              onChange={(e) => setAiColumnDescription(e.target.value)}
              placeholder="Column Description"
              className="w-full p-2 border border-gray-200 rounded-lg text-gray-800"
            />
          </div>
          <DialogFooter className="mt-4">
            <Button
              onClick={handleSubmitAiColumn}
              disabled={isAiColumnLoading}
              className="bg-[#a6ce39] text-white hover:bg-[#95b833] rounded-lg"
            >
              {isAiColumnLoading ? "Adding..." : "Add Column"}
            </Button>
            <Button
              onClick={() => setAiColumnDialogOpen(false)}
              variant="outline"
              className="bg-white text-[#a6ce39] border border-[#a6ce39] hover:bg-[#f0f8e5] flex items-center rounded-lg gap-2"
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
