"use client";

import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";  // <-- Import Button here
import { DrugList } from "./DrugList";
import { PlanList } from "./PlanList";
import { Sidebar } from "./Sidebar";
import { DiseaseList } from "./DiseaseList";

export function Dashboard() {
  const [activeTab, setActiveTab] = useState("disease-list");
  const [selectedDrugs, setSelectedDrugs] = useState([]);
  const [selectedPlans, setSelectedPlans] = useState([]);
  const [selectedDiseases, setSelectedDiseases] = useState([]);
  const [selectedState, setSelectedState] = useState("All States");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingFormulary, setLoadingFormulary] = useState(true);

  const [formularyData, setFormularyData] = useState({
    diseases: [],
    drugs: [],
    states: [],
    plans: [],
    drugTiers: []
  });

  useEffect(() => {
    // Fetch data from /formularyData only once
    fetch(`${import.meta.env.VITE_API_URL}/formularyData`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") {
          setFormularyData({
            diseases: data.diseases,
            drugs: data.drugs,
            states: data.states,
            plans: data.plans,
            drugTiers: data.drugTiers
          });
        }
      })
      .catch((err) => console.error("Error fetching formulary data:", err))
      .finally(() => setLoadingFormulary(false));
  }, []);

  const handleDiseaseSelect = (disease) => {
    setSelectedDiseases((prev) =>
      prev.includes(disease)
        ? prev.filter((d) => d !== disease)
        : [...prev, disease]
    );
  };

  const handleDrugSelect = (drug) => {
    if (!drug || drug.trim() === "") return;

    setSelectedDrugs((prev) => {
      const exists = prev.some((d) => d.id === drug);
      return exists
        ? prev.filter((d) => d.id !== drug)
        : [...prev, { id: drug, name: drug }];
    });
  };

  const handlePlanSelect = (plan) => {
    setSelectedPlans((prev) =>
      prev.some((p) => p.id === plan.id)
        ? prev.filter((p) => p.id !== plan.id)
        : [...prev, plan]
    );
  };

  const handleViewResults = async () => {
    if (selectedPlans.length === 0) {
      alert("Please select at least one plan to view results.");
      return;
    }

    setLoading(true);
    setActiveTab("drug-list");

    const payload = {
      selectedDrugs: selectedDrugs.map((drug) => ({ name: drug.name })),
      selectedState,
      selectedPlans: selectedPlans.map((plan) => ({
        id: plan.id,
        name: plan.name || "Unknown Plan",
      })),
      selectedDiseases,
    };

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/formularyResult`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.status === "success") {
        setResults(data.data);
      } else {
        console.error("Unexpected response format:", data);
        alert("Unexpected response format.");
      }
      setActiveTab("results");
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while fetching results. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const groupedResults = results.reduce((acc, result) => {
    const drugName = result["Drug Name"] || "Unknown Drug";
    if (!acc[drugName]) {
      acc[drugName] = [];
    }
    acc[drugName].push(result);
    return acc;
  }, {});

  // Display a loading indicator while formulary data is being fetched
  if (loadingFormulary) {
    return (
      <div className="flex min-h-screen justify-center items-center">
        <p>Loading formulary data...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <div className="flex-1 p-6">
        <Tabs
          defaultValue="disease-list"
          className="w-full"
          onValueChange={(val) => !loading && setActiveTab(val)}
          value={activeTab}
        >
          <TabsList className="flex flex-row border-b w-full justify-start rounded-none h-auto p-0 bg-transparent space-x-48">
            <div>
            <TabsTrigger
              value="disease-list"
              className="w-[160px] data-[state=active]:h-[32px] data-[state=active]:rounded-[19px] data-[state=active]:bg-green-500 data-[state=active]:border-green-600 data-[state=active]:text-black data-[state=active]:font-bold border-transparent rounded-none"
            >
              Disease List
            </TabsTrigger>
            <TabsTrigger
              value="drug-list"
              className="w-[160px] data-[state=active]:h-[32px] data-[state=active]:rounded-[19px] data-[state=active]:bg-green-500 data-[state=active]:border-green-600 data-[state=active]:text-black data-[state=active]:font-bold border-transparent rounded-none"
            >
              Drug List
            </TabsTrigger>
            <TabsTrigger
              value="plan-list"
              className="w-[160px] data-[state=active]:h-[32px] data-[state=active]:rounded-[19px] data-[state=active]:bg-green-500 data-[state=active]:border-green-600 data-[state=active]:text-black data-[state=active]:font-bold border-transparent rounded-none"
            >
              Plan List
            </TabsTrigger>
            <TabsTrigger
              value="results"
              disabled={results.length === 0 || loading}
              className={`w-[160px] data-[state=active]:h-[32px] data-[state=active]:rounded-[19px] data-[state=active]:bg-green-500 data-[state=active]:border-green-600 data-[state=active]:text-black data-[state=active]:font-bold border-transparent rounded-none ${
                results.length === 0 || loading
                  ? "cursor-not-allowed text-gray-400"
                  : ""
              }`}
            >
              Results
            </TabsTrigger>
            </div>
            {results.length > 0 && (
                <div className="">
                  <Button
                    onClick={async () => {
                      try {
                        const response = await fetch(`${import.meta.env.VITE_API_URL}/downloadExcelFormulary`, {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify({ results }), 
                        });
                        
                        if (!response.ok) {
                          throw new Error("Failed to download Excel file.");
                        }
                        
                        const blob = await response.blob();
                        const url = window.URL.createObjectURL(new Blob([blob]));
                        const link = document.createElement("a");
                        link.href = url;
                        link.setAttribute("download", "results.xlsx");
                        document.body.appendChild(link);
                        link.click();
                        link.parentNode.removeChild(link);
                      } catch (error) {
                        console.error("Download failed:", error);
                        alert("Failed to download Excel file.");
                      }
                    }}
                    className="mb-4 bg-green-500 text-white hover:bg-green-600 rounded-[12px] px-4 py-2"
                  >
                    Download Excel
                  </Button>
                </div>
              )}
          </TabsList>

          <TabsContent value="disease-list">
            <DiseaseList 
              diseases={formularyData.diseases} 
              onSelect={handleDiseaseSelect}
              selectedDiseases={selectedDiseases}
            />
          </TabsContent>

          <TabsContent value="drug-list">
            <DrugList
              drugs={formularyData.drugs}
              onSelect={handleDrugSelect}
              selectedDrugs={selectedDrugs}
            />
          </TabsContent>

          <TabsContent value="plan-list">
            <PlanList
              plans={formularyData.plans}
              states={formularyData.states}
              onSelect={handlePlanSelect}
              selectedPlans={selectedPlans}
              selectedState={selectedState}
              setSelectedState={setSelectedState}
            />
          </TabsContent>

          <TabsContent value="results">
            <div className="space-y-4">

              {results.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse">
                    <thead>
                      <tr className="bg-[#FFF]">
                        <th className="px-4 py-2 border text-[#54681D]">Disease Name</th>
                        <th className="px-4 py-2 border text-[#54681D]">Drug Name</th>
                        <th className="px-4 py-2 border text-[#54681D]">Drug Tier</th>
                        <th className="px-4 py-2 border text-[#54681D]">Health Plan Name</th>
                        <th className="px-4 py-2 border text-[#54681D]">Requirements/Limits</th>
                        <th className="px-4 py-2 border text-[#54681D]">State Name</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((result, index) => (
                        <tr key={index} className="hover:bg-gray-50 bg-white">
                          <td className="px-4 py-2 border">{result["Disease Name"] || "N/A"}</td>
                          <td className="px-4 py-2 border">{result["Drug Name"] || "N/A"}</td>
                          <td className="px-4 py-2 border">{result["Drug Tier"] || "N/A"}</td>
                          <td className="px-4 py-2 border">{result["Health Plan Name"] || "N/A"}</td>
                          <td className="px-4 py-2 border">{result["Requirements/Limits"] || "N/A"}</td>
                          <td className="px-4 py-2 border">{result["State Name"] || "N/A"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                activeTab === "results" && (
                  <div className="text-center text-gray-500">
                    No results to display.
                  </div>
                )
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <div className="w-80 border-l bg-gray-100">
        <Sidebar
          selectedDrugs={selectedDrugs}
          selectedDiseases={selectedDiseases}
          selectedState={selectedState}
          selectedPlans={selectedPlans}
          onRemoveDrug={(drug) =>
            setSelectedDrugs((prev) => prev.filter((d) => d.id !== drug.id))
          }
          onRemoveDisease={(disease) =>
            setSelectedDiseases((prev) => prev.filter((d) => d !== disease))
          }
          onRemovePlan={(plan) =>
            setSelectedPlans((prev) => prev.filter((p) => p.id !== plan.id))
          }
          onViewResults={handleViewResults}
          clearAllDrugs={() => setSelectedDrugs([])}
          clearAllDiseases={() => setSelectedDiseases([])}
          clearAllPlans={() => setSelectedPlans([])}
          loading={loading}
        />
      </div>
    </div>
  );
}
