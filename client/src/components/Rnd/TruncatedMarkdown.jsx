// "use client"

// import { useState } from "react"
// import ReactMarkdown from "react-markdown"
// import { Button } from "@/components/ui/button"

// export function TruncatedMarkdown({ content, maxLength = 200 }) {
//   const [isExpanded, setIsExpanded] = useState(false)

//   if (!content) return null

//   // First, process the content to handle [[text]] highlighting
//   const processedContent = content.replace(/\[\[(.*?)\]\]/g, (match, p1) => {
//     return `<mark>${p1}</mark>`
//   })

//   // Determine if we need to truncate
//   const shouldTruncate = processedContent.length > maxLength

//   // Get the content to display based on expanded state
//   const displayContent = isExpanded
//     ? processedContent
//     : shouldTruncate
//       ? processedContent.slice(0, maxLength) + "..."
//       : processedContent

//   // Parse the content to separate regular text from marked text
//   const parseContent = (text) => {
//     const result = []
//     let lastIndex = 0
//     let index = 0

//     // Find all <mark> tags and their closing </mark> tags
//     const regex = /<mark>(.*?)<\/mark>/g
//     let match

//     while ((match = regex.exec(text)) !== null) {
//       // Add the text before the <mark> tag
//       if (match.index > lastIndex) {
//         result.push({
//           type: "text",
//           content: text.substring(lastIndex, match.index),
//           key: `text-${index++}`,
//         })
//       }

//       // Add the highlighted text (without the <mark> tags)
//       result.push({
//         type: "highlight",
//         content: match[1], // The content inside the <mark> tags
//         key: `highlight-${index++}`,
//       })

//       lastIndex = match.index + match[0].length
//     }

//     // Add any remaining text after the last <mark> tag
//     if (lastIndex < text.length) {
//       result.push({
//         type: "text",
//         content: text.substring(lastIndex),
//         key: `text-${index++}`,
//       })
//     }

//     return result
//   }

//   // Parse the content into segments
//   const segments = parseContent(displayContent)

//   // Render each segment with appropriate styling
//   const renderSegments = () => {
//     return segments.map((segment) => {
//       if (segment.type === "highlight") {
//         return (
//           <span key={segment.key} className="bg-yellow-100 px-1 py-0.5 rounded inline">
//             {segment.content}
//           </span>
//         )
//       } else {
//         // For regular text, we need to render markdown but prevent paragraph wrapping
//         return (
//           <span key={segment.key} >
//             <ReactMarkdown
//               components={{
//                 p: ({ children }) => <span >{children}</span>,
//               }}
//             >
//               {segment.content}
//             </ReactMarkdown>
//           </span>
//         )
//       }
//     })
//   }

//   return (
//     <div className="prose prose-sm max-w-none dark:prose-invert">
//       <span className="inline">{renderSegments()}</span>
//       {shouldTruncate && (
//         <Button onClick={() => setIsExpanded(!isExpanded)} variant="link" className="p-0 h-auto text-primary ml-1">
//           {isExpanded ? "Show less" : "...Show more"}
//         </Button>
//       )}
//     </div>
//   )
// }

// export default TruncatedMarkdown


"use client"

import { useState } from "react"
import ReactMarkdown from "react-markdown"
import { Button } from "@/components/ui/button"

export function TruncatedMarkdown({ content, maxLength = 200 }) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!content) return null

  // Process the content to handle the new color highlighting syntax
  // [red[text]], [blue[text]], [green[text]]
  const processContent = (text) => {
    const segments = []
    let lastIndex = 0
    let index = 0

    // Regex to match [color[text]] pattern
    const regex = /\[(red|blue|green|pink|yellow|purple|orange)\[(.*?)\]\]/g
    let match

    while ((match = regex.exec(text)) !== null) {
      // Add the text before the highlight
      if (match.index > lastIndex) {
        segments.push({
          type: "text",
          content: text.substring(lastIndex, match.index),
          key: `text-${index++}`,
        })
      }

      // Add the highlighted text with color information
      segments.push({
        type: "highlight",
        color: match[1], // The color (red, blue, or yellow)
        content: match[2], // The content inside the brackets
        key: `highlight-${index++}`,
      })

      lastIndex = match.index + match[0].length
    }

    // Add any remaining text after the last highlight
    if (lastIndex < text.length) {
      segments.push({
        type: "text",
        content: text.substring(lastIndex),
        key: `text-${index++}`,
      })
    }

    return segments
  }

  // Determine if we need to truncate
  const shouldTruncate = content.length > maxLength

  // Get the content to display based on expanded state
  const displayContent = isExpanded
    ? content
    : shouldTruncate
      ? content.slice(0, maxLength) + "..."
      : content

  // Parse the content into segments
  const segments = processContent(displayContent)

  // Get the appropriate background color class based on the color
  const getColorClass = (color) => {
    switch (color) {
      case "red":
        return "bg-red-100"
      case "blue":
        return "bg-blue-100"
      case "green":
        return "bg-green-100"
      case "pink":
        return "bg-pink-100"
      case "yellow":
        return "bg-yellow-100"  
      case "purple":
        return "bg-purple-100"
      case "orange":
        return "bg-orange-100"    
      default:
        return "bg-green-100" // Default fallback
    }
  }

  // Render each segment with appropriate styling
  const renderSegments = () => {
    return segments.map((segment) => {
      if (segment.type === "highlight") {
        return (
          <span 
            key={segment.key} 
            className={`${getColorClass(segment.color)} px-1 py-0.5 rounded inline`}
          >
            {segment.content}
          </span>
        )
      } else {
        // For regular text, we need to render markdown but prevent paragraph wrapping
        return (
          <span key={segment.key}>
            <ReactMarkdown
              components={{
                p: ({ children }) => <span>{children}</span>,
              }}
            >
              {segment.content}
            </ReactMarkdown>
          </span>
        )
      }
    })
  }

  return (
    <div className="prose prose-sm max-w-none dark:prose-invert">
      <span className="inline">{renderSegments()}</span>
      {shouldTruncate && (
        <Button 
          onClick={() => setIsExpanded(!isExpanded)} 
          variant="link" 
          className="p-0 h-auto text-primary ml-1"
        >
          {isExpanded ? "Show less" : "...Show more"}
        </Button>
      )}
    </div>
  )
}

export default TruncatedMarkdown
