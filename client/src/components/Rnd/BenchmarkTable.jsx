// "use client";

// import { useState, useEffect } from "react";
// import { Loader2, Info, Settings, BarChart3 } from "lucide-react";
// import { toast } from "react-toastify";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import {
//   Tooltip,
//   TooltipContent,
//   TooltipProvider,
//   TooltipTrigger,
// } from "@/components/ui/tooltip";
// import { Badge } from "@/components/ui/badge";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { Progress } from "@/components/ui/progress";
// import { Slider } from "@/components/ui/slider";

// function capitalizeName(name) {
//   return name
//     .split(" ")
//     .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
//     .join(" ");
// }

// export default function BenchmarkTable({ onWeightsUpdate }) {
//   const [benchmarkData, setBenchmarkData] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [weights, setWeights] = useState({
//     enrollment: 0.2,
//     mechanism: 0.15,
//     justification: 0.2,
//     prevalence: 0.2,
//     bausch_presence: 0.15,
//     safety_efficacy: 0.1,
//   });
//   const [isUpdating, setIsUpdating] = useState(false);
//   const [activeTab, setActiveTab] = useState("dashboard");
//   const [sortBy, setSortBy] = useState("score");
//   const [sortOrder, setSortOrder] = useState("desc");
//   const [lockedWeights, setLockedWeights] = useState({})
//   // convert 0‑1 (exclusive) OR 1‑5 score to % width
//   const getProgressWidth = (score) => {
//     const n = parseFloat(score);
//     if (isNaN(n)) return 0;
//     return n < 1 ? n * 100 : (n / 5) * 100; // 1–5 → divide, <1 → multiply
//   };

//   const fetchBenchmarkData = async () => {
//     setIsLoading(true);
//     try {
//       const res = await fetch(
//         `${import.meta.env.VITE_API_URL}/api/benchmark-table`,
//         {
//           headers: { "Content-Type": "application/json" },
//         }
//       );
//       const data = await res.json();
//       if (data.error) {
//         setError(data.error);
//         toast.error(data.error);
//       } else {
//         setBenchmarkData(data.benchmark_table);
//       }
//     } catch (e) {
//       console.error(e);
//       setError("Error fetching benchmark data.");
//       toast.error("Failed to update benchmark table");
//     }
//     setIsLoading(false);
//   };

//   useEffect(() => {
//     fetchBenchmarkData();
//   }, []);

//   const handleWeightChange = (key, val) => {
//     const num = Array.isArray(val) ? val[0] : Number.parseFloat(val);
//     if (isNaN(num) || num < 0 || num > 1) return;

//     // Calculate the change in weight
//     const delta = num - weights[key];

//     // If no change, return early
//     if (delta === 0) return;

//     // Create a new weights object
//     const newWeights = { ...weights, [key]: num };

//     // Get keys of other weights to adjust
//     const otherKeys = Object.keys(weights).filter((k) => k !== key && !lockedWeights[k]);
//     const totalOtherWeights = otherKeys.reduce((sum, k) => sum + weights[k], 0);

//     // If there are no other weights or their sum is 0, we can't adjust
//     if (totalOtherWeights <= 0) return;

//     // Distribute the delta proportionally among other weights
//     otherKeys.forEach((k) => {
//       const proportion = weights[k] / totalOtherWeights;
//       newWeights[k] = Math.max(0, weights[k] - delta * proportion);
//       // Round to 2 decimal places
//       newWeights[k] = Math.round(newWeights[k] * 100) / 100;
//     });

//     // Fix any rounding errors to ensure sum is exactly 1.0
//     const newTotal = Object.values(newWeights).reduce((sum, w) => sum + w, 0);
//     const roundingError = 1 - newTotal;

//     if (Math.abs(roundingError) > 0.001) {
//       // Find the largest weight that's not the one being adjusted
//       const largestKey = otherKeys.reduce((a, b) =>
//         (newWeights[a] > newWeights[b] ? a : b), otherKeys[0] || key
//       );
//       if (largestKey) {
//         newWeights[largestKey] = Math.round((newWeights[largestKey] + roundingError) * 100) / 100
//       }
//     }

