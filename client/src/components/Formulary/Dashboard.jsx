// "use client"

// import React, { useState } from "react"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { DrugList } from "./DrugList"
// import { PlanList } from "./PlanList"
// import { Sidebar } from "./Sidebar"
// import drugsData from "../../assets/data/formulary/drugs.json"
// import typewiseDrugsData from "../../assets/data/formulary/typewise_drugs.json"
// import statePlansData from "../../assets/data/formulary/state_plans_data.json"
// import usPlansData from "../../assets/data/formulary/US_plans_data.json"

// export function Dashboard() {
//   const [activeTab, setActiveTab] = useState("drug-list")
//   const [selectedDrugs, setSelectedDrugs] = useState([])
//   const [selectedPlans, setSelectedPlans] = useState([])
//   const [therapeuticArea, setTherapeuticArea] = useState("All Therapeutic Areas")
//   const [selectedState, setSelectedState] = useState("All States")

//   const combinedDrugs = {
//     "All Therapeutic Areas": drugsData["All Therapeutic Areas"] || [],
//     ...typewiseDrugsData,
//   }

//   const combinedPlans = {
//     "All States": usPlansData["all states"] || {},
//     ...statePlansData,
//   }

//   const handleDrugSelect = (drug) => {
//     setSelectedDrugs((prev) =>
//       prev.some((d) => d.id === drug.id)
//         ? prev.filter((d) => d.id !== drug.id) // Remove drug if already selected
//         : [...prev, drug]
//     )
//   }

//   const handlePlanSelect = (plan) => {
//     setSelectedPlans((prev) =>
//       prev.some((p) => p.id === plan.id)
//         ? prev.filter((p) => p.id !== plan.id) // Remove plan if already selected
//         : [...prev, plan]
//     )
//   }

//   const handleRemoveDrug = (drug) => {
//     setSelectedDrugs((prev) => prev.filter((d) => d.id !== drug.id))
//   }

//   const handleRemovePlan = (plan) => {
//     setSelectedPlans((prev) => prev.filter((p) => p.id !== plan.id))
//   }

//   const handleViewResults = () => {
//     const payload = {
//       therapeuticArea,
//       selectedDrugs,
//       selectedState,
//       selectedPlans,
//     }

//     fetch("/formulary", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(payload),
//     })
//       .then((response) => response.json())
//       .then((data) => console.log("Submitted:", data))
//       .catch((error) => console.error("Error:", error))
//   }

//   return (
//     <div className="flex min-h-screen">
//       <div className="flex-1 p-6">
//         <Tabs defaultValue="drug-list" className="w-full" onValueChange={setActiveTab}>
//           <TabsList className="border-b w-full justify-start rounded-none h-auto p-0 bg-transparent">
//             <TabsTrigger
//               value="drug-list"
//               className="
//                 data-[state=active]:w-[211px] 
//                 data-[state=active]:h-[32px] 
//                 data-[state=active]:rounded-[19px] 
//                 data-[state=active]:bg-[#A6CE39] 
//                 data-[state=active]:border-healthcare-green 
//                 data-[state=active]:text-healthcare-green 
//                 data-[state=active]:font-bold 
//                 border-b-2 border-transparent rounded-none
//               "
//             >
//               Drug List
//             </TabsTrigger>
//             <TabsTrigger
//               value="plan-list"
//               className="
//                 data-[state=active]:w-[211px] 
//                 data-[state=active]:h-[32px] 
//                 data-[state=active]:rounded-[19px] 
//                 data-[state=active]:bg-[#A6CE39] 
//                 data-[state=active]:border-healthcare-green 
//                 data-[state=active]:text-healthcare-green 
//                 data-[state=active]:font-bold 
//                 border-b-2 border-transparent rounded-none
//               "
//             >
//               Plan List
//             </TabsTrigger>
//           </TabsList>

//           <TabsContent value="drug-list">
//             <DrugList
//               allDrugs={combinedDrugs["All Therapeutic Areas"]}
//               drugsByType={combinedDrugs}
//               onSelect={handleDrugSelect}
//               selectedDrugs={selectedDrugs}
//               therapeuticArea={therapeuticArea}
//               setTherapeuticArea={setTherapeuticArea}
//             />
//           </TabsContent>

