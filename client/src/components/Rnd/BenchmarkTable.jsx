// "use client"

// import { useState, useEffect } from "react"
// import { Loader2, Info, Settings, BarChart3 } from "lucide-react"
// import { toast } from "react-toastify"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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

//   const handleWeightChange = (key, value) => {
//     const numValue = Array.isArray(value) ? value[0] : Number.parseFloat(value)
//     if (isNaN(numValue) || numValue < 0 || numValue > 1) return

//     setWeights({
//       ...weights,
//       [key]: numValue,
//     })
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
//             <TabsList className="grid w-full grid-cols-2 bg-[#f5f8e8]">
//               <TabsTrigger
//                 value="dashboard"
//                 className="data-[state=active]:bg-[#a6ce39] data-[state=active]:text-white flex items-center gap-2 rounded-[12px]"
//               >
//                 <BarChart3 className="h-4 w-4" />
//                 Dashboard
//               </TabsTrigger>
//               <TabsTrigger
//                 value="weights"
//                 className="data-[state=active]:bg-[#a6ce39] data-[state=active]:text-white flex items-center gap-2 rounded-[12px]"
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
//             <div className="px-6 py-4 h-[210px]">
//               <div className="mb-4 bg-[#f5f8e8] p-4 rounded-md border border-[#e7f0d1]">
//                 <h3 className="text-sm font-medium text-[#4b6a1e] mb-2">Weight Configuration</h3>
//                 <p className="text-sm text-[#5c7a2e]">
//                   Adjust the weight factors below to recalculate disease scores. The sum of all weights must equal 1.0
//                   for accurate benchmarking.
//                 </p>
//               </div>

//               <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
//                 {Object.entries(weights).map(([key, value]) => (
//                   <div key={key} className="space-y-1">
//                     <div className="flex justify-between">
//                       <label className="text-xs text-muted-foreground capitalize">{key.replace("_", " ")}</label>
//                       <span className="text-xs text-slate-500">{value.toFixed(2)}</span>
//                     </div>
//                     <Slider
//                       value={[value]}
//                       min={0}
//                       max={1}
//                       step={0.01}
//                       onValueChange={(val) => handleWeightChange(key, val)}
//                       className="py-2 [&>span]:bg-white [&>span]:border-white [&>span]:shadow-md [&>span:before]:bg-[#a6ce39]"
//                     />
//                   </div>
//                 ))}
//               </div>

//               <div className="flex items-center justify-between bg-[#f9faf5] p-3 rounded-md">
//                 <div className={`text-xs ${isValidWeights ? "text-green-600" : "text-destructive"}`}>
//                   Total: {totalWeight.toFixed(2)} {isValidWeights ? "✓" : "(should equal 1.0)"}
//                 </div>
//                 <Button
//                   onClick={updateBenchmark}
//                   disabled={!isValidWeights || isUpdating}
//                   size="sm"
//                   className="bg-[#a6ce39] hover:bg-[#95b933] text-white font-medium"
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



// "use client"

// import { useState, useEffect } from "react"
// import { Loader2, Info, Settings, BarChart3 } from "lucide-react"
// import { toast } from "react-toastify"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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

//   const handleWeightChange = (key, value) => {
//     const numValue = Array.isArray(value) ? value[0] : Number.parseFloat(value)
//     if (isNaN(numValue) || numValue < 0 || numValue > 1) return

//     setWeights({
//       ...weights,
//       [key]: numValue,
//     })
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
//             <TabsList className="grid w-full grid-cols-2 bg-[#f5f8e8]">
//               <TabsTrigger
//                 value="dashboard"
//                 className="data-[state=active]:bg-[#a6ce39] data-[state=active]:text-white flex items-center gap-2 rounded-[12px]"
//               >
//                 <BarChart3 className="h-4 w-4" />
//                 Dashboard
//               </TabsTrigger>
//               <TabsTrigger
//                 value="weights"
//                 className="data-[state=active]:bg-[#a6ce39] data-[state=active]:text-white flex items-center gap-2 rounded-[12px]"
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

//             <ScrollArea className="h-[350px]">
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
//               <div className="mb-4 bg-[#f5f8e8] p-4 rounded-md border border-[#e7f0d1]">
//                 <h3 className="text-sm font-medium text-[#4b6a1e] mb-2">Weight Configuration</h3>
//                 <p className="text-sm text-[#5c7a2e]">
//                   Adjust the weight factors below to recalculate disease scores. The sum of all weights must equal 1.0
//                   for accurate benchmarking.
//                 </p>
//               </div>

