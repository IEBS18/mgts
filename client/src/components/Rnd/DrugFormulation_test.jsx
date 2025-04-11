// "use client"

// import { useState, useEffect } from "react"
// import { useLocation } from "react-router-dom"
// import { Loader2, Info, Settings, BarChart3 } from "lucide-react"
// import ReactMarkdown from "react-markdown"
// import { ToastContainer, toast } from "react-toastify"
// import { Cell, Pie, PieChart, Tooltip, ResponsiveContainer, Legend } from "recharts"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
// import { Badge } from "@/components/ui/badge"
// import { ScrollArea } from "@/components/ui/scroll-area"
// import { Progress } from "@/components/ui/progress"
// import { Slider } from "@/components/ui/slider"

// const LoadingDots = () => {
//   return <span className="loading-dots">...</span>
// }

// function capitalizeName(name) {
//   return name
//     .split(' ')  // Split the name into words
//     .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())  // Capitalize first letter of each word
//     .join(' ');  // Join the words back into a single string
// }

// const TruncatedMarkdown = ({ content, maxLength = 200 }) => {
//   const [isExpanded, setIsExpanded] = useState(false)

//   if (!content) return null

//   const displayContent = isExpanded ? content : content.slice(0, maxLength)
//   const shouldTruncate = content.length > maxLength

//   return (
//     <div className="prose prose-sm max-w-none dark:prose-invert">
//       <ReactMarkdown>{displayContent}</ReactMarkdown>
//       {shouldTruncate && (
//         <Button onClick={() => setIsExpanded(!isExpanded)} variant="link" className="p-0 h-auto text-primary">
//           {isExpanded ? "Show less" : "...Show more"}
//         </Button>
//       )}
//     </div>
//   )
// }

// const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name, value }) => {
//   const RADIAN = Math.PI / 180
//   const radius = outerRadius * 1.1
//   const x = cx + radius * Math.cos(-midAngle * RADIAN)
//   const y = cy + radius * Math.sin(-midAngle * RADIAN)

//   return (
//     <text
//       x={x}
//       y={y}
//       fill="#333333"
//       textAnchor={x > cx ? "start" : "end"}
//       dominantBaseline="central"
//       fontSize={12}
//       fontWeight={500}
//     >
//       {`(${(percent * 100).toFixed(0)}%)`}
//     </text>
//   )
// }

// function PieChartComp({ onDataUpdate }) {
//   const [pieChartData, setPieChartData] = useState(null)
//   const [isLoading, setIsLoading] = useState(true)
//   const [error, setError] = useState(null)

//   const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AF19FF"]

//   const fetchPieChartData = async (weights = null) => {
//     setIsLoading(true)
//     try {
//       const response = await fetch(`${import.meta.env.VITE_API_URL}/api/pie-chart`, {
//         headers: {
//           "Content-Type": "application/json",
//         },
//       })
//       const data = await response.json()
//       if (data.error) {
//         setError(data.error)
//         toast.error(data.error)
//       } else {
//         setPieChartData(data.pie_chart_data)
//         if (onDataUpdate) onDataUpdate(data.pie_chart_data)
//       }
//     } catch (error) {
//       console.error("Error fetching pie chart:", error)
//       setError("Error fetching pie chart data.")
//       toast.error("Failed to update pie chart")
//     }
//     setIsLoading(false)
//   }

//   useEffect(() => {
//     fetchPieChartData()
//   }, [])

//   // Add this function to PieChartComp
//   const updateData = (newData) => {
//     if (newData) {
//       setPieChartData(newData)
//     }
//   }

//   // Expose the updateData method to the parent component
//   useEffect(() => {
//     if (onDataUpdate) {
//       // This allows the parent to call updateData
//       const element = document.querySelector('[data-component="pie-chart"]')
//       if (element) {
//         element.updateData = updateData
//       }
//     }
//   }, [onDataUpdate])

//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center h-full">
//         <Loader2 className="animate-spin mr-2 h-5 w-5 text-primary" />
//         <span>Loading pie chart...</span>
//       </div>
//     )
//   }

//   if (error) {
//     return <div className="text-destructive p-4">Error: {error}</div>
//   }

//   return (
//     <Card className="h-full shadow-md" data-component="pie-chart">
//       <CardHeader className="pb-2 bg-[#f9faf5]">
//         <CardTitle className="text-xl font-semibold flex items-center gap-2">
//           Top 5 Diseases to Explore
//           <TooltipProvider>
//             <UITooltip>
//               <TooltipTrigger asChild>
//                 <Info className="h-4 w-4 text-muted-foreground cursor-help" />
//               </TooltipTrigger>
//               <TooltipContent>
//                 <p className="w-[200px] text-xs">These are the top diseases based on current weight configuration</p>
//               </TooltipContent>
//             </UITooltip>
//           </TooltipProvider>
//         </CardTitle>
//       </CardHeader>
//       <CardContent>
//         {pieChartData && (
//           <div className="h-[250px] w-full">
//             <ResponsiveContainer width="100%" height="100%">
//               <PieChart>
//                 <Pie
//                   // data={pieChartData}
//                   // cx="55%"
//                   // cy="50%"
//                   // outerRadius={80}
//                   // fill="#8884d8"
//                   // dataKey="value"
//                   // label={({ name, percent }) => `${capitalizeName(name)} ${(percent * 100).toFixed(0)}%`}
//                   // labelLine={false}
//                   data={pieChartData}
//                   cx="50%"
//                   cy="50%"
//                   outerRadius={80}
//                   innerRadius={40}
//                   fill="#8884d8"
//                   dataKey="value"
//                   labelLine={false}
//                   label={renderCustomizedLabel}
//                   paddingAngle={2}
//                 >
//                   {pieChartData.map((entry, index) => (
//                     <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                   ))}
//                 </Pie>
//                 {/* <Tooltip formatter={(value) => [`Score: ${value}`, "Value"]} /> */}
//                 <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ paddingLeft: "20px" }} />
//                 {/* <Legend layout="vertical" verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: "10px" }} /> */}
//               </PieChart>
//             </ResponsiveContainer>
//           </div>
//         )}
//       </CardContent>
//     </Card>
//   )
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

//   const toggleSort = (field) => {
//     if (sortBy === field) {
//       setSortOrder(sortOrder === "asc" ? "desc" : "asc")
//     } else {
//       setSortBy(field)
//       setSortOrder("desc")
//     }
//   }

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
//                 className="data-[state=active]:bg-[#a6ce39] data-[state=active]:text-white flex items-center gap-2"
//               >
//                 <BarChart3 className="h-4 w-4" />
//                 Dashboard
//               </TabsTrigger>
//               <TabsTrigger
//                 value="weights"
//                 className="data-[state=active]:bg-[#a6ce39] data-[state=active]:text-white flex items-center gap-2"
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
//                   <SelectTrigger className="h-8 w-[180px] bg-white">
//                     <SelectValue placeholder="Sort by" />
//                   </SelectTrigger>
//                   <SelectContent className='bg-white'>
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
//                             value={(Number.parseFloat(item.benchmark_score) * 100)}
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

// const renderCellContent = (record, topic) => {
//   const key = topic.toLowerCase()
//   const content = record[key]

