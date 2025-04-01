// "use client";

// import React, { useState, useEffect } from "react";
// import { useLocation } from "react-router-dom";
// import { Loader2 } from "lucide-react";
// import ReactMarkdown from "react-markdown";
// import { Button } from "@/components/ui/button";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// import { toast, ToastContainer } from "react-toastify";

// // Reuse the same helper components as in RNDFormulation
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

// function ensureStableKey(data) {
//   if (data.__stableKey) return data.__stableKey;
//   if (data["Publication Number"] && data["Publication Number"] !== "N/A") {
//     data.__stableKey = data["Publication Number"];
//     return data.__stableKey;
//   }
//   if (data["Title"] && data["Title"] !== "N/A") {
//     data.__stableKey = data["Title"];
//     return data.__stableKey;
//   }
//   data.__stableKey = "Unknown_" + Math.random().toString(36).substring(7);
//   return data.__stableKey;
// }

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

// export default function DrugFormulation() {
//   const location = useLocation();
//   const { userQuery = "", selectedTabs = [] } = location.state || {};

//   // Default topics. Adjust if needed.
//   const defaultTopics = ["Title", "Publication Number"];

//   const [tableData, setTableData] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [sseError, setSseError] = useState(null);

//   // For AI column generation
//   const [aiColumnDialogOpen, setAiColumnDialogOpen] = useState(false);
//   const [aiColumnName, setAiColumnName] = useState("");
//   const [aiColumnDescription, setAiColumnDescription] = useState("");
//   const [aiColumns, setAiColumns] = useState([]);
//   const [isAiColumnLoading, setIsAiColumnLoading] = useState(false);

//   const topics = [...defaultTopics, ...selectedTabs, ...aiColumns];

//   useEffect(() => {
//     if (!userQuery) return;
//     setIsLoading(true);

//     const requestedFields = topics.join(",");

//     // This is the critical difference:
//     // We call /api/rnd-formulation-drug (instead of /api/rnd-formulation-llama).
//     const endpoint =
//       `${import.meta.env.VITE_API_URL}/api/rnd-formulation-drug` +
//       `?user_query=${encodeURIComponent(userQuery)}` +
//       `&size=5` +
//       `&requested_fields=${encodeURIComponent(requestedFields)}`;

//     const eventSource = new EventSource(endpoint);

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

//     eventSource.addEventListener("done", (e) => {
//       console.log("SSE complete:", e.data);
//       eventSource.close();
//       setIsLoading(false);
//     });

//     eventSource.onerror = (error) => {
//       console.error("SSE Error:", error);
//       setSseError("Error receiving updates from the server.");
//       eventSource.close();
//     };

//     return () => {
//       eventSource.close();
//     };
//   }, [userQuery, topics]);

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
//         const { updated_ai_responses } = responseData;
//         if (!updated_ai_responses) {
//           throw new Error("No updated_ai_responses found in the response");
//         }

//         const mergedTableData = tableData.map((col, i) => {
//           if (updated_ai_responses[i]) {
//             return {
//               ...col,
//               [aiColumnName]: updated_ai_responses[i],
//             };
//           }
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
//       <ToastContainer position="top-right" autoClose={5000} />

//       <h1 className="text-2xl font-bold mb-4 text-gray-800">
//         Drug Formulation Results for "{userQuery}"
//       </h1>

//       <div className="flex items-center gap-4 mb-4">
//         {sseError && <p className="text-red-500">{sseError}</p>}
//         {isLoading && (
//           <div className="flex items-center gap-2 text-gray-500">
//             <Loader2 className="animate-spin" />
//             <span>Loading real-time LLM data...</span>
//           </div>
//         )}

//         {/* <Button
//           onClick={() => setAiColumnDialogOpen(true)}
//           variant="outline"
//           className="bg-white text-[#a6ce39] border border-[#a6ce39] hover:bg-[#f0f8e5] rounded-lg ml-auto"
//           disabled={isAiColumnLoading}
//         >
//           {isAiColumnLoading ? "Loading..." : "Add AI Column"}
//         </Button> */}
//       </div>

//       <div className="overflow-x-auto border border-gray-300 rounded-lg bg-white shadow-md">
//         <table className="min-w-max text-sm text-gray-700">
//           <tbody>
//             {topics.map((topic) => {
//               const isTitleRow = topic === "Title";
//               return (
//                 <tr key={topic} className="border-b hover:bg-gray-50">
//                   <th
//                     className="sticky left-0 bg-[#a6ce39] px-2 py-3 font-medium text-white whitespace-nowrap z-10"
//                     style={{ minWidth: "180px" }}
//                   >
//                     {topic}
//                   </th>
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

