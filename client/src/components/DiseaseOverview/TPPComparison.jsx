"use client"

import React, { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useLocation, useNavigate } from "react-router-dom"
import { PlusCircle } from "lucide-react"
import { toast, ToastContainer } from "react-toastify"
import FormatText from "../util/FormatText"

const topics = [
    "Drug",
    "Disease",
    "Route of Administration",
    "Modality",
    "Safety",
    "Efficacy",
    "Dosage Form",
    "Dosage Regime",
    "Dosage Size",
    "Special Warnings",
    "Patient Eligibility",
    "Progression Free Survival",
    "Overall Survival",
    "Overall Response Rate",
    "Relapse Rate",
    "Relative risk reduction for vaccine",
]

export function TPPComparison() {
    const location = useLocation()
    const navigate = useNavigate()
    const data = location.state?.comparisonData || []
    const [visibleColumns, setVisibleColumns] = useState(data.map((d) => `${d.TradeName} (${d.Size})`))
    const [aiColumnDialogOpen, setAiColumnDialogOpen] = useState(false)
    const [aiColumnName, setAiColumnName] = useState("")
    const [aiColumnDescription, setAiColumnDescription] = useState("")
    const [isExporting, setIsExporting] = useState(false)
    const [isAiColumnLoading, setIsAiColumnLoading] = useState(false)
    const [aiColumns, setAiColumns] = useState([])

    // State to hold fetched scores
    const [scores, setScores] = useState({})
    const [isLoadingScores, setIsLoadingScores] = useState(true)

    const [mainDrugInsights, setMainDrugInsights] = useState(null)
    const [isLoadingInsights, setIsLoadingInsights] = useState(true)

    useEffect(() => {
        const fetchMainDrugInsights = async () => {
            setIsLoadingInsights(true)
            try {
                const mainDrug = location.state?.mainDrug
                if (mainDrug) {
                    const response = await fetch(`${import.meta.env.VITE_API_URL}/main-drug-insights`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            drug_name: mainDrug,
                            all_data: data,
                        }),
                    })
                    if (!response.ok) {
                        throw new Error("Failed to fetch main drug insights")
                    }
                    const insights = await response.json()
                    setMainDrugInsights(insights)
                } else {
                    throw new Error("Main drug not found")
                }
            } catch (error) {
                console.error("Error fetching main drug insights:", error)
                toast.error(error.message || "Failed to fetch main drug insights")
            } finally {
                setIsLoadingInsights(false)
            }
        }

        fetchMainDrugInsights()
    }, [data, location.state?.mainDrug])

    const toggleColumnVisibility = (column) => {
        setVisibleColumns((prev) => (prev.includes(column) ? prev.filter((c) => c !== column) : [...prev, column]))
    }

    const visibleData = useMemo(() => {
        return data.filter((d) => visibleColumns.includes(`${d.TradeName} (${d.Size})`))
    }, [data, visibleColumns])

    const handleSubmitAiColumn = () => {
        if (!aiColumnName || !aiColumnDescription) {
            return
        }

        setIsAiColumnLoading(true)

        fetch(`${import.meta.env.VITE_API_URL}/add-ai-column`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                columnName: aiColumnName,
                columnDescription: aiColumnDescription,
                searchResults: data,
            }),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Failed to add AI column")
                }
                return response.json()
            })
            .then((responseData) => {
                const updatedResults = responseData.updated_results.map((result) => ({
                    ...result,
                    [aiColumnName]: result[aiColumnName] || "",
                }))

                setAiColumnDialogOpen(false)
                setIsAiColumnLoading(false)

                setAiColumns((prevAiColumns) => [...prevAiColumns, aiColumnName])
                const mainDrug = location.state?.mainDrug
                navigate(location.pathname, {
                    state: { comparisonData: updatedResults, aiColumns: [...aiColumns, aiColumnName], mainDrug: mainDrug },
                })

                toast.success("AI column added successfully!")
            })
            .catch((error) => {
                console.error("Error adding AI column:", error)
                toast.warn("Error adding AI column")
                setIsAiColumnLoading(false)
            })
    }

    const handleExport = () => {
        setIsExporting(true)

        const exportData = visibleData.map((card) => {
            const exportCard = {}
                ;[...topics, ...aiColumns].forEach((topic) => {
                    if (visibleColumns.includes(`${card.TradeName} (${card.Size})`)) {
                        exportCard[topic] = card[topic] || ""
                    }
                })

            return exportCard
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
                link.setAttribute("download", "visible_data.xlsx")
                document.body.appendChild(link)
                link.click()
                link.parentNode.removeChild(link)
                setIsExporting(false)
            })
            .catch((error) => {
                console.error("Error exporting visible data:", error)
                setIsExporting(false)
            })
    }

    const getBackgroundColor = (score, type) => {
        if (type === "Adverse_Events") {
            const greenValue = Math.max(0, 255 - (score / 10) * 255)
            const redValue = Math.min(255, (score / 10) * 255)
            return `rgba(${redValue}, ${greenValue}, 0, 0.5)`
        } else if (type === "Efficacy" || type === "Safety") {
            const greenValue = Math.min(255, score * 255)
            const redValue = Math.max(0, 255 - score * 255)
            return `rgba(${redValue}, ${greenValue}, 0, 0.5)`
        }
        return "transparent"
    }

    return (
        <div className="w-full overflow-x-auto">
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

            <div className="flex justify-between m-4 space-x-2 top-div" style={{ position: "sticky", top: 0 }}>
                <div className="flex w-1/2">
                    <h1 className="text-2xl w-1/2 font-bold text-gray-800">Drugs Comparison</h1>
                </div>
                <div className="flex flex-row gap-x-4 ">
                    <Button
                        onClick={() => setAiColumnDialogOpen(true)}
                        variant="outline"
                        disabled={isAiColumnLoading}
                        className="bg-white text-[#a6ce39] border border-[#a6ce39] hover:bg-[#f0f8e5] flex items-center rounded-lg gap-2"
                    >
                        <PlusCircle className="h-4 w-4" />
                        {isAiColumnLoading ? "Loading..." : "Add AI Column"}
                    </Button>
                    <Button
                        onClick={handleExport}
                        disabled={isExporting}
                        className={`bg-[#a6ce39] text-white hover:bg-[#95b833] rounded-[12px] flex items-center gap-2 ${isExporting ? "cursor-not-allowed opacity-50" : ""
                            }`}
                    >
                        {isExporting ? "Exporting..." : "Export"}
                    </Button>
                </div>
            </div>



            <div className="relative overflow-auto shadow-md sm:rounded-lg" style={{ maxHeight: "calc(90vh - 100px)" }}>
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 sticky top-0 z-10">
                        <tr>
                            <th scope="col" className="px-6 py-3 sticky left-0 bg-gray-50 dark:bg-gray-700">
                                Topic
                            </th>
                            {visibleData.map((d) => (
                                <th key={`${d.Drug} `} scope="col" className="px-6 py-3 whitespace-nowrap">
                                    {`${d.Drug} `}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {[...topics, ...aiColumns].map((topic) => (
                            <tr
                                key={topic}
                                className={`border-b ${aiColumns.includes(topic)
                                    ? "bg-[#a6ce39]/60 text-black backdrop-blur-md shadow-lg dark:bg-[#a6ce39]/80"
                                    : "bg-white dark:bg-gray-800"
                                    } dark:border-gray-700`}
                            >
                                <th
                                    scope="row"
                                    className={`px-6 py-4 font-medium align-text-top text-gray-900 whitespace-nowrap dark:text-white sticky left-0 ${aiColumns.includes(topic)
                                        ? "bg-[#a6ce39]/60 backdrop-blur-md shadow-lg dark:bg-[#a6ce39]/80"
                                        : "bg-white dark:bg-gray-800"
                                        }`}
                                >
                                    <div className="flex items-center">
                                        {aiColumns.includes(topic)}
                                        <label htmlFor={`select-${topic}`} className="capitalize font-bold">
                                            {topic}
                                        </label>
                                    </div>
                                </th>
                                {visibleData.map((d) => (
                                    <td
                                        key={`${d.TradeName} (${d.Size})`}
                                        className="px-6 py-4 align-text-top"
                                        style={{
                                            backgroundColor:
                                                topic === "Adverse_Events"
                                                    ? getBackgroundColor(scores[d.TradeName]?.adverse_events, "Adverse_Events")
                                                    : topic === "Efficacy"
                                                        ? getBackgroundColor(scores[d.TradeName]?.efficacy, "Efficacy")
                                                        : topic === "Safety"
                                                            ? getBackgroundColor(scores[d.TradeName]?.safety, "Safety")
                                                            : "transparent",
                                        }}
                                    >
                                        <FormatText text={d[topic]} />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="flex flex-row gap-4 m-4">
                    <Card className="w-1/2 bg-white">
                        <CardHeader>
                            <CardTitle>Differentiator for {location.state?.mainDrug}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isLoadingInsights ? (
                                <div className="flex items-center justify-center">
                                    <div className="animate-pulse flex space-x-1">
                                        <div className="w-2 h-2 bg-[#a6ce39] rounded-full"></div>
                                        <div className="w-2 h-2 bg-[#a6ce39] rounded-full"></div>
                                        <div className="w-2 h-2 bg-[#a6ce39] rounded-full"></div>
                                        {/* <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div> */}
                                    </div>
                                </div>
                            ) : (
                                <FormatText text={mainDrugInsights?.differentiator || "N/A"} />
                            )}
                        </CardContent>
                    </Card>
                    <Card className="w-1/2 bg-white">
                        <CardHeader>
                            <CardTitle>Key Insights for {location.state?.mainDrug}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isLoadingInsights ? (
                                <div className="flex items-center justify-center">
                                    <div className="animate-pulse flex space-x-1">
                                        <div className="w-2 h-2 bg-[#a6ce39] rounded-full"></div>
                                        <div className="w-2 h-2 bg-[#a6ce39] rounded-full"></div>
                                        <div className="w-2 h-2 bg-[#a6ce39] rounded-full"></div>
                                    </div>
                                </div>
                            ) : (
                                <FormatText text={mainDrugInsights?.keyInsights || "N/A"} />
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>


            <Dialog open={aiColumnDialogOpen} onOpenChange={setAiColumnDialogOpen}>
                <DialogContent className="bg-white">
                    <DialogTitle>Add AI Column</DialogTitle>
                    <DialogDescription>Enter the name and description for the new AI column to be added.</DialogDescription>
                    <div className="space-y-4">
                        <Input
                            value={aiColumnName}
                            onChange={(e) => setAiColumnName(e.target.value)}
                            placeholder="Column Name"
                            className="w-full p-2 border border-gray-200 rounded-[12px] text-gray-800 focus:border-[#a6ce39] focus:ring-[#a6ce39] hover:border-[#a6ce39] transition duration-200 ease-in-out"
                        />
                        <Input
                            value={aiColumnDescription}
                            onChange={(e) => setAiColumnDescription(e.target.value)}
                            placeholder="Column Description"
                            className="w-full p-2 border border-gray-200 rounded-[12px] text-gray-800 focus:border-[#a6ce39] focus:ring-[#a6ce39] hover:border-[#a6ce39] transition duration-200 ease-in-out"
                        />
                    </div>
                    <DialogFooter>
                        <Button
                            onClick={handleSubmitAiColumn}
                            disabled={isAiColumnLoading}
                            className="bg-[#a6ce39] text-white hover:bg-[#95b833] rounded-[12px]"
                        >
                            {isAiColumnLoading ? "Adding..." : "Add Column"}
                        </Button>
                        <Button
                            onClick={() => setAiColumnDialogOpen(false)}
                            variant="outline"
                            className="bg-white text-[#a6ce39] border border-[#a6ce39] hover:bg-[#f0f8e5] flex items-center rounded-lg gap-2"
                        >
                            Cancel
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
