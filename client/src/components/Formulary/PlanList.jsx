// "use client";

// import React, { useState } from "react";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// export function PlanList({ plans, planTypes, onSelect, selectedPlans, selectedPlanType, setSelectedPlanType }) {
//   const [searchTerm, setSearchTerm] = useState("");
//   const [currentPage, setCurrentPage] = useState(1);
//   const plansPerPage = 9;

//   // Filter plans based on search term and selected plan type
//   const filteredPlans = plans
//     .filter(plan => {
//       const matchesSearch = plan.name.toLowerCase().includes(searchTerm.toLowerCase());
//       const matchesPlanType = selectedPlanType === "All Plan Types" || plan.type === selectedPlanType;
//       return matchesSearch && matchesPlanType;
//     })
//     .filter(plan => plan.name && plan.name.trim() !== "");

//   const paginatedPlans = filteredPlans.slice(
//     (currentPage - 1) * plansPerPage,
//     currentPage * plansPerPage
//   );

//   const totalPages = Math.ceil(filteredPlans.length / plansPerPage);

//   return (
//     <Card className="bg-white">
//       <CardHeader>
//         <CardTitle className="text-2xl font-bold text-[#54681D]">Plan List</CardTitle>
//         <CardDescription>Select plans to include in your list.</CardDescription>
//       </CardHeader>
//       <CardContent>
//         <div className="space-y-4">
//           <div className="flex flex-col sm:flex-row gap-4">
//             <Input
//               placeholder="Search plans..."
//               value={searchTerm}
//               onChange={(e) => {
//                 setSearchTerm(e.target.value);
//                 setCurrentPage(1); // Reset page on search
//               }}
//               className="max-w-xs rounded-[12px] border-[#d1d5db] border-2 focus:border-[#a6ce39] hover:border-[#a6ce39] h-10 px-4 py-2"
//             />
//             {/* Plan Type Dropdown */}
//             <Select onValueChange={setSelectedPlanType} value={selectedPlanType}>
//               <SelectTrigger className="w-full sm:w-[300px] bg-green-500 text-white text-sm font-medium h-10 px-4 py-2 rounded-lg">
//                 <SelectValue placeholder="All Plan Types" />
//               </SelectTrigger>
//               <SelectContent className="bg-gray-100 rounded-[12px] border-[#d1d5db] border-2">
//                 <SelectItem value="All Plan Types" className="text-sm font-medium">
//                   All Plan Types
//                 </SelectItem>
//                 {planTypes.filter(type => type.trim() !== "").map((type) => (
//                   <SelectItem key={type} value={type} className="text-sm font-medium">
//                     {type}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           </div>

//           <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//             {paginatedPlans.map((plan) => (
//               <div
//                 key={plan.name} // Use plan.name as a unique key
//                 className={`border rounded-[12px] p-4 cursor-pointer transition-colors duration-200 ${
//                   selectedPlans.some((p) => p.id === plan.name)
//                     ? "border-green-600 bg-green-100"
//                     : "border-gray-300 hover:bg-green-50"
//                 }`}
//                 onClick={() => onSelect(plan)}
//               >
//                 <p className="text-sm font-medium text-center">{plan.name}</p>
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


// "use client";

// import React, { useState, useEffect } from "react";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";

// export function PlanList({
//   plans,
//   planTypes,
//   onSelect,
//   selectedPlans,
//   selectedPlanType,
//   setSelectedPlanType,
//   onSelectAll, // **New Prop**
//   onDeselectAll, // **New Prop**
// }) {
//   const [searchTerm, setSearchTerm] = useState("");
//   const [currentPage, setCurrentPage] = useState(1);
//   const plansPerPage = 9;

//   // Filter plans based on search term and selected plan type
//   const filteredPlans = plans
//     .filter((plan) => {
//       const matchesSearch = plan.name
//         .toLowerCase()
//         .includes(searchTerm.toLowerCase());
//       const matchesPlanType =
//         selectedPlanType === "All Plan Types" ||
//         plan.type === selectedPlanType;
//       return matchesSearch && matchesPlanType;
//     })
//     .filter((plan) => plan.name && plan.name.trim() !== "");

//   const paginatedPlans = filteredPlans.slice(
//     (currentPage - 1) * plansPerPage,
//     currentPage * plansPerPage
//   );

//   const totalPages = Math.ceil(filteredPlans.length / plansPerPage);

//   // Determine if all paginated plans are selected
//   const allPaginatedSelected = paginatedPlans.every((plan) =>
//     selectedPlans.some((p) => p.id === plan.name)
//   );

