"use client"

import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { ToastContainer, toast } from "react-toastify"
import { ArrowLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import RadialChart from "./RadialChart"
import BenchmarkTable from "./BenchmarkTable"
import "./custom.css"

export default function BenchmarkAnalysisPage() {
  const navigate = useNavigate()
  const [pieChartData, setPieChartData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch pie chart data
  const fetchPieChartData = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/pie-chart`, {
        headers: {
          "Content-Type": "application/json",
        },
      })
      const data = await response.json()
      if (data.error) {
        toast.error(data.error)
      } else {
        setPieChartData(data.pie_chart_data)
      }
    } catch (error) {
      console.error("Error fetching pie chart:", error)
      toast.error("Failed to update pie chart")
    }
    setIsLoading(false)
  }

  useEffect(() => {
    fetchPieChartData()
  }, [])

  const handleWeightsUpdate = (weights, updatedPieChartData) => {
    if (updatedPieChartData) {
      setPieChartData(updatedPieChartData)
    }
  }

  const handleBackClick = () => {
    navigate(-1)
  }

  return (
    <div className="p-6 bg-background min-h-screen">
      <ToastContainer position="top-right" autoClose={5000} />

      <div className="max-w-[1400px] mx-auto">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={handleBackClick}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-3xl font-bold text-foreground">Benchmark Analysis</h1>
            </div>
            <p className="text-muted-foreground">
              Adjust weights and analyze disease benchmarks
            </p>
          </div>
        </header>

        {isLoading ? (
          <div className="flex items-center justify-center h-[400px]">
            <Loader2 className="animate-spin mr-2 h-6 w-6 text-primary" />
            <span>Loading benchmark data...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="h-[400px]">
              <RadialChart data={pieChartData} />
            </div>
            <div className="h-[450px]">
              <BenchmarkTable onWeightsUpdate={handleWeightsUpdate} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
