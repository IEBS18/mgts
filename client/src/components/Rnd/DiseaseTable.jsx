// "use client"
// import React, { useState } from "react"
// import { Loader2, ChevronDown, Download } from "lucide-react"
// import ReactSelect from "react-select"
// import * as XLSX from "xlsx"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import TruncatedMarkdown from "./TruncatedMarkdown"
// import { Button } from "@/components/ui/button"
// import { Checkbox } from "@/components/ui/checkbox"
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

// const capitalizeName = (name) => {
//   if (typeof name !== "string") {
//     return name // or return an empty string, or some other fallback behavior
//   }

//   return name
//     .split(" ")
//     .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
//     .join(" ")
// }

// /* ------------------------------------------------------------------ */
// /*  Dropdown                                                          */
// /* ------------------------------------------------------------------ */
// const DiseaseFilterDropdown = ({ diseases, selectedDisease, setSelectedDisease }) => {
//   const diseaseOptions = [
//     { value: "all", label: "All Diseases" },
//     ...diseases.sort((a, b) => a.localeCompare(b)).map((d) => ({ value: d, label: capitalizeName(d) })),
//   ]

//   return (
//     <ReactSelect
//       value={diseaseOptions.find((o) => o.value === selectedDisease)}
//       onChange={(o) => setSelectedDisease(o.value)}
//       options={diseaseOptions}
//       className="w-[280px] md:w-[480px] rounded-[12px] border-[#a6ce39] focus:ring-[#a6ce39] z-12"
//       placeholder="Select disease"
//       isSearchable
//       styles={{
//         menu: (p) => ({ ...p, zIndex: 20 }),
//         control: (p, s) => ({
//           ...p,
//           borderColor: "#a6ce39",
//           backgroundColor: "transparent",
//           borderRadius: "16px",
//           "&:hover": { borderColor: "#a6ce39" },
//           boxShadow: s.isFocused ? "0 0 0 3px rgba(166,206,57,.2)" : "none",
//         }),
//         option: (p, s) => ({
//           ...p,
//           backgroundColor: s.isSelected ? "#a6ce39" : s.isFocused ? "#f1f8e9" : "transparent",
//           color: s.isSelected ? "#fff" : "#000",
//           "&:hover": { backgroundColor: "#a6ce39", color: "#fff" },
//         }),
//       }}
//     />
//   )
// }

// /* ------------------------------------------------------------------ */
// /*  Column Visibility Dialog                                          */
// /* ------------------------------------------------------------------ */
// const ColumnVisibilityDialog = ({ orderedTabs, visibleColumns, toggleColumnVisibility, isOpen, onClose }) => {
//   const [tempVisibleColumns, setTempVisibleColumns] = useState([...visibleColumns])

//   // Reset temp state when dialog opens
//   React.useEffect(() => {
//     if (isOpen) {
//       setTempVisibleColumns([...visibleColumns])
//     }
//   }, [isOpen, visibleColumns])

//   const handleToggle = (column) => {
//     if (tempVisibleColumns.includes(column)) {
//       // Don't allow removing the last column
//       if (tempVisibleColumns.length > 1) {
//         setTempVisibleColumns(tempVisibleColumns.filter((col) => col !== column))
//       }
//     } else {
//       setTempVisibleColumns([...tempVisibleColumns, column])
//     }
//   }

//   const handleSelectAll = () => {
//     setTempVisibleColumns([...orderedTabs])
//   }

//   const handleDeselectAll = () => {
//     // Keep at least one column selected
//     setTempVisibleColumns([orderedTabs[0]])
//   }

//   const handleApply = () => {
//     // Instead of toggling columns one by one, directly set the visible columns
//     // to match the temporary state
//     toggleColumnVisibility(tempVisibleColumns)
//     onClose()
//   }

