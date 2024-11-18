// src/components/CompetitiveLandscapeSearchPage.jsx

import React, { useState, useMemo, useCallback } from "react";
import { useLocation } from "react-router-dom";
import ChatBot from "./ChatBot";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import TabHeader from "./TabHeader";
import { cn } from "@/utils/cn"; // Ensure this path is correct
import CompetitiveLandscapeTab from "./CompetitiveLandscapeTab"; // New Tab Component
import RelevantDrugsTab from "./RelevantDrugsTab";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CompetitiveLandscapeSearchPage = () => {
  const location = useLocation();
  const { searchResults, drugs } = location.state || {};

  // Initialize tabs based on searchResults
  const initializeTabs = (searchResults) => {
    // Extract competitiveInfo as per your logic
    const competitiveInfo = Array.isArray(searchResults) ? searchResults[0] : searchResults || {};
    
    // Create a single tab with the extracted competitiveInfo
    return [{
      id: "tab-1",
      label: competitiveInfo.Company || "No Data", // Adjust label as per competitive data
      content: {
        type: 'competitive',
        competitiveInfo,
        drugInfo: [],
        selectedCards: [],
        selectedCompetitiveData: [],
      }
    }];
  };

  const [tabs, setTabs] = useState(() => initializeTabs(searchResults));
  const [activeTab, setActiveTab] = useState(tabs[0]?.id || "tab-1");

  // States for chat and dialogs
  const [chatMessages, setChatMessages] = useState([]);
  const [isChatMinimized, setIsChatMinimized] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);
  const [selectedCards, setSelectedCards] = useState([]);
  const [drugInfo, setDrugInfo] = useState([]);
  // Export states
  const [isExporting, setIsExporting] = useState(false);
  const [isCompetitiveExporting, setCompetitiveIsExporting] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Topics filtering (Adjust allowed keys if necessary)
  const [selectedTopics, setSelectedTopics] = useState([]);
  const allowedKeys = [
    "Market Share", "Key Players", "Product Portfolios", "Strategic Initiatives",
    "Mergers & Acquisitions", "Research & Development", "Geographical Presence",
    "Financial Performance", "SWOT Analysis", "Competitive Strategies", "Innovation",
    "Regulatory Environment"
  ];

  // Handler to toggle chat window
  const handleChatToggle = useCallback(() => {
    setIsChatMinimized((prev) => !prev);
  }, []);

  // Handler to add a new tab
  const addNewTab = useCallback((label, content) => {
    setTabs((prevTabs) => {
      const newTab = {
        id: `tab-${prevTabs.length + 1}`,
        label,
        content,
      };
      return [...prevTabs, newTab];
    });
    setActiveTab(`tab-${tabs.length + 1}`);
  }, [tabs.length]);

  // Handler to close a tab
  const closeTab = useCallback((tabId) => {
    if (tabs.length > 1) {
      setTabs((prevTabs) => prevTabs.filter((tab) => tab.id !== tabId));
      if (activeTab === tabId) {
        const tabIndex = tabs.findIndex(tab => tab.id === tabId);
        const newActiveIndex = tabIndex > 0 ? tabIndex - 1 : 0;
        setActiveTab(tabs[newActiveIndex]?.id || "tab-1");
      }
    } else {
      toast.warn("At least one tab must remain open.");
    }
  }, [tabs, activeTab]);

  // Handler to update selectedCompetitiveData in a tab
  const updateSelectedCompetitiveData = useCallback((tabId, selectedData) => {
    setTabs((prevTabs) => prevTabs.map(tab => {
      if (tab.id === tabId) {
        return {
          ...tab,
          content: {
            ...tab.content,
            selectedCompetitiveData: selectedData,
          },
        };
      }
      return tab;
    }));
  }, []);

  // Handler to export competitive data
  const handleCompetitiveExport = useCallback((dataToExport) => {
    if (!dataToExport || dataToExport.length === 0) {
      toast.warn("No rows selected for export.");
      return;
    }

    setCompetitiveIsExporting(true);
    console.log(dataToExport);
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
        link.setAttribute("download", "selected_competitive_data.xlsx");
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        setCompetitiveIsExporting(false);
        toast.success("Data exported successfully!");
      })
      .catch((error) => {
        console.error("Error exporting data:", error);
        toast.error("Failed to export data.");
        setCompetitiveIsExporting(false);
      });
  }, []);

  // Handler to export selected drug cards
  const handleExportSelectedCards = useCallback(() => {
    const currentTab = tabs.find(tab => tab.id === activeTab);
    if (!currentTab) {
      toast.error("No active tab found.");
      return;
    }

    if (currentTab.content.selectedCards.length === 0) {
      toast.warn("No selected cards to export.");
      return;
    }

    setIsExporting(true);
    const exportData = currentTab.content.selectedCards.map((card) => {
      const {
          TradeName,
          "Active Ingredient": activeIngredient,
          Manufacturer,
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
          toast.success("Selected drugs exported successfully!");
      })
      .catch((error) => {
          console.error("Error exporting selected cards:", error);
          toast.error("Failed to export selected drugs.");
          setIsExporting(false);
      });
  }, [tabs, activeTab]);

  // Handler to fetch relevant drugs based on competitive data
  const handleRelevantDrugsSearch = useCallback((tabId) => {
    const currentTab = tabs.find(tab => tab.id === tabId);
    if (!currentTab || !currentTab.content.competitiveInfo.Company) { // Adjust based on competitiveInfo structure
      toast.warn("Please select a company before searching for relevant drugs.");
      return;
    }

    setIsSearching(true);

    fetch(`${import.meta.env.VITE_API_URL}/drug-search-by-company`, { // Adjust endpoint as needed
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ company: currentTab.content.competitiveInfo.Company }),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error("Failed to fetch relevant drugs.");
        }
        return response.json();
      })
      .then((data) => {
        // Check if a Relevant Drugs tab for this company already exists
        const existingRelevantDrugsTab = tabs.find(tab => tab.label === `Relevant Drugs - ${currentTab.content.competitiveInfo.Company}`);
        if (!existingRelevantDrugsTab) {
          // Create a new "Relevant Drugs" tab with a unique label
          addNewTab(`Relevant Drugs - ${currentTab.content.competitiveInfo.Company}`, {
            type: 'relevantDrugs',
            competitiveInfo: currentTab.content.competitiveInfo, // Pass competitive info if needed
            drugInfo: data,
            selectedCards: [],
          });
          toast.success("Relevant drugs tab created.");
        } else {
          // If already exists, make it active
          setActiveTab(existingRelevantDrugsTab.id);
          toast.info("Relevant drugs tab already exists. Activated the existing tab.");
        }
        setIsSearching(false);
      })
      .catch(error => {
        console.error("Error fetching relevant drugs:", error);
        toast.error("Failed to fetch relevant drugs.");
        setIsSearching(false);
      });
  }, [tabs, addNewTab]);

  // Handler for selecting/unselecting a drug card
  const handleCardSelection = useCallback((result) => {
    setTabs((prevTabs) => prevTabs.map(tab => {
      if (tab.id === activeTab && tab.content.type === 'relevantDrugs') {
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
  }, [activeTab]);

  // Handler to open dialog with detailed info
  const handleOpenDialog = useCallback((result) => {
    setSelectedResult(result);
    setDialogOpen(true);
  }, []);

  // Handler to select/unselect all drug cards in the active tab
  const handleSelectAll = useCallback(() => {
    setTabs((prevTabs) => prevTabs.map(tab => {
      if (tab.id === activeTab && tab.content.type === 'relevantDrugs') {
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
  }, [activeTab]);

  // Handler for topic selection
  const handleTopicSelectionLocal = useCallback((topic) => {
    setSelectedTopics((prevSelected) =>
      prevSelected.includes(topic)
        ? prevSelected.filter((t) => t !== topic)
        : [...prevSelected, topic]
    );
  }, []);

  // Function to render tabs navigation
  const renderTabs = () => (
    <div className="flex items-center border-b px-2 bg-white overflow-x-auto">
      {tabs.map((tab) => (
        <TabHeader
          key={tab.id}
          label={tab.label}
          onClose={() => closeTab(tab.id)}
          onActivate={() => setActiveTab(tab.id)}
          isActive={activeTab === tab.id}
        />
      ))}
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => addNewTab("New Tab", {
          type: 'competitive',
          competitiveInfo: {},
          drugInfo: [],
          selectedCards: [],
          selectedCompetitiveData: [],
        })} 
        className="ml-2" 
        aria-label="Add new tab"
      >
        <Plus className="h-4 w-4 text-gray-800" />
      </Button>
    </div>
  );

  // Get active tab content
  const activeTabContent = useMemo(() => {
    return tabs.find(tab => tab.id === activeTab)?.content || { type: 'competitive', competitiveInfo: {}, drugInfo: [], selectedCards: [], selectedCompetitiveData: [] };
  }, [activeTab, tabs]);

  return (
    <div className="competitive-landscape-search-page h-screen bg-gray-50 flex flex-col">
      {/* Toast Notifications */}
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover />

      {/* Tabs Navigation */}
      {renderTabs()}

      {/* Main Content */}
      <div className={cn("flex-grow overflow-hidden p-6 flex", !isChatMinimized ? "w-2/3" : "w-full")}>
        {/* Content Container */}
        <div className="flex flex-col flex-1 pr-6 overflow-hidden">
          {/* Conditional Rendering Based on Tab Type */}
          {activeTabContent.type === 'competitive' && (
            <CompetitiveLandscapeTab
              competitiveInfo={activeTabContent.competitiveInfo}
              allowedKeys={allowedKeys}
              selectedTopics={selectedTopics}
              handleTopicSelection={handleTopicSelectionLocal}
              isCompetitiveExporting={isCompetitiveExporting}
              handleCompetitiveExport={() => handleCompetitiveExport(activeTabContent.selectedCompetitiveData)}
              selectedCompetitiveData={activeTabContent.selectedCompetitiveData || []}
              handleRelevantDrugsSearch={() => handleRelevantDrugsSearch(activeTab)}
              isSearching={isSearching}
              onSelectedRowsChange={(selectedData) => updateSelectedCompetitiveData(activeTab, selectedData)}
            />
          )}

          {activeTabContent.type === 'relevantDrugs' && (
            <RelevantDrugsTab
              competitiveInfo={activeTabContent.competitiveInfo}
              drugInfo={activeTabContent.drugInfo}
              selectedCards={activeTabContent.selectedCards}
              handleSelectAll={handleSelectAll}
              handleExportSelectedCards={handleExportSelectedCards}
              handleCardSelection={handleCardSelection}
              handleOpenDialog={handleOpenDialog}
              isExporting={isExporting}
            />
          )}
        </div>
      </div>

      {/* Dialog for Detailed Information */}
      {dialogOpen && selectedResult && (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-white">
            <DialogTitle>{selectedResult.TradeName || selectedResult.Company || "Details"}</DialogTitle>
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
                const value = key === "Price" && selectedResult[key] ? `$${(selectedResult[key]).toFixed(2)}` : selectedResult[key];

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

      {/* ChatBot Component */}
      <ChatBot
        chatMessages={chatMessages}
        setChatMessages={setChatMessages}
        fulldata={{
          competitiveData: searchResults,
          drugData: drugs,
        }}
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

export default CompetitiveLandscapeSearchPage;
