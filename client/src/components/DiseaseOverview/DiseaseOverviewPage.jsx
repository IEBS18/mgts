"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Pill, ThermometerSnowflake, Microscope } from "lucide-react"
import Select from "react-select"
import { useNavigate } from "react-router-dom";


// --------- IMPORT TPP-RELATED DATA ---------
import inputData from "../../assets/data/drugDiseaseData.json";

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
  

export default function DiseaseOverviewPage({ onSearchSubmit }) {
  // States for metrics
  const [metrics, setMetrics] = useState({
    totalDiseases: 12500,
    activeTreatments: 4320,
    ongoingTrials: 1876,
    researchPapers: 28450,
  })

  const navigate = useNavigate();

  // Original states used for "Disease" & "Symptoms" search
  const [selectedCountries, setSelectedCountries] = useState([])
  const [searchType, setSearchType] = useState("disease");
  const [searchValue, setSearchValue] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // We unify disease & drug options from a SINGLE fetch
  const [diseaseOptions, setDiseaseOptions] = useState([])
  const [drugOptions, setDrugOptions] = useState([])
//   const [biomerchantOptions, setBiomerchantOptions] = useState([])

  // TPP-RELATED STATES
  const [isTPPSearching, setIsTPPSearching] = useState(false)

  const [drugSearchForm, setDrugSearchForm] = useState({
    drugName: null,
    diseaseName: null,
    country: null,
    modality: null,
  })

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
  })

//   const [biomerchantForm, setBiomerchantForm] = useState({
//     merchantName: null,
//     specialization: null,
//     region: null,
//   })

  const [drugDiseaseData, setDrugDiseaseData] = useState({
    drugs: inputData.drugs || [],
    diseases: [],
    modalities: [],
    countries: [],
    routes_of_administration: inputData.routes_of_administration || [],
    // biomerchants: [],
    // specializations: ["Oncology", "Neurology", "Cardiology", "Immunology", "Rare Diseases"],
    // regions: ["North America", "Europe", "Asia Pacific", "Latin America", "Middle East & Africa"],
  })

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
    } catch (error) {
      console.error("Error submitting comparator search:", error);
      setIsTPPSearching(false);
    }
  };

//   const handleSubmitBiomerchant = async () => {
//     setIsSearching(true)
//     // Simulate API call
//     setTimeout(() => {
//       setIsSearching(false)
//       alert(`Searching for biomerchant: ${biomerchantForm.merchantName}`)
//       // In a real app, navigate to results page or display results
//     }, 1000)
//   }