//           <TabsContent value="plan-list">
//             <PlanList
//               statePlans={statePlansData}
//               usPlans={usPlansData}
//               onSelect={handlePlanSelect}
//               selectedPlans={selectedPlans}
//               selectedState={selectedState}
//               setSelectedState={setSelectedState}
//             />
//           </TabsContent>
//         </Tabs>
//       </div>

//       <div className="w-80 border-l bg-gray-100">
//         <Sidebar
//           therapeuticArea={therapeuticArea}
//           selectedDrugs={selectedDrugs}
//           selectedState={selectedState}
//           selectedPlans={selectedPlans}
//           onRemoveDrug={handleRemoveDrug}
//           onRemovePlan={handleRemovePlan}
//           onViewResults={handleViewResults}
//         />
//       </div>
//     </div>
//   )
// }


// "use client"

// import React, { useState } from "react"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { DrugList } from "./DrugList"
// import { PlanList } from "./PlanList"
// import { Sidebar } from "./Sidebar"
// import drugsData from "../../assets/data/formulary/drugs.json"
// import typewiseDrugsData from "../../assets/data/formulary/typewise_drugs.json"
// import statePlansData from "../../assets/data/formulary/state_plans_data.json"
// import usPlansData from "../../assets/data/formulary/US_plans_data.json"

// export function Dashboard() {
//   const [activeTab, setActiveTab] = useState("drug-list")
//   const [selectedDrugs, setSelectedDrugs] = useState([])
//   const [selectedPlans, setSelectedPlans] = useState([])
//   const [therapeuticArea, setTherapeuticArea] = useState("All Therapeutic Areas")
//   const [selectedState, setSelectedState] = useState("All States")

//   const combinedDrugs = {
//     "All Therapeutic Areas": drugsData["All Therapeutic Areas"] || [],
//     ...typewiseDrugsData,
//   }

//   const combinedPlans = {
//     "All States": usPlansData["all states"] || {},
//     ...statePlansData,
//   }

//   const handleDrugSelect = (drug) => {
//     setSelectedDrugs((prev) =>
//       prev.some((d) => d.id === drug.id)
//         ? prev.filter((d) => d.id !== drug.id) // Remove drug if already selected
//         : [...prev, drug]
//     )
//   }

//   const handlePlanSelect = (plan) => {
//     setSelectedPlans((prev) =>
//       prev.some((p) => p.id === plan.id)
//         ? prev.filter((p) => p.id !== plan.id) // Remove plan if already selected
//         : [...prev, plan]
//     )
//   }

//   const handleRemoveDrug = (drug) => {
//     setSelectedDrugs((prev) => prev.filter((d) => d.id !== drug.id))
//   }

//   const handleRemovePlan = (plan) => {
//     setSelectedPlans((prev) => prev.filter((p) => p.id !== plan.id))
//   }

//   const clearAllDrugs = () => {
//     setSelectedDrugs([])
//   }

//   const clearAllPlans = () => {
//     setSelectedPlans([])
//   }

//   const handleViewResults = () => {
//     const payload = {
//       therapeuticArea,
//       selectedDrugs,
//       selectedState,
//       selectedPlans,
//     }

//     fetch("/formulary", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(payload),
//     })
//       .then((response) => response.json())
//       .then((data) => console.log("Submitted:", data))
//       .catch((error) => console.error("Error:", error))
//   }

//   return (
//     <div className="flex min-h-screen">
//       <div className="flex-1 p-6">
//         <Tabs defaultValue="drug-list" className="w-full" onValueChange={setActiveTab}>
//           <TabsList className="border-b w-full justify-start rounded-none h-auto p-0 bg-transparent">
//             <TabsTrigger
//               value="drug-list"
//               className="
//                 data-[state=active]:w-[211px] 
//                 data-[state=active]:h-[32px] 
//                 data-[state=active]:rounded-[19px] 
//                 data-[state=active]:bg-green-500 
//                 data-[state=active]:border-green-600 
//                 data-[state=active]:text-white 
//                 data-[state=active]:font-bold 
//                 border-b-2 border-transparent rounded-none
//               "
//             >
//               Drug List
//             </TabsTrigger>
//             <TabsTrigger
//               value="plan-list"
//               className="
//                 data-[state=active]:w-[211px] 
//                 data-[state=active]:h-[32px] 
//                 data-[state=active]:rounded-[19px] 
//                 data-[state=active]:bg-green-500 
//                 data-[state=active]:border-green-600 
//                 data-[state=active]:text-white 
//                 data-[state=active]:font-bold 
//                 border-b-2 border-transparent rounded-none
//               "
//             >
//               Plan List
//             </TabsTrigger>
//           </TabsList>

