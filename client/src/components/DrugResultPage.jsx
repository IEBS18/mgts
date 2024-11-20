import React, { useCallback, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Card } from "./ui/card";
import { Button } from "@/components/ui/button"; // Adjust to your imports
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Download, Filter } from 'lucide-react'; // Adjust imports based on your setup
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "./ui/dialog";

const DrugResultsPage = () => {
    const location = useLocation();
    const { searchResults } = location.state || {};
    const [selectedCards, setSelectedCards] = useState([]);
    const [isExporting, setIsExporting] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedResult, setSelectedResult] = useState(null);

    const [countryFilter, setCountryFilter] = useState("");
    const [drugTypeFilter, setDrugTypeFilter] = useState("");
    const [filteredResults, setFilteredResults] = useState(searchResults || []);

    // Get unique countries and drug types
    const uniqueCountries = [...new Set(searchResults?.map((result) => result.Country))];
    const uniqueDrugTypes = [...new Set(searchResults?.map((result) => result.Type_of_Drug))];

    // Apply filters whenever filters or searchResults change
    useEffect(() => {
        setFilteredResults(
            searchResults?.filter((result) =>
                (countryFilter ? result.Country === countryFilter : true) &&
                (drugTypeFilter ? result.Type_of_Drug === drugTypeFilter : true)
            )
        );
    }, [countryFilter, drugTypeFilter, searchResults]);

    const handleSelectAll = () => {
        setSelectedCards(selectedCards.length === filteredResults.length ? [] : filteredResults);
    };

    const handleCardSelection = (result) => {
        setSelectedCards((prevSelected) =>
            prevSelected.includes(result)
                ? prevSelected.filter((card) => card !== result)
                : [...prevSelected, result]
        );
    };

    const handleExport = useCallback(() => {
        setIsExporting(true);

        const exportData = selectedCards.map((card) => {
            const {
                TradeName,
                "Active Ingredient": activeIngredient,
                Manufacturer,
                Country,
                Size,
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
                Country,
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

        fetch(`${import.meta.env.VITE_API_URL}/download-excel`, {
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

    const handleOpenDialog = useCallback((result) => {
        setSelectedResult(result);
        setDialogOpen(true);
    }, []);

    return (
        <div className="w-full p-6">
            {/* Select All and Export Buttons */}
            <div className="flex sticky items-center justify-between gap-x-4 pb-4 pt-2">
                <h1 className="text-2xl font-bold text-gray-800">
                    Showing Relevant Drugs for <span className="text-[#a6ce39]">{searchResults[0]?.['Active Ingredient'] || "Unknown Disease"}</span>
                </h1>
                <div className="flex items-center justify-end gap-4 pb-4">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="bg-white text-[#a6ce39] border-[#a6ce39] hover:bg-[#f0f8e5] flex items-center rounded-lg gap-2">
                                <Filter className="h-4 w-4" />
                                Filter
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 bg-white rounded-lg max-h-[400px] overflow-y-auto scrollbar-hide">
                            <div className="space-y-4">
                                <div>
                                    <h3 className="font-semibold mb-2">Country</h3>
                                    {uniqueCountries.map((country) => (
                                        <div key={country} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`country-${country}`}
                                                checked={countryFilter === country}
                                                onCheckedChange={(checked) => {
                                                    setCountryFilter(checked ? country : "")
                                                }}
                                            />
                                            <label htmlFor={`country-${country}`}>{country}</label>
                                        </div>
                                    ))}
                                </div>
                                <div>
                                    <h3 className="font-semibold mb-2">Drug Type</h3>
                                    {uniqueDrugTypes.map((type) => (
                                        <div key={type} className="flex items-center space-x-2">

                                            <Checkbox
                                                id={`type-${type}`}
                                                checked={drugTypeFilter === type}
                                                onCheckedChange={(checked) => {
                                                    setDrugTypeFilter(checked ? type : "")
                                                }}
                                            />

                                            <label htmlFor={`type-${type}`}>{type}</label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>
                    <Button
                        onClick={handleSelectAll}
                        className="bg-[#a6ce39] text-white hover:bg-[#95b833] rounded-[12px]"
                    >
                        {selectedCards.length === filteredResults.length ? 'Unselect All' : 'Select All'}
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

            {/* Drug Cards */}
            <div className="grid grid-cols-3 gap-4">
                {filteredResults?.map((result, index) => (
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
                                className="h-5 w-5 text-[#a6ce39] cursor-pointer"
                                style={{ accentColor: '#a6ce39' }}
                            />
                        </div>
                        <div className="mt-2">
                            <p className="text-black font-bold"> {result.TradeName} ({result.Size})</p>
                            <p><strong className="font-semibold">Active Ingredient:</strong> {result['Active Ingredient']}</p>
                            <p><strong className="font-semibold">Price(in USD):</strong> {(result.Price)}</p>
                            <p><strong className="font-semibold">Manufacturer:</strong> {result.Manufacturer}</p>
                            <p><strong className="font-semibold">Country:</strong> {result.Country}</p>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Dialog for Detailed Information */}
            {dialogOpen && selectedResult && (
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-white scrollbar-hide">
                        <DialogTitle className='font-bold text-2xl'>Drug Overview: <strong className="text-[#a6ce39]">{selectedResult.TradeName}</strong></DialogTitle>
                        <DialogDescription>
                            {["Active Ingredient", "Manufacturer", "Country", "Size", "Price", "Quality_of_Life", "Efficacy", "Safety", "Adverse_Events", "Annual_Therapy_Costs", "Type_of_Drug"]
                                .map((key) => {
                                    const label = key.replace(/_/g, " ");
                                    const value = key === "Price" ? `${(selectedResult[key])}` : selectedResult[key];
                                    return selectedResult[key] && (
                                        <p key={key}>
                                            <strong>{key === "Price" ? "Price (in USD)" : label}:</strong> {value}
                                        </p>
                                    );
                                })}
                        </DialogDescription>
                    </DialogContent>
                </Dialog>
            )}
            <style jsx global>{`
                .scrollbar-hide {
                -ms-overflow-style: none;
                scrollbar-width: none;
                }
                .scrollbar-hide::-webkit-scrollbar {
                display: none;
                }
            `}</style>
        </div>

    );
};

export default DrugResultsPage;
