import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Select from "react-select"
import drugDiseaseData from "../assets/data/drugDiseaseData.json"
import { useNavigate } from "react-router-dom"

export default function TPPModal({ isOpen, onOpenChange }) {

    const navigate = useNavigate();
    const [isSearching, setIsSearching] = useState(false);
    // Drug search form state
    const [drugSearchForm, setDrugSearchForm] = useState({
        drugName: null,
        diseaseName: null,
        country: null,
        modality: null,
    })

    // Comparator search form state
    const [comparatorForm, setComparatorForm] = useState({
        drugName: "",
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

    const handleDrugFormChange = (field, selectedOption) => {
        setDrugSearchForm((prev) => ({
            ...prev,
            [field]: selectedOption,
        }))
    }

    const handleComparatorFormChange = (field, value) => {
        if (typeof value === "object" && value !== null) {
            // Handle select changes
            setComparatorForm((prev) => ({
                ...prev,
                [field]: value,
            }))
        } else {
            // Handle text input changes
            setComparatorForm((prev) => ({
                ...prev,
                [field]: value,
            }))
        }
    }

    const handleSubmitDrug = async () => {
        setIsSearching(true);
        try {
            const submitData = {
                drugName: drugSearchForm.drugName?.value || "",
                diseaseName: drugSearchForm.diseaseName?.value || "",
                country: drugSearchForm.country?.value || "",
                modality: drugSearchForm.modality?.value || "",
            }

            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/tpp-by-drug`, {
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
            setIsSearching(false);
            navigate("/tpp-by-drug", {
                state: { searchResults: data.data },
            });
            onOpenChange(false)
        } catch (error) {
            console.error("Error submitting drug search:", error)
        }
    }

    const handleSubmitComparator = async () => {
        setIsSearching(true);
        try {
            const submitData = {
                drugName: comparatorForm.drugName,
                diseaseName: comparatorForm.diseaseName?.value || "",
                routeOfAdministration: comparatorForm.routeOfAdministration?.value || "",
                modality: comparatorForm.modality?.value || "",
                safety: comparatorForm.safety,
                efficacy: comparatorForm.efficacy,
                dosageForm: comparatorForm.dosageForm,
                dosageRegime: comparatorForm.dosageRegime,
                dosageSize: comparatorForm.dosageSize,
                specialWarnings: comparatorForm.specialWarnings,
                patientEligibility: comparatorForm.patientEligibility,
                country: comparatorForm.country?.value || "",
            }

            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/tpp-by-therapies`, {
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
            setIsSearching(false);
            console.log("API Response:", data)
            onOpenChange(false)
        } catch (error) {
            console.error("Error submitting comparator search:", error)
        }
    }

    const selectStyles = {
        control: (base) => ({
            ...base,
            borderRadius: "12px",
            borderColor: "#d1d5db",
            boxShadow: "none",
            '&:hover': { borderColor: "#a6ce39" },
        }),
        option: (base, state) => ({
            ...base,
            backgroundColor: state.isFocused ? "#e0f3c4" : "white",
            color: "#333",
        }),
        menuPortal: (base) => ({ ...base, zIndex: 1050, pointerEvents: 'auto', WebkitOverflowScrolling: "touch", touchAction: 'pan-y' }),
    };

    const renderSelect = (id, label, options, value, onChange, placeholder, field) => {
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
                    value={value}
                    options={selectOptions}
                    onChange={(selectedOption) => onChange(field, selectedOption)}
                    styles={selectStyles}
                    placeholder={placeholder}
                    menuPortalTarget={document.body}
                    isClearable
                    className="react-select-container"
                    classNamePrefix="react-select"
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
                onChange={(e) => onChange(e.target.value)}
                className="w-full p-2 border border-gray-200 rounded-[12px] text-gray-800 focus:border-[#a6ce39] focus:ring-[#a6ce39] hover:border-[#a6ce39] transition duration-200 ease-in-out"
            />
        </div>
    )

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent
                className="max-w-3xl bg-[#f4f4f4] rounded-[12px] overflow-y-auto"
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
                        <DialogTitle className="text-gray-900">TPP Search</DialogTitle>
                        <p className="text-sm text-gray-600">
                            Search for Target Product Profile (TPP) information by drug or comparator therapies.
                        </p>
                    </div>
                </DialogHeader>

                <Tabs defaultValue="drug" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 bg-white rounded-[12px]">
                        <TabsTrigger
                            value="drug"
                            className="data-[state=active]:bg-[#a6ce39] data-[state=active]:text-black rounded-[12px]"
                        >
                            Search by Drug
                        </TabsTrigger>
                        <TabsTrigger
                            value="comparator"
                            className="data-[state=active]:bg-[#a6ce39] data-[state=active]:text-black rounded-[12px]"
                        >
                            Search Comparator Therapies
                        </TabsTrigger>
                    </TabsList>

                    <div className="overflow-y-auto max-h-[70vh] bg-white p-4 rounded-[12px] mt-4">
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
                                <Button
                                    onClick={handleSubmitDrug}
                                    disabled={isSearching}
                                    className="w-full bg-[#a6ce39] text-black hover:bg-[#95b833] rounded-[12px] mt-4"
                                >
                                    {isSearching ? 'Loading...' : 'Submit'}
                                </Button>
                            </div>
                        </TabsContent>

                        <TabsContent value="comparator">
                            <div className="space-y-4">
                                {renderInput("comparator-drug-name", "Drug Name", comparatorForm.drugName, (value) =>
                                    handleComparatorFormChange("drugName", value),
                                )}
                                {renderSelect(
                                    "disease-name",
                                    "Disease Name",
                                    drugDiseaseData.diseases,
                                    comparatorForm.diseaseName,
                                    handleComparatorFormChange,
                                    "Select disease...",
                                    "diseaseName",
                                )}
                                {renderSelect(
                                    "route-of-administration",
                                    "Route of Administration",
                                    drugDiseaseData.routes_of_administration,
                                    comparatorForm.routeOfAdministration,
                                    handleComparatorFormChange,
                                    "Select route...",
                                    "routeOfAdministration",
                                )}
                                {renderSelect(
                                    "modality",
                                    "Modality",
                                    drugDiseaseData.modalities,
                                    comparatorForm.modality,
                                    handleComparatorFormChange,
                                    "Select modality...",
                                    "modality",
                                )}
                                {renderInput("safety", "Safety", comparatorForm.safety, (value) =>
                                    handleComparatorFormChange("safety", value),
                                )}
                                {renderInput("efficacy", "Efficacy", comparatorForm.efficacy, (value) =>
                                    handleComparatorFormChange("efficacy", value),
                                )}
                                {renderInput("dosage-form", "Dosage Form", comparatorForm.dosageForm, (value) =>
                                    handleComparatorFormChange("dosageForm", value),
                                )}
                                {renderInput("dosage-regime", "Dosage Regime", comparatorForm.dosageRegime, (value) =>
                                    handleComparatorFormChange("dosageRegime", value),
                                )}
                                {renderInput("dosage-size", "Dosage Size", comparatorForm.dosageSize, (value) =>
                                    handleComparatorFormChange("dosageSize", value),
                                )}
                                {renderInput("special-warnings", "Special Warnings", comparatorForm.specialWarnings, (value) =>
                                    handleComparatorFormChange("specialWarnings", value),
                                )}
                                {renderInput("patient-eligibility", "Patient Eligibility", comparatorForm.patientEligibility, (value) =>
                                    handleComparatorFormChange("patientEligibility", value),
                                )}
                                {renderSelect(
                                    "comparator-country",
                                    "Country",
                                    drugDiseaseData.countries,
                                    comparatorForm.country,
                                    handleComparatorFormChange,
                                    "Select country...",
                                    "country",
                                )}
                                <Button
                                    onClick={handleSubmitComparator}
                                    disabled={isSearching}
                                    className="w-full bg-[#a6ce39] text-black hover:bg-[#95b833] rounded-[12px] mt-4"
                                >
                                    {isSearching ? 'Loading...' : 'Submit'}
                                </Button>
                            </div>
                        </TabsContent>
                    </div>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
}


