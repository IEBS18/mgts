
// "use client"

// import { useState, useEffect } from "react"
// import { Loader2, Info, Settings, BarChart3 } from "lucide-react"
// import { toast } from "react-toastify"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Tabs, TabsContent, TabsTrigger, TabsList } from "@/components/ui/tabs"
// import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
// import { Badge } from "@/components/ui/badge"
// import { ScrollArea } from "@/components/ui/scroll-area"
// import { Progress } from "@/components/ui/progress"
// import { Slider } from "@/components/ui/slider"

// function capitalizeName(name) {
//   return name
//     .split(" ")
//     .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
//     .join(" ")
// }

// function BenchmarkTable({ onWeightsUpdate }) {
//   const [benchmarkData, setBenchmarkData] = useState([])
//   const [isLoading, setIsLoading] = useState(true)
//   const [error, setError] = useState(null)
//   const [weights, setWeights] = useState({
//     enrollment: 0.2,
//     mechanism: 0.15,
//     justification: 0.2,
//     prevalence: 0.2,
//     bausch_presence: 0.15,
//     safety_efficacy: 0.1,
//   })
//   const [isUpdating, setIsUpdating] = useState(false)
//   const [activeTab, setActiveTab] = useState("dashboard")
//   const [sortBy, setSortBy] = useState("score")
//   const [sortOrder, setSortOrder] = useState("desc")

//   const fetchBenchmarkData = async (weights = null) => {
//     setIsLoading(true)
//     try {
//       const response = await fetch(`${import.meta.env.VITE_API_URL}/api/benchmark-table`, {
//         headers: {
//           "Content-Type": "application/json",
//         },
//       })

//       const data = await response.json()
//       if (data.error) {
//         setError(data.error)
//         toast.error(data.error)
//       } else {
//         setBenchmarkData(data.benchmark_table)
//       }
//     } catch (error) {
//       console.error("Error fetching benchmark table:", error)
//       setError("Error fetching benchmark data.")
//       toast.error("Failed to update benchmark table")
//     }
//     setIsLoading(false)
//   }

//   useEffect(() => {
//     fetchBenchmarkData()
//   }, [])

//   const handleWeightChange = (key, val) => {
//     const num = Array.isArray(val) ? val[0] : Number.parseFloat(val)
//     if (isNaN(num) || num < 0 || num > 1) return

//     // Calculate the change in weight
//     const delta = num - weights[key]

//     // If no change, return early
//     if (delta === 0) return

//     // Create a new weights object
//     const newWeights = { ...weights, [key]: num }

//     // Get keys of other weights to adjust
//     const otherKeys = Object.keys(weights).filter((k) => k !== key)
//     const totalOtherWeights = otherKeys.reduce((sum, k) => sum + weights[k], 0)

//     // If there are no other weights or their sum is 0, we can't adjust
//     if (totalOtherWeights <= 0) return

//     // Distribute the delta proportionally among other weights
//     otherKeys.forEach((k) => {
//       const proportion = weights[k] / totalOtherWeights
//       newWeights[k] = Math.max(0, weights[k] - delta * proportion)
//       // Round to 2 decimal places
//       newWeights[k] = Math.round(newWeights[k] * 100) / 100
//     })

//     // Fix any rounding errors to ensure sum is exactly 1.0
//     const newTotal = Object.values(newWeights).reduce((sum, w) => sum + w, 0)
//     const roundingError = 1 - newTotal

//     if (Math.abs(roundingError) > 0.001) {
//       // Find the largest weight that's not the one being adjusted
//       const largestKey = otherKeys.reduce((a, b) => (newWeights[a] > newWeights[b] ? a : b))
//       newWeights[largestKey] = Math.round((newWeights[largestKey] + roundingError) * 100) / 100
//     }

//     setWeights(newWeights)
//   }

//   const updateBenchmark = async () => {
//     setIsUpdating(true)
//     try {
//       // Update both pie chart and benchmark table
//       const [pieChartResponse, benchmarkResponse] = await Promise.all([
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
//       ])

//       // Parse the JSON responses
//       const pieChartData = await pieChartResponse.json()
//       const benchmarkData = await benchmarkResponse.json()

//       // Update benchmark data
//       setBenchmarkData(benchmarkData.benchmark_table)

//       // Pass the updated pie chart data to the parent component
//       if (onWeightsUpdate && pieChartData.pie_chart_data) {
//         onWeightsUpdate(weights, pieChartData.pie_chart_data)
//       }

