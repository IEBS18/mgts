import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Competitor from '../assets/dashboard/competitorAnalysis.png'
import Disease from '../assets/dashboard/diseaseOverview.png'
import Price from '../assets/dashboard/pricePrediction.png'
import Formulary from '../assets/dashboard/formulary.png'
import RnD from '../assets/dashboard/research-and-development.png'
import CompetitiveLandscapeModal from './CompetitiveLandscapeModal';
import DiseaseOverviewModal from './DiseaseOverviewModal';
import DrugCostPredictionModal from './DrugCostPredictionModal';
import RNDFormulationModal from '../components/Rnd/RNDFormulationModal';
const reportTypes = [
  {
    title: "Competitive Landscape",
    description: "Explore key players, product portfolios, and opportunities.",
    image: Competitor,
    key: "competitiveLandscape",
  },
  {
    title: "Disease Overview",
    description: "Understand disease biology, risks, and treatment protocols.",
    image: Disease,
    key: "diseaseOverview",
  },
  {
    title: "Price Prediction",
    description: "Analyze clinical programs and discover key innovators.",
    image: Price,
    key: "pricePrediction",
  },
  {
    title: "Formulary",
    description: "Review insurance coverage and preferred medications.",
    image: Formulary,
    key: "formulary",
  },
  {
    title: "BioFormulate",
    description: "Analyze pharmaceutical ingredients and uncover new therapeutic applications using patents and research insights.",
    image: RnD,
    key: "rndFormulation",
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
    } else if (key === "rndFormulation") {
      setOpenDialog("rndFormulation");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full bg-gray-50 overflow-auto">
      {/* Centered Header */}
      <header className="text-center mb-8">
        <h1 className="text-5xl font-bold text-gray-800 mt-8">
          Welcome to <span className="text-[#a6ce39]">InsiOnyx</span>
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
      {openDialog === "rndFormulation" && (
        <RNDFormulationModal
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
