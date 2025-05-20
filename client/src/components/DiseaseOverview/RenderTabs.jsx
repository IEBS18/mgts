import React from 'react'
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import TabHeader from "./TabHeader";

const RenderTabs = ({tabs, setIsModalOpen, closeTab, activeTab, setActiveTab}) => {
  return (
    <div className="flex items-center border-b px-2 bg-white overflow-x-auto overflow-y-hidden">
      {tabs.map((tab) => (
        <TabHeader
          key={tab.id}
          label={tab.label}
          onClose={() => closeTab(tab.id)}
          onActivate={() => setActiveTab(tab.id)}
          isActive={activeTab === tab.id}
        />
      ))}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsModalOpen(true)}
        className="ml-2"
        aria-label="Add new tab"
      >
        <Plus className="h-4 w-4 text-gray-800" />
      </Button>
    </div>
  )
}

export default RenderTabs