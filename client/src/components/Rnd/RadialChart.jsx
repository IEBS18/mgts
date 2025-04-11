// "use client"

// import { useState } from "react"
// import { TrendingUp, Maximize2, X, Download, Loader2 } from "lucide-react"
// import { LabelList, RadialBar, RadialBarChart } from "recharts"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
// import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
// import { Button } from "@/components/ui/button"
// import './custom.css' // Import your custom CSS file

// function RadialChart({ data, onDataUpdate }) {
//   const [isModalOpen, setIsModalOpen] = useState(false)
//   const [isLoading, setIsLoading] = useState(false)
//   const [error, setError] = useState(null)

//   // Transform the data for the radial chart
//   const transformedData = data
//     ? data.map((item, index) => {
//         // Define chart colors inline based on your global CSS
//         const chartColors = [
//           "hsl(139, 65%, 20%)", // --chart-1
//           "hsl(140, 74%, 44%)", // --chart-2
//           "hsl(142, 88%, 28%)", // --chart-3
//           "hsl(137, 55%, 15%)", // --chart-4
//           "hsl(141, 40%, 9%)", // --chart-5
//         ]

//         return {
//           browser: item.name,
//           visitors: item.value,
//           fill: chartColors[index % chartColors.length],
//         }
//       })
//     : []

//   // Create dynamic chart config based on the data
//   const chartConfig = {
//     visitors: {
//       label: "Score",
//     },
//     ...(data?.reduce((config, item, index) => {
//       // Define chart colors inline
//       const chartColors = [
//         "hsl(139, 65%, 20%)", // --chart-1
//         "hsl(140, 74%, 44%)", // --chart-2
//         "hsl(142, 88%, 28%)", // --chart-3
//         "hsl(137, 55%, 15%)", // --chart-4
//         "hsl(141, 40%, 9%)", // --chart-5
//       ]

//       config[index + 1] = {
//         label: item.name,
//         color: chartColors[index % chartColors.length],
//       }
//       return config
//     }, {}) || {}),
//   }

//   // Custom tooltip content to show disease name and score
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

//   // Function to download the chart as an image
//   const downloadChart = () => {
//     console.log('Download clicked')
  
//     // Find the SVG element
//     const svgElement = document.querySelector(".chart-container svg")
//     if (!svgElement) {
//       console.log("empty svg")
//       return
//     }
  
//     // Serialize the SVG element to string
//     const svgData = new XMLSerializer().serializeToString(svgElement)
  
//     // Create a new canvas to render the SVG
//     const canvas = document.createElement("canvas")
//     const ctx = canvas.getContext("2d")
    
//     // Create an image object
//     const img = new Image()
  
//     // Set the image onload handler
//     img.onload = () => {
//       // Set canvas width and height based on the image dimensions
//       canvas.width = img.width
//       canvas.height = img.height
  
//       // Draw the image onto the canvas
//       ctx.drawImage(img, 0, 0)
  
//       // Convert canvas to PNG format
//       const pngFile = canvas.toDataURL("image/png")
//       console.log('PNG created')
  
//       // Create a download link and trigger the download
//       const downloadLink = document.createElement("a")
//       downloadLink.download = "disease-chart.png"
//       downloadLink.href = pngFile
//       downloadLink.click()
//     }
  
//     // Ensure the SVG is well-formed with a white background
//     const svgWithBackground = svgData.replace(
//       '<svg',
//       `<svg xmlns="http://www.w3.org/2000/svg" style="background-color: white;" `
//     )
  
//     // Encode the SVG string and set the image source
//     img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgWithBackground)))
  
