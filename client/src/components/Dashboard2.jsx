// // src/components/Dashboard.jsx

// import React, { useState, useEffect } from 'react';
// import { Activity, Map, ClipboardList, Award, Users } from 'lucide-react';
// import DiseaseOverviewModal from './DiseaseOverview';
// import CompetitiveLandscapeModal from './CompetitiveLandscapePopUp';
// import DrugCostPredictionModal from './DrugCostPredictionModal';
// import { Button } from "@/components/ui/button";
// import { Card } from "./ui/card";
// import { useNavigate } from "react-router-dom";

// const reportTypes = [
//   {
//     icon: Map,
//     title: "Competitive Landscape",
//     description: "View the competitive environment, key players, and product portfolios. Benchmark your position and spot opportunities.",
//   },
//   {
//     icon: Activity,
//     title: "Disease Overview",
//     description: "Overview of disease biology, risk factors, and treatment protocols. Useful for foundational understanding.",
//   },
//   {
//     icon: ClipboardList,
//     title: "Price Prediction",
//     description: "Analysis of clinical-stage programs. See where new therapies are being developed and key innovators.",
//   },
//   {
//     icon: Award,
//     title: "FDA Label Analysis",
//     description: "FDA-approved drug labels with safety, efficacy data, and use guidelines. Great for benchmarking.",
//   },
//   {
//     icon: Users,
//     title: "Epidemiology",
//     description: "Disease prevalence, incidence, and demographics. Supports market sizing and strategic planning.",
//   },
// ];

// const FeatureCard = ({ icon: Icon, title, description, children }) => (
//   <div className="bg-white border border-[#a6ce39] rounded-lg p-4 shadow-sm h-full flex flex-col">
//     <div className="flex items-center mb-2">
//       <Icon className="w-5 h-5 text-[#a6ce39] mr-2 flex-shrink-0" />
//       <h3 className="text-base font-semibold text-gray-800 leading-tight">{title}</h3>
//     </div>
//     <p className="text-sm text-gray-600 flex-grow">{description}</p>
//     <div className="mt-4">
//       {children}
//     </div>
//   </div>
// );

// export default function Dashboard() {
//   const navigate = useNavigate();

//   // Modal state variables
//   const [isDiseaseOverviewModalOpen, setIsDiseaseOverviewModalOpen] = useState(false);
//   const [isCompetitiveLandscapeModalOpen, setIsCompetitiveLandscapeModalOpen] = useState(false);
//   const [isDrugCostPredictionModalOpen, setIsDrugCostPredictionModalOpen] = useState(false);

//   // Handle Disease Overview Search Submit
//   const handleDiseaseOverviewSearchSubmit = ({ type, data, symptoms }) => {
//     setIsDiseaseOverviewModalOpen(false);
//     if (type === 'disease') {
//       navigate("/disease-search", {
//         state: { searchResults: data },
//       });
//     } else if (type === 'drug') {
//       navigate("/drug-search", {
//         state: { searchResults: data },
//       });
//     } else if (type === 'symptoms') {
//       navigate("/symptom-search", {
//         state: { searchResults: data, symptoms },
//       });
//     }
//   };

//   // Handle Competitive Landscape Search Submit
//   const handleCompetitiveLandscapeSearchSubmit = ({ type, data }) => {
//     setIsCompetitiveLandscapeModalOpen(false);
//     navigate("/competitive-landscape", {
//       state: { searchResults: data },
//     });
//   };

//   // You can define handleDrugCostPredictionSubmit if needed

//   const useCountUp = (target, duration = 1500) => {
//     const [count, setCount] = useState(0);

//     useEffect(() => {
//       const incrementTime = 20; // update every 20 milliseconds
//       const increment = Math.ceil(target / (duration / incrementTime));

//       const counter = setInterval(() => {
//         setCount((prevCount) => {
//           if (prevCount + increment >= target) {
//             clearInterval(counter);
//             return target;
//           }
//           return prevCount + increment;
//         });
//       }, incrementTime);

//       return () => clearInterval(counter); // Cleanup on unmount
//     }, [target, duration]);

//     return count;
//   };

//   const act = useCountUp(2547);
//   const rd = useCountUp(1892);
//   const dm = useCountUp(312);
//   const fda = useCountUp(47);

