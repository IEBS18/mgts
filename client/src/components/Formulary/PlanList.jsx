// "use client"

// import React, { useState } from "react"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Input } from "@/components/ui/input"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

// export function PlanList({ statePlans, usPlans, onSelect, selectedPlans }) {
//   const [searchTerm, setSearchTerm] = useState("")
//   const [currentPage, setCurrentPage] = useState(1)
//   const [selectedState, setSelectedState] = useState("All States") // Default to "All States"
//   const [selectedFilter, setSelectedFilter] = useState("managed_medicaid")
//   const plansPerPage = 12

//   const filteredPlans =
//     selectedState === "All States"
//       ? usPlans["all states"]?.[selectedFilter]?.filter((plan) =>
//           plan.name.toLowerCase().includes(searchTerm.toLowerCase())
//         ) || []
//       : statePlans[selectedState]?.[selectedFilter]?.filter((plan) =>
//           plan.name.toLowerCase().includes(searchTerm.toLowerCase())
//         ) || []

//   const paginatedPlans = filteredPlans.slice(
//     (currentPage - 1) * plansPerPage,
//     currentPage * plansPerPage
//   )

//   const totalPages = Math.ceil(filteredPlans.length / plansPerPage)

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle>Plan List</CardTitle>
//         <CardDescription>Select plans to include in your list.</CardDescription>
//       </CardHeader>
//       <CardContent>
//         <div className="space-y-4">
//           <div className="flex gap-4">
//             {/* State Filter Dropdown */}
//             <Select onValueChange={setSelectedState} value={selectedState}>
//               <SelectTrigger className="w-[300px] bg-white">
//                 <SelectValue placeholder="All States" />
//               </SelectTrigger>
//               <SelectContent className="bg-gray-100">
//                 <SelectItem value="All States">All States</SelectItem>
//                 {Object.keys(statePlans).map((state) => (
//                   <SelectItem key={state} value={state}>
//                     {state}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>

//             {/* Search Bar */}
//             <Input
//               placeholder="Search plans..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="max-w-xs"
//             />
//           </div>

//           {/* Filter by Plan Type */}
//           <div className="flex gap-2">
//             {["managed_medicaid", "medicare", "commercial", "hix"].map((filter) => (
//               <Button
//                 key={filter}
//                 variant={selectedFilter === filter ? "default" : "outline"}
//                 onClick={() => setSelectedFilter(filter)}
//               >
//                 {filter.replace("_", " ")}
//               </Button>
//             ))}
//           </div>

//           {/* Plan Cards */}
//           <div className="grid grid-cols-3 gap-4">
//             {paginatedPlans.map((plan) => (
//               <div
//                 key={plan.id}
//                 className={`border rounded-md bg-green-50 p-4 cursor-pointer ${
//                   selectedPlans.some((p) => p.id === plan.id)
//                     ? "border-green-600"
//                     : "border-gray-300"
//                 }`}
//                 onClick={() => onSelect(plan)}
//               >
//                 <p className="text-sm font-medium text-center">{plan.name}</p>
//               </div>
//             ))}
//           </div>

//           {/* Pagination Controls */}
//           <div className="flex justify-between">
//             <Button
//               variant="secondary"
//               onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
//               disabled={currentPage === 1}
//             >
//               Previous
//             </Button>
//             <span>
//               Page {currentPage} of {totalPages}
//             </span>
//             <Button
//               variant="secondary"
//               onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
//               disabled={currentPage === totalPages}
//             >
//               Next
//             </Button>
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   )
// }


// "use client"

// import React, { useState } from "react"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Input } from "@/components/ui/input"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

// export function PlanList({ statePlans, usPlans, onSelect, selectedPlans }) {
//   const [searchTerm, setSearchTerm] = useState("")
//   const [currentPage, setCurrentPage] = useState(1)
//   const [selectedState, setSelectedState] = useState("All States") // Default to "All States"
//   const [selectedFilter, setSelectedFilter] = useState("managed_medicaid")
//   const plansPerPage = 12

//   const filteredPlans =
//     selectedState === "All States"
//       ? usPlans["all states"]?.[selectedFilter]?.filter((plan) =>
//           plan.name.toLowerCase().includes(searchTerm.toLowerCase())
//         ) || []
//       : statePlans[selectedState]?.[selectedFilter]?.filter((plan) =>
//           plan.name.toLowerCase().includes(searchTerm.toLowerCase())
//         ) || []

//   const paginatedPlans = filteredPlans.slice(
//     (currentPage - 1) * plansPerPage,
//     currentPage * plansPerPage
//   )

//   const totalPages = Math.ceil(filteredPlans.length / plansPerPage)

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle className="text-xl text-[#54681D]">Plan List</CardTitle>
//         <CardDescription>Select plans to include in your list.</CardDescription>
//       </CardHeader>
//       <CardContent>
//         <div className="space-y-4">
//           <div className="flex gap-4">
//             {/* State Filter Dropdown */}
//             <Select onValueChange={setSelectedState} value={selectedState}>
//               <SelectTrigger className="w-[300px] bg-white rounded-[12px] border-[#d1d5db] border-2 hover:border-[#a6ce39] focus:border-[#a6ce39]">
//                 <SelectValue placeholder="All States" />
//               </SelectTrigger>
//               <SelectContent className="bg-gray-100 rounded-[12px] border-[#d1d5db] border-2 hover:border-[#a6ce39]">
//                 <SelectItem value="All States">All States</SelectItem>
//                 {Object.keys(statePlans).map((state) => (
//                   <SelectItem key={state} value={state}>
//                     {state}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>

