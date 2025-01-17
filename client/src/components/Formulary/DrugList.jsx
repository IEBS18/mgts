// "use client"

// import React, { useState } from "react"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Input } from "@/components/ui/input"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

// export function DrugList({ allDrugs, drugsByType, onSelect, selectedDrugs, therapeuticArea, setTherapeuticArea }) {
//   const [searchTerm, setSearchTerm] = useState("")
//   const [currentPage, setCurrentPage] = useState(1)
//   const drugsPerPage = 9

//   const filteredDrugs =
//     therapeuticArea === "All Therapeutic Areas"
//       ? allDrugs.filter((drug) =>
//           drug.name.toLowerCase().includes(searchTerm.toLowerCase())
//         )
//       : drugsByType[therapeuticArea]?.filter((drug) =>
//           drug.name.toLowerCase().includes(searchTerm.toLowerCase())
//         ) || []

//   const paginatedDrugs = filteredDrugs.slice(
//     (currentPage - 1) * drugsPerPage,
//     currentPage * drugsPerPage
//   )

//   const totalPages = Math.ceil(filteredDrugs.length / drugsPerPage)

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle>Drug List</CardTitle>
//         <CardDescription>Select drugs to include in your list.</CardDescription>
//       </CardHeader>
//       <CardContent>
//         <div className="space-y-4">
//           <div className="flex gap-4">
//             <Select onValueChange={setTherapeuticArea} value={therapeuticArea}>
//               <SelectTrigger className="w-[300px] bg-white">
//                 <SelectValue placeholder="All Therapeutic Areas" />
//               </SelectTrigger>
//               <SelectContent className="bg-gray-100">
//                 {Object.keys(drugsByType).map((type) => (
//                   <SelectItem key={type} value={type}>
//                     {type}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>

//             <Input
//               placeholder="Search drugs..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="max-w-xs"
//             />
//           </div>

//           <div className="grid grid-cols-3 gap-4">
//             {paginatedDrugs.map((drug) => (
//               <div
//                 key={drug.id}
//                 className={`border rounded-md bg-green-50 p-4 cursor-pointer ${
//                   selectedDrugs.some((d) => d.id === drug.id)
//                     ? "border-green-600"
//                     : "border-gray-300"
//                 }`}
//                 onClick={() => onSelect(drug)}
//               >
//                 <p className="text-sm font-medium text-center">{drug.name}</p>
//               </div>
//             ))}
//           </div>

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

// export function DrugList({ allDrugs, drugsByType, onSelect, selectedDrugs, therapeuticArea, setTherapeuticArea }) {
//   const [searchTerm, setSearchTerm] = useState("")
//   const [currentPage, setCurrentPage] = useState(1)
//   const drugsPerPage = 9

//   const filteredDrugs =
//     therapeuticArea === "All Therapeutic Areas"
//       ? allDrugs.filter((drug) =>
//           drug.name.toLowerCase().includes(searchTerm.toLowerCase())
//         )
//       : drugsByType[therapeuticArea]?.filter((drug) =>
//           drug.name.toLowerCase().includes(searchTerm.toLowerCase())
//         ) || []

//   const paginatedDrugs = filteredDrugs.slice(
//     (currentPage - 1) * drugsPerPage,
//     currentPage * drugsPerPage
//   )

//   const totalPages = Math.ceil(filteredDrugs.length / drugsPerPage)

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle className="text-xl text-[#54681D]">Drug List</CardTitle>
//         <CardDescription>Select drugs to include in your list.</CardDescription>
//       </CardHeader>
//       <CardContent>
//         <div className="space-y-4">
//           <div className="flex gap-4">
//             <Select onValueChange={setTherapeuticArea} value={therapeuticArea}>
//               <SelectTrigger className="w-[300px] bg-white rounded-[12px] border-[#d1d5db] border-2 hover:border-[#a6ce39] focus:border-[#a6ce39]">
//                 <SelectValue placeholder="All Therapeutic Areas" />
//               </SelectTrigger>
//               <SelectContent className="bg-gray-100 rounded-[12px] border-[#d1d5db] border-2 hover:border-[#a6ce39]">
//                 {Object.keys(drugsByType).map((type) => (
//                   <SelectItem key={type} value={type}>
//                     {type}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>

//             <Input
//               placeholder="Search drugs..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="max-w-xs rounded-[12px] border-[#d1d5db] border-2 focus:border-[#a6ce39] hover:border-[#a6ce39]"
//             />
//           </div>

//           <div className="grid grid-cols-3 gap-4">
//             {paginatedDrugs.map((drug) => (
//               <div
//                 key={drug.id}
//                 className={`border rounded-md bg-green-50 p-4 cursor-pointer ${
//                   selectedDrugs.some((d) => d.id === drug.id)
//                     ? "border-green-600"
//                     : "border-gray-300"
//                 }`}
//                 onClick={() => onSelect(drug)}
//               >
//                 <p className="text-sm font-medium text-center">{drug.name}</p>
//               </div>
//             ))}
//           </div>

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

export function DrugList({ allDrugs, drugsByType, onSelect, selectedDrugs, therapeuticArea, setTherapeuticArea }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const drugsPerPage = 9

  const filteredDrugs =
    therapeuticArea === "All Therapeutic Areas"
      ? allDrugs.filter((drug) =>
          drug.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : drugsByType[therapeuticArea]?.filter((drug) =>
          drug.name.toLowerCase().includes(searchTerm.toLowerCase())
        ) || []

  const paginatedDrugs = filteredDrugs.slice(
    (currentPage - 1) * drugsPerPage,
    currentPage * drugsPerPage
  )

  const totalPages = Math.ceil(filteredDrugs.length / drugsPerPage)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl text-[#54681D]">Drug List</CardTitle>
        <CardDescription>Select drugs to include in your list.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Select onValueChange={setTherapeuticArea} value={therapeuticArea}>
              <SelectTrigger className="w-full sm:w-[300px] bg-green-500 text-white text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 rounded-lg hover:bg-darkBlue">
                <SelectValue placeholder="All Therapeutic Areas" />
              </SelectTrigger>
              <SelectContent className="bg-gray-100 rounded-[12px] border-[#d1d5db] border-2 hover:border-[#a6ce39]">
                {Object.keys(drugsByType).map((type) => (
                  <SelectItem key={type} value={type} className="text-sm font-medium">
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              placeholder="Search drugs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-xs rounded-[12px] border-[#d1d5db] border-2 focus:border-[#a6ce39] hover:border-[#a6ce39] h-10 px-4 py-2"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {paginatedDrugs.map((drug) => (
              <div
                key={drug.id}
                className={`border rounded-[12px] p-4 cursor-pointer transition-colors duration-200 ${
                  selectedDrugs.some((d) => d.id === drug.id)
                    ? "border-green-600 bg-green-100"
                    : "border-gray-300 hover:bg-green-50"
                }`}
                onClick={() => onSelect(drug)}
              >
                <p className="text-sm font-medium text-center">{drug.name}</p>
              </div>
            ))}
          </div>

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
