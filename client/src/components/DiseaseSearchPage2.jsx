'use client'

import React, { useState, useMemo, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ChatBot from "./ChatBot";
import { X, FileText, Download, ArrowUpDown, ChevronDown, Plus } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "./ui/dialog";
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
import { cn } from "@/lib/utils";

const DiseaseSearchPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { searchResults, drugs } = location.state || {};

  // Initialize tabs based on searchResults
  const initializeTabs = () => {
    if (Array.isArray(searchResults) && searchResults.length > 0) {
      return searchResults.map((diseaseInfo, index) => ({
        id: `tab-${index + 1}`,
        label: diseaseInfo.Disease || `Disease ${index + 1}`,
        content: {
          type: 'disease',
          diseaseInfo,
          drugInfo: [],
          selectedCards: [],
        },
      }));
    } else {
      // Handle case with no searchResults
      return [{
        id: "tab-1",
        label: "No Data",
        content: {
          type: 'disease',
          diseaseInfo: {},
          drugInfo: [],
          selectedCards: [],
        },
      }];
    }
  };

  const [tabs, setTabs] = useState(initializeTabs());
  const [activeTab, setActiveTab] = useState(tabs[0]?.id || "tab-1");

  // States for chat and dialogs
  const [chatMessages, setChatMessages] = useState([]);
  const [isChatMinimized, setIsChatMinimized] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);

  // Export states
  const [isExporting, setIsExporting] = useState(false);
  const [isDiseaseExporting, setDiseaseIsExporting] = useState(false);

  // Table states
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});

  // Topics filtering
  const [selectedTopics, setSelectedTopics] = useState([]);
  const allowedKeys = [
    "Disease Biology", "Signs & Symptoms", "Pathophysiology", "Risk Factors",
    "Diagnosis", "Patient Demographics", "Stages progression", "Sub-types",
    "Treatment options", "Treatment & Management", "Unmet Needs", "Prevalence"
  ];

  // Handler to toggle chat window
  const handleChatToggle = useCallback(() => {
    setIsChatMinimized((prev) => !prev);
  }, []);

  // Handler to add a new tab
  const addNewTab = useCallback((label, content) => {
    const newTab = {
      id: `tab-${tabs.length + 1}`,
      label,
      content,
    };
    setTabs((prevTabs) => [...prevTabs, newTab]);
    setActiveTab(newTab.id);
  }, [tabs.length]);

  // Handler to close a tab
  const closeTab = useCallback((tabId, event) => {
    event.stopPropagation();
    if (tabs.length > 1) {
      const updatedTabs = tabs.filter((tab) => tab.id !== tabId);
      setTabs(updatedTabs);
      if (activeTab === tabId) {
        const tabIndex = tabs.findIndex(tab => tab.id === tabId);
        const newActiveIndex = tabIndex > 0 ? tabIndex - 1 : 0;
        setActiveTab(updatedTabs[newActiveIndex]?.id || "tab-1");
      }
    }
  }, [tabs, activeTab]);

  // Handler to export disease data
  const handleDiseaseExport = useCallback((dataToExport, tabId) => {
    setDiseaseIsExporting(true);
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

  // Handler to export selected drug cards
  const handleExportSelectedCards = useCallback((tabId) => {
    const currentTab = tabs.find(tab => tab.id === tabId);
    if (!currentTab) return;

    setIsExporting(true);
    fetch("http://localhost:5000/download-excel", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(currentTab.content.selectedCards),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to export selected cards");
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
  }, [tabs]);

  // Handler to fetch relevant drugs based on disease
  const handleRelevantDrugsSearch = useCallback((tabId) => {
    const currentTab = tabs.find(tab => tab.id === tabId);
    if (!currentTab || !currentTab.content.diseaseInfo.Disease) {
      alert("Please select a disease before searching for relevant drugs.");
      return;
    }

    fetch("http://localhost:5000/drug-search-by-disease", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ disease: currentTab.content.diseaseInfo.Disease }),
    })
      .then(response => response.json())
      .then((data) => {
        // Check if a Relevant Drugs tab for this disease already exists
        const existingRelevantDrugsTab = tabs.find(tab => tab.label === `Relevant Drugs - ${currentTab.content.diseaseInfo.Disease}`);
        if (!existingRelevantDrugsTab) {
          // Create a new "Relevant Drugs" tab with a unique label
          addNewTab(`Relevant Drugs - ${currentTab.content.diseaseInfo.Disease}`, {
            type: 'relevantDrugs',
            diseaseInfo: currentTab.content.diseaseInfo, // Optional: Pass disease info if needed
            drugInfo: data,
            selectedCards: [],
          });
        } else {
          // If already exists, make it active
          setActiveTab(existingRelevantDrugsTab.id);
        }
      })
      .catch(error => console.error("Error fetching relevant drugs:", error));
  }, [tabs, addNewTab]);

  // Handler for selecting/unselecting a drug card
  const handleCardSelection = useCallback((result, tabId) => {
    setTabs((prevTabs) => prevTabs.map(tab => {
      if (tab.id === tabId) {
        const isSelected = tab.content.selectedCards.includes(result);
        const newSelectedCards = isSelected
          ? tab.content.selectedCards.filter(item => item !== result)
          : [...tab.content.selectedCards, result];
        return {
          ...tab,
          content: {
            ...tab.content,
            selectedCards: newSelectedCards,
          },
        };
      }
      return tab;
    }));
  }, []);

  // Handler to open dialog with detailed info
  const handleOpenDialog = useCallback((result) => {
    setSelectedResult(result);
    setDialogOpen(true);
  }, []);

  // Handler to select/unselect all drug cards in the active tab
  const handleSelectAll = useCallback((tabId) => {
    setTabs((prevTabs) => prevTabs.map(tab => {
      if (tab.id === tabId) {
        const allSelected = tab.content.selectedCards.length === tab.content.drugInfo.length;
        return {
          ...tab,
          content: {
            ...tab.content,
            selectedCards: allSelected ? [] : [...tab.content.drugInfo],
          },
        };
      }
      return tab;
    }));
  }, []);

  // Handler for topic selection
  const handleTopicSelection = useCallback((topic) => {
    setSelectedTopics((prevSelected) =>
      prevSelected.includes(topic)
        ? prevSelected.filter((t) => t !== topic)
        : [...prevSelected, topic]
    );
  }, []);

  // Get active tab content
  const activeTabContent = useMemo(() => {
    return tabs.find(tab => tab.id === activeTab)?.content || { type: 'disease', diseaseInfo: {}, drugInfo: [], selectedCards: [] };
  }, [activeTab, tabs]);

  // Generate table data based on active tab
  const tableData = useMemo(() => {
    const { diseaseInfo, type } = activeTabContent;
    // Only generate table data for 'disease' type tabs
    if (type !== 'disease') return [];
    return Object.entries(diseaseInfo)
      .filter(([key]) => allowedKeys.includes(key))
      .sort(([keyA], [keyB]) => allowedKeys.indexOf(keyA) - allowedKeys.indexOf(keyB))
      .map(([key, value]) => ({
        topic: key,
        overview: value,
      }))
      .filter(({ topic }) =>
        selectedTopics.length === 0 || selectedTopics.includes(topic)
      );
  }, [activeTabContent, selectedTopics]);

  // Define table columns
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
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Topic
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
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

  // Initialize table with react-table
  const tableInstance = useReactTable({
    data: tableData,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel({ pageSize: tableData.length }), // Show all rows
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

  // Get selected disease data for export
  const selectedDiseaseData = useMemo(() => {
    return Object.entries(rowSelection)
      .filter(([key, isSelected]) => isSelected)
      .map(([key]) => tableData[parseInt(key)]);
  }, [rowSelection, tableData]);

  // Function to render tabs navigation
  const renderTabs = () => (
    <div className="flex items-center border-b px-2 bg-white overflow-x-auto">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={cn(
            "flex items-center px-4 py-2 border-r cursor-pointer whitespace-nowrap",
            activeTab === tab.id ? "bg-white border-b-2 border-[#a6ce39]" : "bg-gray-100 hover:bg-gray-200"
          )}
          onClick={() => setActiveTab(tab.id)}
        >
          <span className="mr-2 font-semibold text-gray-800">{tab.label}</span>
          <Button
            variant="ghost"
            size="sm"
            className="p-0 h-5 w-5"
            onClick={(e) => closeTab(tab.id, e)}
          >
            <X className="h-4 w-4 text-gray-800" />
          </Button>
        </div>
      ))}
      <Button variant="ghost" size="sm" onClick={() => addNewTab("New Tab", {
        type: 'disease',
        diseaseInfo: {},
        drugInfo: [],
        selectedCards: [],
      })} className="ml-2">
        <Plus className="h-4 w-4 text-gray-800" />
      </Button>
    </div>
  );

  return (
    <div className="disease-search-page h-screen bg-gray-50 flex flex-col">
      {/* Tabs Navigation */}
      {renderTabs()}

      {/* Main Content */}
      <div className="flex-grow overflow-hidden p-6 flex">
        {/* Disease Overview and Details */}
        <div className={cn(
          "pr-6",
          activeTabContent.type !== 'relevantDrugs' ? (!isChatMinimized ? "w-2/3" : "w-full") : "w-full"
        )}>
          {/* Conditional Rendering Based on Tab Type */}
          {activeTabContent.type === 'disease' && (
            <>
              <div className="flex items-center mb-4 gap-4 justify-between">
                <h1 className="text-2xl font-bold text-gray-800">
                  Disease Overview: <span className="text-[#a6ce39]">{activeTabContent.diseaseInfo.Disease || "Select a Disease"}</span>
                </h1>
              </div>

              <div className="disease-card space-y-4 bg-white border border-[#a6ce39] rounded-[12px] p-6 shadow-lg overflow-y-auto scrollbar-hide max-h-[75vh] pb-6">
                {activeTabContent.diseaseInfo['Disease Overview'] && (
                  <h2 className="font-semibold text-gray-700">{activeTabContent.diseaseInfo['Disease Overview']}</h2>
                )}
                <div className="flex items-center py-4 gap-2">
                  {/* Filter Topics Dropdown */}
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

                  {/* Columns Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button className="ml-auto rounded-lg bg-green text-white hover:bg-darkBlue hover:text-white">
                        Columns <ChevronDown className="ml-2 h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-white pt-3">
                      {tableInstance.getAllColumns()
                        .filter((column) => column.getCanHide())
                        .map((column) => (
                          <DropdownMenuCheckboxItem
                            key={column.id}
                            className="capitalize"
                            checked={column.getIsVisible()}
                            onCheckedChange={(value) => column.toggleVisibility(!!value)}
                          >
                            {column.id}
                          </DropdownMenuCheckboxItem>
                        ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Export Button */}
                  <Button
                    className='bg-green rounded-lg hover:bg-darkBlue text-white'
                    disabled={isDiseaseExporting}
                    onClick={() => handleDiseaseExport(selectedDiseaseData, activeTab)}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    {isDiseaseExporting ? 'Exporting...' : 'Export Selected Rows'}
                  </Button>
                </div>

                {/* Data Table */}
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      {tableInstance.getHeaderGroups().map((headerGroup) => (
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
                      {tableInstance.getRowModel().rows?.length ? (
                        tableInstance.getRowModel().rows.map((row) => (
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

                {/* Show Relevant Drugs Button */}
                <div className="flex justify-center">
                  <Button
                    onClick={() => handleRelevantDrugsSearch(activeTab)}
                    className="mt-4 bg-[#a6ce39] text-white hover:bg-[#95b833] rounded-[12px]"
                  >
                    Show Relevant Drugs
                  </Button>
                </div>
              </div>
            </>
          )}

          {activeTabContent.type === 'relevantDrugs' && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  Showing Relevant Drugs for <span className="text-[#a6ce39]">{activeTabContent.diseaseInfo.Disease || "Unknown Disease"}</span>
                </h2>
                <div className="flex items-center gap-4">
                  <Button
                    onClick={() => handleSelectAll(activeTab)}
                    className="bg-[#a6ce39] text-white hover:bg-[#95b833] rounded-[12px]"
                  >
                    {activeTabContent.selectedCards.length === activeTabContent.drugInfo.length ? 'Unselect All' : 'Select All'}
                  </Button>
                  <Button
                    onClick={() => handleExportSelectedCards(activeTab)}
                    disabled={isExporting}
                    className={`bg-[#a6ce39] text-white hover:bg-[#95b833] rounded-[12px] flex items-center gap-2 ${isExporting ? 'cursor-not-allowed opacity-50' : ''}`}
                  >
                    <Download className="h-4 w-4" /> {isExporting ? 'Exporting...' : 'Export Selected'}
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeTabContent.drugInfo.map((result, index) => (
                  <Card
                    key={index}
                    className={`bg-white border border-[#a6ce39] rounded-[12px] p-4 shadow-sm cursor-pointer relative ${activeTabContent.selectedCards.includes(result) ? 'shadow-lg' : ''}`}
                    onClick={() => handleCardSelection(result, activeTab)}
                  >
                    {activeTabContent.selectedCards.includes(result) && (
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
            </div>
          )}
        </div>
      </div>

      {/* Dialog for Detailed Information */}
      {dialogOpen && selectedResult && (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-white">
            <DialogTitle>{selectedResult.TradeName || selectedResult.Disease || "Details"}</DialogTitle>
            <DialogDescription>
              {Object.entries(selectedResult).map(([key, value]) => (
                <p key={key}><strong>{key}:</strong> {value}</p>
              ))}
            </DialogDescription>
          </DialogContent>
        </Dialog>
      )}

      {/* ChatBot Component */}
      <ChatBot
        chatMessages={chatMessages}
        setChatMessages={setChatMessages}
        fulldata={activeTabContent.type === 'disease' ? activeTabContent.diseaseInfo : activeTabContent.diseaseInfo}
        isMinimized={isChatMinimized}
        onToggle={handleChatToggle}
      />

      {/* Global Styles */}
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


