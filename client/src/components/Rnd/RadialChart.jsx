// "use client"

// import { useState } from "react"
// import { TrendingUp, Maximize2, X, Download, Loader2 } from "lucide-react"
// import { LabelList, RadialBar, RadialBarChart, PolarAngleAxis } from "recharts"
// import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
// import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
// import { Button } from "@/components/ui/button"

// function RadialChart({
//   data,
//   onDataUpdate,
//   width = 250,         // Default width
//   height = 250,        // Default height
//   innerRadius = 30,    // Default inner radius
//   outerRadius = 130,   // Default outer radius
//   barSize = 20,        // Default bar size
// }) {
//   const [isModalOpen, setIsModalOpen] = useState(false)
//   const [isLoading, setIsLoading] = useState(false)
//   const [error, setError] = useState(null)
//   const reversedData = data ? [...data].reverse() : []

//   const transformedData = reversedData
//     ? reversedData.map((item, index) => {
//         const chartColors = [
//           "hsl(139, 65%, 20%)", // --chart-1
//           "hsl(140, 74%, 44%)", // --chart-2
//           "hsl(142, 88%, 28%)", // --chart-3
//           "hsl(137, 55%, 15%)", // --chart-4
//           "hsl(141, 40%, 9%)",  // --chart-5
//         ]
//         return {
//           browser: item.name,
//           visitors: item.value,
//           fill: chartColors[index % chartColors.length],
//         }
//       })
//     : []

//   const chartConfig = {
//     visitors: {
//       label: "Score",
//     },
//     ...(reversedData?.reduce((config, item, index) => {
//       const chartColors = [
//         "hsl(139, 65%, 20%)", // --chart-1
//         "hsl(140, 74%, 44%)", // --chart-2
//         "hsl(142, 88%, 28%)", // --chart-3
//         "hsl(137, 55%, 15%)", // --chart-4
//         "hsl(141, 40%, 9%)",  // --chart-5
//       ]
//       config[index + 1] = {
//         label: item.name,
//         color: chartColors[index % chartColors.length],
//       }
//       return config
//     }, {}) || {}),
//   }

//   const CustomTooltipContent = ({ active, payload }) => {
//     if (active && payload && payload.length) {
//       return (
//         <div className="bg-white p-2 border border-gray-200 rounded shadow-sm">
//           <p className="font-medium capitalize">{payload[0].payload.browser}</p>
//           <p className="text-sm">Score: {payload[0].value}</p>
//         </div>
//       )
//     }
//     return null
//   }

//   const downloadChart = () => {
//     const svgElement = document.querySelector(".chart-container svg")
//     if (!svgElement) {
//       console.error("SVG element not found")
//       return
//     }

//     const svgClone = svgElement.cloneNode(true)
//     svgClone.setAttribute("style", "background-color: white;")

//     const titleElement = document.createElementNS("http://www.w3.org/2000/svg", "text")
//     titleElement.setAttribute("x", "50%")
//     titleElement.setAttribute("y", "20")
//     titleElement.setAttribute("text-anchor", "middle")
//     titleElement.setAttribute("font-family", "Arial")
//     titleElement.setAttribute("font-size", "16")
//     titleElement.setAttribute("font-weight", "bold")
//     titleElement.textContent = "Top 5 Diseases by Score"
//     svgClone.appendChild(titleElement)

//     const textElements = svgClone.querySelectorAll("text")
//     textElements.forEach((text) => {
//       text.setAttribute("fill", "black")
//       text.setAttribute("style", "font-family: Arial; visibility: visible;")
//     })

//     const labelElements = svgClone.querySelectorAll(".recharts-label")
//     labelElements.forEach((label) => {
//       label.setAttribute("fill", "white")
//       label.setAttribute("style", "font-family: Arial; visibility: visible;")
//     })

//     const svgData = new XMLSerializer().serializeToString(svgClone)

//     const canvas = document.createElement("canvas")
//     const ctx = canvas.getContext("2d")

//     const img = new Image()
//     img.onload = () => {
//       canvas.width = img.width
//       canvas.height = img.height
//       ctx.fillStyle = "white"
//       ctx.fillRect(0, 0, canvas.width, canvas.height)
//       ctx.drawImage(img, 0, 0)

//       if (reversedData && reversedData.length > 0) {
//         const legendY = canvas.height - 80
//         ctx.font = "12px Arial"
//         ctx.fillStyle = "black"
//         ctx.fillText("Legend:", 20, legendY)

//         reversedData.forEach((item, index) => {
//           const chartColors = [
//             "hsl(139, 65%, 20%)", // --chart-1
//             "hsl(140, 74%, 44%)", // --chart-2
//             "hsl(142, 88%, 28%)", // --chart-3
//             "hsl(137, 55%, 15%)", // --chart-4
//             "hsl(141, 40%, 9%)",  // --chart-5
//           ]
//           const y = legendY + 20 + index * 20
//           const color = chartColors[index % chartColors.length]
//           ctx.fillStyle = color
//           ctx.fillRect(20, y - 10, 15, 15)

