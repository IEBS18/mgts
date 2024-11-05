import React, {useState} from 'react';
import { Search, FileText, Activity } from 'lucide-react';

import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { Tooltip } from '@visx/tooltip';
import geoGraphyData from './custom.geo.json'; // Your GeoJSON file

const countryData = {
  "United States": {
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
const FeatureCard = ({ icon: Icon, title, description }) => (
  <div className="bg-white border border-[#a6ce39] rounded-lg p-4 shadow-sm h-full">
    <div className="flex items-center mb-2">
      <Icon className="w-5 h-5 text-[#a6ce39] mr-2 flex-shrink-0" />
      <h3 className="text-base font-semibold text-gray-800 leading-tight">{title}</h3>
    </div>
    <p className="text-sm text-gray-600">{description}</p>
  </div>
);

export default function Dashboard2() {
  const [tooltipContent, setTooltipContent] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [selectedCard, setSelectedCard] = useState(null);

  const handleMouseMove = (event) => {
    const { clientX, clientY } = event;
    setTooltipPosition({ x: clientX + 100, y: clientY });
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

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      <div className="flex-grow overflow-hidden p-6">
        {/* Header */}
        <div className="flex items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-800">
            Welcome to <span className="text-[#a6ce39]">ToolX</span>
          </h1>
          <span className="ml-3 px-2 py-1 bg-[#fff200] text-xs font-semibold rounded">
            BETA
          </span>
        </div>

        {/* Main Content */}
        <div className="flex h-[calc(100%-2rem)] gap-4">
          {/* Map Section */}
          <div className="flex-grow">
            <div className="bg-white border border-[#a6ce39] rounded-lg p-4 shadow-sm h-full">
              {/* <img
                src="/placeholder.svg?height=400&width=600"
                alt="World Map"
                className="w-full h-full object-contain"
              /> */}
              <div className="relative">
            <ComposableMap>
              <Geographies geography={geoGraphyData}>
                {({ geographies }) =>
                  geographies.map((geo) => (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      onMouseEnter={(event) => {
                        const { NAME } = geo.properties;
                        setTooltipContent(renderTooltipContent(NAME));
                        handleMouseMove(event);
                      }}
                      onMouseMove={handleMouseMove}
                      onMouseLeave={() => {
                        setTooltipContent(null);
                      }}
                      style={{
                        default: {
                          fill: countryData[geo.properties.NAME] ? '#95d524' : '#29c4f8',
                          outline: 'none'
                        },
                        hover: {
                          fill: "#04165d",
                          outline: 'none',
                        },
                        pressed: {
                          fill: '#04165d',
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
                  pointerEvents: 'none',
                  boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
                }}
              >
                {tooltipContent}
              </Tooltip>
            )}
            </div>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="w-1/3 space-y-4 overflow-y-auto pr-2 scrollbar-hide">
            <FeatureCard
              icon={Search}
              title="Search Drugs and Diseases"
              description="Find approved and pipeline drugs"
            />
            <FeatureCard
              icon={FileText}
              title="Research Paper and Patents"
              description="Find scientific research papers and patents"
            />
            <FeatureCard
              icon={Activity}
              title="Find Clinical Data"
              description="Access and analyze clinical trial data"
            />
          </div>
        </div>
      </div>
      <style jsx global>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}