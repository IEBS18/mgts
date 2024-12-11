"use client"

import React, { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function PlanList({ statePlans, usPlans, onSelect, selectedPlans }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedState, setSelectedState] = useState("All States") // Default to "All States"
  const [selectedFilter, setSelectedFilter] = useState("managed_medicaid")
  const plansPerPage = 12

  const filteredPlans =
    selectedState === "All States"
      ? usPlans["all states"]?.[selectedFilter]?.filter((plan) =>
          plan.name.toLowerCase().includes(searchTerm.toLowerCase())
        ) || []
      : statePlans[selectedState]?.[selectedFilter]?.filter((plan) =>
          plan.name.toLowerCase().includes(searchTerm.toLowerCase())
        ) || []

  const paginatedPlans = filteredPlans.slice(
    (currentPage - 1) * plansPerPage,
    currentPage * plansPerPage
  )

  const totalPages = Math.ceil(filteredPlans.length / plansPerPage)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Plan List</CardTitle>
        <CardDescription>Select plans to include in your list.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-4">
            {/* State Filter Dropdown */}
            <Select onValueChange={setSelectedState} value={selectedState}>
              <SelectTrigger className="w-[300px] bg-white">
                <SelectValue placeholder="All States" />
              </SelectTrigger>
              <SelectContent className="bg-gray-100">
                <SelectItem value="All States">All States</SelectItem>
                {Object.keys(statePlans).map((state) => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Search Bar */}
            <Input
              placeholder="Search plans..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-xs"
            />
          </div>

          {/* Filter by Plan Type */}
          <div className="flex gap-2">
            {["managed_medicaid", "medicare", "commercial", "hix"].map((filter) => (
              <Button
                key={filter}
                variant={selectedFilter === filter ? "default" : "outline"}
                onClick={() => setSelectedFilter(filter)}
              >
                {filter.replace("_", " ")}
              </Button>
            ))}
          </div>

          {/* Plan Cards */}
          <div className="grid grid-cols-3 gap-4">
            {paginatedPlans.map((plan) => (
              <div
                key={plan.id}
                className={`border rounded-md bg-green-50 p-4 cursor-pointer ${
                  selectedPlans.some((p) => p.id === plan.id)
                    ? "border-green-600"
                    : "border-gray-300"
                }`}
                onClick={() => onSelect(plan)}
              >
                <p className="text-sm font-medium text-center">{plan.name}</p>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          <div className="flex justify-between">
            <Button
              variant="secondary"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="secondary"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