//       {/* AI Column Dialog */}
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


// "use client";

// import React, { useState, useEffect } from "react";
// import { useLocation } from "react-router-dom";
// import { Loader2 } from "lucide-react";
// import ReactMarkdown from "react-markdown";
// import { Button } from "@/components/ui/button";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// import { toast, ToastContainer } from "react-toastify";

// // Loading and markdown rendering helpers
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

// function ensureStableKey(data) {
//   if (data.__stableKey) return data.__stableKey;
//   if (data["Publication Number"] && data["Publication Number"] !== "N/A") {
//     data.__stableKey = data["Publication Number"];
//     return data.__stableKey;
//   }
//   if (data["Title"] && data["Title"] !== "N/A") {
//     data.__stableKey = data["Title"];
//     return data.__stableKey;
//   }
//   data.__stableKey = "Unknown_" + Math.random().toString(36).substring(7);
//   return data.__stableKey;
// }

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

// export default function DrugFormulation() {
//   const location = useLocation();
//   const { selectedTabs = [] } = location.state || {};

//   const [tableData, setTableData] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [sseError, setSseError] = useState(null);

//   useEffect(() => {
//     setIsLoading(true);

//     const requestedFields = selectedTabs.join(",");

//     const endpoint =
//       `${import.meta.env.VITE_API_URL}/api/rnd-formulation-drug` +
//       `?selected_tabs=${encodeURIComponent(requestedFields)}`;

//     // Fetch the data from the Excel-based API endpoint
//     fetch(endpoint)
//       .then((response) => response.json())
//       .then((data) => {
//         setIsLoading(false);
//         if (data.error) {
//           setSseError(data.error);
//         } else {
//           // Process data here (converting it into a table structure)
//           setTableData(data.data);
//         }
//       })
//       .catch((error) => {
//         console.error("Error fetching data:", error);
//         setIsLoading(false);
//         setSseError("Error fetching data.");
//       });
//   }, [selectedTabs]);

//   return (
//     <div className="p-4 bg-gray-100 min-h-screen">
//       <ToastContainer position="top-right" autoClose={5000} />

//       <h1 className="text-2xl font-bold mb-4 text-gray-800">
//         Drug Formulation Results
//       </h1>

//       <div className="flex items-center gap-4 mb-4">
//         {sseError && <p className="text-red-500">{sseError}</p>}
//         {isLoading && (
//           <div className="flex items-center gap-2 text-gray-500">
//             <Loader2 className="animate-spin" />
//             <span>Loading data...</span>
//           </div>
//         )}
//       </div>

//       <div className="overflow-x-auto border border-gray-300 rounded-lg bg-white shadow-md">
//         <table className="min-w-max text-sm text-gray-700">
//           <tbody>
//             {selectedTabs.map((topic) => {
//               return (
//                 <tr key={topic} className="border-b hover:bg-gray-50">
//                   <th
//                     className="sticky left-0 bg-[#a6ce39] px-2 py-3 font-medium text-white whitespace-nowrap z-10"
//                     style={{ minWidth: "180px" }}
//                   >
//                     {topic}
//                   </th>
//                   {tableData.map((record, colIndex) => (
//                     <td
//                       key={colIndex}
//                       className="px-2 py-3 align-top w-[400px] max-w-[400px] break-words"
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
//     </div>
//   );
// }



// "use client";

// import React, { useState, useEffect } from "react";
// import { useLocation } from "react-router-dom";
// import { Loader2 } from "lucide-react";
// import ReactMarkdown from "react-markdown";
// import { Button } from "@/components/ui/button";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// import { toast, ToastContainer } from "react-toastify";

// // Loading and markdown rendering helpers
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

// function ensureStableKey(data) {
//   if (data.__stableKey) return data.__stableKey;
//   if (data["Publication Number"] && data["Publication Number"] !== "N/A") {
//     data.__stableKey = data["Publication Number"];
//     return data.__stableKey;
//   }
//   if (data["Title"] && data["Title"] !== "N/A") {
//     data.__stableKey = data["Title"];
//     return data.__stableKey;
//   }
//   data.__stableKey = "Unknown_" + Math.random().toString(36).substring(7);
//   return data.__stableKey;
// }

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

// export default function DrugFormulation() {
//   const location = useLocation();
//   const { selectedTabs = [] } = location.state || {};

