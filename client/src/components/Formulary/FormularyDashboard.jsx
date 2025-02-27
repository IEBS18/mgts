"use client";

import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { DrugList } from "./DrugList";
import { PlanList } from "./PlanList";
import { Sidebar } from "./Sidebar";
import { DiseaseList } from "./DiseaseList";
import { ResultList } from "./ResultList";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import "react-toastify/dist/ReactToastify.css";

export function FormularyDashboard() {
  const [activeTab, setActiveTab] = useState("disease-list");
  const [selectedDrugs, setSelectedDrugs] = useState([]);
  const [selectedPlans, setSelectedPlans] = useState([]);
  const [selectedDiseases, setSelectedDiseases] = useState([]);
  const [selectedState, setSelectedState] = useState("All States");
  const [selectedPlanType, setSelectedPlanType] = useState("All Plan Types");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingFormulary, setLoadingFormulary] = useState(true);

  const [formularyData, setFormularyData] = useState({
    diseases: [],
    drugs: [],
    states: [],
    plans: [],
    drugTiers: [],
    planTypes: [],
    diseaseToDrugs: {},
  });

  const [selectedResultRows, setSelectedResultRows] = useState([]);
  const maxSelectedRows = 5;

  // For "Add Drug" dialog
  const [isAddDrugDialogOpen, setIsAddDrugDialogOpen] = useState(false);

  // Example form state for the new drug
  const [comparatorForm, setComparatorForm] = useState({
    drugName: "",
    diseaseName: "",
    modality: "",
    safety: "",
    efficacy: "",
  });

  const navigate = useNavigate();

  // Filtered drugs
  const [filteredDrugs, setFilteredDrugs] = useState([]);
  // Filtered plans
  const [filteredPlans, setFilteredPlans] = useState([]);

  // ----------- Fetch Formulary Data -----------
  useEffect(() => {
    const fetchFormularyData = async () => {
      setLoadingFormulary(true);
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/formularyData${
            selectedState !== "All States"
              ? `?state=${encodeURIComponent(selectedState)}`
              : ""
          }`
        );
        const data = await response.json();
        if (data.status === "success") {
          setFormularyData({
            diseases: data.diseases,
            drugs: data.drugs,
            states: data.states,
            plans: data.plans,
            drugTiers: data.drugTiers,
            planTypes: data.planTypes,
            diseaseToDrugs: data.diseaseToDrugs,
          });
        } else {
          toast.error("Failed to fetch formulary data.");
        }
      } catch (err) {
        console.error("Error fetching formulary data:", err);
        toast.error("An error occurred while fetching formulary data.");
      } finally {
        setLoadingFormulary(false);
      }
    };

    fetchFormularyData();
  }, [selectedState]);

  // ----------- Update Filtered Drugs -----------
  useEffect(() => {
    if (selectedDiseases.length === 0) {
      setFilteredDrugs(formularyData.drugs);
    } else {
      const drugsSet = new Set();
      selectedDiseases.forEach((disease) => {
        const drugsForDisease = formularyData.diseaseToDrugs[disease] || [];
        drugsForDisease.forEach((drug) => drugsSet.add(drug));
      });
      setFilteredDrugs(Array.from(drugsSet));
    }
  }, [selectedDiseases, formularyData.diseaseToDrugs, formularyData.drugs]);

  // ----------- Update Filtered Plans -----------
  useEffect(() => {
    if (selectedPlanType === "All Plan Types") {
      setFilteredPlans(formularyData.plans);
    } else {
      setFilteredPlans(
        formularyData.plans.filter((plan) => plan.type === selectedPlanType)
      );
    }
  }, [selectedPlanType, formularyData.plans]);

  // ----------- Handle Selection Actions -----------
  const handleDiseaseSelect = (disease) => {
    setSelectedDiseases((prev) =>
      prev.includes(disease)
        ? prev.filter((d) => d !== disease)
        : [...prev, disease]
    );
  };

  const handleDrugSelect = (drug) => {
    if (!drug || !drug.name || drug.name.trim() === "") return;
    setSelectedDrugs((prev) => {
      const exists = prev.some((d) => d.id === drug.name);
      return exists
        ? prev.filter((d) => d.id !== drug.name)
        : [...prev, { id: drug.name, name: drug.name }];
    });
  };

  const handlePlanSelect = (plan) => {
    setSelectedPlans((prev) =>
      prev.some((p) => p.id === plan.name)
        ? prev.filter((p) => p.id !== plan.name)
        : [...prev, { id: plan.name, name: plan.name, type: plan.type }]
    );
  };

  // ----------- Plan Bulk Selections -----------
  const handleSelectAllPlans = () => {
    const allPlans = filteredPlans.map((plan) => ({
      id: plan.name,
      name: plan.name,
      type: plan.type,
    }));
    setSelectedPlans(allPlans);
  };

  const handleDeselectAllPlans = () => {
    setSelectedPlans([]);
  };

  const handleSelectCurrentPagePlans = (currentPagePlans) => {
    const plansToAdd = currentPagePlans.map((plan) => ({
      id: plan.name,
      name: plan.name,
      type: plan.type,
    }));
    setSelectedPlans((prev) => {
      const newSelected = [...prev];
      plansToAdd.forEach((plan) => {
        if (!prev.some((p) => p.id === plan.id)) {
          newSelected.push(plan);
        }
      });
      return newSelected;
    });
  };

  const handleDeselectCurrentPagePlans = (currentPagePlans) => {
    const planIdsToRemove = currentPagePlans.map((plan) => plan.name);
    setSelectedPlans((prev) =>
      prev.filter((p) => !planIdsToRemove.includes(p.id))
    );
  };

  // ----------- View Results -----------
  const handleViewResults = async () => {
    if (selectedPlans.length === 0) {
      toast.warn("Please select at least one plan to view results.");
      return;
    }
    setLoading(true);
    setActiveTab("disease-list");

    const payload = {
      selectedDrugs: selectedDrugs.map((drug) => ({ name: drug.name })),
      selectedState,
      selectedPlanType,
      selectedPlans: selectedPlans.map((plan) => ({
        id: plan.name,
        name: plan.name || "Unknown Plan",
        type: plan.type || "Unknown Type",
      })),
      selectedDiseases,
    };

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/formularyResult`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error(`Server error: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.status === "success") {
        setResults(data.data);
      } else {
        console.error("Unexpected response format:", data);
        toast.error("Unexpected response format.");
      }
      setActiveTab("results");
    } catch (error) {
      console.error("Error:", error);
      toast.error(
        "An error occurred while fetching results. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  // ----------- Row Selection for Compare -----------
  const toggleRowSelection = (index) => {
    if (selectedResultRows.includes(index)) {
      setSelectedResultRows((prev) => prev.filter((i) => i !== index));
    } else {
      if (selectedResultRows.length >= maxSelectedRows) {
        toast.error(
          `You can only select up to ${maxSelectedRows} rows to compare plans.`
        );
        return;
      }
      setSelectedResultRows((prev) => [...prev, index]);
    }
  };

  // ----------- Download Excel -----------
  const handleDownloadExcel = async () => {
    const dataToDownload =
      selectedResultRows.length > 0
        ? selectedResultRows.map((i) => results[i])
        : results;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/downloadExcelFormulary`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ results: dataToDownload }),
        }
      );

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
      toast.error("Failed to download Excel file.");
    }
  };

  // ----------- Compare Plans -----------
  const handleComparePlans = async () => {
    if (selectedResultRows.length === 0) {
      toast.warn("Please select at least one row to compare plans.");
      return;
    }
    if (selectedResultRows.length > maxSelectedRows) {
      toast.error(`You can only compare up to ${maxSelectedRows} plans.`);
      return;
    }

    const selectedData = selectedResultRows.map((i) => results[i]);
    // Extract unique drug names
    const drugNames = [
      ...new Set(
        selectedData
          .map((item) => item["Drug Name"])
          .filter((name) => typeof name === "string" && name.trim() !== "")
      ),
    ];

    if (drugNames.length === 0) {
      toast.error("No valid drug names found in selected rows.");
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/get_safety_efficacy`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ drug_names: drugNames }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to fetch Safety and Efficacy data."
        );
      }

      const safetyEfficacyData = await response.json();

      const augmentedData = selectedData.map((item) => ({
        ...item,
        Safety: safetyEfficacyData[item["Drug Name"]]?.Safety || "Not Available",
        Efficacy:
          safetyEfficacyData[item["Drug Name"]]?.Efficacy || "Not Available",
        Modality:
          safetyEfficacyData[item["Drug Name"]]?.Modality || "Not Available",
        SubModality:
          safetyEfficacyData[item["Drug Name"]]?.SubModality || "Not Available",
        "Requirements/Limits": item.Requirement || "Fully Reimbursed",
      }));

      navigate("/compare-plans", { state: { selectedData: augmentedData } });
    } catch (error) {
      console.error("Error fetching Safety and Efficacy data:", error);
      toast.error(error.message || "Failed to fetch Safety and Efficacy data.");
    }
  };

  // ----------- Loading Spinner -----------
  if (loadingFormulary) {
    return (
      <div className="spinner-container flex flex-col items-center gap-2">
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
        <p>Loading formulary data...</p>
      </div>
    );
  }

  // ----------- Helpers for form fields in Dialog -----------
  const handleComparatorFormChange = (field, value) => {
    setComparatorForm((prev) => ({ ...prev, [field]: value }));
  };

  const renderInput = (id, label, value, onChange) => (
    <div key={id}>
      <Label htmlFor={id} className="text-gray-700">
        {label}
      </Label>
      <Input
        id={id}
        value={value}
        onChange={(e) => onChange(id, e.target.value)}
        className="w-full p-2 mt-1 border border-gray-200 rounded-[12px]
                   text-gray-800 focus:border-[#a6ce39] focus:ring-[#a6ce39]
                   hover:border-[#a6ce39] transition duration-200 ease-in-out"
      />
    </div>
  );

  // Fixed CSS styling for dropdowns to match input fields
  const renderSelect = (
    id,
    label,
    options,
    value,
    onChange,
    placeholder = "Select...",
    disabled = false
  ) => (
    <div key={id}>
      <Label htmlFor={id} className="text-gray-700">
        {label}
      </Label>
      <select
        id={id}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(id, e.target.value)}
        className="w-full p-2 mt-1 border border-gray-200 rounded-[12px] text-gray-800 focus:border-[#a6ce39] focus:ring-[#a6ce39] hover:border-[#a6ce39] transition duration-200 ease-in-out"
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );

  // ----------- Submit Drug Handler -----------

  const handleSubmitDrug = async () => {
    const { drugName, diseaseName, modality, safety, efficacy } = comparatorForm;
    if (!drugName || !diseaseName  || !safety | !efficacy) {
      toast.error("Please fill in all fields.");
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/add-drug-formulary`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(comparatorForm),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add drug.");
      }

      toast.success("Drug added successfully!");
      setIsAddDrugDialogOpen(false);
    } catch (error) {
      console.error("Error:", error);
      toast.error(error.message || "An error occurred while adding the drug.");
    }
  };

  // ----------- Main Return -----------
  return (
    <div className="flex min-h-screen">
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

      {/* Left Section: Tabs + Content */}
      <div className="flex-1 p-6">
        <Tabs
          defaultValue="disease-list"
          className="w-full"
          onValueChange={(val) => !loading && setActiveTab(val)}
          value={activeTab}
        >
          {/* Tabs and Buttons Wrapper */}
          <div className="flex items-center justify-between w-full mb-4">
            {/* Tabs List */}
            <TabsList className="flex flex-row border-b w-auto justify-start rounded-none h-auto p-0 bg-transparent space-x-4">
              <TabsTrigger
                value="disease-list"
                className="w-[160px] data-[state=active]:h-[32px]
                           data-[state=active]:rounded-[19px]
                           data-[state=active]:bg-green-500
                           data-[state=active]:border-green-600
                           data-[state=active]:text-black
                           data-[state=active]:font-bold
                           border-transparent rounded-none"
              >
                Disease List
              </TabsTrigger>
              <TabsTrigger
                value="drug-list"
                className="w-[160px] data-[state=active]:h-[32px]
                           data-[state=active]:rounded-[19px]
                           data-[state=active]:bg-green-500
                           data-[state=active]:border-green-600
                           data-[state=active]:text-black
                           data-[state=active]:font-bold
                           border-transparent rounded-none"
              >
                Drug List
              </TabsTrigger>
              <TabsTrigger
                value="plan-list"
                className="w-[160px] data-[state=active]:h-[32px]
                           data-[state=active]:rounded-[19px]
                           data-[state=active]:bg-green-500
                           data-[state=active]:border-green-600
                           data-[state=active]:text-black
                           data-[state=active]:font-bold
                           border-transparent rounded-none"
              >
                Plan List
              </TabsTrigger>
              <TabsTrigger
                value="results"
                disabled={results.length === 0 || loading}
                className={`w-[160px] data-[state=active]:h-[32px]
                            data-[state=active]:rounded-[19px]
                            data-[state=active]:bg-green-500
                            data-[state=active]:border-green-600
                            data-[state=active]:text-black
                            data-[state=active]:font-bold
                            border-transparent rounded-none ${
                              results.length === 0 || loading
                                ? "cursor-not-allowed text-gray-400"
                                : ""
                            }`}
              >
                Results
              </TabsTrigger>
            </TabsList>

            {/* Buttons on the right side */}
            <div className="flex space-x-2">
              {/* "Add Drug" button (only if not on the results tab) */}
              {activeTab !== "results" && (
                <Button
                  onClick={() => setIsAddDrugDialogOpen(true)}
                  className="text-md font-semibold text-black bg-[#a6ce39]
                             hover:bg-[#95b833] rounded-[12px] px-3 py-1 text-sm"
                >
                  Add Drug
                </Button>
              )}

              {activeTab === "results" && (
                <>
                  <Button
                    onClick={handleDownloadExcel}
                    className="text-white bg-[#a6ce39] hover:bg-[#95b833]
                               rounded-[12px] px-3 py-1 text-sm"
                  >
                    Download Excel
                  </Button>
                  <Button
                    onClick={handleComparePlans}
                    className="bg-blue-500 text-white hover:bg-blue-600
                               rounded-[12px] px-3 py-1 text-sm"
                  >
                    Compare Plans
                  </Button>
                </>
              )}

              {/* Hide "View Results" if we're on the results tab */}
              {activeTab !== "results" && (
                <Button
                  onClick={handleViewResults}
                  disabled={loading}
                  className={`text-md font-semibold text-black bg-[#a6ce39]
                              hover:bg-[#95b833] rounded-[12px] px-3 py-1 text-sm ${
                                loading ? "opacity-50 cursor-not-allowed" : ""
                              }`}
                >
                  {loading ? "Loading..." : "View Results"}
                </Button>
              )}
            </div>
          </div>

          {/* Disease List Tab */}
          <TabsContent value="disease-list">
            <DiseaseList
              diseases={formularyData.diseases}
              onSelect={handleDiseaseSelect}
              selectedDiseases={selectedDiseases}
              selectedState={selectedState}
              setSelectedState={setSelectedState}
              states={formularyData.states}
            />
          </TabsContent>

          {/* Drug List Tab */}
          <TabsContent value="drug-list">
            <DrugList
              drugs={filteredDrugs}
              onSelect={handleDrugSelect}
              selectedDrugs={selectedDrugs}
            />
          </TabsContent>

          {/* Plan List Tab */}
          <TabsContent value="plan-list">
            <PlanList
              plans={filteredPlans}
              planTypes={formularyData.planTypes}
              onSelect={handlePlanSelect}
              selectedPlans={selectedPlans}
              selectedPlanType={selectedPlanType}
              setSelectedPlanType={setSelectedPlanType}
              onSelectAllPlans={handleSelectAllPlans}
              onDeselectAllPlans={handleDeselectAllPlans}
              onSelectCurrentPagePlans={handleSelectCurrentPagePlans}
              onDeselectCurrentPagePlans={handleDeselectCurrentPagePlans}
            />
          </TabsContent>

          {/* Results Tab */}
          <TabsContent value="results">
            <div className="space-y-4">
              {results.length > 0 ? (
                <ResultList
                  results={results}
                  selectedResultRows={selectedResultRows}
                  toggleRowSelection={toggleRowSelection}
                />
              ) : (
                <div className="text-center text-gray-500">
                  No results to display.
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* RIGHT SIDEBAR: changed from w-80 to w-64 */}
      <div className="w-64 border-l bg-gray-100">
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
          clearAllDrugs={() => setSelectedDrugs([])}
          clearAllDiseases={() => setSelectedDiseases([])}
          clearAllPlans={() => setSelectedPlans([])}
          loading={loading}
        />
      </div>

      {/* "Add Drug" Dialog */}
      <Dialog open={isAddDrugDialogOpen} onOpenChange={setIsAddDrugDialogOpen}>
        <DialogContent className="max-w-xl bg-white rounded-lg">
          <DialogHeader>
            <DialogTitle>Add Drug</DialogTitle>
            <DialogDescription>
              Enter details about the drug you want to add.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            {/* Render input and select fields for the drug form */}
            {renderInput(
              "drugName",
              "Drug Name",
              comparatorForm.drugName,
              (field, value) => setComparatorForm((prev) => ({ ...prev, [field]: value }))
            )}
            {renderSelect(
              "diseaseName",
              "Disease Name",
              formularyData.diseases || [],
              comparatorForm.diseaseName,
              (field, value) => setComparatorForm((prev) => ({ ...prev, [field]: value })),
              "Select disease..."
            )}
            {renderSelect(
              "modality",
              "Modality",
              ["Small Molecule", "Biologic", "Vaccine"],
              comparatorForm.modality,
              (field, value) => setComparatorForm((prev) => ({ ...prev, [field]: value }))
            )}
            {renderInput(
              "safety",
              "Safety",
              comparatorForm.safety,
              (field, value) => setComparatorForm((prev) => ({ ...prev, [field]: value }))
            )}
            {renderInput(
              "efficacy",
              "Efficacy",
              comparatorForm.efficacy,
              (field, value) => setComparatorForm((prev) => ({ ...prev, [field]: value }))
            )}
          </div>

          <DialogFooter className="mt-4">
            <Button
              onClick={handleSubmitDrug}
              className="bg-[#54681D] text-white hover:bg-[#95b833] rounded-[60px]"
            >
              Submit
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsAddDrugDialogOpen(false)}
              className="border-gray-300 text-gray-700 hover:bg-gray-100 rounded-[60px]"
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
