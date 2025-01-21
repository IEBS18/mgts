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

// // Updated src/components/Dashboard.jsx

// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { motion } from 'framer-motion';
// import { Activity, Map, ClipboardList, Award, Users } from 'lucide-react';

// import DiseaseOverviewModal from './DiseaseOverview';
// import DrugCostPredictionModal from './DrugCostPredictionModal';
// import CompetitiveLandscapeModal from './CompetitiveLandscapePopUp';

// const reportTypes = [
//   {
//     icon: Map,
//     title: "Competitive Landscape",
//     description:
//       "View the competitive environment, key players, and product portfolios. Benchmark your position and spot opportunities.",
//     image: '../assets/dashboard/competitorAnalysis.png',
//     key: "competitiveLandscape",
//   },
//   {
//     icon: Activity,
//     title: "Disease Overview",
//     description:
//       "Overview of disease biology, risk factors, and treatment protocols. Useful for foundational understanding.",
//     image: '../assets/dashboard/diseaseOverview.png',
//     key: "diseaseOverview",
//   },
//   {
//     icon: ClipboardList,
//     title: "Price Prediction",
//     description:
//       "Analysis of clinical-stage programs. See where new therapies are being developed and key innovators.",
//     image: '../assets/dashboard/pricePrediction.png',
//     key: "pricePrediction",
//   },
//   {
//     icon: Award,
//     title: "Formulary",
//     description:
//       "A systematic process determining insurance coverage and preferred medications based on clinical effectiveness, cost, and patient needs.",
//     image: '../assets/dashboard/formulary.png',
//     key: "formulary",
//   },
//   {
//     icon: Users,
//     title: "Epidemiology",
//     description:
//       "Disease prevalence, incidence, and demographics. Supports market sizing and strategic planning.",
//     image: '../assets/dashboard/Epidemiology.png',
//     key: "epidemiology",
//   },
// ];

// const Dashboard = () => {
//   const [openDialog, setOpenDialog] = useState(null);
//   const navigate = useNavigate();

//   const handleCardClick = (key) => {
//     if (key === "formulary") {
//       navigate("/formulary");
//     } else if (key === "competitiveLandscape") {
//       setOpenDialog("competitiveLandscape");
//     } else if (key === "pricePrediction") {
//       setOpenDialog("pricePrediction");
//     } else if (key === "diseaseOverview") {
//       setOpenDialog("diseaseOverview");
//     }
//   };

//   return (
//     <div className="flex items-center justify-center h-full bg-gray-50 overflow-auto">
//       <section className="pb-8 w-full">
//         <div className="container mx-auto px-6">
//           <div className="text-left mb-8">
//             <h1 className="text-5xl font-bold text-gray-800">
//               Welcome to <span className="text-[#a6ce39]">Dashboard</span>
//             </h1>
//             <p className="text-lg text-muted-foreground mt-4">
//               Explore insights, analytics, and forecasting tools for informed decision-making.
//             </p>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
//             {reportTypes.map(({ icon: Icon, title, description, image, key }) => (
//               <motion.div
//                 key={key}
//                 className="relative cursor-pointer h-[350px] w-[309px] bg-custom-gradient-card text-white rounded-lg shadow-md overflow-hidden group"
//                 onClick={() => handleCardClick(key)}
//                 whileHover={{ scale: 1.05 }}
//               >
//                 <div className="absolute top-4 right-4 z-10">
//                   <Icon className="h-6 w-6 text-white" />
//                 </div>
//                 <div className="p-6 flex flex-col justify-between h-full">
//                   <div>
//                     <motion.h3
//                       className="text-2xl font-semibold leading-tight"
//                       initial={{ fontSize: "2.5rem" }}
//                       whileHover={{ fontSize: "2.7rem" }}
//                     >
//                       {title}
//                     </motion.h3>
//                     <motion.div
//                       className="h-1 rounded-lg bg-white mt-2"
//                       initial={{ width: 0 }}
//                       whileHover={{ width: 48 }}
//                       transition={{ duration: 0.3 }}
//                     />
//                     <p className="text-lg leading-relaxed mt-4 opacity-90">{description}</p>
//                   </div>
//                   <motion.img
//                     src={image}
//                     alt={`${title} image`}
//                     className="absolute bottom-4 right-4 h-24 w-24 transition-transform duration-300 group-hover:scale-75"
//                   />
//                 </div>
//               </motion.div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* Modals */}
//       {openDialog === "diseaseOverview" && (
//         <DiseaseOverviewModal
//           isOpen
//           onOpenChange={() => setOpenDialog(null)}
//           onSearchSubmit={() => setOpenDialog(null)}
//         />
//       )}
//       {openDialog === "competitiveLandscape" && (
//         <CompetitiveLandscapeModal
//           isOpen
//           onOpenChange={() => setOpenDialog(null)}
//           onSearchSubmit={() => setOpenDialog(null)}
//         />
//       )}
//       {openDialog === "pricePrediction" && (
//         <DrugCostPredictionModal
//           isOpen
//           onOpenChange={() => setOpenDialog(null)}
//           onSearchSubmit={() => setOpenDialog(null)}
//         />
//       )}
//     </div>
//   );
// };

// export default Dashboard;


