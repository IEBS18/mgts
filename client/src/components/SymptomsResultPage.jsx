import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card } from "./ui/card";
import { Button } from "@/components/ui/button"; 
import { Download, X } from 'lucide-react'; 

const SymptomResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { searchResults } = location.state || {}; // Get data passed through location.state
  const [selectedCards, setSelectedCards] = useState([]);
  const [isExporting, setIsExporting] = useState(false);

  // Handle select all / unselect all functionality
  const handleSelectAll = () => {
    if (selectedCards.length === searchResults.length) {
      setSelectedCards([]); // Unselect all
    } else {
      setSelectedCards(searchResults); // Select all
    }
  };

  // Handle card selection and unselection
  const handleCardSelection = (result) => {
    setSelectedCards((prevSelected) =>
      prevSelected.includes(result)
        ? prevSelected.filter((card) => card !== result)
        : [...prevSelected, result]
    );
  };

  // Handle export
//   const handleExport = () => {
//     setIsExporting(true);
//     // Logic to export selected cards data goes here
//     setTimeout(() => {
//       setIsExporting(false);
//       // Your export logic (e.g., create and download file)
//     }, 2000); // Simulating export time
//   };

  // Handle navigation to the disease search page with detailed data
  const handleViewDetail = (result) => {
    navigate('/disease-search', {
      state: { searchResults: result }, // Pass selected result to the new page
    });
  };

  return (
    <div className="w-full p-6 flex justify-center">
      <div className="w-full overflow-y-auto pr-2 scrollbar-hide pt-12">
        <div className="flex sticky items-center gap-4 pb-4">
          {/* <Button
            onClick={handleSelectAll}
            className="bg-[#a6ce39] text-white hover:bg-[#95b833] rounded-[12px]"
          >
            {selectedCards.length === searchResults.length ? 'Unselect All' : 'Select All'}
          </Button> */}
          {/* <Button
            onClick={handleExport}
            disabled={isExporting}
            className={`bg-[#a6ce39] text-white hover:bg-[#95b833] rounded-[12px] flex items-center gap-2 ${isExporting ? 'cursor-not-allowed opacity-50' : ''}`}
          >
            <Download className="h-4 w-4" /> {isExporting ? 'Exporting...' : 'Export Selected'}
          </Button> */}
        </div>
        <div className="space-y-4 flex flex-col">
          {searchResults?.map((result, index) => (
            <Card
              key={index}
              className={`bg-white border border-[#a6ce39] rounded-[12px] p-4 shadow-sm cursor-pointer relative ${selectedCards.includes(result) ? 'shadow-lg' : ''}`}
              onClick={() => handleCardSelection(result)}
            >
              {selectedCards.includes(result) && (
                <div className="absolute top-2 right-2">
                  <X className="h-5 w-full text-[#a6ce39]" />
                </div>
              )}
              <div>
                <p className="text-gray-600"> {result.Disease}</p>
                <p><strong>Symptoms:</strong> {result['Signs & Symptoms']}</p>
                <p><strong>Sub-Types:</strong> {result['Sub-types']}</p>
              </div>
              <Button
                className="bg-[#a6ce39] text-white hover:bg-[#95b833] rounded-[12px] w-full mt-4"
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewDetail(result);
                }}
              >
                View Detail
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SymptomResultsPage;
