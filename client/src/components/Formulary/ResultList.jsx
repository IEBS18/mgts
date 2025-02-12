// Dashboard.jsx or the relevant component file

import React from "react";

export function ResultList({ results, selectedResultRows, toggleRowSelection }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse">
        <thead>
          <tr className="bg-[#FFF]">
            <th className="px-4 py-2 border text-[#54681D]">Disease Name</th>
            <th className="px-4 py-2 border text-[#54681D]">Drug Name</th>
            <th className="px-4 py-2 border text-[#54681D]">Drug Tier</th>
            <th className="px-4 py-2 border text-[#54681D]">Health Plan Name</th>
            <th className="px-4 py-2 border text-[#54681D]">Requirements/Limits</th>
            <th className="px-4 py-2 border text-[#54681D]">State Name</th>
            <th className="px-4 py-2 border text-[#54681D]">Plan Type</th> {/* New Column */}
          </tr>
        </thead>
        <tbody>
          {results.map((result, index) => (
            <tr
              key={index} // Ideally, use a unique identifier if available
              className={
                selectedResultRows.includes(index)
                  ? "bg-green-100"
                  : "hover:bg-gray-50 bg-white cursor-pointer"
              }
              onClick={() => toggleRowSelection(index)}
            >
              <td className="px-4 py-2 border">{result["Disease Name"] || "N/A"}</td>
              <td className="px-4 py-2 border">{result["Drug Name"] || "N/A"}</td>
              <td className="px-4 py-2 border">{result["Tier"] || "-"}</td> {/* Updated Field */}
              <td className="px-4 py-2 border">{result["Plan Name"] || "N/A"}</td> {/* Updated Field */}
              <td className="px-4 py-2 border">
                {result["Requirements/Limits"] !== "" ? result["Requirements/Limits"] : "Fully Reimbursed"}
              </td>
              <td className="px-4 py-2 border">{result["State Name"] || "N/A"}</td>
              <td className="px-4 py-2 border">{result["Plan Type"] || "N/A"}</td> {/* New Column */}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