//     setWeights(newWeights);
//   };

//   const toggleLock = (key) => {
//     setLockedWeights((prev) => ({
//       ...prev,
//       [key]: !prev[key],
//     }))
//   }

//   const updateBenchmark = async () => {
//     setIsUpdating(true);
//     try {
//       const [pieRes, benchRes] = await Promise.all([
//         fetch(`${import.meta.env.VITE_API_URL}/api/pie-chart`, {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ weights }),
//         }),
//         fetch(`${import.meta.env.VITE_API_URL}/api/benchmark-table`, {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ weights }),
//         }),
//       ]);
//       const pie = await pieRes.json();
//       const bench = await benchRes.json();
//       setBenchmarkData(bench.benchmark_table);
//       if (onWeightsUpdate && pie.pie_chart_data)
//         onWeightsUpdate(weights, pie.pie_chart_data);
//       toast.success("Scores updated successfully");
//       setActiveTab("dashboard");
//     } catch (e) {
//       console.error(e);
//       toast.error("Failed to update scores");
//     }
//     setIsUpdating(false);
//   };

//   const totalWeight = Object.values(weights).reduce((s, w) => s + w, 0);
//   const isValidWeights = Math.abs(totalWeight - 1) < 0.01;

//   const sortedData = [...benchmarkData].sort((a, b) => {
//     if (sortBy === "score") {
//       return sortOrder === "desc"
//         ? b.benchmark_score - a.benchmark_score
//         : a.benchmark_score - b.benchmark_score;
//     }
//     return sortOrder === "desc"
//       ? b.disease.localeCompare(a.disease)
//       : a.disease.localeCompare(b.disease);
//   });

//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center h-full">
//         <Loader2 className="animate-spin mr-2 h-5 w-5 text-primary" />
//         <span>Loading benchmark analysis...</span>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <Card className="h-full shadow-md">
//         <CardHeader className="pb-2 bg-[#f9faf5]">
//           <CardTitle className="text-xl font-semibold">
//             Benchmark Analysis
//           </CardTitle>
//         </CardHeader>
//         <CardContent className="p-6">
//           <div className="text-destructive p-4 bg-destructive/10 rounded-md flex items-center gap-2">
//             <span className="text-destructive">Error: {error}</span>
//           </div>
//         </CardContent>
//       </Card>
//     );
//   }

//   const breakdownKeys = [
//     ["Enrollment", "No_of_Patient_Treated"],
//     ["Mechanism", "Gut_Microbiome_Association"],
//     ["Justification", "Rifaximin_Treatment"],
//     ["Prevalence", "Prevalence"],
//     ["Bausch", "Bausch_Presence"],
//     ["Safety", "Safety_Efficacy"],
//   ];

//   return (
//     <Card className="h-full shadow-md border-slate-200">
//       <CardHeader className="pb-2 bg-[#f9faf5]">
//         <div className="flex justify-between items-center">
//           <div className="flex items-center gap-2">
//             <BarChart3 className="h-5 w-5 text-[#a6ce39]" />
//             <CardTitle className="text-xl font-semibold">
//               Benchmark Analysis
//             </CardTitle>
//           </div>
//           <TooltipProvider>
//             <Tooltip>
//               <TooltipTrigger asChild>
//                 <Button variant="ghost" size="icon" className="h-8 w-8">
//                   <Info className="h-4 w-4 text-slate-500" />
//                 </Button>
//               </TooltipTrigger>
//               <TooltipContent className="max-w-xs rounded-[12px]">
//                 <p className="text-xs">
//                   Benchmark scores are calculated based on weighted criteria.
//                   Adjust weights in the settings tab.
//                 </p>
//               </TooltipContent>
//             </Tooltip>
//           </TooltipProvider>
//         </div>
//       </CardHeader>
//       <CardContent className="p-0">
//         <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
//           {/* Tabs list */}
//           <div className="px-6 pt-4">
//             <TabsList className="grid w-full grid-cols-2 bg-[#f5f8e8]">
//               <TabsTrigger
//                 value="dashboard"
//                 className="data-[state=active]:bg-[#a6ce39] data-[state=active]:text-white flex items-center gap-2 rounded-[12px]"
//               >
//                 <BarChart3 className="h-4 w-4" /> Dashboard
//               </TabsTrigger>
//               <TabsTrigger
//                 value="weights"
//                 className="data-[state=active]:bg-[#a6ce39] data-[state=active]:text-white flex items-center gap-2 rounded-[12px]"
//               >
//                 <Settings className="h-4 w-4" /> Adjust Weights
//               </TabsTrigger>
//             </TabsList>
//           </div>