//   return (
//     <Dialog open={isOpen} onOpenChange={onClose}>
//       <DialogContent className="sm:max-w-md">
//         <DialogHeader>
//           <DialogTitle>Column Visibility</DialogTitle>
//         </DialogHeader>
//         <div className="flex justify-between mb-4">
//           <Button variant="outline" size="sm" className="rounded-[12px]" onClick={handleSelectAll}>
//             Select All
//           </Button>
//           <Button variant="outline" size="sm" className="rounded-[12px]" onClick={handleDeselectAll}>
//             Deselect All
//           </Button>
//         </div>
//         <div className="grid grid-cols-1 gap-4 py-4">
//           {orderedTabs.map((column) => (
//             <div key={column} className="flex items-center space-x-2">
//               <Checkbox
//                 id={`column-${column}`}
//                 checked={tempVisibleColumns.includes(column)}
//                 onCheckedChange={() => handleToggle(column)}
//                 disabled={tempVisibleColumns.length === 1 && tempVisibleColumns.includes(column)}
//               />
//               <label
//                 htmlFor={`column-${column}`}
//                 className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
//               >
//                 {column.replace(/_/g, " ")}
//               </label>
//             </div>
//           ))}
//         </div>
//         <DialogFooter>
//           <Button variant="outline" className="rounded-[12px]" onClick={onClose}>
//             Cancel
//           </Button>
//           <Button className="rounded-[12px]" onClick={handleApply}>
//             Apply
//           </Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   )
// }

// /* ------------------------------------------------------------------ */
// /*  Column Visibility Dropdown                                        */
// /* ------------------------------------------------------------------ */
// const ColumnVisibilityDropdown = ({ orderedTabs, visibleColumns, toggleColumnVisibility }) => {
//   const [dialogOpen, setDialogOpen] = useState(false)

//   return (
//     <>
//       <Button
//         variant="outline"
//         className="ml-2 border-[#a6ce39] text-[#6b8e23] rounded-[12px] focus:outline-none"
//         onClick={() => setDialogOpen(true)}
//       >
//         Columns <ChevronDown className="ml-2 h-4 w-4" />
//       </Button>

//       <ColumnVisibilityDialog
//         orderedTabs={orderedTabs}
//         visibleColumns={visibleColumns}
//         toggleColumnVisibility={toggleColumnVisibility}
//         isOpen={dialogOpen}
//         onClose={() => setDialogOpen(false)}
//       />
//     </>
//   )
// }

// /* ------------------------------------------------------------------ */
// /*  Export Data Function                                              */
// /* ------------------------------------------------------------------ */
// const ExportButton = ({ tableData, visibleColumns, selectedDisease }) => {
//   const handleExport = () => {
//     // Filter data based on selected disease
//     const filtered = selectedDisease === "all" ? tableData : tableData.filter((r) => r.disease === selectedDisease)

//     if (filtered.length === 0) {
//       alert("No data available to export")
//       return
//     }

//     // Create worksheet data with only visible columns
//     const wsData = [
//       // Header row
//       visibleColumns.map((col) => col.replace(/_/g, " ")),
//     ]

//     // Add data rows
//     filtered.forEach((record) => {
//       const row = visibleColumns.map((column) => {
//         const key = column.toLowerCase()
//         let content = record[key]

//         // Handle different content types
//         if (!content) return ""

//         // Convert to string and handle special characters
//         if (typeof content !== "string") {
//           content = String(content)
//         }

//         // Remove HTML tags and markdown formatting
//         content = content.replace(/<[^>]*>/g, "")

//         return content
//       })
//       wsData.push(row)
//     })

//     // Create workbook and worksheet
//     const wb = XLSX.utils.book_new()
//     const ws = XLSX.utils.aoa_to_sheet(wsData)

//     // Create filename based on selected disease
//     const filename =
//       selectedDisease === "all"
//         ? "all-diseases-data.xlsx"
//         : `${selectedDisease.toLowerCase().replace(/\s+/g, "-")}-data.xlsx`

//     // Add worksheet to workbook
//     XLSX.utils.book_append_sheet(wb, ws, "Disease Data")

//     // Generate and download the file
//     XLSX.writeFile(wb, filename)
//   }

