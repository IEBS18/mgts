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

"use client";

import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast, ToastContainer } from "react-toastify";

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
  );
}

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

// Function to render cell content based on the record and the column name (topic)
function renderCellContent(record, topic) {
  // Normalize column names to match the keys in record (Excel data)
  const normalizedTopic = topic.toLowerCase().replace(/\s+/g, "_");

  // Access the content in the record object based on the normalized topic
  const content = record[normalizedTopic];

  if (content === undefined) {
    return <LoadingDots />;
  }

  if (!content || content.trim().length === 0 || content === "Not mentioned") {
    return <span className="text-gray-400 italic">Not mentioned</span>;
  }

  return <TruncatedMarkdown content={String(content)} />;
}

export default function DrugFormulation() {
  const location = useLocation();
  const { selectedTabs = [] } = location.state || {};

  const [tableData, setTableData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sseError, setSseError] = useState(null);

  useEffect(() => {
    setIsLoading(true);

    const requestedFields = selectedTabs.join(",");

    const endpoint =
      `${import.meta.env.VITE_API_URL}/api/rnd-formulation-drug` +
      `?selected_tabs=${encodeURIComponent(requestedFields)}`;

    // Fetch the data from the Excel-based API endpoint
    fetch(endpoint)
      .then((response) => response.json())
      .then((data) => {
        setIsLoading(false);

        if (data.error) {
          setSseError(data.error);
        } else {
          // Process data here (converting it into a table structure)
          setTableData(data.data); // Update tableData with fetched data
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setIsLoading(false);
        setSseError("Error fetching data.");
      });
  }, [selectedTabs]);

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <ToastContainer position="top-right" autoClose={5000} />

      <h1 className="text-2xl font-bold mb-4 text-gray-800">
        Drug Formulation Results
      </h1>

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
              {selectedTabs.map((topic) => (
                <th
                  key={topic}
                  className="px-2 py-3 font-medium text-white whitespace-nowrap"
                  style={{ minWidth: "180px" }}
                >
                  {topic}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableData.map((record, rowIndex) => (
              <tr key={rowIndex} className="border-b hover:bg-gray-50">
                {selectedTabs.map((topic) => (
                  <td
                    key={topic}
                    className="px-2 py-3 align-top w-[400px] max-w-[400px] break-words"
                  >
                    {renderCellContent(record, topic)} {/* Rendering cell content */}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
 