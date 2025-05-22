"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { ToastContainer, toast } from "react-toastify"
import { ArrowLeft, Loader2, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import BenchmarkTable from "./BenchmarkTable"
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts"
import { CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import "./custom.css"
import "react-toastify/dist/ReactToastify.css"

export default function BenchmarkAnalysisPage() {
  const navigate = useNavigate()
  const [pieChartData, setPieChartData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const radialChartRef = useRef(null)

  const [searchParams, setSearchParams] = useSearchParams()
  const weightsFromUrl = searchParams.get("weights")

  // Fetch pie chart data
  const fetchPieChartData = async () => {
    setIsLoading(true)
    try {
      let response
      if (weightsFromUrl) {
        response = await fetch(`${import.meta.env.VITE_API_URL}/api/pie-chart`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ weights: JSON.parse(weightsFromUrl) }),
        })
      } else {
        response = await fetch(`${import.meta.env.VITE_API_URL}/api/pie-chart`, {
          headers: {
            "Content-Type": "application/json",
          },
        })
      }
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

    // Update URL with new weights
    setSearchParams({ weights: JSON.stringify(weights) })

    // Smooth scroll to RadialChart
    if (radialChartRef.current) {
      radialChartRef.current.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }

  const handleBackClick = () => {
    // Instead of navigate(-1), navigate to the drug formulation page with the current weights
    const currentWeightsParam = searchParams.get("weights")

    // Navigate to the root path with the weights parameter and state
    navigate(`/rnd-formulation-drugs${currentWeightsParam ? `?weights=${currentWeightsParam}` : ""}`, {
      state: {
        selectedTabs: [
          "Disease",
          "Disease_Microbes",
          "Disease_Mechanism",
          "Drug_Microbes",
          "Drug_Mechanism",
          "Justification_for_Drug_Use",
          "Disease_Sources",
          "Drug_Sources",
        ],
      },
    })
  }

  const reversedData = pieChartData ? [...pieChartData].reverse() : []

  const transformedData = reversedData
    ? reversedData.map((item, index) => {
        const chartColors = [
          "hsl(139, 65%, 20%)", // --chart-1
          "hsl(140, 74%, 44%)", // --chart-2
          "hsl(142, 88%, 28%)", // --chart-3
          "hsl(137, 55%, 15%)", // --chart-4
          "hsl(141, 40%, 9%)", // --chart-5
        ]
        return {
          browser: item.name,
          visitors: item.value,
          fill: chartColors[index % chartColors.length],
        }
      })
    : []

  const chartConfig = {
    visitors: {
      label: "Score",
    },
    ...(reversedData?.reduce((config, item, index) => {
      const chartColors = [
        "hsl(139, 65%, 20%)", // --chart-1
        "hsl(140, 74%, 44%)", // --chart-2
        "hsl(142, 88%, 28%)", // --chart-3
        "hsl(137, 55%, 15%)", // --chart-4
        "hsl(141, 40%, 9%)", // --chart-5
      ]
      config[index + 1] = {
        label: item.name,
        color: chartColors[index % chartColors.length],
      }
      return config
    }, {}) || {}),
  }

  const CustomTooltipContent = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-gray-200 rounded shadow-sm">
          <p className="font-medium capitalize">{payload[0].payload.browser}</p>
          <p className="text-sm">Score: {payload[0].value}</p>
        </div>
      )
    }
    return null
  }

  const downloadChart = () => {
    const svgElement = document.querySelector(".chart-container svg")
    if (!svgElement) {
      console.error("SVG element not found")
      return
    }

    const svgClone = svgElement.cloneNode(true)
    svgClone.setAttribute("style", "background-color: white;")

    const titleElement = document.createElementNS("http://www.w3.org/2000/svg", "text")
    titleElement.setAttribute("x", "50%")
    titleElement.setAttribute("y", "20")
    titleElement.setAttribute("text-anchor", "middle")
    titleElement.setAttribute("font-family", "Arial")
    titleElement.setAttribute("font-size", "16")
    titleElement.setAttribute("font-weight", "bold")
    titleElement.textContent = "Top 5 Diseases by Score"
    svgClone.appendChild(titleElement)

    const textElements = svgClone.querySelectorAll("text")
    textElements.forEach((text) => {
      text.setAttribute("fill", "black")
      text.setAttribute("style", "font-family: Arial; visibility: visible;")
    })

    const labelElements = svgClone.querySelectorAll(".recharts-label")
    labelElements.forEach((label) => {
      label.setAttribute("fill", "white")
      label.setAttribute("style", "font-family: Arial; visibility: visible;")
    })

    const svgData = new XMLSerializer().serializeToString(svgClone)

    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")

    const img = new Image()
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx.fillStyle = "white"
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0)

      if (reversedData && reversedData.length > 0) {
        const legendY = canvas.height - 80
        ctx.font = "12px Arial"
        ctx.fillStyle = "black"
        ctx.fillText("Legend:", 20, legendY)

        reversedData.forEach((item, index) => {
          const chartColors = [
            "hsl(139, 65%, 20%)", // --chart-1
            "hsl(140, 74%, 44%)", // --chart-2
            "hsl(142, 88%, 28%)", // --chart-3
            "hsl(137, 55%, 15%)", // --chart-4
            "hsl(141, 40%, 9%)", // --chart-5
          ]
          const y = legendY + 20 + index * 20
          const color = chartColors[index % chartColors.length]
          ctx.fillStyle = color
          ctx.fillRect(20, y - 10, 15, 15)

          ctx.fillStyle = "black"
          ctx.fillText(`${item.name}: ${item.value}`, 45, y)
        })
      }

      const pngFile = canvas.toDataURL("image/png")
      const downloadLink = document.createElement("a")
      downloadLink.download = "disease-chart.png"
      downloadLink.href = pngFile
      downloadLink.click()
    }

    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)))
    img.crossOrigin = "anonymous"
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
            <p className="text-muted-foreground">Adjust weights and analyze disease benchmarks</p>
          </div>
        </header>

        {isLoading ? (
          <div className="flex items-center justify-center h-[400px]">
            <Loader2 className="animate-spin mr-2 h-6 w-6 text-primary" />
            <span>Loading benchmark data...</span>
          </div>
        ) : (
          // RadialChart sits ABOVE BenchmarkTable
          <div className="grid grid-cols-1 gap-12 mb-4">
            <div ref={radialChartRef} className="h-auto w-full mx-auto">
              <CardHeader className="items-center pb-2 bg-[#f9faf5] rounded-[12px]">
                <div className="flex justify-between items-center w-full">
                  <CardTitle className="text-xl font-semibold">Top 5 Diseases to Explore</CardTitle>
                  {/* <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0 rounded-full" onClick={downloadChart}>
                      <Download className="h-4 w-4" />
                      <span className="sr-only">Download</span>
                    </Button>
                  </div> */}
                </div>
              </CardHeader>
              <CardContent className="flex-1 pb-0 chart-container flex items-center justify-center pt-4 px-4">
                {reversedData && reversedData.length > 0 && (
                  <ChartContainer config={chartConfig} className="mx-auto w-full h-[400px] aspect-square">
                    <RadarChart
                      data={transformedData}
                      width={450}
                      height={450}
                      outerRadius={180}
                      margin={{ top: 40, right: 40, bottom: 40, left: 40 }}
                    >
                      <PolarAngleAxis
                        dataKey="browser"
                        tick={{
                          fill: "#333",
                          fontSize: 14,
                          fontWeight: "500",
                        }}
                        tickLine={false}
                      />
                      <PolarGrid />
                      <ChartTooltip cursor={false} content={<CustomTooltipContent />} />
                      <Radar
                        dataKey="visitors"
                        fill={transformedData.length > 0 ? transformedData[0].fill : "hsl(139, 65%, 20%)"}
                        fillOpacity={0.6}
                        stroke={transformedData.length > 0 ? transformedData[0].fill : "hsl(139, 65%, 20%)"}
                        dot={{
                          r: 4,
                          fill: (entry) => entry.fill,
                          fillOpacity: 1,
                          strokeWidth: 0,
                        }}
                      />
                    </RadarChart>
                  </ChartContainer>
                )}
              </CardContent>
              <CardFooter className="flex-col gap-2 text-sm mt-4">
                <div className="flex items-center gap-2 font-medium leading-none">
                  Top diseases by score <TrendingUp className="h-4 w-4" />
                </div>
                <div className="leading-none text-muted-foreground">
                  Showing top 5 diseases based on current weights
                </div>
              </CardFooter>
            </div>
            <BenchmarkTable
              onWeightsUpdate={handleWeightsUpdate}
              initialWeights={weightsFromUrl ? JSON.parse(weightsFromUrl) : null}
            />
          </div>
        )}
      </div>
    </div>
  )
}
