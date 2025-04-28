// "use client"

// import { useState, useEffect } from "react"
// import { useLocation, useNavigate, useSearchParams } from "react-router-dom"
// import { ToastContainer, toast } from "react-toastify"
// import RadialChart from "./RadialChart"
// import BenchmarkTableSummary from "./BenchmarkSummary"
// import DiseaseTable from "./DiseaseTable"
// import "react-toastify/dist/ReactToastify.css"
// import "./custom.css" // Import your custom CSS file

// export default function DrugFormulation() {
//   const location = useLocation()
//   const { selectedTabs = [] } = location.state || {}
//   const navigate = useNavigate()
//   const [pieChartData, setPieChartData] = useState(null)
//   const [tableData, setTableData] = useState([])
//   const [isLoading, setIsLoading] = useState(false)
//   const [sseError, setSseError] = useState(null)
//   const [orderedTabs, setOrderedTabs] = useState([])
//   const [selectedDisease, setSelectedDisease] = useState("all")
//   const [diseases, setDiseases] = useState([])
//   const [visibleColumns, setVisibleColumns] = useState([])
//   const [searchParams] = useSearchParams()
//   const weightsFromUrl = searchParams.get("weights")

//   // Fetch pie chart data
//   const fetchPieChartData = async (weights = null) => {
//     try {
//       let response
//       if (weights) {
//         response = await fetch(`${import.meta.env.VITE_API_URL}/api/pie-chart`, {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({ weights: JSON.parse(weights) }),
//         })
//       } else {
//         response = await fetch(`${import.meta.env.VITE_API_URL}/api/pie-chart`, {
//           headers: {
//             "Content-Type": "application/json",
//           },
//         })
//       }
//       const data = await response.json()
//       if (data.error) {
//         toast.error(data.error)
//       } else {
//         setPieChartData(data.pie_chart_data)
//       }
//     } catch (error) {
//       console.error("Error fetching pie chart:", error)
//       toast.error("Failed to update pie chart")
//     }
//   }

//   const fetchTableData = async (requestedFields, disease = "all") => {
//     setIsLoading(true)
//     try {
//       const endpoint =
//         `${import.meta.env.VITE_API_URL}/api/rnd-formulation-drug` +
//         `?selected_tabs=${encodeURIComponent(requestedFields)}` +
//         `&disease=${encodeURIComponent(disease)}`

//       const resText = await fetch(endpoint).then((r) => r.text())

//       /* ------------------------------------------------------------------
//          Replace NaN / Infinity / -Infinity with null so JSON.parse works.
//          You can add more patterns if the backend emits other JS literals.
//       ------------------------------------------------------------------ */
//       const safeText = resText.replace(/\b(NaN|Infinity|-Infinity)\b/g, "null")

//       const data = JSON.parse(safeText)

//       if (data.error) {
//         setSseError(data.error)
//         toast.error(data.error)
//       } else {
//         setTableData(data.data)
//         const uniqueDiseases = [...new Set(data.data.map((d) => d.disease))]
//         setDiseases(uniqueDiseases)
//       }
//     } catch (err) {
//       console.error("Error fetching data:", err)
//       setSseError("Error fetching data.")
//       toast.error("Failed to fetch table data")
//     }
//     setIsLoading(false)
//   }

//   useEffect(() => {
//     if (weightsFromUrl) {
//       fetchPieChartData(weightsFromUrl)
//     } else {
//       fetchPieChartData()
//     }
//   }, [weightsFromUrl])

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
//       "Disease_Sources",
//       // "Disease_Title",
//       "Drug_Sources",
//     ]
//     const orderedTabs = columnOrder.filter((tab) => uniqueSelectedTabs.includes(tab))
//     setOrderedTabs(orderedTabs)

//     // Initialize visible columns to be all ordered tabs
//     if (visibleColumns.length === 0) {
//       setVisibleColumns(orderedTabs)
//     }

//     const requestedFields = orderedTabs.join(",")
//     fetchTableData(requestedFields, selectedDisease)
//   }, [selectedTabs, selectedDisease])

//   const handleWeightsUpdate = (weights, pieChartData) => {
//     if (pieChartData) {
//       setPieChartData(pieChartData)
//     }
//   }