//           {/* Dashboard */}
//           <TabsContent value="dashboard" className="mt-0">
//             <div className="p-4 flex justify-between items-center border-b">
//               <div className="text-sm font-medium text-slate-700">
//                 {sortedData.length} Disease Benchmarks
//               </div>
//               <div className="flex items-center gap-2">
//                 <span className="text-sm text-slate-500">Sort by:</span>
//                 <Select
//                   value={`${sortBy}-${sortOrder}`}
//                   onValueChange={(v) => {
//                     const [f, o] = v.split("-");
//                     setSortBy(f);
//                     setSortOrder(o);
//                   }}
//                 >
//                   <SelectTrigger className="h-8 w-[180px] bg-white rounded-[12px] border-[#a6ce39] focus:ring-[#a6ce39]">
//                     <SelectValue placeholder="Sort by" />
//                   </SelectTrigger>
//                   <SelectContent className="bg-white">
//                     <SelectItem value="score-desc">
//                       Score (High to Low)
//                     </SelectItem>
//                     <SelectItem value="score-asc">
//                       Score (Low to High)
//                     </SelectItem>
//                     <SelectItem value="name-asc">Disease Name (A-Z)</SelectItem>
//                     <SelectItem value="name-desc">
//                       Disease Name (Z-A)
//                     </SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>
//             </div>

//             <ScrollArea className="h-[350px]">
//               {/* 2 cards per row on md and up */}
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-4">
//                 {sortedData.map((item, idx) => (
//                   <Card
//                     key={idx}
//                     className="overflow-hidden border-slate-200 hover:shadow-md transition-shadow"
//                   >
//                     <CardHeader className="p-4 pb-2 bg-[#f9faf5] border-b">
//                       <div className="flex justify-between items-start">
//                         <CardTitle className="text-base font-medium text-slate-800 truncate">
//                           {capitalizeName(item.disease)}
//                         </CardTitle>
//                         <Badge
//                           variant="outline"
//                           className="font-mono bg-white text-slate-600 border-slate-300"
//                         >
//                           {item.benchmark_score}
//                         </Badge>
//                       </div>
//                     </CardHeader>
//                     <CardContent className="p-4">
//                       <div className="space-y-4">
//                         {/* overall bar */}
//                         <div className="space-y-1">
//                           <div className="flex justify-between items-center">
//                             <span className="text-sm text-slate-700">
//                               Benchmark Score
//                             </span>
//                             <span className="text-sm font-medium">
//                               {item.benchmark_score}
//                             </span>
//                           </div>
//                           <Progress
//                             value={getProgressWidth(item.benchmark_score)}
//                             className="h-2 bg-slate-100"
//                           />
//                         </div>
//                         {/* breakdown */}
//                         {item.score_breakdown_distribution && (
//                           <div className="grid grid-cols-2 gap-2">
//                             {breakdownKeys.map(([label, key]) => (
//                               <div key={key} className="space-y-1">
//                                 <div className="flex justify-between">
//                                   <span className="text-sm text-slate-700">
//                                     {label}:{" "}
//                                   </span>
//                                   <span className="text-sm font-medium">
//                                     {item.score_breakdown_distribution[key]}
//                                   </span>
//                                 </div>
//                                 <Progress
//                                   value={getProgressWidth(
//                                     item.score_breakdown_distribution[key]
//                                   )}
//                                   className="h-1 bg-slate-100"
//                                 />
//                               </div>
//                             ))}
//                           </div>
//                         )}
//                       </div>
//                     </CardContent>
//                   </Card>
//                 ))}
//               </div>
//             </ScrollArea>
//           </TabsContent>

