// import React, { useState, useEffect } from 'react';
// import { Search, FileText, Activity } from 'lucide-react';
// import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
// import { Tooltip } from '@visx/tooltip';

// import * as d3 from 'd3';

// import WorldMap from './WorldMap';
// import { Button } from "@/components/ui/button";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { Separator } from "@/components/ui/separator";
// import { X, Map, ClipboardList, Award, Users } from "lucide-react";

// const countryData = {
//   "United States": {
//     TradeName: 'MediCure',
//     Price: 150,
//     Disease: 'Influenza',
//     Symptoms: 'Fever, cough, fatigue',
//     Prevalence: '5%',
//     Quality_of_Life: 'Moderate impact',
//     Morbidity: 'Low',
//     Mortality: 'Very low',
//     Efficacy: 'High',
//     Safety: 'Good',
//     Adverse_Events: 'Rare',
//     Annual_Therapy_Costs: 300,
//     Age_Group: 'All ages',
//     Gender: 'All',
//     Type_of_Drug: 'Antiviral',
//   },
//   // Add more countries here
// };


// const reportTypes = [
//   {
//     icon: <Map className="w-6 h-6" />,
//     title: "Competitive Landscape",
//     description: "View the competitive environment, key players, and product portfolios. Benchmark your position and spot opportunities.",
//   },
//   {
//     icon: <Activity className="w-6 h-6" />,
//     title: "Disease Overview",
//     description: "Overview of disease biology, risk factors, and treatment protocols. Useful for foundational understanding.",
//   },
//   {
//     icon: <ClipboardList className="w-6 h-6" />,
//     title: "Pipeline Analysis",
//     description: "Analysis of clinical-stage programs. See where new therapies are being developed and key innovators.",
//   },
//   {
//     icon: <Award className="w-6 h-6" />,
//     title: "FDA Label Analysis",
//     description: "FDA-approved drug labels with safety, efficacy data, and use guidelines. Great for benchmarking.",
//   },
//   {
//     icon: <Users className="w-6 h-6" />,
//     title: "Epidemiology",
//     description: "Disease prevalence, incidence, and demographics. Supports market sizing and strategic planning.",
//   },
// ];

// const FeatureCard = ({ icon: Icon, title, description }) => (
//   <div className="bg-white border border-[#a6ce39] rounded-lg p-4 shadow-sm h-full">
//     <div className="flex items-center mb-2">
//       <Icon className="w-5 h-5 text-[#a6ce39] mr-2 flex-shrink-0" />
//       <h3 className="text-base font-semibold text-gray-800 leading-tight">{title}</h3>
//     </div>
//     <p className="text-sm text-gray-600">{description}</p>
//   </div>
// );

// export default function Dashboard2() {
//   const [tooltipContent, setTooltipContent] = useState(null);
//   const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
//   const [selectedCard, setSelectedCard] = useState(null);
//   const [worldPopulation, setWorldPopulation] = useState(null);
//   const [topography, setTopography] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const getData = async () => {
//       setLoading(true);

//       let populationData = {};
//       await Promise.all([
//         d3.json(
//           "https://res.cloudinary.com/tropicolx/raw/upload/v1/Building%20Interactive%20Data%20Visualizations%20with%20D3.js%20and%20React/world.geojson"
//         ),
//         d3.csv(
//           "https://res.cloudinary.com/tropicolx/raw/upload/v1/Building%20Interactive%20Data%20Visualizations%20with%20D3.js%20and%20React/world_population.csv",
//           (d) => {
//             populationData = {
//               ...populationData,
//               [d.code]: +d.population,
//             };
//           }
//         ),
//       ]).then((fetchedData) => {
//         const topographyData = fetchedData[0];
//         setWorldPopulation(populationData);
//         setTopography(topographyData);
//       });

//       setLoading(false);
//     };

//     getData();
//   }, []);

//   const handleMouseMove = (event) => {
//     const { clientX, clientY } = event;
//     setTooltipPosition({ x: clientX + 100, y: clientY });
//   };

//   const renderTooltipContent = (country) => {
//     if (!country || !countryData[country]) return null;

//     const data = countryData[country];
//     return (
//       <div>
//         <h3 className="font-bold text-center mb-2">{country}</h3>
//         <table className="min-w-full text-left text-sm">
//           <tbody>
//             {Object.entries(data).map(([key, value]) => (
//               <tr key={key}>
//                 <td className="pr-2 font-semibold">{key}:</td>
//                 <td>{value}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     );
//   };
//   if (loading) return <div>Loading...</div>;
//   return (
//     <div className="h-screen bg-gray-50 flex flex-col">
//       <div className="flex-grow overflow-hidden p-6">
//         {/* Header */}
//         <div className="flex items-center mb-4">
//           <h1 className="text-2xl font-bold text-gray-800">
//             Welcome to <span className="text-[#a6ce39]">ToolX</span>
//           </h1>
//           {/* <span className="ml-3 px-2 py-1 bg-[#fff200] text-xs font-semibold rounded">
//             BETA
//           </span> */}
//         </div>

//         {/* Main Content */}
//         <div className="flex h-[calc(100%-2rem)] gap-4">
//           {/* Map Section */}
//           <div className="flex-grow">
//             <div className="bg-white border border-[#a6ce39] rounded-lg p-4 shadow-sm h-full">
//               <div className="">
//                 <WorldMap width={650} height={350} data={{ worldPopulation, topography }} />
//               </div>
//             </div>
//           </div>