//   const [tableData, setTableData] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [sseError, setSseError] = useState(null);

//   useEffect(() => {
//     setIsLoading(true);

//     const requestedFields = selectedTabs.join(",");

//     const endpoint =
//       `${import.meta.env.VITE_API_URL}/api/rnd-formulation-drug` +
//       `?selected_tabs=${encodeURIComponent(requestedFields)}`;

//     // Fetch the data from the Excel-based API endpoint
//     fetch(endpoint)
//       .then((response) => response.json())
//       .then((data) => {
//         setIsLoading(false);
//         if (data.error) {
//           setSseError(data.error);
//         } else {
//           // Process data here (converting it into a table structure)
//           setTableData(data.data);
//         }
//       })
//       .catch((error) => {
//         console.error("Error fetching data:", error);
//         setIsLoading(false);
//         setSseError("Error fetching data.");
//       });
//   }, [selectedTabs]);

//   return (
//     <div className="p-4 bg-gray-100 min-h-screen">
//       <ToastContainer position="top-right" autoClose={5000} />

//       <h1 className="text-2xl font-bold mb-4 text-gray-800">
//         Drug Formulation Results
//       </h1>

//       <div className="flex items-center gap-4 mb-4">
//         {sseError && <p className="text-red-500">{sseError}</p>}
//         {isLoading && (
//           <div className="flex items-center gap-2 text-gray-500">
//             <Loader2 className="animate-spin" />
//             <span>Loading data...</span>
//           </div>
//         )}
//       </div>

//       <div className="overflow-y-auto max-h-[500px] border border-gray-300 rounded-lg bg-white shadow-md">
//         <table className="min-w-max text-sm text-gray-700">
//           <thead>
//             <tr className="sticky top-0 bg-[#a6ce39]">
//               {selectedTabs.map((topic) => (
//                 <th
//                   key={topic}
//                   className="px-2 py-3 font-medium text-white whitespace-nowrap"
//                   style={{ minWidth: "180px" }}
//                 >
//                   {topic}
//                 </th>
//               ))}
//             </tr>
//           </thead>
//           <tbody>
//             {tableData.map((record, rowIndex) => (
//               <tr key={rowIndex} className="border-b hover:bg-gray-50">
//                 {selectedTabs.map((topic) => (
//                   <td
//                     key={topic}
//                     className="px-2 py-3 align-top w-[400px] max-w-[400px] break-words"
//                   >
//                     {renderCellContent(record, topic)}
//                   </td>
//                 ))}
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }



// "use client";

// import React, { useState, useEffect } from "react";
// import { useLocation } from "react-router-dom";
// import { Loader2 } from "lucide-react";
// import ReactMarkdown from "react-markdown";
// import { Button } from "@/components/ui/button";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// import { toast, ToastContainer } from "react-toastify";

// // Loading and markdown rendering helpers
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

// export default function DrugFormulation() {
//   const location = useLocation();
//   const { selectedTabs = [] } = location.state || {};

//   const [tableData, setTableData] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [sseError, setSseError] = useState(null);

//   useEffect(() => {
//     setIsLoading(true);

//     const requestedFields = selectedTabs.join(",");

//     const endpoint =
//       `${import.meta.env.VITE_API_URL}/api/rnd-formulation-drug` +
//       `?selected_tabs=${encodeURIComponent(requestedFields)}`;

//     // Fetch the data from the Excel-based API endpoint
//     fetch(endpoint)
//       .then((response) => response.json())
//       .then((data) => {
//         // Ensure that isLoading is set to false after data is loaded
//         setIsLoading(false);

//         if (data.error) {
//           setSseError(data.error);
//         } else {
//           // Process data here (converting it into a table structure)
//           setTableData(data.data);
//           console.log(tableData);
//           console.log(isLoading);
//         }
//       })
//       .catch((error) => {
//         console.error("Error fetching data:", error);
//         setIsLoading(false);  // Ensure we stop the loading indicator on error
//         setSseError("Error fetching data.");
//       });
//   }, [selectedTabs]);

//   return (
//     <div className="p-4 bg-gray-100 min-h-screen">
//       <ToastContainer position="top-right" autoClose={5000} />

//       <h1 className="text-2xl font-bold mb-4 text-gray-800">
//         Drug Formulation Results
//       </h1>

//       <div className="flex items-center gap-4 mb-4">
//         {sseError && <p className="text-red-500">{sseError}</p>}
//         {isLoading && (
//           <div className="flex items-center gap-2 text-gray-500">
//             <Loader2 className="animate-spin" />
//             <span>Loading data...</span>
//           </div>
//         )}
//       </div>

