import React, { useCallback, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card } from "./ui/card";
import { Button } from "@/components/ui/button"; // Adjust to your imports
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Download, Filter, PlusCircle, X } from 'lucide-react'; // Adjust imports based on your setup
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";

import { Input } from "./ui/input";
import { toast } from 'react-toastify';

const DrugResultsPage = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const { searchResults } = location.state || {};
    const [selectedCards, setSelectedCards] = useState([]);
    const [isExporting, setIsExporting] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedResult, setSelectedResult] = useState(null);

    const [countryFilter, setCountryFilter] = useState([]);
    const [drugTypeFilter, setDrugTypeFilter] = useState([]);
    const [filteredResults, setFilteredResults] = useState(searchResults || []);

    const [aiColumnDialogOpen, setAiColumnDialogOpen] = useState(false); // For "Add AI Column" dialog
    const [aiColumnName, setAiColumnName] = useState('');
    const [aiColumnDescription, setAiColumnDescription] = useState('');

    // Get unique countries and drug types
    const uniqueCountries = [...new Set(searchResults?.map((result) => result.Country))];
    const uniqueDrugTypes = [...new Set(searchResults?.map((result) => result.Type_of_Drug))];

    // Apply filters whenever filters or searchResults change
    useEffect(() => {
        setFilteredResults(
            searchResults?.filter((result) =>
                (countryFilter.length === 0 || countryFilter.includes(result.Country)) &&
                (drugTypeFilter.length === 0 || drugTypeFilter.includes(result.Type_of_Drug))
            )
        );
    }, [countryFilter, drugTypeFilter, searchResults]);

    const toggleFilter = (filter, setFilter, value) => {
        setFilter((prev) =>
            prev.includes(value)
                ? prev.filter((item) => item !== value)
                : [...prev, value]
        );
    };

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

    const handleOpenAiColumnDialog = () => {
        setAiColumnDialogOpen(true);
    };

    const handleSubmitAiColumn = () => {
        if (!aiColumnName || !aiColumnDescription) {
            alert("Please fill out both fields");
            return;
        }

        // Send the AI column data to the backend with searchResults
        fetch(`${import.meta.env.VITE_API_URL}/add-ai-column`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                columnName: aiColumnName,
                columnDescription: aiColumnDescription,
                searchResults,
            }),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Failed to add AI column");
                }
                // toast("AI column added successfully!");
                // setAiColumnDialogOpen(false);
                return response.json();

            })
            .then((data) => {
                // Assuming `updated_results` is in the response body
                const updatedResults = data.updated_results.map((result) => ({
                    ...result,
                    // aiColumnName: aiColumnName, // Add the AI column name to each result
                }));

                setFilteredResults(updatedResults);

                console.log(data.updated_results);
                toast("AI column added successfully!");
                setAiColumnDialogOpen(false);
            })
            .catch((error) => {
                console.error("Error adding AI column:", error);
                toast("Error adding AI column");
            });
    };
    const handleComparison = () => {
        console.log("Compared: ", selectedCards);
        const comparisonData = selectedCards.map((card) => ({
            TradeName: card.TradeName,
            "Active Ingredient": card["Active Ingredient"],
            Manufacturer: card.Manufacturer,
            Country: card.Country,
            Size: card.Size,
            Price: card.Price,
            Quality_of_Life: card.Quality_of_Life,
            Efficacy: card.Efficacy,
            Safety: card.Safety,
            Adverse_Events: card.Adverse_Events,
            Annual_Therapy_Costs: card.Annual_Therapy_Costs,
            Type_of_Drug: card.Type_of_Drug,
            Disease: card.Disease,
            Symptoms: card.Symptoms,
            Morbidity: card.Morbidity,
            Mortality: card.Mortality,
            Prevalence: card.Prevalence,
            Age_Group: card.Age_Group,
            Gender: card.Gender,
        }));
        

        // Navigate to the /drug-comparison route and pass data via state
        navigate('/drug-comparison', { state: { comparisonData } });
    };
    const handleOpenDialog = useCallback((result) => {
        setSelectedResult(result);
        setDialogOpen(true);
    }, []);
    console.log(filteredResults)

    function formatPrice(price) {
        if (typeof price === "string" && price.includes("$")) {
            // If the price already includes a dollar sign, return it as-is
            return price;
        } else if (!isNaN(price)) {
            // Convert to a number (if not already) and format with a dollar sign
            return `$${parseFloat(price).toFixed(2)}`;
        } else {
            // Handle invalid inputs
            console.error("Invalid price input:", price);
            return "$0.00"; // Default fallback
        }
    }

    console.log(formatPrice("17.555999999999997"))

    return (
        <div className="w-full p-2">
            {/* Select All and Export Buttons */}
            <div className="flex sticky items-center justify-between gap-x-4 pb-4 pt-2">
                <h1 className="text-2xl font-bold text-gray-800">
                    Showing Relevant Drugs for <span className="text-[#a6ce39]">{searchResults[0]?.['Active Ingredient'] || "Unknown Disease"}</span>
                </h1>
                <div className="flex items-center justify-end gap-4">
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
                                                checked={countryFilter.includes(country)}
                                                onCheckedChange={() => toggleFilter(countryFilter, setCountryFilter, country)}
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
                                                checked={drugTypeFilter.includes(type)}
                                                onCheckedChange={() => toggleFilter(drugTypeFilter, setDrugTypeFilter, type)}
                                            />
                                            <label htmlFor={`type-${type}`}>{type}</label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>

                    <Button
                        onClick={handleComparison}
                        className="bg-white text-[#a6ce39] border border-[#a6ce39] hover:bg-[#f0f8e5] flex items-center rounded-lg gap-2"
                    >
                        {/* <PlusCircle className="h-4 w-4" /> */}
                        Compare Drugs
                    </Button>

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
            <div className="flex gap-2 flex-wrap">
                {countryFilter.length > 0 && (
                    <div className="flex items-center bg-[#e5f7d9] text-[#4d7c1a] px-3 py-1 rounded-lg">
                        <span className="text-sm font-semibold">
                            Country: {countryFilter.join(", ")}
                        </span>
                        <button
                            onClick={() => setCountryFilter([])}
                            className="ml-2 text-[#4d7c1a] hover:text-red-500 focus:outline-none"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}
                {drugTypeFilter.length > 0 && (
                    <div className="flex items-center bg-[#e5f7d9] text-[#4d7c1a] px-3 py-1 rounded-lg">
                        <span className="text-sm font-semibold">
                            Drug Type: {drugTypeFilter.join(", ")}
                        </span>
                        <button
                            onClick={() => setDrugTypeFilter([])}
                            className="ml-2 text-[#4d7c1a] hover:text-red-500 focus:outline-none"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}
                {(countryFilter.length > 0 || drugTypeFilter.length > 0) && (
                    <button
                        onClick={() => {
                            setCountryFilter([]);
                            setDrugTypeFilter([]);
                        }}
                        className="text-[#a6ce39] hover:text-red-500 text-sm font-semibold focus:outline-none"
                    >
                        Clear All Filters
                    </button>
                )}
            </div>
            {/* Drug Cards */}
            <div className="grid grid-cols-3 gap-4 mt-4">

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
                            <p className="text-black font-bold"> {result.TradeName} {result.Size && `(${result.Size})`}</p>
                            {result['Active Ingredient'] && (
                                <p>
                                    <strong className="font-semibold">Active Ingredient:</strong> {result['Active Ingredient']}
                                </p>
                            )}
                            {result.Price && (
                                <p>
                                    <strong className="font-semibold">Price (in USD):</strong> {formatPrice(result.Price)}
                                </p>
                            )}
                            {result.Manufacturer && (
                                <p>
                                    <strong className="font-semibold">Manufacturer:</strong> {result.Manufacturer}
                                </p>
                            )}
                            {result.Country && (
                                <p>
                                    <strong className="font-semibold">Country:</strong> {result.Country}
                                </p>
                            )}
                            {result[aiColumnName] && (
                                <p>
                                    <strong className="font-semibold">{aiColumnName.charAt(0).toUpperCase() + aiColumnName.slice(1)}:</strong> {result[aiColumnName]}
                                </p>
                            )}
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
                                    const value = key === "Price" ? `${formatPrice(selectedResult[key])}` : selectedResult[key];
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

            <Dialog open={aiColumnDialogOpen} onOpenChange={setAiColumnDialogOpen} >
                <DialogContent className='bg-white'>
                    <DialogTitle>Add AI Column</DialogTitle>
                    <DialogDescription>
                        Enter the name and description for the new AI column to be added.
                    </DialogDescription>
                    <div className="space-y-4">
                        <Input
                            value={aiColumnName}
                            onChange={(e) => setAiColumnName(e.target.value)}
                            placeholder="Column Name"
                            className="w-full p-2 border border-gray-200 rounded-[12px] text-gray-800 focus:border-[#a6ce39] focus:ring-[#a6ce39] hover:border-[#a6ce39] transition duration-200 ease-in-out"
                        />
                        <Input
                            value={aiColumnDescription}
                            onChange={(e) => setAiColumnDescription(e.target.value)}
                            placeholder="Column Description"
                            className="w-full p-2 border border-gray-200 rounded-[12px] text-gray-800 focus:border-[#a6ce39] focus:ring-[#a6ce39] hover:border-[#a6ce39] transition duration-200 ease-in-out"
                        />
                    </div>
                    <DialogFooter>
                        <Button onClick={handleSubmitAiColumn} className="bg-[#a6ce39] text-white hover:bg-[#95b833] rounded-[12px]">Submit</Button>
                        <Button onClick={() => setAiColumnDialogOpen(false)} variant="outline" className='bg-white text-[#a6ce39] border border-[#a6ce39] hover:bg-[#f0f8e5] flex items-center rounded-lg gap-2'>Cancel</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
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
