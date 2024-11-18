// import React, { useCallback, useState } from 'react';
// import { useLocation } from 'react-router-dom';
// import { Card } from "./ui/card";
// import { Button } from "@/components/ui/button"; // Adjust to your imports
// import { Download, FileText, X } from 'lucide-react'; // Adjust imports based on your setup
// import { Dialog, DialogContent, DialogTitle, DialogDescription } from "./ui/dialog";


// const DrugResultsPage = () => {
//     const location = useLocation();
//     const { searchResults } = location.state || {}; // Get data passed through location.state
//     const [selectedCards, setSelectedCards] = useState([]);
//     const [isExporting, setIsExporting] = useState(false);
//     const [dialogOpen, setDialogOpen] = useState(false);
//     const [selectedResult, setSelectedResult] = useState(null);
//     // Handle select all / unselect all functionality
//     const handleSelectAll = () => {
//         if (selectedCards.length === searchResults.length) {
//             setSelectedCards([]); // Unselect all
//         } else {
//             setSelectedCards(searchResults); // Select all
//         }
//     };

//     // Handle card selection and unselection
//     const handleCardSelection = (result) => {
//         setSelectedCards((prevSelected) =>
//             prevSelected.includes(result)
//                 ? prevSelected.filter((card) => card !== result)
//                 : [...prevSelected, result]
//         );
//     };

//     // Handle export
//     const handleExport = useCallback(() => {
//         setIsExporting(true);
//         fetch("http://localhost:5000/download-excel", {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify(selectedCards),
//         })
//           .then((response) => {
//             if (!response.ok) {
//               throw new Error("Failed to export data");
//             }
//             return response.blob();
//           })
//           .then((blob) => {
//             const url = window.URL.createObjectURL(blob);
//             const link = document.createElement("a");
//             link.href = url;
//             link.setAttribute("download", "selected_cards.xlsx");
//             document.body.appendChild(link);
//             link.click();
//             link.parentNode.removeChild(link);
//             setIsExporting(false);
//           })
//           .catch((error) => {
//             console.error("Error exporting selected cards:", error);
//             setIsExporting(false);
//           });
//       }, [selectedCards]);
    

//     // Handle dialog open (this would need to be defined elsewhere)
//     const handleOpenDialog = useCallback((result) => {
//         setSelectedResult(result);
//         setDialogOpen(true);
//       }, []);

//     return (
//         <div className="w-full p-6">
//             <div className="w-1/3 overflow-y-auto pr-2 scrollbar-hide pt-12">
//                 <div className="flex sticky items-center gap-4 pb-4">
//                     <Button
//                         onClick={handleSelectAll}
//                         className="bg-[#a6ce39] text-white hover:bg-[#95b833] rounded-[12px]"
//                     >
//                         {selectedCards.length === searchResults.length ? 'Unselect All' : 'Select All'}
//                     </Button>
//                     <Button
//                         onClick={handleExport}
//                         disabled={isExporting}
//                         className={`bg-[#a6ce39] text-white hover:bg-[#95b833] rounded-[12px] flex items-center gap-2 ${isExporting ? 'cursor-not-allowed opacity-50' : ''}`}
//                     >
//                         <Download className="h-4 w-4" /> {isExporting ? 'Exporting...' : 'Export Selected'}
//                     </Button>
//                 </div>
//                 <div className="space-y-4 flex flex-col">
//                     {searchResults?.map((result, index) => (
//                         <Card
//                             key={index}
//                             className={`bg-white border border-[#a6ce39] rounded-[12px] p-4 shadow-sm cursor-pointer relative ${selectedCards.includes(result) ? 'shadow-lg' : ''}`}
//                             onClick={() => handleCardSelection(result)}
//                         >
//                             {selectedCards.includes(result) && (
//                                 <div className="absolute top-2 right-2">
//                                     <X className="h-5 w-5 text-[#a6ce39]" />
//                                 </div>
//                             )}
//                             <div>
//                                 <p className="text-gray-600"> {result.TradeName}, {result['Active Ingredient']}</p>
//                                 <p><strong>Morbidity:</strong> {result.Morbidity}</p>
//                                 <p><strong>Mortality Rate:</strong> {result.Mortality}%</p>
//                                 <p><strong>Country:</strong> {result.Country}</p>
//                             </div>
//                             <FileText
//                                 className="text-[#a6ce39] cursor-pointer justify-end"
//                                 onClick={(e) => {
//                                     e.stopPropagation();
//                                     handleOpenDialog(result);
//                                 }}
//                             />
//                         </Card>
//                     ))}
//                 </div>
//                 {dialogOpen && selectedResult && (
//                     <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
//                         <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-white">
//                             <DialogTitle>{selectedResult.TradeName}</DialogTitle>
//                             <DialogDescription>
//                                 {Object.entries(selectedResult).map(([key, value]) => (
//                                     <p key={key}><strong>{key}:</strong> {value}</p>
//                                 ))}
//                             </DialogDescription>
//                         </DialogContent>
//                     </Dialog>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default DrugResultsPage;


