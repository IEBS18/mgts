"use client"

import React, { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DrugList } from "./DrugList"
import { PlanList } from "./PlanList"
import { Sidebar } from "./Sidebar"
import drugsData from "../../assets/data/formulary/drugs.json"
import typewiseDrugsData from "../../assets/data/formulary/typewise_drugs.json"
import statePlansData from "../../assets/data/formulary/state_plans_data.json"
import usPlansData from "../../assets/data/formulary/US_plans_data.json"

export function Dashboard() {
  const [activeTab, setActiveTab] = useState("drug-list")
  const [selectedDrugs, setSelectedDrugs] = useState([])
  const [selectedPlans, setSelectedPlans] = useState([])
  const [therapeuticArea, setTherapeuticArea] = useState("All Therapeutic Areas")
  const [selectedState, setSelectedState] = useState("All States")

  const combinedDrugs = {
    "All Therapeutic Areas": drugsData["All Therapeutic Areas"] || [],
    ...typewiseDrugsData,
  }

  const combinedPlans = {
    "All States": usPlansData["all states"] || {},
    ...statePlansData,
  }

  const handleDrugSelect = (drug) => {
    setSelectedDrugs((prev) =>
      prev.some((d) => d.id === drug.id)
        ? prev.filter((d) => d.id !== drug.id) // Remove drug if already selected
        : [...prev, drug]
    )
  }

  const handlePlanSelect = (plan) => {
    setSelectedPlans((prev) =>
      prev.some((p) => p.id === plan.id)
        ? prev.filter((p) => p.id !== plan.id) // Remove plan if already selected
        : [...prev, plan]
    )
  }

  const handleRemoveDrug = (drug) => {
    setSelectedDrugs((prev) => prev.filter((d) => d.id !== drug.id))
  }

  const handleRemovePlan = (plan) => {
    setSelectedPlans((prev) => prev.filter((p) => p.id !== plan.id))
  }

  const handleViewResults = () => {
    const payload = {
      therapeuticArea,
      selectedDrugs,
      selectedState,
      selectedPlans,
    }

    fetch("/formulary", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then((response) => response.json())
      .then((data) => console.log("Submitted:", data))
      .catch((error) => console.error("Error:", error))
  }

  return (
    <div className="flex min-h-screen">
      <div className="flex-1 p-6">
        <Tabs defaultValue="drug-list" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="border-b w-full justify-start rounded-none h-auto p-0 bg-transparent">
            <TabsTrigger
              value="drug-list"
              className="data-[state=active]:border-healthcare-green data-[state=active]:text-healthcare-green data-[state=active]:font-bold border-b-2 border-transparent rounded-none"
            >
              Drug List
            </TabsTrigger>
            <TabsTrigger
              value="plan-list"
              className="data-[state=active]:border-healthcare-green data-[state=active]:text-healthcare-green data-[state=active]:font-bold border-b-2 border-transparent rounded-none"
            >
              Plan List
            </TabsTrigger>
          </TabsList>

          <TabsContent value="drug-list">
            <DrugList
              allDrugs={combinedDrugs["All Therapeutic Areas"]}
              drugsByType={combinedDrugs}
              onSelect={handleDrugSelect}
              selectedDrugs={selectedDrugs}
              therapeuticArea={therapeuticArea}
              setTherapeuticArea={setTherapeuticArea}
            />
          </TabsContent>

          <TabsContent value="plan-list">
            <PlanList
              statePlans={statePlansData}
              usPlans={usPlansData}
              onSelect={handlePlanSelect}
              selectedPlans={selectedPlans}
              selectedState={selectedState}
              setSelectedState={setSelectedState}
            />
          </TabsContent>
        </Tabs>
      </div>

      <div className="w-80 border-l bg-gray-100">
        <Sidebar
          therapeuticArea={therapeuticArea}
          selectedDrugs={selectedDrugs}
          selectedState={selectedState}
          selectedPlans={selectedPlans}
          onRemoveDrug={handleRemoveDrug}
          onRemovePlan={handleRemovePlan}
          onViewResults={handleViewResults}
        />
      </div>
    </div>
  )
}
