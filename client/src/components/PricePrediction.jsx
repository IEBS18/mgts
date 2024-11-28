'use client'

import React from 'react';
import { useLocation } from 'react-router-dom';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function CompetitorAnalysis() {
    const location = useLocation();
    //   const { predicted_price, chart_data, competitor_details } = location.state;
    const { data, payload } = location.state;

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Competitor Analysis</h1>

            <div className="mb-8 flex flex-row gap-x-2">
                <Card className='w-1/2 p-2'>
                  {/* <CardHeader>
                    <CardTitle>
                    Input Details
                    </CardTitle>
                  </CardHeader> */}
                   <CardContent>
                   <p className="text-2xl font-bold"> Disease: {(payload.disease_name)}</p>
                   <p className="text-2xl font-bold"> Country: {(payload.country)}</p>
                   <p className="text-2xl font-bold"> Quality of Life: {(payload.quality_of_life)}</p>
                   <p className="text-2xl font-bold"> Mortality: {(payload.mortality)}</p>
                   <p className="text-2xl font-bold"> Morbidity: {(payload.morbidity)}</p>
                   <p className="text-2xl font-bold"> Safety: {(payload.safety)}</p>
                   <p className="text-2xl font-bold"> Efficacy: {(payload.efficacy)}</p>
                   </CardContent>
                    {/* <h3></h3>
                    <pre>{JSON.stringify(payload, null, 2)}</pre> */}
                </Card>
                <Card className='w-1/2 p-2'>
                    <CardHeader>
                        <CardTitle>Predicted Price</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">${(data.predicted_price).toFixed(2)}</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="mb-8">
                <CardHeader>
                    <CardTitle>Top 10 Competitor Prices</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={data.chart_data}
                                margin={{
                                    top: 20,
                                    right: 30,
                                    left: 20,
                                    bottom: 60,
                                }}
                                barSize={120}
                            >
                                <defs>
                                    <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#a6ce39" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#a6ce39" stopOpacity={0.1} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="TradeName" textAnchor="middle" interval={0} />
                                <YAxis label={{ value: 'Price ($)', angle: -90, position: 'insideLeft' }} />
                                <Tooltip
                                    formatter={(value, name) => [`$${value.toFixed(2)}`, name]}
                                />
                                <Bar dataKey="Price" fill="url(#forecastGradient)" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Competitor Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Trade Name</TableHead>
                                <TableHead>Price ($)</TableHead>
                                <TableHead>Morbidity</TableHead>
                                <TableHead>Mortality</TableHead>
                                <TableHead>Safety</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {(data.competitor_details).map((competitor, index) => (
                                <TableRow key={index}>
                                    <TableCell>{competitor.TradeName}</TableCell>
                                    <TableCell>{competitor.Price.toFixed(2)}</TableCell>
                                    <TableCell>{competitor.Morbidity}</TableCell>
                                    <TableCell>{competitor.Mortality}</TableCell>
                                    <TableCell>{competitor.Safety}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

