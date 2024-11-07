"use client"

import { useState } from "react"
import { Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Select from "react-select"
import outputData from '../assets/data/output.json'

export default function DiseaseOverviewModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedCountries, setSelectedCountries] = useState([])
  const [searchType, setSearchType] = useState("disease")
  const [searchValue, setSearchValue] = useState("")

  const handleSearchSubmit = () => {
    const countryType = selectedCountries.length > 0 ? selectedCountries : ["all"]
    const searchParams = {
      searchType,
      searchValue,
      countryType,
    }
    // Make API call or route change with searchParams
    console.log("Submitting Search Params:", searchParams)
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
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <DialogTitle className="text-gray-900">Disease Overview</DialogTitle>
            </div>
            <p className="text-sm text-gray-600">
              A high-level overview of the selected indication, covering disease biology, risk factors, standard treatment
              protocols, and key unmet needs. Ideal for developing a foundational understanding or refining strategic focus.
            </p>
          </div>
          <div className="relative h-40 w-full overflow-hidden rounded-[12px]">
            <img
              alt="Medical research"
              className="object-cover"
              src="/placeholder.svg?height=160&width=640"
              style={{
                aspectRatio: "640/160",
                objectFit: "cover",
              }}
            />
          </div>
        </DialogHeader>
        <Tabs defaultValue="disease" onValueChange={(value) => { setSearchType(value); setSearchValue(""); }} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white rounded-[12px]">
            <TabsTrigger value="disease" className="data-[state=active]:bg-[#a6ce39] data-[state=active]:text-black rounded-[12px]">
              Search by Disease
            </TabsTrigger>
            <TabsTrigger value="drug" className="data-[state=active]:bg-[#a6ce39] data-[state=active]:text-black rounded-[12px]">
              Search by Drug
            </TabsTrigger>
            <TabsTrigger value="symptoms" className="data-[state=active]:bg-[#a6ce39] data-[state=active]:text-black rounded-[12px]">
              Search by Symptoms
            </TabsTrigger>
          </TabsList>
          <div className="space-y-4 bg-white p-4 rounded-[12px] mt-4">
            <TabsContent value="disease">
              <div className="space-y-2">
                <Label htmlFor="disease-search" className="text-gray-700">Disease Name</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    id="disease-search"
                    list="disease-options"
                    placeholder="Type to search diseases..."
                    className="pl-8 bg-white border-gray-200 rounded-[12px] text-gray-800"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                  />
                  <datalist id="disease-options">
                    {outputData.DISEASE.map((disease) => (
                      <option key={disease} value={disease} />
                    ))}
                  </datalist>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="drug">
              <div className="space-y-2">
                <Label htmlFor="drug-search" className="text-gray-700">Drug Name</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    id="drug-search"
                    list="drug-options"
                    placeholder="Type to search drugs..."
                    className="pl-8 bg-white border-gray-200 rounded-[12px] text-gray-800"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                  />
                  <datalist id="drug-options">
                    {outputData["ACTIVE INGREDIENT"].map((drug) => (
                      <option key={drug} value={drug} />
                    ))}
                  </datalist>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="symptoms">
              <div className="space-y-2">
                <Label htmlFor="symptoms-text" className="text-gray-700">Symptoms</Label>
                <Input
                  id="symptoms-text"
                  placeholder="Enter symptoms..."
                  className="bg-white border-gray-200 rounded-[12px] text-gray-800"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                />
              </div>
            </TabsContent>
          </div>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="country" className="text-gray-700">Country</Label>
              <Select defaultValue={{ value: 'all', label: 'All Countries' }}
                isMulti
                options={[
  { value: 'all', label: 'All Countries' },
  { value: 'ie', label: 'Ireland' },
  { value: 'it', label: 'Italy' },
  { value: 'ch', label: 'Switzerland' },
  { value: 'nl', label: 'Netherlands' },
  { value: 'uk', label: 'UK' },
  { value: 'us', label: 'USA' }
]}
                classNamePrefix="react-select"
                onChange={(selectedOptions) => setSelectedCountries(selectedOptions.length > 0 ? selectedOptions.map(option => option.value) : ['all'])}
                styles={{
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
                }}
               />
            </div>
            <Button onClick={handleSearchSubmit} className="w-full bg-[#a6ce39] text-black hover:bg-[#95b833] rounded-[12px]">
              Submit
            </Button>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}