//       toast.success("Scores updated successfully")
//       setActiveTab("dashboard")
//     } catch (error) {
//       console.error("Error updating scores:", error)
//       toast.error("Failed to update scores")
//     }
//     setIsUpdating(false)
//   }

//   const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0)
//   const isValidWeights = Math.abs(totalWeight - 1) < 0.01

//   const getScoreColor = (score) => {
//     if (score >= 0.8) return "bg-[#e8f5e9] text-[#2e7d32] border-[#a5d6a7]"
//     if (score >= 0.7) return "bg-[#f1f8e9] text-[#558b2f] border-[#c5e1a5]"
//     if (score >= 0.6) return "bg-[#f9fbe7] text-[#827717] border-[#e6ee9c]"
//     if (score >= 0.5) return "bg-[#fff8e1] text-[#ff8f00] border-[#ffe082]"
//     return "bg-[#fff3e0] text-[#ef6c00] border-[#ffcc80]"
//   }

//   const getProgressColor = (score) => {
//     // Convert score to 0-5 scale if it's in 0-1 scale
//     const normalizedScore = score <= 1 ? score * 5 : score

//     if (normalizedScore >= 4.5) return "bg-[#4caf50]"
//     if (normalizedScore >= 3.5) return "bg-[#8bc34a]"
//     if (normalizedScore >= 2.5) return "bg-[#cddc39]"
//     if (normalizedScore >= 1.5) return "bg-[#ffc107]"
//     return "bg-[#ff9800]"
//   }

//   const sortedData = [...benchmarkData].sort((a, b) => {
//     if (sortBy === "score") {
//       return sortOrder === "desc" ? b.benchmark_score - a.benchmark_score : a.benchmark_score - b.benchmark_score
//     } else {
//       return sortOrder === "desc" ? b.disease.localeCompare(a.disease) : a.disease.localeCompare(b.disease)
//     }
//   })

//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center h-full">
//         <Loader2 className="animate-spin mr-2 h-5 w-5 text-primary" />
//         <span>Loading benchmark analysis...</span>
//       </div>
//     )
//   }

//   if (error) {
//     return (
//       <Card className="h-full shadow-md">
//         <CardHeader className="pb-2 bg-[#f9faf5]">
//           <CardTitle className="text-xl font-semibold">Benchmark Analysis</CardTitle>
//         </CardHeader>
//         <CardContent className="p-6">
//           <div className="text-destructive p-4 bg-destructive/10 rounded-md flex items-center gap-2">
//             <span className="text-destructive">Error: {error}</span>
//           </div>
//         </CardContent>
//       </Card>
//     )
//   }

//   return (
//     <Card className="h-full shadow-md border-slate-200">
//       <CardHeader className="pb-2 bg-[#f9faf5]">
//         <div className="flex justify-between items-center">
//           <div className="flex items-center gap-2">
//             <BarChart3 className="h-5 w-5 text-[#a6ce39]" />
//             <CardTitle className="text-xl font-semibold">Benchmark Analysis</CardTitle>
//           </div>
//           <TooltipProvider>
//             <Tooltip>
//               <TooltipTrigger asChild>
//                 <Button variant="ghost" size="icon" className="h-8 w-8">
//                   <Info className="h-4 w-4 text-slate-500" />
//                 </Button>
//               </TooltipTrigger>
//               <TooltipContent className="max-w-xs">
//                 <p className="text-xs">
//                   Benchmark scores are calculated based on weighted criteria. Adjust weights in the settings tab.
//                 </p>
//               </TooltipContent>
//             </Tooltip>
//           </TooltipProvider>
//         </div>
//       </CardHeader>
//       <CardContent className="p-0">
//         <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
//           <div className="px-6 pt-4">
//             <TabsList className="w-full grid grid-cols-2 p-0 bg-[#f5f8e8]">
//               <TabsTrigger
//                 value="dashboard"
//                 className="data-[state=active]:bg-[#f5f8e8] data-[state=active]:text-[#4b6a1e] data-[state=active]:border-b-2 data-[state=active]:border-[#a6ce39] flex items-center justify-center gap-2 py-3 px-4 rounded-t-lg"
//               >
//                 <BarChart3 className="h-4 w-4" />
//                 Dashboard
//               </TabsTrigger>
//               <TabsTrigger
//                 value="weights"
//                 className="data-[state=active]:bg-[#a6ce39] data-[state=active]:text-white flex items-center justify-center gap-2 py-3 px-4 rounded-t-lg"
//               >
//                 <Settings className="h-4 w-4" />
//                 Adjust Weights
//               </TabsTrigger>
//             </TabsList>
//           </div>

