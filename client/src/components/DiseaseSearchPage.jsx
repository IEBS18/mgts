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
  const [selectedCards, setSelectedCards] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isDiseaseExporting, setDiseaseIsExporting] = useState(false);

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
    fetch("http://localhost:5000/download-excel", {
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

  const handleRelevantDrugsSearch = useCallback(() => {
    fetch("http://localhost:5000/drug-search-by-disease", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ disease: diseaseInfo.Disease }),
    })
      .then(response => response.json())
      .then((data) => {
        setDrugInfo(data);
      })
      .catch(error => console.error("Error fetching relevant drugs:", error));
  }, [diseaseInfo.Disease]);

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
          w-${!isChatMinimized ? "2/3" : "full"} 
          pr-6`}>
          <div className="flex items-center mb-4 gap-4 justify-between">
            <h1 className="text-2xl font-bold text-gray-800">
              Disease Overview: <span className="text-[#a6ce39]">{diseaseInfo.Disease || "Unknown Disease"}</span>
            </h1>
          </div>

          <div className="disease-card space-y-4 bg-white border border-[#a6ce39] rounded-[12px] p-6 shadow-lg overflow-y-auto scrollbar-hide max-h-[80vh] pb-6">
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
            <div className="flex justify-center">
            <Button
              onClick={handleRelevantDrugsSearch}
              className="mt-4 bg-[#a6ce39] text-white hover:bg-[#95b833] rounded-[12px]"
            >
              Show Relevant Drugs
            </Button>
            </div>
            {drugInfo.length > 0 && (
              <div className="w-full overflow-y-auto pr-2 scrollbar-hide pt-12">
                <div className="flex flex-wrap justify-start space-x-4">
                  {drugInfo.length > 0 && (
                    <div className="w-full overflow-y-auto pr-2 scrollbar-hide">
                      <div className="flex sticky items-center justify-between gap-x-4 pb-4">
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
            <DialogTitle>{selectedResult.TradeName}</DialogTitle>
            <DialogDescription>
              {Object.entries(selectedResult).map(([key, value]) => (
                <p key={key}><strong>{key}:</strong> {value}</p>
              ))}
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