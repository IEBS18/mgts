"use client";

import React from 'react';
import { Area, AreaChart, CartesianGrid, Label, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts";

import millify from "millify";

// Custom Tooltip Content for better formatting
const ChartTooltipContent = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="custom-tooltip bg-white p-2 border border-gray-300 rounded shadow">
                <p className="label">{`Year: ${label}`}</p>
                {payload.map((entry, index) => (
                    <p key={`tooltip-${index}`} style={{ color: entry.color }}>{`${entry.name}: $${millify(entry.value)}`}</p>
                ))}
            </div>
        );
    }
    return null;
};

const TherapyCostForecast = ({ isChatMinimized, diseaseName, allYears, combinedTherapyCost }) => {
    // Split actual and forecast data
    const splitIndex = allYears.findIndex(year => year > 2023); // Assuming 2023 is the last actual year
    const actualData = combinedTherapyCost.slice(0, splitIndex);
    const forecastData = combinedTherapyCost.slice(splitIndex);

    const therapyCostData = allYears.map((year, index) => ({
        year,
        actual: index < splitIndex ? combinedTherapyCost[index] : null,
        forecast: index >= splitIndex ? combinedTherapyCost[index] : null
    }));

    // Determine max y-axis value for scaling
    const maxCost = Math.max(...combinedTherapyCost);
    const roundedMaxCost = Math.ceil(maxCost / 10000) * 10000;

    return (
        <div className={`disease-card w-${!isChatMinimized ? "2/3" : "full"} space-y-4 bg-white border border-[#a6ce39] rounded-[12px] p-6 shadow-lg overflow-y-auto scrollbar-hide max-h-[80vh] pb-6`}>
            <h1 className="text-2xl font-bold text-gray-800">
                Therapy Cost Estimation for: <span className="text-[#a6ce39]">{diseaseName}</span>
            </h1>
            <div className="h-[420px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={therapyCostData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <defs>
                            <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--color-actual, #29c4f8)" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="var(--color-actual, #29c4f8)" stopOpacity={0.1} />
                            </linearGradient>
                            <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--color-forecast, #a6ce39)" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="var(--color-forecast, #a6ce39)" stopOpacity={0.1} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year">
                            <Label value="Year" offset={-10} position="insideBottom" />
                        </XAxis>
                        <YAxis domain={[0, roundedMaxCost]} tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}>
                            <Label value="Annual Therapy Cost (in USD)" angle={-90} position="insideLeft" style={{ textAnchor: 'middle' }} offset={10} />
                        </YAxis>
                        <Tooltip content={<ChartTooltipContent />} />
                        <Legend verticalAlign="top" />
                        <Area
                            type="monotone"
                            dataKey="actual"
                            stackId="1"
                            stroke="var(--color-actual, #29c4f8)"
                            fill="url(#colorActual)"
                            name="Actual Therapy Cost"
                        />
                        <Area
                            type="monotone"
                            dataKey="forecast"
                            stackId="1"
                            stroke="var(--color-forecast, #a6ce39)"
                            fill="url(#colorForecast)"
                            name="Forecast Therapy Cost"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default TherapyCostForecast;
