
// src/components/TabHeader.jsx

import React from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { cn } from "@/utils/cn"; // Ensure this path is correct

const TabHeader = ({ label, onClose, onActivate, isActive }) => {
  return (
    <div
      className={cn(
        "flex items-center px-4 py-2 border-r cursor-pointer whitespace-nowrap",
        isActive
          ? "bg-white border-b-2 border-[#a6ce39]"
          : "bg-gray-100 hover:bg-gray-200",
        "transition-colors duration-200"
      )}
      onClick={onActivate} // Activates the tab when clicked
    >
      <span className="mr-2 font-semibold text-gray-800">{label}</span>
      <Button
        variant="ghost"
        size="sm"
        className="p-0 h-5 w-5"
        onClick={(e) => {
          e.stopPropagation(); // Prevents triggering onActivate
          onClose();
        }}
        aria-label={`Close ${label} tab`}
      >
        <X className="h-4 w-4 text-gray-800" />
      </Button>
    </div>
  );
};

export default TabHeader;