//   const navigateToFullBenchmark = () => {
//     navigate("/benchmark-analysis" + (weightsFromUrl ? `?weights=${weightsFromUrl}` : ""))
//   }

//   const toggleColumnVisibility = (columnOrColumns) => {
//     if (Array.isArray(columnOrColumns)) {
//       // If an array is passed, directly set the visible columns
//       setVisibleColumns(columnOrColumns)
//     } else {
//       // Maintain backward compatibility for toggling a single column
//       const column = columnOrColumns
//       setVisibleColumns((prev) => (prev.includes(column) ? prev.filter((col) => col !== column) : [...prev, column]))
//     }
//   }

//   return (
//     <div className="p-6 bg-background min-h-screen">
//       <ToastContainer position="top-right" autoClose={5000} />

//       <div className="max-w-[1400px] mx-auto">
//         <header className="mb-6">
//           <h1 className="text-3xl font-bold text-foreground">Rifaximin Formulation Results</h1>
//           {/* <h1 className="text-3xl font-bold text-foreground">Drug Formulation Results</h1> */}
//           <p className="text-muted-foreground mt-1">Analysis and benchmarking of rifaximin formulations</p>
//           {/* <p className="text-muted-foreground mt-1">Analysis and benchmarking of drug formulations</p> */}
//         </header>

//         {/* Analytics Dashboard Section */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
//           <div className="h-[350px]">
//             <RadialChart data={pieChartData} />
//           </div>
//           <div className="h-[350px]">
//             {/* <BenchmarkTable onWeightsUpdate={handleWeightsUpdate} /> */}
//             <BenchmarkTableSummary
//               onWeightsUpdate={handleWeightsUpdate}
//               onViewFullBenchmark={navigateToFullBenchmark}
//               pieChartData={pieChartData}
//               weightsFromUrl={weightsFromUrl}
//             />
//           </div>
//         </div>

//         <DiseaseTable
//           tableData={tableData}
//           isLoading={isLoading}
//           sseError={sseError}
//           orderedTabs={orderedTabs}
//           selectedDisease={selectedDisease}
//           setSelectedDisease={setSelectedDisease}
//           diseases={diseases}
//           visibleColumns={visibleColumns}
//           toggleColumnVisibility={toggleColumnVisibility}
//         />
//       </div>
//     </div>
//   )
// } 


"use client"

import { useState, useEffect } from "react"
import { useLocation, useNavigate, useSearchParams } from "react-router-dom"
import { ToastContainer, toast } from "react-toastify"
import RadialChart from "./RadialChart"
import BenchmarkTableSummary from "./BenchmarkSummary"
import DiseaseTable from "./DiseaseTable"
import "react-toastify/dist/ReactToastify.css"
import "./custom.css" // Import your custom CSS file

