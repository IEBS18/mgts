"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, TrendingUp, Calculator, BarChart4 } from "lucide-react"
import Select from "react-select"
import outputData from "../../assets/data/priceprediction.json"
import { useNavigate } from "react-router-dom"

export default function PricePredictionPage() {
  // States for metrics
  const [metrics, setMetrics] = useState({
    averageDrugCost: 12500, // dollars
    costGrowthRate: 7.8, // percentage
    pricingModels: 5,
    predictiveAccuracy: 92, // percentage
  })
  const navigate = useNavigate();
  // States for form
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    disease: null,
    country: null,
    modality: null,
    subModality: null,
    qualityOfLife: "",
    mortality: "",
    morbidity: "",
    safety: "",
    efficacy: "",
  })

  const handleInputChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async () => {
    const { disease_name, country, quality_of_life, mortality, modality, subModality, morbidity, safety, efficacy } =
      formData

    // Ensure all fields are filled
    if (
      !disease_name ||
      !country ||
      !quality_of_life ||
      !mortality ||
      !modality ||
      !morbidity ||
      !safety ||
      !efficacy
    ) {
      alert("Please fill in all fields.")
      return
    }

    // Create the payload with only the required values
    const payload = {
      disease_name: disease_name.value,
      country: country.value,
      quality_of_life,
      mortality,
      modality: modality.value,
      subModality: subModality?.value,
      morbidity,
      safety,
      efficacy,
    }

    setIsLoading(true)
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/price-prediction`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) throw new Error("Failed to predict cost")

      const data = await response.json()
      console.log(data)
      navigate("/price-prediction", { state: { data, payload } })
      // alert(`Predicted cost: ${(data.result["average_price"]).toFixed(2)}`);
    } catch (error) {
      console.error(error)
      alert("An error occurred during prediction.")
    } finally {
      setIsLoading(false)
    }
  }




  // Select styles
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Predict Drug Cost</h1>
        <p className="text-gray-600 mb-6">
          Predicts drug prices based on disease factors, treatment type, quality of life, mortality data and other
          factors.
        </p>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold">${metrics.averageDrugCost.toLocaleString()}</CardTitle>
              <CardDescription>Average Annual Drug Cost</CardDescription>
            </CardHeader>
            <CardContent>
              <DollarSign className="h-6 w-6 text-[#54681D]" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold">{metrics.costGrowthRate}%</CardTitle>
              <CardDescription>Annual Cost Growth Rate</CardDescription>
            </CardHeader>
            <CardContent>
              <TrendingUp className="h-6 w-6 text-[#54681D]" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold">{metrics.pricingModels}</CardTitle>
              <CardDescription>Pricing Models</CardDescription>
            </CardHeader>
            <CardContent>
              <Calculator className="h-6 w-6 text-[#54681D]" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold">{metrics.predictiveAccuracy}%</CardTitle>
              <CardDescription>Predictive Accuracy</CardDescription>
            </CardHeader>
            <CardContent>
              <BarChart4 className="h-6 w-6 text-[#54681D]" />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Prediction Form */}
      <Card>
        <CardHeader>
          <CardTitle>Drug Cost Prediction</CardTitle>
          <CardDescription>Enter the parameters below to predict drug cost</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Disease */}
            <div className="space-y-2">
              <Label htmlFor="disease-select" className="text-gray-700">
                Select Disease
              </Label>
              <Select
                id="disease-select"
                options={outputData.DISEASE.map((disease) => ({ value: disease, label: disease }))}
                              value={formData.disease_name}
                              onChange={(option) => handleInputChange("disease_name", option)}
                styles={selectStyles}
                placeholder="Select a Disease"
                menuPortalTarget={document.body}
                className="w-full"
              />
            </div>

            {/* Country */}
            <div className="space-y-2">
              <Label htmlFor="country-select" className="text-gray-700">
                Select Country
              </Label>
              <Select
              id="country"
              options={[
                // { value: 'All Countries', label: 'All Countries' },
                { value: "Ireland", label: "Ireland" },
                { value: "Italy", label: "Italy" },
                { value: "Switzerland", label: "Switzerland" },
                { value: "Netherlands", label: "Netherlands" },
                { value: "UK", label: "UK" },
                { value: "USA", label: "USA" },
              ]}
              value={formData.country}
              onChange={(option) => handleInputChange("country", option)}
              placeholder="Select a Country"
              className="w-full"
              menuPortalTarget={document.body}
              styles={selectStyles}
            />
            </div>

            {/* Modality */}
            <div className="space-y-2">
              <Label htmlFor="modality-select" className="text-gray-700">
                Select Modality
              </Label>
            <Select
              id="modality"
              options={[
                // { value: 'All Countries', label: 'All Countries' },
                { value: "Small Molecules", label: "Small Molecules" },
                { value: "Biologics", label: "Biologics" },
              ]}
              value={formData.modality}
              onChange={(option) => handleInputChange("modality", option)}
              placeholder="Select a Modality"
              className="w-full"
              menuPortalTarget={document.body}
              styles={selectStyles}
            />
            </div>

            {/* Sub Modality */}
            <div className="space-y-2">
              <Label htmlFor="sub-modality-select" className="text-gray-700">
                Sub Modality
              </Label>
            <Select
              id="subModality"
              options={[
                { value: "Antipsychotics", label: "Antipsychotics" },
                { value: "Antineoplastic Agents", label: "Antineoplastic Agents" },
                { value: "Vaccines", label: "Vaccines" },
                { value: "Blood Products", label: "Blood Products" },
                { value: "Bone Modifiers", label: "Bone Modifiers" },
                { value: "Antihypertensives", label: "Antihypertensives" },
                { value: "Monoclonal Antibodies (mAbs)", label: "Monoclonal Antibodies (mAbs)" },
                { value: "Immunosuppressants", label: "Immunosuppressants" },
                { value: "Antihistamines", label: "Antihistamines" },
                { value: "Enzyme Replacement Therapy", label: "Enzyme Replacement Therapy" },
                { value: "Biosimilars", label: "Biosimilars" },
                { value: "Immunomodulators", label: "Immunomodulators" },
                { value: "Nasal Corticosteroids", label: "Nasal Corticosteroids" },
                { value: "Interferons", label: "Interferons" },
                { value: "Hormones", label: "Hormones" },
                { value: "Urinary Tract Agents", label: "Urinary Tract Agents" },
                { value: "Antidepressants", label: "Antidepressants" },
                { value: "Iron Chelators", label: "Iron Chelators" },
                { value: "Antiepileptics", label: "Antiepileptics" },
                { value: "Oncolytic Virus Therapy", label: "Oncolytic Virus Therapy" },
                { value: "Antibody-Drug Conjugates (ADCs)", label: "Antibody-Drug Conjugates (ADCs)" },
                { value: "Antithrombotic Agents", label: "Antithrombotic Agents" },
                { value: "Antifungal Agents", label: "Antifungal Agents" },
                { value: "Weight Management", label: "Weight Management" },
                { value: "Antiviral", label: "Antiviral" },
                { value: "Hormonal Agents", label: "Hormonal Agents" },
                { value: "Sleep Aids", label: "Sleep Aids" },
                { value: "Alzheimer's Disease Treatments", label: "Alzheimer's Disease Treatments" },
                { value: "Complement Inhibitors", label: "Complement Inhibitors" },
                { value: "Dermatological Agents", label: "Dermatological Agents" },
                { value: "Phosphate Binders", label: "Phosphate Binders" },
                { value: "Potassium Binders", label: "Potassium Binders" },
                { value: "Photodynamic Therapy", label: "Photodynamic Therapy" },
                { value: "Long-acting Antipsychotics", label: "Long-acting Antipsychotics" },
                { value: "Antimicrobials", label: "Antimicrobials" },
                { value: "Diagnostic Agents", label: "Diagnostic Agents" },
                { value: "Radiopharmaceuticals", label: "Radiopharmaceuticals" },
              ]}
              value={formData.subModality}
              onChange={(option) => handleInputChange("subModality", option)}
              placeholder="Select a Sub Modality"
              className="w-full"
              menuPortalTarget={document.body}
              styles={selectStyles}
              isDisabled={formData.modality?.value !== "Biologics"}
            />
            </div>

            {/* Quality of Life */}
            <div className="space-y-2">
              <Label htmlFor="quality-of-life" className="text-gray-700">
                Quality of Life
              </Label>
              <Input
                id="quality-of-life"
                type="text"
                placeholder="e.g., Moderate impact due to mobility issues"
                value={formData.qualityOfLife}
                onChange={(e) => handleInputChange("qualityOfLife", e.target.value)}
                className="w-full p-2 border border-gray-200 rounded-[12px] text-gray-800 focus:border-[#a6ce39] focus:ring-[#a6ce39] hover:border-[#a6ce39] transition duration-200 ease-in-out"
              />
            </div>

            {/* Mortality */}
            <div className="space-y-2">
              <Label htmlFor="mortality" className="text-gray-700">
                Mortality (%)
              </Label>
              <Input
                id="mortality"
                type="number"
                placeholder="e.g., 20"
                value={formData.mortality}
                onChange={(e) => handleInputChange("mortality", e.target.value)}
                className="w-full p-2 border border-gray-200 rounded-[12px] text-gray-800 focus:border-[#a6ce39] focus:ring-[#a6ce39] hover:border-[#a6ce39] transition duration-200 ease-in-out"
              />
            </div>

            {/* Morbidity */}
            <div className="space-y-2">
              <Label htmlFor="morbidity" className="text-gray-700">
                Morbidity (%)
              </Label>
              <Input
                id="morbidity"
                type="number"
                placeholder="e.g., 8"
                value={formData.morbidity}
                onChange={(e) => handleInputChange("morbidity", e.target.value)}
                className="w-full p-2 border border-gray-200 rounded-[12px] text-gray-800 focus:border-[#a6ce39] focus:ring-[#a6ce39] hover:border-[#a6ce39] transition duration-200 ease-in-out"
              />
            </div>

            {/* Safety */}
            <div className="space-y-2">
              <Label htmlFor="safety" className="text-gray-700">
                Safety
              </Label>
              <Input
                id="safety"
                type="text"
                placeholder="e.g., Generally Safe"
                value={formData.safety}
                onChange={(e) => handleInputChange("safety", e.target.value)}
                className="w-full p-2 border border-gray-200 rounded-[12px] text-gray-800 focus:border-[#a6ce39] focus:ring-[#a6ce39] hover:border-[#a6ce39] transition duration-200 ease-in-out"
              />
            </div>

            {/* Efficacy */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="efficacy" className="text-gray-700">
                Efficacy
              </Label>
              <Input
                id="efficacy"
                type="text"
                placeholder="e.g., Moderate for pain relief"
                value={formData.efficacy}
                onChange={(e) => handleInputChange("efficacy", e.target.value)}
                className="w-full p-2 border border-gray-200 rounded-[12px] text-gray-800 focus:border-[#a6ce39] focus:ring-[#a6ce39] hover:border-[#a6ce39] transition duration-200 ease-in-out"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center mt-8">
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="px-8 py-2 bg-[#54681D] text-white hover:bg-[#95b833] rounded-[60px]"
            >
              {isLoading ? "Predicting..." : "Predict Cost"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
