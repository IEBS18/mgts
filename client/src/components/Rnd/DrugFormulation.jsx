"use client"

import { useState, useEffect } from "react"
import { useLocation } from "react-router-dom"
import { Loader2, Info } from "lucide-react"
import ReactMarkdown from "react-markdown"
import { ToastContainer, toast } from "react-toastify"
import { Cell, Pie, PieChart, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"

const LoadingDots = () => {
  return <span className="loading-dots">...</span>
}

function capitalizeName(name) {
  return name
    .split(' ')  // Split the name into words
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())  // Capitalize first letter of each word
    .join(' ');  // Join the words back into a single string
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

function PieChartComp({ onDataUpdate }) {
  const [pieChartData, setPieChartData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AF19FF"]

  const fetchPieChartData = async (weights = null) => {
    setIsLoading(true)
    try {
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
        setPieChartData(data.pie_chart_data)
        if (onDataUpdate) onDataUpdate(data.pie_chart_data)
      }
    } catch (error) {
      console.error("Error fetching pie chart:", error)
      setError("Error fetching pie chart data.")
      toast.error("Failed to update pie chart")
    }
    setIsLoading(false)
  }

  useEffect(() => {
    fetchPieChartData()
  }, [])

  // Add this function to PieChartComp
  const updateData = (newData) => {
    if (newData) {
      setPieChartData(newData)
    }
  }

  // Expose the updateData method to the parent component
  useEffect(() => {
    if (onDataUpdate) {
      // This allows the parent to call updateData
      const element = document.querySelector('[data-component="pie-chart"]')
      if (element) {
        element.updateData = updateData
      }
    }
  }, [onDataUpdate])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="animate-spin mr-2 h-5 w-5 text-primary" />
        <span>Loading pie chart...</span>
      </div>
    )
  }

  if (error) {
    return <div className="text-destructive p-4">Error: {error}</div>
  }

  return (
    <Card className="h-full shadow-md" data-component="pie-chart">
      <CardHeader className="pb-2 bg-[#f9faf5]">
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          Top 5 Diseases to Explore
          <TooltipProvider>
            <UITooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="w-[200px] text-xs">These are the top diseases based on current weight configuration</p>
              </TooltipContent>
            </UITooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {pieChartData && (
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="55%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${capitalizeName(name)} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                {/* <Tooltip formatter={(value) => [`Score: ${value}`, "Value"]} /> */}
                {/* <Legend layout="vertical" verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: "10px" }} /> */}
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function BenchmarkTable({ onWeightsUpdate }) {
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
  const [activeTab, setActiveTab] = useState("table")

  const fetchBenchmarkData = async (weights = null) => {
    setIsLoading(true)
    try {
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
        setBenchmarkData(data.benchmark_table)
      }
    } catch (error) {
      console.error("Error fetching benchmark table:", error)
      setError("Error fetching benchmark data.")
      toast.error("Failed to update benchmark table")
    }
    setIsLoading(false)
  }

  useEffect(() => {
    fetchBenchmarkData()
  }, [])

  const handleWeightChange = (key, value) => {
    const numValue = Number.parseFloat(value)
    if (isNaN(numValue) || numValue < 0 || numValue > 1) return

    setWeights({
      ...weights,
      [key]: numValue,
    })
  }

  const updateBenchmark = async () => {
    setIsUpdating(true)
    try {
      // Update both pie chart and benchmark table
      const [pieChartResponse, benchmarkResponse] = await Promise.all([
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
      const pieChartData = await pieChartResponse.json()
      const benchmarkData = await benchmarkResponse.json()

      // Update benchmark data
      setBenchmarkData(benchmarkData.benchmark_table)

      // Pass the updated pie chart data to the parent component
      if (onWeightsUpdate && pieChartData.pie_chart_data) {
        onWeightsUpdate(weights, pieChartData.pie_chart_data)
      }

      toast.success("Scores updated successfully")
    } catch (error) {
      console.error("Error updating scores:", error)
      toast.error("Failed to update scores")
    }
    setIsUpdating(false)
  }

  const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0)
  const isValidWeights = Math.abs(totalWeight - 1) < 0.01

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="animate-spin mr-2 h-5 w-5 text-primary" />
        <span>Loading benchmark data...</span>
      </div>
    )
  }

  if (error) {
    return <div className="text-destructive p-4">Error: {error}</div>
  }

  return (
    <Card className="h-full shadow-md">
      <CardHeader className="pb-2 bg-[#f9faf5]">
        <CardTitle className="text-xl font-semibold">Benchmark Scores</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="px-6 pt-2">
            <TabsList className="grid w-full grid-cols-2 bg-[#f5f8e8]">
              <TabsTrigger value="table" className="data-[state=active]:bg-[#a6ce39] data-[state=active]:text-white">
                Scores
              </TabsTrigger>
              <TabsTrigger value="weights" className="data-[state=active]:bg-[#a6ce39] data-[state=active]:text-white">
                Adjust Weights
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="table" className="mt-0">
            <div className="px-6 py-2">
              <ScrollArea className="h-[220px] rounded-md border">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#f5f8e8] sticky top-0">
                      <th className="text-left p-2 text-xs font-medium">Disease</th>
                      <th className="text-left p-2 text-xs font-medium">Score</th>
                      <th className="text-left p-2 text-xs font-medium">Weight Distribution</th>
                    </tr>
                  </thead>
                  <tbody>
                    {benchmarkData.map((item, index) => (
                      <tr key={index} className="border-b hover:bg-[#f9faf5]">
                        <td className="p-2 text-xs">{capitalizeName(item.disease)}</td>
                        <td className="p-2 text-xs">
                          <Badge variant="outline" className="font-mono bg-[#f5f8e8] text-gray-700">
                            {item.benchmark_score}
                          </Badge>
                        </td>
                        <td className="p-2 text-xs">
                          {item.score_breakdown_distribution && (
                            <div className="grid grid-cols-2 gap-x-2 text-[10px] text-muted-foreground">
                              <div>Enrollment: {item.score_breakdown_distribution.No_of_Patient_Treated}</div>
                              <div>Mechanism: {item.score_breakdown_distribution.Gut_Microbiome_Association}</div>
                              <div>Justification: {item.score_breakdown_distribution.Rifaximin_Treatment}</div>
                              <div>Prevalence: {item.score_breakdown_distribution.Prevalence}</div>
                              <div>Bausch: {item.score_breakdown_distribution.Bausch_Presence}</div>
                              <div>Safety: {item.score_breakdown_distribution.Safety_Efficacy}</div>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ScrollArea>
            </div>
          </TabsContent>

          <TabsContent value="weights" className="mt-0">
            <div className="px-6 py-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                {Object.entries(weights).map(([key, value]) => (
                  <div key={key} className="space-y-1">
                    <label className="text-xs text-muted-foreground capitalize">{key.replace("_", " ")}</label>
                    <Input
                      type="number"
                      value={value}
                      onChange={(e) => handleWeightChange(key, e.target.value)}
                      step="0.05"
                      min="0"
                      max="1"
                      className="h-8"
                    />
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between">
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
  const location = useLocation()
  const { selectedTabs = [] } = location.state || {}

  const [tableData, setTableData] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [sseError, setSseError] = useState(null)
  const [orderedTabs, setOrderedTabs] = useState([])
  const [selectedDisease, setSelectedDisease] = useState("all")
  const [diseases, setDiseases] = useState([])

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
    }
    setIsLoading(false)
  }

  useEffect(() => {
    const uniqueSelectedTabs = Array.from(new Set(selectedTabs))
    const columnOrder = [
      "Disease",
      "Disease_Microbes",
      "Disease_Mechanism",
      // "Drug_Title",
      "Drug_Microbes",
      "Drug_Mechanism",
      "Justification_for_Drug_Use",
      "Disease_Source",
      // "Disease_Title",
      "Drug_Source",
    ]
    const orderedTabs = columnOrder.filter((tab) => uniqueSelectedTabs.includes(tab))
    setOrderedTabs(orderedTabs)

    const requestedFields = orderedTabs.join(",")
    fetchTableData(requestedFields, selectedDisease)
  }, [selectedTabs, selectedDisease])

  const handleWeightsUpdate = (weights, pieChartData) => {
    // If pie chart data is provided, update the pie chart component
    const pieChartElement = document.querySelector('[data-component="pie-chart"]')
    if (pieChartElement && pieChartElement.updateData && pieChartData) {
      pieChartElement.updateData(pieChartData)
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
          <div className="h-[350px]">
            <PieChartComp
              onDataUpdate={() => { }} // We're using the DOM method instead
            />
          </div>
          <div className="h-[350px]">
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
                              {topic === 'Disease' ? capitalizeName(renderCellContent(record, topic)) : renderCellContent(record, topic)}
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