//   // Handle Select All checkbox change
//   const handleSelectAllChange = (e) => {
//     if (e.target.checked) {
//       onSelectAll(paginatedPlans);
//     } else {
//       onDeselectAll(paginatedPlans);
//     }
//   };

//   // Effect to reset "Select All" checkbox when paginated plans change
//   useEffect(() => {
//     // This effect ensures that if the selection state changes externally,
//     // the "Select All" checkbox reflects the current state.
//   }, [paginatedPlans, selectedPlans]);

//   return (
//     <Card className="bg-white">
//       <CardHeader>
//         <CardTitle className="text-2xl font-bold text-[#54681D]">
//           Plan List
//         </CardTitle>
//         <CardDescription>Select plans to include in your list.</CardDescription>
//       </CardHeader>
//       <CardContent>
//         <div className="space-y-4">
//           {/* Search and Select All Row */}
//           <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//             <div className="flex flex-col sm:flex-row gap-4">
//               <Input
//                 placeholder="Search plans..."
//                 value={searchTerm}
//                 onChange={(e) => {
//                   setSearchTerm(e.target.value);
//                   setCurrentPage(1); // Reset page on search
//                 }}
//                 className="max-w-xs rounded-[12px] border-[#d1d5db] border-2 focus:border-[#a6ce39] hover:border-[#a6ce39] h-10 px-4 py-2"
//               />
//               {/* Plan Type Dropdown */}
//               <Select
//                 onValueChange={setSelectedPlanType}
//                 value={selectedPlanType}
//               >
//                 <SelectTrigger className="w-full sm:w-[300px] bg-green-500 text-white text-sm font-medium h-10 px-4 py-2 rounded-lg">
//                   <SelectValue placeholder="All Plan Types" />
//                 </SelectTrigger>
//                 <SelectContent className="bg-gray-100 rounded-[12px] border-[#d1d5db] border-2">
//                   <SelectItem
//                     value="All Plan Types"
//                     className="text-sm font-medium"
//                   >
//                     All Plan Types
//                   </SelectItem>
//                   {planTypes
//                     .filter((type) => type.trim() !== "")
//                     .map((type) => (
//                       <SelectItem
//                         key={type}
//                         value={type}
//                         className="text-sm font-medium"
//                       >
//                         {type}
//                       </SelectItem>
//                     ))}
//                 </SelectContent>
//               </Select>
//             </div>

//             {/* Select All Checkbox */}
//             <div className="flex items-center">
//               <input
//                 type="checkbox"
//                 id="selectAll"
//                 checked={allPaginatedSelected}
//                 onChange={handleSelectAllChange}
//                 className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
//               />
//               <label htmlFor="selectAll" className="ml-2 text-sm text-gray-700">
//                 Select All
//               </label>
//             </div>
//           </div>

//           <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//             {paginatedPlans.map((plan) => (
//               <div
//                 key={plan.name} // Use plan.name as a unique key
//                 className={`border rounded-[12px] p-4 cursor-pointer transition-colors duration-200 relative ${
//                   selectedPlans.some((p) => p.id === plan.name)
//                     ? "border-green-600 bg-green-100"
//                     : "border-gray-300 hover:bg-green-50"
//                 }`}
//                 onClick={() => onSelect(plan)}
//               >
//                 {/* Green Checkmark for Selected Plans */}
//                 {selectedPlans.some((p) => p.id === plan.name) && (
//                   <svg
//                     className="w-6 h-6 text-green-600 absolute top-2 right-2"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                     xmlns="http://www.w3.org/2000/svg"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={3}
//                       d="M5 13l4 4L19 7"
//                     />
//                   </svg>
//                 )}

//                 <p className="text-sm font-medium text-center">{plan.name}</p>
//               </div>
//             ))}
//           </div>

//           <div className="flex justify-between items-center">
//             <Button
//               variant="secondary"
//               onClick={() =>
//                 setCurrentPage((prev) => Math.max(prev - 1, 1))
//               }
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
//               onClick={() =>
//                 setCurrentPage((prev) => Math.min(prev + 1, totalPages))
//               }
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