//   if (!content) return null

//   if (typeof content === "string" && content.includes("\n")) {
//     return <TruncatedMarkdown content={content} />
//   }

//   return content
// }

// export default function DrugFormulation() {
//   const location = useLocation()
//   const { selectedTabs = [] } = location.state || {}

//   const [tableData, setTableData] = useState([])
//   const [isLoading, setIsLoading] = useState(false)
//   const [sseError, setSseError] = useState(null)
//   const [orderedTabs, setOrderedTabs] = useState([])
//   const [selectedDisease, setSelectedDisease] = useState("all")
//   const [diseases, setDiseases] = useState([])

//   const fetchTableData = async (requestedFields, disease = "all") => {
//     setIsLoading(true)
//     try {
//       const endpoint =
//         `${import.meta.env.VITE_API_URL}/api/rnd-formulation-drug` +
//         `?selected_tabs=${encodeURIComponent(requestedFields)}` +
//         `&disease=${encodeURIComponent(disease)}`

//       const response = await fetch(endpoint)
//       const data = await response.json()

//       if (data.error) {
//         setSseError(data.error)
//         toast.error(data.error)
//       } else {
//         setTableData(data.data)
//         // Extract unique diseases for the dropdown
//         const uniqueDiseases = Array.from(new Set(data.data.map((item) => item.disease)))
//         setDiseases(uniqueDiseases)
//       }
//     } catch (error) {
//       console.error("Error fetching data:", error)
//       setSseError("Error fetching data.")
//       toast.error("Failed to fetch table data")
//     }
//     setIsLoading(false)
//   }

//   useEffect(() => {
//     const uniqueSelectedTabs = Array.from(new Set(selectedTabs))
//     const columnOrder = [
//       "Disease",
//       "Disease_Microbes",
//       "Disease_Mechanism",
//       // "Drug_Title",
//       "Drug_Microbes",
//       "Drug_Mechanism",
//       "Justification_for_Drug_Use",
//       "Disease_Source",
//       // "Disease_Title",
//       "Drug_Source",
//     ]
//     const orderedTabs = columnOrder.filter((tab) => uniqueSelectedTabs.includes(tab))
//     setOrderedTabs(orderedTabs)

//     const requestedFields = orderedTabs.join(",")
//     fetchTableData(requestedFields, selectedDisease)
//   }, [selectedTabs, selectedDisease])

//   const handleWeightsUpdate = (weights, pieChartData) => {
//     // If pie chart data is provided, update the pie chart component
//     const pieChartElement = document.querySelector('[data-component="pie-chart"]')
//     if (pieChartElement && pieChartElement.updateData && pieChartData) {
//       pieChartElement.updateData(pieChartData)
//     }
//   }

//   // Filter table data based on selected disease
//   const filteredTableData =
//     selectedDisease === "all" ? tableData : tableData.filter((record) => record.disease === selectedDisease)

//   return (
//     <div className="p-6 bg-background min-h-screen">
//       <ToastContainer position="top-right" autoClose={5000} />

//       <div className="max-w-[1400px] mx-auto">
//         <header className="mb-6">
//           <h1 className="text-3xl font-bold text-foreground">Drug Formulation Results</h1>
//           <p className="text-muted-foreground mt-1">Analysis and benchmarking of drug formulations</p>
//         </header>

//         {/* Analytics Dashboard Section */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
//           <div className="h-[350px]">
//             <PieChartComp
//               onDataUpdate={() => { }} // We're using the DOM method instead
//             />
//           </div>
//           <div className="h-[350px]">
//             <BenchmarkTable onWeightsUpdate={handleWeightsUpdate} />
//           </div>
//         </div>

//         <Card className="mb-8 shadow-md">
//           <CardHeader className="pb-3 bg-[#f9faf5]">
//             <div className="flex items-center justify-between">
//               <CardTitle>Disease Data</CardTitle>

//               <div className="flex items-center gap-4">
//                 {/* Disease Filter Dropdown */}
//                 <Select value={selectedDisease} onValueChange={setSelectedDisease}>
//                   <SelectTrigger className="w-[180px] border-[#a6ce39] focus:ring-[#a6ce39]">
//                     <SelectValue placeholder="Select disease" />
//                   </SelectTrigger>
//                   <SelectContent className="bg-white">
//                     <SelectItem value="all">All Diseases</SelectItem>
//                     {diseases.map((disease) => (
//                       <SelectItem key={disease} value={disease}>
//                         {capitalizeName(disease)}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>
//             </div>

//             {/* Loading and error states */}
//             <div className="flex items-center gap-4 mt-2">
//               {sseError && <p className="text-destructive text-sm">{sseError}</p>}
//               {isLoading && (
//                 <div className="flex items-center gap-2 text-muted-foreground text-sm">
//                   <Loader2 className="animate-spin h-4 w-4" />
//                   <span>Loading data...</span>
//                 </div>
//               )}
//             </div>
//           </CardHeader>

