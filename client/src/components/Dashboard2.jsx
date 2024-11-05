import React, { useState } from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { Tooltip } from '@visx/tooltip';
import { feature } from 'topojson-client';
import geoGraphyData from './map.json'; // Your TopoJSON file

// Sample data for countries
const countryData = {
  "United States of America": {
    TradeName: 'MediCure',
    Price: 150,
    Disease: 'Influenza',
    Symptoms: 'Fever, cough, fatigue',
    Prevalence: '5%',
    Quality_of_Life: 'Moderate impact',
    Morbidity: 'Low',
    Mortality: 'Very low',
    Efficacy: 'High',
    Safety: 'Good',
    Adverse_Events: 'Rare',
    Annual_Therapy_Costs: 300,
    Age_Group: 'All ages',
    Gender: 'All',
    Type_of_Drug: 'Antiviral',
  },
  // Add more countries here
};

export default function Dashboard2() {
  const [tooltipContent, setTooltipContent] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (event) => {
    const { clientX, clientY } = event;
    setTooltipPosition({ x: clientX+100, y: clientY });
  };

  const renderTooltipContent = (country) => {
    if (!country || !countryData[country]) return null;

    const data = countryData[country];
    return (
      <div>
        <h3 className="font-bold text-center mb-2">{country}</h3>
        <table className="min-w-full text-left text-sm">
          <tbody>
            {Object.entries(data).map(([key, value]) => (
              <tr key={key}>
                <td className="pr-2 font-semibold">{key}:</td>
                <td>{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const geographies = feature(geoGraphyData, geoGraphyData.objects.countries).features;

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">

      <main className="flex-grow container mx-auto p-4">
        <div className="bg-white rounded-lg shadow-lg mb-6">
          <h2 className="text-2xl font-semibold pt-2 pl-2">Interactive Disease Map</h2>
          <div className="relative">
            <ComposableMap className='h-3/4'>
              <Geographies geography={geoGraphyData}>
                {({ geographies }) =>
                  geographies.map((geo) => (
                    <Geography
                      key={geo.id}
                      geography={geo}
                      onMouseEnter={(event) => {
                        const { name } = geo.properties;
                        setTooltipContent(renderTooltipContent(name));
                        handleMouseMove(event);
                      }}
                      onMouseMove={handleMouseMove}
                      onMouseLeave={() => {
                        setTooltipContent(null);
                      }}
                      style={{
                        default: {
                          fill: countryData[geo.properties.name] ? '#F53' : '#D6D6DA',
                          outline: 'none',
                        },
                        hover: {
                          fill: '#F53',
                          outline: 'none',
                        },
                        pressed: {
                          fill: '#E42',
                          outline: 'none',
                        },
                      }}
                    />
                  ))
                }
              </Geographies>
            </ComposableMap>
            {tooltipContent && (
              <Tooltip
                style={{
                  position: 'absolute',
                  top: tooltipPosition.y,
                  left: tooltipPosition.x,
                  transform: 'translate(-50%, -100%)',
                  backgroundColor: 'white',
                  color: 'black',
                  padding: '10px',
                  borderRadius: '5px',
                  fontSize: '14px',
                  pointerEvents: 'none', // Prevents blocking of mouse events
                  boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
                }}
              >
                {tooltipContent}
              </Tooltip>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
