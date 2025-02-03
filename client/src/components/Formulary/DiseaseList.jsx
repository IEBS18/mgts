// "use client";

// import React, { useState } from "react";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// export function DiseaseList({ diseases, onSelect, selectedDiseases, selectedState, setSelectedState, states }) {
//   const [searchTerm, setSearchTerm] = useState("");
//   const [currentPage, setCurrentPage] = useState(1);
//   const diseasesPerPage = 9;

//   // Filter out unwanted words and blank spaces
//   const cleanedDiseases = diseases
//     .filter(
//       (disease) =>
//         disease && // not empty
//         !disease.toLowerCase().includes("the") &&
//         !disease.toLowerCase().includes("conditions")
//     );

//   const filteredDiseases = cleanedDiseases.filter((disease) =>
//     disease.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   const paginatedDiseases = filteredDiseases.slice(
//     (currentPage - 1) * diseasesPerPage,
//     currentPage * diseasesPerPage
//   );

//   const totalPages = Math.ceil(filteredDiseases.length / diseasesPerPage);

//   return (
//     <Card className="bg-white">
//       <CardHeader>
//         <CardTitle className="text-2xl font-bold text-[#54681D]">Disease List</CardTitle>
//         <CardDescription>Select diseases to include in your list.</CardDescription>
//       </CardHeader>
//       <CardContent>
//         <div className="space-y-4">
//           {/* State Dropdown */}
//           <div className="flex flex-row space-x-4">
//             <Select onValueChange={setSelectedState} value={selectedState}>
//               <SelectTrigger className="w-full sm:w-[300px] bg-green-500 text-white text-sm font-medium h-10 px-4 py-2 rounded-lg">
//                 <SelectValue placeholder="All States" />
//               </SelectTrigger>
//               <SelectContent className="bg-gray-100 rounded-[12px] border-[#d1d5db] border-2">
//                 <SelectItem value="All States" className="text-sm font-medium">
//                   All States
//                 </SelectItem>
//                 {states.filter(state => state.trim() !== "").map((state) => (
//                   <SelectItem key={state} value={state} className="text-sm font-medium">
//                     {state}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>


//             <Input
//             placeholder="Search diseases..."
//             value={searchTerm}
//             onChange={(e) => {
//               setSearchTerm(e.target.value);
//               setCurrentPage(1); // Reset page on search
//             }}
//             className="max-w-xs rounded-[12px] border-[#d1d5db] border-2 focus:border-[#a6ce39] hover:border-[#a6ce39] h-10 px-4 py-2"
//           />
//           </div>

          

//           <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//             {paginatedDiseases.map((disease, index) => (
//               <div
//                 key={disease} // Use disease name as key for uniqueness
//                 className={`border rounded-[12px] p-4 cursor-pointer transition-colors duration-200 ${
//                   selectedDiseases.includes(disease)
//                     ? "border-green-600 bg-green-100"
//                     : "border-gray-300 hover:bg-green-50"
//                 }`}
//                 onClick={() => onSelect(disease)}
//               >
//                 <p className="text-sm font-medium text-center">{disease}</p>
//               </div>
//             ))}
//           </div>

//           <div className="flex justify-between items-center">
//             <Button
//               variant="secondary"
//               onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
//               disabled={currentPage === 1}
//               className="rounded-[12px] border-[#d1d5db] border-2 hover:border-[#a6ce39] h-10 px-4 py-2"
//             >
//               Previous
//             </Button>
//             <span className="text-sm font-medium">
//               Page {currentPage} of {totalPages}
//             </span>
//             <Button
//               variant="secondary"
//               onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
//               disabled={currentPage === totalPages}
//               className="rounded-[12px] border-[#d1d5db] border-2 hover:border-[#a6ce39] h-10 px-4 py-2"
//             >
//               Next
//             </Button>
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }


"use client";

import React, { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function DiseaseList({ diseases, onSelect, selectedDiseases, selectedState, setSelectedState, states }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const diseasesPerPage = 9;

  // Filter out unwanted words and blank spaces
  const cleanedDiseases = diseases
    .filter(
      (disease) =>
        disease && // not empty
        !disease.toLowerCase().includes("the") &&
        !disease.toLowerCase().includes("conditions")
    );

  const filteredDiseases = cleanedDiseases.filter((disease) =>
    disease.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedDiseases = filteredDiseases.slice(
    (currentPage - 1) * diseasesPerPage,
    currentPage * diseasesPerPage
  );

  const totalPages = Math.ceil(filteredDiseases.length / diseasesPerPage);

  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-[#54681D]">Disease List</CardTitle>
        <CardDescription>Select diseases to include in your list.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* State Dropdown */}
          <div className="flex flex-row space-x-4">
            <Select onValueChange={setSelectedState} value={selectedState}>
              <SelectTrigger className="w-full sm:w-[300px] bg-green-500 text-white text-sm font-medium h-10 px-4 py-2 rounded-lg">
                <SelectValue placeholder="All States" />
              </SelectTrigger>
              <SelectContent className="bg-gray-100 rounded-[12px] border-[#d1d5db] border-2">
                <SelectItem value="All States" className="text-sm font-medium">
                  All States
                </SelectItem>
                {states.filter(state => state.trim() !== "").map((state) => (
                  <SelectItem key={state} value={state} className="text-sm font-medium">
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>


            <Input
              placeholder="Search diseases..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset page on search
              }}
              className="max-w-xs rounded-[12px] border-[#d1d5db] border-2 focus:border-[#a6ce39] hover:border-[#a6ce39] h-10 px-4 py-2"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {paginatedDiseases.map((disease, index) => (
              <div
                key={disease} // Use disease name as key for uniqueness
                className={`border rounded-[12px] p-4 cursor-pointer transition-colors duration-200 ${
                  selectedDiseases.includes(disease)
                    ? "border-green-600 bg-green-100"
                    : "border-gray-300 hover:bg-green-50"
                }`}
                onClick={() => onSelect(disease)}
              >
                <p className="text-sm font-medium text-center">{disease}</p>
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
  );
}
