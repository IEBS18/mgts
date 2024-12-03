'use client';

import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid } from 'recharts';
import { scaleLinear } from 'd3-scale'
import { Heatmap } from '@ant-design/plots';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from 'react-router-dom';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

// Donut Chart Component
const DonutChart = ({ data }) => {
    const total = data.reduce((sum, entry) => sum + entry.value, 0); // Compute total dynamically

    return (
        <Card className="w-full h-full p-3">
            <CardHeader>
                <CardTitle>Top Diseases</CardTitle>
                <CardDescription>Distribution of top diseases treated</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                    <PieChart>
                        <Legend
                            height={36}
                            iconType="circle"
                            layout="horizontal"
                            verticalAlign="bottom"
                            iconSize={10}
                            padding={2}
                        />
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            innerRadius={120}
                            outerRadius={150}
                            fill="#8884d8"
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            formatter={(value, name) => [
                                `${((value / total) * 100).toFixed(2)}%`,
                                name,
                            ]}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
};

// Bubble Chart Component

const BubbleChart = ({ data }) => {
    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const { TradeName, Disease, Annual_Therapy_Costs, Size } = payload[0].payload;
            return (
                <div className="p-2 bg-white border border-gray-300 rounded shadow-md">
                    <p><strong>Drug Name:</strong> {TradeName},{Size}</p>
                    <p><strong>Disease:</strong> {Disease}</p>
                    <p><strong>Annual Therapy Cost:</strong> ${Annual_Therapy_Costs.toLocaleString()}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <Card className="w-full h-full p-3">
            <CardHeader>
                <CardTitle>Annual Therapy Costs</CardTitle>
                <CardDescription>Therapy Costs vs Disease</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                        <CartesianGrid />
                        <XAxis type="category" dataKey="Disease" name="Disease" />
                        <YAxis type="number" dataKey="Annual_Therapy_Costs" name="Cost ($)" />
                        <Tooltip content={<CustomTooltip />} />
                        <Scatter
                            name="Therapy Costs"
                            data={data}
                            fill="#8884d8"
                            line={{ stroke: "#8884d8" }}
                            lineJointType="round"
                        />
                    </ScatterChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
};


const HeatmapChart = ({ data }) => {
    const margin = { top: 50, right: 70, bottom: 80, left: 100 }
    const cellWidth = 200
    const cellHeight = 60

    // Transform data for the heatmap dynamically for both structures
    const heatmapData = Object.entries(data).map(([score, drugs]) => ({
        score: parseFloat(score),
        drugs
    }));

    // Create color scale
    const colorScale = scaleLinear()
        .domain([0, 1])  // Assuming the data values range from 0 to 1
        .range(['#4169E1', '#DC143C']);

    return (
        <Card className="w-full h-full p-3">
            <CardHeader>
                <CardTitle>Competitive Matrix of Drugs</CardTitle>
                <CardDescription>Adverse events score vs drug name with morbidity values</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="w-full h-[400px] relative">
                    <svg width="100%" height="100%" viewBox={`0 0 ${margin.left + heatmapData.length * cellWidth + margin.right} ${margin.top + cellHeight + margin.bottom}`} preserveAspectRatio="xMidYMid meet">
                        <g transform={`translate(${margin.left},${margin.top})`}>
                            {heatmapData.map((entry, i) => (
                                Object.entries(entry.drugs).map(([drugName, morbidity], j) => (
                                    <g key={`${entry.score}-${drugName}`} transform={`translate(${i * cellWidth}, ${j * (cellHeight + 20)})`}>
                                        {/* Cell background */}
                                        <rect
                                            width={cellWidth}
                                            height={cellHeight}
                                            fill={colorScale(morbidity)}
                                            stroke="#fff"
                                            strokeWidth={2}
                                        />
                                        {/* Cell value */}
                                        <text
                                            x={cellWidth / 2}
                                            y={cellHeight / 2}
                                            textAnchor="middle"
                                            dominantBaseline="middle"
                                            fill="#fff"
                                            fontSize={16}
                                            fontWeight="bold"
                                        >
                                            {morbidity.toFixed(2)}
                                        </text>
                                        {/* X-axis label */}
                                        {j === 0 && (
                                            <text
                                                x={cellWidth / 2}
                                                y={cellHeight + 30}
                                                textAnchor="middle"
                                                fill="#000"
                                                fontSize={12}
                                            >
                                                {entry.score.toFixed(2)}
                                            </text>
                                        )}
                                    </g>
                                ))
                            ))}
                            {/* Y-axis labels for drug names */}
                            {Object.entries(heatmapData[0].drugs).map(([drugName], index) => (
                                <text
                                    key={index}
                                    transform={`translate(${-margin.left + 20}, ${(index + 0.5) * (cellHeight + 20)}) rotate(-90)`}
                                    textAnchor="middle"
                                    fill="#000"
                                    fontSize={12}
                                >
                                    {drugName}
                                </text>
                            ))}
                            {/* X-axis title */}
                            <text
                                x={(heatmapData.length * cellWidth) / 2}
                                y={cellHeight + 60}
                                textAnchor="middle"
                                fill="#000"
                                fontSize={14}
                            >
                                Adverse Events Score
                            </text>
                        </g>
                    </svg>
                    {/* Legend for color scale */}
                    <div className="absolute top-0 right-0 p-4">
                        <div className="flex items-center">
                            <div className="w-12 h-4" style={{
                                background: `linear-gradient(to right, #4169E1, #DC143C)`
                            }}></div>
                            <span className="ml-2">Morbidity (0 to 1)</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};




// Main Page Component
const CompetitiveLandscapeDrugPage = () => {
    const location = useLocation();
    const { searchResults, diseaseName } = location.state || {};

    if (!searchResults) {
        return (
            <div className="spinner-container">
                <div className="lds-grid">
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                </div>
            </div>
        );
    }

    const { top_diseases_data, annual_therapy_data, adverse_events_data } = searchResults;
    console.log(searchResults);

    // Transform data for charts
    const donutChartData = Object.entries(top_diseases_data).map(([name, value]) => ({
        name,
        value,
    }));

    const bubbleChartData = annual_therapy_data.map(item => ({
        TradeName: item.TradeName,
        Annual_Therapy_Costs: item["Annual_Therapy_Costs(Numbers)"],
        Disease: item.Disease,
        Size: item.Size
    }));

    const heatmapData = Object.entries(adverse_events_data).flatMap(([score, drugs]) =>
        Object.entries(drugs).map(([TradeName, value]) => ({
            Adverse_Events_Score: parseFloat(score),
            TradeName,
            value,
        }))
    );

    return (
        <div className="space-y-8 p-8">
            <h1 className="text-3xl font-bold mb-4">Competitive Landscape for {diseaseName}</h1>
            <div className="flex flex-col gap-6">
                <DonutChart data={donutChartData} />
                <BubbleChart data={bubbleChartData} />
                {/* <HeatmapChart data={searchResults.adverse_events_data} /> */}
            </div>
        </div>
    );
};

export default CompetitiveLandscapeDrugPage;
