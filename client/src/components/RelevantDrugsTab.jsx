// src/components/RelevantDrugsTab.jsx

import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, X, FileText } from "lucide-react";
import { toast } from "react-toastify"; // For user feedback
import { cn } from "@/utils/cn"; // Ensure this path is correct

const RelevantDrugsTab = ({
  diseaseInfo,
  drugInfo,
  selectedCards,
  handleSelectAll,
  handleExportSelectedCards,
  handleCardSelection,
  handleOpenDialog,
  isExporting,
  isChatMinimized,
}) => {
  // Handle export button click
  const handleExportClick = () => {
    if (selectedCards.length === 0) {
      toast.warn("No drugs selected for export.");
      return;
    }
    handleExportSelectedCards();
  };

  return (
    <div className={`w-${!isChatMinimized ? "2/3" : "full"} space-y-4 bg-white border border-[#a6ce39] rounded-[12px] p-6 shadow-lg overflow-y-auto scrollbar-hide max-h-[80vh] pb-6`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">
          Showing Relevant Drugs for{" "}
          <span className="text-[#a6ce39]">
            {diseaseInfo.Disease || "Unknown Disease"}
          </span>
        </h2>
        <div className="flex items-center gap-4">
          <Button
            onClick={handleSelectAll}
            className="bg-[#a6ce39] text-white hover:bg-[#95b833] rounded-[12px]"
          >
            {selectedCards.length === drugInfo.length
              ? "Unselect All"
              : "Select All"}
          </Button>
          <Button
            onClick={handleExportClick}
            disabled={isExporting}
            className={`bg-[#a6ce39] text-white hover:bg-[#95b833] rounded-[12px] flex items-center gap-2 ${
              isExporting ? "cursor-not-allowed opacity-50" : ""
            }`}
          >
            <Download className="h-4 w-4" />{" "}
            {isExporting ? "Exporting..." : "Export Selected"}
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 flex-1">
        {drugInfo.map((result, index) => (
          <Card
          key={index}
          className="bg-white border border-[#a6ce39] rounded-[12px] p-4 shadow-sm cursor-pointer relative"
          onClick={() => handleOpenDialog(result)}
      >
          <div
              onClick={(e) => e.stopPropagation()} // Prevent dialog from opening when checkbox is clicked
              className="absolute top-2 right-2"
          >
              <input
                  type="checkbox"
                  checked={selectedCards.includes(result)}
                  onChange={() => handleCardSelection(result)}
                  className="h-5 w-5 text-[#a6ce39] cursor-pointer "
                  style={{
                      accentColor: '#a6ce39', // Sets the accent color to green
                  }}
              />
          </div>
          <div className="mt-2">
              <p className="text-black font-bold"> {result.TradeName} ({result.Size})</p>
              <p><strong className="font-semibold">Active Ingredient:</strong> {result['Active Ingredient']}</p>
              <p><strong className="font-semibold">Price:</strong> ${(result.Price).toFixed(2)}</p>
              <p><strong className="font-semibold">Manufacturer:</strong> {result.Manufacturer}</p>
              <p><strong className="font-semibold">Country:</strong> {result.Country}</p>
          </div>
          {/* <FileText
              className="text-[#a6ce39] cursor-pointer justify-end"
              onClick={(e) => {
                  e.stopPropagation(); // Prevent card click from firing
                  handleOpenDialog(result);
              }}
          /> */}
      </Card>
        ))}
      </div>
    </div>
  );
};

export default RelevantDrugsTab;
