import React, { useState, useEffect } from "react"
import { useLocation } from "react-router-dom"
import { Loader2, ChevronDown } from "lucide-react"
import ReactMarkdown from "react-markdown"
import { ToastContainer, toast } from "react-toastify"
import { Cell, Pie, PieChart, Tooltip } from 'recharts'

const LoadingDots = () => {
  return <span className="loading-dots">...</span>;
}

const TruncatedMarkdown = ({ content, maxLength = 200 }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!content) return null;
  
  const displayContent = isExpanded ? content : content.slice(0, maxLength);
  const shouldTruncate = content.length > maxLength;
  
  return (
    <div>
      <ReactMarkdown>{displayContent}</ReactMarkdown>
      {shouldTruncate && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-blue-500 hover:text-blue-700"
        >
          {isExpanded ? 'Show less' : '...Show more'}
        </button>
      )}
    </div>
  );
}

function PieChartComp({ onDataUpdate }) {
  const [pieChartData, setPieChartData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF']

  const fetchPieChartData = async (weights = null) => {
    setIsLoading(true)
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/pie-chart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: weights ? JSON.stringify({ weights }) : null,
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="animate-spin mr-2" />
        <span>Loading pie chart...</span>
      </div>
    )
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-md h-full">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Top 5 Diseases to Explore</h2>
      {pieChartData && (
        <div className="flex h-full justify-center">
          <PieChart width={200} height={200}>
            <Pie
              data={pieChartData}
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label
            >
              {pieChartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </div>
      )}
    </div>
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

  const fetchBenchmarkData = async (weights = null) => {
    setIsLoading(true)
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/benchmark-table`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: weights ? JSON.stringify({ weights }) : null,
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
      await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/api/pie-chart`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ weights })
        }),
        fetch(`${import.meta.env.VITE_API_URL}/api/benchmark-table`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ weights })
        })
      ])

      // Fetch updated data
      await fetchBenchmarkData(weights)
      if (onWeightsUpdate) onWeightsUpdate(weights)
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
        <Loader2 className="animate-spin mr-2" />
        <span>Loading benchmark data...</span>
      </div>
    )
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-md h-full">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Benchmark Scores</h2>

      {/* Weights Configuration */}
      <div className="mb-4 p-3 bg-gray-50 rounded-md">
        <h3 className="font-semibold mb-2">Adjust Weights</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-2">
          {Object.entries(weights).map(([key, value]) => (
            <div key={key} className="flex flex-col">
              <label className="text-xs text-gray-600 capitalize">
                {key.replace('_', ' ')}
              </label>
              <input
                type="number"
                value={value}
                onChange={(e) => handleWeightChange(key, e.target.value)}
                step="0.05"
                min="0"
                max="1"
                className="border rounded px-2 py-1 text-sm"
              />
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <div className={`text-xs ${isValidWeights ? "text-green-600" : "text-red-600"}`}>
            Total: {totalWeight.toFixed(2)} {isValidWeights ? "✓" : "(should equal 1.0)"}
          </div>
          <button
            onClick={updateBenchmark}
            disabled={!isValidWeights || isUpdating}
            className={`px-3 py-1 text-sm rounded ${isValidWeights ? "bg-[#a6ce39] text-white hover:bg-[#95b933]" : "bg-gray-300 cursor-not-allowed"}`}
          >
            {isUpdating ? "Updating..." : "Update Scores"}
          </button>
        </div>
      </div>

      {/* Benchmark Table */}
      <div className="overflow-y-auto max-h-[200px]">
        <table className="min-w-full text-sm text-gray-700">
          <thead>
            <tr className="bg-[#a6ce39]">
              <th className="px-2 py-2 text-white">Disease</th>
              <th className="px-2 py-2 text-white">Benchmark Score</th>
              <th className="px-2 py-2 text-white">Weight Distribution</th>
            </tr>
          </thead>
          <tbody>
            {benchmarkData.map((item, index) => (
              <tr key={index} className="border-b hover:bg-gray-50">
                <td className="px-2 py-2">{item.disease}</td>
                <td className="px-2 py-2">{item.benchmark_score}</td>
                <td className="px-2 py-2 text-xs">
                  {item.Weights && (
                    <div className="grid grid-cols-2 gap-x-2">
                      <div>Enrollment: {item.Weights.enrollment}</div>
                      <div>Mechanism: {item.Weights.mechanism}</div>
                      <div>Justification: {item.Weights.justification}</div>
                      <div>Prevalence: {item.Weights.prevalence}</div>
                      <div>Bausch: {item.Weights.bausch_presence}</div>
                      <div>Safety: {item.Weights.safety_efficacy}</div>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const renderCellContent = (record, topic) => {
  const key = topic.toLowerCase();
  const content = record[key];
  
  if (!content) return null;
  
  if (typeof content === 'string' && content.includes('\n')) {
    return <TruncatedMarkdown content={content} />;
  }
  
  return content;
};

export default function DrugFormulation() {
  const location = useLocation()
  const { selectedTabs = [] } = location.state || {}

  const [tableData, setTableData] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [sseError, setSseError] = useState(null)
  const [orderedTabs, setOrderedTabs] = useState([])
  const [selectedDisease, setSelectedDisease] = useState('all')
  const [diseases, setDiseases] = useState([])

  const fetchTableData = async (requestedFields, disease = 'all') => {
    setIsLoading(true)
    try {
      const endpoint = `${import.meta.env.VITE_API_URL}/api/rnd-formulation-drug` +
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
        const uniqueDiseases = Array.from(new Set(data.data.map(item => item.disease)))
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
      "Diseases_PMC_ID",
      "Disease_Title",
      "Disease_Mechanism",
      "Disease_Microbes",
      "Drug_PMC_ID",
      "Drug_Title",
      "Drug_Mechanism",
      "Drug_Microbes",
      "Justification_for_Drug_Use",
    ]
    const orderedTabs = columnOrder.filter((tab) => uniqueSelectedTabs.includes(tab))
    setOrderedTabs(orderedTabs)

    const requestedFields = orderedTabs.join(",")
    fetchTableData(requestedFields, selectedDisease)
  }, [selectedTabs, selectedDisease])

  const handleWeightsUpdate = async (weights) => {
    // This will trigger updates for both charts
    const pieChartRef = document.querySelector('[data-component="pie-chart"]')
    const benchmarkRef = document.querySelector('[data-component="benchmark"]')
    
    if (pieChartRef) pieChartRef.updateData(weights)
    if (benchmarkRef) benchmarkRef.updateData(weights)
  }

  // Filter table data based on selected disease
  const filteredTableData = selectedDisease === 'all' 
    ? tableData 
    : tableData.filter(record => record.disease === selectedDisease)

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <ToastContainer position="top-right" autoClose={5000} />

      <h1 className="text-2xl font-bold mb-4 text-gray-800">Drug Formulation Results</h1>

      {/* Analytics Dashboard Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="h-[350px]">
          <PieChartComp onDataUpdate={(data) => console.log('Pie chart updated:', data)} />
        </div>
        <div className="h-[350px]">
          <BenchmarkTable onWeightsUpdate={handleWeightsUpdate} />
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-4">
          {sseError && <p className="text-red-500">{sseError}</p>}
          {isLoading && (
            <div className="flex items-center gap-2 text-gray-500">
              <Loader2 className="animate-spin" />
              <span>Loading data...</span>
            </div>
          )}
        </div>

        {/* Disease Filter Dropdown */}
        <div className="relative">
          <select
            value={selectedDisease}
            onChange={(e) => setSelectedDisease(e.target.value)}
            className="appearance-none bg-white border border-gray-300 rounded-md py-2 pl-3 pr-10 text-sm leading-5 focus:outline-none focus:ring-2 focus:ring-[#a6ce39] focus:border-[#a6ce39]"
          >
            <option value="all">All Diseases</option>
            {diseases.map((disease) => (
              <option key={disease} value={disease}>{disease}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>
      </div>

      <div className="overflow-y-auto max-h-[500px] border border-gray-300 rounded-lg bg-white shadow-md">
        {/* Disease Table */}
        <table className="min-w-max text-sm text-gray-700">
          <thead>
            <tr className="sticky top-0 bg-[#a6ce39]">
              {orderedTabs.map((topic) => (
                <th
                  key={topic}
                  className="px-2 py-3 font-medium text-white whitespace-nowrap"
                  style={{ minWidth: "180px" }}
                >
                  {topic.replace(/_/g, " ").toUpperCase()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredTableData.map((record, rowIndex) => (
              <tr key={rowIndex} className="border-b hover:bg-gray-50">
                {orderedTabs.map((topic) => (
                  <td key={topic} className="px-2 py-3 align-top w-[400px] max-w-[400px] break-words">
                    {renderCellContent(record, topic)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}