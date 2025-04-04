"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useLocation } from "react-router-dom";
import { PlusCircle } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Import react-toastify styles
import FormatText from "../util/FormatText";

const topics = [
  "Disease Name",
  "Drug Name",
  "Tier",
  "Requirements/Limits",
  "Modality",
  "Safety",
  "Efficacy",
];

export function ComparePlans() {
  const location = useLocation();
  const data = location.state?.selectedData || []; // This is your competitor data
  const [planDialogOpen, setPlanDialogOpen] = useState(false);
  const [newPlan, setNewPlan] = useState({
    drugName: "",
    safety: "",
    efficacy: "",
    modality: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newPlanData, setNewPlanData] = useState({});

  // Handle exporting functionality
  const handleExport = () => {
    toast.info("Export functionality is not yet implemented.");
  };

  const handleSubmitPlan = async () => {
    if (
      !newPlan.drugName.trim() ||
      !newPlan.safety.trim() ||
      !newPlan.efficacy.trim() ||
      !newPlan.modality.trim()
    ) {
      toast.warn("Please fill out all fields.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Restructure `data` into `competitor_data` format
      const competitor_data = restructureCompetitorData(data);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/predict_tier_and_requirement`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            drug_name: newPlan.drugName,
            diseasesname: data[0]?.["Disease Name"] || "N/A", // Handle cases where Disease Name might be undefined
            efficacy: newPlan.efficacy,
            safety: newPlan.safety,
            modality: newPlan.modality,
            competitor_data: competitor_data, // Include competitor_data in the request
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to fetch tier and requirement prediction"
        );
      }

      const prediction = await response.json();

      // Update the new plan with predicted tier and requirement
      const updatedPlan = {
        drugName: newPlan.drugName,
        safety: newPlan.safety,
        efficacy: newPlan.efficacy,
        modality: newPlan.modality,
        tier: prediction.tier?.trim() || "-", // Replace empty or whitespace-only tier with "N/A"
        "Requirements/Limits":
          prediction.requirement?.trim() || "Fully Reimbursed", // Replace empty or whitespace-only requirement with default
      };

      // Add the new plan as a new column
      setNewPlanData((prevData) => ({
        [newPlan.drugName]: updatedPlan,
        ...prevData,
      }));

      toast.success("Plan added successfully!");
      setPlanDialogOpen(false); // Close the dialog after submission

      // Reset the new plan form
      setNewPlan({
        drugName: "",
        safety: "",
        efficacy: "",
        modality: "",
      });
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Error submitting new plan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to restructure competitor data
  const restructureCompetitorData = (dataArray) => {
    const competitor_data = {};

    dataArray.forEach((plan) => {
      const disease = plan["Disease Name"] || "N/A";
      const drug = plan["Drug Name"] || "N/A";

      if (!competitor_data[disease]) {
        competitor_data[disease] = {};
      }

      if (!competitor_data[disease][drug]) {
        competitor_data[disease][drug] = [];
      }

      competitor_data[disease][drug].push({
        "Efficacy": plan["Efficacy"] || "N/A",
        "Safety": plan["Safety"] || "N/A",
        "Modality": plan["Modality"] || "N/A",
        "Tier": plan["Tier"] || "-",
        "Requirement": plan["Requirement"] || "N/A",
      });
    });

    return competitor_data;
  };

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

      {/* Header Section */}
      <div
        className="flex justify-between m-4 space-x-2 top-div"
        style={{ position: "sticky", top: 0, zIndex: 10 }}
      >
        <div className="flex w-1/2">
          <h1 className="text-2xl w-1/2 font-bold text-gray-800">Plans Comparison</h1>
        </div>
        <div className="flex flex-row gap-x-4">
          <Button
            onClick={() => setPlanDialogOpen(true)}
            variant="outline"
            className="bg-white text-[#a6ce39] border border-[#a6ce39] hover:bg-[#f0f8e5] flex items-center rounded-lg gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            Add Your Plan
          </Button>
          <Button
            onClick={handleExport}
            disabled={isSubmitting}
            className={`bg-[#a6ce39] text-white hover:bg-[#95b833] rounded-[12px] flex items-center gap-2 ${
              isSubmitting ? "cursor-not-allowed opacity-50" : ""
            }`}
          >
            {isSubmitting ? "Exporting..." : "Export"}
          </Button>
        </div>
      </div>

      {/* Comparison Table */}
      <div
        className="relative overflow-auto shadow-md sm:rounded-lg"
        style={{ maxHeight: "calc(90vh - 100px)" }}
      >
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 sticky top-0 z-10">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 sticky left-0 bg-gray-50 dark:bg-gray-700"
              >
                Topic
              </th>
              {data.map((d, index) => (
                <th
                  key={`${d["Drug Name"]}-${index}`}
                  scope="col"
                  className="px-6 py-3 whitespace-nowrap"
                >
                  {`${d["Drug Name"]}`}
                </th>
              ))}
              {/* New Plan Column */}
              {newPlanData &&
                Object.keys(newPlanData).map((planName) => (
                  <th
                    key={planName}
                    scope="col"
                    className="px-6 py-3 whitespace-nowrap"
                  >
                    {planName}
                  </th>
                ))}
            </tr>
          </thead>
          <tbody>
            {topics.map((topic) => (
              <tr key={topic} className="border-b bg-white dark:bg-gray-800">
                <th
                  scope="row"
                  className="px-6 py-4 font-medium align-text-top text-gray-900 whitespace-nowrap dark:text-white sticky left-0 bg-[#a6ce39]"
                >
                  <div className="flex items-center">
                    <label htmlFor={`select-${topic}`} className="capitalize font-bold">
                      {topic}
                    </label>
                  </div>
                </th>
                {data.map((d, index) => (
                  <td
                    key={`${d["Drug Name"]}-${topic}-${index}`}
                    className="px-6 py-4 align-text-top"
                  >
                    <FormatText text={d[topic] || "N/A"} />
                  </td>
                ))}
                {/* Render new plan data as columns */}
                {Object.keys(newPlanData).map((planName) => (
                  <td
                    key={`${planName}-${topic}`}
                    className="px-6 py-4 align-text-top"
                  >
                    {topic === "Safety" || topic === "Efficacy" ? (
                      <FormatText text={newPlanData[planName][topic.toLowerCase()] || "N/A"} />
                    ) : (
                      newPlanData[planName][topic.toLowerCase()] || "N/A"
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Your Plan Dialog */}
      <Dialog open={planDialogOpen} onOpenChange={setPlanDialogOpen}>
        <DialogContent className="bg-white">
          <DialogTitle>Add Your Plan</DialogTitle>
          <DialogDescription>
            Add a new plan with drug name, safety, efficacy, and modality.
          </DialogDescription>
          <div className="space-y-4">
            <Input
              value={newPlan.drugName}
              onChange={(e) =>
                setNewPlan({ ...newPlan, drugName: e.target.value })
              }
              placeholder="Drug Name"
              className="w-full p-2 border border-gray-200 rounded-[12px] text-gray-800 focus:border-[#a6ce39] focus:ring-[#a6ce39] hover:border-[#a6ce39] transition duration-200 ease-in-out"
            />
            <Input
              value={newPlan.safety}
              onChange={(e) =>
                setNewPlan({ ...newPlan, safety: e.target.value })
              }
              placeholder="Safety"
              className="w-full p-2 border border-gray-200 rounded-[12px] text-gray-800 focus:border-[#a6ce39] focus:ring-[#a6ce39] hover:border-[#a6ce39] transition duration-200 ease-in-out"
            />
            <Input
              value={newPlan.efficacy}
              onChange={(e) =>
                setNewPlan({ ...newPlan, efficacy: e.target.value })
              }
              placeholder="Efficacy"
              className="w-full p-2 border border-gray-200 rounded-[12px] text-gray-800 focus:border-[#a6ce39] focus:ring-[#a6ce39] hover:border-[#a6ce39] transition duration-200 ease-in-out"
            />
            {/* Modality Dropdown */}
            <div>
              <label htmlFor="modality" className="block text-gray-700 mb-1">
                Modality
              </label>
              <select
                id="modality"
                value={newPlan.modality}
                onChange={(e) =>
                  setNewPlan({ ...newPlan, modality: e.target.value })
                }
                className="w-full p-2 border border-gray-200 rounded-[12px] text-gray-800 focus:border-[#a6ce39] focus:ring-[#a6ce39] hover:border-[#a6ce39] transition duration-200 ease-in-out"
              >
                <option value="">Select Modality</option>
                <option value="Biologics">Biologics</option>
                <option value="Small Molecule">Small Molecule</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleSubmitPlan}
              disabled={isSubmitting}
              className="bg-[#a6ce39] text-white hover:bg-[#95b833] rounded-[12px]"
            >
              {isSubmitting ? "Adding..." : "Add Plan"}
            </Button>
            <Button
              onClick={() => setPlanDialogOpen(false)}
              variant="outline"
              className="bg-white text-[#a6ce39] border border-[#a6ce39] hover:bg-[#f0f8e5] flex items-center rounded-lg gap-2"
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
