"use client"

import { useState } from "react"
import ReactMarkdown from "react-markdown"
import { Button } from "@/components/ui/button"

export function TruncatedMarkdown({ content, maxLength = 200 }) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!content) return null

  // First, process the content to handle [[text]] highlighting
  const processedContent = content.replace(/\[\[(.*?)\]\]/g, (match, p1) => {
    return `<mark>${p1}</mark>`
  })

  // Determine if we need to truncate
  const shouldTruncate = processedContent.length > maxLength

  // Get the content to display based on expanded state
  const displayContent = isExpanded
    ? processedContent
    : shouldTruncate
      ? processedContent.slice(0, maxLength) + "..."
      : processedContent

  // Parse the content to separate regular text from marked text
  const parseContent = (text) => {
    const result = []
    let lastIndex = 0
    let index = 0

    // Find all <mark> tags and their closing </mark> tags
    const regex = /<mark>(.*?)<\/mark>/g
    let match

    while ((match = regex.exec(text)) !== null) {
      // Add the text before the <mark> tag
      if (match.index > lastIndex) {
        result.push({
          type: "text",
          content: text.substring(lastIndex, match.index),
          key: `text-${index++}`,
        })
      }

      // Add the highlighted text (without the <mark> tags)
      result.push({
        type: "highlight",
        content: match[1], // The content inside the <mark> tags
        key: `highlight-${index++}`,
      })

      lastIndex = match.index + match[0].length
    }

    // Add any remaining text after the last <mark> tag
    if (lastIndex < text.length) {
      result.push({
        type: "text",
        content: text.substring(lastIndex),
        key: `text-${index++}`,
      })
    }

    return result
  }

  // Parse the content into segments
  const segments = parseContent(displayContent)

  // Render each segment with appropriate styling
  const renderSegments = () => {
    return segments.map((segment) => {
      if (segment.type === "highlight") {
        return (
          <span key={segment.key} className="bg-yellow-100 px-1 py-0.5 rounded">
            {segment.content}
          </span>
        )
      } else {
        // For regular text, we still want to render markdown
        return (
          <span key={segment.key}>
            <ReactMarkdown>{segment.content}</ReactMarkdown>
          </span>
        )
      }
    })
  }

  return (
    <div className="prose prose-sm max-w-none dark:prose-invert">
      {renderSegments()}
      {shouldTruncate && (
        <Button onClick={() => setIsExpanded(!isExpanded)} variant="link" className="p-0 h-auto text-primary">
          {isExpanded ? "Show less" : "...Show more"}
        </Button>
      )}
    </div>
  )
}

export default TruncatedMarkdown
