"use client";

import React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Sidebar({
  selectedDrugs,
  selectedDiseases,
  selectedState,
  selectedPlans,
  onRemoveDrug,
  onRemoveDisease,
  onRemovePlan,
  onViewResults,
  clearAllDrugs,
  clearAllDiseases,
  clearAllPlans,
  loading,
}) {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-4 text-dark-green">Filters</h2>
        <div>
          <h3 className="font-medium mb-2 text-dark-green">State</h3>
          <p className="text-sm text-gray-600">{selectedState}</p>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-medium text-dark-green">Selected Drugs</h3>
          {selectedDrugs.length > 0 && (
            <Button
              onClick={clearAllDrugs}
              className="text-sm font-medium bg-[#a6ce39] text-white hover:bg-[#95b833] rounded-[12px] w-auto"
            >
              Clear All
            </Button>
          )}
        </div>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {selectedDrugs.length === 0 ? (
            <p className="text-sm text-gray-500">No drugs selected.</p>
          ) : (
            selectedDrugs.map((drug) => (
              <div key={drug.id} className="flex items-center justify-between">
                <span className="text-[12px]">{drug.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveDrug(drug)}
                  className="p-0"
                >
                  <X className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            ))
          )}
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-medium text-dark-green">Selected Diseases</h3>
          {selectedDiseases.length > 0 && (
            <Button
              onClick={clearAllDiseases}
              className="text-sm font-medium bg-[#a6ce39] text-white hover:bg-[#95b833] rounded-[12px] w-auto"
            >
              Clear All
            </Button>
          )}
        </div>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {selectedDiseases.length === 0 ? (
            <p className="text-sm text-gray-500">No diseases selected.</p>
          ) : (
            selectedDiseases.map((disease) => (
              <div key={disease} className="flex items-center justify-between">
                <span className="text-[12px]">{disease}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveDisease(disease)}
                  className="p-0"
                >
                  <X className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            ))
          )}
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-medium text-dark-green">Selected Plans</h3>
          {selectedPlans.length > 0 && (
            <Button
              onClick={clearAllPlans}
              className="text-sm font-medium bg-[#a6ce39] text-black hover:bg-[#95b833] rounded-[12px] w-auto"
            >
              Clear All
            </Button>
          )}
        </div>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {selectedPlans.length === 0 ? (
            <p className="text-sm text-gray-500">No plans selected.</p>
          ) : (
            selectedPlans.map((plan) => (
              <div key={plan.id} className="flex items-center justify-between">
                <span className="text-[12px]">{plan.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemovePlan(plan)}
                  className="p-0"
                >
                  <X className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            ))
          )}
        </div>
      </div>

      <Button
        onClick={onViewResults}
        disabled={loading}
        className={`text-md font-semibold text-black bg-[#a6ce39] hover:bg-[#95b833] rounded-[12px] w-full ${
          loading ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {loading ? "Loading..." : "View Results"}
      </Button>
    </div>
  );
}
