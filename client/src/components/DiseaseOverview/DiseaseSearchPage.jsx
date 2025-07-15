import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom"; // Import useNavigate
import ChatBot from "../Chatbot/ChatBot";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import TherapyCostForecast from "./TherapyCostForecast";
import MarketAndPrevalenceForecast from "./MarketAndPrevalenceForecast";
import DiseaseTab from "./DiseaseTab";
import RelevantDrugsTab from "./RelevantDrugsTab";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import TabHeader from "./TabHeader";
import { cn } from "@/utils/cn";

// Import the DiseaseOverviewModal at the top
import DiseaseOverviewModal from "./DiseaseOverviewModal"; // Ensure the correct import path
// import DiseaseOverviewPage from "./DiseaseOverviewPage";

const DiseaseSearchPage = () => {
  const location = useLocation();
  const navigate = useNavigate(); // Get the navigate function
  const { searchResults } = location.state || {};

  const [drugData, setDrugData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fulldata = {
    diseaseData: Array.isArray(searchResults) ? searchResults : [searchResults],
    drugData: drugData,
  };

  // Initialize tabs based on searchResults
  const initializeTabs = (searchResults) => {
    const diseaseInfo = Array.isArray(searchResults)
      ? searchResults[0]
      : searchResults || {};

    return [
      {
        id: "tab-1",
        label: diseaseInfo.Disease || "Disease Overview",
        content: {
          type: "disease",
          diseaseInfo,
          drugInfo: [],
          selectedCards: [],
          selectedDiseaseData: [],
        },
      },
    ];
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
  const [isDiseaseExporting, setDiseaseIsExporting] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchingCP, setIsSearchingCP] = useState(false);
  const [isSearchingCT, setIsSearchingCT] = useState(false);

  // Topics filtering
  const [selectedTopics, setSelectedTopics] = useState([]);
  const allowedKeys = [
    "Disease Biology",
    "Signs & Symptoms",
    "Pathophysiology",
    "Risk Factors",
    "Diagnosis",
    "Patient Demographics",
    "Stages progression",
    "Sub-types",
    "Treatment options",
    "Treatment & Management",
    "Unmet Needs",
    "Prevalence",
  ];

  // Handler to toggle chat window
  const handleChatToggle = useCallback(() => {
    setIsChatMinimized((prev) => !prev);
  }, []);

  // Handler to add a new tab
  const addNewTab = useCallback(
    (label, content) => {
      setTabs((prevTabs) => {
        const newTab = {
          id: `tab-${prevTabs.length + 1}`,
          label,
          content,
        };
        return [...prevTabs, newTab];
      });
      setActiveTab(`tab-${tabs.length + 1}`);
    },
    [tabs.length]
  );

  // Handler to close a tab
  const closeTab = useCallback(
    (tabId) => {
      if (tabs.length > 1) {
        setTabs((prevTabs) => prevTabs.filter((tab) => tab.id !== tabId));
        if (activeTab === tabId) {
          const tabIndex = tabs.findIndex((tab) => tab.id === tabId);
          const newActiveIndex = tabIndex > 0 ? tabIndex - 1 : 0;
          setActiveTab(tabs[newActiveIndex]?.id || "tab-1");
        }
      } else {
        toast.warn("At least one tab must remain open.");
      }
    },
    [tabs, activeTab]
  );

  // Handler to update selectedDiseaseData in a tab
  const updateSelectedDiseaseData = useCallback((tabId, selectedData) => {
    setTabs((prevTabs) =>
      prevTabs.map((tab) => {
        if (tab.id === tabId) {
          return {
            ...tab,
            content: {
              ...tab.content,
              selectedDiseaseData: selectedData,
            },
          };
        }
        return tab;
      })
    );
  }, []);

  // Handler to export disease data
  const handleDiseaseExport = useCallback((dataToExport) => {
    if (!dataToExport || dataToExport.length === 0) {
      toast.warn("No rows selected for export.");
      return;
    }

    setDiseaseIsExporting(true);
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
        link.setAttribute("download", "disease_details.xlsx");
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        setDiseaseIsExporting(false);
        toast.success("Data exported successfully!");
      })
      .catch((error) => {
        console.error("Error exporting data:", error);
        toast.error("Failed to export data.");
        setDiseaseIsExporting(false);
      });
  }, []);

  // Handler to export selected drug cards
  const handleExportSelectedCards = useCallback(() => {
    const currentTab = tabs.find((tab) => tab.id === activeTab);
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
        link.setAttribute("download", "Relevant_drugs.xlsx");
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

  // Handler to fetch relevant drugs based on disease
  const handleRelevantDrugsSearch = useCallback(
    (tabId) => {
      const currentTab = tabs.find((tab) => tab.id === tabId);
      if (!currentTab || !currentTab.content.diseaseInfo.Disease) {
        toast.warn(
          "Please select a disease before searching for relevant drugs."
        );
        return;
      }

      setIsSearching(true);

      fetch(`${import.meta.env.VITE_API_URL}/drug-search-by-disease`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          disease: currentTab.content.diseaseInfo.Disease,
        }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to fetch relevant drugs.");
          }
          return response.json();
        })
        .then((data) => {
          // Check if a Relevant Drugs tab for this disease already exists
          const existingRelevantDrugsTab = tabs.find(
            (tab) =>
              tab.label ===
              `Relevant Drugs - ${currentTab.content.diseaseInfo.Disease}`
          );
          if (!existingRelevantDrugsTab) {
            // Create a new "Relevant Drugs" tab with a unique label
            addNewTab(
              `Relevant Drugs - ${currentTab.content.diseaseInfo.Disease}`,
              {
                type: "relevantDrugs",
                diseaseInfo: currentTab.content.diseaseInfo,
                drugInfo: data,
                selectedCards: [],
              }
            );
            toast.success("Relevant drugs tab created.");
          } else {
            // If already exists, make it active
            setActiveTab(existingRelevantDrugsTab.id);
            toast.info(
              "Relevant drugs tab already exists. Activated the existing tab."
            );
          }
          setIsSearching(false);
        })
        .catch((error) => {
          console.error("Error fetching relevant drugs:", error);
          toast.error("Failed to fetch relevant drugs.");
          setIsSearching(false);
        });
    },
    [tabs, addNewTab]
  );

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
      return price; // Default fallback
    }
  }

  // Handler to fetch market estimation data and add tab
  const handleMarketEstimation = useCallback(() => {
    const currentTab = tabs.find((tab) => tab.id === activeTab);
    if (!currentTab || !currentTab.content.diseaseInfo.Disease) {
      toast.warn(
        "Please select a disease before performing market estimation."
      );
      return;
    }

    setIsSearchingCP(true);

    fetch(`${import.meta.env.VITE_API_URL}/market-estimation`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        disease: currentTab.content.diseaseInfo.Disease,
        number: "1",
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch market estimation.");
        }
        return response.json();
      })
      .then((data) => {
        // Check if a Market Estimation tab already exists
        const existingMarketEstimationTab = tabs.find(
          (tab) =>
            tab.label ===
            `Market Estimation - ${currentTab.content.diseaseInfo.Disease}`
        );
        if (!existingMarketEstimationTab) {
          // Create a new "Market Estimation" tab with a unique label
          addNewTab(
            `Market Estimation - ${currentTab.content.diseaseInfo.Disease}`,
            {
              type: "marketEstimation",
              diseaseName: currentTab.content.diseaseInfo.Disease,
              data: data || {}
              // years: data.years || [],
              // forecast_years: data.forecast_years || [],
              // combinedPrevalence: data.combined_prevalence || [],
              // marketPredictions: data.market_predictions || [],
              // marketSize: data.market_size || [],
            }
          );
          toast.success("Market Estimation tab created.");
        } else {
          // If already exists, make it active
          setActiveTab(existingMarketEstimationTab.id);
          toast.info(
            "Market Estimation tab already exists. Activated the existing tab."
          );
        }
        setIsSearchingCP(false);
      })
      .catch((error) => {
        console.error("Error fetching market estimation:", error);
        toast.error("Failed to fetch market estimation.");
        setIsSearchingCP(false);
      });
  }, [tabs, activeTab, addNewTab]);

  // Handler to fetch therapy cost estimation data and add tab
  const handleTherapyCost = useCallback(() => {
    const currentTab = tabs.find((tab) => tab.id === activeTab);
    if (!currentTab || !currentTab.content.diseaseInfo.Disease) {
      toast.warn(
        "Please select a disease before performing therapy cost estimation."
      );
      return;
    }

    setIsSearchingCT(true);

    fetch(`${import.meta.env.VITE_API_URL}/therapy-cost-estimation`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        disease: currentTab.content.diseaseInfo.Disease,
        number: "2",
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch therapy cost estimation.");
        }
        return response.json();
      })
      .then((data) => {
        // Check if a Therapy Cost Estimation tab already exists
        const existingTherapyCostTab = tabs.find(
          (tab) =>
            tab.label ===
            `Therapy Cost Estimation - ${currentTab.content.diseaseInfo.Disease}`
        );
        if (!existingTherapyCostTab) {
          // Create a new "Therapy Cost Estimation" tab with a unique label
          addNewTab(
            `Therapy Cost Estimation - ${currentTab.content.diseaseInfo.Disease}`,
            {
              type: "therapyCostEstimation",
              diseaseName: currentTab.content.diseaseInfo.Disease,
              data: data || {},
              // allYears: data.all_years || [],
              // combinedTherapyCost: data.combined_therapy_cost || [],
            }
          );
          toast.success("Therapy Cost Estimation tab created.");
        } else {
          // If already exists, make it active
          setActiveTab(existingTherapyCostTab.id);
          toast.info(
            "Therapy Cost Estimation tab already exists. Activated the existing tab."
          );
        }
        setIsSearchingCT(false);
      })
      .catch((error) => {
        console.error("Error fetching therapy cost estimation:", error);
        toast.error("Failed to fetch therapy cost estimation.");
        setIsSearchingCT(false);
      });
  }, [tabs, activeTab, addNewTab]);

  // Handler for selecting/unselecting a drug card
  const handleCardSelection = useCallback(
    (result) => {
      setTabs((prevTabs) =>
        prevTabs.map((tab) => {
          if (tab.id === activeTab && tab.content.type === "relevantDrugs") {
            const isSelected = tab.content.selectedCards.includes(result);
            const newSelectedCards = isSelected
              ? tab.content.selectedCards.filter((item) => item !== result)
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
        })
      );
    },
    [activeTab]
  );

  // Handler to open dialog with detailed info
  const handleOpenDialog = useCallback((result) => {
    setSelectedResult(result);
    setDialogOpen(true);
  }, []);

  // Handler to select/unselect all drug cards in the active tab
  const handleSelectAll = useCallback(() => {
    setTabs((prevTabs) =>
      prevTabs.map((tab) => {
        if (tab.id === activeTab && tab.content.type === "relevantDrugs") {
          const allSelected =
            tab.content.selectedCards.length === tab.content.drugInfo.length;
          return {
            ...tab,
            content: {
              ...tab.content,
              selectedCards: allSelected ? [] : [...tab.content.drugInfo],
            },
          };
        }
        return tab;
      })
    );
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
    <div className="flex items-center border-b px-2 bg-white overflow-x-auto overflow-y-hidden">
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
        onClick={() => setIsModalOpen(true)}
        className="ml-2"
        aria-label="Add new tab"
      >
        <Plus className="h-4 w-4 text-gray-800" />
      </Button>
    </div>
  );

  // Get active tab content
  const activeTabContent = useMemo(() => {
    return (
      tabs.find((tab) => tab.id === activeTab)?.content || {
        type: "disease",
        diseaseInfo: {},
        drugInfo: [],
        selectedCards: [],
        selectedDiseaseData: [],
      }
    );
  }, [activeTab, tabs]);

  // Add state to control the modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Handle new tab search submission
  const handleNewTabSearchSubmit = ({ type, data, symptoms }) => {
    setIsModalOpen(false);
    if (type === 'disease') {
      const diseaseInfo = Array.isArray(data) ? data[0] : data || {};
      addNewTab(diseaseInfo.Disease || "Disease Overview", {
        type: "disease",
        diseaseInfo,
        drugInfo: [],
        selectedCards: [],
        selectedDiseaseData: [],
      });
    } else if (type === 'drug') {
      // Navigate to /drug-search with the search results
      navigate("/drug-search", {
        state: { searchResults: data },
      });
    } else if (type === 'symptoms') {
      // Navigate to /symptom-search with the search results
      navigate("/symptom-search", {
        state: { searchResults: data, symptoms },
      });
    }
  };

  useEffect(() => {
    const fetchDrugData = async (diseaseName) => {
      console.log(diseaseName);
      if (!diseaseName) return;

      setLoading(true);
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/drug-search-by-disease`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ disease: diseaseName }),
        });

        if (response.ok) {
          const data = await response.json();
          setDrugData(data);
        } else {
          console.error("Error fetching drug data:", response.statusText);
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    console.log(searchResults[0]?.Disease);
    if (searchResults[0]?.Disease) {
      fetchDrugData(searchResults[0].Disease);
    }
  }, [searchResults]);

  
  useEffect(() => {
      // Scroll to the top when the component mounts
      window.scrollTo(0, 0);
    }, []);

  return (
    <div>
      {loading ? (
        // 
        <div className="spinner-container">
  <div className="lds-grid">
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
  </div>
</div>

      ) : (
        <div className="disease-search-page h-screen bg-gray-50 flex flex-col">
          {/* Toast Notifications */}
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />

          {/* Tabs Navigation */}
          {renderTabs()}

          {/* Main Content */}
          <div
            className={cn(
              "flex-grow overflow-hidden p-6 flex"
            )}
          >
            <div className="w-full">
              {/* Content Container */}
              <div className="flex flex-col flex-1 overflow-hidden">
                {/* Conditional Rendering Based on Tab Type */}
                {activeTabContent.type === "disease" && (
                  <DiseaseTab
                    diseaseInfo={activeTabContent.diseaseInfo}
                    allowedKeys={allowedKeys}
                    selectedTopics={selectedTopics}
                    handleTopicSelection={handleTopicSelectionLocal}
                    isDiseaseExporting={isDiseaseExporting}
                    handleDiseaseExport={() =>
                      handleDiseaseExport(activeTabContent.selectedDiseaseData)
                    }
                    selectedDiseaseData={activeTabContent.selectedDiseaseData || []}
                    handleRelevantDrugsSearch={() =>
                      handleRelevantDrugsSearch(activeTab)
                    }
                    handleMarketEstimation={handleMarketEstimation}
                    handleTherapyCost={handleTherapyCost}
                    isSearching={isSearching}
                    isSearchingCP={isSearchingCP}
                    isSearchingCT={isSearchingCT}
                    onSelectedRowsChange={(selectedData) =>
                      updateSelectedDiseaseData(activeTab, selectedData)
                    }
                    isChatMinimized={isChatMinimized}
                  />
                )}

                {activeTabContent.type === "relevantDrugs" && (
                  <RelevantDrugsTab
                    diseaseInfo={activeTabContent.diseaseInfo}
                    drugInfo={activeTabContent.drugInfo}
                    selectedCards={activeTabContent.selectedCards}
                    handleSelectAll={handleSelectAll}
                    handleExportSelectedCards={handleExportSelectedCards}
                    handleCardSelection={handleCardSelection}
                    handleOpenDialog={handleOpenDialog}
                    isExporting={isExporting}
                    isChatMinimized={isChatMinimized}
                  />
                )}

                {activeTabContent.type === "marketEstimation" && (
                  <MarketAndPrevalenceForecast
                    isChatMinimized={isChatMinimized}
                    diseaseName={activeTabContent.diseaseName}
                    data={activeTabContent.data}
                  />
                )}

                {activeTabContent.type === "therapyCostEstimation" && (
                  <TherapyCostForecast
                    isChatMinimized={isChatMinimized}
                    diseaseName={activeTabContent.diseaseName}
                    allData={activeTabContent.data}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Dialog for Detailed Information */}
          {dialogOpen && selectedResult && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-white">
                <DialogTitle className="font-bold text-2xl">
                  Drug Overview:{" "}
                  <strong className="text-[#a6ce39]">
                    {selectedResult.TradeName}
                  </strong>
                </DialogTitle>
                <DialogDescription>
                  {[
                    "Active Ingredient",
                    "Manufacturer",
                    "Country",
                    "Size",
                    "Price",
                    "Quality_of_Life",
                    "Efficacy",
                    "Safety",
                    "Adverse_Events",
                    "Annual_Therapy_Costs",
                    "Type_of_Drug",
                  ].map((key) => {
                    const customLabels = {
                      Price: "Price",
                    };

                    const label = customLabels[key] || key.replace(/_/g, " ");
                    const value =
                      key === "Price"
                        ? `${formatPrice(selectedResult[key])}`
                        : selectedResult[key];

                    return (
                      selectedResult[key] && (
                        <p key={key}>
                          <strong>{key === "Price" ? "Price (in USD)" : label}:</strong> {value}
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
            fulldata={fulldata}
            isMinimized={isChatMinimized}
            onToggle={handleChatToggle}
          />

          {/* Include the DiseaseOverviewModal */}
          <DiseaseOverviewModal
            isOpen={isModalOpen}
            onOpenChange={setIsModalOpen}
            onSearchSubmit={handleNewTabSearchSubmit}
          />
        </div>
      )}
    </div>
  );
};

export default DiseaseSearchPage;