export default function DrugFormulation() {
  const location = useLocation()
  const { selectedTabs = [] } = location.state || {}
  const navigate = useNavigate()
  const [pieChartData, setPieChartData] = useState(null)
  const [tableData, setTableData] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [sseError, setSseError] = useState(null)
  const [orderedTabs, setOrderedTabs] = useState([])
  const [selectedDisease, setSelectedDisease] = useState("all")
  const [diseases, setDiseases] = useState([])
  const [visibleColumns, setVisibleColumns] = useState([])
  const [searchParams] = useSearchParams()
  const weightsFromUrl = searchParams.get("weights")
  const [tableRefreshTrigger, setTableRefreshTrigger] = useState(0)

  // Fetch pie chart data
  const fetchPieChartData = async (weights = null) => {
    try {
      let response
      if (weights) {
        response = await fetch(`${import.meta.env.VITE_API_URL}/api/pie-chart`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ weights: JSON.parse(weights) }),
        })
      } else {
        response = await fetch(`${import.meta.env.VITE_API_URL}/api/pie-chart`, {
          headers: {
            "Content-Type": "application/json",
          },
        })
      }
      const data = await response.json()
      if (data.error) {
        toast.error(data.error)
      } else {
        setPieChartData(data.pie_chart_data)
      }
    } catch (error) {
      console.error("Error fetching pie chart:", error)
      toast.error("Failed to update pie chart")
    }
  }

  const fetchTableData = async (requestedFields, disease = "all") => {
    setIsLoading(true)
    try {
      const endpoint =
        `${import.meta.env.VITE_API_URL}/api/rnd-formulation-drug` +
        `?selected_tabs=${encodeURIComponent(requestedFields)}` +
        `&disease=${encodeURIComponent(disease)}`

      const resText = await fetch(endpoint).then((r) => r.text())

      /* ------------------------------------------------------------------
         Replace NaN / Infinity / -Infinity with null so JSON.parse works.
         You can add more patterns if the backend emits other JS literals.
      ------------------------------------------------------------------ */
      const safeText = resText.replace(/\b(NaN|Infinity|-Infinity)\b/g, "null")

      const data = JSON.parse(safeText)

      if (data.error) {
        setSseError(data.error)
        toast.error(data.error)
      } else {
        setTableData(data.data)
        const uniqueDiseases = [...new Set(data.data.map((d) => d.disease))]
        setDiseases(uniqueDiseases)
      }
    } catch (err) {
      console.error("Error fetching data:", err)
      setSseError("Error fetching data.")
      toast.error("Failed to fetch table data")
    }
    setIsLoading(false)
  }

  useEffect(() => {
    if (weightsFromUrl) {
      fetchPieChartData(weightsFromUrl)
    } else {
      fetchPieChartData()
    }
  }, [weightsFromUrl])

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
      "Disease_Sources",
      // "Disease_Title",
      "Drug_Sources",
    ]
    const orderedTabs = columnOrder.filter((tab) => uniqueSelectedTabs.includes(tab))
    setOrderedTabs(orderedTabs)

    // Initialize visible columns to be all ordered tabs
    if (visibleColumns.length === 0) {
      setVisibleColumns(orderedTabs)
    }

    const requestedFields = orderedTabs.join(",")
    fetchTableData(requestedFields, selectedDisease)
  }, [selectedTabs, selectedDisease])

  const handleWeightsUpdate = (weights, pieChartData) => {
    if (pieChartData) {
      setPieChartData(pieChartData)
    }

    // Force refresh of the BenchmarkSummaryTable by updating a state variable
    // This is a workaround if the component doesn't directly respond to prop changes
    setTableRefreshTrigger(Date.now())
  }

  const navigateToFullBenchmark = () => {
    navigate("/benchmark-analysis" + (weightsFromUrl ? `?weights=${weightsFromUrl}` : ""))
  }

  const toggleColumnVisibility = (columnOrColumns) => {
    if (Array.isArray(columnOrColumns)) {
      // If an array is passed, directly set the visible columns
      setVisibleColumns(columnOrColumns)
    } else {
      // Maintain backward compatibility for toggling a single column
      const column = columnOrColumns
      setVisibleColumns((prev) => (prev.includes(column) ? prev.filter((col) => col !== column) : [...prev, column]))
    }
  }

  return (
    <div className="p-6 bg-background min-h-screen">
      <ToastContainer position="top-right" autoClose={5000} />

      <div className="max-w-[1400px] mx-auto">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Rifaximin Formulation Results</h1>
          {/* <h1 className="text-3xl font-bold text-foreground">Drug Formulation Results</h1> */}
          <p className="text-muted-foreground mt-1">Analysis and benchmarking of rifaximin formulations</p>
          {/* <p className="text-muted-foreground mt-1">Analysis and benchmarking of drug formulations</p> */}
        </header>

        {/* Analytics Dashboard Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="h-[350px]">
            <RadialChart data={pieChartData} />
          </div>
          <div className="h-[350px]">
            {/* <BenchmarkTable onWeightsUpdate={handleWeightsUpdate} /> */}
            <BenchmarkTableSummary
              onWeightsUpdate={handleWeightsUpdate}
              onViewFullBenchmark={navigateToFullBenchmark}
              pieChartData={pieChartData}
              weightsFromUrl={weightsFromUrl}
              key={tableRefreshTrigger} // Force re-render when weights change
            />
          </div>
        </div>

        <DiseaseTable
          tableData={tableData}
          isLoading={isLoading}
          sseError={sseError}
          orderedTabs={orderedTabs}
          selectedDisease={selectedDisease}
          setSelectedDisease={setSelectedDisease}
          diseases={diseases}
          visibleColumns={visibleColumns}
          toggleColumnVisibility={toggleColumnVisibility}
        />
      </div>
    </div>
  )
}