//               <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
//                 {Object.entries(weights).map(([key, value]) => (
//                   <div key={key} className="space-y-1">
//                     <div className="flex justify-between">
//                       <label className="text-xs text-muted-foreground capitalize">{key.replace("_", " ")}</label>
//                       <span className="text-xs text-slate-500">{value.toFixed(2)}</span>
//                     </div>
//                     <Slider
//                       value={[value]}
//                       min={0}
//                       max={1}
//                       step={0.01}
//                       onValueChange={(val) => handleWeightChange(key, val)}
//                       className="py-2 [&>span]:bg-white [&>span]:border-white [&>span]:shadow-md [&>span:before]:bg-[#a6ce39]"
//                     />
//                   </div>
//                 ))}
//               </div>

//               <div className="flex items-center justify-between bg-[#f9faf5] p-3 rounded-md">
//                 <div className={`text-xs ${isValidWeights ? "text-green-600" : "text-destructive"}`}>
//                   Total: {totalWeight.toFixed(2)} {isValidWeights ? "✓" : "(should equal 1.0)"}
//                 </div>
//                 <Button
//                   onClick={updateBenchmark}
//                   disabled={!isValidWeights || isUpdating}
//                   size="sm"
//                   className="bg-[#a6ce39] hover:bg-[#95b933] text-white font-medium"
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


// "use client";

// import { useState, useEffect } from "react";
// import { Loader2, Info, Settings, BarChart3 } from "lucide-react";
// import { toast } from "react-toastify";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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

//   // convert 0‑1 or 0‑5 score to % width
//   const getProgressWidth = (score) => {
//     const n = parseFloat(score);
//     if (isNaN(n)) return 0;
//     return n <= 1 ? n * 100 : (n / 5) * 100;
//   };

//   const fetchBenchmarkData = async () => {
//     setIsLoading(true);
//     try {
//       const res = await fetch(`${import.meta.env.VITE_API_URL}/api/benchmark-table`, {
//         headers: { "Content-Type": "application/json" },
//       });
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
//     const num = Array.isArray(val) ? val[0] : parseFloat(val);
//     if (isNaN(num) || num < 0 || num > 1) return;
//     setWeights((p) => ({ ...p, [key]: num }));
//   };

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
//       if (onWeightsUpdate && pie.pie_chart_data) onWeightsUpdate(weights, pie.pie_chart_data);
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
//       return sortOrder === "desc" ? b.benchmark_score - a.benchmark_score : a.benchmark_score - b.benchmark_score;
//     }
//     return sortOrder === "desc" ? b.disease.localeCompare(a.disease) : a.disease.localeCompare(b.disease);
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
//           <CardTitle className="text-xl font-semibold">Benchmark Analysis</CardTitle>
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
//                 <p className="text-xs">Benchmark scores are calculated based on weighted criteria. Adjust weights in the settings tab.</p>
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
//               <TabsTrigger value="dashboard" className="data-[state=active]:bg-[#a6ce39] data-[state=active]:text-white flex items-center gap-2 rounded-[12px]">
//                 <BarChart3 className="h-4 w-4" /> Dashboard
//               </TabsTrigger>
//               <TabsTrigger value="weights" className="data-[state=active]:bg-[#a6ce39] data-[state=active]:text-white flex items-center gap-2 rounded-[12px]">
//                 <Settings className="h-4 w-4" /> Adjust Weights
//               </TabsTrigger>
//             </TabsList>
//           </div>

//           {/* Dashboard */}
//           <TabsContent value="dashboard" className="mt-0">
//             <div className="p-4 flex justify-between items-center border-b">
//               <div className="text-sm font-medium text-slate-700">{sortedData.length} Disease Benchmarks</div>
//               <div className="flex items-center gap-2">
//                 <span className="text-sm text-slate-500">Sort by:</span>
//                 <Select value={`${sortBy}-${sortOrder}`} onValueChange={(v) => { const [f,o]=v.split("-"); setSortBy(f); setSortOrder(o); }}>
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