//   return (
//     <div className="h-full bg-gray-50 flex flex-col overflow-y-auto scrollbar-hide">
//       <div className="flex-grow overflow-hidden p-3">
//         {/* Header */}
//         {/* Main Content */}
//         <div className="flex h-[calc(100%-2rem)] gap-4">
//           {/* Left Side Content */}
//           <div className="flex-grow">
//             <div className="bg-white border border-[#a6ce39] rounded-lg p-6 shadow-sm h-full">
//               <div className="grid grid-cols-2 gap-4 mb-6">
//                 <Card className="p-4 border-[#a6ce39]">
//                   <h3 className="font-semibold text-gray-600 mb-2">Active Clinical Trials</h3>
//                   <p className="text-3xl font-bold text-[#a6ce39]">{act.toLocaleString()}</p>
//                 </Card>
//                 <Card className="p-4 border-[#a6ce39]">
//                   <h3 className="font-semibold text-gray-600 mb-2">Registered Diseases</h3>
//                   <p className="text-3xl font-bold text-[#a6ce39]">{rd.toLocaleString()}</p>
//                 </Card>
//                 <Card className="p-4 border-[#a6ce39]">
//                   <h3 className="font-semibold text-gray-600 mb-2">Drug Manufacturers</h3>
//                   <p className="text-3xl font-bold text-[#a6ce39]">{dm.toLocaleString()}</p>
//                 </Card>
//                 <Card className="p-4 border-[#a6ce39]">
//                   <h3 className="font-semibold text-gray-600 mb-2">FDA Approvals (2024)</h3>
//                   <p className="text-3xl font-bold text-[#a6ce39]">{fda.toLocaleString()}</p>
//                 </Card>
//               </div>