import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, Map, ClipboardList, Award, Users } from 'lucide-react';
import Competitor from '../assets/dashboard/competitorAnalysis.png'
import Disease from '../assets/dashboard/diseaseOverview.png'
import Price from '../assets/dashboard/pricePrediction.png'
import Formulary from '../assets/dashboard/formulary.png'
import Epidemiology from '../assets/dashboard/Epidemiology.png'

import DiseaseOverviewModal from './DiseaseOverview';
import DrugCostPredictionModal from './DrugCostPredictionModal';
import CompetitiveLandscapeModal from './CompetitiveLandscapePopUp';
import TPPModal from './TPPModal';
const reportTypes = [
  {
    icon: Map,
    title: "Competitive Landscape",
    description: "Explore key players, product portfolios, and opportunities.",
    image: Competitor,
    key: "competitiveLandscape",
  },
  {
    icon: Activity,
    title: "Disease Overview",
    description: "Understand disease biology, risks, and treatment protocols.",
    image: Disease,
    key: "diseaseOverview",
  },
  {
    icon: ClipboardList,
    title: "Price Prediction",
    description: "Analyze clinical programs and discover key innovators.",
    image: Price,
    key: "pricePrediction",
  },
  {
    icon: Award,
    title: "Formulary",
    description: "Review insurance coverage and preferred medications.",
    image: Formulary,
    key: "formulary",
  },
  {
    icon: Users,
    title: "Target Product Profile",
    description: "Compare drug efficacy, safety, and other factors to identify optimal product attributes.",
    image: Epidemiology,
    key: "target_product_profile",
  },
];


const Dashboard = () => {
  const [openDialog, setOpenDialog] = useState(null);
  const navigate = useNavigate();

  const handleCardClick = (key) => {
    if (key === "formulary") {
      navigate("/formulary");
    } else if (key === "competitiveLandscape") {
      setOpenDialog("competitiveLandscape");
    } else if (key === "pricePrediction") {
      setOpenDialog("pricePrediction");
    } else if (key === "diseaseOverview") {
      setOpenDialog("diseaseOverview");
    } else if (key === "target_product_profile") {
      setOpenDialog("target_product_profile");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full bg-gray-50 overflow-auto">
      {/* Centered Header */}
      <header className="text-center mb-8">
        <h1 className="text-5xl font-bold text-gray-800 mt-12">
          Welcome to <span className="text-[#a6ce39]">PharmaX</span>
        </h1>
        <p className="text-lg text-muted-foreground mt-4">
          Explore insights, analytics, and forecasting tools for informed decision-making.
        </p>
      </header>

      {/* Cards Layout */}

      <div className="grid grid-cols-5 gap-4 max-w-screen-xl">
        {reportTypes.map(({ title, description, image, key }) => (
          <motion.div
            key={key}
            className="relative cursor-pointer h-[300px] w-[220px] bg-custom-gradient-card text-white rounded-lg shadow-md overflow-hidden group"
            onClick={() => handleCardClick(key)}
            initial={{ background: "linear-gradient(36.59deg, #A6CE39 2.62%, #40530C 92.34%)" }}
            whileHover={{
              background: "linear-gradient(36.59deg, #40530C 2.62%, #A6CE39 92.34%)",
            }}
          >
            {/* Card Content */}
            <div className="p-4 flex flex-col items-center justify-center h-full group-hover:items-start group-hover:justify-start transition-all duration-300">
              {/* Title */}
              <motion.h3
                className="text-2xl font-bold mb-2 group-hover:text-xl transition-all duration-300"
              >
                {title}
              </motion.h3>
              {/* Underline */}
              <motion.div
                className="hidden group-hover:block w-10 h-1 bg-white transition-all duration-300"
              ></motion.div>

              {/* Description (Hidden by default) */}
              <motion.p
                className="text-sm text-gray-100 opacity-0 group-hover:opacity-100 mt-4 leading-relaxed transition-opacity duration-300"
              >
                {description}
              </motion.p>

              {/* Image */}
              <motion.img
                src={image}
                alt={`${title} icon`}
                className="h-28 w-28 mt-4 group-hover:absolute group-hover:bottom-4 group-hover:right-4 group-hover:h-16 group-hover:w-16 transition-all duration-300"
              />
            </div>

            {/* Button */}
            <motion.div
              className="hidden group-hover:block absolute bottom-4 left-4"
            >
              <button className="bg-white text-black text-sm px-4 py-2 rounded-[12px] hover:bg-gray-200">
                Get Started
              </button>
            </motion.div>
          </motion.div>
        ))}
      </div>






      {/* Modals */}
      {openDialog === "diseaseOverview" && (
        <DiseaseOverviewModal
          isOpen
          onOpenChange={() => setOpenDialog(null)}
          onSearchSubmit={() => setOpenDialog(null)}
        />
      )}
      {openDialog === "competitiveLandscape" && (
        <CompetitiveLandscapeModal
          isOpen
          onOpenChange={() => setOpenDialog(null)}
        />
      )}
      {openDialog === "target_product_profile" && (
        <TPPModal
          isOpen
          onOpenChange={() => setOpenDialog(null)}
        />
      )}
      {openDialog === "pricePrediction" && (
        <DrugCostPredictionModal
          isOpen
          onOpenChange={() => setOpenDialog(null)}
          onSearchSubmit={() => setOpenDialog(null)}
        />
      )}
    </div>
  );
};

export default Dashboard;
