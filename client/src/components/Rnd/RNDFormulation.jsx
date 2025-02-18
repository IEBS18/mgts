"use client";

import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

// Topics become table rows
const topics = [
  "Title",
  "Publication Number",
  "Stability Conditions",
  "Interaction",
  "Composition",
  "Composition Characteristics",
  "Interaction Components",
  "Solution Form",
  "Testing Conditions",
  "Stability Test Results",
  "Dissolution Study",
  "Safety Study Results",
  "Efficacy Studies",
  "Toxicity Studies",
  "Application",
  "IEB Comment (Summary)",
];

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
 * We do this once so updates to "Title" won't generate new columns.
 */
function ensureStableKey(data) {
  // If we already assigned a stableKey on a prior SSE chunk, reuse it
  if (data.__stableKey) {
    return data.__stableKey;
  }

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

  // Fallback: generate random
  data.__stableKey = "Unknown_" + Math.random().toString(36).substring(7);
  return data.__stableKey;
}

/**
 * Decide how to render each cell:
 * - If content === undefined => SSE not arrived => show LoadingDots()
 * - If content is "Not mentioned" or empty => italic text
 * - Else => truncated markdown
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
  const { userQuery = "" } = location.state || {};

  // tableData = array of columns. Each column is a record object.
  const [tableData, setTableData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sseError, setSseError] = useState(null);

  useEffect(() => {
    if (!userQuery) return;

    setIsLoading(true);
    const endpoint = `${
      import.meta.env.VITE_API_URL
    }/api/rnd-formulation-llama?user_query=${encodeURIComponent(
      userQuery
    )}&size=5`;

    const eventSource = new EventSource(endpoint);

    // Handles normal partial SSE data
    eventSource.onmessage = (event) => {
      setIsLoading(false);
      if (!event.data) return;

      try {
        const partialData = JSON.parse(event.data);
        // Assign a stable key to partialData
        const stableKey = ensureStableKey(partialData);

        setTableData((prev) => {
          // Find if we already have a column with the same stableKey
          const existingIndex = prev.findIndex(
            (col) => ensureStableKey(col) === stableKey
          );

          if (existingIndex !== -1) {
            // Merge new fields into that column
            const updated = [...prev];
            updated[existingIndex] = {
              ...updated[existingIndex],
              ...partialData,
            };
            return updated;
          } else {
            // Add a new column for this record
            return [...prev, partialData];
          }
        });
      } catch (err) {
        console.error("Error parsing SSE data:", err);
      }
    };

    // If you send "done" event from backend
    eventSource.addEventListener("done", (e) => {
      console.log("SSE complete:", e.data);
      eventSource.close();
      setIsLoading(false);
    });

    // Error or abrupt close
    eventSource.onerror = (error) => {
      console.error("SSE Error:", error);
      setSseError("Error receiving updates from the server.");
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [userQuery]);

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">
        R&D Formulation Results for "{userQuery}"
      </h1>

      {sseError && <p className="text-red-500 mb-2">{sseError}</p>}
      {isLoading && (
        <div className="flex items-center gap-2 mb-2 text-gray-500">
          <Loader2 className="animate-spin" />
          <span>Loading real-time LLM data...</span>
        </div>
      )}

      <div className="overflow-x-auto border border-gray-300 rounded-lg bg-white shadow-md">
        <table className="min-w-max text-sm text-gray-700">
          <tbody>
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
    </div>
  );
}
