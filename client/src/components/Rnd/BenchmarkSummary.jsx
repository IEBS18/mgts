// "use client"

// import { useState, useEffect } from "react"
// import { Loader2, Info, Settings, BarChart3, ExternalLink } from "lucide-react"
// import { toast } from "react-toastify"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
// import { Badge } from "@/components/ui/badge"
// import { Progress } from "@/components/ui/progress"
// import "react-toastify/dist/ReactToastify.css"

// function capitalizeName(name) {
//   return name
//     .split(" ")
//     .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
//     .join(" ")
// }

// function BenchmarkTableSummary({ onWeightsUpdate, onViewFullBenchmark, pieChartData, weightsFromUrl }) {
//   const [benchmarkData, setBenchmarkData] = useState([])
//   const [isLoading, setIsLoading] = useState(true)
//   const [error, setError] = useState(null)
//   const [topDiseases, setTopDiseases] = useState([])

//   const fetchBenchmarkData = async (customWeights = null) => {
//     setIsLoading(true)
//     try {
//       let response
//       if (customWeights) {
//         response = await fetch(`${import.meta.env.VITE_API_URL}/api/benchmark-table`, {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({ weights: customWeights }),
//         })
//       } else {
//         response = await fetch(`${import.meta.env.VITE_API_URL}/api/benchmark-table`, {
//           headers: {
//             "Content-Type": "application/json",
//           },
//         })
//       }

//       const data = await response.json()
//       if (data.error) {
//         setError(data.error)
//         toast.error(data.error)
//       } else {
//         setBenchmarkData(data.benchmark_table)

//         // Get top 5 diseases by benchmark score
//         const sortedData = [...data.benchmark_table].sort((a, b) => b.benchmark_score - a.benchmark_score)
//         setTopDiseases(sortedData.slice(0, 5))
//       }
//     } catch (error) {
//       console.error("Error fetching benchmark table:", error)
//       setError("Error fetching benchmark data.")
//       toast.error("Failed to update benchmark table")
//     }
//     setIsLoading(false)
//   }

//   // useEffect(() => {
//   //   fetchBenchmarkData()
//   // }, [])

//   useEffect(() => {
//     if (weightsFromUrl) {
//       try {
//         const parsedWeights = JSON.parse(weightsFromUrl)
//         fetchBenchmarkData(parsedWeights)
//       } catch (error) {
//         console.error("Error parsing weights from URL:", error)
//         fetchBenchmarkData()
//       }
//     } else {
//       fetchBenchmarkData()
//     }
//   }, [weightsFromUrl])

//   // Update top diseases when pieChartData changes
//   useEffect(() => {
//     if (pieChartData && pieChartData.length > 0 && benchmarkData.length > 0) {
//       // Map pieChartData to corresponding benchmark data
//       const topDiseasesByChart = pieChartData
//         .map((chartItem) => {
//           return benchmarkData.find((item) => item.disease === chartItem.name) || null
//         })
//         .filter((item) => item !== null)

//       setTopDiseases(topDiseasesByChart)
//     }
//   }, [pieChartData, benchmarkData])

//   const getScoreColor = (score) => {
//     const normalizedScore = (score / 5) * 100
//     if (normalizedScore >= 90) return "bg-[#e8f5e9] text-[#2e7d32] border-[#a5d6a7]"
//     if (normalizedScore >= 80) return "bg-[#f1f8e9] text-[#558b2f] border-[#c5e1a5]"
//     if (normalizedScore >= 70) return "bg-[#f9fbe7] text-[#827717] border-[#e6ee9c]"
//     if (normalizedScore >= 60) return "bg-[#fff8e1] text-[#ff8f00] border-[#ffe082]"
//     return "bg-[#fff3e0] text-[#ef6c00] border-[#ffcc80]"
//   }

