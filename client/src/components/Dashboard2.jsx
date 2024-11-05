import React, { useState } from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { Tooltip } from '@visx/tooltip';
import { feature } from 'topojson-client';
import geoGraphyData from './map.json'; // Your TopoJSON file
import { motion } from 'framer-motion';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

const workflows = [
  {
    id: 1,
    title: "Search Drugs and Diseases",
    description: "Find approved and pipeline drugs",
  },
  {
    id: 2,
    title: "Research Paper and Patents",
    description: "Find scientific research papers and patents ",
  },
  {
    id: 3,
    title: "Find Clinical Data",
    description: "Access and analyze clinical trial data",
  },
];

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

  const geographies = feature(geoGraphyData, geoGraphyData.objects.countries).features;

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold pt-4 px-4">
          Welcome to <span className="text-[#95D524]">ToolX</span>{" "}
          <span className="text-sm font-normal bg-yellow-200 px-2 py-1 rounded ml-2">
            BETA
          </span>
        </h1>
      </header>
      <main className="flex flex-row container h-[430px] justify-center gap-x-12">
        <div className="bg-white rounded-lg shadow-lg w-1/2" style={{
                    border:"2px solid #95D524",
                    borderRadius: "8px",
                    boxShadow: "0px 6px 15px rgba(0, 0, 0, 0.1)",
                    minHeight: "100px",
                  }} >
          {/* <h2 className="text-2xl font-semibold pt-2 pl-2">Interactive Disease Map</h2> */}
          <div className="relative">
            <ComposableMap className=''>
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
                          fill: countryData[geo.properties.name] ? '#95d524' : '#29c4f8',
                          outline: 'black'
                        },
                        hover: {
                          fill: "#04165d",
                          outline: 'black',
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
                  pointerEvents: 'none', // Prevents blocking of mouse events
                  boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
                }}
              >
                {tooltipContent}
              </Tooltip>
            )}
          </div>
        </div>
        <div className='flex flex-col gap-y-2'>
        {workflows.map((workflow, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.1)" }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-6 bg-white rounded-lg shadow-lg cursor-pointer transition-transform ${
                    selectedCard === workflow.id ? "translate-y-2" : ""
                  }`}
                  style={{
                    border:
                      selectedCard === workflow.id
                        ? "2px solid #000"
                        : "2px solid #95D524",
                    borderRadius: "8px",
                    boxShadow: "0px 6px 15px rgba(0, 0, 0, 0.1)",
                    minHeight: "100px",
                  }}
                  onClick={() => handleWorkflowClick(workflow.id)}
                >
                  <Card className="border-none">
                    <CardHeader>
                      <CardTitle className="text-[20px] font-bold">
                        {workflow.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription>{workflow.description}</CardDescription>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
        </div>
      </main>
    </div>
  );
}
