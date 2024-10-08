import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from "@/components/ui/button"

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  const maxPagesToShow = 5; // Maximum number of pages to show at once

  // Calculate the range of pages to display
  const startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
  const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
  const pageNumbers = [];

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return (
    <nav className="flex justify-center items-center space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-2 py-1 bg-black text-white hover:bg-white hover:text-black"
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="sr-only">Previous</span>
      </Button>
      
      {pageNumbers.map((number, index) => (
        <Button
          key={index}
          variant={currentPage === number ? "default" : "outline"}
          size="sm"
          onClick={() => onPageChange(number)}
          className={`px-3 py-1 ${currentPage === number ? 'bg-white text-black' : 'bg-black text-white hover:bg-white hover:text-black'}`}
        >
          {number}
        </Button>
      ))}
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-2 py-1 bg-black text-white hover:bg-white hover:text-black"
      >
        <ChevronRight className="h-4 w-4" />
        <span className="sr-only">Next</span>
      </Button>
    </nav>
  )
}