//             <ScrollArea className="h-[350px]">
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
//                 {sortedData.map((item, idx) => (
//                   <Card key={idx} className="overflow-hidden border-slate-200 hover:shadow-md transition-shadow">
//                     <CardHeader className="p-4 pb-2 bg-[#f9faf5] border-b">
//                       <div className="flex justify-between items-start">
//                         <CardTitle className="text-base font-medium text-slate-800 truncate">{capitalizeName(item.disease)}</CardTitle>
//                         <Badge variant="outline" className="font-mono bg-white text-slate-600 border-slate-300">{item.benchmark_score}</Badge>
//                       </div>
//                     </CardHeader>
//                     <CardContent className="p-4">
//                       <div className="space-y-4">
//                         {/* overall bar */}
//                         <div className="space-y-1">
//                           <div className="flex justify-between items-center"><span className="text-xs text-slate-500">Benchmark Score</span><span className="text-xs font-medium">{item.benchmark_score}</span></div>
//                           <Progress value={getProgressWidth(item.benchmark_score)} className="h-2 bg-slate-100" />
//                         </div>
//                         {/* breakdown */}
//                         {item.score_breakdown_distribution && (
//                           <div className="grid grid-cols-2 gap-2">
//                             {breakdownKeys.map(([label, key]) => (
//                               <div key={key} className="space-y-1">
//                                 <div className="flex justify-between"><span className="text-xs text-slate-500">{label}: </span><span className="text-xs font-medium">{item.score_breakdown_distribution[key]}</span></div>
//                                 <Progress value={getProgressWidth(item.score_breakdown_distribution[key])} className="h-1 bg-slate-100" />
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
//                 <h3 className="text-sm font-medium text-[#4b6a1e] mb-2">Weight Configuration</h3>
//                 <p className="text-sm text-[#5c7a2e]">Adjust the weight factors below to recalculate disease scores. The sum of all weights must equal 1.0 for accurate benchmarking.</p>
//               </div>
//               <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
//                 {Object.entries(weights).map(([k, v]) => (
//                   <div key={k} className="space-y-1">
//                     <div className="flex justify-between"><label className="text-xs text-muted-foreground capitalize">{k.replace("_"," ")}</label><span className="text-xs text-slate-500">{v.toFixed(2)}</span></div>
//                     <Slider value={[v]} min={0} max={1} step={0.01} onValueChange={(val) => handleWeightChange(k, val)} className="py-2 [&>span]:bg-white [&>span]:border-white [&>span]:shadow-md [&>span:before]:bg-[#a6ce39]" />
//                   </div>
//                 ))}
//               </div>
//               <div className="flex items-center justify-between bg-[#f9faf5] p-3 rounded-md">
//                 <div className={`text-xs ${isValidWeights ? "text-green-600" : "text-destructive"}`}>Total: {totalWeight.toFixed(2)} {isValidWeights ? "✓" : "(should equal 1.0)"}</div>
//                 <Button onClick={updateBenchmark} disabled={!isValidWeights || isUpdating} size="sm" className="bg-[#a6ce39] hover:bg-[#95b933] text-white font-medium">
//                   {isUpdating ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Updating...</>) : "Update Scores"}
//                 </Button>
//               </div>
//             </div>
//           </TabsContent>
//         </Tabs>
//       </CardContent>
//     </Card>
//   );
// }



"use client";

import { useState, useEffect } from "react";
import { Loader2, Info, Settings, BarChart3 } from "lucide-react";
import { toast } from "react-toastify";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";

