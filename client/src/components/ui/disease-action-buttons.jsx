"use client";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";

export function DiseaseActionButtons({
  onRelevantDrugsClick,
  onMarketEstimationClick,
  onTherapyCostClick,
  isSearching,
  isSearchingCP,
  isSearchingCT,
  className,
}) {
  return (
    <div className={cn("flex flex-wrap gap-3 mb-4", className)}>
      <Button
        onClick={onRelevantDrugsClick}
        disabled={isSearching}
        className="bg-[#5c7a1f] hover:bg-[#4a6319] text-white font-medium px-4 py-2 rounded-md transition-all duration-200 flex-grow md:flex-grow-0 min-w-[180px]"
      >
        {isSearching ? "Loading..." : "Show Relevant Drugs"}
      </Button>

      <Button
        onClick={onMarketEstimationClick}
        disabled={isSearchingCP}
        className="bg-[#5c7a1f] hover:bg-[#4a6319] text-white font-medium px-4 py-2 rounded-md transition-all duration-200 flex-grow md:flex-grow-0 min-w-[180px]"
      >
        {isSearchingCP ? "Loading..." : "Market Estimation"}
      </Button>

      <Button
        onClick={onTherapyCostClick}
        disabled={isSearchingCT}
        className="bg-[#5c7a1f] hover:bg-[#4a6319] text-white font-medium px-4 py-2 rounded-md transition-all duration-200 flex-grow md:flex-grow-0 min-w-[180px]"
      >
        {isSearchingCT ? "Loading..." : "Therapy Cost Estimation"}
      </Button>
    </div>
  );
}
