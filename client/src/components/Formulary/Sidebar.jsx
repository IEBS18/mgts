// "use client"

// import React from "react"
// import { X } from "lucide-react"
// import { Button } from "@/components/ui/button"

// export function Sidebar({ therapeuticArea, selectedDrugs, selectedState, selectedPlans, onRemoveDrug, onRemovePlan, onViewResults }) {
//   return (
//     <div className="p-6 space-y-6">
//       <div>
//         <h2 className="text-lg font-semibold mb-4">Filters</h2>
//         <div>
//           <h3 className="font-medium mb-2">Therapeutic Area</h3>
//           <p className="text-sm text-gray-600">{therapeuticArea}</p>
//         </div>
//         <div>
//           <h3 className="font-medium mb-2">State</h3>
//           <p className="text-sm text-gray-600">{selectedState}</p>
//         </div>
//       </div>

//       <div>
//         <h3 className="font-medium mb-2">Selected Drugs</h3>
//         <div className="space-y-2">
//           {selectedDrugs.map((drug) => (
//             <div key={drug.id} className="flex items-center justify-between">
//               <span>{drug.name}</span>
//               <Button variant="ghost" size="sm" onClick={() => onRemoveDrug(drug)}>
//                 <X className="h-4 w-4 text-red-500" />
//               </Button>
//             </div>
//           ))}
//         </div>
//       </div>

//       <div>
//         <h3 className="font-medium mb-2">Selected Plans</h3>
//         <div className="space-y-2">
//           {selectedPlans.map((plan) => (
//             <div key={plan.id} className="flex items-center justify-between">
//               <span>{plan.name}</span>
//               <Button variant="ghost" size="sm" onClick={() => onRemovePlan(plan)}>
//                 <X className="h-4 w-4 text-red-500" />
//               </Button>
//             </div>
//           ))}
//         </div>
//       </div>

//       <Button
//         className="w-full bg-green-500 text-white hover:bg-green-600"
//         onClick={onViewResults}
//       >
//         View Results
//       </Button>
//     </div>
//   )
// }


// "use client"

// import React from "react"
// import { X } from "lucide-react"
// import { Button } from "@/components/ui/button"

// export function Sidebar({
//   therapeuticArea,
//   selectedDrugs,
//   selectedState,
//   selectedPlans,
//   onRemoveDrug,
//   onRemovePlan,
//   onViewResults,
//   clearAllDrugs,
//   clearAllPlans,
// }) {
//   return (
//     <div className="p-6 space-y-6">
//       <div>
//         <h2 className="text-lg font-semibold mb-4 text-[#54681D]">Filters</h2>
//         <div className="mb-4">
//           <h3 className="font-medium mb-2 text-[#54681D]">Therapeutic Area</h3>
//           <p className="text-sm text-gray-600">{therapeuticArea}</p>
//         </div>
//         <div>
//           <h3 className="font-medium mb-2 text-[#54681D]">State</h3>
//           <p className="text-sm text-gray-600">{selectedState}</p>
//         </div>
//       </div>

//       <div>
//         <div className="flex justify-between items-center mb-2">
//           <h3 className="font-medium text-[#54681D]">Selected Drugs</h3>
//           {selectedDrugs.length > 0 && (
//             <Button
//               variant="outline"
//               size="sm"
//               onClick={clearAllDrugs}
//               className="text-sm font-medium border-[#d1d5db] hover:border-[#a6ce39] rounded-[12px] px-2 py-1"
//             >
//               Clear All
//             </Button>
//           )}
//         </div>
//         <div className="space-y-2 max-h-40 overflow-y-auto">
//           {selectedDrugs.length === 0 ? (
//             <p className="text-sm text-gray-500">No drugs selected.</p>
//           ) : (
//             selectedDrugs.map((drug) => (
//               <div key={drug.id} className="flex items-center justify-between">
//                 <span className="text-sm">{drug.name}</span>
//                 <Button variant="ghost" size="sm" onClick={() => onRemoveDrug(drug)}>
//                   <X className="h-4 w-4 text-red-500" />
//                 </Button>
//               </div>
//             ))
//           )}
//         </div>
//       </div>