import React, { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function PlanList({
  plans,
  planTypes,
  onSelect,
  selectedPlans,
  selectedPlanType,
  setSelectedPlanType,
  onSelectAllPlans,
  onDeselectAllPlans, 
  onSelectCurrentPagePlans, 
  onDeselectCurrentPagePlans, 
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const plansPerPage = 9;

  // Filter plans based on search term and selected plan type
  const filteredPlans = plans
    .filter((plan) => {
      const matchesSearch = plan.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesPlanType =
        selectedPlanType === "All Plan Types" ||
        plan.type === selectedPlanType;
      return matchesSearch && matchesPlanType;
    })
    .filter((plan) => plan.name && plan.name.trim() !== "");

  const paginatedPlans = filteredPlans.slice(
    (currentPage - 1) * plansPerPage,
    currentPage * plansPerPage
  );

  const totalPages = Math.ceil(filteredPlans.length / plansPerPage);

  // Determine if all paginated plans are selected
  const allPaginatedSelected = paginatedPlans.every((plan) =>
    selectedPlans.some((p) => p.id === plan.name)
  );

  // Handle Select All checkbox change
  const handleSelectAllChange = (e) => {
    if (e.target.checked) {
      onSelectCurrentPagePlans(paginatedPlans);
    } else {
      onDeselectCurrentPagePlans(paginatedPlans);
    }
  };

  // Determine if all plans are selected
  const allPlansSelected =
    plans.length > 0 && plans.every((plan) => selectedPlans.some((p) => p.id === plan.name));

  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-[#54681D]">
          Plan List
        </CardTitle>
        <CardDescription>Select plans to include in your list.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Search, Plan Type Dropdown, and Select Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                placeholder="Search plans..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1); // Reset page on search
                }}
                className="max-w-xs rounded-[12px] border-[#d1d5db] border-2 focus:border-[#a6ce39] hover:border-[#a6ce39] h-10 px-4 py-2"
              />
              {/* Plan Type Dropdown */}
              <Select
                onValueChange={setSelectedPlanType}
                value={selectedPlanType}
              >
                <SelectTrigger className="w-full sm:w-[300px] bg-green-500 text-white text-sm font-medium h-10 px-4 py-2 rounded-lg">
                  <SelectValue placeholder="All Plan Types" />
                </SelectTrigger>
                <SelectContent className="bg-gray-100 rounded-[12px] border-[#d1d5db] border-2">
                  <SelectItem
                    value="All Plan Types"
                    className="text-sm font-medium"
                  >
                    All Plan Types
                  </SelectItem>
                  {planTypes
                    .filter((type) => type.trim() !== "")
                    .map((type) => (
                      <SelectItem
                        key={type}
                        value={type}
                        className="text-sm font-medium"
                      >
                        {type}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Select All and Select Current Page Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <Button
                onClick={() => onSelectAllPlans()}
                className="bg-green-600 text-white hover:bg-green-700 rounded-[12px] px-3 py-1 text-sm"
              >
                Select All Plans
              </Button>
              <Button
                onClick={() => onSelectCurrentPagePlans(paginatedPlans)}
                className="bg-blue-600 text-white hover:bg-blue-700 rounded-[12px] px-3 py-1 text-sm"
              >
                Select Current Page
              </Button>
              <Button
                onClick={() => onDeselectAllPlans()}
                className="bg-red-600 text-white hover:bg-red-700 rounded-[12px] px-3 py-1 text-sm"
              >
                Deselect All Plans
              </Button>
              <Button
                onClick={() => onDeselectCurrentPagePlans(paginatedPlans)}
                className="bg-gray-600 text-white hover:bg-gray-700 rounded-[12px] px-3 py-1 text-sm"
              >
                Deselect Current Page
              </Button>
            </div>
          </div>

          {/* Select All Checkbox for Current Page */}
          {/* <div className="flex items-center">
            <input
              type="checkbox"
              id="selectAllCurrentPage"
              checked={allPaginatedSelected}
              onChange={handleSelectAllChange}
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
            <label htmlFor="selectAllCurrentPage" className="ml-2 text-sm text-gray-700">
              Select All on Current Page
            </label>
          </div> */}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {paginatedPlans.map((plan) => (
              <div
                key={plan.name} // Use plan.name as a unique key
                className={`border rounded-[12px] p-4 cursor-pointer transition-colors duration-200 relative ${
                  selectedPlans.some((p) => p.id === plan.name)
                    ? "border-green-600 bg-green-100"
                    : "border-gray-300 hover:bg-green-50"
                }`}
                onClick={() => onSelect(plan)}
              >
                {/* Green Checkmark for Selected Plans */}
                {selectedPlans.some((p) => p.id === plan.name) && (
                  <svg
                    className="w-6 h-6 text-green-600 absolute top-2 right-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}

                <p className="text-sm font-medium text-center">{plan.name}</p>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center">
            <Button
              variant="secondary"
              onClick={() =>
                setCurrentPage((prev) => Math.max(prev - 1, 1))
              }
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
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
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
