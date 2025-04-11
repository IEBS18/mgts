"use client"

import { useState } from "react"
import ReactMarkdown from "react-markdown"
import { Button } from "@/components/ui/button"

export function TruncatedMarkdown({ content, maxLength = 200 }) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!content) return null

  const displayContent = isExpanded ? content : content.slice(0, maxLength)
  const shouldTruncate = content.length > maxLength

  return (
    <div className="prose prose-sm max-w-none dark:prose-invert">
      <ReactMarkdown>{displayContent}</ReactMarkdown>
      {shouldTruncate && (
        <Button onClick={() => setIsExpanded(!isExpanded)} variant="link" className="p-0 h-auto text-primary">
          {isExpanded ? "Show less" : "...Show more"}
        </Button>
      )}
    </div>
  )
}
