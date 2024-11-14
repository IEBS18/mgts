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
        fetch("http://localhost:5000/download-excel", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(selectedCards),
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
            <div className="w-1/3 overflow-y-auto pr-2 scrollbar-hide pt-12">
                <div className="flex sticky items-center gap-4 pb-4">
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
                <div className="space-y-4 flex flex-col">
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
                                <p className="text-gray-600"> {result.TradeName}, {result['Active Ingredient']}</p>
                                <p><strong>Morbidity:</strong> {result.Morbidity}</p>
                                <p><strong>Mortality Rate:</strong> {result.Mortality}%</p>
                                <p><strong>Country:</strong> {result.Country}</p>
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
                {dialogOpen && selectedResult && (
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-white">
                            <DialogTitle>{selectedResult.TradeName}</DialogTitle>
                            <DialogDescription>
                                {Object.entries(selectedResult).map(([key, value]) => (
                                    <p key={key}><strong>{key}:</strong> {value}</p>
                                ))}
                            </DialogDescription>
                        </DialogContent>
                    </Dialog>
                )}
            </div>
        </div>
    );
};

export default DrugResultsPage;
