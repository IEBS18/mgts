import React, { useState, useMemo, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ChatBot from "./ChatBot";
import { X, FileText, Download, ArrowUpDown, ChevronDown, Plus } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "./ui/dialog";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import TherapyCostForecast from "./TherapyCostForecast";
import MarketAndPrevalenceForecast from "./MarketEstimation";

const DiseaseSearchPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { searchResults } = location.state || {};
  const { drugs } = location.state || {};

  const fulldata = {
    diseaseData: searchResults,
    drugData: drugs,
  };

  const diseaseInfo = Array.isArray(searchResults) ? searchResults[0] : searchResults || {};

  const [chatMessages, setChatMessages] = useState([]);
  const [isChatMinimized, setIsChatMinimized] = useState(true);
  const [drugInfo, setDrugInfo] = useState([]);
  const [allYears, setAllyears] = useState([]);
  const [combinedTherapy, setCombinedTherapy] = useState([]);
  const [isSearchingCT, setIsSearchingCT] = useState(false);
  const [selectedCards, setSelectedCards] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isDiseaseExporting, setDiseaseIsExporting] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [years, setYears] = useState([]);
  const [forecastYears, setForecastYears] = useState([]);
  const [combinedPrevalence, setCombinedPrevalence] = useState([]);
  const [marketPredictions, setMarketPredictions] = useState([]);
  const [marketSize, setMarketSize] = useState([]);
  const [isSearchingCP, setIsSearchingCP] = useState(false);
  // Table state
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});

  const handleChatToggle = useCallback(() => {
    setIsChatMinimized((prev) => !prev);
  }, []);


  const handleDiseaseExport = useCallback((dataToExport) => {
    setDiseaseIsExporting(true);
    console.log(dataToExport)
    fetch(`${import.meta.env.VITE_API_URL}/download-excel`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dataToExport),
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
        link.setAttribute("download", "selected_data.xlsx");
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        setDiseaseIsExporting(false);
      })
      .catch((error) => {
        console.error("Error exporting data:", error);
        setDiseaseIsExporting(false);
      });
  }, []);

  const handleExport = useCallback(() => {
    setIsExporting(true);
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

  const handleRelevantDrugsSearch = useCallback(() => {
    setIsSearching(true);
    fetch(`${import.meta.env.VITE_API_URL}/drug-search-by-disease`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ disease: diseaseInfo.Disease }),
    })
      .then(response => response.json())
      .then((data) => {
        setDrugInfo(data);
        setIsSearching(false);
        setTimeout(() => {
          const element = document.getElementById("drug-cards");
          if (element) {
            element.scrollIntoView({ behavior: "smooth" });
          }
        }, 300);
      })
      .catch(error => console.error("Error fetching relevant drugs:", error));
  }, [diseaseInfo.Disease]);

  const handleTherapyCost = useCallback(() => {
    // setIsSearching(true);
    setIsSearchingCT(true);
    fetch(`${import.meta.env.VITE_API_URL}/therapy-cost-estimation`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ disease: diseaseInfo.Disease, number: "2" }),
    })
      .then(response => response.json())
      .then((data) => {
        setCombinedTherapy(data.combined_therapy_cost);
        setAllyears(data.all_years);
        setIsSearchingCT(false);
        setTimeout(() => {
          const element = document.getElementById("therapy_cost");
          if (element) {
            element.scrollIntoView({ behavior: "smooth" });
          }
        }, 300);
      })
      .catch(error => {
        console.error("Error fetching market estimation:", error);
        setIsSearchingCT(false);
      });
  }, [diseaseInfo.Disease]);

  const handleMarketEstimation = useCallback(() => {
    setIsSearchingCP(true);
    fetch(`${import.meta.env.VITE_API_URL}/market-estimation`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ disease: diseaseInfo.Disease, number: "1" }),
    })
      .then(response => response.json())
      .then((data) => {
        // Set the response data to respective state variables
        setYears(data.years || []);
        setForecastYears(data.forecast_years || []);
        setCombinedPrevalence(data.combined_prevalence || []);
        setMarketPredictions(data.market_predictions || []);
        setMarketSize(data.market_size || []);
        setIsSearchingCP(false);

        // Scroll into view after setting the state
        setTimeout(() => {
          const element = document.getElementById("market_estimation");
          if (element) {
            element.scrollIntoView({ behavior: "smooth" });
          }
        }, 300);
      })
      .catch(error => {
        console.error("Error fetching market estimation:", error);
        setIsSearchingCP(false);
      });
  }, [diseaseInfo.Disease])

  const handleCardSelection = useCallback((result) => {
    setSelectedCards((prevSelected) =>
      prevSelected.includes(result)
        ? prevSelected.filter((item) => item !== result)
        : [...prevSelected, result]
    );
  }, []);

  const handleOpenDialog = useCallback((result) => {
    setSelectedResult(result);
    setDialogOpen(true);
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedCards((prev) =>
      prev.length === drugInfo.length ? [] : [...drugInfo]
    );
  }, [drugInfo]);

  // Memoize table data
  const allowedKeys = ["Disease Biology", "Signs & Symptoms", "Pathophysiology", "Risk Factors", "Diagnosis", "Patient Demographics", "Stages progression", "Sub-types", "Treatment options", "Treatment & Management", "Unmet Needs", "Prevalence"];
  const [selectedTopics, setSelectedTopics] = useState([]);

  const handleTopicSelection = useCallback((topic) => {
    setSelectedTopics((prevSelected) =>
      prevSelected.includes(topic)
        ? prevSelected.filter((t) => t !== topic)
        : [...prevSelected, topic]
    );
  }, []);

  const data = useMemo(() => {
    return Object.entries(diseaseInfo)
      .filter(([key]) => allowedKeys.includes(key))
      .sort(([keyA], [keyB]) => allowedKeys.indexOf(keyA) - allowedKeys.indexOf(keyB))
      .map(([key, value]) => ({
        topic: key,
        overview: value,
      }))
      .filter(({ topic }) =>
        selectedTopics.length === 0 || selectedTopics.includes(topic) // Correct filter for multiple topics
      );
  }, [diseaseInfo, selectedTopics]);

  const columns = useMemo(() => [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "topic",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Topic
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => <div className="font-medium">{row.getValue("topic")}</div>,
    },
    {
      accessorKey: "overview",
      header: "Overview",
      cell: ({ row }) => {
        const value = row.getValue("overview");
        return (
          <div className="max-w-[500px]">
            {typeof value === 'object' ? (
              Array.isArray(value) ? (
                <ul className="list-disc pl-6">
                  {value.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              ) : (
                <div>
                  {Object.entries(value).map(([subKey, subValue]) => (
                    <p key={subKey}>
                      <strong>{subKey}:</strong> {subValue}
                    </p>
                  ))}
                </div>
              )
            ) : (
              <p>{value}</p>
            )}
          </div>
        );
      },
    },
  ], []);

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel({ pageSize: data.length }), // Show all rows
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    manualPagination: true, // Disable automatic pagination
    pageCount: 1,
  });

  const selectedDiseaseData = useMemo(() => {
    return Object.entries(rowSelection)
      .filter(([key, isSelected]) => isSelected) // Only include selected rows
      .map(([key]) => data[parseInt(key)]); // Map to data entries by index
  }, [rowSelection, data]);

  return (
    <div className="disease-search-page h-screen bg-gray-50 flex flex-col">
      <div className="flex-grow overflow-hidden p-6 flex">
        <div className={`
          w-full} 
          `}>
          <div className="flex items-center mb-4 gap-4 justify-between">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl w-1/2 font-bold text-gray-800">
                Disease Overview: <span className="text-[#a6ce39]">{diseaseInfo.Disease || "Unknown Disease"}</span>
              </h1>
              <div className="flex w-1/2 justify-end ml-[250px]">
                <div className="flex gap-x-4 ml-auto">
                  <Button
                    onClick={handleRelevantDrugsSearch}
                    disabled={isSearching}
                    className="bg-[#a6ce39] text-white hover:bg-[#95b833] rounded-[12px] w-[200px]"
                  >
                    {isSearching ? 'Loading...' : 'Show Relevant Drugs'}
                  </Button>
                  <Button
                    onClick={handleMarketEstimation}
                    disabled={isSearchingCP}
                    className="bg-[#a6ce39] text-white hover:bg-[#95b833] rounded-[12px] w-[200px]"
                  >
                    {isSearchingCP ? 'Loading...' : 'Market Estimation'}
                  </Button>
                  <Button
                    onClick={handleTherapyCost}
                    disabled={isSearchingCT}
                    className="bg-[#a6ce39] text-white hover:bg-[#95b833] rounded-[12px] w-[200px]"
                  >
                    {isSearchingCT ? 'Loading...' : 'Therapy Cost Estimation'}
                  </Button>
                </div>
              </div>
            </div>

            {/* <h1 className="text-2xl font-bold text-gray-800">
              Disease Overview: <span className="text-[#a6ce39]">{diseaseInfo.Disease || "Unknown Disease"}</span>
            </h1> */}
          </div>

          <div className={`disease-card w-${!isChatMinimized ? "2/3" : "full"} space-y-4 bg-white border border-[#a6ce39] rounded-[12px] p-6 shadow-lg overflow-y-auto scrollbar-hide max-h-[80vh] pb-6`}>
            <h2>{diseaseInfo['Disease Overview']}</h2>
            <div className="flex items-center py-4 gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="rounded-lg bg-green hover:bg-darkBlue text-white hover:text-white">
                    Filter Topics <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-white pt-3" side="left" align="end">
                  {allowedKeys.map((topic) => (
                    <DropdownMenuCheckboxItem
                      key={topic}
                      checked={selectedTopics.includes(topic)}
                      onCheckedChange={() => handleTopicSelection(topic)}
                    >
                      {topic}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="ml-auto rounded-lg bg-green text-white hover:bg-darkBlue hover:text-white">
                    Columns <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white pt-3">
                  {table
                    .getAllColumns()
                    .filter((column) => column.getCanHide())
                    .map((column) => {
                      return (
                        <DropdownMenuCheckboxItem
                          key={column.id}
                          className="capitalize"
                          checked={column.getIsVisible()}
                          onCheckedChange={(value) => column.toggleVisibility(!!value)}
                        >
                          {column.id}
                        </DropdownMenuCheckboxItem>
                      )
                    })}
                </DropdownMenuContent>
              </DropdownMenu>
              {/* <Button className='bg-green rounded-lg hover:bg-darkBlue text-white' onClick={() => console.log("Add AI Column clicked")}>
                <Plus className="mr-2 h-4 w-4" />
                Add AI Column
              </Button> */}
              <Button className='bg-green rounded-lg hover:bg-darkBlue text-white' disabled={isDiseaseExporting} onClick={() => handleDiseaseExport(selectedDiseaseData)}>
                <Download className="mr-2 h-4 w-4" />
                {isDiseaseExporting ? 'Exporting...' : 'Export Selected Rows'}
              </Button>
            </div>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && "selected"}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={columns.length} className="h-24 text-center">
                        No results.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            {/* <div className="flex gap-x-4 justify-center">
              <Button
                onClick={handleRelevantDrugsSearch}
                disabled={isSearching}
                className="mt-4 bg-[#a6ce39] text-white hover:bg-[#95b833] rounded-[12px]"
              >
                {isSearching ? 'Loading...' : 'Show Relevant Drugs'}
              </Button>
              <Button
                onClick={handleMarketEstimation}
                disabled={isSearching}
                className="mt-4 bg-[#a6ce39] text-white hover:bg-[#95b833] rounded-[12px]"
              >
                {isSearching ? 'Loading...' : 'Market Estimation'}
              </Button>
              <Button
                onClick={handleTherapyCost}
                disabled={isSearching}
                className="mt-4 bg-[#a6ce39] text-white hover:bg-[#95b833] rounded-[12px]"
              >
                {isSearching ? 'Loading...' : 'Therapy Cost Estimation'}
              </Button>
            </div> */}
            {years.length > 0 && (
              <div id="market_estimation">
                <MarketAndPrevalenceForecast diseaseName={diseaseInfo.Disease}
                  years={years}
                  forecast_years={forecastYears}
                  combinedPrevalence={combinedPrevalence}
                  marketPredictions={marketPredictions}
                  marketSize={marketSize} />
              </div>
            )}


            {allYears.length > 0 && (
              <div id="therapy_cost">
                <TherapyCostForecast diseaseName={diseaseInfo.Disease} allYears={allYears} combinedTherapyCost={combinedTherapy} />
              </div>
            )}



            {drugInfo.length > 0 && (
              <div className="w-full overflow-y-auto pr-2 scrollbar-hide pt-12">
                <div className="flex flex-wrap justify-start space-x-4">
                  {drugInfo.length > 0 && (
                    <div className="w-full overflow-y-auto pr-2 scrollbar-hide">
                      <div id='drug-cards' className="flex sticky items-center justify-between gap-x-4 pb-4 pt-2">
                        <h1 className="text-2xl font-bold text-gray-800">
                          Showing Relevant Drugs for <span className="text-[#a6ce39]">{diseaseInfo.Disease || "Unknown Disease"}</span>
                        </h1>
                        <div className="flex sticky items-center justify-end gap-4 pb-4" >
                          <Button
                            onClick={handleSelectAll}
                            className="bg-[#a6ce39] text-white hover:bg-[#95b833] rounded-[12px]"
                          >
                            {selectedCards.length === drugInfo.length ? 'Unselect All' : 'Select All'}
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
                  )}
                </div>
              </div>
            )}
          </div>
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

      <ChatBot
        chatMessages={chatMessages}
        setChatMessages={setChatMessages}
        fulldata={fulldata}
        isMinimized={isChatMinimized}
        onToggle={handleChatToggle}
      />

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

export default DiseaseSearchPage;