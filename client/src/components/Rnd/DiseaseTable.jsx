"use client";
import React from "react";
import { Loader2 } from "lucide-react";
import ReactSelect from "react-select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { TruncatedMarkdown } from "./TruncatedMarkdown";
import TruncatedMarkdown from "./TruncatedMarkdown";

const capitalizeName = (name) => {
  if (typeof name !== "string") {
    return name; // or return an empty string, or some other fallback behavior
  }

  return name
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
};

/* ------------------------------------------------------------------ */
/*  Dropdown                                                          */
/* ------------------------------------------------------------------ */
const DiseaseFilterDropdown = ({ diseases, selectedDisease, setSelectedDisease }) => {
  const diseaseOptions = [
    { value: "all", label: "All Diseases" },
    ...diseases
      .sort((a, b) => a.localeCompare(b))
      .map((d) => ({ value: d, label: capitalizeName(d) })),
  ];

  return (
    <ReactSelect
      value={diseaseOptions.find((o) => o.value === selectedDisease)}
      onChange={(o) => setSelectedDisease(o.value)}
      options={diseaseOptions}
      className="w-[480px] rounded-[12px] border-[#a6ce39] focus:ring-[#a6ce39] z-12"
      placeholder="Select disease"
      isSearchable
      styles={{
        menu: (p) => ({ ...p, zIndex: 20 }),
        control: (p, s) => ({
          ...p,
          borderColor: "#a6ce39",
          backgroundColor: "transparent",
          borderRadius: "16px",
          "&:hover": { borderColor: "#a6ce39" },
          boxShadow: s.isFocused ? "0 0 0 3px rgba(166,206,57,.2)" : "none",
        }),
        option: (p, s) => ({
          ...p,
          backgroundColor: s.isSelected
            ? "#a6ce39"
            : s.isFocused
            ? "#f1f8e9"
            : "transparent",
          color: s.isSelected ? "#fff" : "#000",
          "&:hover": { backgroundColor: "#a6ce39", color: "#fff" },
        }),
      }}
    />
  );
};

/* ------------------------------------------------------------------ */
/*  Cell renderer                                                      */
/* ------------------------------------------------------------------ */
const renderCellContent = (record, topic) => {
  const key = topic.toLowerCase();
  const content = record[key];
  if (!content) return null;


  // Handle comma‑separated list of URLs (PMC links or otherwise)
  if (typeof content === "string" && content.includes("http")) {
    const urls = content.split(",").map((u) => u.trim()).filter(Boolean);
    return urls.map((url, idx) => {
      const match = url.match(/PMC\d+/i); // extract PMC ID if present
      const label = match ? match[0] : url.replace(/^https?:\/\//, "");
      return (
        <React.Fragment key={idx}>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            {label}
          </a>
          {idx < urls.length - 1 && ", "}
        </React.Fragment>
      );
    });
  }

  // Multi‑line markdown → truncated preview
  // if (typeof content === "string" && content.includes("\n")) {
  //   return <TruncatedMarkdown content={content} />;
  // }
  if (typeof content === "string" && (content.includes("\n") || content.includes("<mark>"))) {
    return <TruncatedMarkdown content={content} />
  }

  return content;
};



/* ------------------------------------------------------------------ */
/*  Main table component                                               */
/* ------------------------------------------------------------------ */
export default function DiseaseTable({
  tableData,
  isLoading,
  sseError,
  orderedTabs,
  selectedDisease,
  setSelectedDisease,
  diseases,
}) {
  const filtered = selectedDisease === "all"
    ? tableData
    : tableData.filter((r) => r.disease === selectedDisease);

  return (
    <Card className="mb-8 shadow-md">
      <CardHeader className="pb-3 bg-[#f9faf5]">
        <div className="flex items-center justify-between">
          <CardTitle>Disease Data</CardTitle>
          <DiseaseFilterDropdown
            diseases={diseases}
            selectedDisease={selectedDisease}
            setSelectedDisease={setSelectedDisease}
          />
        </div>

        <div className="flex items-center gap-4 mt-2">
          {sseError && <p className="text-destructive text-sm">{sseError}</p>}
          {isLoading && (
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Loader2 className="animate-spin h-4 w-4" />
              <span>Loading data...</span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="border-t">
          <div className="h-[500px] overflow-x-auto">
            <table className="w-full min-w-max border-collapse">
              <thead>
                <tr className="bg-[#f5f8e8] sticky top-0 z-10">
                  {orderedTabs.map((t) => (
                    <th
                      key={t}
                      className="p-3 text-left text-xs font-medium uppercase tracking-wider whitespace-nowrap text-gray-700"
                      style={{ minWidth: "180px" }}
                    >
                      {t.replace(/_/g, " ")}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length ? (
                  filtered.map((rec, rIdx) => (
                    <tr
                      key={rIdx}
                      className="border-b border-border hover:bg-[#f9faf5] transition-colors"
                    >
                      {orderedTabs.map((topic) => (
                        <td
                          key={topic}
                          className="p-4 align-top w-[400px] max-w-[400px] text-sm"
                        >
                          {topic === "Disease"
                            ? capitalizeName(renderCellContent(rec, topic))
                            : renderCellContent(rec, topic)}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={orderedTabs.length}
                      className="p-6 text-center text-muted-foreground"
                    >
                      {isLoading
                        ? "Loading data..."
                        : "No data available for the selected filters."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
