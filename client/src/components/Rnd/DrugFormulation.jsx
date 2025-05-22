// "use client"

// import { useState, useEffect } from "react"
// import { useNavigate, useSearchParams } from "react-router-dom"
// import { ToastContainer, toast } from "react-toastify"
// import { ChevronDown } from "lucide-react"
// import RadialChart from "./RadialChart"
// import BenchmarkTableSummary from "./BenchmarkSummary"
// import DiseaseTable from "./DiseaseTable"
// import "react-toastify/dist/ReactToastify.css"
// import "./custom.css" // Import your custom CSS file

// export default function DrugFormulation() {
//   // const location = useLocation()
//   // const { selectedTabs = [] } = location.state || {}
//   const navigate = useNavigate()
//   const [searchParams, setSearchParams] = useSearchParams()
//   const drugFromUrl = searchParams.get("drug_name") || "Rifaximin"
//   const weightsFromUrl = searchParams.get("weights")

//   const [selectedDrug, setSelectedDrug] = useState(drugFromUrl)
//   const [pieChartData, setPieChartData] = useState(null)
//   const [tableData, setTableData] = useState([])
//   const [isLoading, setIsLoading] = useState(false)
//   const [sseError, setSseError] = useState(null)
//   const [orderedTabs, setOrderedTabs] = useState([])
//   const [selectedDisease, setSelectedDisease] = useState("all")
//   const [diseases, setDiseases] = useState([])
//   const [visibleColumns, setVisibleColumns] = useState([])
//   const [tableRefreshTrigger, setTableRefreshTrigger] = useState(0)
//   const [drugDropdownOpen, setDrugDropdownOpen] = useState(false)

//   const availableDrugs = ["Rifaximin", "Vancomycin", "Metronidazole", "Fidaxomicin"]

//   // Update URL when drug changes
//   useEffect(() => {
//     if (selectedDrug !== drugFromUrl) {
//       const newParams = new URLSearchParams(searchParams)
//       newParams.set("drug_name", selectedDrug)
//       setSearchParams(newParams)
//     }
//   }, [selectedDrug])

//   // Fetch pie chart data
//   const fetchPieChartData = async (weights = null) => {
//     try {
//       let response
//       if (weights) {
//         response = await fetch(
//           `${import.meta.env.VITE_API_URL}/api/pie-chart?drug_name=${encodeURIComponent(selectedDrug.toLowerCase())}`,
//           {
//             method: "POST",
//             headers: {
//               "Content-Type": "application/json",
//             },
//             body: JSON.stringify({
//               weights: JSON.parse(weights),
//             }),
//           },
//         )
//       } else {
//         response = await fetch(
//           `${import.meta.env.VITE_API_URL}/api/pie-chart?drug_name=${encodeURIComponent(selectedDrug)}`,
//           {
//             headers: {
//               "Content-Type": "application/json",
//             },
//           },
//         )
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

//   async function fetchTableData(requestedFields, disease = "all") {
//     setIsLoading(true)
//     try {
//       // If requestedFields is empty, use all orderedTabs
//       const fieldsToRequest = requestedFields || orderedTabs.join(",")

//       const endpoint =
//         `${import.meta.env.VITE_API_URL}/api/rnd-formulation-drug` +
//         `?selected_tabs=${encodeURIComponent(fieldsToRequest)}` +
//         `&disease=${encodeURIComponent(disease)}` +
//         `&drug_name=${encodeURIComponent(selectedDrug.toLowerCase())}`

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
//   }, [weightsFromUrl, selectedDrug])

//   useEffect(() => {
//     const columnOrder = [
//       "Disease",
//       "Disease_Microbes",
//       "Disease_Mechanism",
//       "Drug_Microbes",
//       "Drug_Mechanism",
//       "Justification_for_Drug_Use",
//       "Disease_Sources",
//       "Drug_Sources",
//     ]
//     setOrderedTabs(columnOrder)

//     // Initialize visible columns to be all ordered tabs
//     if (visibleColumns.length === 0) {
//       setVisibleColumns(columnOrder)
//     }

//     // Always use all columns if none are explicitly selected
//     const requestedFields = columnOrder.join(",")
//     fetchTableData(requestedFields, selectedDisease)
//   }, [selectedDisease, selectedDrug])

//   const handleWeightsUpdate = (weights, pieChartData) => {
//     if (pieChartData) {
//       setPieChartData(pieChartData)
//     }

//     // Force refresh of the BenchmarkSummaryTable by updating a state variable
//     // This is a workaround if the component doesn't directly respond to prop changes
//     setTableRefreshTrigger(Date.now())
//   }

//   const navigateToFullBenchmark = () => {
//     navigate(
//       `/benchmark-analysis?drug_name=${encodeURIComponent(selectedDrug)}${weightsFromUrl ? `&weights=${weightsFromUrl}` : ""}`,
//     )
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

//   const handleDrugChange = (drug) => {
//     setSelectedDrug(drug)
//     setDrugDropdownOpen(false)

//     // Fetch table data with the new drug selection
//     const requestedFields = orderedTabs.join(",")
//     fetchTableData(requestedFields, selectedDisease)
//   }