//           <TabsContent value="dashboard" className="mt-0">
//             <div className="p-4 flex justify-between items-center border-b">
//               <div className="text-sm font-medium text-slate-700">{sortedData.length} Disease Benchmarks</div>
//               <div className="flex items-center gap-2">
//                 <span className="text-sm text-slate-500">Sort by:</span>
//                 <Select
//                   value={`${sortBy}-${sortOrder}`}
//                   onValueChange={(value) => {
//                     const [field, order] = value.split("-")
//                     setSortBy(field)
//                     setSortOrder(order)
//                   }}
//                 >
//                   <SelectTrigger className="h-8 w-[180px] bg-white rounded-[12px] border-[#a6ce39] focus:ring-[#a6ce39]">
//                     <SelectValue placeholder="Sort by" />
//                   </SelectTrigger>
//                   <SelectContent className="bg-white">
//                     <SelectItem value="score-desc">Score (High to Low)</SelectItem>
//                     <SelectItem value="score-asc">Score (Low to High)</SelectItem>
//                     <SelectItem value="name-asc">Disease Name (A-Z)</SelectItem>
//                     <SelectItem value="name-desc">Disease Name (Z-A)</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>
//             </div>

//             <ScrollArea className="h-[120px]">
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
//                 {sortedData.map((item, index) => (
//                   <Card key={index} className="overflow-hidden border-slate-200 hover:shadow-md transition-shadow">
//                     <CardHeader className="p-4 pb-2 bg-[#f9faf5] border-b">
//                       <div className="flex justify-between items-start">
//                         <CardTitle className="text-base font-medium text-slate-800 truncate">
//                           {capitalizeName(item.disease)}
//                         </CardTitle>
//                         <Badge variant="outline" className={`font-mono ${getScoreColor(item.benchmark_score)}`}>
//                           {item.benchmark_score}
//                         </Badge>
//                       </div>
//                     </CardHeader>
//                     <CardContent className="p-4">
//                       <div className="space-y-4">
//                         <div className="space-y-1">
//                           <div className="flex justify-between items-center">
//                             <span className="text-xs text-slate-500">Benchmark Score</span>
//                             <span className="text-xs font-medium">{item.benchmark_score}</span>
//                           </div>
//                           <Progress
//                             value={Number.parseFloat(item.benchmark_score) * 100}
//                             className={`h-2 ${getProgressColor(item.benchmark_score)}`}
//                           />
//                         </div>

//                         {item.score_breakdown_distribution && (
//                           <div className="grid grid-cols-2 gap-x-2 gap-y-2">
//                             <div className="space-y-1">
//                               <div className="flex justify-between">
//                                 <span className="text-xs text-slate-500">Enrollment: </span>
//                                 <span className="text-xs font-medium">
//                                   {item.score_breakdown_distribution.No_of_Patient_Treated}
//                                 </span>
//                               </div>
//                               <Progress
//                                 value={
//                                   Number.parseFloat(item.score_breakdown_distribution.No_of_Patient_Treated) * 100 * 5
//                                 }
//                                 className="h-1 bg-slate-100"
//                               />
//                             </div>

//                             <div className="space-y-1">
//                               <div className="flex justify-between">
//                                 <span className="text-xs text-slate-500">Mechanism: </span>
//                                 <span className="text-xs font-medium">
//                                   {item.score_breakdown_distribution.Gut_Microbiome_Association}
//                                 </span>
//                               </div>
//                               <Progress
//                                 value={
//                                   Number.parseFloat(item.score_breakdown_distribution.Gut_Microbiome_Association) *
//                                   100 *
//                                   5
//                                 }
//                                 className="h-1 bg-slate-100"
//                               />
//                             </div>

//                             <div className="space-y-1">
//                               <div className="flex justify-between">
//                                 <span className="text-xs text-slate-500">Justification: </span>
//                                 <span className="text-xs font-medium">
//                                   {item.score_breakdown_distribution.Rifaximin_Treatment}
//                                 </span>
//                               </div>
//                               <Progress
//                                 value={
//                                   Number.parseFloat(item.score_breakdown_distribution.Rifaximin_Treatment) * 100 * 5
//                                 }
//                                 className="h-1 bg-slate-100"
//                               />
//                             </div>

