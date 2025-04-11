"use client"
import { Loader2 } from "lucide-react"
import ReactSelect from "react-select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TruncatedMarkdown } from "./TruncatedMarkdown"

function capitalizeName(name) {
  return name
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ")
}

// DiseaseFilterDropdown component
const DiseaseFilterDropdown = ({ diseases, selectedDisease, setSelectedDisease }) => {
  const diseaseOptions = [
    { value: "all", label: "All Diseases" },
    ...diseases
      .sort((a, b) => a.localeCompare(b)) // Sort diseases alphabetically
      .map((disease) => ({ value: disease, label: capitalizeName(disease) })),
  ]

  const handleChange = (selectedOption) => {
    setSelectedDisease(selectedOption.value)
  }

  return (
    <ReactSelect
      value={diseaseOptions.find((option) => option.value === selectedDisease)} // Set the selected disease
      onChange={handleChange}
      options={diseaseOptions}
      className="w-[480px] rounded-[12px] border-[#a6ce39] focus:ring-[#a6ce39] z-12" // Maintain old green border and z-index fix
      placeholder="Select disease"
      isSearchable={true} // Make it searchable
      styles={{
        menu: (provided) => ({
          ...provided,
          zIndex: 20, // Fix the dropdown behind the header issue
        }),
        control: (provided, state) => ({
          ...provided,
          borderColor: "#a6ce39", // Green border for the input
          backgroundColor: "transparent", // Make the background transparent
          borderRadius: "16px", // More rounded corners
          outline: "none", // Remove the default blue outline on focus
          "&:hover": { borderColor: "#a6ce39" }, // Hover effect for green border
          boxShadow: state.isFocused ? "0 0 0 3px rgba(166, 206, 57, 0.2)" : "none", // Add a subtle green shadow on focus
        }),
        option: (provided, state) => ({
          ...provided,
          backgroundColor: state.isSelected ? "#a6ce39" : state.isFocused ? "#f1f8e9" : "transparent", // Green background when selected
          color: state.isSelected ? "white" : "black", // White text on selected option
          "&:hover": { backgroundColor: "#a6ce39", color: "white" }, // Green background on hover with white text
        }),
      }}
    />
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

function DiseaseTable({ tableData, isLoading, sseError, orderedTabs, selectedDisease, setSelectedDisease, diseases }) {
  // Filter table data based on selected disease
  const filteredTableData =
    selectedDisease === "all" ? tableData : tableData.filter((record) => record.disease === selectedDisease)

  return (
    <Card className="mb-8 shadow-md">
      <CardHeader className="pb-3 bg-[#f9faf5]">
        <div className="flex items-center justify-between">
          <CardTitle>Disease Data</CardTitle>
          <div className="flex items-center gap-4">
            <DiseaseFilterDropdown
              diseases={diseases}
              selectedDisease={selectedDisease}
              setSelectedDisease={setSelectedDisease}
            />
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
  )
}

export default DiseaseTable