//   const getProgressColor = (score) => {
//     const normalizedScore = (score / 5) * 100
//     if (normalizedScore >= 90) return "bg-[#4caf50]"
//     if (normalizedScore >= 70) return "bg-[#8bc34a]"
//     if (normalizedScore >= 50) return "bg-[#cddc39]"
//     if (normalizedScore >= 30) return "bg-[#ffc107]"
//     return "bg-[#ff9800]"
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
//             <CardTitle className="text-xl font-semibold">Top Disease Analysis</CardTitle>
//           </div>
//           <div className="flex items-center gap-2">
//             <TooltipProvider>
//               <Tooltip>
//                 <TooltipTrigger asChild>
//                   <Button variant="ghost" size="icon" className="h-8 w-8">
//                     <Info className="h-4 w-4 text-slate-500" />
//                   </Button>
//                 </TooltipTrigger>
//                 <TooltipContent className="max-w-xs rounded-[12px]">
//                   <p className="text-xs ">
//                     Showing top 5 diseases based on benchmark scores. View full analysis to adjust weights.
//                   </p>
//                 </TooltipContent>
//               </Tooltip>
//             </TooltipProvider>
//             <Button
//               variant="outline"
//               size="sm"
//               className="h-8 flex items-center gap-1 text-xs rounded-[12px] border-[#a6ce39] text-[#4b6a1e] hover:bg-[#f5f8e8]"
//               onClick={onViewFullBenchmark}
//             >
//               <Settings className="h-3 w-3" />
//               Adjust Weights
//               <ExternalLink className="h-3 w-3 ml-1" />
//             </Button>
//           </div>
//         </div>
//       </CardHeader>
//       <CardContent className="p-4">
//         <div className="space-y-4">
//           {topDiseases.length > 0 ? (
//             topDiseases.map((item, index) => (
//               <div key={index} className="flex items-center gap-3">
//                 <div className="w-8 h-8 flex items-center justify-center rounded-full bg-[#f5f8e8] text-[#4b6a1e] font-medium text-sm">
//                   {index + 1}
//                 </div>
//                 <div className="flex-1">
//                   <div className="flex justify-between items-center mb-1">
//                     <span className="font-medium text-sm truncate max-w-[180px]">{capitalizeName(item.disease)}</span>
//                     <Badge variant="outline" className={`font-mono text-xs ${getScoreColor(item.benchmark_score)}`}>
//                       {item.benchmark_score}
//                     </Badge>
//                   </div>
//                   <Progress
//                     value={(item.benchmark_score / 5) * 100} // Calculate width based on score
//                     className={`h-2 bg-black/10`}
//                   />
//                 </div>
//               </div>
//             ))
//           ) : (
//             <div className="text-center text-muted-foreground py-4">No benchmark data available</div>
//           )}
//         </div>
//       </CardContent>
//     </Card>
//   )
// }

// export default BenchmarkTableSummary



"use client"

import { useState, useEffect } from "react"
import { Loader2, Info, Settings, BarChart3, ExternalLink } from "lucide-react"
import { toast } from "react-toastify"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import "react-toastify/dist/ReactToastify.css"

function capitalizeName(name) {
  return name
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ")
}

