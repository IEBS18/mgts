"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { useLocation, useNavigate } from "react-router-dom";
import { PlusCircle } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import FormatText from "../FormatText";
import ReactMarkdown from "react-markdown";
/**
 * Example topics you'd like to compare.
 * Adjust as needed for your formulary data.
 */
const topics = [
  "Drug Name",
  "Drug Type",
  "Modality",
  "Tier",
  "Efficacy",
  "Safety",
  "Requirements/Limits",
];

export function FormularyComparison() {
  const location = useLocation();
  const navigate = useNavigate();

  // The array of selected competitor drug objects
  const { selectedDrugs = [], mainDrug = "" } = location.state || {};

  // (Optional) If you want to dynamically fetch "differentiator" or "keyInsights" for the main drug:
  const [mainDrugInsights, setMainDrugInsights] = useState(null);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);

  useEffect(() => {
    const fetchMainDrugInsights = async () => {
      if (!mainDrug) return;
      setIsLoadingInsights(true);
      try {
        // Adjust to your actual endpoint:
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/formulary-drug-insights`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              drug_name: mainDrug,
              all_data: selectedDrugs,
            }),
          }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch main drug insights");
        }
        const data = await response.json();
        setMainDrugInsights(data); // e.g. { differentiator: "...", keyInsights: "..." }
      } catch (error) {
        console.error("Error fetching main drug insights:", error);
        toast.error(error.message || "Failed to fetch main drug insights");
      } finally {
        setIsLoadingInsights(false);
      }
    };

    fetchMainDrugInsights();
  }, [mainDrug, selectedDrugs]);

  // Example: you might have a function to export or add AI columns, etc.
  const handleExport = () => {
    // Implementation for exporting
    toast.info("Exporting is not implemented yet.");
  };

  return (
    <div className="w-full p-4 overflow-x-auto">
      <ToastContainer />

      {/* Title & Action Buttons */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-800">
          Formulary Comparison
        </h1>
        <div className="flex gap-2">
          <Button
            onClick={handleExport}
            className="bg-[#a6ce39] text-white hover:bg-[#95b833] rounded-[12px]"
          >
            Export
          </Button>
        </div>
      </div>

      {/* Comparison Table or Layout */}
      <div className="relative overflow-auto rounded-lg shadow">
        <table className="w-full text-sm text-left text-gray-500 border">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0 z-10">
            <tr>
              <th scope="col" className="px-6 py-3">
                Topic
              </th>
              {selectedDrugs.map((d, idx) => (
                <th key={idx} scope="col" className="px-6 py-3">
                  {d["Drug Name"]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {topics.map((topic) => (
              <tr key={topic} className="border-b bg-white hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap sticky left-0 bg-white">
                  {topic !== "Drug Type" ? topic : "Specialty"}
                </td>
                {selectedDrugs.map((drug, idx) => (
                  <td key={idx} className="px-6 py-4 whitespace-normal">
                    <FormatText text={drug[topic]} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Insights or Additional Cards */}
      <div className="flex flex-col md:flex-row gap-4 mt-6">
        {/* Differentiator */}
        <Card className="md:w-1/2 w-full">
          <CardHeader>
            <CardTitle>Differentiator for {mainDrug || "N/A"}</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingInsights ? (
              <p>Loading differentiator...</p>
            ) : (
              <ReactMarkdown>
                {mainDrugInsights?.differentiator || "N/A"}
              </ReactMarkdown>
            )}
          </CardContent>
        </Card>

        {/* Key Insights */}
        <Card className="md:w-1/2 w-full">
          <CardHeader>
            <CardTitle>Key Insights for {mainDrug || "N/A"}</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingInsights ? (
              <p>Loading insights...</p>
            ) : (
              <ReactMarkdown>{mainDrugInsights?.insights || "N/A"}</ReactMarkdown>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
