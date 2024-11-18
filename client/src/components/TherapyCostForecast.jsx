"use client"

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Area, AreaChart, CartesianGrid, Label, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

const CustomDot = ({ cx, cy }) => {
    return <circle cx={cx} cy={cy} r={4} fill="green" stroke="white" strokeWidth={2} />
}

const TherapyCostForecast = ({ isChatMinimized, diseaseName, allYears, combinedTherapyCost }) => {
    const data = allYears.map((year, index) => ({
        year,
        cost: combinedTherapyCost[index]
    }))

    const maxCost = Math.max(...combinedTherapyCost)
    const roundedMaxCost = Math.ceil(maxCost / 10000) * 10000

    return (
        // <Card className="w-full max-w-full">
        //   <CardHeader>
        //     <CardTitle>{`Annual Therapy Cost Forecast for ${diseaseName}`}</CardTitle>
        //     <CardDescription>Actual and Forecast Costs</CardDescription>
        //   </CardHeader>
        //   <CardContent>
        <div className={`disease-card w-${!isChatMinimized ? "2/3" : "full"} space-y-4 bg-white border border-[#a6ce39] rounded-[12px] p-6 shadow-lg overflow-y-auto scrollbar-hide max-h-[80vh] pb-6`}>
            <h1 className="text-2xl font-bold text-gray-800">
                Therapy Cost Estimation for: <span className="text-[#a6ce39]">{diseaseName}</span>
            </h1>
            <div className="h-[420px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 30, right: 30, left: 0, bottom: 30 }}>
                        <defs>
                            <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#29c4f8" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#29c4f8" stopOpacity={0.1} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="year"
                            axisLine={true}
                            tickLine={true}
                        >
                            <Label value="Year" offset={-10} position="insideBottom" />
                        </XAxis>
                        <YAxis
                            domain={[0, roundedMaxCost]}
                            tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                            axisLine={true}
                            tickLine={true}
                        >
                            <Label
                                value="Annual Therapy Cost (in USD)"
                                angle={-90}
                                position="insideLeft"
                                style={{ textAnchor: 'middle' }}
                                offset={10}
                            />
                        </YAxis>
                        <Tooltip
                            formatter={(value) => [`$${Number(value).toLocaleString()}`, "Therapy Cost"]}
                            labelFormatter={(label) => `Year: ${label}`}
                        />
                        <Area
                            type="monotone"
                            dataKey="cost"
                            stroke="#29c4f8"
                            fill="url(#colorCost)"
                            dot={<CustomDot />}
                        />
                        {data.map((entry, index) => (
                            <text
                                key={`label-${index}`}
                                x={`${index * (100 / (data.length - 1))}%`}
                                y={entry.cost - 20}
                                textAnchor="middle"
                                fill="rgb(0, 0, 255)"
                                fontSize={12}
                            >
                                {Math.round(entry.cost).toLocaleString()}
                            </text>
                        ))}
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>

        //   </CardContent>
        // </Card>
    )
}

export default TherapyCostForecast