//   return (
//     <Button
//       variant="outline"
//       className="ml-2 border-[#a6ce39] text-[#6b8e23] rounded-[12px] focus:outline-none"
//       onClick={handleExport}
//     >
//       Export <Download className="ml-2 h-4 w-4" />
//     </Button>
//   )
// }

// /* ------------------------------------------------------------------ */
// /*  Cell renderer                                                      */
// /* ------------------------------------------------------------------ */
// const renderCellContent = (record, topic) => {
//   const key = topic.toLowerCase()
//   const content = record[key]
//   if (!content) return null

//   // Handle comma‑separated list of URLs (PMC links or otherwise)
//   if (typeof content === "string" && content.includes("http")) {
//     const urls = content
//       .split(",")
//       .map((u) => u.trim())
//       .filter(Boolean)
//     return urls.map((url, idx) => {
//       const match = url.match(/PMC\d+/i) // extract PMC ID if present
//       const label = match ? match[0] : url.replace(/^https?:\/\//, "")
//       return (
//         <React.Fragment key={idx}>
//           <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
//             {label}
//           </a>
//           {idx < urls.length - 1 && ", "}
//         </React.Fragment>
//       )
//     })
//   }

//   // Multi‑line markdown → truncated preview
//   if (typeof content === "string" && (content.includes("\n") || content.includes("<mark>"))) {
//     return <TruncatedMarkdown content={content} />
//   }

//   return content
// }

// /* ------------------------------------------------------------------ */
// /*  Main table component                                               */
// /* ------------------------------------------------------------------ */
// export default function DiseaseTable({
//   tableData,
//   isLoading,
//   sseError,
//   orderedTabs,
//   visibleColumns,
//   toggleColumnVisibility,
//   selectedDisease,
//   setSelectedDisease,
//   diseases,
// }) {
//   const filtered = selectedDisease === "all" ? tableData : tableData.filter((r) => r.disease === selectedDisease)

//   return (
//     <Card className="mb-8 shadow-md">
//       <CardHeader className="pb-3 bg-[#f9faf5]">
//         <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
//           <CardTitle>Disease Data</CardTitle>
//           <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
//             <DiseaseFilterDropdown
//               diseases={diseases}
//               selectedDisease={selectedDisease}
//               setSelectedDisease={setSelectedDisease}
//             />
//             <ColumnVisibilityDropdown
//               orderedTabs={orderedTabs}
//               visibleColumns={visibleColumns}
//               toggleColumnVisibility={toggleColumnVisibility}
//             />
//             <ExportButton tableData={tableData} visibleColumns={visibleColumns} selectedDisease={selectedDisease} />
//           </div>
//         </div>

//         <div className="flex items-center gap-4 mt-2">
//           {sseError && <p className="text-destructive text-sm">{sseError}</p>}
//           {isLoading && (
//             <div className="flex items-center gap-2 text-muted-foreground text-sm">
//               <Loader2 className="animate-spin h-4 w-4" />
//               <span>Loading data...</span>
//             </div>
//           )}
//         </div>
//       </CardHeader>

//       <CardContent className="p-0">
//         <div className="border-t">
//           <div className="h-[500px] overflow-x-auto">
//             <table className="w-full min-w-max border-collapse">
//               <thead>
//                 <tr className="bg-[#f5f8e8] sticky top-0 z-10">
//                   {/* Use orderedTabs to maintain column order, but filter by visibleColumns */}
//                   {orderedTabs
//                     .filter((tab) => visibleColumns.includes(tab))
//                     .map((t) => (
//                       <th
//                         key={t}
//                         className="p-3 text-left text-xs font-medium uppercase tracking-wider whitespace-nowrap text-gray-700"
//                         style={{ minWidth: "200px" }}
//                       >
//                         {t.replace(/_/g, " ")}
//                       </th>
//                     ))}
//                 </tr>
//               </thead>
//               <tbody>
//                 {filtered.length ? (
//                   filtered.map((rec, rIdx) => (
//                     <tr key={rIdx} className="border-b border-border hover:bg-[#f9faf5] transition-colors">
//                       {/* Use orderedTabs to maintain column order, but filter by visibleColumns */}
//                       {orderedTabs
//                         .filter((tab) => visibleColumns.includes(tab))
//                         .map((topic) => (
//                           <td
//                             key={topic}
//                             className={`p-4 align-top text-sm ${topic === "Drug_Sources" ? "w-[600px] max-w-[600px] break-words" : "w-[400px] max-w-[400px]"
//                               }`}
//                           >
//                             {topic === "Disease"
//                               ? capitalizeName(renderCellContent(rec, topic))
//                               : renderCellContent(rec, topic)}
//                           </td>