//           {/* Weights */}
//           <TabsContent value="weights" className="mt-0">
//             <div className="px-6 py-4 h-[350px]">
//               <div className="mb-4 bg-[#f5f8e8] p-4 rounded-md border border-[#e7f0d1]">
//                 <h3 className="text-sm font-medium text-[#4b6a1e] mb-2">
//                   Weight Configuration
//                 </h3>
//                 <p className="text-sm text-[#5c7a2e]">
//                   Adjust the weight factors below to recalculate disease scores.
//                   The sum of all weights must equal 1.0 for accurate
//                   benchmarking.
//                 </p>
//               </div>
//               <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
//                 {Object.entries(weights).map(([k, v]) => (
//                   <div key={k} className="space-y-1">
//                     <div className="flex justify-between">
//                       {/* <label className="text-xs text-muted-foreground capitalize">
//                         {k.replace("_", " ")}
//                       </label> */}
//                                     <label className="text-xs text-muted-foreground capitalize flex items-center gap-1">
//                 {k.replace("_", " ")}
//                 <button
//                   onClick={() => toggleLock(k)}
//                   className="focus:outline-none"
//                   aria-label={lockedWeights[k] ? "Unlock weight" : "Lock weight"}
//                 >
//                   {lockedWeights[k] ? (
//                     <svg
//                       xmlns="http://www.w3.org/2000/svg"
//                       width="12"
//                       height="12"
//                       viewBox="0 0 24 24"
//                       fill="none"
//                       stroke="currentColor"
//                       strokeWidth="2"
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       className="text-orange-500"
//                     >
//                       <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
//                       <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
//                     </svg>
//                   ) : (
//                     <svg
//                       xmlns="http://www.w3.org/2000/svg"
//                       width="12"
//                       height="12"
//                       viewBox="0 0 24 24"
//                       fill="none"
//                       stroke="currentColor"
//                       strokeWidth="2"
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       className="text-gray-400"
//                     >
//                       <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
//                       <path d="M7 11V7a5 5 0 0 1 9.9-1"></path>
//                     </svg>
//                   )}
//                 </button>
//               </label>
//                       <span className="text-xs text-slate-500">
//                         {v.toFixed(2)}
//                       </span>
//                     </div>
//                     <Slider value={[v]} min={0} max={1} step={0.01} onValueChange={(val) => handleWeightChange(k, val)} className={`py-2 [&>span]:bg-white [&>span]:border-white [&>span]:shadow-md [&>span:before]:bg-[#a6ce39] ${lockedWeights[k] ? "opacity-70" : ""}`}
//               disabled={lockedWeights[k]} />
//                   </div>
//                 ))}
//               </div>
//               <div className="flex items-center justify-between bg-[#f9faf5] p-3 rounded-md">
//                 <div
//                   className={`text-xs ${
//                     isValidWeights ? "text-green-600" : "text-destructive"
//                   }`}
//                 >
//                   Total: {totalWeight.toFixed(2)}{" "}
//                   {isValidWeights ? "✓" : "(should equal 1.0)"}
//                 </div>
//                 <Button
//                   onClick={updateBenchmark}
//                   disabled={!isValidWeights || isUpdating}
//                   size="sm"
//                   className="bg-[#a6ce39] hover:bg-[#95b933] text-white font-medium rounded-[12px]"
//                 >
//                   {isUpdating ? (
//                     <>
//                       <Loader2 className="mr-2 h-4 w-4 animate-spin " />
//                       Updating...
//                     </>
//                   ) : (
//                     "Update Scores"
//                   )}
//                 </Button>
//               </div>
//             </div>
//           </TabsContent>
//         </Tabs>
//       </CardContent>
//     </Card>
//   );
// }


"use client"

import { useState, useEffect } from "react"
import { Loader2, Info, Settings, BarChart3 } from "lucide-react"
import { toast } from "react-toastify"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"

function capitalizeName(name) {
  return name
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ")
}