//           <TabsContent value="drug-list">
//             <DrugList
//               allDrugs={combinedDrugs["All Therapeutic Areas"]}
//               drugsByType={combinedDrugs}
//               onSelect={handleDrugSelect}
//               selectedDrugs={selectedDrugs}
//               therapeuticArea={therapeuticArea}
//               setTherapeuticArea={setTherapeuticArea}
//             />
//           </TabsContent>

//           <TabsContent value="plan-list">
//             <PlanList
//               statePlans={statePlansData}
//               usPlans={usPlansData}
//               onSelect={handlePlanSelect}
//               selectedPlans={selectedPlans}
//               selectedState={selectedState}
//               setSelectedState={setSelectedState}
//             />
//           </TabsContent>
//         </Tabs>
//       </div>

//       <div className="w-80 border-l bg-gray-100">
//         <Sidebar
//           therapeuticArea={therapeuticArea}
//           selectedDrugs={selectedDrugs}
//           selectedState={selectedState}
//           selectedPlans={selectedPlans}
//           onRemoveDrug={handleRemoveDrug}
//           onRemovePlan={handleRemovePlan}
//           onViewResults={handleViewResults}
//           clearAllDrugs={clearAllDrugs}      
//           clearAllPlans={clearAllPlans} 
//         />
//       </div>
//     </div>
//   )
// }


// "use client"

// import React, { useState } from "react"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { DrugList } from "./DrugList"
// import { PlanList } from "./PlanList"
// import { Sidebar } from "./Sidebar"
// import drugsData from "../../assets/data/formulary/drugs.json"
// import typewiseDrugsData from "../../assets/data/formulary/typewise_drugs.json"
// import statePlansData from "../../assets/data/formulary/state_plans_data.json"
// import usPlansData from "../../assets/data/formulary/US_plans_data.json"

// export function Dashboard() {
//   // State management
//   const [activeTab, setActiveTab] = useState("drug-list")
//   const [selectedDrugs, setSelectedDrugs] = useState([])
//   const [selectedPlans, setSelectedPlans] = useState([])
//   const [therapeuticArea, setTherapeuticArea] = useState("All Therapeutic Areas")
//   const [selectedState, setSelectedState] = useState("All States")
//   const [results, setResults] = useState([]) // Added results state

//   // Combine drug and plan data
//   const combinedDrugs = {
//     "All Therapeutic Areas": drugsData["All Therapeutic Areas"] || [],
//     ...typewiseDrugsData,
//   }

//   const combinedPlans = {
//     "All States": usPlansData["all states"] || {},
//     ...statePlansData,
//   }

//   // Handlers for selecting and removing drugs/plans
//   const handleDrugSelect = (drug) => {
//     setSelectedDrugs((prev) =>
//       prev.some((d) => d.id === drug.id)
//         ? prev.filter((d) => d.id !== drug.id) // Remove drug if already selected
//         : [...prev, drug]
//     )
//   }

//   const handlePlanSelect = (plan) => {
//     setSelectedPlans((prev) =>
//       prev.some((p) => p.id === plan.id)
//         ? prev.filter((p) => p.id !== plan.id) // Remove plan if already selected
//         : [...prev, plan]
//     )
//   }

//   const handleRemoveDrug = (drug) => {
//     setSelectedDrugs((prev) => prev.filter((d) => d.id !== drug.id))
//   }

//   const handleRemovePlan = (plan) => {
//     setSelectedPlans((prev) => prev.filter((p) => p.id !== plan.id))
//   }

//   const clearAllDrugs = () => {
//     setSelectedDrugs([])
//   }

//   const clearAllPlans = () => {
//     setSelectedPlans([])
//   }

//   // Handler for viewing results
//   const handleViewResults = () => {
//     const payload = {
//       therapeuticArea,
//       selectedDrugs,
//       selectedState,
//       selectedPlans,
//     }

//     fetch (`${import.meta.env.VITE_API_URL}/formulary`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(payload),
//     })
//       .then((response) => response.json())
//       .then((data) => {
//         console.log("Submitted:", data)
//         setResults(data) // Set results to state
//         setActiveTab("results") // Switch to results tab
//       })
//       .catch((error) => console.error("Error:", error))
//   }

