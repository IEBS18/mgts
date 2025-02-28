import React, { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "react-toastify";

const FormularyComparison = () => {
    const location = useLocation();
    const { comparisonData, mainDrug } = location.state || {};
    const [visibleDrugs, setVisibleDrugs] = useState(comparisonData || []);

    return (
        <div className="w-full p-4">
            <h1 className="text-2xl font-bold mb-4">Formulary Drug Comparison</h1>
            <div className="overflow-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-6 py-3">Attribute</th>
                            {visibleDrugs.map((drug, index) => (
                                <th key={index} className="px-6 py-3">{drug["Drug Name"]}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {Object.keys(visibleDrugs[0] || {}).map((attribute) => (
                            <tr key={attribute} className="border-b">
                                <td className="px-6 py-4 font-semibold">{attribute}</td>
                                {visibleDrugs.map((drug, index) => (
                                    <td key={index} className="px-6 py-4">{drug[attribute]}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="mt-4">
                <Card className="w-1/2">
                    <CardHeader>
                        <CardTitle>Key Insights for {mainDrug}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>{comparisonData?.find(d => d["Drug Name"] === mainDrug)?.Insights || "No insights available."}</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default FormularyComparison;
