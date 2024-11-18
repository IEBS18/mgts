import React from 'react';
import {
    ComposedChart,
    Bar,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LabelList,
    Cell,
    Label
} from 'recharts';

const MarketAndPrevalenceForecast = ({
    isChatMinimized,
    diseaseName,
    years,
    forecast_years,
    combinedPrevalence,
    marketPredictions,
    marketSize,
}) => {
    // Prepare the data by combining years with their respective values
    const allYears = [...years, ...forecast_years];
    const data = allYears.map((year, index) => ({
        year,
        marketSize: index < marketSize.length ? marketSize[index] : marketPredictions[index - marketSize.length],
        prevalence: combinedPrevalence[index],
        isForecast: index >= marketSize.length, // True if it's a forecasted year
    }));

    return (
        <div className={`w-${!isChatMinimized ? "2/3" : "full"} space-y-4 bg-white border border-[#a6ce39] rounded-[12px] p-6 shadow-lg overflow-y-auto scrollbar-hide max-h-[80vh] pb-6`}>
            <h1 className="text-2xl font-bold text-gray-800">
                Market Size Forecast for: <span className="text-[#a6ce39]">{diseaseName}</span>
            </h1>
            <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={data} margin={{ top: 20, right: 40, bottom: 20, left: 20 }}>
                    <defs>
                        {/* Define linear gradients */}
                        <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#a6ce39" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#a6ce39" stopOpacity={0.1} />
                        </linearGradient>
                        <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#29c4f8" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#29c4f8" stopOpacity={0.1} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#f5f5f5" />
                    <XAxis
                        dataKey="year"
                        axisLine={true}
                        tickLine={true}
                    >
                        <Label value="Year" offset={-10} position="insideBottom" />
                    </XAxis>

                    {/* Left Y-axis for Market Size */}
                    <YAxis
                        yAxisId="left"
                        tickFormatter={(value) => (value / 1e9).toFixed(1) + 'B'} // Display values in billions
                        axisLine={true} // Enable axis line
                        tickLine={true} // Enable tick lines
                    >
                        <Label
                            value="Market Size (USD)" // Label for Market Size axis
                            angle={-90} // Rotate label 90 degrees
                            position="insideLeft" // Position inside on the left
                            style={{ textAnchor: 'middle' }} // Center-align the label horizontally
                            offset={1} // Adjust the label's position slightly
                        />
                    </YAxis>

                    {/* Right Y-axis for Prevalence Rate */}
                    {/* <YAxis
                        yAxisId="right"
                        orientation="right"
                        domain={[0, Math.max(...combinedPrevalence)]} // Match the range based on data
                        axisLine={true} // Enable axis line
                        tickLine={true} // Enable tick lines
                    >
                        <Label
                            value="Prevalence Rate" // Label for Prevalence Rate axis
                            angle={-90} // Rotate label 90 degrees
                            position="insideRight" // Position inside on the right
                            style={{ textAnchor: 'middle' }} // Center-align label horizontally and set text color
                            offset={1} // Adjust the label's position slightly
                        />
                    </YAxis> */}


                    <Tooltip
                        content={({ payload, label }) => {
                            if (payload && payload.length) {
                                const { marketSize, prevalence } = payload[0].payload; // Access the current data point
                                return (
                                    <div className="custom-tooltip" style={{ backgroundColor: '#fff', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}>
                                        <p><strong>Year: </strong>{label}</p> {/* Display the year */}
                                        <p><strong>Market Size: </strong>{marketSize ? '$' + (marketSize.toFixed(3)) : 'N/A'}</p> {/* Display Market Size */}
                                        {/* <p><strong>Prevalence Rate: </strong>{prevalence ? prevalence.toFixed(6) : 'N/A'}</p> Display Prevalence Rate */}
                                    </div>
                                );
                            }
                            return null;
                        }}
                        formatter={(value) => value.toLocaleString()} // Format the tooltip values for readability
                        wrapperStyle={{ outline: 'none' }} // Optional: Style to remove outline
                    />

                    <Legend
                        verticalAlign="top"
                        payload={[
                            { id: 'actual', value: 'Actual Market Size', type: 'square', color: '#29c4f8' },
                            { id: 'forecast', value: 'Forecasted Market Size', type: 'square', color: '#a6ce39' },
                            // { id: 'prevalence', value: 'Prevalence Rate', type: 'line', color: '#82ca9d' }
                        ]}
                    />

                    {/* Bars for Market Size - Different colors based on actual vs. forecast */}
                    <Bar
                        yAxisId="left"
                        dataKey="marketSize"
                        name="Market Size"
                    >
                        {
                            data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.isForecast ? "url(#forecastGradient)" : "url(#actualGradient)"} // Orange for forecast, yellow for actual
                                />
                            ))
                        }
                        {/* <LabelList dataKey="marketSize" position="top" formatter={(value) => value.toLocaleString()} /> */}
                    </Bar>

                    {/* Line for Prevalence Rate */}
                    {/* <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="prevalence"
                        stroke="#82ca9d"
                        dot={{ r: 3 }}
                        name="Prevalence Rate"
                    >
                        <LabelList dataKey="prevalence" position="top" formatter={(value) => value.toFixed(6)} />
                    </Line> */}
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
};

export default MarketAndPrevalenceForecast;