//       <div>
//         <div className="flex justify-between items-center mb-2">
//           <h3 className="font-medium text-[#54681D]">Selected Plans</h3>
//           {selectedPlans.length > 0 && (
//             <Button
//               variant="outline"
//               size="sm"
//               onClick={clearAllPlans}
//               className="text-sm font-medium border-[#d1d5db] hover:border-[#a6ce39] rounded-[12px] px-2 py-1"
//             >
//               Clear All
//             </Button>
//           )}
//         </div>
//         <div className="space-y-2 max-h-40 overflow-y-auto">
//           {selectedPlans.length === 0 ? (
//             <p className="text-sm text-gray-500">No plans selected.</p>
//           ) : (
//             selectedPlans.map((plan) => (
//               <div key={plan.id} className="flex items-center justify-between">
//                 <span className="text-sm">{plan.name}</span>
//                 <Button variant="ghost" size="sm" onClick={() => onRemovePlan(plan)}>
//                   <X className="h-4 w-4 text-red-500" />
//                 </Button>
//               </div>
//             ))
//           )}
//         </div>
//       </div>

//       <Button
//         onClick={onViewResults}
//         className="
//           text-sm font-medium 
//           ring-offset-background 
//           transition-colors 
//           focus-visible:outline-none 
//           focus-visible:ring-2 
//           focus-visible:ring-ring 
//           focus-visible:ring-offset-2 
//           disabled:pointer-events-none 
//           disabled:opacity-50 
//           h-10 px-4 py-2 
//           bg-[#a6ce39] text-white 
//           hover:bg-[#95b833] 
//           rounded-[12px] 
//           w-full
//         "
//       >
//         View Results
//       </Button>
//     </div>
//   )
// }


"use client"

import React from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Sidebar({
  therapeuticArea,
  selectedDrugs,
  selectedState,
  selectedPlans,
  onRemoveDrug,
  onRemovePlan,
  onViewResults,
  clearAllDrugs,
  clearAllPlans,
}) {
  return (
    <div className="p-6 space-y-6">
      {/* Filters Section */}
      <div>
        <h2 className="text-lg font-semibold mb-4 text-dark-green">Filters</h2>
        <div className="mb-4">
          <h3 className="font-medium mb-2 text-dark-green">Therapeutic Area</h3>
          <p className="text-sm text-gray-600">{therapeuticArea}</p>
        </div>
        <div>
          <h3 className="font-medium mb-2 text-dark-green">State</h3>
          <p className="text-sm text-gray-600">{selectedState}</p>
        </div>
      </div>

      {/* Selected Drugs Section */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-medium text-dark-green">Selected Drugs</h3>
          {selectedDrugs.length > 0 && (
            <Button
              onClick={clearAllDrugs}
              className="
                text-sm font-medium 
                ring-offset-background 
                transition-colors 
                focus-visible:outline-none 
                focus-visible:ring-2 
                focus-visible:ring-ring 
                focus-visible:ring-offset-2 
                disabled:pointer-events-none 
                disabled:opacity-50 
                h-10 px-4 py-2 
                bg-[#a6ce39] text-white 
                hover:bg-[#95b833] 
                rounded-[12px]
                w-auto
              "
            >
              Clear All
            </Button>
          )}
        </div>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {selectedDrugs.length === 0 ? (
            <p className="text-sm text-gray-500">No drugs selected.</p>
          ) : (
            selectedDrugs.map((drug) => (
              <div key={drug.id} className="flex items-center justify-between">
                <span className="text-sm">{drug.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveDrug(drug)}
                  className="p-0"
                >
                  <X className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Selected Plans Section */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-medium text-dark-green">Selected Plans</h3>
          {selectedPlans.length > 0 && (
            <Button
              onClick={clearAllPlans}
              className="
                text-sm font-medium 
                ring-offset-background 
                transition-colors 
                focus-visible:outline-none 
                focus-visible:ring-2 
                focus-visible:ring-ring 
                focus-visible:ring-offset-2 
                disabled:pointer-events-none 
                disabled:opacity-50 
                h-10 px-4 py-2 
                bg-[#a6ce39] text-white 
                hover:bg-[#95b833] 
                rounded-[12px]
                w-auto
              "
            >
              Clear All
            </Button>
          )}
        </div>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {selectedPlans.length === 0 ? (
            <p className="text-sm text-gray-500">No plans selected.</p>
          ) : (
            selectedPlans.map((plan) => (
              <div key={plan.id} className="flex items-center justify-between">
                <span className="text-sm">{plan.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemovePlan(plan)}
                  className="p-0"
                >
                  <X className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* View Results Button */}
      <Button
        onClick={onViewResults}
        className="
          text-sm font-medium 
          ring-offset-background 
          transition-colors 
          focus-visible:outline-none 
          focus-visible:ring-2 
          focus-visible:ring-ring 
          focus-visible:ring-offset-2 
          disabled:pointer-events-none 
          disabled:opacity-50 
          h-10 px-4 py-2 
          bg-[#a6ce39] text-white 
          hover:bg-[#95b833] 
          rounded-[12px] 
          w-full
        "
      >
        View Results
      </Button>
    </div>
  )
}