import React, { useCallback, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Card } from "./ui/card";
import { Button } from "@/components/ui/button"; // Adjust to your imports
import { Download, FileText, X } from 'lucide-react'; // Adjust imports based on your setup
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "./ui/dialog";


const DrugResultsPage = () => {
    const location = useLocation();
    const { searchResults } = location.state || {}; // Get data passed through location.state
    const [selectedCards, setSelectedCards] = useState([]);
    const [isExporting, setIsExporting] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedResult, setSelectedResult] = useState(null);
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
    const handleExport = useCallback(() => {
        setIsExporting(true);
    
        // Filter selectedCards to include only the specified fields
        const exportData = selectedCards.map((card) => {
            const {
                TradeName,
                "Active Ingredient": activeIngredient,
                Manufacturer,
                Size,
                // Price,
                Quality_of_Life,
                Efficacy,
                Safety,
                Adverse_Events,
                Annual_Therapy_Costs,
                Type_of_Drug,
            } = card;
    
            return {
                TradeName,
                "Active Ingredient": activeIngredient,
                Manufacturer,
                Size,
                "Price($)": card.Price,
                Quality_of_Life,
                Efficacy,
                Safety,
                Adverse_Events,
                Annual_Therapy_Costs,
                Type_of_Drug,
            };
        });
    
        fetch("http://localhost:5000/download-excel", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(exportData),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Failed to export data");
                }
                return response.blob();
            })
            .then((blob) => {
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.setAttribute("download", "selected_cards.xlsx");
                document.body.appendChild(link);
                link.click();
                link.parentNode.removeChild(link);
                setIsExporting(false);
            })
            .catch((error) => {
                console.error("Error exporting selected cards:", error);
                setIsExporting(false);
            });
    }, [selectedCards]);
    


    // Handle dialog open (this would need to be defined elsewhere)
    const handleOpenDialog = useCallback((result) => {
        setSelectedResult(result);
        setDialogOpen(true);
    }, []);

    return (
        <div className="w-full p-6">
            <div className="w-full overflow-y-auto pr-2 scrollbar-hide">
                <div id='drug-cards' className="flex sticky items-center justify-between gap-x-4 pb-4 pt-2">
                    <h1 className="text-2xl font-bold text-gray-800">
                        Showing Relevant Drugs for <span className="text-[#a6ce39]">{searchResults[0]?.['Active Ingredient'] || "Unknown Disease"}</span>
                    </h1>
                    <div className="flex sticky items-center justify-end gap-4 pb-4" >
                        <Button
                            onClick={handleSelectAll}
                            className="bg-[#a6ce39] text-white hover:bg-[#95b833] rounded-[12px]"
                        >
                            {selectedCards.length === searchResults.length ? 'Unselect All' : 'Select All'}
                        </Button>
                        <Button
                            onClick={handleExport}
                            disabled={isExporting}
                            className={`bg-[#a6ce39] text-white hover:bg-[#95b833] rounded-[12px] flex items-center gap-2 ${isExporting ? 'cursor-not-allowed opacity-50' : ''}`}
                        >
                            <Download className="h-4 w-4" /> {isExporting ? 'Exporting...' : 'Export Selected'}
                        </Button>
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                    {searchResults?.map((result, index) => (
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
                                <p className="text-black font-bold"> {result.TradeName} ({result.Size})</p>
                                <p><strong className="font-semibold">Active Ingredient:</strong> {result['Active Ingredient']}</p>
                                {/* <p><strong className="font-semibold">Size:</strong> {result['Size']}</p> */}
                                <p><strong className="font-semibold">Price:</strong> ${(result.Price).toFixed(2)}</p>
                                <p><strong className="font-semibold">Manufacturer:</strong> {result.Manufacturer}</p>
                                <p><strong className="font-semibold">Country:</strong> {result.Country}</p>
                            </div>
                            <FileText
                                className="text-[#a6ce39] cursor-pointer justify-end"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenDialog(result);
                                }}
                            />
                        </Card>
                    ))}
                </div>
            </div>

            {dialogOpen && selectedResult && (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-white">
          <DialogTitle className='font-bold text-2xl'>Drug Overview: <strong className="text-[#a6ce39]">{selectedResult.TradeName}</strong></DialogTitle>
            <DialogDescription>
              {[
                "Active Ingredient",
                "Manufacturer",
                "Size",
                "Price",
                "Quality_of_Life",
                "Efficacy",
                "Safety",
                "Adverse_Events",
                "Annual_Therapy_Costs",
                "Type_of_Drug"
              ].map((key) => {
                const customLabels = {
                  Price: "Price"
                };

                const label = customLabels[key] || key.replace(/_/g, " ");
                const value = key === "Price" ? `$${(selectedResult[key]).toFixed(2)}` : selectedResult[key];

                return (
                  selectedResult[key] && (
                    <p key={key}>
                      <strong>{label}:</strong> {value}
                    </p>
                  )
                );
              })}
            </DialogDescription>

          </DialogContent>
        </Dialog>
      )}
        </div>
    );
};

export default DrugResultsPage;
