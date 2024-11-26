import React, { useState, useEffect } from 'react';
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
    Cell,
    Label
} from 'recharts';
import millify from "millify";

const MarketAndPrevalenceForecast = ({
    isChatMinimized,
    diseaseName,
    data // Pass the entire data response from /market-estimation as 'data' prop
}) => {
    // Extract the list of countries from data keys
    const countries = Object.keys(data);

    // State to track the selected country and the relevant data
    const [selectedCountry, setSelectedCountry] = useState(countries[0]); // Default to the first country in the list
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        if (selectedCountry) {
            // Update the chart data based on the selected country
            const countryData = data[selectedCountry];
            const allYears = [...countryData.years, ...countryData.forecast_years];
            const newData = allYears.map((year, index) => ({
                year,
                marketSize: index < countryData.market_size.length ? countryData.market_size[index] : countryData.market_forecast[index - countryData.market_size.length],
                prevalence: countryData.combined_prevalence ? countryData.combined_prevalence[index] : null,
                isForecast: index >= countryData.market_size.length,
            }));
            setChartData(newData);
        }
    }, [selectedCountry, data]);

    // Handle country change
    const handleCountryChange = (event) => {
        setSelectedCountry(event.target.value);
    };

    return (
        <div className={`w-${!isChatMinimized ? "2/3" : "full"} space-y-4 bg-white border border-[#a6ce39] rounded-[12px] p-6 shadow-lg overflow-y-auto scrollbar-hide max-h-[80vh] pb-6`}>
            <div className='flex flex-row justify-between'>
            <h1 className="text-2xl font-bold text-gray-800">
                Market Size Forecast for: <span className="text-[#a6ce39]">{diseaseName}</span>
            </h1>

            {/* Dropdown for selecting country */}
            <div className="mb-4">
                <label htmlFor="country-select" className="text-2xl font-bold text-gray-700 mr-2">Select Country:</label>
                <select
                    id="country-select"
                    value={selectedCountry}
                    onChange={handleCountryChange}
                    className="border border-[#a6ce39] rounded-lg p-2"
                >
                    {countries.map((country) => (
                        <option key={country} value={country}>
                            {country}
                        </option>
                    ))}
                </select>
            </div>
            </div>

            <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={chartData} margin={{ top: 20, right: 40, bottom: 20, left: 20 }}>
                    <defs>
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
                    <XAxis dataKey="year" axisLine tickLine>
                        <Label value="Year" offset={-10} position="insideBottom" />
                    </XAxis>
                    <YAxis
                        yAxisId="left"
                        tickFormatter={(value) => (value / 1e9).toFixed(1) + 'B'}
                        axisLine tickLine
                    >
                        <Label
                            value="Market Size (USD)"
                            angle={-90}
                            position="insideLeft"
                            style={{ textAnchor: 'middle' }}
                            offset={1}
                        />
                    </YAxis>

                    <Tooltip
                        content={({ payload, label }) => {
                            if (payload && payload.length) {
                                const { marketSize, prevalence } = payload[0].payload;
                                return (
                                    <div className="custom-tooltip" style={{ backgroundColor: '#fff', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}>
                                        <p><strong>Year: </strong>{label}</p>
                                        <p><strong>Market Size: </strong>{marketSize ? '$' + millify(marketSize) : 'N/A'}</p>
                                        {/* <p><strong>Prevalence Rate: </strong>{prevalence ? prevalence.toFixed(6) : 'N/A'}</p> */}
                                    </div>
                                );
                            }
                            return null;
                        }}
                        wrapperStyle={{ outline: 'none' }}
                    />

                    <Legend
                        verticalAlign="top"
                        payload={[
                            { id: 'actual', value: 'Actual Market Size', type: 'square', color: '#29c4f8' },
                            { id: 'forecast', value: 'Forecasted Market Size', type: 'square', color: '#a6ce39' },
                        ]}
                    />

                    <Bar yAxisId="left" dataKey="marketSize" name="Market Size">
                        {chartData.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={entry.isForecast ? "url(#forecastGradient)" : "url(#actualGradient)"}
                            />
                        ))}
                    </Bar>
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
};

export default MarketAndPrevalenceForecast;
