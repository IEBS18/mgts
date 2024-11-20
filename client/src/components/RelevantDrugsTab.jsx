import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Download, Filter } from "lucide-react";
import { toast } from "react-toastify";

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

  const [countryFilter, setCountryFilter] = useState([]);
  const [drugTypeFilter, setDrugTypeFilter] = useState([]);
  const [filteredResults, setFilteredResults] = useState(drugInfo || []);

  const uniqueCountries = [...new Set(drugInfo?.map((result) => result.Country))];
  const uniqueDrugTypes = [...new Set(drugInfo?.map((result) => result.Type_of_Drug))];

  useEffect(() => {
    setFilteredResults(
      drugInfo?.filter((result) =>
        (countryFilter.length === 0 || countryFilter.includes(result.Country)) &&
        (drugTypeFilter.length === 0 || drugTypeFilter.includes(result.Type_of_Drug))
      )
    );
  }, [countryFilter, drugTypeFilter, drugInfo]);

  const toggleFilter = (filter, setFilter, value) => {
    setFilter((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    );
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
            className={`bg-[#a6ce39] text-white hover:bg-[#95b833] rounded-[12px] flex items-center gap-2 ${isExporting ? "cursor-not-allowed opacity-50" : ""
              }`}
          >
            <Download className="h-4 w-4" />{" "}
            {isExporting ? "Exporting..." : "Export Selected"}
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 flex-1">
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
                className="h-5 w-5 text-[#a6ce39] cursor-pointer "
                style={{
                  accentColor: '#a6ce39', // Sets the accent color to green
                }}
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
    </div>
  );
};

export default RelevantDrugsTab;