//           {/* Report Types Cards */}
//           <div className="w-1/3 space-y-4 overflow-y-auto pr-2 scrollbar-hide">
//             <div className="space-y-4 flex flex-col">
//               {reportTypes.map((report, index) => (
//                 <div key={index} className="flex flex-col p-4 gap-4 border border-[#a6ce39] rounded-[12px]">
//                   <div className="flex-1 space-y-2">
//                     <div className="flex items-center gap-2">
//                       {report.icon}
//                       <h3 className="text-xl font-bold">{report.title}</h3>
//                     </div>
//                     <p className="text-sm text-muted-foreground">{report.description}</p>
//                   </div>
//                   <div className="flex items-center">
//                     <Button className="w-full md:w-auto bg-[#a6ce39] text-black rounded-[12px] hover:bg-lightBlue">Get Started</Button>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>
//       <style jsx global>{`
//         .scrollbar-hide {
//           -ms-overflow-style: none;
//           scrollbar-width: none;
//         }
//         .scrollbar-hide::-webkit-scrollbar {
//           display: none;
//         }
//       `}</style>
//     </div>
//   );
// }


import React, { useState, useEffect } from 'react';
import { Search, FileText, Activity } from 'lucide-react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { Tooltip } from '@visx/tooltip';

import * as d3 from 'd3';

import WorldMap from './WorldMap';
import DiseaseOverview from './DiseaseOverview';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { X, Map, ClipboardList, Award, Users } from "lucide-react";

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

const reportTypes = [
  {
    icon: <Map className="w-6 h-6" />,
    title: "Competitive Landscape",
    description: "View the competitive environment, key players, and product portfolios. Benchmark your position and spot opportunities.",
  },
  {
    icon: <Activity className="w-6 h-6" />,
    title: "Disease Overview",
    description: "Overview of disease biology, risk factors, and treatment protocols. Useful for foundational understanding.",
  },
  {
    icon: <ClipboardList className="w-6 h-6" />,
    title: "Pipeline Analysis",
    description: "Analysis of clinical-stage programs. See where new therapies are being developed and key innovators.",
  },
  {
    icon: <Award className="w-6 h-6" />,
    title: "FDA Label Analysis",
    description: "FDA-approved drug labels with safety, efficacy data, and use guidelines. Great for benchmarking.",
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: "Epidemiology",
    description: "Disease prevalence, incidence, and demographics. Supports market sizing and strategic planning.",
  },
];

const FeatureCard = ({ icon: Icon, title, description }) => (
  <div className="bg-white border border-[#a6ce39] rounded-lg p-4 shadow-sm h-full">
    <div className="flex items-center mb-2">
      <Icon className="w-5 h-5 text-[#a6ce39] mr-2 flex-shrink-0" />
      <h3 className="text-base font-semibold text-gray-800 leading-tight">{title}</h3>
    </div>
    <p className="text-sm text-gray-600">{description}</p>
  </div>
);

export default function Dashboard() {
  const [tooltipContent, setTooltipContent] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [selectedCard, setSelectedCard] = useState(null);
  const [worldPopulation, setWorldPopulation] = useState(null);
  const [topography, setTopography] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getData = async () => {
      setLoading(true);

      let populationData = {};
      await Promise.all([
        d3.json(
          "https://res.cloudinary.com/tropicolx/raw/upload/v1/Building%20Interactive%20Data%20Visualizations%20with%20D3.js%20and%20React/world.geojson"
        ),
        d3.csv(
          "https://res.cloudinary.com/tropicolx/raw/upload/v1/Building%20Interactive%20Data%20Visualizations%20with%20D3.js%20and%20React/world_population.csv",
          (d) => {
            populationData = {
              ...populationData,
              [d.code]: +d.population,
            };
          }
        ),
      ]).then((fetchedData) => {
        const topographyData = fetchedData[0];
        setWorldPopulation(populationData);
        setTopography(topographyData);
      });

      setLoading(false);
    };

    getData();
  }, []);

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

  if (loading) return <div>Loading...</div>;

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      <div className="flex-grow overflow-hidden p-6">
        {/* Header */}
        <div className="flex items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-800">
            Welcome to <span className="text-[#a6ce39]">ToolX</span>
          </h1>
        </div>

        {/* Main Content */}
        <div className="flex h-[calc(100%-2rem)] gap-4">
          {/* Map Section */}
          <div className="flex-grow">
            <div className="bg-white border border-[#a6ce39] rounded-lg p-4 shadow-sm h-full">
              <div className="">
                <WorldMap width={650} height={350} data={{ worldPopulation, topography }} />
              </div>
            </div>
          </div>

          {/* Report Types Cards */}
          <div className="w-1/3 space-y-4 overflow-y-auto pr-2 scrollbar-hide">
            <div className="space-y-4 flex flex-col">
              {reportTypes.map((report, index) => (
                <div key={index} className="flex flex-col p-4 gap-4 border border-[#a6ce39] rounded-[12px]">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      {report.icon}
                      <h3 className="text-xl font-bold">{report.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">{report.description}</p>
                  </div>
                  <div className="flex items-center">
                    {report.title === "Disease Overview" ? (
                      <DiseaseOverview />
                    ) : (
                      <Button className="w-full md:w-auto bg-[#a6ce39] text-black rounded-[12px] hover:bg-[#95b833]">
                        Get Started
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
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