//   const handleBiomerchantFormChange = (field, value) => {
//     const inputValue = value && typeof value === "object" ? value.value : value
//     setBiomerchantForm((prev) => ({
//       ...prev,
//       [field]: inputValue,
//     }))
//   }



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
    }),
    menuList: (base) => ({
      ...base,
      maxHeight: "300px",
      overflowY: "auto",
    }),
  }

  // Render helpers
  const renderSelect = (id, label, options, value, onChange, placeholder, field, isDisabled = false) => {
    const selectOptions = options.map((item) => ({
      value: item,
      label: item,
    }))
    return (
      <div className="space-y-2">
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
          isDisabled={isDisabled}
          className="w-full"
        />
      </div>
    )
  }

  const renderInput = (id, label, value, onChange) => (
    <div className="space-y-2">
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
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Disease Overview</h1>
        <p className="text-gray-600 mb-6">
          A high-level overview of selected indications, covering disease biology, risk factors, standard treatment
          protocols, and key unmet needs. Ideal for developing a foundational understanding or refining strategic focus.
        </p>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold">{metrics.totalDiseases.toLocaleString()}</CardTitle>
              <CardDescription>Diseases in Database</CardDescription>
            </CardHeader>
            <CardContent>
              <FileText className="h-6 w-6 text-[#54681D]" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold">{metrics.activeTreatments.toLocaleString()}</CardTitle>
              <CardDescription>Active Treatments</CardDescription>
            </CardHeader>
            <CardContent>
              <Pill className="h-6 w-6 text-[#54681D]" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold">{metrics.ongoingTrials.toLocaleString()}</CardTitle>
              <CardDescription>Ongoing Clinical Trials</CardDescription>
            </CardHeader>
            <CardContent>
              <ThermometerSnowflake className="h-6 w-6 text-[#54681D]" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold">{metrics.researchPapers.toLocaleString()}</CardTitle>
              <CardDescription>Research Publications</CardDescription>
            </CardHeader>
            <CardContent>
              <Microscope className="h-6 w-6 text-[#54681D]" />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="disease"
          onValueChange={(value) => {
            setSearchType(value);
            setSearchValue("");
          }}
          className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 bg-white rounded-[18px] mb-6">
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
          {/* <TabsTrigger
            value="biomerchant"
            className="data-[state=active]:bg-[#54681D] data-[state=active]:text-white rounded-[12px]"
          >
            Search by Biomerchant
          </TabsTrigger> */}
        </TabsList>

        {/* Disease Tab Content */}
        <TabsContent value="disease">
          <Card>
            <CardHeader>
              <CardTitle>Search by Disease</CardTitle>
              <CardDescription>Find comprehensive information about specific diseases and conditions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
                  className="w-full"
                />
              </div>
              <div className="flex justify-center mt-6">
                <Button
                  onClick={handleSearchSubmitDisease}
                  disabled={isSearching}
                  className="w-[120px] bg-[#54681D] text-white hover:bg-[#95b833] rounded-[60px]"
                >
                  {isSearching ? "Loading..." : "Submit"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Drug Tab Content */}
        <TabsContent value="drug">
          <Card>
            <CardHeader>
              <CardTitle>Search by Drug</CardTitle>
              <CardDescription>Explore drug information and compare therapeutic options</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="tppDrug" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-white rounded-[18px] mb-6">
                  <TabsTrigger
                    value="tppDrug"
                    className="data-[state=active]:bg-[#54681D] data-[state=active]:text-white rounded-[12px]"
                  >
                    Search by Drug
                  </TabsTrigger>
                  <TabsTrigger
                    value="comparator"
                    className="data-[state=active]:bg-[#54681D] data-[state=active]:text-white rounded-[12px]"
                  >
                    Search Comparator Therapies
                  </TabsTrigger>
                </TabsList>

                {/* Drug Search Tab */}
                <TabsContent value="tppDrug">
                  <div className="space-y-4">
                    {renderSelect(
                      "drug-name",
                      "Drug Name",
                      drugDiseaseData.drugs,
                      drugSearchForm.drugName,
                      handleDrugFormChange,
                      "Select drug...",
                      "drugName",
                    )}
                    {renderSelect(
                      "disease-name",
                      "Disease Name",
                      drugDiseaseData.diseases,
                      drugSearchForm.diseaseName,
                      handleDrugFormChange,
                      "Select disease...",
                      "diseaseName",
                    )}
                    {renderSelect(
                      "country",
                      "Country",
                      drugDiseaseData.countries,
                      drugSearchForm.country,
                      handleDrugFormChange,
                      "Select country...",
                      "country",
                    )}
                    {renderSelect(
                      "modality",
                      "Modality",
                      drugDiseaseData.modalities,
                      drugSearchForm.modality,
                      handleDrugFormChange,
                      "Select modality...",
                      "modality",
                    )}
                    <div className="flex justify-center mt-6">
                      <Button
                        onClick={handleSubmitDrug}
                        disabled={isTPPSearching}
                        className="w-[120px] bg-[#54681D] text-white hover:bg-[#95b833] rounded-[60px]"
                      >
                        {isTPPSearching ? "Loading..." : "Submit"}
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                {/* Comparator Search Tab */}
                <TabsContent value="comparator">
                  <div className="space-y-4">
                    {renderInput(
                      "drug_Name",
                      "Drug Name (User's Drug)",
                      comparatorForm.drug_Name,
                      handleComparatorFormChange,
                    )}
                    {renderSelect(
                      "diseaseName",
                      "Disease Name",
                      // drugDiseaseData.diseases,
                      inputData.diseases || [],
                      comparatorForm.diseaseName,
                      handleComparatorFormChange,
                      "Select disease...",
                      "diseaseName",
                    )}
                    {renderSelect(
                      "routeOfAdministration",
                      "Route of Administration",
                      // drugDiseaseData.routes_of_administration,
                      inputData.routes_of_administration || [],
                      comparatorForm.routeOfAdministration,
                      handleComparatorFormChange,
                      "Select route...",
                      "routeOfAdministration",
                    )}
                    {renderSelect(
                      "modality",
                      "Modality",
                      // drugDiseaseData.modalities,
                      inputData.modalities || [],
                      comparatorForm.modality,
                      handleComparatorFormChange,
                      "Select modality...",
                      "modality",
                    )}
                    {renderInput("safety", "Safety", comparatorForm.safety, handleComparatorFormChange)}
                    {renderInput("efficacy", "Efficacy", comparatorForm.efficacy, handleComparatorFormChange)}
                    {renderInput("dosageForm", "Dosage Form", comparatorForm.dosageForm, handleComparatorFormChange)}
                    {renderInput(
                      "dosageRegime",
                      "Dosage Regime",
                      comparatorForm.dosageRegime,
                      handleComparatorFormChange,
                    )}
                    {renderInput("dosageSize", "Dosage Size", comparatorForm.dosageSize, handleComparatorFormChange)}
                    {renderInput(
                      "specialWarnings",
                      "Special Warnings",
                      comparatorForm.specialWarnings,
                      handleComparatorFormChange,
                    )}
                    {renderInput(
                      "patientEligibility",
                      "Patient Eligibility",
                      comparatorForm.patientEligibility,
                      handleComparatorFormChange,
                    )}
                    {renderSelect(
                      "country",
                      "Country",
                      drugDiseaseData.countries,
                      comparatorForm.country,
                      handleComparatorFormChange,
                      "Select country...",
                      "country",
                    )}
                    <div className="flex justify-center mt-6">
                      <Button
                        onClick={handleSubmitComparator}
                        disabled={isTPPSearching}
                        className="w-[120px] bg-[#54681D] text-white hover:bg-[#95b833] rounded-[60px]"
                      >
                        {isTPPSearching ? "Loading..." : "Submit"}
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Symptoms Tab Content */}
        <TabsContent value="symptoms">
          <Card>
            <CardHeader>
              <CardTitle>Search by Symptoms</CardTitle>
              <CardDescription>Identify potential conditions based on symptoms</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
              <div className="flex justify-center mt-6">
                <Button
                  onClick={handleSearchSubmitSymptoms}
                  disabled={isSearching}
                  className="w-[120px] bg-[#54681D] text-white hover:bg-[#95b833] rounded-[60px]"
                >
                  {isSearching ? "Loading..." : "Submit"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Biomerchant Tab Content (New) */}
        {/* <TabsContent value="biomerchant">
          <Card>
            <CardHeader>
              <CardTitle>Search by Biomerchant</CardTitle>
              <CardDescription>
                Find information about biotech companies and their therapeutic focus areas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                {renderSelect(
                  "merchant-name",
                  "Biomerchant Name",
                  drugDiseaseData.biomerchants,
                  biomerchantForm.merchantName,
                  handleBiomerchantFormChange,
                  "Select biomerchant...",
                  "merchantName",
                )}
                {renderSelect(
                  "specialization",
                  "Therapeutic Area",
                  drugDiseaseData.specializations,
                  biomerchantForm.specialization,
                  handleBiomerchantFormChange,
                  "Select therapeutic area...",
                  "specialization",
                )}
                {renderSelect(
                  "region",
                  "Region",
                  drugDiseaseData.regions,
                  biomerchantForm.region,
                  handleBiomerchantFormChange,
                  "Select region...",
                  "region",
                )}
                <div className="flex justify-center mt-6">
                  <Button
                    onClick={handleSubmitBiomerchant}
                    disabled={isSearching}
                    className="w-[120px] bg-[#54681D] text-white hover:bg-[#95b833] rounded-[60px]"
                  >
                    {isSearching ? "Loading..." : "Submit"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent> */}
      </Tabs>
    </div>
  )
}