//       <div className="overflow-y-auto max-h-[500px] border border-gray-300 rounded-lg bg-white shadow-md">
//         <table className="min-w-max text-sm text-gray-700">
//           <thead>
//             <tr className="sticky top-0 bg-[#a6ce39]">
//               {selectedTabs.map((topic) => (
//                 <th
//                   key={topic}
//                   className="px-2 py-3 font-medium text-white whitespace-nowrap"
//                   style={{ minWidth: "180px" }}
//                 >
//                   {topic}
//                 </th>
//               ))}
//             </tr>
//           </thead>
//           <tbody>
//             {tableData.map((record, rowIndex) => (
//               <tr key={rowIndex} className="border-b hover:bg-gray-50">
//                 {selectedTabs.map((topic) => (
//                   <td
//                     key={topic}
//                     className="px-2 py-3 align-top w-[400px] max-w-[400px] break-words"
//                   >
//                     {renderCellContent(record, topic)}
//                   </td>
//                 ))}
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }

"use client"

import { useState, useEffect } from "react"
import { useLocation } from "react-router-dom"
import { Loader2 } from "lucide-react"
import ReactMarkdown from "react-markdown"
import { ToastContainer } from "react-toastify"

// Loading and markdown rendering helpers
function LoadingDots() {
  return (
    <div className="flex items-center justify-center">
      <div className="animate-pulse flex space-x-1">
        <div className="w-2 h-2 bg-[#a6ce39] rounded-full"></div>
        <div className="w-2 h-2 bg-[#a6ce39] rounded-full"></div>
        <div className="w-2 h-2 bg-[#a6ce39] rounded-full"></div>
      </div>
    </div>
  )
}

function TruncatedMarkdown({ content, maxWords = 30 }) {
  const [showMore, setShowMore] = useState(false)

  if (!content) {
    return <span className="text-gray-400 italic">Not mentioned</span>
  }

  const words = content.split(/\s+/)
  if (words.length <= maxWords) {
    return <ReactMarkdown>{content}</ReactMarkdown>
  }

  const truncated = words.slice(0, maxWords).join(" ") + "..."
  return (
    <div>
      <ReactMarkdown>{showMore ? content : truncated}</ReactMarkdown>
      <button onClick={() => setShowMore(!showMore)} className="text-blue-600 underline mt-2">
        {showMore ? "Show Less" : "Show More"}
      </button>
    </div>
  )
}

// Function to render cell content based on the record and the column name (topic)
function renderCellContent(record, topic) {
  // Normalize column names to match the keys in record (Excel data)
  const normalizedTopic = topic.toLowerCase().replace(/\s+/g, "_")

  // Access the content in the record object based on the normalized topic
  const content = record[normalizedTopic]

  if (content === undefined) {
    return <LoadingDots />
  }

  if (!content || content.trim().length === 0 || content === "Not mentioned") {
    return <span className="text-gray-400 italic">Not mentioned</span>
  }

  return <TruncatedMarkdown content={String(content)} />
}

import { Cell, Pie, PieChart, Tooltip } from 'recharts';

