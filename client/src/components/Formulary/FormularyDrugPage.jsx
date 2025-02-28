import React, { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast, ToastContainer } from "react-toastify";

// Utility function to safely handle invalid values like NaN
const formatValue = (value) => {
  if (value === "NaN" || value === null || value === undefined || value === "") {
    return "Not Available"; // Return "Not Available" if value is invalid
  }
  return value;
};

// Flatten and sanitize all drugs across every disease key in list_competitor_drug
const flattenAndSanitizeDrugs = (listCompetitorDrug) => {
  if (!listCompetitorDrug) return [];

  const allDrugs = [];
  // Each key is a disease name: e.g. "Parkinson's disease", "Alzheimer's disease", etc.
  Object.keys(listCompetitorDrug).forEach((disease) => {
    const drugArray = listCompetitorDrug[disease] || [];
    drugArray.forEach((rawDrug) => {
      // Create a sanitized copy of the raw drug
      const sanitizedDrug = {};
      for (const [key, val] of Object.entries(rawDrug)) {
        sanitizedDrug[key] = formatValue(val);
      }
      allDrugs.push(sanitizedDrug);
    });
  });
  return allDrugs;
};

const FormularyDrugPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Retrieve the competitor drugs from state: { list_competitor_drug: {...}, drug: 'nd0612' }
  const { list_competitor_drug = {}, drug = "" } = location.state || {};

  // Flatten and sanitize the data
  const flattenedCompetitorDrugs = flattenAndSanitizeDrugs(list_competitor_drug);

  const [selectedResult, setSelectedResult] = useState(null); // Store the drug selected for details display
  const [dialogOpen, setDialogOpen] = useState(false);

  // Handler for opening the drug details dialog
  const handleOpenDialog = useCallback((drug) => {
    setSelectedResult(drug);
    setDialogOpen(true);
  }, []);

  // Handler if you want to do multi-select and compare
  const handleComparison = () => {
    // Currently, no multi-select is implemented, so just show a toast
    // or navigate to a comparison page if you wish
    toast.info("Comparison feature not implemented yet.");
  };

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

      {/* Title */}
      <div className="flex sticky items-center justify-between gap-x-4 pb-4 pt-2">
        <h1 className="text-2xl font-bold text-gray-800">Showing Competitor Drugs</h1>
        <div className="flex items-center justify-end gap-4">
          <Button
            onClick={handleComparison}
            className="bg-white text-black border border-black hover:bg-[#f0f8e5] flex items-center rounded-lg gap-2"
          >
            Compare Drugs
          </Button>
        </div>
      </div>

      {/* Drug Cards */}
      <div className="grid grid-cols-3 gap-4 mt-4">
        {flattenedCompetitorDrugs.map((drugItem, index) => (
          <Card
            key={index}
            className="bg-white border border-[#a6ce39] rounded-[12px] p-4 shadow-sm cursor-pointer relative"
            onClick={() => handleOpenDialog(drugItem)}
          >
            <div className="mt-2">
              <p className="text-black font-bold">
                {drugItem["Drug Name"]}{" "}
                {drugItem["Tier"] && `(${drugItem["Tier"]})`}
              </p>
              {drugItem["Drug Type"] && (
                <p>
                  <strong className="font-semibold">Drug Type:</strong> {drugItem["Drug Type"]}
                </p>
              )}
              {drugItem["Modality"] && (
                <p>
                  <strong className="font-semibold">Modality:</strong> {drugItem["Modality"]}
                </p>
              )}
              {drugItem["Tier"] && (
                <p>
                  <strong className="font-semibold">Tier:</strong> {drugItem["Tier"]}
                </p>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Drug Detail Dialog */}
      {dialogOpen && selectedResult && (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-white scrollbar-hide">
            <DialogTitle className="font-bold text-2xl">
              Drug Overview:{" "}
              <strong className="text-[#a6ce39]">
                {selectedResult["Drug Name"]}
              </strong>
            </DialogTitle>
            <DialogDescription>
              {Object.keys(selectedResult).map((key) => {
                // Skip non-relevant fields like 'PDF_Name' or 'Warnings'
                if (key === "PDF_Name" || key === "Warnings and precautions for use") return null;

                const label = key.replace(/_/g, " ");
                let value = selectedResult[key];

                // Handle multiline values (like Efficacy and Safety) by splitting them
                if (key === "Efficacy" || key === "Safety") {
                  value = value.split("\n").map((item, index) => (
                    <span key={index}>
                      {item}
                      <br />
                    </span>
                  ));
                }

                return value ? (
                  <p key={key}>
                    <strong>{label}:</strong> {value}
                  </p>
                ) : null;
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
  );
};

export default FormularyDrugPage;
