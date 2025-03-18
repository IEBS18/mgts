import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Select from "react-select"
import { useNavigate } from "react-router-dom"
import TPPImg from '../assets/dashboard/Epidemiology.png'

import inputData from "../assets/data/drugDiseaseData.json"

const fetchDrugInfo = async (drugName) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/drug-info`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ drugName }),
    })
    if (!response.ok) {
      throw new Error("Network response was not ok")
    }
    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error fetching disease and modality:", error)
    return null
  }
}

const fetchDiseaseInfo = async (diseaseName) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/disease-info`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ diseaseName }),
    })
    if (!response.ok) {
      throw new Error("Network response was not ok")
    }
    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error fetching disease info:", error)
    return null
  }
}

export default function TPPModal({ isOpen, onOpenChange }) {
  const navigate = useNavigate()
  const [isSearching, setIsSearching] = useState(false)
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

  const [drugDiseaseData, setDrugDiseaseData] = useState({
    drugs: inputData.drugs,
    diseases: [],
    modalities: [],
    countries: inputData.countries,
    routes_of_administration: [],
  })

  const handleDrugFormChange = async (field, value) => {
    console.log("handleDrugFormChange called:", field, value)
    const inputValue = value && typeof value === "object" ? value.value : value
    setDrugSearchForm((prev) => ({
      ...prev,
      [field]: inputValue,
    }))

    if (field === "drugName" && inputValue) {
      const data = await fetchDrugInfo(inputValue)
      if (data) {
        setDrugSearchForm((prev) => ({
          ...prev,
          diseaseName: null,
          modality: null,
        }))
        setDrugDiseaseData((prev) => ({
          ...prev,
          diseases: data.diseases,
          modalities: data.modalities,
        }))
      }
    }
  }

  const handleComparatorFormChange = async (field, value) => {
    console.log("handleComparatorFormChange called:", field, value)

    // Handle both object (Select) and string (Input) values
    const inputValue = value && typeof value === "object" ? value.value : value

    setComparatorForm((prev) => {
      const newState = { ...prev, [field]: inputValue }
      console.log("New comparatorForm state:", newState)
      return newState
    })

    // // Fetch disease info if the disease name changes
    // if (field === "diseaseName" && value) {
    //   const data = await fetchDiseaseInfo(inputValue)
    //   if (data) {
    //     setDrugDiseaseData((prev) => ({
    //       ...prev,
    //       routes_of_administration: data.routes_of_administration,
    //       modalities: data.modalities,
    //     }))
    //     setComparatorForm((prev) => ({
    //       ...prev,
    //       routeOfAdministration: null,
    //       modality: null,
    //     }))
    //   }
    // }
  }

  const handleSubmitDrug = async () => {
    setIsSearching(true)
    try {
      const submitData = {
        drugName: drugSearchForm.drugName || "",
        diseaseName: drugSearchForm.diseaseName || "",
        country: drugSearchForm.country || "",
        modality: drugSearchForm.modality || "",
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/tpp-by-drug`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      })
      if (!response.ok) {
        throw new Error("Network response was not ok")
      }
      const data = await response.json()
      setIsSearching(false)
      console.log(data.data);
      navigate("/tpp-by-drug", {
        state: { searchResults: data.data, drug: drugSearchForm.drugName },
      })
      onOpenChange(false)
    } catch (error) {
      console.error("Error submitting drug search:", error)
      setIsSearching(false)
    }
  }

  const handleSubmitComparator = async () => {
    setIsSearching(true);
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

      const response = await fetch(`${import.meta.env.VITE_API_URL}/tpp-by-therapies`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();

      // Extract all possible keys from API response to ensure consistency
      const allKeys = new Set(data.data.flatMap(Object.keys));

      // Transform submitData into the required format with missing fields set to "N/A"
      const transformedItem = {};
      allKeys.forEach((key) => {
        transformedItem[key] = "N/A"; // Default value
      });

      transformedItem["Disease"] = submitData.diseaseName;
      transformedItem["Route Of Administration"] = submitData.routeOfAdministration;
      transformedItem["Modality"] = submitData.modality;
      transformedItem["Safety"] = submitData.safety;
      transformedItem["Efficacy"] = submitData.efficacy;
      transformedItem["Dosage Form"] = submitData.dosageForm;
      transformedItem["Dosage Regime"] = submitData.dosageRegime;
      transformedItem["Dosage Size"] = submitData.dosageSize;
      transformedItem["Special Warnings"] = submitData.specialWarnings;
      transformedItem["Patient Eligibility"] = submitData.patientEligibility;
      transformedItem["Country"] = submitData.country;
      transformedItem["Drug"] = submitData.drug_Name;

      // Append transformed item to existing data
      const updatedData = [transformedItem, ...data.data];

      setIsSearching(false);
      navigate("/tpp-by-drug", {
        state: { searchResults: updatedData, drug: submitData.drug_Name },
      });

      onOpenChange(false);
    } catch (error) {
      console.error("Error submitting comparator search:", error);
      setIsSearching(false);
    }
  };


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
      touchAction: "pan-y",
    }),
  }

  const renderSelect = (id, label, options, value, onChange, placeholder, field, isDisabled = false) => {
    const selectOptions = options.map((item) => ({
      value: item,
      label: item,
    }))

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
          className="react-select-container"
          classNamePrefix="react-select"
          isDisabled={isDisabled}
        />
      </div>
    )
  }

  const renderInput = (id, label, value, onChange) => (
    <div>
      <Label htmlFor={id} className="text-gray-700">
        {label}
      </Label>
      <Input
        id={id}
        value={value}
        onChange={(e) => {
          console.log("Input changed:", e.target.value)
          onChange(id, e.target.value)
        }}
        className="w-full p-2 border border-gray-200 rounded-[12px] text-gray-800 focus:border-[#a6ce39] focus:ring-[#a6ce39] hover:border-[#a6ce39] transition duration-200 ease-in-out"
      />
    </div>
  )

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
        {/* <DialogHeader className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <DialogTitle className="flex flex-row items-center justify-cente text-white rounded-lg">
                <div className="flex items-center justify-center w-12 h-12 border-2 border-white rounded-full mr-4">
                  <img
                    src={TPPImg}
                    alt="Disease icon"
                    className="w-6 h-6 object-contain"
                  />
                </div>
                <p className="text-lg font-medium">Target Product Profile</p>
              </DialogTitle>
            </div>
            <p className="text-sm text-white">
              Search for Target Product Profile (TPP) information by drug or comparator therapies.
            </p>
          </div>
        </DialogHeader> */}

        <Tabs defaultValue="drug" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white rounded-[18px]">
            <TabsTrigger
              value="drug"
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

          <div className="overflow-y-auto max-h-[70vh] bg-white p-4 rounded-[20px] mt-4">
            <TabsContent value="drug">
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
                  !drugSearchForm.drugName,
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
                  !drugSearchForm.drugName,
                )}
                <div className="flex justify-center">
                <Button
                  onClick={handleSubmitDrug}
                  disabled={isSearching}
                  className="w-[120px] bg-[#54681D] text-white hover:bg-[#95b833] rounded-[60px] mt-4"
                >
                  {isSearching ? "Loading..." : "Submit"}
                </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="comparator">
              <div className="space-y-4">
                {renderInput("drug_Name", "Drug Name(User's Drug)", comparatorForm.drug_Name, handleComparatorFormChange)}
                {renderSelect(
                  "diseaseName",
                  "Disease Name",
                  inputData.diseases,
                  comparatorForm.diseaseName,
                  handleComparatorFormChange,
                  "Select disease...",
                  "diseaseName",
                )}
                {renderSelect(
                  "routeOfAdministration",
                  "Route of Administration",
                  inputData.routes_of_administration,
                  comparatorForm.routeOfAdministration,
                  handleComparatorFormChange,
                  "Select route...",
                  "routeOfAdministration",
                  !comparatorForm.diseaseName,
                )}
                {renderSelect(
                  "modality",
                  "Modality",
                  inputData.modalities,
                  comparatorForm.modality,
                  handleComparatorFormChange,
                  "Select modality...",
                  "modality",
                  !comparatorForm.diseaseName,
                )}
                {renderInput("safety", "Safety", comparatorForm.safety, handleComparatorFormChange)}
                {renderInput("efficacy", "Efficacy", comparatorForm.efficacy, handleComparatorFormChange)}
                {renderInput("dosageForm", "Dosage Form", comparatorForm.dosageForm, handleComparatorFormChange)}
                {renderInput("dosageRegime", "Dosage Regime", comparatorForm.dosageRegime, handleComparatorFormChange)}
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
                <div className="flex justify-center">
                <Button
                  onClick={handleSubmitComparator}
                  disabled={isSearching}
                  className="w-[120px] bg-[#54681D] text-white hover:bg-[#95b833] rounded-[60px] mt-4"
                >
                  {isSearching ? "Loading..." : "Submit"}
                </Button>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

