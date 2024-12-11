"use client"

import React, { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function DrugList({ allDrugs, drugsByType, onSelect, selectedDrugs, therapeuticArea, setTherapeuticArea }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const drugsPerPage = 9

  const filteredDrugs =
    therapeuticArea === "All Therapeutic Areas"
      ? allDrugs.filter((drug) =>
          drug.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : drugsByType[therapeuticArea]?.filter((drug) =>
          drug.name.toLowerCase().includes(searchTerm.toLowerCase())
        ) || []

  const paginatedDrugs = filteredDrugs.slice(
    (currentPage - 1) * drugsPerPage,
    currentPage * drugsPerPage
  )

  const totalPages = Math.ceil(filteredDrugs.length / drugsPerPage)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Drug List</CardTitle>
        <CardDescription>Select drugs to include in your list.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-4">
            <Select onValueChange={setTherapeuticArea} value={therapeuticArea}>
              <SelectTrigger className="w-[300px] bg-white">
                <SelectValue placeholder="All Therapeutic Areas" />
              </SelectTrigger>
              <SelectContent className="bg-gray-100">
                {Object.keys(drugsByType).map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              placeholder="Search drugs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-xs"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            {paginatedDrugs.map((drug) => (
              <div
                key={drug.id}
                className={`border rounded-md bg-green-50 p-4 cursor-pointer ${
                  selectedDrugs.some((d) => d.id === drug.id)
                    ? "border-green-600"
                    : "border-gray-300"
                }`}
                onClick={() => onSelect(drug)}
              >
                <p className="text-sm font-medium text-center">{drug.name}</p>
              </div>
            ))}
          </div>

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