//   // Group results by drug name
//   const groupedResults = results.reduce((acc, result) => {
//     const drugName = result["Drug Name"] || "Unknown Drug";
//     if (!acc[drugName]) {
//       acc[drugName] = [];
//     }
//     acc[drugName].push(result);
//     return acc;
//   }, {});

//   return (
//     <div className="flex min-h-screen">
//       <div className="flex-1 p-6">
//         <Tabs
//           defaultValue="drug-list"
//           className="w-full"
//           onValueChange={setActiveTab}
//           value={activeTab} // Ensure the active tab is controlled
//         >
//           <TabsList className="border-b w-full justify-start rounded-none h-auto p-0 bg-transparent">
//             {/* Drug List Tab */}
//             <TabsTrigger
//               value="drug-list"
//               className="
//                 data-[state=active]:w-[211px] 
//                 data-[state=active]:h-[32px] 
//                 data-[state=active]:rounded-[19px] 
//                 data-[state=active]:bg-green-500 
//                 data-[state=active]:border-green-600 
//                 data-[state=active]:text-white 
//                 data-[state=active]:font-bold 
//                 border-b-2 border-transparent rounded-none
//               "
//             >
//               Drug List
//             </TabsTrigger>

//             {/* Plan List Tab */}
//             <TabsTrigger
//               value="plan-list"
//               className="
//                 data-[state=active]:w-[211px] 
//                 data-[state=active]:h-[32px] 
//                 data-[state=active]:rounded-[19px] 
//                 data-[state=active]:bg-green-500 
//                 data-[state=active]:border-green-600 
//                 data-[state=active]:text-white 
//                 data-[state=active]:font-bold 
//                 border-b-2 border-transparent rounded-none
//               "
//             >
//               Plan List
//             </TabsTrigger>

//             {/* Results Tab */}
//             <TabsTrigger
//               value="results"
//               className="
//                 data-[state=active]:w-[211px] 
//                 data-[state=active]:h-[32px] 
//                 data-[state=active]:rounded-[19px] 
//                 data-[state=active]:bg-green-500 
//                 data-[state=active]:border-green-600 
//                 data-[state=active]:text-white 
//                 data-[state=active]:font-bold 
//                 border-b-2 border-transparent rounded-none
//               "
//             >
//               Results
//             </TabsTrigger>
//           </TabsList>

//           {/* Drug List Content */}
//           <TabsContent value="drug-list">
//             <DrugList
//               allDrugs={combinedDrugs["All Therapeutic Areas"]}
//               drugsByType={combinedDrugs}
//               onSelect={handleDrugSelect}
//               selectedDrugs={selectedDrugs}
//               therapeuticArea={therapeuticArea}
//               setTherapeuticArea={setTherapeuticArea}
//             />
//           </TabsContent>

//           {/* Plan List Content */}
//           <TabsContent value="plan-list">
//             <PlanList
//               statePlans={statePlansData}
//               usPlans={usPlansData}
//               onSelect={handlePlanSelect}
//               selectedPlans={selectedPlans}
//               selectedState={selectedState}
//               setSelectedState={setSelectedState}
//             />
//           </TabsContent>