//               <div className="insights cards space-y-4">
//                 <h3 className="font-semibold text-lg">Featured Insights</h3>
//                 <div className="grid grid-cols-1 gap-4">
//                   <Card className="p-3 border-[#a6ce39]">
//                     <div className="flex items-center gap-3">
//                       <Activity className="w-5 h-5 text-[#a6ce39]" />
//                       <div>
//                         <h4 className="font-medium">Trending Research</h4>
//                         <p className="text-sm text-gray-600">Latest developments in oncology treatments</p>
//                       </div>
//                     </div>
//                   </Card>
//                   <Card className="p-3 border-[#a6ce39]">
//                     <div className="flex items-center gap-3">
//                       <Award className="w-5 h-5 text-[#a6ce39]" />
//                       <div>
//                         <h4 className="font-medium">Market Leaders</h4>
//                         <p className="text-sm text-gray-600">Top performing pharmaceutical companies Q1 2024</p>
//                       </div>
//                     </div>
//                   </Card>
//                 </div>
//               </div>
//             </div> 
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 {reportTypes.map((report, index) => (
//                   <div key={index} className="flex flex-col p-4 gap-4 border border-[#a6ce39] rounded-[12px]">
//                     <div className="flex-1 space-y-2">
//                       <div className="flex items-center gap-2">
//                         {report.icon}
//                         <h3 className="text-xl font-bold">{report.title}</h3>
//                       </div>
//                       <p className="text-sm text-muted-foreground">{report.description}</p>
//                     </div>
//                     <div className="flex items-center">
//                       {report.title === "Disease Overview" ? (
//                         <DiseaseOverviewModal />
//                       ) : report.title === "Competitive Landscape" ? (
//                         <CompetitiveLandscapeModal />
//                       ) : report.title === "Price Prediction" ? (
//                         <DrugCostPredictionModal />
//                       ) : (
//                         <Button className="w-full md:w-auto bg-[#a6ce39] text-black rounded-[12px] hover:bg-[#95b833]">
//                           Get Started
//                         </Button>
//                       )}
//                     </div>
//                   </div>
//                 ))}
//               </div>

//           </div>

//           {/* Report Types Cards */}
//           <div className="w-1/3 space-y-4 overflow-y-auto pr-2 scrollbar-hide">
//             <div className="space-y-4 flex flex-col">
//               {reportTypes.map((report, index) => {
//                 let button = null;
//                 let modal = null;

//                 if (report.title === "Disease Overview") {
//                   button = (
//                     <Button
//                       onClick={() => setIsDiseaseOverviewModalOpen(true)}
//                       className="w-full md:w-auto bg-[#a6ce39] text-black rounded-[12px] hover:bg-[#95b833]"
//                     >
//                       Get Started
//                     </Button>
//                   );
//                   modal = (
//                     <DiseaseOverviewModal
//                       isOpen={isDiseaseOverviewModalOpen}
//                       onOpenChange={setIsDiseaseOverviewModalOpen}
//                       onSearchSubmit={handleDiseaseOverviewSearchSubmit}
//                     />
//                   );
//                 } else if (report.title === "Competitive Landscape") {
//                   button = (
//                     <Button
//                       onClick={() => setIsCompetitiveLandscapeModalOpen(true)}
//                       className="w-full md:w-auto bg-[#a6ce39] text-black rounded-[12px] hover:bg-[#95b833]"
//                     >
//                       Get Started
//                     </Button>
//                   );
//                   modal = (
//                     <CompetitiveLandscapeModal
//                       isOpen={isCompetitiveLandscapeModalOpen}
//                       onOpenChange={setIsCompetitiveLandscapeModalOpen}
//                       onSearchSubmit={handleCompetitiveLandscapeSearchSubmit}
//                     />
//                   );
//                 } else if (report.title === "Price Prediction") {
//                   button = (
//                     <Button
//                       onClick={() => setIsDrugCostPredictionModalOpen(true)}
//                       className="w-full md:w-auto bg-[#a6ce39] text-black rounded-[12px] hover:bg-[#95b833]"
//                     >
//                       Get Started
//                     </Button>
//                   );
//                   modal = (
//                     <DrugCostPredictionModal
//                       isOpen={isDrugCostPredictionModalOpen}
//                       onOpenChange={setIsDrugCostPredictionModalOpen}
//                       // Define onSearchSubmit if needed
//                     />
//                   );
//                 } else {
//                   button = (
//                     <Button className="w-full md:w-auto bg-[#a6ce39] text-black rounded-[12px] hover:bg-[#95b833]">
//                       Get Started
//                     </Button>
//                   );
//                 }

//                 return (
//                   <FeatureCard
//                     key={index}
//                     icon={report.icon}
//                     title={report.title}
//                     description={report.description}
//                   >
//                     {button}
//                     {modal}
//                   </FeatureCard>
//                 );
//               })}
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



// import React, { useState } from 'react';
// import { Activity } from 'lucide-react';

// import DiseaseOverviewModal from './DiseaseOverview';
// import { Button } from "@/components/ui/button";

// import { Map, ClipboardList, Award, Users } from "lucide-react";
// import DrugCostPredictionModal from './DrugCostPredictionModal';
// import CompetitiveLandscapeModal from './CompetitiveLandscapePopUp';
// import { useNavigate } from 'react-router-dom';

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
//     title: "Price Prediction",
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
 

//  const FeatureCard = ({ icon: Icon, title, description, children }) => (
//   <div className="bg-white border border-[#a6ce39] rounded-lg p-4 shadow-sm h-full flex flex-col">
//     <div className="flex items-center mb-2">
//       <Icon className="w-5 h-5 text-[#a6ce39] mr-2 flex-shrink-0" />
//       <h3 className="text-base font-semibold text-gray-800 leading-tight">{title}</h3>
//     </div>
//     <p className="text-sm text-gray-600 flex-grow">{description}</p>
//     <div className="mt-4">
//       {children}
//     </div>
//   </div>
// );
// export default function Dashboard() {
//   const navigate = useNavigate();

//     // Modal state variables
//     const [isDiseaseOverviewModalOpen, setIsDiseaseOverviewModalOpen] = useState(false);
//     const [isCompetitiveLandscapeModalOpen, setIsCompetitiveLandscapeModalOpen] = useState(false);
//     const [isDrugCostPredictionModalOpen, setIsDrugCostPredictionModalOpen] = useState(false);
  
//     // Handle Disease Overview Search Submit
//     const handleDiseaseOverviewSearchSubmit = ({ type, data, symptoms }) => {
//       setIsDiseaseOverviewModalOpen(false);
//       if (type === 'disease') {
//         navigate("/disease-search", {
//           state: { searchResults: data },
//         });
//       } else if (type === 'drug') {
//         navigate("/drug-search", {
//           state: { searchResults: data },
//         });
//       } else if (type === 'symptoms') {
//         navigate("/symptom-search", {
//           state: { searchResults: data, symptoms },
//         });
//       }
//     };
  
//     // Handle Competitive Landscape Search Submit
//     const handleCompetitiveLandscapeSearchSubmit = ({ type, data }) => {
//       setIsCompetitiveLandscapeModalOpen(false);
//       navigate("/competitive-landscape", {
//         state: { searchResults: data },
//       });
//     };

//   return (
//     <div className="h-full bg-gray-50 flex flex-col overflow-y-auto scrollbar-hide">
//       <div className="flex-grow overflow-hidden p-3">
        
//         <div className="flex h-[calc(100%)] gap-4">
//           <div className="flex-grow ">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

//             {reportTypes.map((report, index) => {
//                 let button = null;
//                 let modal = null;

//                 if (report.title === "Disease Overview") {
//                   button = (
//                     <Button
//                       onClick={() => setIsDiseaseOverviewModalOpen(true)}
//                       className="w-full md:w-auto bg-[#a6ce39] text-black rounded-[12px] hover:bg-[#95b833]"
//                     >
//                       Get Started
//                     </Button>
//                   );
//                   modal = (
//                     <DiseaseOverviewModal
//                       isOpen={isDiseaseOverviewModalOpen}
//                       onOpenChange={setIsDiseaseOverviewModalOpen}
//                       onSearchSubmit={handleDiseaseOverviewSearchSubmit}
//                     />
//                   );
//                 } else if (report.title === "Competitive Landscape") {
//                   button = (
//                     <Button
//                       onClick={() => setIsCompetitiveLandscapeModalOpen(true)}
//                       className="w-full md:w-auto bg-[#a6ce39] text-black rounded-[12px] hover:bg-[#95b833]"
//                     >
//                       Get Started
//                     </Button>
//                   );
//                   modal = (
//                     <CompetitiveLandscapeModal
//                       isOpen={isCompetitiveLandscapeModalOpen}
//                       onOpenChange={setIsCompetitiveLandscapeModalOpen}
//                       onSearchSubmit={handleCompetitiveLandscapeSearchSubmit}
//                     />
//                   );
//                 } else if (report.title === "Price Prediction") {
//                   button = (
//                     <Button
//                       onClick={() => setIsDrugCostPredictionModalOpen(true)}
//                       className="w-full md:w-auto bg-[#a6ce39] text-black rounded-[12px] hover:bg-[#95b833]"
//                     >
//                       Get Started
//                     </Button>
//                   );
//                   modal = (
//                     <DrugCostPredictionModal
//                       isOpen={isDrugCostPredictionModalOpen}
//                       onOpenChange={setIsDrugCostPredictionModalOpen}
//                       // Define onSearchSubmit if needed
//                     />
//                   );
//                 } else {
//                   button = (
//                     <Button className="w-full md:w-auto bg-[#a6ce39] text-black rounded-[12px] hover:bg-[#95b833]">
//                       Get Started
//                     </Button>
//                   );
//                 }

//                 return (
//                   <FeatureCard
//                     key={index}
//                     icon={report.icon}
//                     title={report.title}
//                     description={report.description}
//                   >
//                     {button}
//                     {modal}
//                   </FeatureCard>
//                 );
//               })}
//               </div>
 
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
 


// src/components/Dashboard.jsx

import React, { useState } from 'react';
import { Activity, Map, ClipboardList, Award, Users } from 'lucide-react';

import DiseaseOverviewModal from './DiseaseOverview';
import { Button } from "@/components/ui/button";
import DrugCostPredictionModal from './DrugCostPredictionModal';
import CompetitiveLandscapeModal from './CompetitiveLandscapePopUp';
import { useNavigate } from 'react-router-dom';

const reportTypes = [
  {
    icon: Map,
    title: "Competitive Landscape",
    description:
      "View the competitive environment, key players, and product portfolios. Benchmark your position and spot opportunities.",
  },
  {
    icon: Activity,
    title: "Disease Overview",
    description:
      "Overview of disease biology, risk factors, and treatment protocols. Useful for foundational understanding.",
  },
  {
    icon: ClipboardList,
    title: "Price Prediction",
    description:
      "Analysis of clinical-stage programs. See where new therapies are being developed and key innovators.",
  },
  {
    icon: Award,
    title: "FDA Label Analysis",
    description:
      "FDA-approved drug labels with safety, efficacy data, and use guidelines. Great for benchmarking.",
  },
  {
    icon: Users,
    title: "Epidemiology",
    description:
      "Disease prevalence, incidence, and demographics. Supports market sizing and strategic planning.",
  },
];

const FeatureCard = ({ icon: Icon, title, description, children }) => (
  <div className="bg-white border border-[#a6ce39] rounded-lg p-4 shadow-sm h-full flex flex-col">
    <div className="flex items-center mb-2">
      <Icon className="w-6 h-6 text-[#a6ce39] mr-2 flex-shrink-0" />
      <h3 className="text-base font-semibold text-gray-800 leading-tight">{title}</h3>
    </div>
    <p className="text-sm text-gray-600 flex-grow">{description}</p>
    <div className="mt-4">
      {children}
    </div>
  </div>
);

export default function Dashboard() {
  const navigate = useNavigate();

  // Modal state variables
  const [isDiseaseOverviewModalOpen, setIsDiseaseOverviewModalOpen] = useState(false);
  const [isCompetitiveLandscapeModalOpen, setIsCompetitiveLandscapeModalOpen] = useState(false);
  const [isDrugCostPredictionModalOpen, setIsDrugCostPredictionModalOpen] = useState(false);

  // Handle Disease Overview Search Submit
  const handleDiseaseOverviewSearchSubmit = ({ type, data, symptoms }) => {
    setIsDiseaseOverviewModalOpen(false);
    if (type === 'disease') {
      navigate("/disease-search", {
        state: { searchResults: data },
      });
    } else if (type === 'drug') {
      navigate("/drug-search", {
        state: { searchResults: data },
      });
    } else if (type === 'symptoms') {
      navigate("/symptom-search", {
        state: { searchResults: data, symptoms },
      });
    }
  };

  // Handle Competitive Landscape Search Submit
  const handleCompetitiveLandscapeSearchSubmit = ({ type, data }) => {
    setIsCompetitiveLandscapeModalOpen(false);
    navigate("/competitive-landscape", {
      state: { searchResults: data },
    });
  };

  return (
    <div className="h-full bg-gray-50 flex flex-col overflow-y-auto scrollbar-hide">
      <div className="flex-grow overflow-hidden p-3">
        <div className="flex h-[calc(100%)] gap-4">
          <div className="flex-grow">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reportTypes.map((report, index) => {
                let button = null;
                let modal = null;

                if (report.title === "Disease Overview") {
                  button = (
                    <Button
                      onClick={() => setIsDiseaseOverviewModalOpen(true)}
                      className="w-full md:w-auto bg-[#a6ce39] text-black rounded-[12px] hover:bg-[#95b833]"
                    >
                      Get Started
                    </Button>
                  );
                  modal = (
                    <DiseaseOverviewModal
                      isOpen={isDiseaseOverviewModalOpen}
                      onOpenChange={setIsDiseaseOverviewModalOpen}
                      onSearchSubmit={handleDiseaseOverviewSearchSubmit}
                    />
                  );
                } else if (report.title === "Competitive Landscape") {
                  modal = (
                    <CompetitiveLandscapeModal
                      isOpen={isCompetitiveLandscapeModalOpen}
                      onOpenChange={setIsCompetitiveLandscapeModalOpen}
                      onSearchSubmit={handleCompetitiveLandscapeSearchSubmit}
                    />
                  );
                } else if (report.title === "Price Prediction") {
                  button = (
                    <Button
                      onClick={() => setIsDrugCostPredictionModalOpen(true)}
                      className="w-full md:w-auto bg-[#a6ce39] text-black rounded-[12px] hover:bg-[#95b833]"
                    >
                      Get Started
                    </Button>
                  );
                  modal = (
                    <DrugCostPredictionModal
                      isOpen={isDrugCostPredictionModalOpen}
                      onOpenChange={setIsDrugCostPredictionModalOpen}
                      // Define onSearchSubmit if needed
                    />
                  );
                } else {
                  button = (
                    <Button className="w-full md:w-auto bg-[#a6ce39] text-black rounded-[12px] hover:bg-[#95b833]">
                      Get Started
                    </Button>
                  );
                }

                return (
                  <FeatureCard
                    key={index}
                    icon={report.icon}
                    title={report.title}
                    description={report.description}
                  >
                    {button}
                    {modal}
                  </FeatureCard>
                );
              })}
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