//     // Set cross-origin attributes for the image
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
//       <CardHeader className="items-center pb-0 bg-[#f9faf5]">
//         <div className="flex justify-between items-center w-full">
//           <CardTitle className="text-xl font-semibold">Top 5 Diseases to Explore</CardTitle>
//           <Button variant="outline" size="sm" className="h-8 w-8 p-0 rounded-full" onClick={() => setIsModalOpen(true)}>
//             <Maximize2 className="h-4 w-4" />
//             <span className="sr-only">Maximize</span>
//           </Button>
//         </div>
//         <CardDescription>Disease Distribution</CardDescription>
//       </CardHeader>
//       <CardContent className="flex-1 pb-0 chart-container">
//         {data && data.length > 0 && (
//           <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px]">
//             <RadialBarChart
//               data={transformedData}
//               startAngle={-90}
//               endAngle={180} // Changed from 380 to 180 to not make a full circle
//               innerRadius={30}
//               outerRadius={110}
//               barSize={20}
//             >
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
//       <CardFooter className="flex-col gap-2 text-sm">
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
//             <div className="p-6 h-[500px] chart-container">
//               <ChartContainer config={chartConfig} className="mx-auto aspect-square h-full">
//                 <RadialBarChart
//                   data={transformedData}
//                   startAngle={-90}
//                   endAngle={180} // Changed from 380 to 180 to not make a full circle
//                   innerRadius={60}
//                   outerRadius={220}
//                   barSize={30}
//                 >
//                   <ChartTooltip cursor={false} content={<CustomTooltipContent />} />
//                   <RadialBar dataKey="visitors" background={{ fill: "white" }} cornerRadius={8} className="bg-white text-white">
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
import { TrendingUp, Maximize2, X, Download, Loader2 } from "lucide-react"
import { LabelList, RadialBar, RadialBarChart, PolarAngleAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { Button } from "@/components/ui/button"

function RadialChart({ data, onDataUpdate }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
//   reverse the data
  const reversedData = data ? [...data].reverse() : []
  // Transform the data for the radial chart
  const transformedData = reversedData
    ? reversedData.map((item, index) => {
        // Define chart colors inline based on your global CSS
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

  // Create dynamic chart config based on the data
  const chartConfig = {
    visitors: {
      label: "Score",
    },
    ...(reversedData?.reduce((config, item, index) => {
      // Define chart colors inline
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

  // Custom tooltip content to show disease name and score
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

  // Function to download the chart as an image with labels
  const downloadChart = () => {
    // Find the SVG element
    const svgElement = document.querySelector(".chart-container svg")
    if (!svgElement) {
      console.error("SVG element not found")
      return
    }

    // Create a clone of the SVG to modify
    const svgClone = svgElement.cloneNode(true)

    // Add a white background to the SVG
    svgClone.setAttribute("style", "background-color: white;")

    // Add a title to the SVG
    const titleElement = document.createElementNS("http://www.w3.org/2000/svg", "text")
    titleElement.setAttribute("x", "50%")
    titleElement.setAttribute("y", "20")
    titleElement.setAttribute("text-anchor", "middle")
    titleElement.setAttribute("font-family", "Arial")
    titleElement.setAttribute("font-size", "16")
    titleElement.setAttribute("font-weight", "bold")
    titleElement.textContent = "Top 5 Diseases by Score"
    svgClone.appendChild(titleElement)

    // Ensure all text elements are visible
    const textElements = svgClone.querySelectorAll("text")
    textElements.forEach((text) => {
      text.setAttribute("fill", "black")
      text.setAttribute("style", "font-family: Arial; visibility: visible;")
    })

    // Ensure labels are visible
    const labelElements = svgClone.querySelectorAll(".recharts-label")
    labelElements.forEach((label) => {
      label.setAttribute("fill", "white")
      label.setAttribute("style", "font-family: Arial; visibility: visible;")
    })

    // Serialize the SVG element to string
    const svgData = new XMLSerializer().serializeToString(svgClone)

    // Create a new canvas to render the SVG
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")

    // Create an image object
    const img = new Image()

    // Set the image onload handler
    img.onload = () => {
      // Set canvas width and height based on the image dimensions
      canvas.width = img.width
      canvas.height = img.height

      // Draw the image onto the canvas
      ctx.fillStyle = "white"
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0)

      // Add legend at the bottom
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

          // Convert HSL to RGB for canvas
          const color = chartColors[index % chartColors.length]
          ctx.fillStyle = color
          ctx.fillRect(20, y - 10, 15, 15)

          ctx.fillStyle = "black"
          ctx.fillText(`${item.name}: ${item.value}`, 45, y)
        })
      }

      // Convert canvas to PNG format
      const pngFile = canvas.toDataURL("image/png")

      // Create a download link and trigger the download
      const downloadLink = document.createElement("a")
      downloadLink.download = "disease-chart.png"
      downloadLink.href = pngFile
      downloadLink.click()
    }

    // Encode the SVG string and set the image source
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)))

    // Set cross-origin attributes for the image
    img.crossOrigin = "anonymous"
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="animate-spin mr-2 h-5 w-5 text-primary" />
        <span>Loading chart data...</span>
      </div>
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
            <Button variant="outline" size="sm" className="h-8 w-8 p-0 rounded-full" onClick={downloadChart}>
              <Download className="h-4 w-4" />
              <span className="sr-only">Download</span>
            </Button>
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
        {/* <CardDescription>Disease Distribution</CardDescription> */}
      </CardHeader>
      <CardContent className="flex-1 pb-0 chart-container flex items-center justify-center">
        {reversedData && reversedData.length > 0 && (
          <ChartContainer config={chartConfig} className="mx-auto w-[250px] h-[250px] aspect-square max-h-[250px] mt-10">
            <RadialBarChart
              data={transformedData}
              width={250}            /* ← NEW */
              height={250}           /* ← NEW */
              startAngle={180}
              endAngle={0}
              innerRadius={30}
              outerRadius={130}
              barSize={20}
            >
                <PolarAngleAxis type="number" domain={[0, 5]} tick={false} />
              <ChartTooltip cursor={false} content={<CustomTooltipContent />} />
              <RadialBar dataKey="visitors" background={{ fill: "#fff" }} cornerRadius={5}>
                <LabelList
                  position="insideStart"
                  dataKey="browser"
                  className="fill-white capitalize mix-blend-luminosity text-[10px] font-medium"
                  formatter={(value) => value}
                  style={{
                    backgroundColor: "white",
                    padding: "2px 4px",
                    borderRadius: "2px",
                    textTransform: "capitalize",
                  }}
                />
              </RadialBar>
            </RadialBarChart>
          </ChartContainer>
        )}
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm mt-[-80px]">
        <div className="flex items-center gap-2 font-medium leading-none">
          Top diseases by score <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">Showing top 5 diseases based on current weights</div>
      </CardFooter>

      {/* Modal for maximized view */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-xl font-semibold">Disease Distribution</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="h-8 w-8 p-0 rounded-full" onClick={downloadChart}>
                  <Download className="h-4 w-4" />
                  <span className="sr-only">Download</span>
                </Button>
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
            <div className="p-6 h-[460px] chart-container">
              <ChartContainer config={chartConfig} className="mx-auto aspect-square h-full mt-16">
                <RadialBarChart
                  data={transformedData}
                  startAngle={180}
                  endAngle={0} // Changed from 380 to 180 to not make a full circle
                  innerRadius={60}
                  outerRadius={220}
                  barSize={30}
                >
                    <PolarAngleAxis type="number" domain={[0, 5]} tick={false} />
                  <ChartTooltip cursor={false} content={<CustomTooltipContent />} />
                  <RadialBar
                    dataKey="visitors"
                    background={{ fill: "white" }}
                    cornerRadius={8}
                    className="bg-white text-white"
                  >
                    <LabelList
                      position="insideStart"
                      dataKey="browser"
                      className="fill-white capitalize mix-blend-luminosity text-sm font-medium"
                      formatter={(value) => value}
                      style={{
                        backgroundColor: "white",
                        padding: "2px 4px",
                        borderRadius: "2px",
                        textTransform: "capitalize",
                      }}
                    />
                  </RadialBar>
                </RadialBarChart>
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