function capitalizeName(name) {
  return name
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export default function BenchmarkTable({ onWeightsUpdate }) {
  const [benchmarkData, setBenchmarkData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [weights, setWeights] = useState({
    enrollment: 0.2,
    mechanism: 0.15,
    justification: 0.2,
    prevalence: 0.2,
    bausch_presence: 0.15,
    safety_efficacy: 0.1,
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sortBy, setSortBy] = useState("score");
  const [sortOrder, setSortOrder] = useState("desc");

  // convert 0‑1 (exclusive) OR 1‑5 score to % width
  const getProgressWidth = (score) => {
    const n = parseFloat(score);
    if (isNaN(n)) return 0;
    return n < 1 ? n * 100 : (n / 5) * 100; // 1–5 → divide, <1 → multiply
  };

  const fetchBenchmarkData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/benchmark-table`, {
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
        toast.error(data.error);
      } else {
        setBenchmarkData(data.benchmark_table);
      }
    } catch (e) {
      console.error(e);
      setError("Error fetching benchmark data.");
      toast.error("Failed to update benchmark table");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchBenchmarkData();
  }, []);

  const handleWeightChange = (key, val) => {
    const num = Array.isArray(val) ? val[0] : parseFloat(val);
    if (isNaN(num) || num < 0 || num > 1) return;
    setWeights((p) => ({ ...p, [key]: num }));
  };

  const updateBenchmark = async () => {
    setIsUpdating(true);
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
      ]);
      const pie = await pieRes.json();
      const bench = await benchRes.json();
      setBenchmarkData(bench.benchmark_table);
      if (onWeightsUpdate && pie.pie_chart_data) onWeightsUpdate(weights, pie.pie_chart_data);
      toast.success("Scores updated successfully");
      setActiveTab("dashboard");
    } catch (e) {
      console.error(e);
      toast.error("Failed to update scores");
    }
    setIsUpdating(false);
  };

  const totalWeight = Object.values(weights).reduce((s, w) => s + w, 0);
  const isValidWeights = Math.abs(totalWeight - 1) < 0.01;

  const sortedData = [...benchmarkData].sort((a, b) => {
    if (sortBy === "score") {
      return sortOrder === "desc" ? b.benchmark_score - a.benchmark_score : a.benchmark_score - b.benchmark_score;
    }
    return sortOrder === "desc" ? b.disease.localeCompare(a.disease) : a.disease.localeCompare(b.disease);
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="animate-spin mr-2 h-5 w-5 text-primary" />
        <span>Loading benchmark analysis...</span>
      </div>
    );
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
    );
  }

  const breakdownKeys = [
    ["Enrollment", "No_of_Patient_Treated"],
    ["Mechanism", "Gut_Microbiome_Association"],
    ["Justification", "Rifaximin_Treatment"],
    ["Prevalence", "Prevalence"],
    ["Bausch", "Bausch_Presence"],
    ["Safety", "Safety_Efficacy"],
  ];

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
              <TooltipContent className="max-w-xs">
                <p className="text-xs">Benchmark scores are calculated based on weighted criteria. Adjust weights in the settings tab.</p>
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
              <TabsTrigger value="dashboard" className="data-[state=active]:bg-[#a6ce39] data-[state=active]:text-white flex items-center gap-2 rounded-[12px]">
                <BarChart3 className="h-4 w-4" /> Dashboard
              </TabsTrigger>
              <TabsTrigger value="weights" className="data-[state=active]:bg-[#a6ce39] data-[state=active]:text-white flex items-center gap-2 rounded-[12px]">
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
                <Select value={`${sortBy}-${sortOrder}`} onValueChange={(v) => { const [f,o]=v.split("-"); setSortBy(f); setSortOrder(o); }}>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                {sortedData.map((item, idx) => (
                  <Card key={idx} className="overflow-hidden border-slate-200 hover:shadow-md transition-shadow">
                    <CardHeader className="p-4 pb-2 bg-[#f9faf5] border-b">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-base font-medium text-slate-800 truncate">{capitalizeName(item.disease)}</CardTitle>
                        <Badge variant="outline" className="font-mono bg-white text-slate-600 border-slate-300">{item.benchmark_score}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="space-y-4">
                        {/* overall bar */}
                        <div className="space-y-1">
                          <div className="flex justify-between items-center"><span className="text-xs text-slate-500">Benchmark Score</span><span className="text-xs font-medium">{item.benchmark_score}</span></div>
                          <Progress value={getProgressWidth(item.benchmark_score)} className="h-2 bg-slate-100" />
                        </div>
                        {/* breakdown */}
                        {item.score_breakdown_distribution && (
                          <div className="grid grid-cols-2 gap-2">
                            {breakdownKeys.map(([label, key]) => (
                              <div key={key} className="space-y-1">
                                <div className="flex justify-between"><span className="text-xs text-slate-500">{label}: </span><span className="text-xs font-medium">{item.score_breakdown_distribution[key]}</span></div>
                                <Progress value={getProgressWidth(item.score_breakdown_distribution[key])} className="h-1 bg-slate-100" />
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
                <p className="text-sm text-[#5c7a2e]">Adjust the weight factors below to recalculate disease scores. The sum of all weights must equal 1.0 for accurate benchmarking.</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                {Object.entries(weights).map(([k, v]) => (
                  <div key={k} className="space-y-1">
                    <div className="flex justify-between"><label className="text-xs text-muted-foreground capitalize">{k.replace("_"," ")}</label><span className="text-xs text-slate-500">{v.toFixed(2)}</span></div>
                    <Slider value={[v]} min={0} max={1} step={0.01} onValueChange={(val) => handleWeightChange(k, val)} className="py-2 [&>span]:bg-white [&>span]:border-white [&>span]:shadow-md [&>span:before]:bg-[#a6ce39]" />
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between bg-[#f9faf5] p-3 rounded-md">
                <div className={`text-xs ${isValidWeights ? "text-green-600" : "text-destructive"}`}>Total: {totalWeight.toFixed(2)} {isValidWeights ? "✓" : "(should equal 1.0)"}</div>
                <Button onClick={updateBenchmark} disabled={!isValidWeights || isUpdating} size="sm" className="bg-[#a6ce39] hover:bg-[#95b933] text-white font-medium">
                  {isUpdating ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Updating...</>) : "Update Scores"}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
