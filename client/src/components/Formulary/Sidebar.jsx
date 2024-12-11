"use client"

import React from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Sidebar({ therapeuticArea, selectedDrugs, selectedState, selectedPlans, onRemoveDrug, onRemovePlan, onViewResults }) {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-4">Filters</h2>
        <div>
          <h3 className="font-medium mb-2">Therapeutic Area</h3>
          <p className="text-sm text-gray-600">{therapeuticArea}</p>
        </div>
        <div>
          <h3 className="font-medium mb-2">State</h3>
          <p className="text-sm text-gray-600">{selectedState}</p>
        </div>
      </div>

      <div>
        <h3 className="font-medium mb-2">Selected Drugs</h3>
        <div className="space-y-2">
          {selectedDrugs.map((drug) => (
            <div key={drug.id} className="flex items-center justify-between">
              <span>{drug.name}</span>
              <Button variant="ghost" size="sm" onClick={() => onRemoveDrug(drug)}>
                <X className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-medium mb-2">Selected Plans</h3>
        <div className="space-y-2">
          {selectedPlans.map((plan) => (
            <div key={plan.id} className="flex items-center justify-between">
              <span>{plan.name}</span>
              <Button variant="ghost" size="sm" onClick={() => onRemovePlan(plan)}>
                <X className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <Button
        className="w-full bg-green-500 text-white hover:bg-green-600"
        onClick={onViewResults}
      >
        View Results
      </Button>
    </div>
  )
}