//           <CardContent className="p-0">
//             <div className="border-t">
//               <div className="h-[500px] overflow-x-auto">
//                 <table className="w-full min-w-max border-collapse">
//                   <thead>
//                     <tr className="bg-[#f5f8e8] sticky top-0 z-10">
//                       {orderedTabs.map((topic) => (
//                         <th
//                           key={topic}
//                           className="p-3 text-left text-xs font-medium uppercase tracking-wider whitespace-nowrap text-gray-700"
//                           style={{ minWidth: "180px" }}
//                         >
//                           {topic.replace(/_/g, " ")}
//                         </th>
//                       ))}
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {filteredTableData.length > 0 ? (
//                       filteredTableData.map((record, rowIndex) => (
//                         <tr key={rowIndex} className="border-b border-border hover:bg-[#f9faf5] transition-colors">
//                           {orderedTabs.map((topic) => (
//                             <td key={topic} className="p-4 align-top w-[400px] max-w-[400px] text-sm">
//                               {topic === 'Disease' ? capitalizeName(renderCellContent(record, topic)) : renderCellContent(record, topic)}
//                             </td>
//                           ))}
//                         </tr>
//                       ))
//                     ) : (
//                       <tr>
//                         <td colSpan={orderedTabs.length} className="p-6 text-center text-muted-foreground">
//                           {isLoading ? "Loading data..." : "No data available for the selected filters."}
//                         </td>
//                       </tr>
//                     )}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   )
// }




// "use client"

// import { useState, useEffect } from "react"
// import { Loader2, Info, Settings, BarChart3, ExternalLink } from "lucide-react"
// import ReactMarkdown from "react-markdown"
// import { ToastContainer, toast } from "react-toastify"
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip as RechartsTooltip,
//   Legend as RechartsLegend,
//   ResponsiveContainer,
//   Cell,
// } from "recharts"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { ScrollArea } from "@/components/ui/scroll-area"
// import { Progress } from "@/components/ui/progress"
// import { Slider } from "@/components/ui/slider"
// import { Badge } from "@/components/ui/badge"
// import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
// import { useNavigate } from "react-router-dom"

// function capitalizeName(name) {
//   if (!name) return ""
//   return name
//     .split(" ")
//     .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
//     .join(" ")
// }

// const TruncatedMarkdown = ({ content, maxLength = 200 }) => {
//   const [isExpanded, setIsExpanded] = useState(false)

//   if (!content) return null

//   const displayContent = isExpanded ? content : content.slice(0, maxLength)
//   const shouldTruncate = content.length > maxLength

//   return (
//     <div className="prose prose-sm max-w-none dark:prose-invert">
//       <ReactMarkdown>{displayContent}</ReactMarkdown>
//       {shouldTruncate && (
//         <Button onClick={() => setIsExpanded(!isExpanded)} variant="link" className="p-0 h-auto text-primary">
//           {isExpanded ? "Show less" : "...Show more"}
//         </Button>
//       )}
//     </div>
//   )
// }

// function InteractiveBarChart({ onDataUpdate }) {
//   const [chartData, setChartData] = useState(null)
//   const [isLoading, setIsLoading] = useState(true)
//   const [error, setError] = useState(null)
//   const [activeIndex, setActiveIndex] = useState(0)

//   const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AF19FF"]

//   const fetchChartData = async (weights = null) => {
//     setIsLoading(true)
//     try {
//       // In a real app, this would be an API call
//       const response = await fetch(`${import.meta.env.VITE_API_URL}/api/pie-chart`, {
//         headers: {
//           "Content-Type": "application/json",
//         },
//       })
//       const data = await response.json()
//       if (data.error) {
//         setError(data.error)
//         toast.error(data.error)
//       } else {
//         // Transform pie chart data to bar chart format
//         const transformedData = data.pie_chart_data.map((item) => ({
//           name: capitalizeName(item.name),
//           value: item.value,
//           fill: COLORS[data.pie_chart_data.indexOf(item) % COLORS.length],
//         }))
//         setChartData(transformedData)
//         if (onDataUpdate) onDataUpdate(transformedData)
//       }
//     } catch (error) {
//       console.error("Error fetching chart data:", error)
//       setError("Error fetching chart data.")
//       toast.error("Failed to update chart")

//       // Fallback data for preview
//       const fallbackData = [
//         { name: "Irritable Bowel Syndrome", value: 0.85, fill: COLORS[0] },
//         { name: "Crohn's Disease", value: 0.72, fill: COLORS[1] },
//         { name: "Ulcerative Colitis", value: 0.68, fill: COLORS[2] },
//         { name: "Celiac Disease", value: 0.61, fill: COLORS[3] },
//         { name: "Diverticulitis", value: 0.55, fill: COLORS[4] },
//       ]
//       setChartData(fallbackData)
//     }
//     setIsLoading(false)
//   }

//   useEffect(() => {
//     fetchChartData()
//   }, [])

//   // Add this function to update chart data
//   const updateData = (newData) => {
//     if (newData) {
//       setChartData(newData)
//     }
//   }

//   // Expose the updateData method to the parent component
//   useEffect(() => {
//     if (onDataUpdate) {
//       // This allows the parent to call updateData
//       const element = document.querySelector('[data-component="chart"]')
//       if (element) {
//         element.updateData = updateData
//       }
//     }
//   }, [onDataUpdate])

//   const handleBarClick = (data, index) => {
//     setActiveIndex(index)
//   }

//   const CustomTooltip = ({ active, payload }) => {
//     if (active && payload && payload.length) {
//       return (
//         <div className="bg-white p-3 border rounded-md shadow-md">
//           <p className="font-medium">{payload[0].payload.name}</p>
//           <p className="text-sm">
//             Score: <span className="font-medium">{payload[0].value.toFixed(2)}</span>
//           </p>
//         </div>
//       )
//     }
//     return null
//   }

//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center h-full">
//         <Loader2 className="animate-spin mr-2 h-5 w-5 text-primary" />
//         <span>Loading chart data...</span>
//       </div>
//     )
//   }

//   if (error) {
//     return <div className="text-destructive p-4">Error: {error}</div>
//   }

//   return (
//     <Card className="h-full shadow-md" data-component="chart">
//       <CardHeader className="pb-2 bg-[#f9faf5]">
//         <CardTitle className="text-xl font-semibold flex items-center gap-2">
//           Top 5 Diseases to Explore
//           <TooltipProvider>
//             <Tooltip>
//               <TooltipTrigger asChild>
//                 <Info className="h-4 w-4 text-muted-foreground cursor-help" />
//               </TooltipTrigger>
//               <TooltipContent>
//                 <p className="w-[200px] text-xs">These are the top diseases based on current weight configuration</p>
//               </TooltipContent>
//             </Tooltip>
//           </TooltipProvider>
//         </CardTitle>
//       </CardHeader>
//       <CardContent className="pt-4">
//         {chartData && (
//           <div className="h-[300px] w-full">
//             <ResponsiveContainer width="100%" height="100%">
//               <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }} barSize={40}>
//                 <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
//                 <XAxis
//                   dataKey="name"
//                   tick={{ fontSize: 12 }}
//                   tickFormatter={(value) => (value.length > 12 ? `${value.substring(0, 12)}...` : value)}
//                 />
//                 <YAxis domain={[0, 1]} tickFormatter={(value) => value.toFixed(1)} tick={{ fontSize: 12 }} />
//                 <RechartsTooltip content={<CustomTooltip />} />
//                 <RechartsLegend />
//                 <Bar
//                   dataKey="value"
//                   name="Score"
//                   onClick={handleBarClick}
//                   animationDuration={1000}
//                   className="cursor-pointer"
//                 >
//                   {chartData.map((entry, index) => (
//                     <Cell
//                       key={`cell-${index}`}
//                       fill={entry.fill}
//                       stroke={activeIndex === index ? "#333" : "none"}
//                       strokeWidth={activeIndex === index ? 2 : 0}
//                       opacity={activeIndex === index ? 1 : 0.8}
//                     />
//                   ))}
//                 </Bar>
//               </BarChart>
//             </ResponsiveContainer>
//           </div>
//         )}
//       </CardContent>
//     </Card>
//   )
// }

// function BenchmarkTable({ onWeightsUpdate }) {
//   const navigate = useNavigate();
//   // const router = useRouter()
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
//   const [showAll, setShowAll] = useState(false)

//   const fetchBenchmarkData = async (weights = null) => {
//     setIsLoading(true)
//     try {
//       // In a real app, this would be an API call
//       const response = await fetch(`${import.meta.env.VITE_API_URL}/api/benchmark-table`,
//         {
//           headers: {
//             "Content-Type": "application/json",
//           },
//         },
//       )

//       const data = await response.json()
//       if (data.error) {
//         setError(data.error)
//         toast.error(data.error)
//       } else {
//         setBenchmarkData(data.benchmark_table || [])
//       }
//     } catch (error) {
//       console.error("Error fetching benchmark table:", error)
//       setError("Error fetching benchmark data.")
//       toast.error("Failed to update benchmark table")

//       // Fallback data for preview
//       const fallbackData = [
//         {
//           disease: "irritable bowel syndrome",
//           benchmark_score: 0.85,
//           score_breakdown_distribution: {
//             No_of_Patient_Treated: 0.9,
//             Gut_Microbiome_Association: 0.8,
//             Rifaximin_Treatment: 0.85,
//             Prevalence: 0.95,
//             Bausch_Presence: 0.7,
//             Safety_Efficacy: 0.8,
//           },
//         },
//         {
//           disease: "crohn's disease",
//           benchmark_score: 0.72,
//           score_breakdown_distribution: {
//             No_of_Patient_Treated: 0.8,
//             Gut_Microbiome_Association: 0.7,
//             Rifaximin_Treatment: 0.65,
//             Prevalence: 0.75,
//             Bausch_Presence: 0.6,
//             Safety_Efficacy: 0.75,
//           },
//         },
//         {
//           disease: "ulcerative colitis",
//           benchmark_score: 0.68,
//           score_breakdown_distribution: {
//             No_of_Patient_Treated: 0.7,
//             Gut_Microbiome_Association: 0.65,
//             Rifaximin_Treatment: 0.6,
//             Prevalence: 0.7,
//             Bausch_Presence: 0.65,
//             Safety_Efficacy: 0.7,
//           },
//         },
//         {
//           disease: "celiac disease",
//           benchmark_score: 0.61,
//           score_breakdown_distribution: {
//             No_of_Patient_Treated: 0.6,
//             Gut_Microbiome_Association: 0.55,
//             Rifaximin_Treatment: 0.5,
//             Prevalence: 0.65,
//             Bausch_Presence: 0.6,
//             Safety_Efficacy: 0.65,
//           },
//         },
//         {
//           disease: "diverticulitis",
//           benchmark_score: 0.55,
//           score_breakdown_distribution: {
//             No_of_Patient_Treated: 0.5,
//             Gut_Microbiome_Association: 0.5,
//             Rifaximin_Treatment: 0.45,
//             Prevalence: 0.6,
//             Bausch_Presence: 0.55,
//             Safety_Efficacy: 0.6,
//           },
//         },
//       ]
//       setBenchmarkData(fallbackData)
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
//       // Update both chart and benchmark table
//       const [chartResponse, benchmarkResponse] = await Promise.all([
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
//       const chartData = await chartResponse.json()
//       const benchmarkData = await benchmarkResponse.json()

//       // Update benchmark data
//       setBenchmarkData(benchmarkData.benchmark_table)

//       // Pass the updated chart data to the parent component
//       if (onWeightsUpdate && chartData.pie_chart_data) {
//         onWeightsUpdate(weights, chartData.pie_chart_data)
//       }

//       toast.success("Scores updated successfully")
//       setActiveTab("dashboard")
//     } catch (error) {
//       console.error("Error updating scores:", error)
//       toast.error("Failed to update scores")
//     }
//     setIsUpdating(false)
//   }

//   const navigateToBenchmarkDetails = () => {
//     // In a real app, this would navigate to a new page
//     // router.push("/benchmark-details")
//     navigate("/benchmark-details")
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

//   // Display only top 3 items in the preview
//   const previewData = showAll ? sortedData : sortedData.slice(0, 3)

//   const toggleSort = (field) => {
//     if (sortBy === field) {
//       setSortOrder(sortOrder === "asc" ? "desc" : "asc")
//     } else {
//       setSortBy(field)
//       setSortOrder("desc")
//     }
//   }

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
//                 className="data-[state=active]:bg-[#a6ce39] data-[state=active]:text-white flex items-center gap-2"
//               >
//                 <BarChart3 className="h-4 w-4" />
//                 Dashboard
//               </TabsTrigger>
//               <TabsTrigger
//                 value="weights"
//                 className="data-[state=active]:bg-[#a6ce39] data-[state=active]:text-white flex items-center gap-2"
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
//                   <SelectTrigger className="h-8 w-[180px] bg-white">
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

//             <ScrollArea className="h-[220px]">
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
//                 {previewData.map((item, index) => (
//                   <Card key={index} className="overflow-hidden border-slate-200 hover:shadow-md transition-shadow">
//                     <CardHeader className="p-4 pb-2 bg-[#f9faf5] border-b">
//                       <div className="flex justify-between items-start">
//                         <CardTitle className="text-base font-medium text-slate-800 truncate">
//                           {capitalizeName(item.disease)}
//                         </CardTitle>
//                         <Badge variant="outline" className={`font-mono ${getScoreColor(item.benchmark_score)}`}>
//                           {item.benchmark_score.toFixed(2)}
//                         </Badge>
//                       </div>
//                     </CardHeader>
//                     <CardContent className="p-4">
//                       <div className="space-y-4">
//                         <div className="space-y-1">
//                           <div className="flex justify-between items-center">
//                             <span className="text-xs text-slate-500">Benchmark Score</span>
//                             <span className="text-xs font-medium">{item.benchmark_score.toFixed(2)}</span>
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
//                                   {item.score_breakdown_distribution.No_of_Patient_Treated.toFixed(2)}
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
//                                   {item.score_breakdown_distribution.Gut_Microbiome_Association.toFixed(2)}
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
//                           </div>
//                         )}
//                       </div>
//                     </CardContent>
//                   </Card>
//                 ))}
//               </div>

//               <div className="flex justify-center p-4 pt-0">
//                 <Button
//                   onClick={navigateToBenchmarkDetails}
//                   className="bg-[#a6ce39] hover:bg-[#95b933] text-white font-medium flex items-center gap-2"
//                 >
//                   View Full Analysis
//                   <ExternalLink className="h-4 w-4" />
//                 </Button>
//               </div>
//             </ScrollArea>
//           </TabsContent>

//           <TabsContent value="weights" className="mt-0">
//             <div className="px-6 py-4 h-[220px]">
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

// const renderCellContent = (record, topic) => {
//   const key = topic.toLowerCase()
//   const content = record[key]

//   if (!content) return null

//   if (typeof content === "string" && content.includes("\n")) {
//     return <TruncatedMarkdown content={content} />
//   }

//   return content
// }

// export default function DrugFormulation() {
//   const [tableData, setTableData] = useState([])
//   const [isLoading, setIsLoading] = useState(false)
//   const [sseError, setSseError] = useState(null)
//   const [orderedTabs, setOrderedTabs] = useState([])
//   const [selectedDisease, setSelectedDisease] = useState("all")
//   const [diseases, setDiseases] = useState([])

//   // Mock selected tabs for the demo
//   const selectedTabs = [
//     "Disease",
//     "Disease_Microbes",
//     "Disease_Mechanism",
//     "Drug_Microbes",
//     "Drug_Mechanism",
//     "Justification_for_Drug_Use",
//     "Disease_Source",
//     "Drug_Source",
//   ]

//   const fetchTableData = async (requestedFields, disease = "all") => {
//     setIsLoading(true)
//     try {
//       const endpoint =
//         `${import.meta.env.VITE_API_URL}/api/rnd-formulation-drug` +
//         `?selected_tabs=${encodeURIComponent(requestedFields)}` +
//         `&disease=${encodeURIComponent(disease)}`

//       const response = await fetch(endpoint)
//       const data = await response.json()

//       if (data.error) {
//         setSseError(data.error)
//         toast.error(data.error)
//       } else {
//         setTableData(data.data)
//         // Extract unique diseases for the dropdown
//         const uniqueDiseases = Array.from(new Set(data.data.map((item) => item.disease)))
//         setDiseases(uniqueDiseases)
//       }
//     } catch (error) {
//       console.error("Error fetching data:", error)
//       setSseError("Error fetching data.")
//       toast.error("Failed to fetch table data")

//       // Fallback data for preview
//       const fallbackData = [
//         {
//           disease: "irritable bowel syndrome",
//           disease_microbes: "Altered gut microbiota with decreased diversity...",
//           disease_mechanism: "Dysregulation of the gut-brain axis...",
//           drug_microbes: "Targets harmful bacteria in the small intestine...",
//           drug_mechanism: "Non-systemic antibiotic that acts locally in the gut...",
//           justification_for_drug_use: "Rifaximin has shown efficacy in treating IBS symptoms...",
//           disease_source: "Multiple clinical studies and meta-analyses...",
//           drug_source: "FDA approved for IBS-D treatment...",
//         },
//         {
//           disease: "crohn's disease",
//           disease_microbes: "Dysbiosis with increased Enterobacteriaceae...",
//           disease_mechanism: "Chronic inflammation of the digestive tract...",
//           drug_microbes: "May help restore microbial balance...",
//           drug_mechanism: "Modulates gut microbiota and reduces inflammation...",
//           justification_for_drug_use: "Studies suggest potential benefits in maintaining remission...",
//           disease_source: "Research from IBD centers worldwide...",
//           drug_source: "Clinical trials and observational studies...",
//         },
//       ]
//       setTableData(fallbackData)
//     }
//     setIsLoading(false)
//   }

//   useEffect(() => {
//     const uniqueSelectedTabs = Array.from(new Set(selectedTabs))
//     const columnOrder = [
//       "Disease",
//       "Disease_Microbes",
//       "Disease_Mechanism",
//       "Drug_Microbes",
//       "Drug_Mechanism",
//       "Justification_for_Drug_Use",
//       "Disease_Source",
//       "Drug_Source",
//     ]
//     const orderedTabs = columnOrder.filter((tab) => uniqueSelectedTabs.includes(tab))
//     setOrderedTabs(orderedTabs)

//     const requestedFields = orderedTabs.join(",")
//     fetchTableData(requestedFields, selectedDisease)
//   }, [selectedTabs, selectedDisease])

//   const handleWeightsUpdate = (weights, chartData) => {
//     // If chart data is provided, update the chart component
//     const chartElement = document.querySelector('[data-component="chart"]')
//     if (chartElement && chartElement.updateData && chartData) {
//       chartElement.updateData(chartData)
//     }
//   }

//   // Filter table data based on selected disease
//   const filteredTableData =
//     selectedDisease === "all" ? tableData : tableData.filter((record) => record.disease === selectedDisease)

//   return (
//     <div className="p-6 bg-background min-h-screen">
//       <ToastContainer position="top-right" autoClose={5000} />

//       <div className="max-w-[1400px] mx-auto">
//         <header className="mb-6">
//           <h1 className="text-3xl font-bold text-foreground">Drug Formulation Results</h1>
//           <p className="text-muted-foreground mt-1">Analysis and benchmarking of drug formulations</p>
//         </header>

//         {/* Analytics Dashboard Section */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
//           <div className="h-[400px]">
//             <InteractiveBarChart
//               onDataUpdate={() => {}} // We're using the DOM method instead
//             />
//           </div>
//           <div className="h-[400px]">
//             <BenchmarkTable onWeightsUpdate={handleWeightsUpdate} />
//           </div>
//         </div>

//         <Card className="mb-8 shadow-md">
//           <CardHeader className="pb-3 bg-[#f9faf5]">
//             <div className="flex items-center justify-between">
//               <CardTitle>Disease Data</CardTitle>

//               <div className="flex items-center gap-4">
//                 {/* Disease Filter Dropdown */}
//                 <Select value={selectedDisease} onValueChange={setSelectedDisease}>
//                   <SelectTrigger className="w-[180px] border-[#a6ce39] focus:ring-[#a6ce39]">
//                     <SelectValue placeholder="Select disease" />
//                   </SelectTrigger>
//                   <SelectContent className="bg-white">
//                     <SelectItem value="all">All Diseases</SelectItem>
//                     {diseases.map((disease) => (
//                       <SelectItem key={disease} value={disease}>
//                         {capitalizeName(disease)}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>
//             </div>

//             {/* Loading and error states */}
//             <div className="flex items-center gap-4 mt-2">
//               {sseError && <p className="text-destructive text-sm">{sseError}</p>}
//               {isLoading && (
//                 <div className="flex items-center gap-2 text-muted-foreground text-sm">
//                   <Loader2 className="animate-spin h-4 w-4" />
//                   <span>Loading data...</span>
//                 </div>
//               )}
//             </div>
//           </CardHeader>

//           <CardContent className="p-0">
//             <div className="border-t">
//               <div className="h-[500px] overflow-x-auto">
//                 <table className="w-full min-w-max border-collapse">
//                   <thead>
//                     <tr className="bg-[#f5f8e8] sticky top-0 z-10">
//                       {orderedTabs.map((topic) => (
//                         <th
//                           key={topic}
//                           className="p-3 text-left text-xs font-medium uppercase tracking-wider whitespace-nowrap text-gray-700"
//                           style={{ minWidth: "180px" }}
//                         >
//                           {topic.replace(/_/g, " ")}
//                         </th>
//                       ))}
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {filteredTableData.length > 0 ? (
//                       filteredTableData.map((record, rowIndex) => (
//                         <tr key={rowIndex} className="border-b border-border hover:bg-[#f9faf5] transition-colors">
//                           {orderedTabs.map((topic) => (
//                             <td key={topic} className="p-4 align-top w-[400px] max-w-[400px] text-sm">
//                               {topic === "Disease"
//                                 ? capitalizeName(renderCellContent(record, topic))
//                                 : renderCellContent(record, topic)}
//                             </td>
//                           ))}
//                         </tr>
//                       ))
//                     ) : (
//                       <tr>
//                         <td colSpan={orderedTabs.length} className="p-6 text-center text-muted-foreground">
//                           {isLoading ? "Loading data..." : "No data available for the selected filters."}
//                         </td>
//                       </tr>
//                     )}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   )
// }



"use client"

import { useState, useEffect } from "react"
import { Loader2, Info, Settings, BarChart3, ExternalLink, Maximize2, X } from "lucide-react"
import ReactMarkdown from "react-markdown"
import { ToastContainer, toast } from "react-toastify"
import { ResponsiveContainer, RadialBarChart, RadialBar, LabelList, PolarAngleAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useNavigate } from "react-router-dom"

function capitalizeName(name) {
  if (!name) return ""
  return name
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ")
}

const TruncatedMarkdown = ({ content, maxLength = 200 }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!content) return null

  const displayContent = isExpanded ? content : content.slice(0, maxLength)
  const shouldTruncate = content.length > maxLength

  return (
    <div className="prose prose-sm max-w-none dark:prose-invert">
      <ReactMarkdown>{displayContent}</ReactMarkdown>
      {shouldTruncate && (
        <Button onClick={() => setIsExpanded(!isExpanded)} variant="link" className="p-0 h-auto text-primary">
          {isExpanded ? "Show less" : "...Show more"}
        </Button>
      )}
    </div>
  )
}

function RadialChart({ onDataUpdate }) {
  const [chartData, setChartData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AF19FF"]

  const fetchChartData = async (weights = null) => {
    setIsLoading(true)
    try {
      // In a real app, this would be an API call
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/pie-chart`, {
        headers: {
          "Content-Type": "application/json",
        },
      })
      const data = await response.json()
      if (data.error) {
        setError(data.error)
        toast.error(data.error)
      } else {
        // Transform pie chart data to radial chart format
        const transformedData = data.pie_chart_data.map((item, index) => ({
          name: capitalizeName(item.name),
          value: item.value,
          fill: COLORS[index % COLORS.length],
        }))
        setChartData(transformedData)
        if (onDataUpdate) onDataUpdate(transformedData)
      }
    } catch (error) {
      console.error("Error fetching chart data:", error)
      setError("Error fetching chart data.")
      toast.error("Failed to update chart")

      // Fallback data for preview
      const fallbackData = [
        { name: "Depression", value: 4.7, fill: COLORS[0] },
        { name: "Atopic Dermatitis", value: 4.7, fill: COLORS[1] },
        { name: "Obstructive Pulmonary Disease", value: 4.2, fill: COLORS[2] },
        { name: "Necrotic Enteritis", value: 4.2, fill: COLORS[3] },
        { name: "Type 1 Diabetes", value: 4.0, fill: COLORS[4] },
      ]
      setChartData(fallbackData)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    fetchChartData()
  }, [])

  // Add this function to update chart data
  const updateData = (newData) => {
    if (newData) {
      // Transform the data to match the radial chart format
      const transformedData = newData.map((item, index) => ({
        name: capitalizeName(item.name),
        value: item.value,
        fill: COLORS[index % COLORS.length],
      }))
      setChartData(transformedData)
    }
  }

  // Expose the updateData method to the parent component
  useEffect(() => {
    if (onDataUpdate) {
      // This allows the parent to call updateData
      const element = document.querySelector('[data-component="chart"]')
      if (element) {
        element.updateData = updateData
      }
    }
  }, [onDataUpdate])

  const handleChartClick = (data, index) => {
    setActiveIndex(index)
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-md shadow-md">
          <p className="font-medium">{payload[0].payload.name}</p>
          <p className="text-sm">
            Score: <span className="font-medium">{payload[0].value.toFixed(1)}</span>
          </p>
        </div>
      )
    }
    return null
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="animate-spin mr-2 h-5 w-5 text-primary" />
        <span>Loading chart data...</span>
      </div>
    )
  }

  if (error) {
    return <div className="text-destructive p-4">Error: {error}</div>
  }

  const RadialChartComponent = ({ containerClassName = "" }) => (
    <div className={`relative ${containerClassName}`}>
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius="20%"
          outerRadius="80%"
          barSize={20}
          startAngle={180}
          endAngle={0}
        >
          <PolarAngleAxis type="number" domain={[0, 5]} angleAxisId={0} tick={false} />
          <RadialBar
            background
            dataKey="value"
            angleAxisId={0}
            data={chartData}
            label={{ position: "insideStart", fill: "#fff", fontSize: 12 }}
            onClick={(data, index) => setActiveIndex(index)}
          >
            {chartData.map((entry, index) => (
              <LabelList
                key={`label-${index}`}
                dataKey="name"
                position="insideStart"
                fill="#fff"
                fontSize={11}
                stroke="none"
                className="capitalize"
              />
            ))}
          </RadialBar>
          <Tooltip content={<CustomTooltip />} />
        </RadialBarChart>
      </ResponsiveContainer>
      <button
        onClick={() => setIsModalOpen(true)}
        className="absolute bottom-2 right-2 bg-white p-1.5 rounded-md shadow-md hover:bg-gray-100 transition-colors"
        title="Maximize chart"
      >
        <Maximize2 className="h-4 w-4 text-slate-600" />
      </button>
    </div>
  )

  return (
    <Card className="h-full shadow-md" data-component="chart">
      <CardHeader className="pb-2 bg-[#f9faf5]">
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          Top 5 Diseases to Explore
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="w-[200px] text-xs">These are the top diseases based on current weight configuration</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        {chartData && (
          <>
            <RadialChartComponent containerClassName="h-[300px] w-full" />

            {/* Modal for maximized view */}
            {isModalOpen && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl">
                  <div className="p-4 border-b flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Disease Score Analysis</h3>
                    <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="p-6">
                    <RadialChartComponent containerClassName="h-[500px] w-full" />
                  </div>
                  <div className="p-4 border-t bg-gray-50 flex justify-end">
                    <Button onClick={() => setIsModalOpen(false)} variant="outline">
                      Close
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

function BenchmarkTable({ onWeightsUpdate }) {
  const navigate = useNavigate()
  // const router = useRouter()
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
  const [showAll, setShowAll] = useState(false)

  const fetchBenchmarkData = async (weights = null) => {
    setIsLoading(true)
    try {
      // In a real app, this would be an API call
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/benchmark-table`, {
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()
      if (data.error) {
        setError(data.error)
        toast.error(data.error)
      } else {
        setBenchmarkData(data.benchmark_table || [])
      }
    } catch (error) {
      console.error("Error fetching benchmark table:", error)
      setError("Error fetching benchmark data.")
      toast.error("Failed to update benchmark table")

      // Fallback data for preview
      const fallbackData = [
        {
          disease: "irritable bowel syndrome",
          benchmark_score: 0.85,
          score_breakdown_distribution: {
            No_of_Patient_Treated: 0.9,
            Gut_Microbiome_Association: 0.8,
            Rifaximin_Treatment: 0.85,
            Prevalence: 0.95,
            Bausch_Presence: 0.7,
            Safety_Efficacy: 0.8,
          },
        },
        {
          disease: "crohn's disease",
          benchmark_score: 0.72,
          score_breakdown_distribution: {
            No_of_Patient_Treated: 0.8,
            Gut_Microbiome_Association: 0.7,
            Rifaximin_Treatment: 0.65,
            Prevalence: 0.75,
            Bausch_Presence: 0.6,
            Safety_Efficacy: 0.75,
          },
        },
        {
          disease: "ulcerative colitis",
          benchmark_score: 0.68,
          score_breakdown_distribution: {
            No_of_Patient_Treated: 0.7,
            Gut_Microbiome_Association: 0.65,
            Rifaximin_Treatment: 0.6,
            Prevalence: 0.7,
            Bausch_Presence: 0.65,
            Safety_Efficacy: 0.7,
          },
        },
        {
          disease: "celiac disease",
          benchmark_score: 0.61,
          score_breakdown_distribution: {
            No_of_Patient_Treated: 0.6,
            Gut_Microbiome_Association: 0.55,
            Rifaximin_Treatment: 0.5,
            Prevalence: 0.65,
            Bausch_Presence: 0.6,
            Safety_Efficacy: 0.65,
          },
        },
        {
          disease: "diverticulitis",
          benchmark_score: 0.55,
          score_breakdown_distribution: {
            No_of_Patient_Treated: 0.5,
            Gut_Microbiome_Association: 0.5,
            Rifaximin_Treatment: 0.45,
            Prevalence: 0.6,
            Bausch_Presence: 0.55,
            Safety_Efficacy: 0.6,
          },
        },
      ]
      setBenchmarkData(fallbackData)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    fetchBenchmarkData()
  }, [])

  const handleWeightChange = (key, value) => {
    const numValue = Array.isArray(value) ? value[0] : Number.parseFloat(value)
    if (isNaN(numValue) || numValue < 0 || numValue > 1) return

    setWeights({
      ...weights,
      [key]: numValue,
    })
  }

  const updateBenchmark = async () => {
    setIsUpdating(true)
    try {
      // Update both chart and benchmark table
      const [chartResponse, benchmarkResponse] = await Promise.all([
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

      // Parse the JSON responses
      const chartData = await chartResponse.json()
      const benchmarkData = await benchmarkResponse.json()

      // Update benchmark data
      setBenchmarkData(benchmarkData.benchmark_table)

      // Pass the updated chart data to the parent component
      if (onWeightsUpdate && chartData.pie_chart_data) {
        onWeightsUpdate(weights, chartData.pie_chart_data)
      }

      toast.success("Scores updated successfully")
      setActiveTab("dashboard")
    } catch (error) {
      console.error("Error updating scores:", error)
      toast.error("Failed to update scores")
    }
    setIsUpdating(false)
  }

  const navigateToBenchmarkDetails = () => {
    // In a real app, this would navigate to a new page
    // router.push("/benchmark-details")
    navigate("/benchmark-details")
  }

  const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0)
  const isValidWeights = Math.abs(totalWeight - 1) < 0.01

  const getScoreColor = (score) => {
    if (score >= 0.8) return "bg-[#e8f5e9] text-[#2e7d32] border-[#a5d6a7]"
    if (score >= 0.7) return "bg-[#f1f8e9] text-[#558b2f] border-[#c5e1a5]"
    if (score >= 0.6) return "bg-[#f9fbe7] text-[#827717] border-[#e6ee9c]"
    if (score >= 0.5) return "bg-[#fff8e1] text-[#ff8f00] border-[#ffe082]"
    return "bg-[#fff3e0] text-[#ef6c00] border-[#ffcc80]"
  }

  const getProgressColor = (score) => {
    // Convert score to 0-5 scale if it's in 0-1 scale
    const normalizedScore = score <= 1 ? score * 5 : score

    if (normalizedScore >= 4.5) return "bg-[#4caf50]"
    if (normalizedScore >= 3.5) return "bg-[#8bc34a]"
    if (normalizedScore >= 2.5) return "bg-[#cddc39]"
    if (normalizedScore >= 1.5) return "bg-[#ffc107]"
    return "bg-[#ff9800]"
  }

  const sortedData = [...benchmarkData].sort((a, b) => {
    if (sortBy === "score") {
      return sortOrder === "desc" ? b.benchmark_score - a.benchmark_score : a.benchmark_score - b.benchmark_score
    } else {
      return sortOrder === "desc" ? b.disease.localeCompare(a.disease) : a.disease.localeCompare(b.disease)
    }
  })

  // Display only top 3 items in the preview
  const previewData = showAll ? sortedData : sortedData.slice(0, 3)

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(field)
      setSortOrder("desc")
    }
  }

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
          <div className="px-6 pt-4">
            <TabsList className="grid w-full grid-cols-2 bg-[#f5f8e8]">
              <TabsTrigger
                value="dashboard"
                className="data-[state=active]:bg-[#a6ce39] data-[state=active]:text-white flex items-center gap-2"
              >
                <BarChart3 className="h-4 w-4" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger
                value="weights"
                className="data-[state=active]:bg-[#a6ce39] data-[state=active]:text-white flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                Adjust Weights
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="dashboard" className="mt-0">
            <div className="p-4 flex justify-between items-center border-b">
              <div className="text-sm font-medium text-slate-700">{sortedData.length} Disease Benchmarks</div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500">Sort by:</span>
                <Select
                  value={`${sortBy}-${sortOrder}`}
                  onValueChange={(value) => {
                    const [field, order] = value.split("-")
                    setSortBy(field)
                    setSortOrder(order)
                  }}
                >
                  <SelectTrigger className="h-8 w-[180px] bg-white">
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

            <ScrollArea className="h-[220px]">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                {previewData.map((item, index) => (
                  <Card key={index} className="overflow-hidden border-slate-200 hover:shadow-md transition-shadow">
                    <CardHeader className="p-4 pb-2 bg-[#f9faf5] border-b">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-base font-medium text-slate-800 truncate">
                          {capitalizeName(item.disease)}
                        </CardTitle>
                        <Badge variant="outline" className={`font-mono ${getScoreColor(item.benchmark_score)}`}>
                          {item.benchmark_score.toFixed(2)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-slate-500">Benchmark Score</span>
                            <span className="text-xs font-medium">{item.benchmark_score.toFixed(2)}</span>
                          </div>
                          <Progress
                            value={Number.parseFloat(item.benchmark_score) * 100}
                            className={`h-2 ${getProgressColor(item.benchmark_score)}`}
                          />
                        </div>

                        {item.score_breakdown_distribution && (
                          <div className="grid grid-cols-2 gap-x-2 gap-y-2">
                            <div className="space-y-1">
                              <div className="flex justify-between">
                                <span className="text-xs text-slate-500">Enrollment: </span>
                                <span className="text-xs font-medium">
                                  {item.score_breakdown_distribution.No_of_Patient_Treated.toFixed(2)}
                                </span>
                              </div>
                              <Progress
                                value={
                                  Number.parseFloat(item.score_breakdown_distribution.No_of_Patient_Treated) * 100 * 5
                                }
                                className="h-1 bg-slate-100"
                              />
                            </div>

                            <div className="space-y-1">
                              <div className="flex justify-between">
                                <span className="text-xs text-slate-500">Mechanism: </span>
                                <span className="text-xs font-medium">
                                  {item.score_breakdown_distribution.Gut_Microbiome_Association.toFixed(2)}
                                </span>
                              </div>
                              <Progress
                                value={
                                  Number.parseFloat(item.score_breakdown_distribution.Gut_Microbiome_Association) *
                                  100 *
                                  5
                                }
                                className="h-1 bg-slate-100"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex justify-center p-4 pt-0">
                <Button
                  onClick={navigateToBenchmarkDetails}
                  className="bg-[#a6ce39] hover:bg-[#95b933] text-white font-medium flex items-center gap-2"
                >
                  View Full Analysis
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="weights" className="mt-0">
            <div className="px-6 py-4 h-[220px]">
              <div className="mb-4 bg-[#f5f8e8] p-4 rounded-md border border-[#e7f0d1]">
                <h3 className="text-sm font-medium text-[#4b6a1e] mb-2">Weight Configuration</h3>
                <p className="text-sm text-[#5c7a2e]">
                  Adjust the weight factors below to recalculate disease scores. The sum of all weights must equal 1.0
                  for accurate benchmarking.
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                {Object.entries(weights).map(([key, value]) => (
                  <div key={key} className="space-y-1">
                    <div className="flex justify-between">
                      <label className="text-xs text-muted-foreground capitalize">{key.replace("_", " ")}</label>
                      <span className="text-xs text-slate-500">{value.toFixed(2)}</span>
                    </div>
                    <Slider
                      value={[value]}
                      min={0}
                      max={1}
                      step={0.01}
                      onValueChange={(val) => handleWeightChange(key, val)}
                      className="py-2 [&>span]:bg-white [&>span]:border-white [&>span]:shadow-md [&>span:before]:bg-[#a6ce39]"
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
                  className="bg-[#a6ce39] hover:bg-[#95b933] text-white font-medium"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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

const renderCellContent = (record, topic) => {
  const key = topic.toLowerCase()
  const content = record[key]

  if (!content) return null

  if (typeof content === "string" && content.includes("\n")) {
    return <TruncatedMarkdown content={content} />
  }

  return content
}

export default function DrugFormulation() {
  const [tableData, setTableData] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [sseError, setSseError] = useState(null)
  const [orderedTabs, setOrderedTabs] = useState([])
  const [selectedDisease, setSelectedDisease] = useState("all")
  const [diseases, setDiseases] = useState([])

  // Mock selected tabs for the demo
  const selectedTabs = [
    "Disease",
    "Disease_Microbes",
    "Disease_Mechanism",
    "Drug_Microbes",
    "Drug_Mechanism",
    "Justification_for_Drug_Use",
    "Disease_Source",
    "Drug_Source",
  ]

  const fetchTableData = async (requestedFields, disease = "all") => {
    setIsLoading(true)
    try {
      const endpoint =
        `${import.meta.env.VITE_API_URL}/api/rnd-formulation-drug` +
        `?selected_tabs=${encodeURIComponent(requestedFields)}` +
        `&disease=${encodeURIComponent(disease)}`

      const response = await fetch(endpoint)
      const data = await response.json()

      if (data.error) {
        setSseError(data.error)
        toast.error(data.error)
      } else {
        setTableData(data.data)
        // Extract unique diseases for the dropdown
        const uniqueDiseases = Array.from(new Set(data.data.map((item) => item.disease)))
        setDiseases(uniqueDiseases)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      setSseError("Error fetching data.")
      toast.error("Failed to fetch table data")

      // Fallback data for preview
      const fallbackData = [
        {
          disease: "irritable bowel syndrome",
          disease_microbes: "Altered gut microbiota with decreased diversity...",
          disease_mechanism: "Dysregulation of the gut-brain axis...",
          drug_microbes: "Targets harmful bacteria in the small intestine...",
          drug_mechanism: "Non-systemic antibiotic that acts locally in the gut...",
          justification_for_drug_use: "Rifaximin has shown efficacy in treating IBS symptoms...",
          disease_source: "Multiple clinical studies and meta-analyses...",
          drug_source: "FDA approved for IBS-D treatment...",
        },
        {
          disease: "crohn's disease",
          disease_microbes: "Dysbiosis with increased Enterobacteriaceae...",
          disease_mechanism: "Chronic inflammation of the digestive tract...",
          drug_microbes: "May help restore microbial balance...",
          drug_mechanism: "Modulates gut microbiota and reduces inflammation...",
          justification_for_drug_use: "Studies suggest potential benefits in maintaining remission...",
          disease_source: "Research from IBD centers worldwide...",
          drug_source: "Clinical trials and observational studies...",
        },
      ]
      setTableData(fallbackData)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    const uniqueSelectedTabs = Array.from(new Set(selectedTabs))
    const columnOrder = [
      "Disease",
      "Disease_Microbes",
      "Disease_Mechanism",
      "Drug_Microbes",
      "Drug_Mechanism",
      "Justification_for_Drug_Use",
      "Disease_Source",
      "Drug_Source",
    ]
    const orderedTabs = columnOrder.filter((tab) => uniqueSelectedTabs.includes(tab))
    setOrderedTabs(orderedTabs)

    const requestedFields = orderedTabs.join(",")
    fetchTableData(requestedFields, selectedDisease)
  }, [selectedTabs, selectedDisease])

  const handleWeightsUpdate = (weights, chartData) => {
    // If chart data is provided, update the chart component
    const chartElement = document.querySelector('[data-component="chart"]')
    if (chartElement && chartElement.updateData && chartData) {
      chartElement.updateData(chartData)
    }
  }

  // Filter table data based on selected disease
  const filteredTableData =
    selectedDisease === "all" ? tableData : tableData.filter((record) => record.disease === selectedDisease)

  return (
    <div className="p-6 bg-background min-h-screen">
      <ToastContainer position="top-right" autoClose={5000} />

      <div className="max-w-[1400px] mx-auto">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Drug Formulation Results</h1>
          <p className="text-muted-foreground mt-1">Analysis and benchmarking of drug formulations</p>
        </header>

        {/* Analytics Dashboard Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="h-[400px]">
            <RadialChart
              onDataUpdate={() => {}} // We're using the DOM method instead
            />
          </div>
          <div className="h-[400px]">
            <BenchmarkTable onWeightsUpdate={handleWeightsUpdate} />
          </div>
        </div>

        <Card className="mb-8 shadow-md">
          <CardHeader className="pb-3 bg-[#f9faf5]">
            <div className="flex items-center justify-between">
              <CardTitle>Disease Data</CardTitle>

              <div className="flex items-center gap-4">
                {/* Disease Filter Dropdown */}
                <Select value={selectedDisease} onValueChange={setSelectedDisease}>
                  <SelectTrigger className="w-[180px] border-[#a6ce39] focus:ring-[#a6ce39]">
                    <SelectValue placeholder="Select disease" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="all">All Diseases</SelectItem>
                    {diseases.map((disease) => (
                      <SelectItem key={disease} value={disease}>
                        {capitalizeName(disease)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Loading and error states */}
            <div className="flex items-center gap-4 mt-2">
              {sseError && <p className="text-destructive text-sm">{sseError}</p>}
              {isLoading && (
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Loader2 className="animate-spin h-4 w-4" />
                  <span>Loading data...</span>
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="border-t">
              <div className="h-[500px] overflow-x-auto">
                <table className="w-full min-w-max border-collapse">
                  <thead>
                    <tr className="bg-[#f5f8e8] sticky top-0 z-10">
                      {orderedTabs.map((topic) => (
                        <th
                          key={topic}
                          className="p-3 text-left text-xs font-medium uppercase tracking-wider whitespace-nowrap text-gray-700"
                          style={{ minWidth: "180px" }}
                        >
                          {topic.replace(/_/g, " ")}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTableData.length > 0 ? (
                      filteredTableData.map((record, rowIndex) => (
                        <tr key={rowIndex} className="border-b border-border hover:bg-[#f9faf5] transition-colors">
                          {orderedTabs.map((topic) => (
                            <td key={topic} className="p-4 align-top w-[400px] max-w-[400px] text-sm">
                              {topic === "Disease"
                                ? capitalizeName(renderCellContent(record, topic))
                                : renderCellContent(record, topic)}
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={orderedTabs.length} className="p-6 text-center text-muted-foreground">
                          {isLoading ? "Loading data..." : "No data available for the selected filters."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