//   return (
//     <div className="p-6 bg-background min-h-screen">
//       <ToastContainer position="top-right" autoClose={5000} />

//       <div className="max-w-[1400px] mx-auto">
//         <header className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
//           <div>
//             <h1 className="text-3xl font-bold text-foreground">{selectedDrug} Formulation Results</h1>
//             <p className="text-muted-foreground mt-1">
//               Analysis and benchmarking of {selectedDrug.toLowerCase()} formulations
//             </p>
//           </div>

//           <div className="mt-4 md:mt-0 relative">
//             <button
//               onClick={() => setDrugDropdownOpen(!drugDropdownOpen)}
//               className="flex items-center gap-2 px-4 py-2 bg-[#6b8e23] text-white rounded-[20px] hover:bg-[#5a7a1e]"
//             >
//               Change Drug
//               <ChevronDown className="h-4 w-4" />
//             </button>

//             {drugDropdownOpen && (
//               <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
//                 <div className="py-1" role="menu" aria-orientation="vertical">
//                   {availableDrugs.map((drug) => (
//                     <button
//                       key={drug}
//                       onClick={() => handleDrugChange(drug)}
//                       className={`block w-full text-left px-4 py-2 text-sm ${
//                         selectedDrug === drug
//                           ? "bg-[#f1f8e9] text-[#6b8e23] font-medium"
//                           : "text-gray-700 hover:bg-gray-100"
//                       }`}
//                       role="menuitem"
//                     >
//                       {drug}
//                     </button>
//                   ))}
//                 </div>
//               </div>
//             )}
//           </div>
//         </header>

//         {/* Analytics Dashboard Section */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
//           <div className="h-[350px]">
//             <RadialChart data={pieChartData} />
//           </div>
//           <div className="h-[350px]">
//             <BenchmarkTableSummary
//               onWeightsUpdate={handleWeightsUpdate}
//               onViewFullBenchmark={navigateToFullBenchmark}
//               pieChartData={pieChartData}
//               weightsFromUrl={weightsFromUrl}
//               key={tableRefreshTrigger} // Force re-render when weights change
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



// "use client"

import { useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { ToastContainer, toast } from "react-toastify"
import { ChevronDown } from "lucide-react"
import RadialChart from "./RadialChart"
import BenchmarkTableSummary from "./BenchmarkSummary"
import DiseaseTable from "./DiseaseTable"
import "react-toastify/dist/ReactToastify.css"
import "./custom.css" // Import your custom CSS file
import { Loader2 } from "lucide-react"

export default function DrugFormulation() {
  // const location = useLocation()
  // const { selectedTabs = [] } = location.state || {}
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const drugFromUrl = searchParams.get("drug_name") || "Rifaximin"
  const weightsFromUrl = searchParams.get("weights")

  const [selectedDrug, setSelectedDrug] = useState(drugFromUrl)
  const [pieChartData, setPieChartData] = useState(null)
  const [tableData, setTableData] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [sseError, setSseError] = useState(null)
  const [orderedTabs, setOrderedTabs] = useState([])
  const [selectedDisease, setSelectedDisease] = useState("all")
  const [diseases, setDiseases] = useState([])
  const [visibleColumns, setVisibleColumns] = useState([])
  const [tableRefreshTrigger, setTableRefreshTrigger] = useState(0)
  const [drugDropdownOpen, setDrugDropdownOpen] = useState(false)

  const availableDrugs = ["Rifaximin", "Vancomycin", "Metronidazole", "Fidaxomicin"]

  // Update URL when drug changes
  useEffect(() => {
    if (selectedDrug !== drugFromUrl) {
      const newParams = new URLSearchParams(searchParams)
      newParams.set("drug_name", selectedDrug)
      setSearchParams(newParams)
    }
  }, [selectedDrug])

  // Fetch pie chart data
  const fetchPieChartData = async (weights = null) => {
    try {
      let response
      if (weights) {
        response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/pie-chart?drug_name=${encodeURIComponent(selectedDrug.toLowerCase())}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              weights: JSON.parse(weights),
            }),
          },
        )
      } else {
        response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/pie-chart?drug_name=${encodeURIComponent(selectedDrug)}`,
          {
            headers: {
              "Content-Type": "application/json",
            },
          },
        )
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

  async function fetchTableData(requestedFields, disease = "all") {
    setIsLoading(true)
    try {
      // If requestedFields is empty, use all orderedTabs
      const fieldsToRequest = requestedFields || orderedTabs.join(",")

      const endpoint =
        `${import.meta.env.VITE_API_URL}/api/rnd-formulation-drug` +
        `?selected_tabs=${encodeURIComponent(fieldsToRequest)}` +
        `&disease=${encodeURIComponent(disease)}` +
        `&drug_name=${encodeURIComponent(selectedDrug.toLowerCase())}`

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
  }, [weightsFromUrl, selectedDrug])

  useEffect(() => {
    const columnOrder = [
      "Disease",
      "Disease_Microbes",
      "Disease_Mechanism",
      "Drug_Microbes",
      "Drug_Mechanism",
      "Justification_for_Drug_Use",
      "Disease_Sources",
      "Drug_Sources",
    ]
    setOrderedTabs(columnOrder)

    // Initialize visible columns to be all ordered tabs
    if (visibleColumns.length === 0) {
      setVisibleColumns(columnOrder)
    }

    // Always use all columns if none are explicitly selected
    const requestedFields = columnOrder.join(",")
    fetchTableData(requestedFields, selectedDisease)
  }, [selectedDisease, selectedDrug])

  const handleWeightsUpdate = (weights, pieChartData) => {
    if (pieChartData) {
      setPieChartData(pieChartData)
    }

    // Force refresh of the BenchmarkSummaryTable by updating a state variable
    // This is a workaround if the component doesn't directly respond to prop changes
    setTableRefreshTrigger(Date.now())
  }

  const navigateToFullBenchmark = () => {
    navigate(
      `/benchmark-analysis?drug_name=${encodeURIComponent(selectedDrug)}${weightsFromUrl ? `&weights=${weightsFromUrl}` : ""}`,
    )
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

  const handleDrugChange = (drug) => {
    // Immediately clear old data to prevent showing stale data
    setPieChartData(null)
    setTableData([])

    // Set loading state
    setIsLoading(true)

    // Update the selected drug
    setSelectedDrug(drug)
    setDrugDropdownOpen(false)

    // Create a promise for each data fetch operation
    const fetchPromises = []

    // Fetch pie chart data
    const pieChartPromise = (async () => {
      try {
        let response
        if (weightsFromUrl) {
          response = await fetch(
            `${import.meta.env.VITE_API_URL}/api/pie-chart?drug_name=${encodeURIComponent(drug.toLowerCase())}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                weights: JSON.parse(weightsFromUrl),
              }),
            },
          )
        } else {
          response = await fetch(
            `${import.meta.env.VITE_API_URL}/api/pie-chart?drug_name=${encodeURIComponent(drug)}`,
            {
              headers: {
                "Content-Type": "application/json",
              },
            },
          )
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
    })()
    fetchPromises.push(pieChartPromise)

    // Fetch table data
    const tableDataPromise = (async () => {
      try {
        const requestedFields = orderedTabs.join(",")
        const endpoint =
          `${import.meta.env.VITE_API_URL}/api/rnd-formulation-drug` +
          `?selected_tabs=${encodeURIComponent(requestedFields)}` +
          `&disease=${encodeURIComponent(selectedDisease)}` +
          `&drug_name=${encodeURIComponent(drug.toLowerCase())}`

        const resText = await fetch(endpoint).then((r) => r.text())
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
    })()
    fetchPromises.push(tableDataPromise)

    // Only turn off loading when ALL data is loaded
    Promise.all(fetchPromises).finally(() => {
      // Add a small delay to ensure UI updates properly
      setTimeout(() => {
        setIsLoading(false)
      }, 300)
    })
  }

  return (
    <div className="p-6 bg-background min-h-screen">
      <ToastContainer position="top-right" autoClose={5000} />

      <div className="max-w-[1400px] mx-auto">
        <header className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{selectedDrug} Formulation Results</h1>
            <p className="text-muted-foreground mt-1">
              Analysis and benchmarking of {selectedDrug.toLowerCase()} formulations
            </p>
          </div>

          <div className="mt-4 md:mt-0 relative">
            <button
              onClick={() => setDrugDropdownOpen(!drugDropdownOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-[#6b8e23] text-white rounded-[20px] hover:bg-[#5a7a1e]"
            >
              Change Drug
              <ChevronDown className="h-4 w-4" />
            </button>

            {drugDropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10"
                style={{ transform: "translateZ(0)" }} // Force hardware acceleration
              >
                <div className="py-1" role="menu" aria-orientation="vertical">
                  {availableDrugs.map((drug) => (
                    <button
                      key={drug}
                      onClick={() => handleDrugChange(drug)}
                      className={`block w-full text-left px-4 py-2 text-sm ${
                        selectedDrug === drug
                          ? "bg-[#f1f8e9] text-[#6b8e23] font-medium"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                      role="menuitem"
                    >
                      {drug}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Analytics Dashboard Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 relative">
          {isLoading && (
            <div className="absolute inset-0 bg-white/90 z-10 flex items-center justify-center backdrop-blur-sm">
              <div className="flex flex-col items-center gap-2 p-6 rounded-lg bg-white shadow-md border border-[#e0e7c5]">
                <Loader2 className="animate-spin h-10 w-10 text-[#6b8e23]" />
                <p className="text-base font-medium text-[#6b8e23]">Loading {selectedDrug} data...</p>
              </div>
            </div>
          )}
          <div className="h-[350px]">
            <RadialChart data={pieChartData} />
          </div>
          <div className="h-[350px]">
            <BenchmarkTableSummary
              onWeightsUpdate={handleWeightsUpdate}
              onViewFullBenchmark={navigateToFullBenchmark}
              pieChartData={pieChartData}
              weightsFromUrl={weightsFromUrl}
              key={tableRefreshTrigger} // Force re-render when weights change
              isLoading={isLoading}
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
