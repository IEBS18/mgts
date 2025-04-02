"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useLocation, useNavigate } from 'react-router-dom';
import { Filter, PlusCircle } from 'lucide-react';
import { ThreeDots } from 'react-loader-spinner';
import { toast, ToastContainer } from 'react-toastify';

const topics = [
    "Active Ingredient",
    "Manufacturer",
    "Country",
    "Price($)",
    "Quality_of_Life",
    "Efficacy",
    "Safety",
    "Adverse_Events",
    "Annual_Therapy_Costs",
    "Type_of_Drug",
];

export function DrugComparisonTable() {
    const location = useLocation();
    const navigate = useNavigate();
    const data = location.state?.comparisonData || [];
    const [visibleColumns, setVisibleColumns] = useState(data.map((d) => `${d.TradeName} (${d.Size})`));
    const [aiColumnDialogOpen, setAiColumnDialogOpen] = useState(false);
    const [aiColumnName, setAiColumnName] = useState("");
    const [aiColumnDescription, setAiColumnDescription] = useState("");
    const [isExporting, setIsExporting] = useState(false);
    const [isAiColumnLoading, setIsAiColumnLoading] = useState(false);
    const [aiColumns, setAiColumns] = useState([]);

    // State to hold fetched scores
    const [scores, setScores] = useState({});
    const [isLoadingScores, setIsLoadingScores] = useState(true);

    const toggleColumnVisibility = (column) => {
        setVisibleColumns((prev) =>
            prev.includes(column) ? prev.filter((c) => c !== column) : [...prev, column]
        );
    };

    const visibleData = useMemo(() => {
        return data.filter((d) => visibleColumns.includes(`${d.TradeName} (${d.Size})`));
    }, [data, visibleColumns]);

    const handleSubmitAiColumn = () => {
        if (!aiColumnName || !aiColumnDescription) {
            // alert("Please fill out both fields");
            return;
        }

        setIsAiColumnLoading(true);

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
                    throw new Error("Failed to add AI column");
                }
                return response.json();
            })
            .then((responseData) => {
                const updatedResults = responseData.updated_results.map((result) => ({
                    ...result,
                    [aiColumnName]: result[aiColumnName] || "",
                }));

                
                setAiColumnDialogOpen(false);
                setIsAiColumnLoading(false);
                

                // Add the new AI column to the state without removing the old ones
                setAiColumns((prevAiColumns) => [...prevAiColumns, aiColumnName]);

                

                // Navigate to the same page, passing updated data and updated columns
                navigate(location.pathname, {
                    state: { comparisonData: updatedResults, aiColumns: [...aiColumns, aiColumnName] },
                });

                toast.success("AI column added successfully!");
            })
            .catch((error) => {
                console.error("Error adding AI column:", error);
                toast.warn("Error adding AI column");
                setIsAiColumnLoading(false);
            });
    };

    const handleExport = () => {
        setIsExporting(true);

        // Map visible data based on selected visible columns
        const exportData = visibleData.map((card) => {
            const exportCard = {};

            // Include only visible columns
            [...topics, ...aiColumns].forEach((topic) => {
                if (visibleColumns.includes(`${card.TradeName} (${card.Size})`)) {
                    exportCard[topic] = card[topic] || ""; // Fallback to an empty string if data is missing
                }
            });

            return exportCard;
        });

        fetch(`${import.meta.env.VITE_API_URL}/download-excel`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(exportData),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Failed to export data");
                }
                return response.blob();
            })
            .then((blob) => {
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.setAttribute("download", "TPP_of_drugs.xlsx");
                document.body.appendChild(link);
                link.click();
                link.parentNode.removeChild(link);
                setIsExporting(false);
            })
            .catch((error) => {
                console.error("Error exporting visible data:", error);
                setIsExporting(false);
                // alert("Failed to export data");
            });
    };

    // Function to calculate background color based on score
    const getBackgroundColor = (score, type) => {
        if (type === "Adverse_Events") {
            // Scale from green (low adverse events) to red (high adverse events)
            const greenValue = Math.max(0, 255 - (score / 10) * 255); // Green decreases as score increases
            const redValue = Math.min(255, (score / 10) * 255); // Red increases as score increases
            return `rgba(${redValue}, ${greenValue}, 0, 0.5)`; // Green to Red gradient
        } else if (type === "Efficacy" || type === "Safety") {
            // Scale from red (low efficacy/safety) to green (high efficacy/safety)
            const greenValue = Math.min(255, score * 255); // Green increases as score increases
            const redValue = Math.max(0, 255 - score * 255); // Red decreases as score increases
            return `rgba(${redValue}, ${greenValue}, 0, 0.5)`; // Red to Green gradient
        }
        return "transparent"; // Default color
    };
    


    // Fetch scores from the backend when the component mounts
    useEffect(() => {
        const fetchScores = async () => {
            const fetchedScores = {};

            for (const drug of data) {
                const { TradeName, Country, Efficacy, Safety, Adverse_Events, Annual_Therapy_Costs } = drug;

                // Fetch annual therapy cost
                const annualCostResponse = await fetch(`${import.meta.env.VITE_API_URL}/annual_therapy_cost`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ cost_statement: Annual_Therapy_Costs }),
                });
                const annualCostData = await annualCostResponse.json();
                fetchedScores[TradeName] = { ...fetchedScores[TradeName], annual_therapy_cost: annualCostData['Annual_Therapy_Costs(Numbers)'] || "N/A" };

                // Fetch adverse event score
                const adverseEventResponse = await fetch(`${import.meta.env.VITE_API_URL}/adverse_event_score`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ drug_name: TradeName, adverse_event_statement: Adverse_Events }),
                });
                const adverseEventData = await adverseEventResponse.json();
                fetchedScores[TradeName] = { ...fetchedScores[TradeName], adverse_events: adverseEventData['Final Score'] || "N/A" };

                // Fetch safety and efficacy score
                const safetyEfficacyResponse = await fetch(`${import.meta.env.VITE_API_URL}/safety_efficacy_score`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        trade_name: TradeName,
                        country: Country,
                        disease: drug.Disease,
                        efficacy_statement: Efficacy,
                        safety_statement: Safety,
                    }),
                });
                const safetyEfficacyData = await safetyEfficacyResponse.json();
                fetchedScores[TradeName] = { ...fetchedScores[TradeName], efficacy: safetyEfficacyData['Efficacy_Score'] || "N/A", safety: safetyEfficacyData['Safety_Score'] || "N/A" };
            }

            setScores(fetchedScores);
            setIsLoadingScores(false);
        };

        fetchScores();
    }, [data]);

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

            <div className="flex justify-between m-4 space-x-2 top-div"
                style={{ position: "sticky", top: 0 }}>
                <div className='flex w-1/2'>
                    <h1 className="text-2xl w-1/2 font-bold text-gray-800">Drugs Comparison</h1>
                </div>
                <div className='flex flex-row gap-x-4 '>
                    <Button onClick={() => setAiColumnDialogOpen(true)} variant="outline" disabled={isAiColumnLoading} className="bg-white text-[#a6ce39] border border-[#a6ce39] hover:bg-[#f0f8e5] flex items-center rounded-lg gap-2">
                        <PlusCircle className="h-4 w-4" />
                        {isAiColumnLoading ? "Loading..." : "Add AI Column"}
                    </Button>
                    <Button onClick={handleExport} disabled={isExporting} className={`bg-[#a6ce39] text-white hover:bg-[#95b833] rounded-[12px] flex items-center gap-2 ${isExporting ? 'cursor-not-allowed opacity -50' : ''}`}>
                        {isExporting ? "Exporting..." : "Export"}
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="bg-white text-[#a6ce39] border-[#a6ce39] hover:bg-[#f0f8e5] flex items-center rounded-lg gap-2"><Filter className="h-4 w-4" />Filter Columns</Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56 bg-white rounded-lg dropdown-scroll">
                            {data.map((d) => (
                                <DropdownMenuCheckboxItem
                                    key={`${d.TradeName} (${d.Size})`}
                                    checked={visibleColumns.includes(`${d.TradeName} (${d.Size})`)}
                                    onCheckedChange={() => toggleColumnVisibility(`${d.TradeName} (${d.Size})`)}
                                    onSelect={(e) => e.preventDefault()}
                                >
                                    {`${d.TradeName} (${d.Size})`}
                                </DropdownMenuCheckboxItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
            <div className="relative overflow-auto shadow-md sm:rounded-lg"
                style={{ maxHeight: "calc(90vh - 100px)" }}>
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 sticky top-0 z-10">
                        <tr>
                            <th scope="col" className="px-6 py-3 sticky left-0 bg-gray-50 dark:bg-gray-700">
                                Topic
                            </th>
                            {visibleData.map((d) => (
                                <th key={`${d.TradeName} (${d.Size})`} scope="col" className="px-6 py-3 whitespace-nowrap">
                                    {`${d.TradeName} (${d.Size})`}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {/* Iterate over topics (including AI column names) */}
                        {[...topics, ...aiColumns].map((topic) => (
                            <tr
                                key={topic}
                                className={`border-b ${aiColumns.includes(topic)
                                    ? "bg-[#a6ce39]/60 text-black backdrop-blur-md shadow-lg dark:bg-[#a6ce39]/80" // Distinct color with opacity and blur
                                    : "bg-white dark:bg-gray-800"
                                    } dark:border-gray-700`}
                            >
                                <th
                                    scope="row"
                                    className={`px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white sticky left-0 ${aiColumns.includes(topic)
                                        ? "bg-[#a6ce39]/60 backdrop-blur-md shadow-lg dark:bg-[#a6ce39]/80" // Matches the row with glassmorphism effect
                                        : "bg-white dark:bg-gray-800"
                                        }`}>
                                    <div className="flex items-center">
                                        {aiColumns.includes(topic)}
                                        <label htmlFor={`select-${topic}`} className="capitalize font-bold">
                                            {topic}
                                        </label>
                                    </div>
                                </th>
                                {visibleData.map((d) => (
                                    <td key={`${d.TradeName} (${d.Size})`} className="px-6 py-4"
                                        style={{
                                            backgroundColor: topic === "Adverse_Events" ? getBackgroundColor(scores[d.TradeName]?.adverse_events, "Adverse_Events") :
                                                topic === "Efficacy" ? getBackgroundColor(scores[d.TradeName]?.efficacy, "Efficacy") :
                                                    topic === "Safety" ? getBackgroundColor(scores[d.TradeName]?.safety, "Safety") : "transparent"
                                        }}>
                                        {isLoadingScores ? (
                                            <ThreeDots color="#a6ce39" height={20} width={20} />
                                        ) : topic === "Efficacy" ? (
                                            <span>{scores[d.TradeName]?.efficacy || "N/A"}</span>
                                        ) : topic === "Safety" ? (
                                            <span>{scores[d.TradeName]?.safety || "N/A"}</span>
                                        ) : topic === "Adverse_Events" ? (
                                            <span>{scores[d.TradeName]?.adverse_events || "N/A"}</span>
                                        ) : topic === "Annual_Therapy_Costs" ? (
                                            <span>{scores[d.TradeName]?.annual_therapy_cost || "N/A"}</span>
                                        ) : topic === "Price($)" ? (
                                            <span>{d["Price"]}</span>
                                        ) : (
                                            d[topic]
                                        )}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Dialog open={aiColumnDialogOpen} onOpenChange={setAiColumnDialogOpen}>
                <DialogContent className='bg-white'>
                    <DialogTitle>Add AI Column</DialogTitle>
                    <DialogDescription>
                        Enter the name and description for the new AI column to be added.
                    </DialogDescription>
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
                        <Button onClick={handleSubmitAiColumn} disabled={isAiColumnLoading} className="bg-[#a6ce39] text-white hover:bg-[#95b833] rounded-[12px]">{isAiColumnLoading ? "Adding..." : "Add Column"}</Button>
                        <Button onClick={() => setAiColumnDialogOpen(false)} variant="outline" className='bg-white text-[#a6ce39] border border-[#a6ce39] hover:bg-[#f0f8e5] flex items-center rounded-lg gap-2'>Cancel</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}