//           {/* Results Content */}
//           <TabsContent value="results">
//             <div className="space-y-4">
//               {Object.entries(groupedResults).map(([drugName, drugResults]) => (
//                 <div key={drugName}>
//                   <div className="bg-[#a6ce39] p-3 mb-2 rounded-md">
//                     <h3 className="font-medium text-black">{drugName}</h3>
//                   </div>
//                   <div className="overflow-x-auto">
//                     <table className="min-w-full">
//                       <thead>
//                         <tr>
//                           <th className="px-4 py-2 text-left border-b">Health Plan Name</th>
//                           <th className="px-4 py-2 text-left border-b">Plan Type</th>
//                           <th className="px-4 py-2 text-left border-b">State</th>
//                           <th className="px-4 py-2 text-left border-b">Coverage</th>
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {drugResults.map((result, index) => (
//                           <tr key={index} className="hover:bg-gray-50">
//                             <td className="px-4 py-2 border-b">{result.Name}</td>
//                             <td className="px-4 py-2 border-b">{result["Plan Type"]}</td>
//                             <td className="px-4 py-2 border-b">{result.State}</td>
//                             <td className="px-4 py-2 border-b">
//                               {result.Covered.includes("No") ? (
//                                 <span className="text-red-500">❌</span>
//                               ) : (
//                                 <span className="text-green-500">✔️</span>
//                               )}
//                             </td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   </div>
//                 </div>
//               ))}
//               {results.length === 0 && (
//                 <div className="text-center text-gray-500">No results to display.</div>
//               )}
//             </div>
//           </TabsContent>
//         </Tabs>
//       </div>

//       {/* Sidebar */}
//       <div className="w-80 border-l bg-gray-100">
//         <Sidebar
//           therapeuticArea={therapeuticArea}
//           selectedDrugs={selectedDrugs}
//           selectedState={selectedState}
//           selectedPlans={selectedPlans}
//           onRemoveDrug={handleRemoveDrug}
//           onRemovePlan={handleRemovePlan}
//           onViewResults={handleViewResults}
//           clearAllDrugs={clearAllDrugs}
//           clearAllPlans={clearAllPlans}
//         />
//       </div>
//     </div>
//   )
// }


"use client"

import React, { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DrugList } from "./DrugList"
import { PlanList } from "./PlanList"
import { Sidebar } from "./Sidebar"
import drugsData from "../../assets/data/formulary/drugs.json"
import typewiseDrugsData from "../../assets/data/formulary/typewise_drugs.json"
import statePlansData from "../../assets/data/formulary/state_plans_data.json"
import usPlansData from "../../assets/data/formulary/US_plans_data.json"

export function Dashboard() {
  // State management
  const [activeTab, setActiveTab] = useState("drug-list")
  const [selectedDrugs, setSelectedDrugs] = useState([])
  const [selectedPlans, setSelectedPlans] = useState([])
  const [therapeuticArea, setTherapeuticArea] = useState("All Therapeutic Areas")
  const [selectedState, setSelectedState] = useState("All States")
  const [results, setResults] = useState([]) // Added results state

  // Combine drug and plan data
  const combinedDrugs = {
    "All Therapeutic Areas": drugsData["All Therapeutic Areas"] || [],
    ...typewiseDrugsData,
  }

  const combinedPlans = {
    "All States": usPlansData["all states"] || {},
    ...statePlansData,
  }

  // Handlers for selecting and removing drugs/plans
  const handleDrugSelect = (drug) => {
    setSelectedDrugs((prev) =>
      prev.some((d) => d.id === drug.id)
        ? prev.filter((d) => d.id !== drug.id) // Remove drug if already selected
        : [...prev, drug]
    )
  }

  const handlePlanSelect = (plan) => {
    setSelectedPlans((prev) =>
      prev.some((p) => p.id === plan.id)
        ? prev.filter((p) => p.id !== plan.id) // Remove plan if already selected
        : [...prev, plan]
    )
  }

  const handleRemoveDrug = (drug) => {
    setSelectedDrugs((prev) => prev.filter((d) => d.id !== drug.id))
  }

  const handleRemovePlan = (plan) => {
    setSelectedPlans((prev) => prev.filter((p) => p.id !== plan.id))
  }

  const clearAllDrugs = () => {
    setSelectedDrugs([])
  }

  const clearAllPlans = () => {
    setSelectedPlans([])
  }

  // Handler for viewing results
  const handleViewResults = () => {
    // Prepare payload with necessary fields
    const payload = {
      therapeuticArea,
      selectedDrugs: selectedDrugs.map((drug) => ({
        id: drug.id,
        name: drug.name, // Ensure 'name' field exists
      })),
      selectedState,
      selectedPlans: selectedPlans.map((plan) => ({
        id: plan.id,
        name: plan.name, // Ensure 'name' field exists
      })),
    }

    fetch("/formulary", { // Updated to send request to '/formulary'
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Server error: ${response.statusText}`)
        }
        return response.json()
      })
      .then((data) => {
        console.log("Submitted:", data)
        setResults(data) // Set results to state
        setActiveTab("results") // Switch to results tab
      })
      .catch((error) => {
        console.error("Error:", error)
        // Optionally, you can set an error state here to display to the user
      })
  }

  // Group results by drug name
  const groupedResults = results.reduce((acc, result) => {
    const drugName = result["Drug Name"] || "Unknown Drug"
    if (!acc[drugName]) {
      acc[drugName] = []
    }
    acc[drugName].push(result)
    return acc
  }, {})

  return (
    <div className="flex min-h-screen">
      <div className="flex-1 p-6">
        <Tabs
          defaultValue="drug-list"
          className="w-full"
          onValueChange={setActiveTab}
          value={activeTab} // Ensure the active tab is controlled
        >
          <TabsList className="border-b w-full justify-start rounded-none h-auto p-0 bg-transparent">
            {/* Drug List Tab */}
            <TabsTrigger
              value="drug-list"
              className="
                data-[state=active]:w-[211px] 
                data-[state=active]:h-[32px] 
                data-[state=active]:rounded-[19px] 
                data-[state=active]:bg-green-500 
                data-[state=active]:border-green-600 
                data-[state=active]:text-white 
                data-[state=active]:font-bold 
                border-b-2 border-transparent rounded-none
              "
            >
              Drug List
            </TabsTrigger>

            {/* Plan List Tab */}
            <TabsTrigger
              value="plan-list"
              className="
                data-[state=active]:w-[211px] 
                data-[state=active]:h-[32px] 
                data-[state=active]:rounded-[19px] 
                data-[state=active]:bg-green-500 
                data-[state=active]:border-green-600 
                data-[state=active]:text-white 
                data-[state=active]:font-bold 
                border-b-2 border-transparent rounded-none
              "
            >
              Plan List
            </TabsTrigger>

            {/* Results Tab */}
            <TabsTrigger
              value="results"
              className="
                data-[state=active]:w-[211px] 
                data-[state=active]:h-[32px] 
                data-[state=active]:rounded-[19px] 
                data-[state=active]:bg-green-500 
                data-[state=active]:border-green-600 
                data-[state=active]:text-white 
                data-[state=active]:font-bold 
                border-b-2 border-transparent rounded-none
              "
            >
              Results
            </TabsTrigger>
          </TabsList>

          {/* Drug List Content */}
          <TabsContent value="drug-list">
            <DrugList
              allDrugs={combinedDrugs["All Therapeutic Areas"]}
              drugsByType={combinedDrugs}
              onSelect={handleDrugSelect}
              selectedDrugs={selectedDrugs}
              therapeuticArea={therapeuticArea}
              setTherapeuticArea={setTherapeuticArea}
            />
          </TabsContent>

          {/* Plan List Content */}
          <TabsContent value="plan-list">
            <PlanList
              statePlans={statePlansData}
              usPlans={usPlansData}
              onSelect={handlePlanSelect}
              selectedPlans={selectedPlans}
              selectedState={selectedState}
              setSelectedState={setSelectedState}
            />
          </TabsContent>

          {/* Results Content */}
          <TabsContent value="results">
            <div className="space-y-4">
              {Object.entries(groupedResults).map(([drugName, drugResults]) => (
                <div key={drugName}>
                  <div className="bg-[#a6ce39] p-3 mb-2 rounded-md">
                    <h3 className="font-medium text-black">{drugName}</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr>
                          <th className="px-4 py-2 text-left border-b">Health Plan Name</th>
                          <th className="px-4 py-2 text-left border-b">Plan Type</th>
                          <th className="px-4 py-2 text-left border-b">State</th>
                          <th className="px-4 py-2 text-left border-b">Coverage</th>
                        </tr>
                      </thead>
                      <tbody>
                        {drugResults.map((result, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-2 border-b">{result.Name}</td>
                            <td className="px-4 py-2 border-b">{result["Plan Type"]}</td>
                            <td className="px-4 py-2 border-b">{result.State}</td>
                            <td className="px-4 py-2 border-b">
                              {result.Covered.includes("No") ? (
                                <span className="text-red-500">❌</span>
                              ) : (
                                <span className="text-green-500">✔️</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
              {results.length === 0 && activeTab === "results" && (
                <div className="text-center text-gray-500">No results to display.</div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Sidebar */}
      <div className="w-80 border-l bg-gray-100">
        <Sidebar
          therapeuticArea={therapeuticArea}
          selectedDrugs={selectedDrugs}
          selectedState={selectedState}
          selectedPlans={selectedPlans}
          onRemoveDrug={handleRemoveDrug}
          onRemovePlan={handleRemovePlan}
          onViewResults={handleViewResults}
          clearAllDrugs={clearAllDrugs}
          clearAllPlans={clearAllPlans}
        />
      </div>
    </div>
  )
}
