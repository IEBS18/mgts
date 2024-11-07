// "use client"

// import { useState } from "react"
// import { Search, X } from "lucide-react"
// import { Button } from "@/components/ui/button"
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import '../assets/data/output.json'

// export default function DiseaseOverviewModal() {
//   const [isOpen, setIsOpen] = useState(false)

// return (
//     <Dialog open={isOpen} onOpenChange={setIsOpen}>
//         <DialogTrigger asChild>
//             <Button className="w-full md:w-auto bg-[#a6ce39] text-black rounded-[12px] hover:bg-[#95b833]">
//                 Get Started
//             </Button>
//         </DialogTrigger>
//         <DialogContent className="max-w-3xl bg-[#f4f4f4] rounded-[12px]">
//             <DialogHeader className="space-y-4">
//                 <div className="flex items-center justify-between text-gray-600">
//                 </div>
//                 <div className="space-y-2">
//                     <div className="flex items-center gap-2">
//                         <DialogTitle className="text-gray-900">Disease Overview</DialogTitle>
//                     </div>
//                     <p className="text-sm text-gray-600">
//                         A high-level overview of the selected indication, covering disease biology, risk factors, standard treatment
//                         protocols, and key unmet needs. Ideal for developing a foundational understanding or refining strategic focus.
//                     </p>
//                 </div>
//                 <div className="relative h-40 w-full overflow-hidden rounded-[12px]">
//                     <img
//                         alt="Medical research"
//                         className="object-cover"
//                         src="/placeholder.svg?height=160&width=640"
//                         style={{
//                             aspectRatio: "640/160",
//                             objectFit: "cover",
//                         }}
//                     />
//                 </div>
//             </DialogHeader>
//             <Tabs defaultValue="disease" className="w-full">
//                 <TabsList className="grid w-full grid-cols-3 bg-white rounded-[12px]">
//                     <TabsTrigger value="disease" className="data-[state=active]:bg-[#a6ce39] data-[state=active]:text-black rounded-[12px]">
//                         Search by Disease
//                     </TabsTrigger>
//                     <TabsTrigger value="drug" className="data-[state=active]:bg-[#a6ce39] data-[state=active]:text-black rounded-[12px]">
//                         Search by Drug
//                     </TabsTrigger>
//                     <TabsTrigger value="symptoms" className="data-[state=active]:bg-[#a6ce39] data-[state=active]:text-black rounded-[12px]">
//                         Search by Symptoms
//                     </TabsTrigger>
//                 </TabsList>
//                 <TabsContent value="disease" className="space-y-4 bg-white p-4 rounded-[12px] mt-4">
//                     <div className="grid gap-4">
//                         <div className="space-y-2">
//                             <Label htmlFor="disease-search" className="text-gray-700">Disease Name</Label>
//                             <div className="relative">
//                                 <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500 " />
//                                 <Input
//                                     id="disease-search"
//                                     placeholder="Type to search diseases..."
//                                     className="pl-8 bg-white border-gray-200 rounded-[12px]"
//                                 />
//                             </div>
//                         </div>
//                         <div className="space-y-2">
//                             <Label htmlFor="country" className="text-gray-700">Country</Label>
//                             <Select>
//                                 <SelectTrigger id="country" className="bg-white border-gray-200 rounded-[12px]">
//                                     <SelectValue placeholder="Select country" />
//                                 </SelectTrigger>
//                                 <SelectContent className="bg-white rounded-[12px]">
//                                     <SelectItem value="us">United States</SelectItem>
//                                     <SelectItem value="uk">United Kingdom</SelectItem>
//                                     <SelectItem value="nl">Netherlands</SelectItem>
//                                     <SelectItem value="ch">Switzerland</SelectItem>
//                                     <SelectItem value="it">Italy</SelectItem>
//                                     <SelectItem value="ie">Ireland</SelectItem>
//                                 </SelectContent>
//                             </Select>
//                         </div>
//                         <Button className="w-full bg-[#a6ce39] text-black hover:bg-[#95b833] rounded-[12px]">
//                             Search
//                         </Button>
//                     </div>
//                 </TabsContent>
//                 <TabsContent value="drug" className="space-y-4 bg-white p-4 rounded-[12px] mt-4">
//                     <div className="grid gap-4">
//                         <div className="space-y-2">
//                             <Label htmlFor="drug-search" className="text-gray-700">Drug Name</Label>
//                             <div className="relative">
//                                 <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
//                                 <Input
//                                     id="drug-search"
//                                     placeholder="Type to search drugs..."
//                                     className="pl-8 bg-white border-gray-200 rounded-[12px]"
//                                 />
//                             </div>
//                         </div>
//                         <div className="space-y-2">
//                             <Label htmlFor="country" className="text-gray-700">Country</Label>
//                             <Select>
//                                 <SelectTrigger id="country" className="bg-white border-gray-200 rounded-[12px]">
//                                     <SelectValue placeholder="Select country" />
//                                 </SelectTrigger>
//                                 <SelectContent className="bg-white rounded-[12px]">
//                                     <SelectItem value="us">United States</SelectItem>
//                                     <SelectItem value="uk">United Kingdom</SelectItem>
//                                     <SelectItem value="ca">Canada</SelectItem>
//                                     <SelectItem value="au">Australia</SelectItem>
//                                 </SelectContent>
//                             </Select>
//                         </div>
//                         <Button className="w-full bg-[#a6ce39] text-black hover:bg-[#95b833] rounded-[12px]">
//                             Search
//                         </Button>
//                     </div>
//                 </TabsContent>
//                 <TabsContent value="symptoms" className="space-y-4 bg-white p-4 rounded-[12px] mt-4">
//                     <div className="grid gap-4">
//                         <div className="space-y-2">
//                             <Label htmlFor="symptoms-search" className="text-gray-700">Symptoms</Label>
//                             <div className="relative">
//                                 <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
//                                 <Input
//                                     id="symptoms-search"
//                                     placeholder="Type to search symptoms..."
//                                     className="pl-8 bg-white border-gray-200 rounded-[12px]"
//                                 />
//                             </div>
//                         </div>
//                         <div className="space-y-2">
//                             <Label htmlFor="country" className="text-gray-700">Country</Label>
//                             <Select>
//                                 <SelectTrigger id="country" className="bg-white border-gray-200 rounded-[12px]">
//                                     <SelectValue placeholder="Select country" />
//                                 </SelectTrigger>
//                                 <SelectContent className="bg-white rounded-[12px]">
//                                     <SelectItem value="us">United States</SelectItem>
//                                     <SelectItem value="uk">United Kingdom</SelectItem>
//                                     <SelectItem value="ca">Canada</SelectItem>
//                                     <SelectItem value="au">Australia</SelectItem>
//                                 </SelectContent>
//                             </Select>
//                         </div>
//                         <Button className="w-full bg-[#a6ce39] text-black hover:bg-[#95b833] rounded-[12px]">
//                             Search
//                         </Button>
//                     </div>
//                 </TabsContent>
//             </Tabs>
//         </DialogContent>
//     </Dialog>
// )
// }

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
        <Tabs defaultValue="disease" onValueChange={(value) => setSearchType(value)} className="w-full">
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
                    className="pl-8 bg-white border-gray-200 rounded-[12px]"
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
                    className="pl-8 bg-white border-gray-200 rounded-[12px]"
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
                  className="bg-white border-gray-200 rounded-[12px]"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                />
              </div>
            </TabsContent>
          </div>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="country" className="text-gray-700">Country</Label>
              <Select
                isMulti
                options={[
                  { value: 'us', label: 'United States' },
                  { value: 'uk', label: 'United Kingdom' },
                  { value: 'ca', label: 'Canada' },
                  { value: 'au', label: 'Australia' },
                  { value: 'all', label: 'All Countries' },
                ]}
                classNamePrefix="react-select"
                onChange={(selectedOptions) => setSelectedCountries(selectedOptions.map(option => option.value))}
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
