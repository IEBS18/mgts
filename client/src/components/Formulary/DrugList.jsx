"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function DrugList({ drugs, onSelect, selectedDrugs }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const drugsPerPage = 9;

  // Filter out empty or whitespace drug names and apply search
  const filteredDrugs = drugs
    .filter(drug => drug && drug.trim() !== "")
    .filter((drug) =>
      drug.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const paginatedDrugs = filteredDrugs.slice(
    (currentPage - 1) * drugsPerPage,
    currentPage * drugsPerPage
  );

  const totalPages = Math.ceil(filteredDrugs.length / drugsPerPage);

  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-[#54681D]">Drug List</CardTitle>
        <CardDescription>Select drugs to include in your list.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="Search drugs..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset page on search
              }}
              className="max-w-xs rounded-[12px] border-[#d1d5db] border-2 focus:border-[#a6ce39] hover:border-[#a6ce39] h-10 px-4 py-2"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {paginatedDrugs.map((drug) => (
              <div
                key={drug} // Use drug name as key for uniqueness
                className={`border rounded-[12px] p-4 cursor-pointer transition-colors duration-200 ${
                  selectedDrugs.some(d => d.id === drug)
                    ? "border-green-600 bg-green-100"
                    : "border-gray-300 hover:bg-green-50"
                }`}
                onClick={() => onSelect({ name: drug })}
              >
                <p className="text-sm font-medium text-center">{drug}</p>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center">
            <Button
              variant="secondary"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="rounded-[12px] border-[#d1d5db] border-2 hover:border-[#a6ce39] h-10 px-4 py-2"
            >
              Previous
            </Button>
            <span className="text-sm font-medium">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="secondary"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="rounded-[12px] border-[#d1d5db] border-2 hover:border-[#a6ce39] h-10 px-4 py-2"
            >
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