//                         ))}
//                     </tr>
//                   ))
//                 ) : (
//                   <tr>
//                     <td colSpan={visibleColumns.length} className="p-6 text-center text-muted-foreground">
//                       {isLoading ? "Loading data..." : "No data available for the selected filters."}
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   )
// }

"use client"
import React, { useState, useEffect } from "react"
import { Loader2, ChevronDown, Download } from "lucide-react"
import ReactSelect from "react-select"
import * as XLSX from "xlsx"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import TruncatedMarkdown from "./TruncatedMarkdown"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

const capitalizeName = (name) => {
  if (typeof name !== "string") {
    return name // or return an empty string, or some other fallback behavior
  }

  return name
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ")
}

/* ------------------------------------------------------------------ */
/*  Dropdown                                                          */
/* ------------------------------------------------------------------ */
const DiseaseFilterDropdown = ({ diseases, selectedDisease, setSelectedDisease }) => {
  const diseaseOptions = [
    { value: "all", label: "All Diseases" },
    ...diseases.sort((a, b) => a.localeCompare(b)).map((d) => ({ value: d, label: capitalizeName(d) })),
  ]

  return (
    <ReactSelect
      value={diseaseOptions.find((o) => o.value === selectedDisease)}
      onChange={(o) => setSelectedDisease(o.value)}
      options={diseaseOptions}
      className="w-[280px] md:w-[480px] rounded-[12px] border-[#a6ce39] focus:ring-[#a6ce39] z-12"
      placeholder="Select disease"
      isSearchable
      styles={{
        menu: (p) => ({ ...p, zIndex: 20 }),
        control: (p, s) => ({
          ...p,
          borderColor: "#a6ce39",
          backgroundColor: "transparent",
          borderRadius: "16px",
          "&:hover": { borderColor: "#a6ce39" },
          boxShadow: s.isFocused ? "0 0 0 3px rgba(166,206,57,.2)" : "none",
        }),
        option: (p, s) => ({
          ...p,
          backgroundColor: s.isSelected ? "#a6ce39" : s.isFocused ? "#f1f8e9" : "transparent",
          color: s.isSelected ? "#fff" : "#000",
          "&:hover": { backgroundColor: "#a6ce39", color: "#fff" },
        }),
      }}
    />
  )
}

