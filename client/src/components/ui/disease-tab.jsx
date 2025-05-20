"use client";


const DiseaseTab = ({
  diseaseInfo,
  allowedKeys,
  selectedTopics,
  handleTopicSelection,
  isDiseaseExporting,
  handleDiseaseExport,
  selectedDiseaseData,
  onSelectedRowsChange,
  isChatMinimized,
}) => {
  // Your existing DiseaseTab implementation, but without the buttons
  // for handleRelevantDrugsSearch, handleMarketEstimation, and handleTherapyCost

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-2xl font-bold mb-4">
        Disease Overview: <span className="text-[#a6ce39]">{diseaseInfo.Disease}</span>
      </h2>

      {/* Rest of your DiseaseTab implementation */}
      {/* ... */}

      {/* Export button and other functionality */}
      <div className="mt-4 flex justify-end">
        <button
          onClick={handleDiseaseExport}
          disabled={isDiseaseExporting || selectedDiseaseData.length === 0}
          className="bg-[#5c7a1f] hover:bg-[#4a6319] text-white px-4 py-2 rounded-md"
        >
          {isDiseaseExporting ? "Exporting..." : "Export Selected Rows"}
        </button>
      </div>
    </div>
  );
}

export default DiseaseTab;
