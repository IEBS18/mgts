"use client";

import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DrugList } from "./DrugList";
import { PlanList } from "./PlanList";
import { Sidebar } from "./Sidebar";
import drugsData from "../../assets/data/formulary/drugs.json";
import typewiseDrugsData from "../../assets/data/formulary/typewise_drugs.json";
import statePlansData from "../../assets/data/formulary/state_plans_data.json";
import usPlansData from "../../assets/data/formulary/US_plans_data.json";

export function Dashboard() {
  const [activeTab, setActiveTab] = useState("drug-list");
  const [selectedDrugs, setSelectedDrugs] = useState([]);
  const [selectedPlans, setSelectedPlans] = useState([]);
  const [therapeuticArea, setTherapeuticArea] = useState("All Therapeutic Areas");
  const [selectedState, setSelectedState] = useState("All States");
  const [results, setResults] = useState([]); // Track results state
  const [loading, setLoading] = useState(false); // Track loading state

  const combinedDrugs = {
    "All Therapeutic Areas": drugsData["All Therapeutic Areas"] || [],
    ...typewiseDrugsData,
  };

  const combinedPlans = {
    "All States": usPlansData["all states"] || {},
    ...statePlansData,
  };

  const handleDrugSelect = (drug) => {
    setSelectedDrugs((prev) =>
      prev.some((d) => d.id === drug.id)
        ? prev.filter((d) => d.id !== drug.id)
        : [...prev, drug]
    );
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

    setLoading(true); // Start loading
    setActiveTab("drug-list"); // Ensure Results tab isn't active during fetch

    const payload = {
      therapeuticArea,
      selectedDrugs: selectedDrugs.map((drug) => ({
        id: drug.id,
        name: drug.name || "Unknown Drug",
      })),
      selectedState,
      selectedPlans: selectedPlans.map((plan) => ({
        id: plan.id,
        name: plan.name || "Unknown Plan",
      })),
    };

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/formulary`, {
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
      setResults(data); // Update results
      setActiveTab("results"); // Switch to Results tab
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while fetching results. Please try again later.");
    } finally {
      setLoading(false); // Stop loading
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

  return (
    <div className="flex min-h-screen">
      <div className="flex-1 p-6">
        <Tabs
          defaultValue="drug-list"
          className="w-full"
          onValueChange={(val) => !loading && setActiveTab(val)} // Disable tab switching during loading
          value={activeTab}
        >
          <TabsList className="border-b w-full justify-start rounded-none h-auto p-0 bg-transparent">
            {/* Drug List Tab */}
            <TabsTrigger
              value="drug-list"
              className="w-[160px] data-[state=active]:h-[32px] data-[state=active]:rounded-[19px] data-[state=active]:bg-green-500 data-[state=active]:border-green-600 data-[state=active]:text-black data-[state=active]:font-bold border-transparent rounded-none"
            >
              Drug List
            </TabsTrigger>
            {/* Plan List Tab */}
            <TabsTrigger
              value="plan-list"
              className="w-[160px] data-[state=active]:h-[32px] data-[state=active]:rounded-[19px] data-[state=active]:bg-green-500 data-[state=active]:border-green-600 data-[state=active]:text-black data-[state=active]:font-bold border-transparent rounded-none"
            >
              Plan List
            </TabsTrigger>
            {/* Results Tab */}
            <TabsTrigger
              value="results"
              disabled={results.length === 0 || loading} // Disable until results are generated
              className={`w-[160px] data-[state=active]:h-[32px] data-[state=active]:rounded-[19px] data-[state=active]:bg-green-500 data-[state=active]:border-green-600 data-[state=active]:text-black data-[state=active]:font-bold  border-transparent rounded-none ${
                results.length === 0 || loading
                  ? "cursor-not-allowed text-gray-400"
                  : ""
              }`}
            >
              Results
            </TabsTrigger>
          </TabsList>

          <TabsContent value="drug-list">
            <DrugList
              allDrugs={combinedDrugs["All Therapeutic Areas"]}
              drugsByType={combinedDrugs}
              onSelect={handleDrugSelect}
              selectedDrugs={selectedDrugs}
              therapeuticArea={therapeuticArea}
              setTherapeuticArea={setTherapeuticArea}
            />
          </TabsContent>

          <TabsContent value="plan-list">
            <PlanList
              statePlans={statePlansData}
              usPlans={usPlansData}
              onSelect={handlePlanSelect}
              selectedPlans={selectedPlans}
              selectedState={selectedState}
              setSelectedState={setSelectedState}
            />
          </TabsContent>

          <TabsContent value="results">
            <div className="space-y-4">
              {Object.entries(groupedResults).map(([drugName, drugResults]) => {
                const drugType =
                  drugResults[0]?.["Drug Type"] || "Unknown Drug Type";
                return (
                  <div key={drugName}>
                    <div className="bg-[#a6ce39da] p-3 mb-2 rounded-[12px]">
                      <h3 className="font-medium text-black text-lg">{drugType}</h3>
                      <p className="text-md text-gray-800">{drugName}</p>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead>
                          <tr>
                            <th className="px-4 py-2 text-left border-b text-[#54681D] bg-[#F4F4F4]">
                              Health Plan Name
                            </th>
                            <th className="px-4 py-2 text-left border-b text-[#54681D] bg-[#F4F4F4]">
                              Plan Type
                            </th>
                            <th className="px-4 py-2 text-left border-b text-[#54681D] bg-[#F4F4F4]">State</th>
                            <th className="px-4 py-2 text-left border-b text-[#54681D] bg-[#F4F4F4]">
                              Drug Type
                            </th>
                            <th className="px-4 py-2 text-left border-b text-[#54681D] bg-[#F4F4F4]">
                              Drug Name
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {drugResults.map((result, index) => (
                            <tr key={index} className="hover:bg-gray-50 bg-white">
                              <td className="px-4 py-2 border-b">{result.Name}</td>
                              <td className="px-4 py-2 border-b">
                                {result["Plan Type"]}
                              </td>
                              <td className="px-4 py-2 border-b">{result.State}</td>
                              <td className="px-4 py-2 border-b">
                                {result["Drug Type"]}
                              </td>
                              <td className="px-4 py-2 border-b">
                                {result["Drug Name"]}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
              {results.length === 0 && activeTab === "results" && (
                <div className="text-center text-gray-500">
                  No results to display.
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <div className="w-80 border-l bg-gray-100">
        <Sidebar
          therapeuticArea={therapeuticArea}
          selectedDrugs={selectedDrugs}
          selectedState={selectedState}
          selectedPlans={selectedPlans}
          onRemoveDrug={(drug) =>
            setSelectedDrugs((prev) => prev.filter((d) => d.id !== drug.id))
          }
          onRemovePlan={(plan) =>
            setSelectedPlans((prev) => prev.filter((p) => p.id !== plan.id))
          }
          onViewResults={handleViewResults}
          clearAllDrugs={() => setSelectedDrugs([])}
          clearAllPlans={() => setSelectedPlans([])}
          loading={loading} // Pass loading state
        />
      </div>
    </div>
  );
}