//           ctx.fillStyle = "black"
//           ctx.fillText(`${item.name}: ${item.value}`, 45, y)
//         })
//       }

//       const pngFile = canvas.toDataURL("image/png")
//       const downloadLink = document.createElement("a")
//       downloadLink.download = "disease-chart.png"
//       downloadLink.href = pngFile
//       downloadLink.click()
//     }

//     img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)))
//     img.crossOrigin = "anonymous"
//   }

//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center h-full">
//         <Loader2 className="animate-spin mr-2 h-5 w-5 text-primary" />
//         <span>Loading chart data...</span>
//       </div>
//     )
//   }

//   if (error) {
//     return <div className="text-destructive p-4">Error: {error}</div>
//   }

//   return (
//     <Card className="flex flex-col h-full shadow-md bg-white">
//       <CardHeader className="items-center pb-2 bg-[#f9faf5]">
//         <div className="flex justify-between items-center w-full">
//           <CardTitle className="text-xl font-semibold">Top 5 Diseases to Explore</CardTitle>
//           <div className="flex gap-2">
//             <Button variant="outline" size="sm" className="h-8 w-8 p-0 rounded-full" onClick={downloadChart}>
//               <Download className="h-4 w-4" />
//               <span className="sr-only">Download</span>
//             </Button>
//             <Button
//               variant="outline"
//               size="sm"
//               className="h-8 w-8 p-0 rounded-full"
//               onClick={() => setIsModalOpen(true)}
//             >
//               <Maximize2 className="h-4 w-4" />
//               <span className="sr-only">Maximize</span>
//             </Button>
//           </div>
//         </div>
//       </CardHeader>
//       <CardContent className="flex-1 pb-0 chart-container flex items-center justify-center">
//         {reversedData && reversedData.length > 0 && (
//           <ChartContainer config={chartConfig} className="mx-auto w-[250px] h-[250px] aspect-square max-h-[250px] mt-10">
//             <RadialBarChart
//               data={transformedData}
//               width={width}
//               height={height}
//               startAngle={180}
//               endAngle={0}
//               innerRadius={innerRadius}
//               outerRadius={outerRadius}
//               barSize={barSize}
//             >
//                 <PolarAngleAxis type="number" domain={[0, 5]} tick={false} />
//               <ChartTooltip cursor={false} content={<CustomTooltipContent />} />
//               <RadialBar dataKey="visitors" background={{ fill: "#fff" }} cornerRadius={5}>
//                 <LabelList
//                   position="insideStart"
//                   dataKey="browser"
//                   className="fill-white capitalize mix-blend-luminosity text-[10px] font-medium"
//                   formatter={(value) => value}
//                   style={{
//                     backgroundColor: "white",
//                     padding: "2px 4px",
//                     borderRadius: "2px",
//                     textTransform: "capitalize",
//                   }}
//                 />
//               </RadialBar>
//             </RadialBarChart>
//           </ChartContainer>
//         )}
//       </CardContent>
//       <CardFooter className="flex-col gap-2 text-sm mt-[-80px]">
//         <div className="flex items-center gap-2 font-medium leading-none">
//           Top diseases by score <TrendingUp className="h-4 w-4" />
//         </div>
//         <div className="leading-none text-muted-foreground">Showing top 5 diseases based on current weights</div>
//       </CardFooter>

//       {/* Modal for maximized view */}
//       {isModalOpen && (
//         <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
//           <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl">
//             <div className="p-4 border-b flex justify-between items-center">
//               <h3 className="text-xl font-semibold">Disease Distribution</h3>
//               <div className="flex gap-2">
//                 <Button variant="outline" size="sm" className="h-8 w-8 p-0 rounded-full" onClick={downloadChart}>
//                   <Download className="h-4 w-4" />
//                   <span className="sr-only">Download</span>
//                 </Button>
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   className="h-8 w-8 p-0 rounded-full"
//                   onClick={() => setIsModalOpen(false)}
//                 >
//                   <X className="h-4 w-4" />
//                   <span className="sr-only">Close</span>
//                 </Button>
//               </div>
//             </div>
//             <div className="p-6 h-[460px] chart-container">
//               <ChartContainer config={chartConfig} className="mx-auto aspect-square h-full mt-16">
//                 <RadialBarChart
//                   data={transformedData}
//                   startAngle={180}
//                   endAngle={0} // Changed from 380 to 180 to not make a full circle
//                   innerRadius={60}
//                   outerRadius={220}
//                   barSize={30}
//                 >
//                     <PolarAngleAxis type="number" domain={[0, 5]} tick={false} />
//                   <ChartTooltip cursor={false} content={<CustomTooltipContent />} />
//                   <RadialBar
//                     dataKey="visitors"
//                     background={{ fill: "white" }}
//                     cornerRadius={8}
//                     className="bg-white text-white"
//                   >
//                     <LabelList
//                       position="insideStart"
//                       dataKey="browser"
//                       className="fill-white capitalize mix-blend-luminosity text-sm font-medium"
//                       formatter={(value) => value}
//                       style={{
//                         backgroundColor: "white",
//                         padding: "2px 4px",
//                         borderRadius: "2px",
//                         textTransform: "capitalize",
//                       }}
//                     />
//                   </RadialBar>
//                 </RadialBarChart>
//               </ChartContainer>
//             </div>
//             <div className="p-4 border-t">
//               <div className="flex-col gap-2 text-sm">
//                 <div className="flex items-center gap-2 font-medium leading-none">
//                   Top diseases by score <TrendingUp className="h-4 w-4" />
//                 </div>
//                 <div className="leading-none text-muted-foreground mt-2">
//                   Showing top 5 diseases based on current weights
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </Card>
//   )
// }

