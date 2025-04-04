"use client";

import React, { useState, useEffect } from 'react';
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

const TherapyCostForecast = ({ isChatMinimized, diseaseName, allData }) => {
    const countries = Object.keys(allData);
    const [selectedCountry, setSelectedCountry] = useState(countries[0]); // Default country
    const { all_years, combined_therapy_cost } = allData[selectedCountry] || {};

    useEffect(() => {
        // Update default country to the first in list if selectedCountry is invalid
        if (!allData[selectedCountry]) {
            setSelectedCountry(countries[0]);
        }
    }, [selectedCountry, countries, allData]);

    // Split actual and forecast data if data exists
    const splitIndex = all_years ? all_years.findIndex(year => parseInt(year) > 2023) : 0;
    const therapyCostData = all_years ? all_years.map((year, index) => ({
        year,
        actual: index < splitIndex ? combined_therapy_cost[index] : null,
        forecast: index >= splitIndex ? combined_therapy_cost[index] : null
    })) : [];

    // Max y-axis value for scaling
    const maxCost = combined_therapy_cost ? Math.max(...combined_therapy_cost) : 0;
    const roundedMaxCost = Math.ceil(maxCost / 10000) * 10000;

    return (
        <div className={`disease-card w-${!isChatMinimized ? "2/3" : "full"} space-y-4 bg-white border border-[#a6ce39] rounded-[12px] p-6 shadow-lg overflow-y-auto scrollbar-hide max-h-[80vh] pb-6`}>
            <div className='flex flex-row justify-between'>
            <h1 className="text-2xl font-bold text-gray-800">
                Therapy Cost Estimation for: <span className="text-[#a6ce39]">{diseaseName}</span>
            </h1>
            <div className="my-4">
                <label htmlFor="country-select" className="text-2xl font-bold text-gray-700 mr-2">Select Country:</label>
                <select
                    id="country-select"
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    className="border border-[#a6ce39] rounded-lg p-2"
                >
                    {countries.map((country) => (
                        <option key={country} value={country}>{country}</option>
                    ))}
                </select>
            </div>
            </div>
            <div className="h-[420px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={therapyCostData} margin={{ top: 20, right: 30, left: 20, bottom: 20}}>
                        <defs>
                            <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#29c4f8" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#29c4f8" stopOpacity={0.1} />
                            </linearGradient>
                            <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#a6ce39" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#a6ce39" stopOpacity={0.1} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year">
                            <Label value="Year" offset={-10} position="insideBottom" />
                        </XAxis>
                        <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}>
                            <Label value="Annual Therapy Cost (in USD)" angle={-90} position="insideLeft" offset={10} style={{ textAnchor: 'middle' }} />
                        </YAxis>
                        <Tooltip content={<ChartTooltipContent />} />
                        <Legend verticalAlign="top" />
                        <Area type="monotone" dataKey="actual" stackId="1" stroke="#29c4f8" fill="url(#colorActual)" name="Actual Therapy Cost" />
                        <Area type="monotone" dataKey="forecast" stackId="1" stroke="#a6ce39" fill="url(#colorForecast)" name="Forecast Therapy Cost" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default TherapyCostForecast;