// Pie Chart Component
function PieChartComp() {
  const [pieChartData, setPieChartData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF']
 

  useEffect(() => {
    setIsLoading(true)
    fetch(`${import.meta.env.VITE_API_URL}/api/pie-chart`)
      .then((response) => response.json())
      .then((data) => {
        setIsLoading(false)
        if (data.error) {
          setError(data.error)
        } else {
          setPieChartData(data.pie_chart_data)
        }
      })
      .catch((error) => {
        console.error("Error fetching pie chart:", error)
        setIsLoading(false)
        setError("Error fetching pie chart data.")
      })
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="animate-spin mr-2" />
        <span>Loading pie chart...</span>
      </div>
    )
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-md h-full">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Top 5 Diseases to Explore</h2>
      {pieChartData && (
        <div className="flex h-full justify-center">

          {/* <img
            src={`data:image/png;base64,${pieChartData}`}
            alt="Top 5 Diseases Pie Chart"
            className="max-w-full max-h-[300px]"
          /> */}
          <PieChart width={200} height={200}>
            <Pie
              data={pieChartData}
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label
            >
              {pieChartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>

        </div>
      )}
    </div>
  )
}

// Benchmark Table Component
function BenchmarkTable() {
  const [benchmarkData, setBenchmarkData] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [weights, setWeights] = useState({
    enrollment: 0.2,
    mechanism: 0.15,
    justification: 0.2,
    prevalence: 0.2,
    bausch_presence: 0.15,
    safety_efficacy: 0.1,
  })
  const [isUpdating, setIsUpdating] = useState(false)

  const fetchBenchmarkData = (default_weights = null) => {
    setIsLoading(true)

    // Prepare URL with query parameters if custom weights are provided
    let url = `${import.meta.env.VITE_API_URL}/api/benchmark-table`
    if (default_weights) {
      const params = new URLSearchParams()
      Object.entries(default_weights).forEach(([key, value]) => {
        params.append(key, value)
      })
      url = `${url}?${params.toString()}`
    }

    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        setIsLoading(false)
        console.log("data: ", data);
        if (data.error) {
          setError(data.error)
        } else {
          setBenchmarkData(data.benchmark_table)
          console.log("benchmark data", benchmarkData);
        }
      })
      .catch((error) => {
        console.error("Error fetching benchmark table:", error)
        setIsLoading(false)
        setError("Error fetching benchmark data.")
      })
  }

  useEffect(() => {
    fetchBenchmarkData()
  }, [])

  const handleWeightChange = (key, value) => {
    // Ensure value is a number between 0 and 1
    const numValue = Number.parseFloat(value)
    if (isNaN(numValue) || numValue < 0 || numValue > 1) return

    setWeights({
      ...weights,
      [key]: numValue,
    })
  }

  const updateBenchmark = () => {
    setIsUpdating(true)
    fetchBenchmarkData(weights)
    setIsUpdating(false)
  }

  // Ensure weights sum to 1
  const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0)
  const isValidWeights = Math.abs(totalWeight - 1) < 0.01 // Allow small rounding errors

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="animate-spin mr-2" />
        <span>Loading benchmark data...</span>
      </div>
    )
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-md h-full">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Benchmark Scores</h2>

      {/* Weights Configuration */}
      <div className="mb-4 p-3 bg-gray-50 rounded-md">
        <h3 className="font-semibold mb-2">Adjust Weights</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-2">
          <div>
            <label className="text-xs block">Enrollment</label>
            <input
              type="number"
              min="0"
              max="1"
              step="0.05"
              value={weights.enrollment}
              onChange={(e) => handleWeightChange("enrollment", e.target.value)}
              className="w-full p-1 border rounded text-sm"
            />
          </div>
          <div>
            <label className="text-xs block">Mechanism</label>
            <input
              type="number"
              min="0"
              max="1"
              step="0.05"
              value={weights.mechanism}
              onChange={(e) => handleWeightChange("mechanism", e.target.value)}
              className="w-full p-1 border rounded text-sm"
            />
          </div>
          <div>
            <label className="text-xs block">Justification</label>
            <input
              type="number"
              min="0"
              max="1"
              step="0.05"
              value={weights.justification}
              onChange={(e) => handleWeightChange("justification", e.target.value)}
              className="w-full p-1 border rounded text-sm"
            />
          </div>
          <div>
            <label className="text-xs block">Prevalence</label>
            <input
              type="number"
              min="0"
              max="1"
              step="0.05"
              value={weights.prevalence}
              onChange={(e) => handleWeightChange("prevalence", e.target.value)}
              className="w-full p-1 border rounded text-sm"
            />
          </div>
          <div>
            <label className="text-xs block">Bausch Presence</label>
            <input
              type="number"
              min="0"
              max="1"
              step="0.05"
              value={weights.bausch_presence}
              onChange={(e) => handleWeightChange("bausch_presence", e.target.value)}
              className="w-full p-1 border rounded text-sm"
            />
          </div>
          <div>
            <label className="text-xs block">Safety & Efficacy</label>
            <input
              type="number"
              min="0"
              max="1"
              step="0.05"
              value={weights.safety_efficacy}
              onChange={(e) => handleWeightChange("safety_efficacy", e.target.value)}
              className="w-full p-1 border rounded text-sm"
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className={`text-xs ${isValidWeights ? "text-green-600" : "text-red-600"}`}>
            Total: {totalWeight.toFixed(2)} {isValidWeights ? "✓" : "(should equal 1.0)"}
          </div>
          <button
            onClick={updateBenchmark}
            disabled={!isValidWeights || isUpdating}
            className={`px-3 py-1 text-sm rounded ${isValidWeights ? "bg-[#a6ce39] text-white hover:bg-[#95b933]" : "bg-gray-300 cursor-not-allowed"}`}
          >
            {isUpdating ? "Updating..." : "Update Scores"}
          </button>
        </div>
      </div>

      {/* Benchmark Table */}
      <div className="overflow-y-auto max-h-[200px]">
        <table className="min-w-full text-sm text-gray-700">
          <thead>
            <tr className="bg-[#a6ce39]">
              <th className="px-2 py-2 text-white">Disease</th>
              <th className="px-2 py-2 text-white">Benchmark Score</th>
              <th className="px-2 py-2 text-white">Weight Distribution</th>
            </tr>
          </thead>
          <tbody>
            {benchmarkData.map((item, index) => (
              <tr key={index} className="border-b hover:bg-gray-50">
                <td className="px-2 py-2">{item.disease}</td>
                <td className="px-2 py-2">{item.benchmark_score}</td>
                <td className="px-2 py-2 text-xs">
                  {item.Weights && (
                    <div className="grid grid-cols-2 gap-x-2">
                      <div>Enrollment: {item.Weights.enrollment}</div>
                      <div>Mechanism: {item.Weights.mechanism}</div>
                      <div>Justification: {item.Weights.justification}</div>
                      <div>Prevalence: {item.Weights.prevalence}</div>
                      <div>Bausch: {item.Weights.bausch_presence}</div>
                      <div>Safety: {item.Weights.safety_efficacy}</div>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function DrugFormulation() {
  const location = useLocation()
  const { selectedTabs = [] } = location.state || {}

  const [tableData, setTableData] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [sseError, setSseError] = useState(null)
  const [orderedTabs, setOrderedTabs] = useState([])

  useEffect(() => {
    // Ensure there are no duplicates in selectedTabs
    const uniqueSelectedTabs = Array.from(new Set(selectedTabs))

    // Define the desired column order
    const columnOrder = [
      "Disease",
      "Diseases_PMC_ID",
      "Disease_Title",
      "Disease_Mechanism",
      "Disease_Microbes",
      "Drug_PMC_ID",
      "Drug_Title",
      "Drug_Mechanism",
      "Drug_Microbes",
      "Justification_for_Drug_Use",
    ]

    // Filter the selectedTabs to only include columns from the order and set the order
    const orderedTabs = columnOrder.filter((tab) => uniqueSelectedTabs.includes(tab))

    // Set the orderedTabs state
    setOrderedTabs(orderedTabs)

    setIsLoading(true)

    const requestedFields = orderedTabs.join(",")

    const endpoint =
      `${import.meta.env.VITE_API_URL}/api/rnd-formulation-drug` +
      `?selected_tabs=${encodeURIComponent(requestedFields)}`

    // Fetch the data from the Excel-based API endpoint
    fetch(endpoint)
      .then((response) => response.json())
      .then((data) => {
        setIsLoading(false)

        if (data.error) {
          setSseError(data.error)
        } else {
          // Process data here (converting it into a table structure)
          setTableData(data.data) // Update tableData with fetched data
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error)
        setIsLoading(false)
        setSseError("Error fetching data.")
      })
  }, [selectedTabs])

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <ToastContainer position="top-right" autoClose={5000} />

      <h1 className="text-2xl font-bold mb-4 text-gray-800">Drug Formulation Results</h1>

      {/* Analytics Dashboard Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="h-[350px]">
          <PieChartComp />
        </div>
        <div className="h-[350px]">
          <BenchmarkTable />
        </div>
      </div>

      <div className="flex items-center gap-4 mb-4">
        {sseError && <p className="text-red-500">{sseError}</p>}
        {isLoading && (
          <div className="flex items-center gap-2 text-gray-500">
            <Loader2 className="animate-spin" />
            <span>Loading data...</span>
          </div>
        )}
      </div>

      <div className="overflow-y-auto max-h-[500px] border border-gray-300 rounded-lg bg-white shadow-md">
        <table className="min-w-max text-sm text-gray-700">
          <thead>
            <tr className="sticky top-0 bg-[#a6ce39]">
              {orderedTabs.map((topic) => (
                <th
                  key={topic}
                  className="px-2 py-3 font-medium text-white whitespace-nowrap"
                  style={{ minWidth: "180px" }}
                >
                  {topic.replace(/_/g, " ").toUpperCase()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableData.map((record, rowIndex) => (
              <tr key={rowIndex} className="border-b hover:bg-gray-50">
                {orderedTabs.map((topic) => (
                  <td key={topic} className="px-2 py-3 align-top w-[400px] max-w-[400px] break-words">
                    {renderCellContent(record, topic)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

