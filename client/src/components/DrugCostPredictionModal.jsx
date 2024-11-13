"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import outputData from '../assets/data/output.json'
import Select from "react-select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function DrugCostPredictionModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [drugData, setDrugData] = useState({
    drug_name: "",
    mortality: "",
    morbidity: "",
    quality_of_life: "",
    Total_Adverse_Events: "",
    Adverse_Event_Discontinuation: "",
    Serious_Adverse_Events: ""
  })
  const [loading, setLoading] = useState(false)
  const [selectedDrug, setSelectedDrug] = useState(null)
  const [drugOptions, setDrugOptions] = useState([
    { value: "drug1", label: "Drug 1" },
    { value: "drug2", label: "Drug 2" },
    // Add more drugs here
  ])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setDrugData((prevData) => ({ ...prevData, [name]: value }))
  }

  const handlePredict = async () => {
    setLoading(true)
    // Perform prediction logic here
    setTimeout(() => {
      setLoading(false)
      alert("Cost predicted successfully")
    }, 2000)
  }

  const handleDrugChange = (selectedOption) => {
    setSelectedDrug(selectedOption)
    setDrugData((prevData) => ({ ...prevData, drug_name: selectedOption?.label }))
  }

  const handleVisualize = async () => {
    setLoading(true)
    // Perform visualization logic here
    setTimeout(() => {
      setLoading(false)
      alert("Cost visualization complete")
    }, 2000)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full md:w-auto bg-[#a6ce39] text-black rounded-[12px] hover:bg-[#95b833]">
          Get Started
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl bg-[#f4f4f4] rounded-[12px]">
        <DialogHeader className="space-y-4">
          <DialogTitle className="text-gray-900">Predict & Visualize Drug Cost</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="predict" onValueChange={(value) => setIsOpen(true)} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white rounded-[12px]">
            <TabsTrigger value="predict" className="data-[state=active]:bg-[#a6ce39] data-[state=active]:text-black rounded-[12px]">
              Predict Cost
            </TabsTrigger>
            <TabsTrigger value="visualize" className="data-[state=active]:bg-[#a6ce39] data-[state=active]:text-black rounded-[12px]">
              Visualize Cost Trend
            </TabsTrigger>
          </TabsList>

          <TabsContent value="predict" className="space-y-4 bg-white p-4 rounded-[12px] mt-4">
            <div className="space-y-2">
              <Label htmlFor="drug_name">Select Drug</Label>
              <Select
                id="drug_name"
                options={outputData["ACTIVE INGREDIENT"].map(drug => ({ value: drug, label: drug }))}
                value={selectedDrug}
                onChange={handleDrugChange}
                placeholder="Select a Drug"
                className="w-full"
              />
            </div>
            <Button onClick={handlePredict} className="w-full" disabled={loading}>
              {loading ? 'Predicting...' : 'Predict Cost'}
            </Button>
          </TabsContent>

          <TabsContent value="visualize" className="space-y-4 bg-white p-4 rounded-[12px] mt-4">
          <Label htmlFor="drug_name">Select Drug</Label>
            <Select
              options={outputData["ACTIVE INGREDIENT"].map(drug => ({ value: drug, label: drug }))}
              value={selectedDrug}
              onChange={handleDrugChange}
              placeholder="Select a Drug"
              className="flex-grow"
            />
            {/* <p className="text-sm text-gray-500">
              Predicted cost for Drug {selectedDrug?.label || "[Drug Name]"} for 10 years from the latest patent date
            </p> */}
            <Button
              onClick={handleVisualize}
              className="w-full py-4 text-lg"
              disabled={loading}
            >
              {loading ? "Visualizing..." : "Visualize"}
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