//             {/* Search Bar */}
//             <Input
//               placeholder="Search plans..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="max-w-xs rounded-[12px] border-[#d1d5db] border-2 focus:border-[#a6ce39] hover:border-[#a6ce39]"
//             />
//           </div>

//           {/* Filter by Plan Type */}
//           <div className="flex gap-2">
//             {["managed_medicaid", "medicare", "commercial", "hix"].map((filter) => (
//               <Button
//                 key={filter}
//                 variant={selectedFilter === filter ? "default" : "outline"}
//                 onClick={() => setSelectedFilter(filter)}
//                 className="rounded-[12px] border-[#d1d5db] border-2 hover:border-[#a6ce39]"
//               >
//                 {filter.replace("_", " ")}
//               </Button>
//             ))}
//           </div>

//           {/* Plan Cards */}
//           <div className="grid grid-cols-3 gap-4">
//             {paginatedPlans.map((plan) => (
//               <div
//                 key={plan.id}
//                 className={`border rounded-md bg-green-50 p-4 cursor-pointer ${
//                   selectedPlans.some((p) => p.id === plan.id)
//                     ? "border-green-600"
//                     : "border-gray-300"
//                 }`}
//                 onClick={() => onSelect(plan)}
//               >
//                 <p className="text-sm font-medium text-center">{plan.name}</p>
//               </div>
//             ))}
//           </div>

//           {/* Pagination Controls */}
//           <div className="flex justify-between">
//             <Button
//               variant="secondary"
//               onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
//               disabled={currentPage === 1}
//               className="rounded-[12px] border-[#d1d5db] border-2 hover:border-[#a6ce39]"
//             >
//               Previous
//             </Button>
//             <span>
//               Page {currentPage} of {totalPages}
//             </span>
//             <Button
//               variant="secondary"
//               onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
//               disabled={currentPage === totalPages}
//               className="rounded-[12px] border-[#d1d5db] border-2 hover:border-[#a6ce39]"
//             >
//               Next
//             </Button>
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   )
// }


"use client"

import React, { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function PlanList({ statePlans, usPlans, onSelect, selectedPlans }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedState, setSelectedState] = useState("All States") // Default to "All States"
  const [selectedFilter, setSelectedFilter] = useState("managed_medicaid")
  const plansPerPage = 12

  const filteredPlans =
    selectedState === "All States"
      ? usPlans["all states"]?.[selectedFilter]?.filter((plan) =>
          plan.name.toLowerCase().includes(searchTerm.toLowerCase())
        ) || []
      : statePlans[selectedState]?.[selectedFilter]?.filter((plan) =>
          plan.name.toLowerCase().includes(searchTerm.toLowerCase())
        ) || []

  const paginatedPlans = filteredPlans.slice(
    (currentPage - 1) * plansPerPage,
    currentPage * plansPerPage
  )

  const totalPages = Math.ceil(filteredPlans.length / plansPerPage)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl text-[#54681D]">Plan List</CardTitle>
        <CardDescription>Select plans to include in your list.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* State Filter Dropdown */}
            <Select onValueChange={setSelectedState} value={selectedState}>
              <SelectTrigger className="w-full sm:w-[300px] bg-green-500 text-white text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 rounded-lg hover:bg-darkBlue">
                <SelectValue placeholder="All States" />
              </SelectTrigger>
              <SelectContent className="bg-gray-100 rounded-[12px] border-[#d1d5db] border-2 hover:border-[#a6ce39]">
                <SelectItem value="All States" className="text-sm font-medium">
                  All States
                </SelectItem>
                {Object.keys(statePlans).map((state) => (
                  <SelectItem key={state} value={state} className="text-sm font-medium">
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Search Bar */}
            <Input
              placeholder="Search plans..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-xs rounded-[12px] border-[#d1d5db] border-2 focus:border-[#a6ce39] hover:border-[#a6ce39] h-10 px-4 py-2"
            />
          </div>

          {/* Filter by Plan Type */}
          <div className="flex flex-wrap gap-2">
            {["managed_medicaid", "medicare", "commercial", "hix"].map((filter) => (
              <Button
                key={filter}
                variant={selectedFilter === filter ? "default" : "outline"}
                onClick={() => setSelectedFilter(filter)}
                className="rounded-[12px] border-[#d1d5db] border-2 hover:border-[#a6ce39] text-sm font-medium h-10 px-4 py-2"
              >
                {filter.replace("_", " ")}
              </Button>
            ))}
          </div>

          {/* Plan Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {paginatedPlans.map((plan) => (
              <div
                key={plan.id}
                className={`border rounded-[12px] p-4 cursor-pointer transition-colors duration-200 ${
                  selectedPlans.some((p) => p.id === plan.id)
                    ? "border-green-600 bg-green-100"
                    : "border-gray-300 hover:bg-green-50"
                }`}
                onClick={() => onSelect(plan)}
              >
                <p className="text-sm font-medium text-center">{plan.name}</p>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          <div className="flex justify-between items-center">
            <Button
              variant="secondary"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="rounded-[12px] border-[#d1d5db] border-2 hover:border-[#a6ce39] h-10 px-4 py-2"
            >
              Previous
            </Button>
            <span className="text-sm font-medium">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="secondary"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="rounded-[12px] border-[#d1d5db] border-2 hover:border-[#a6ce39] h-10 px-4 py-2"
            >
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