/* ------------------------------------------------------------------ */
/*  Column Visibility Dialog                                          */
/* ------------------------------------------------------------------ */
const ColumnVisibilityDialog = ({ orderedTabs, visibleColumns, toggleColumnVisibility, isOpen, onClose }) => {
  const [tempVisibleColumns, setTempVisibleColumns] = useState([...visibleColumns])

  // Reset temp state when dialog opens
  React.useEffect(() => {
    if (isOpen) {
      setTempVisibleColumns([...visibleColumns])
    }
  }, [isOpen, visibleColumns])

  const handleToggle = (column) => {
    if (tempVisibleColumns.includes(column)) {
      // Don't allow removing the last column
      if (tempVisibleColumns.length > 1) {
        setTempVisibleColumns(tempVisibleColumns.filter((col) => col !== column))
      }
    } else {
      setTempVisibleColumns([...tempVisibleColumns, column])
    }
  }

  const handleSelectAll = () => {
    setTempVisibleColumns([...orderedTabs])
  }

  const handleDeselectAll = () => {
    // Keep at least one column selected
    setTempVisibleColumns([orderedTabs[0]])
  }

  const handleApply = () => {
    // Instead of toggling columns one by one, directly set the visible columns
    // to match the temporary state
    toggleColumnVisibility(tempVisibleColumns)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Column Visibility</DialogTitle>
        </DialogHeader>
        <div className="flex justify-between mb-4">
          <Button variant="outline" size="sm" className="rounded-[12px]" onClick={handleSelectAll}>
            Select All
          </Button>
          <Button variant="outline" size="sm" className="rounded-[12px]" onClick={handleDeselectAll}>
            Deselect All
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-4 py-4">
          {orderedTabs.map((column) => (
            <div key={column} className="flex items-center space-x-2">
              <Checkbox
                id={`column-${column}`}
                checked={tempVisibleColumns.includes(column)}
                onCheckedChange={() => handleToggle(column)}
                disabled={tempVisibleColumns.length === 1 && tempVisibleColumns.includes(column)}
              />
              <label
                htmlFor={`column-${column}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {column.replace(/_/g, " ")}
              </label>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" className="rounded-[12px]" onClick={onClose}>
            Cancel
          </Button>
          <Button className="rounded-[12px]" onClick={handleApply}>
            Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/* ------------------------------------------------------------------ */
/*  Column Visibility Dropdown                                        */
/* ------------------------------------------------------------------ */
const ColumnVisibilityDropdown = ({ orderedTabs, visibleColumns, toggleColumnVisibility }) => {
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <>
      <Button
        variant="outline"
        className="ml-2 border-[#a6ce39] text-[#6b8e23] rounded-[12px] focus:outline-none"
        onClick={() => setDialogOpen(true)}
      >
        Columns <ChevronDown className="ml-2 h-4 w-4" />
      </Button>

      <ColumnVisibilityDialog
        orderedTabs={orderedTabs}
        visibleColumns={visibleColumns}
        toggleColumnVisibility={toggleColumnVisibility}
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
      />
    </>
  )
}

/* ------------------------------------------------------------------ */
/*  Export Data Function                                              */
/* ------------------------------------------------------------------ */
const ExportButton = ({ tableData, visibleColumns, selectedDisease }) => {
  const handleExport = () => {
    // Filter data based on selected disease
    const filtered = selectedDisease === "all" ? tableData : tableData.filter((r) => r.disease === selectedDisease)

    if (filtered.length === 0) {
      alert("No data available to export")
      return
    }

    // Create worksheet data with only visible columns
    const wsData = [
      // Header row
      visibleColumns.map((col) => col.replace(/_/g, " ")),
    ]

    // Add data rows
    filtered.forEach((record) => {
      const row = visibleColumns.map((column) => {
        const key = column.toLowerCase()
        let content = record[key]

        // Handle different content types
        if (!content) return ""

        // Convert to string and handle special characters
        if (typeof content !== "string") {
          content = String(content)
        }

        // Remove HTML tags and markdown formatting
        content = content.replace(/<[^>]*>/g, "")

        return content
      })
      wsData.push(row)
    })

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.aoa_to_sheet(wsData)

    // Create filename based on selected disease
    const filename =
      selectedDisease === "all"
        ? "all-diseases-data.xlsx"
        : `${selectedDisease.toLowerCase().replace(/\s+/g, "-")}-data.xlsx`

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, "Disease Data")

    // Generate and download the file
    XLSX.writeFile(wb, filename)
  }

  return (
    <Button
      variant="outline"
      className="ml-2 border-[#a6ce39] text-[#6b8e23] rounded-[12px] focus:outline-none"
      onClick={handleExport}
    >
      Export <Download className="ml-2 h-4 w-4" />
    </Button>
  )
}

/* ------------------------------------------------------------------ */
/*  Cell renderer                                                      */
/* ------------------------------------------------------------------ */
const renderCellContent = (record, topic) => {
  const key = topic.toLowerCase()
  const content = record[key]
  if (!content) return null

  // Handle comma‑separated list of URLs (PMC links or otherwise)
  if (typeof content === "string" && content.includes("http")) {
    const urls = content
      .split(",")
      .map((u) => u.trim())
      .filter(Boolean)
    return urls.map((url, idx) => {
      const match = url.match(/PMC\d+/i) // extract PMC ID if present
      const label = match ? match[0] : url.replace(/^https?:\/\//, "")
      return (
        <React.Fragment key={idx}>
          <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
            {label}
          </a>
          {idx < urls.length - 1 && ", "}
        </React.Fragment>
      )
    })
  }

  // Multi‑line markdown → truncated preview
  if (typeof content === "string" && (content.includes("\n") || content.includes("<mark>"))) {
    return <TruncatedMarkdown content={content} />
  }

  return content
}

/* ------------------------------------------------------------------ */
/*  Main table component                                               */
/* ------------------------------------------------------------------ */
export default function DiseaseTable({
  tableData,
  isLoading,
  sseError,
  orderedTabs,
  visibleColumns: initialVisibleColumns,
  toggleColumnVisibility: initialToggleColumnVisibility,
  selectedDisease,
  setSelectedDisease,
  diseases,
}) {
  const [visibleColumns, setVisibleColumns] = useState(orderedTabs)
  const toggleColumnVisibility = (column) => {
    if (typeof column === "string") {
      setVisibleColumns((prev) => (prev.includes(column) ? prev.filter((c) => c !== column) : [...prev, column]))
    } else {
      setVisibleColumns(column)
    }
  }

  useEffect(() => {
    // Update visible columns when orderedTabs changes
    if (orderedTabs.length > 0) {
      setVisibleColumns(orderedTabs)
    }
  }, [orderedTabs])

  const filtered = selectedDisease === "all" ? tableData : tableData.filter((r) => r.disease === selectedDisease)

  return (
    <Card className="mb-8 shadow-md">
      <CardHeader className="pb-3 bg-[#f9faf5]">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <CardTitle>Disease Data</CardTitle>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
            <DiseaseFilterDropdown
              diseases={diseases}
              selectedDisease={selectedDisease}
              setSelectedDisease={setSelectedDisease}
            />
            <ColumnVisibilityDropdown
              orderedTabs={orderedTabs}
              visibleColumns={visibleColumns}
              toggleColumnVisibility={toggleColumnVisibility}
            />
            <ExportButton tableData={tableData} visibleColumns={visibleColumns} selectedDisease={selectedDisease} />
          </div>
        </div>

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
                  {/* Use orderedTabs to maintain column order, but filter by visibleColumns */}
                  {orderedTabs
                    .filter((tab) => visibleColumns.includes(tab))
                    .map((t) => (
                      <th
                        key={t}
                        className="p-3 text-left text-xs font-medium uppercase tracking-wider whitespace-nowrap text-gray-700"
                        style={{ minWidth: "200px" }}
                      >
                        {t.replace(/_/g, " ")}
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length ? (
                  filtered.map((rec, rIdx) => (
                    <tr key={rIdx} className="border-b border-border hover:bg-[#f9faf5] transition-colors">
                      {/* Use orderedTabs to maintain column order, but filter by visibleColumns */}
                      {orderedTabs
                        .filter((tab) => visibleColumns.includes(tab))
                        .map((topic) => (
                          <td
                            key={topic}
                            className={`p-4 align-top text-sm ${
                              topic === "Drug_Sources"
                                ? "w-[600px] max-w-[600px] break-words"
                                : "w-[400px] max-w-[400px]"
                            }`}
                          >
                            {topic === "Disease"
                              ? capitalizeName(renderCellContent(rec, topic))
                              : renderCellContent(rec, topic)}
                          </td>
                        ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={visibleColumns.length} className="p-6 text-center text-muted-foreground">
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
  )
}
