import React, { useCallback, useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { Card } from "./ui/card"
import { Button } from "@/components/ui/button" // Adjust to your imports
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Download, Filter, PlusCircle, X } from "lucide-react" // Adjust imports based on your setup
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog"
import FormatText from "./FormatText"
import { Input } from "./ui/input"
import { toast, ToastContainer } from "react-toastify"

const TPPDrugPage = () => {
  const location = useLocation()
  const navigate = useNavigate()

  const { searchResults, drug } = location.state || {}
  console.log(drug)
  const [selectedCards, setSelectedCards] = useState([])
  const [isExporting, setIsExporting] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedResult, setSelectedResult] = useState(null)

  const [countryFilter, setCountryFilter] = useState([])
  const [drugTypeFilter, setDrugTypeFilter] = useState([])
  const [filteredResults, setFilteredResults] = useState(searchResults || [])

  const [aiColumnDialogOpen, setAiColumnDialogOpen] = useState(false) // For "Add AI Column" dialog
  const [aiColumnName, setAiColumnName] = useState("")
  const [aiColumnDescription, setAiColumnDescription] = useState("")

  // Get unique countries and drug types
  const uniqueCountries = [...new Set(searchResults?.map((result) => result.Country))]
  const uniqueDrugTypes = [...new Set(searchResults?.map((result) => result.Type_of_Drug))]

  function formatText(inputText) {
    // Split the input by the dash "-" and remove extra spaces around each word
    const formattedText = inputText.split('-').map(item => item.trim()).filter(item => item !== '');
    
    return formattedText.join(', ');
  }

  // Apply filters whenever filters or searchResults change
  useEffect(() => {
    setFilteredResults(
      searchResults?.filter(
        (result) =>
          (countryFilter.length === 0 || countryFilter.includes(result.Country)) &&
          (drugTypeFilter.length === 0 || drugTypeFilter.includes(result.Type_of_Drug)),
      ),
    )
  }, [countryFilter, drugTypeFilter, searchResults])

  const toggleFilter = (filter, setFilter, value) => {
    setFilter((prev) => (prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]))
  }

  const handleSelectAll = () => {
    setSelectedCards(selectedCards.length === filteredResults.length ? [] : filteredResults)
  }

  const handleCardSelection = (result) => {
    if (result.Drug === drug) return // Prevent selection of the main drug
    setSelectedCards((prevSelected) =>
      prevSelected.includes(result) ? prevSelected.filter((card) => card !== result) : [...prevSelected, result],
    )
  }

  const handleExport = useCallback(() => {
    setIsExporting(true)

    const exportData = selectedCards.map((card) => {
      const {
        TradeName,
        "Active Ingredient": activeIngredient,
        Manufacturer,
        Country,
        Size,
        Quality_of_Life,
        Efficacy,
        Safety,
        Adverse_Events,
        Annual_Therapy_Costs,
        Type_of_Drug,
      } = card

      return {
        TradeName,
        "Active Ingredient": activeIngredient,
        Manufacturer,
        Country,
        Size,
        "Price($)": card.Price,
        Quality_of_Life,
        Efficacy,
        Safety,
        Adverse_Events,
        Annual_Therapy_Costs,
        Type_of_Drug,
      }
    })

    fetch(`${import.meta.env.VITE_API_URL}/download-excel`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(exportData),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to export data")
        }
        return response.blob()
      })
      .then((blob) => {
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.setAttribute("download", "selected_cards.xlsx")
        document.body.appendChild(link)
        link.click()
        link.parentNode.removeChild(link)
        setIsExporting(false)
      })
      .catch((error) => {
        console.error("Error exporting selected cards:", error)
        setIsExporting(false)
      })
  }, [selectedCards])

  const handleOpenAiColumnDialog = () => {
    setAiColumnDialogOpen(true)
  }

  const handleSubmitAiColumn = () => {
    if (!aiColumnName || !aiColumnDescription) {
      alert("Please fill out both fields")
      return
    }

    // Send the AI column data to the backend with searchResults
    fetch(`${import.meta.env.VITE_API_URL}/add-ai-column`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        columnName: aiColumnName,
        columnDescription: aiColumnDescription,
        searchResults,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to add AI column")
        }
        // toast("AI column added successfully!");
        // setAiColumnDialogOpen(false);
        return response.json()
      })
      .then((data) => {
        // Assuming `updated_results` is in the response body
        const updatedResults = data.updated_results.map((result) => ({
          ...result,
          // aiColumnName: aiColumnName, // Add the AI column name to each result
        }))

        setFilteredResults(updatedResults)

        console.log(data.updated_results)
        toast.success("AI column added successfully!")
        setAiColumnDialogOpen(false)
      })
      .catch((error) => {
        console.error("Error adding AI column:", error)
        toast.warn("Error adding AI column")
      })
  }
  const handleComparison = () => {
    const mainDrug = filteredResults.find((result) => result.Drug === drug)
    const comparisonData = [mainDrug, ...selectedCards].map((card) => ({
      Drug: card.Drug,
      Disease: card.Disease,
      "Route of Administration": card["Route Of Administration"],
      Modality: card.Modality,
      Safety: card.Safety,
      Efficacy: card.Efficacy,
      "Dosage Form": card["Dosage Form"],
      "Dosage Regime": card["Dosage Regime"],
      "Dosage Size": card["Dosage Size"],
      "Special Warnings": card["Special Warnings"],
      "Patient Eligibility": card["Patient Eligibility"],
      Country: card.Countries,
    }))

    // Navigate to the /drug-comparison route and pass data via state
    navigate("/tpp-comparison", { state: { comparisonData, mainDrug: drug } })
  }

  const handleOpenDialog = useCallback((result) => {
    setSelectedResult(result)
    setDialogOpen(true)
  }, [])
  console.log(filteredResults)

  function formatPrice(price) {
    if (typeof price === "string" && price.includes("$")) {
      // If the price already includes a dollar sign, return it as-is
      return price
    } else if (!isNaN(price)) {
      // Convert to a number (if not already) and format with a dollar sign
      return `$${Number.parseFloat(price).toFixed(2)}`
    } else {
      // Handle invalid inputs
      console.error("Invalid price input:", price)
      return "$0.00" // Default fallback
    }
  }

  console.log(formatPrice("17.555999999999997"))

  return (
    <div className="w-full p-2">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      {/* Select All and Export Buttons */}
      <div className="flex sticky items-center justify-between gap-x-4 pb-4 pt-2">
        <h1 className="text-2xl font-bold text-gray-800">Showing Relevant Products</h1>
        <div className="flex items-center justify-end gap-4">
          <Button
            onClick={handleComparison}
            disabled={selectedCards.length === 0}
            className="bg-white text-black border border-black hover:bg-[#f0f8e5] flex items-center rounded-lg gap-2"
          >
            {/* <PlusCircle className="h-4 w-4" /> */}
            Compare Drugs
          </Button>
        </div>
      </div>
      <div className="flex gap-2 flex-wrap">
        {countryFilter.length > 0 && (
          <div className="flex items-center bg-[#e5f7d9] text-[#4d7c1a] px-3 py-1 rounded-lg">
            <span className="text-sm font-semibold">Country: {countryFilter.join(", ")}</span>
            <button
              onClick={() => setCountryFilter([])}
              className="ml-2 text-[#4d7c1a] hover:text-red-500 focus:outline-none"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        {drugTypeFilter.length > 0 && (
          <div className="flex items-center bg-[#e5f7d9] text-[#4d7c1a] px-3 py-1 rounded-lg">
            <span className="text-sm font-semibold">Drug Type: {drugTypeFilter.join(", ")}</span>
            <button
              onClick={() => setDrugTypeFilter([])}
              className="ml-2 text-[#4d7c1a] hover:text-red-500 focus:outline-none"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        {(countryFilter.length > 0 || drugTypeFilter.length > 0) && (
          <button
            onClick={() => {
              setCountryFilter([])
              setDrugTypeFilter([])
            }}
            className="text-[#a6ce39] hover:text-red-500 text-sm font-semibold focus:outline-none"
          >
            Clear All Filters
          </button>
        )}
      </div>
      {/* Drug Cards */}
      <div className="grid grid-cols-3 gap-4 mt-4">
        {filteredResults?.map((result, index) => (
          <Card
            key={index}
            className="bg-white border border-[#a6ce39] rounded-[12px] p-4 shadow-sm cursor-pointer relative"
            onClick={() => handleOpenDialog(result)}
          >
            <div
              onClick={(e) => e.stopPropagation()} // Prevent dialog from opening when checkbox is clicked
              className="absolute top-2 right-2"
            >
              <input
                type="checkbox"
                checked={selectedCards.includes(result)}
                onChange={() => handleCardSelection(result)}
                disabled={result.Drug === drug}
                className={`h-5 w-5 cursor-pointer ${result.Drug === drug ? "opacity-50" : ""}`}
                style={{ accentColor: "#a6ce39" }}
              />
            </div>
            <div className="mt-2">
              <p className="text-black font-bold">
                {" "}
                {result.Drug} {result["Dosage Size"] && `(${formatText(result["Dosage Size"])})`}
              </p>
              {result["Modality"] && (
                <p>
                  <strong className="font-semibold">Modality:</strong> {formatText(result["Modality"])}
                </p>
              )}
              {result.Disease && (
                <p>
                  <strong className="font-semibold">Disease:</strong> {formatText(result.Disease)}
                </p>
              )}
              {result["Route Of Administration"] && (
                <p>
                  <strong className="font-semibold">Route of Administration:</strong> {formatText(result["Route Of Administration"])}
                </p>
              )}
              {result["Clinical Status"] && (
                <p>
                  <strong className="font-semibold">Clinical Status:</strong> {result["Clinical Status"]}
                </p>
              )}
              {result[aiColumnName] && (
                <p>
                  <strong className="font-semibold">
                    {aiColumnName.charAt(0).toUpperCase() + aiColumnName.slice(1)}:
                  </strong>{" "}
                  {result[aiColumnName]}
                </p>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Dialog for Detailed Information */}
      {dialogOpen && selectedResult && (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-white scrollbar-hide">
            <DialogTitle className="font-bold text-2xl">
              Drug Overview: <strong className="text-[#a6ce39]">{selectedResult.Drug}</strong>
            </DialogTitle>
            <DialogDescription>
              {Object.keys(selectedResult).map((key) => {
                // Skip PDF_Name and Warnings and precautions for use
                if (key === "PDF_Name" || key === "Warnings and precautions for use") return null

                const label = key.replace(/_/g, " ")
                let value = selectedResult[key]

                // Formatting specific fields
                if (key === "Efficacy" || key === "Safety" || key === "Condition for use") {
                  value = value.split("\n").map((item, index) => (
                    <span key={index}>
                      {item}
                      <br />
                    </span>
                  ))
                }

                if (
                  key === "Countries" ||
                  key === "Disease" ||
                  key === "Dosage Size" ||
                  key === "Route Of Administration" ||
                  key === "Patient Eligibility"
                ) {
                  value = value.split("\n").map((item, index) => (
                    <span key={index}>
                      {item}
                      <br />
                    </span>
                  ))
                }

                // Add other custom formatting as needed
                return (
                  value && (
                    <p key={key}>
                      <strong>{label}:</strong> {value}
                    </p>
                  )
                )
              })}
            </DialogDescription>
          </DialogContent>
        </Dialog>
      )}

      <style jsx global>{`
                .scrollbar-hide {
                -ms-overflow-style: none;
                scrollbar-width: none;
                }
                .scrollbar-hide::-webkit-scrollbar {
                display: none;
                }
            `}</style>
    </div>
  )
}

export default TPPDrugPage

