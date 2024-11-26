"use client";

import React, { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
    const [aiColumnEnabled, setAiColumnEnabled] = useState(false);

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
            alert("Please fill out both fields");
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

                alert("AI column added successfully!");
                setAiColumnDialogOpen(false);
                setIsAiColumnLoading(false);

                // Add the new AI column to the state without removing the old ones
                setAiColumns((prevAiColumns) => [...prevAiColumns, aiColumnName]);

                // Navigate to the same page, passing updated data and updated columns
                navigate(location.pathname, {
                    state: { comparisonData: updatedResults, aiColumns: [...aiColumns, aiColumnName] },
                });
            })
            .catch((error) => {
                console.error("Error adding AI column:", error);
                alert("Error adding AI column");
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
                link.setAttribute("download", "visible_data.xlsx");
                document.body.appendChild(link);
                link.click();
                link.parentNode.removeChild(link);
                setIsExporting(false);
            })
            .catch((error) => {
                console.error("Error exporting visible data:", error);
                setIsExporting(false);
                alert("Failed to export data");
            });
    };


    return (
        <div className="w-full overflow-x-auto">
            <div className="flex justify-between m-4 space-x-2">
                <div className='flex w-1/2'>
                    <h1 className="text-2xl w-1/2 font-bold text-gray-800">Drugs Comparison</h1>
                </div>
                <div className='flex flex-row gap-x-4 '>
                    
                <Button onClick={() => setAiColumnDialogOpen(true)} variant="outline" disabled={isAiColumnLoading} className="bg-white text-[#a6ce39] border border-[#a6ce39] hover:bg-[#f0f8e5] flex items-center rounded-lg gap-2">
                    <PlusCircle className="h-4 w-4" />
                    {isAiColumnLoading ? "Loading..." : "Add AI Column"}
                </Button>
                <Button onClick={handleExport} disabled={isExporting} className={`bg-[#a6ce39] text-white hover:bg-[#95b833] rounded-[12px] flex items-center gap-2 ${isExporting ? 'cursor-not-allowed opacity-50' : ''}`}>
                    {isExporting ? "Exporting..." : "Export"}
                </Button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="bg-white text-[#a6ce39] border-[#a6ce39] hover:bg-[#f0f8e5] flex items-center rounded-lg gap-2"><Filter className="h-4 w-4" />Filter Columns</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 bg-white rounded-lg">
                        {data.map((d) => (
                            <DropdownMenuCheckboxItem
                                key={`${d.TradeName} (${d.Size})`}
                                checked={visibleColumns.includes(`${d.TradeName} (${d.Size})`)}
                                onCheckedChange={() => toggleColumnVisibility(`${d.TradeName} (${d.Size})`)}
                            >
                                {`${d.TradeName} (${d.Size})`}
                            </DropdownMenuCheckboxItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
                </div>
            </div>
            <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
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
                            <tr key={topic} className="border-b bg-white dark:bg-gray-800 dark:border-gray-700">
                                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white sticky left-0 bg-white dark:bg-gray-800">
                                    <div className="flex items-center">
                                        {aiColumns.includes(topic)}
                                        <label htmlFor={`select-${topic}`} className="capitalize">
                                            {topic}
                                        </label>
                                    </div>
                                </th>
                                {visibleData.map((d) => (
                                    <td key={`${d.TradeName} (${d.Size})`} className="px-6 py-4">
                                        {topic === "Price($)" ? (
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

            {/* AI Column Dialog */}
            {/* <Dialog open={aiColumnDialogOpen} onOpenChange={setAiColumnDialogOpen}>
                <DialogContent>
                    <DialogTitle>Add AI Column</DialogTitle>
                    <DialogDescription>Provide a name and description for the AI-generated column.</DialogDescription>
                    <div className="grid gap-4">
                        <Input
                            label="Column Name"
                            value={aiColumnName}
                            onChange={(e) => setAiColumnName(e.target.value)}
                            disabled={isAiColumnLoading}
                        />
                        <Input
                            label="Column Description"
                            value={aiColumnDescription}
                            onChange={(e) => setAiColumnDescription(e.target.value)}
                            disabled={isAiColumnLoading}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setAiColumnDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSubmitAiColumn} disabled={isAiColumnLoading}>
                            {isAiColumnLoading ? "Adding..." : "Add Column"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog> */}

<Dialog open={aiColumnDialogOpen} onOpenChange={setAiColumnDialogOpen} >
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