//                             <div className="space-y-1">
//                               <div className="flex justify-between">
//                                 <span className="text-xs text-slate-500">Prevalence: </span>
//                                 <span className="text-xs font-medium">
//                                   {item.score_breakdown_distribution.Prevalence}
//                                 </span>
//                               </div>
//                               <Progress
//                                 value={Number.parseFloat(item.score_breakdown_distribution.Prevalence) * 100 * 5}
//                                 className="h-1 bg-slate-100"
//                               />
//                             </div>

//                             <div className="space-y-1">
//                               <div className="flex justify-between">
//                                 <span className="text-xs text-slate-500">Bausch: </span>
//                                 <span className="text-xs font-medium">
//                                   {item.score_breakdown_distribution.Bausch_Presence}
//                                 </span>
//                               </div>
//                               <Progress
//                                 value={Number.parseFloat(item.score_breakdown_distribution.Bausch_Presence) * 100 * 5}
//                                 className="h-1 bg-slate-100"
//                               />
//                             </div>

//                             <div className="space-y-1">
//                               <div className="flex justify-between">
//                                 <span className="text-xs text-slate-500">Safety: </span>
//                                 <span className="text-xs font-medium">
//                                   {item.score_breakdown_distribution.Safety_Efficacy}
//                                 </span>
//                               </div>
//                               <Progress
//                                 value={Number.parseFloat(item.score_breakdown_distribution.Safety_Efficacy) * 100 * 5}
//                                 className="h-1 bg-slate-100"
//                               />
//                             </div>
//                           </div>
//                         )}
//                       </div>
//                     </CardContent>
//                   </Card>
//                 ))}
//               </div>
//             </ScrollArea>
//           </TabsContent>

//           <TabsContent value="weights" className="mt-0">
//             <div className="px-6 py-4 h-[350px]">
//               <div className="mb-6 bg-[#f5f8e8] p-4 rounded-md border border-[#e7f0d1]">
//                 <h3 className="text-sm font-medium text-[#4b6a1e] mb-2">Weight Configuration</h3>
//                 <p className="text-sm text-[#5c7a2e]">
//                   Adjust the weight factors below to recalculate disease scores. The sum of all weights must equal 1.0
//                   for accurate benchmarking.
//                 </p>
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-6">
//                 {Object.entries(weights).map(([key, value]) => (
//                   <div key={key} className="space-y-2">
//                     <div className="flex justify-between">
//                       <label className="text-sm font-medium capitalize">{key.replace("_", " ")}</label>
//                       <span className="text-sm font-medium text-[#4b6a1e]">{value.toFixed(2)}</span>
//                     </div>
//                     <Slider
//                       value={[value]}
//                       min={0}
//                       max={0.5}
//                       step={0.01}
//                       onValueChange={(val) => {
//                         // Auto-adjust other weights to maintain sum of 1.0
//                         const newValue = val[0]
//                         const delta = newValue - weights[key]

//                         if (delta === 0) return

//                         // Calculate how much to distribute among other weights
//                         const otherKeys = Object.keys(weights).filter((k) => k !== key)
//                         const totalOtherWeights = otherKeys.reduce((sum, k) => sum + weights[k], 0)

//                         if (totalOtherWeights <= 0) return

//                         // Create new weights object with adjusted values
//                         const newWeights = { ...weights, [key]: newValue }

//                         // Distribute the delta proportionally among other weights
//                         otherKeys.forEach((k) => {
//                           const proportion = weights[k] / totalOtherWeights
//                           newWeights[k] = Math.max(0, weights[k] - delta * proportion)
//                           // Ensure no negative weights and round to 2 decimal places
//                           newWeights[k] = Math.round(newWeights[k] * 100) / 100
//                         })

//                         // Adjust for any rounding errors to ensure sum is exactly 1.0
//                         const newTotal = Object.values(newWeights).reduce((sum, w) => sum + w, 0)
//                         const roundingError = 1 - newTotal

//                         if (Math.abs(roundingError) > 0.001) {
//                           // Add the rounding error to the largest weight that's not the one being adjusted
//                           const largestKey = otherKeys.reduce((a, b) => (newWeights[a] > newWeights[b] ? a : b))
//                           newWeights[largestKey] = Math.round((newWeights[largestKey] + roundingError) * 100) / 100
//                         }

//                         setWeights(newWeights)
//                       }}
//                       className="py-2 [&>span]:bg-white [&>span]:border-[#a6ce39] [&>span]:shadow-sm [&>span:before]:bg-[#a6ce39]"
//                     />
//                   </div>
//                 ))}
//               </div>

