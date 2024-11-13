// import React from "react";
// import { Button } from "@/components/ui/button";
// import { Card } from "@/components/ui/card";
// import { Download, X, FileText } from "lucide-react";
// import { toast } from "react-toastify"; // For user feedback

// const RelevantDrugsTab = ({
//   diseaseInfo,
//   drugInfo,
//   selectedCards,
//   handleSelectAll,
//   handleExportSelectedCards,
//   handleCardSelection,
//   handleOpenDialog,
//   isExporting,
// }) => {
//   // Handle export button click
//   const handleExportClick = () => {
//     if (selectedCards.length === 0) {
//       toast.warn("No drugs selected for export.");
//       return;
//     }
//     handleExportSelectedCards();
//   };

//   return (
//     <>
//       <div className="flex items-center justify-between mb-4">
//         <h2 className="text-xl font-bold text-gray-800">
//           Showing Relevant Drugs for <span className="text-[#a6ce39]">{diseaseInfo.Disease || "Unknown Disease"}</span>
//         </h2>
//         <div className="flex items-center gap-4">
//           <Button
//             onClick={handleSelectAll}
//             className="bg-[#a6ce39] text-white hover:bg-[#95b833] rounded-[12px]"
//           >
//             {selectedCards.length === drugInfo.length ? 'Unselect All' : 'Select All'}
//           </Button>
//           <Button
//             onClick={handleExportClick}
//             disabled={isExporting}
//             className={`bg-[#a6ce39] text-white hover:bg-[#95b833] rounded-[12px] flex items-center gap-2 ${isExporting ? 'cursor-not-allowed opacity-50' : ''}`}
//           >
//             <Download className="h-4 w-4" /> {isExporting ? 'Exporting...' : 'Export Selected'}
//           </Button>
//         </div>
//       </div>
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto flex-1">
//         {drugInfo.map((result, index) => (
//           <Card
//             key={index}
//             className={`bg-white border border-[#a6ce39] rounded-[12px] p-4 shadow-sm cursor-pointer relative ${selectedCards.includes(result) ? 'shadow-lg' : ''}`}
//             onClick={() => handleCardSelection(result)}
//           >
//             {selectedCards.includes(result) && (
//               <div className="absolute top-2 right-2">
//                 <X className="h-5 w-5 text-[#a6ce39]" />
//               </div>
//             )}
//             <div>
//               <p className="text-gray-600"> {result.TradeName}, {result['Active Ingredient']}</p>
//               <p><strong>Morbidity:</strong> {result.Morbidity}</p>
//               <p><strong>Mortality Rate:</strong> {result.Mortality}%</p>
//               <p><strong>Country:</strong> {result.Country}</p>
//             </div>
//             <FileText
//               className="text-[#a6ce39] cursor-pointer justify-end mt-2"
//               onClick={(e) => {
//                 e.stopPropagation();
//                 handleOpenDialog(result);
//               }}
//             />
//           </Card>
//         ))}
//       </div>
//     </>
//   );
// };

// export default RelevantDrugsTab;


// RelevantDrugsTab.jsx

import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, X, FileText } from "lucide-react";
import { toast } from "react-toastify"; // For user feedback
import { cn } from "@/utils/cn"; // Adjust the import path as necessary

const RelevantDrugsTab = ({
  diseaseInfo,
  drugInfo,
  selectedCards,
  handleSelectAll,
  handleExportSelectedCards,
  handleCardSelection,
  handleOpenDialog,
  isExporting,
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
    <>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">
          Showing Relevant Drugs for <span className="text-[#a6ce39]">{diseaseInfo.Disease || "Unknown Disease"}</span>
        </h2>
        <div className="flex items-center gap-4">
          <Button
            onClick={handleSelectAll}
            className="bg-[#a6ce39] text-white hover:bg-[#95b833] rounded-[12px]"
          >
            {selectedCards.length === drugInfo.length ? 'Unselect All' : 'Select All'}
          </Button>
          <Button
            onClick={handleExportClick}
            disabled={isExporting}
            className={`bg-[#a6ce39] text-white hover:bg-[#95b833] rounded-[12px] flex items-center gap-2 ${isExporting ? 'cursor-not-allowed opacity-50' : ''}`}
          >
            <Download className="h-4 w-4" /> {isExporting ? 'Exporting...' : 'Export Selected'}
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto flex-1">
        {drugInfo.map((result, index) => (
          <Card
            key={index}
            className={`bg-white border border-[#a6ce39] rounded-[12px] p-4 shadow-sm cursor-pointer relative ${selectedCards.includes(result) ? 'shadow-lg' : ''}`}
            onClick={() => handleCardSelection(result)}
          >
            {selectedCards.includes(result) && (
              <div className="absolute top-2 right-2">
                <X className="h-5 w-5 text-[#a6ce39]" />
              </div>
            )}
            <div>
              <p className="text-gray-600"> {result.TradeName}, {result['Active Ingredient']}</p>
              <p><strong>Morbidity:</strong> {result.Morbidity}</p>
              <p><strong>Mortality Rate:</strong> {result.Mortality}%</p>
              <p><strong>Country:</strong> {result.Country}</p>
            </div>
            <FileText
              className="text-[#a6ce39] cursor-pointer justify-end mt-2"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenDialog(result);
              }}
            />
          </Card>
        ))}
      </div>
    </>
  );
};

export default RelevantDrugsTab;
