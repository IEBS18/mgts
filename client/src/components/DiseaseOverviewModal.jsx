
// src/components/DiseaseOverviewModal.jsx

import { useState, useEffect } from "react";
import "../index.css";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Select from "react-select";
import { useNavigate } from "react-router-dom";

import DiseaseImg from "../assets/dashboard/diseaseOverview.png";

// --------- IMPORT TPP-RELATED DATA ---------
import inputData from "../assets/data/drugDiseaseData.json";

// ---------- UTILITY FUNCTIONS (FROM TPPModal) ----------
const fetchDrugInfo = async (drugName) => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/drug-info`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ drugName }),
      }
    );
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching disease and modality:", error);
    return null;
  }
};

const fetchDiseaseInfo = async (diseaseName) => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/disease-info`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ diseaseName }),
      }
    );
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching disease info:", error);
    return null;
  }
};

// -------------------------------------------------------

export default function DiseaseOverviewModal({
  isOpen,
  onOpenChange,
  onSearchSubmit,
}) {
  const navigate = useNavigate();

  // Original states used for "Disease" & "Symptoms" search
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [searchType, setSearchType] = useState("disease");
  const [searchValue, setSearchValue] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // We unify disease & drug options from a SINGLE fetch
  const [diseaseOptions, setDiseaseOptions] = useState([]);
  const [drugOptions, setDrugOptions] = useState([]);

  // --------------- TPP-RELATED STATES ---------------
  const [isTPPSearching, setIsTPPSearching] = useState(false);

  const [drugSearchForm, setDrugSearchForm] = useState({
    drugName: null,
    diseaseName: null,
    country: null,
    modality: null,
  });

  const [comparatorForm, setComparatorForm] = useState({
    drug_Name: "",
    diseaseName: null,
    routeOfAdministration: null,
    modality: null,
    safety: "",
    efficacy: "",
    dosageForm: "",
    dosageRegime: "",
    dosageSize: "",
    specialWarnings: "",
    patientEligibility: "",
    country: null,
  });

  const [drugDiseaseData, setDrugDiseaseData] = useState({
    drugs: inputData.drugs || [],
    diseases: [], // will get from fetchDrugInfo
    modalities: [], // will get from fetchDrugInfo
    countries: inputData.countries || [],
    routes_of_administration: inputData.routes_of_administration || [],
  });
  // ---------------------------------------------------

  // Single fetch for disease + drug options from output.json
  useEffect(() => {
    fetch("/output.json")
      .then((response) => response.json())
      .then((data) => {
        // disease list
        const dOps = data.DISEASE.map((d) => ({ value: d, label: d }));
        // drug list
        const drOps = data["ACTIVE INGREDIENT"].map((drug) => ({
          value: drug,
          label: drug,
        }));
        setDiseaseOptions(dOps);
        setDrugOptions(drOps);
      })
      .catch((error) =>
        console.error("Error fetching output.json:", error)
      );
  }, []);

  // ------------------- Original "Disease" search logic -------------------
  const handleSearchSubmitDisease = async () => {
    setIsSearching(true);
    const searchParams = {
      search_type: "disease",
      disease_name: searchValue,
    };

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/search-by-disease`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(searchParams),
        }
      );
      const data = await response.json();
      setIsSearching(false);
      if (onSearchSubmit) {
        onSearchSubmit({ type: "disease", data: data.data });
      }
      navigate("/disease-search", {
        state: { searchResults: data.data },
      });
    } catch (error) {
      console.error("Error submitting search:", error);
      setIsSearching(false);
    }
  };

  // ------------------- Original "Symptoms" search logic -------------------
  const handleSearchSubmitSymptoms = async () => {
    setIsSearching(true);
    const searchParams = {
      search_type: "symptoms",
      search_keyword: searchValue,
    };

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/search-by-symptoms`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(searchParams),
        }
      );
      const data = await response.json();
      setIsSearching(false);
      if (onSearchSubmit) {
        onSearchSubmit({
          type: "symptoms",
          data: data.data,
          symptoms: searchParams.search_keyword,
        });
      }
      navigate("/symptom-search", {
        state: { searchResults: data.data, symptoms: searchParams.search_keyword },
      });
    } catch (error) {
      console.error("Error submitting search:", error);
      setIsSearching(false);
    }
  };

  // ------------------- TPP METHODS (From TPPModal) -----------------------
  const handleDrugFormChange = async (field, value) => {
    const inputValue =
      value && typeof value === "object" ? value.value : value;

    setDrugSearchForm((prev) => ({
      ...prev,
      [field]: inputValue,
    }));

    if (field === "drugName" && inputValue) {
      const data = await fetchDrugInfo(inputValue);
      if (data) {
        // reset disease & modality since it's drug-specific
        setDrugSearchForm((prev2) => ({
          ...prev2,
          diseaseName: null,
          modality: null,
        }));
        setDrugDiseaseData((prev2) => ({
          ...prev2,
          diseases: data.diseases || [],
          modalities: data.modalities || [],
        }));
      }
    }
  };

  const handleComparatorFormChange = async (field, value) => {
    const inputValue =
      value && typeof value === "object" ? value.value : value;
    setComparatorForm((prev) => ({ ...prev, [field]: inputValue }));
  };

  const handleSubmitDrug = async () => {
    setIsTPPSearching(true);
    try {
      const submitData = {
        drugName: drugSearchForm.drugName || "",
        diseaseName: drugSearchForm.diseaseName || "",
        country: drugSearchForm.country || "",
        modality: drugSearchForm.modality || "",
      };

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/tpp-by-drug`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(submitData),
        }
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setIsTPPSearching(false);

      // Navigate to TPP results page
      navigate("/tpp-by-drug", {
        state: { searchResults: data.data, drug: drugSearchForm.drugName },
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Error submitting drug search:", error);
      setIsTPPSearching(false);
    }
  };

  const handleSubmitComparator = async () => {
    setIsTPPSearching(true);
    try {
      const submitData = {
        drug_Name: comparatorForm.drug_Name || "User's Drug",
        diseaseName: comparatorForm.diseaseName || "",
        routeOfAdministration: comparatorForm.routeOfAdministration || "",
        modality: comparatorForm.modality || "",
        safety: comparatorForm.safety || "N/A",
        efficacy: comparatorForm.efficacy || "N/A",
        dosageForm: comparatorForm.dosageForm || "N/A",
        dosageRegime: comparatorForm.dosageRegime || "N/A",
        dosageSize: comparatorForm.dosageSize || "N/A",
        specialWarnings: comparatorForm.specialWarnings || "N/A",
        patientEligibility: comparatorForm.patientEligibility || "N/A",
        country: comparatorForm.country || "N/A",
      };

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/tpp-by-therapies`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(submitData),
        }
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();

      // Combine user input with fetched results
      const allKeys = new Set(data.data.flatMap(Object.keys));
      const transformedItem = {};
      allKeys.forEach((key) => {
        transformedItem[key] = "N/A";
      });
      transformedItem["Disease"] = submitData.diseaseName;
      transformedItem["Route Of Administration"] =
        submitData.routeOfAdministration;
      transformedItem["Modality"] = submitData.modality;
      transformedItem["Safety"] = submitData.safety;
      transformedItem["Efficacy"] = submitData.efficacy;
      transformedItem["Dosage Form"] = submitData.dosageForm;
      transformedItem["Dosage Regime"] = submitData.dosageRegime;
      transformedItem["Dosage Size"] = submitData.dosageSize;
      transformedItem["Special Warnings"] = submitData.specialWarnings;
      transformedItem["Patient Eligibility"] =
        submitData.patientEligibility;
      transformedItem["Country"] = submitData.country;
      transformedItem["Drug"] = submitData.drug_Name;

      const updatedData = [transformedItem, ...data.data];

      setIsTPPSearching(false);
      navigate("/tpp-by-drug", {
        state: { searchResults: updatedData, drug: submitData.drug_Name },
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Error submitting comparator search:", error);
      setIsTPPSearching(false);
    }
  };

  // -------------- TPP RENDER HELPERS ----------------
  const selectStyles = {
    control: (base) => ({
      ...base,
      borderRadius: "12px",
      borderColor: "#d1d5db",
      boxShadow: "none",
      "&:hover": { borderColor: "#a6ce39" },
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused ? "#e0f3c4" : "white",
      color: "#333",
    }),
    menuPortal: (base) => ({
      ...base,
      zIndex: 1050,
      pointerEvents: "auto",
      WebkitOverflowScrolling: "touch",
      touchAction: "pan-y"
    }),
    // Added menuList to enforce scrolling with a max-height.
    menuList: (base) => ({
      ...base,
      maxHeight: "300px",
      overflowY: "auto",
    }),
  };

  const renderSelect = (
    id,
    label,
    options,
    value,
    onChange,
    placeholder,
    field,
    isDisabled = false
  ) => {
    const selectOptions = options.map((item) => ({
      value: item,
      label: item,
    }));
    return (
      <div>
        <Label htmlFor={id} className="text-gray-700">
          {label}
        </Label>
        <Select
          id={id}
          value={value ? { value: value, label: value } : null}
          options={selectOptions}
          onChange={(selectedOption) => onChange(field, selectedOption)}
          styles={selectStyles}
          placeholder={placeholder}
          menuPortalTarget={document.body}
          isClearable
          classNamePrefix="dropdown-scroll-do"  // <-- Custom prefix for scrollbar styles
          isDisabled={isDisabled}
        />
      </div>
    );
  };

  const renderInput = (id, label, value, onChange) => (
    <div>
      <Label htmlFor={id} className="text-gray-700">
        {label}
      </Label>
      <Input
        id={id}
        value={value}
        onChange={(e) => onChange(id, e.target.value)}
        className="w-full p-2 border border-gray-200 rounded-[12px] text-gray-800 focus:border-[#a6ce39] focus:ring-[#a6ce39] hover:border-[#a6ce39] transition duration-200 ease-in-out"
      />
    </div>
  );

  // --------------------------------------------------------------------

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-3xl bg-dialog rounded-[12px] overflow-y-auto"
        style={{
          position: "fixed",
          top: "10%",
          left: "50%",
          transform: "translateX(-50%)",
          maxHeight: "80vh",
          width: "100%",
        }}
      >
        <DialogHeader className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <DialogTitle className="flex flex-row items-center justify-center text-white rounded-lg">
                <div className="flex items-center justify-center w-12 h-12 border-2 border-white rounded-full mr-4">
                  <img
                    src={DiseaseImg}
                    alt="Disease icon"
                    className="w-6 h-6 object-contain"
                  />
                </div>
                <p className="text-lg font-medium">Disease Overview</p>
              </DialogTitle>
            </div>
            <p className="text-sm text-white">
              A high-level overview of the selected indication, covering disease
              biology, risk factors, standard treatment protocols, and key unmet
              needs. Ideal for developing a foundational understanding or refining
              strategic focus.
            </p>
          </div>
        </DialogHeader>
        {/* Parent Tabs: disease, drug, symptoms */}
        <Tabs
          defaultValue="disease"
          onValueChange={(value) => {
            setSearchType(value);
            setSearchValue("");
          }}
          className="w-full"
        >
          {/* Top-level tabs for DISEASE, DRUG, SYMPTOMS */}
          <div className="sticky top-0 z-10 bg-white rounded-[18px]">
            <TabsList className="grid w-full grid-cols-3 bg-white rounded-[18px]">
              <TabsTrigger
                value="disease"
                className="data-[state=active]:bg-[#54681D] data-[state=active]:text-white rounded-[12px]"
              >
                Search by Disease
              </TabsTrigger>
              <TabsTrigger
                value="drug"
                className="data-[state=active]:bg-[#54681D] data-[state=active]:text-white rounded-[12px]"
              >
                Search by Drug
              </TabsTrigger>
              <TabsTrigger
                value="symptoms"
                className="data-[state=active]:bg-[#54681D] data-[state=active]:text-white rounded-[12px]"
              >
                Search by Symptoms
              </TabsTrigger>
            </TabsList>
          </div>

          {/* SCROLLABLE CONTENT */}
          <div className="overflow-y-auto max-h-[70vh] bg-white p-4 rounded-[20px] mt-4 no-scrollbar">
            {/* ---------- Disease Tab ---------- */}
            <TabsContent value="disease">
              <div className="space-y-2">
                <Label htmlFor="disease-select" className="text-gray-700">
                  Disease Name
                </Label>
                <Select
                  id="disease-select"
                  options={diseaseOptions}
                  onChange={(option) => setSearchValue(option.value)}
                  styles={selectStyles}
                  placeholder="Select disease..."
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                  classNamePrefix="dropdown-scroll-do"  // <-- Apply custom prefix here as well
                />
              </div>
              <div className="flex justify-center">
                <Button
                  onClick={handleSearchSubmitDisease}
                  disabled={isSearching}
                  className="w-[120px] bg-[#54681D] text-white hover:bg-[#95b833] rounded-[60px] mt-4"
                >
                  {isSearching ? "Loading..." : "Submit"}
                </Button>
              </div>
            </TabsContent>

            {/* ---------- Symptoms Tab ---------- */}
            <TabsContent value="symptoms">
              <div className="space-y-2">
                <Label htmlFor="symptoms-text" className="text-gray-700">
                  Symptoms
                </Label>
                <Input
                  id="symptoms-text"
                  placeholder="Enter symptoms..."
                  className="w-full p-2 border border-gray-200 rounded-[12px] text-gray-800 focus:border-[#a6ce39] focus:ring-[#a6ce39] hover:border-[#a6ce39] transition duration-200 ease-in-out"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                />
              </div>
              <div className="flex justify-center">
                <Button
                  onClick={handleSearchSubmitSymptoms}
                  disabled={isSearching}
                  className="w-[120px] bg-[#54681D] text-white hover:bg-[#95b833] rounded-[60px] mt-4"
                >
                  {isSearching ? "Loading..." : "Submit"}
                </Button>
              </div>
            </TabsContent>

            {/* ---------- Drug Tab (using TPP sub-tabs) ---------- */}
            <TabsContent value="drug">
              <Tabs defaultValue="tppDrug" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-white rounded-[18px] mt-4 mb-4">
                  <TabsTrigger
                    value="tppDrug"
                    className="data-[state=inactive]:border-black-500 data-[state=active]:bg-[#54681D] data-[state=active]:text-white rounded-[12px]"
                  >
                    Search by Drug
                  </TabsTrigger>
                  <TabsTrigger
                    value="comparator"
                    className="data-[state=inactive]:border-black-500 data-[state=active]:bg-[#54681D] data-[state=active]:text-white rounded-[12px] border-black-500"
                  >
                    Search Comparator Therapies
                  </TabsTrigger>
                </TabsList>

                <div className="overflow-y-auto max-h-[70vh] bg-white p-4 rounded-[20px] mt-4 no-scrollbar">
                  {/* -------------- TPP Drug Search -------------- */}
                  <TabsContent value="tppDrug">
                    <div className="space-y-4">
                      {renderSelect(
                        "drug-name",
                        "Drug Name",
                        drugDiseaseData.drugs,
                        drugSearchForm.drugName,
                        handleDrugFormChange,
                        "Select drug...",
                        "drugName"
                      )}
                      {renderSelect(
                        "disease-name",
                        "Disease Name",
                        drugDiseaseData.diseases,
                        drugSearchForm.diseaseName,
                        handleDrugFormChange,
                        "Select disease...",
                        "diseaseName",
                        !drugSearchForm.drugName // disable if no drug selected
                      )}
                      {renderSelect(
                        "country",
                        "Country",
                        drugDiseaseData.countries,
                        drugSearchForm.country,
                        handleDrugFormChange,
                        "Select country...",
                        "country"
                      )}
                      {renderSelect(
                        "modality",
                        "Modality",
                        drugDiseaseData.modalities,
                        drugSearchForm.modality,
                        handleDrugFormChange,
                        "Select modality...",
                        "modality",
                        !drugSearchForm.drugName
                      )}
                      <div className="flex justify-center">
                        <Button
                          onClick={handleSubmitDrug}
                          disabled={isTPPSearching}
                          className="w-[120px] bg-[#54681D] text-white hover:bg-[#95b833] rounded-[60px] mt-4"
                        >
                          {isTPPSearching ? "Loading..." : "Submit"}
                        </Button>
                      </div>
                    </div>
                  </TabsContent>

                  {/* -------------- Comparator Search -------------- */}
                  <TabsContent value="comparator">
                    <div className="space-y-4">
                      {renderInput(
                        "drug_Name",
                        "Drug Name (User's Drug)",
                        comparatorForm.drug_Name,
                        handleComparatorFormChange
                      )}
                      {renderSelect(
                        "diseaseName",
                        "Disease Name",
                        inputData.diseases || [],
                        comparatorForm.diseaseName,
                        handleComparatorFormChange,
                        "Select disease...",
                        "diseaseName"
                      )}
                      {renderSelect(
                        "routeOfAdministration",
                        "Route of Administration",
                        inputData.routes_of_administration || [],
                        comparatorForm.routeOfAdministration,
                        handleComparatorFormChange,
                        "Select route...",
                        "routeOfAdministration",
                        !comparatorForm.diseaseName
                      )}
                      {renderSelect(
                        "modality",
                        "Modality",
                        inputData.modalities || [],
                        comparatorForm.modality,
                        handleComparatorFormChange,
                        "Select modality...",
                        "modality",
                        !comparatorForm.diseaseName
                      )}
                      {renderInput(
                        "safety",
                        "Safety",
                        comparatorForm.safety,
                        handleComparatorFormChange
                      )}
                      {renderInput(
                        "efficacy",
                        "Efficacy",
                        comparatorForm.efficacy,
                        handleComparatorFormChange
                      )}
                      {renderInput(
                        "dosageForm",
                        "Dosage Form",
                        comparatorForm.dosageForm,
                        handleComparatorFormChange
                      )}
                      {renderInput(
                        "dosageRegime",
                        "Dosage Regime",
                        comparatorForm.dosageRegime,
                        handleComparatorFormChange
                      )}
                      {renderInput(
                        "dosageSize",
                        "Dosage Size",
                        comparatorForm.dosageSize,
                        handleComparatorFormChange
                      )}
                      {renderInput(
                        "specialWarnings",
                        "Special Warnings",
                        comparatorForm.specialWarnings,
                        handleComparatorFormChange
                      )}
                      {renderInput(
                        "patientEligibility",
                        "Patient Eligibility",
                        comparatorForm.patientEligibility,
                        handleComparatorFormChange
                      )}
                      {renderSelect(
                        "country",
                        "Country",
                        drugDiseaseData.countries,
                        comparatorForm.country,
                        handleComparatorFormChange,
                        "Select country...",
                        "country"
                      )}
                      <div className="flex justify-center">
                        <Button
                          onClick={handleSubmitComparator}
                          disabled={isTPPSearching}
                          className="w-[120px] bg-[#54681D] text-white hover:bg-[#95b833] rounded-[60px] mt-4"
                        >
                          {isTPPSearching ? "Loading..." : "Submit"}
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