// export default RadialChart


"use client"

import { useState } from "react"
import { TrendingUp, Maximize2, X, Loader2 } from "lucide-react"
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { Button } from "@/components/ui/button"

function RadialChart({ data, onDataUpdate, width = 300, height = 300, outerRadius = 120 }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const reversedData = data ? [...data].reverse() : []

  // Check if data is null or empty
  const isDataLoading = !data || data.length === 0

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

  if (isLoading || isDataLoading) {
    return (
      <Card className="flex flex-col h-full shadow-md bg-white">
        <CardHeader className="items-center pb-2 bg-[#f9faf5]">
          <div className="flex justify-between items-center w-full">
            <CardTitle className="text-xl font-semibold">Top 5 Diseases to Explore</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="h-8 w-8 p-0 rounded-full" disabled>
                <Maximize2 className="h-4 w-4" />
                <span className="sr-only">Maximize</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 p-6">
            <Loader2 className="animate-spin h-10 w-10 text-[#6b8e23]" />
            <p className="text-base font-medium text-[#6b8e23]">Loading chart data...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return <div className="text-destructive p-4">Error: {error}</div>
  }

  return (
    <Card className="flex flex-col h-full shadow-md bg-white">
      <CardHeader className="items-center pb-2 bg-[#f9faf5]">
        <div className="flex justify-between items-center w-full">
          <CardTitle className="text-xl font-semibold">Top 5 Diseases to Explore</CardTitle>
          <div className="flex gap-2">
            {/* <Button variant="outline" size="sm" className="h-8 w-8 p-0 rounded-full" onClick={downloadChart}>
              <Download className="h-4 w-4" />
              <span className="sr-only">Download</span>
            </Button> */}
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 rounded-full"
              onClick={() => setIsModalOpen(true)}
            >
              <Maximize2 className="h-4 w-4" />
              <span className="sr-only">Maximize</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 pb-0 chart-container flex items-center justify-center pt-4 px-4">
        {reversedData && reversedData.length > 0 && (
          <ChartContainer config={chartConfig} className="mx-auto w-full h-[300px] aspect-square">
            <RadarChart
              data={transformedData}
              width={width}
              height={height}
              outerRadius={outerRadius}
              margin={{ top: 30, right: 30, bottom: 30, left: 30 }}
            >
              <PolarAngleAxis
                dataKey="browser"
                tick={{
                  fill: "#333",
                  fontSize: 12,
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

      {/* Modal for maximized view */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-xl font-semibold">Disease Distribution</h3>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-full"
                  onClick={() => setIsModalOpen(false)}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close</span>
                </Button>
              </div>
            </div>
            <div className="p-6 h-[440px] chart-container">
              <ChartContainer
                config={chartConfig}
                className="mx-auto aspect-square h-full [&_.recharts-legend-wrapper]:!bottom-0 [&_.recharts-legend-wrapper]:!position-relative [&_.recharts-wrapper]:pb-16"
              >
                <RadarChart
                  data={transformedData}
                  outerRadius={140}
                  margin={{ top: 40, right: 40, bottom: 80, left: 40 }}
                >
                  <PolarAngleAxis
                    dataKey="browser"
                    tick={{
                      fill: "#333",
                      fontSize: 10,
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
                      r: 6,
                      fill: (entry) => entry.fill,
                      fillOpacity: 1,
                      strokeWidth: 0,
                    }}
                  />
                  <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-4 flex-wrap px-4 py-2">
                    {transformedData.map((item, index) => (
                      <div key={index} className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.fill }} />
                        <span className="text-xs font-medium">{item.browser}</span>
                      </div>
                    ))}
                  </div>
                </RadarChart>
              </ChartContainer>
            </div>
            <div className="p-4 border-t">
              <div className="flex-col gap-2 text-sm">
                <div className="flex items-center gap-2 font-medium leading-none">
                  Top diseases by score <TrendingUp className="h-4 w-4" />
                </div>
                <div className="leading-none text-muted-foreground mt-2">
                  Showing top 5 diseases based on current weights
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}

export default RadialChart