export default function BenchmarkTable({ onWeightsUpdate }) {
  const [benchmarkData, setBenchmarkData] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [weights, setWeights] = useState({
    enrollment: 0.2,
    mechanism: 0.15,
    justification: 0.2,
    prevalence: 0.2,
    bausch_presence: 0.15,
    safety_efficacy: 0.1,
  })
  const [isUpdating, setIsUpdating] = useState(false)
  const [activeTab, setActiveTab] = useState("dashboard")
  const [sortBy, setSortBy] = useState("score")
  const [sortOrder, setSortOrder] = useState("desc")
  const [lockedWeights, setLockedWeights] = useState({})
  // convert 0‑1 (exclusive) OR 1‑5 score to % width
  const getProgressWidth = (score) => {
    const n = Number.parseFloat(score)
    if (isNaN(n)) return 0
    return n < 1 ? n * 100 : (n / 5) * 100 // 1–5 → divide, <1 → multiply
  }

  const fetchBenchmarkData = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/benchmark-table`, {
        headers: { "Content-Type": "application/json" },
      })
      const data = await res.json()
      if (data.error) {
        setError(data.error)
        toast.error(data.error)
      } else {
        setBenchmarkData(data.benchmark_table)
      }
    } catch (e) {
      console.error(e)
      setError("Error fetching benchmark data.")
      toast.error("Failed to update benchmark table")
    }
    setIsLoading(false)
  }

  useEffect(() => {
    fetchBenchmarkData()
  }, [])

  const handleWeightChange = (key, val) => {
    const num = Array.isArray(val) ? val[0] : Number.parseFloat(val)
    if (isNaN(num) || num < 0 || num > 1) return

    // Calculate the change in weight
    const delta = num - weights[key]

    // If no change, return early
    if (delta === 0) return

    // Create a new weights object
    const newWeights = { ...weights, [key]: num }

    // Get keys of other weights to adjust
    const otherKeys = Object.keys(weights).filter((k) => k !== key && !lockedWeights[k])

    // If all other weights are locked, we can't adjust
    if (otherKeys.length === 0) return

    // Calculate total of unlocked weights (excluding the current one)
    const totalOtherWeights = otherKeys.reduce((sum, k) => sum + weights[k], 0)

    // Handle special case when all other weights are zero
    if (totalOtherWeights <= 0.001 && delta < 0) {
      // If reducing the current weight and others are zero, distribute evenly
      const valueToDistribute = Math.abs(delta) / otherKeys.length
      otherKeys.forEach((k) => {
        newWeights[k] = valueToDistribute
      })
    } else if (totalOtherWeights <= 0.001 && delta > 0) {
      // If increasing the current weight and others are zero, we can't adjust
      return
    } else {
      // Normal case: distribute the delta proportionally among other weights
      otherKeys.forEach((k) => {
        const proportion = weights[k] / totalOtherWeights
        newWeights[k] = Math.max(0, Math.min(1, weights[k] - delta * proportion))
        // Round to 2 decimal places
        newWeights[k] = Math.round(newWeights[k] * 100) / 100
      })
    }

    // Fix any rounding errors to ensure sum is exactly 1.0
    const newTotal = Object.values(newWeights).reduce((sum, w) => sum + w, 0)
    const roundingError = 1 - newTotal

    if (Math.abs(roundingError) > 0.001) {
      // Find the largest unlocked weight that's not the one being adjusted
      const adjustableKeys = otherKeys.filter((k) => newWeights[k] > 0)

      if (adjustableKeys.length > 0) {
        const largestKey = adjustableKeys.reduce((a, b) => (newWeights[a] > newWeights[b] ? a : b), adjustableKeys[0])
        newWeights[largestKey] = Math.max(0, Math.round((newWeights[largestKey] + roundingError) * 100) / 100)
      } else if (roundingError < 0 && newWeights[key] > Math.abs(roundingError)) {
        // If no other weights can be adjusted, adjust the current one
        newWeights[key] += roundingError
        newWeights[key] = Math.round(newWeights[key] * 100) / 100
      }
    }

    setWeights(newWeights)
  }

  const toggleLock = (key) => {
    setLockedWeights((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const updateBenchmark = async () => {
    setIsUpdating(true)
    try {
      const [pieRes, benchRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/api/pie-chart`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ weights }),
        }),
        fetch(`${import.meta.env.VITE_API_URL}/api/benchmark-table`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ weights }),
        }),
      ])
      const pie = await pieRes.json()
      const bench = await benchRes.json()
      setBenchmarkData(bench.benchmark_table)
      if (onWeightsUpdate && pie.pie_chart_data) onWeightsUpdate(weights, pie.pie_chart_data)
      toast.success("Scores updated successfully")
      setActiveTab("dashboard")
    } catch (e) {
      console.error(e)
      toast.error("Failed to update scores")
    }
    setIsUpdating(false)
  }

  const totalWeight = Object.values(weights).reduce((s, w) => s + w, 0)
  const isValidWeights = Math.abs(totalWeight - 1) < 0.01

  const sortedData = [...benchmarkData].sort((a, b) => {
    if (sortBy === "score") {
      return sortOrder === "desc" ? b.benchmark_score - a.benchmark_score : a.benchmark_score - b.benchmark_score
    }
    return sortOrder === "desc" ? b.disease.localeCompare(a.disease) : a.disease.localeCompare(b.disease)
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="animate-spin mr-2 h-5 w-5 text-primary" />
        <span>Loading benchmark analysis...</span>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="h-full shadow-md">
        <CardHeader className="pb-2 bg-[#f9faf5]">
          <CardTitle className="text-xl font-semibold">Benchmark Analysis</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-destructive p-4 bg-destructive/10 rounded-md flex items-center gap-2">
            <span className="text-destructive">Error: {error}</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  const breakdownKeys = [
    ["Enrollment", "No_of_Patient_Treated"],
    ["Mechanism", "Gut_Microbiome_Association"],
    ["Justification", "Rifaximin_Treatment"],
    ["Prevalence", "Prevalence"],
    ["Bausch", "Bausch_Presence"],
    ["Safety", "Safety_Efficacy"],
  ]

  return (
    <Card className="h-full shadow-md border-slate-200">
      <CardHeader className="pb-2 bg-[#f9faf5]">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-[#a6ce39]" />
            <CardTitle className="text-xl font-semibold">Benchmark Analysis</CardTitle>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Info className="h-4 w-4 text-slate-500" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs rounded-[12px]">
                <p className="text-xs">
                  Benchmark scores are calculated based on weighted criteria. Adjust weights in the settings tab.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Tabs list */}
          <div className="px-6 pt-4">
            <TabsList className="grid w-full grid-cols-2 bg-[#f5f8e8]">
              <TabsTrigger
                value="dashboard"
                className="data-[state=active]:bg-[#a6ce39] data-[state=active]:text-white flex items-center gap-2 rounded-[12px]"
              >
                <BarChart3 className="h-4 w-4" /> Dashboard
              </TabsTrigger>
              <TabsTrigger
                value="weights"
                className="data-[state=active]:bg-[#a6ce39] data-[state=active]:text-white flex items-center gap-2 rounded-[12px]"
              >
                <Settings className="h-4 w-4" /> Adjust Weights
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Dashboard */}
          <TabsContent value="dashboard" className="mt-0">
            <div className="p-4 flex justify-between items-center border-b">
              <div className="text-sm font-medium text-slate-700">{sortedData.length} Disease Benchmarks</div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500">Sort by:</span>
                <Select
                  value={`${sortBy}-${sortOrder}`}
                  onValueChange={(v) => {
                    const [f, o] = v.split("-")
                    setSortBy(f)
                    setSortOrder(o)
                  }}
                >
                  <SelectTrigger className="h-8 w-[180px] bg-white rounded-[12px] border-[#a6ce39] focus:ring-[#a6ce39]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="score-desc">Score (High to Low)</SelectItem>
                    <SelectItem value="score-asc">Score (Low to High)</SelectItem>
                    <SelectItem value="name-asc">Disease Name (A-Z)</SelectItem>
                    <SelectItem value="name-desc">Disease Name (Z-A)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <ScrollArea className="h-[350px]">
              {/* 2 cards per row on md and up */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-4">
                {sortedData.map((item, idx) => (
                  <Card key={idx} className="overflow-hidden border-slate-200 hover:shadow-md transition-shadow">
                    <CardHeader className="p-4 pb-2 bg-[#f9faf5] border-b">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-base font-medium text-slate-800 truncate">
                          {capitalizeName(item.disease)}
                        </CardTitle>
                        <Badge variant="outline" className="font-mono bg-white text-slate-600 border-slate-300">
                          {item.benchmark_score}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="space-y-4">
                        {/* overall bar */}
                        <div className="space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-700">Benchmark Score</span>
                            <span className="text-sm font-medium">{item.benchmark_score}</span>
                          </div>
                          <Progress value={getProgressWidth(item.benchmark_score)} className="h-2 bg-slate-100" />
                        </div>
                        {/* breakdown */}
                        {item.score_breakdown_distribution && (
                          <div className="grid grid-cols-2 gap-2">
                            {breakdownKeys.map(([label, key]) => (
                              <div key={key} className="space-y-1">
                                <div className="flex justify-between">
                                  <span className="text-sm text-slate-700">{label}: </span>
                                  <span className="text-sm font-medium">{item.score_breakdown_distribution[key]}</span>
                                </div>
                                <Progress
                                  value={getProgressWidth(item.score_breakdown_distribution[key])}
                                  className="h-1 bg-slate-100"
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Weights */}
          <TabsContent value="weights" className="mt-0">
            <div className="px-6 py-4 h-[350px]">
              <div className="mb-4 bg-[#f5f8e8] p-4 rounded-md border border-[#e7f0d1]">
                <h3 className="text-sm font-medium text-[#4b6a1e] mb-2">Weight Configuration</h3>
                <p className="text-sm text-[#5c7a2e]">
                  Adjust the weight factors below to recalculate disease scores. The sum of all weights must equal 1.0
                  for accurate benchmarking.
                </p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                {Object.entries(weights).map(([k, v]) => (
                  <div key={k} className="space-y-1">
                    <div className="flex justify-between">
                      {/* <label className="text-xs text-muted-foreground capitalize">
                        {k.replace("_", " ")}
                      </label> */}
                      <label className="text-xs text-muted-foreground capitalize flex items-center gap-1">
                        {k.replace("_", " ")}
                        <button
                          onClick={() => toggleLock(k)}
                          className="focus:outline-none"
                          aria-label={lockedWeights[k] ? "Unlock weight" : "Lock weight"}
                        >
                          {lockedWeights[k] ? (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="text-orange-500"
                            >
                              <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
                              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                            </svg>
                          ) : (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="text-gray-400"
                            >
                              <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
                              <path d="M7 11V7a5 5 0 0 1 9.9-1"></path>
                            </svg>
                          )}
                        </button>
                      </label>
                      <span className="text-xs text-slate-500">{v.toFixed(2)}</span>
                    </div>
                    <Slider
                      value={[v]}
                      min={0}
                      max={1}
                      step={0.01}
                      onValueChange={(val) => handleWeightChange(k, val)}
                      className={`py-2 [&>span]:bg-white [&>span]:border-white [&>span]:shadow-[20px] [&>span:before]:bg-[#a6ce39] ${lockedWeights[k] ? "opacity-70" : ""}`}
                      disabled={lockedWeights[k]}
                    />
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between bg-[#f9faf5] p-3 rounded-md">
                <div className={`text-xs ${isValidWeights ? "text-green-600" : "text-destructive"}`}>
                  Total: {totalWeight.toFixed(2)} {isValidWeights ? "✓" : "(should equal 1.0)"}
                </div>
                <Button
                  onClick={updateBenchmark}
                  disabled={!isValidWeights || isUpdating}
                  size="sm"
                  className="bg-[#a6ce39] hover:bg-[#95b933] text-white font-medium rounded-[12px]"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin " />
                      Updating...
                    </>
                  ) : (
                    "Update Scores"
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