//               <div className="flex items-center justify-between bg-[#f9faf5] p-4 rounded-md">
//                 <div className="text-sm font-medium text-green-600">Total: {totalWeight.toFixed(2)} ✓</div>
//                 <Button
//                   onClick={updateBenchmark}
//                   disabled={isUpdating}
//                   size="md"
//                   className="bg-[#a6ce39] hover:bg-[#95b933] text-white font-medium px-6 py-2 rounded-full"
//                 >
//                   {isUpdating ? (
//                     <>
//                       <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
//   )
// }

// export default BenchmarkTable




"use client"

import { useState, useEffect } from "react"
import { Slider } from "@/components/ui/slider"

const BenchmarkTable = ({ data, onWeightsChange }) => {
  const [weights, setWeights] = useState({
    overall_accuracy: 0.25,
    speed: 0.25,
    memory_usage: 0.25,
    model_size: 0.25,
  })

  const [lockedWeights, setLockedWeights] = useState({})

  useEffect(() => {
    if (onWeightsChange) {
      onWeightsChange(weights)
    }
  }, [weights, onWeightsChange])

  const handleWeightChange = (key, val) => {
    const num = Array.isArray(val) ? val[0] : Number.parseFloat(val)
    if (isNaN(num) || num < 0 || num > 1) return

    // Calculate the change in weight
    const delta = num - weights[key]

    // If no change, return early
    if (delta === 0) return

    // Create a new weights object
    const newWeights = { ...weights, [key]: num }

    // Get keys of other weights to adjust (excluding locked ones)
    const otherKeys = Object.keys(weights).filter((k) => k !== key && !lockedWeights[k])
    const totalOtherWeights = otherKeys.reduce((sum, k) => sum + weights[k], 0)

    // If there are no other weights or their sum is 0, we can't adjust
    if (totalOtherWeights <= 0) return

    // Distribute the delta proportionally among other weights
    otherKeys.forEach((k) => {
      const proportion = weights[k] / totalOtherWeights
      newWeights[k] = Math.max(0, weights[k] - delta * proportion)
      // Round to 2 decimal places
      newWeights[k] = Math.round(newWeights[k] * 100) / 100
    })

    // Fix any rounding errors to ensure sum is exactly 1.0
    const newTotal = Object.values(newWeights).reduce((sum, w) => sum + w, 0)
    const roundingError = 1 - newTotal

    if (Math.abs(roundingError) > 0.001) {
      // Find the largest weight that's not the one being adjusted and not locked
      const largestKey = otherKeys.reduce((a, b) => (newWeights[a] > newWeights[b] ? a : b), otherKeys[0] || key)

      if (largestKey) {
        newWeights[largestKey] = Math.round((newWeights[largestKey] + roundingError) * 100) / 100
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

  return (
    <div className="grid gap-4">
      <div className="relative overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">
                Model
              </th>
              <th scope="col" className="px-6 py-3">
                Overall Accuracy
              </th>
              <th scope="col" className="px-6 py-3">
                Speed
              </th>
              <th scope="col" className="px-6 py-3">
                Memory Usage
              </th>
              <th scope="col" className="px-6 py-3">
                Model Size
              </th>
              <th scope="col" className="px-6 py-3">
                Weighted Score
              </th>
            </tr>
          </thead>
          <tbody>
            {data &&
              data.map((row, index) => (
                <tr key={index} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                  <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    {row.model}
                  </th>
                  <td className="px-6 py-4">{row.overall_accuracy}</td>
                  <td className="px-6 py-4">{row.speed}</td>
                  <td className="px-6 py-4">{row.memory_usage}</td>
                  <td className="px-6 py-4">{row.model_size}</td>
                  <td className="px-6 py-4">
                    {(
                      weights.overall_accuracy * row.overall_accuracy +
                      weights.speed * row.speed +
                      weights.memory_usage * row.memory_usage +
                      weights.model_size * row.model_size
                    ).toFixed(2)}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-2">
        {Object.entries(weights).map(([k, v]) => (
          <div key={k} className="space-y-1">
            <div className="flex justify-between">
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
              className={`py-2 [&>span]:bg-white [&>span]:border-white [&>span]:shadow-md [&>span:before]:bg-[#a6ce39] ${lockedWeights[k] ? "opacity-70" : ""}`}
              disabled={lockedWeights[k]}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default BenchmarkTable