function BenchmarkTableSummary({
  onWeightsUpdate,
  onViewFullBenchmark,
  pieChartData,
  weightsFromUrl,
  isLoading: parentIsLoading,
}) {
  const [benchmarkData, setBenchmarkData] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [topDiseases, setTopDiseases] = useState([])

  // Use either parent loading state or internal loading state
  const showLoading = parentIsLoading || isLoading

  const fetchBenchmarkData = async (customWeights = null) => {
    setIsLoading(true)
    try {
      let response
      if (customWeights) {
        response = await fetch(`${import.meta.env.VITE_API_URL}/api/benchmark-table`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ weights: customWeights }),
        })
      } else {
        response = await fetch(`${import.meta.env.VITE_API_URL}/api/benchmark-table`, {
          headers: {
            "Content-Type": "application/json",
          },
        })
      }

      const data = await response.json()
      if (data.error) {
        setError(data.error)
        toast.error(data.error)
      } else {
        setBenchmarkData(data.benchmark_table)

        // Get top 5 diseases by benchmark score
        const sortedData = [...data.benchmark_table].sort((a, b) => b.benchmark_score - a.benchmark_score)
        setTopDiseases(sortedData.slice(0, 5))
      }
    } catch (error) {
      console.error("Error fetching benchmark table:", error)
      setError("Error fetching benchmark data.")
      toast.error("Failed to update benchmark table")
    }
    setIsLoading(false)
  }

  // useEffect(() => {
  //   fetchBenchmarkData()
  // }, [])

  useEffect(() => {
    if (weightsFromUrl) {
      try {
        const parsedWeights = JSON.parse(weightsFromUrl)
        fetchBenchmarkData(parsedWeights)
      } catch (error) {
        console.error("Error parsing weights from URL:", error)
        fetchBenchmarkData()
      }
    } else {
      fetchBenchmarkData()
    }
  }, [weightsFromUrl])

  // Update top diseases when pieChartData changes
  useEffect(() => {
    if (pieChartData && pieChartData.length > 0 && benchmarkData.length > 0) {
      // Map pieChartData to corresponding benchmark data
      const topDiseasesByChart = pieChartData
        .map((chartItem) => {
          return benchmarkData.find((item) => item.disease === chartItem.name) || null
        })
        .filter((item) => item !== null)

      setTopDiseases(topDiseasesByChart)
    }
  }, [pieChartData, benchmarkData])

  const getScoreColor = (score) => {
    const normalizedScore = (score / 5) * 100
    if (normalizedScore >= 90) return "bg-[#e8f5e9] text-[#2e7d32] border-[#a5d6a7]"
    if (normalizedScore >= 80) return "bg-[#f1f8e9] text-[#558b2f] border-[#c5e1a5]"
    if (normalizedScore >= 70) return "bg-[#f9fbe7] text-[#827717] border-[#e6ee9c]"
    if (normalizedScore >= 60) return "bg-[#fff8e1] text-[#ff8f00] border-[#ffe082]"
    return "bg-[#fff3e0] text-[#ef6c00] border-[#ffcc80]"
  }

  const getProgressColor = (score) => {
    const normalizedScore = (score / 5) * 100
    if (normalizedScore >= 90) return "bg-[#4caf50]"
    if (normalizedScore >= 70) return "bg-[#8bc34a]"
    if (normalizedScore >= 50) return "bg-[#cddc39]"
    if (normalizedScore >= 30) return "bg-[#ffc107]"
    return "bg-[#ff9800]"
  }

  if (showLoading) {
    return (
      <Card className="h-full shadow-md flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 p-6">
          <Loader2 className="animate-spin h-10 w-10 text-[#6b8e23]" />
          <p className="text-base font-medium text-[#6b8e23]">Loading benchmark analysis...</p>
        </div>
      </Card>
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
            <CardTitle className="text-xl font-semibold">Top Disease Analysis</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Info className="h-4 w-4 text-slate-500" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs rounded-[12px]">
                  <p className="text-xs ">
                    Showing top 5 diseases based on benchmark scores. View full analysis to adjust weights.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Button
              variant="outline"
              size="sm"
              className="h-8 flex items-center gap-1 text-xs rounded-[12px] border-[#a6ce39] text-[#4b6a1e] hover:bg-[#f5f8e8]"
              onClick={onViewFullBenchmark}
            >
              <Settings className="h-3 w-3" />
              Adjust Weights
              <ExternalLink className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-4">
          {topDiseases.length > 0 ? (
            topDiseases.map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center rounded-full bg-[#f5f8e8] text-[#4b6a1e] font-medium text-sm">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-sm truncate max-w-[180px]">{capitalizeName(item.disease)}</span>
                    <Badge variant="outline" className={`font-mono text-xs ${getScoreColor(item.benchmark_score)}`}>
                      {item.benchmark_score}
                    </Badge>
                  </div>
                  <Progress
                    value={(item.benchmark_score / 5) * 100} // Calculate width based on score
                    className={`h-2 bg-black/10`}
                  />
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-muted-foreground py-4">No benchmark data available</div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default BenchmarkTableSummary
