// import { useLocation } from "react-router-dom";
// import { useState, useEffect } from "react";
// import * as d3 from "d3";

// import WorldMap from "./WorldMap"; // Import your WorldMap component
// import { Card } from "./ui/card"; // Import Card from ShadCN UI

// const DiseaseSearchPage = () => {
//   const location = useLocation();
//   const { searchResults } = location.state || {}; // Get the search results

//   if (!searchResults) {
//     return <div>No search results found.</div>;
//   }

//   const [worldPopulation, setWorldPopulation] = useState(null);
//   const [topography, setTopography] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const getData = async () => {
//       setLoading(true);

//       let populationData = {};
//       await Promise.all([
//         d3.json("https://res.cloudinary.com/tropicolx/raw/upload/v1/Building%20Interactive%20Data%20Visualizations%20with%20D3.js%20and%20React/world.geojson"),
//         d3.csv("https://res.cloudinary.com/tropicolx/raw/upload/v1/Building%20Interactive%20Data%20Visualizations%20with%20D3.js%20and%20React/world_population.csv", (d) => {
//           populationData = { ...populationData, [d.code]: +d.population };
//         }),
//       ]).then((fetchedData) => {
//         const topographyData = fetchedData[0];
//         setWorldPopulation(populationData);
//         setTopography(topographyData);
//       });

//       setLoading(false);
//     };

//     getData();
//   }, []);

//   // Aggregate disease data for each country
//   const diseaseData = searchResults.reduce((acc, item) => {
//     const country = item.Country;
//     const mortality = item.Mortality;
//     const price = item.Price;
//     const drugName = item.TradeName;
//     const drugSize = item.Size;

//     if (!acc[country]) {
//       acc[country] = {
//         diseaseCount: 0,
//         avgMortality: 0,
//         lowestPricedDrug: { price: Infinity, name: "", size: "" },
//       };
//     }

//     acc[country].diseaseCount += 1;
//     acc[country].avgMortality = (acc[country].avgMortality + mortality) / 2;

//     if (price < acc[country].lowestPricedDrug.price) {
//       acc[country].lowestPricedDrug = { price, name: drugName, size: drugSize };
//     }

//     return acc;
//   }, {});

//   // Get the disease name (assuming all search results belong to the same disease)
//   const diseaseName = searchResults.length > 0 ? searchResults[0].Disease : "Unknown Disease";

//   // Get the list of countries with disease data
//   const countriesWithDisease = [...new Set(searchResults.map((item) => item.Country))].join(", ");

//   if (loading) return <div>Loading...</div>;

//   return (
//     <div className="disease-search-page h-screen bg-gray-50 flex flex-col">
//       <div className="flex-grow overflow-hidden p-6">
//         <div className="flex items-center mb-4">
//           <h1 className="text-2xl font-bold text-gray-800">
//             Showing results for <span className="text-[#a6ce39]">{diseaseName}</span> in countries: <span className="text-[#a6ce39]">{countriesWithDisease}</span>
//           </h1>
//         </div>
//         <div className="flex h-[calc(100%-2rem)] gap-4">
//           {/* Left Panel: Map */}
//           <div className="w-2/3 bg-white border border-[#a6ce39] rounded-lg p-4 shadow-sm">
//             <WorldMap
//               width={650}
//               height={350}
//               data={{ worldPopulation, topography }}
//               diseaseData={diseaseData} // Pass diseaseData to WorldMap
//             />
//           </div>

//           {/* Right Panel: Scrollable Cards */}
//           <div className="w-1/3 overflow-y-auto pr-2 scrollbar-hide">
//             <div className="space-y-4 flex flex-col">
//               {searchResults.map((result, index) => (
//                 <Card key={index} className="bg-white border border-[#a6ce39] rounded-lg p-4 shadow-sm" 
//                 // onClick={() => toggleCardSelection(pub)}
//                 >
//                   <h2 className="text-xl font-semibold text-gray-800">{result.TradeName}</h2>
//                   <p className="text-gray-600">{result.Disease}</p>
//                   <p><strong>Price:</strong> ${result.Price}</p>
//                   <p><strong>Size:</strong> {result.Size}</p>
//                   <p><strong>Mortality Rate:</strong> {result.Mortality}%</p>
//                 </Card>
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
// };

// export default DiseaseSearchPage;



"use client"

import { useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import * as d3 from "d3";

import WorldMap from "./WorldMap"; // Import your WorldMap component
import { Card } from "./ui/card"; // Import Card from ShadCN UI
import { Button } from "@/components/ui/button";
import { Check, X, Download } from "lucide-react";

const DiseaseSearchPage = () => {
  const location = useLocation();
  const { searchResults } = location.state || {}; // Get the search results

  if (!searchResults) {
    return <div>No search results found.</div>;
  }

  const [worldPopulation, setWorldPopulation] = useState(null);
  const [topography, setTopography] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCards, setSelectedCards] = useState([]);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const getData = async () => {
      setLoading(true);

      let populationData = {};
      await Promise.all([
        d3.json("https://res.cloudinary.com/tropicolx/raw/upload/v1/Building%20Interactive%20Data%20Visualizations%20with%20D3.js%20and%20React/world.geojson"),
        d3.csv("https://res.cloudinary.com/tropicolx/raw/upload/v1/Building%20Interactive%20Data%20Visualizations%20with%20D3.js%20and%20React/world_population.csv", (d) => {
          populationData = { ...populationData, [d.code]: +d.population };
        }),
      ]).then((fetchedData) => {
        const topographyData = fetchedData[0];
        setWorldPopulation(populationData);
        setTopography(topographyData);
      });

      setLoading(false);
    };

    getData();
  }, []);

  // Aggregate disease data for each country
  const diseaseData = searchResults.reduce((acc, item) => {
    const country = item.Country;
    const mortality = item.Mortality;
    const price = item.Price;
    const drugName = item.TradeName;
    const drugSize = item.Size;

    if (!acc[country]) {
      acc[country] = {
        diseaseCount: 0,
        avgMortality: 0,
        lowestPricedDrug: { price: Infinity, name: "", size: "" },
      };
    }

    acc[country].diseaseCount += 1;
    acc[country].avgMortality = (acc[country].avgMortality + mortality) / 2;

    if (price < acc[country].lowestPricedDrug.price) {
      acc[country].lowestPricedDrug = { price, name: drugName, size: drugSize };
    }

    return acc;
  }, {});

  // Get the disease name (assuming all search results belong to the same disease)
  const diseaseName = searchResults.length > 0 ? searchResults[0].Disease : "Unknown Disease";

  // Get the list of countries with disease data
  const countriesWithDisease = [...new Set(searchResults.map((item) => item.Country))].join(", ");

  const handleCardSelection = (result) => {
    setSelectedCards((prevSelected) => {
      if (prevSelected.includes(result)) {
        return prevSelected.filter((item) => item !== result);
      } else {
        return [...prevSelected, result];
      }
    });
  };

  const handleExport = () => {
    setIsExporting(true);
    // Send the selected card data to a backend route
    fetch("/api/export-selected-cards", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ selectedCards }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Export successful", data);
        setIsExporting(false);
      })
      .catch((error) => {
        console.error("Error exporting selected cards:", error);
        setIsExporting(false);
      });
  };

  const handleSelectAll = () => {
    if (selectedCards.length === searchResults.length) {
      setSelectedCards([]);
    } else {
      setSelectedCards(searchResults);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="disease-search-page h-screen bg-gray-50 flex flex-col">
      <div className="flex-grow overflow-hidden p-6">
        <div className="flex items-center mb-4 gap-4 justify-between">
          <h1 className="text-2xl font-bold text-gray-800">
            Showing results for <span className="text-[#a6ce39]">{diseaseName}</span> in countries: <span className="text-[#a6ce39]">{countriesWithDisease}</span>
          </h1>
          <div className="flex items-center gap-4">
            <Button 
              onClick={handleSelectAll}
              className="bg-[#a6ce39] text-white hover:bg-[#95b833] rounded-[12px]"
            >
              {selectedCards.length === searchResults.length ? 'Unselect All' : 'Select All'}
            </Button>
            <Button 
              onClick={handleExport} 
              disabled={isExporting} 
              className={`bg-[#a6ce39] text-white hover:bg-[#95b833] rounded-[12px] flex items-center gap-2 ${isExporting ? 'cursor-not-allowed opacity-50' : ''}`}
            >
              <Download className="h-4 w-4" /> {isExporting ? 'Exporting...' : 'Export Selected'}
            </Button>
          </div>
        </div>
        <div className="flex h-[calc(100%-2rem)] gap-4">
          {/* Left Panel: Map */}
          <div className="w-2/3 bg-white border border-[#a6ce39] rounded-[12px] p-4 shadow-lg">
            <WorldMap
              width={650}
              height={350}
              data={{ worldPopulation, topography }}
              diseaseData={diseaseData} // Pass diseaseData to WorldMap
            />
          </div>

          {/* Right Panel: Scrollable Cards */}
          <div className="w-1/3 overflow-y-auto pr-2 scrollbar-hide">
            <div className="space-y-4 flex flex-col">
              {searchResults.map((result, index) => (
                <Card
                  key={index}
                  className={`bg-white border border-[#a6ce39] rounded-[12px] p-4 shadow-sm cursor-pointer relative ${selectedCards.includes(result) ? 'shadow-lg' : ''}`}
                  onClick={() => handleCardSelection(result)}
                >
                  {selectedCards.includes(result) && (
                    <div className="absolute top-2 right-2">
                      <X className="h-5 w-5 text-[#a6ce39]" />
                    </div>
                  )}
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">{result.TradeName}</h2>
                    <p className="text-gray-600">{result.Disease}</p>
                    <p><strong>Price:</strong> ${result.Price}</p>
                    <p><strong>Size:</strong> {result.Size}</p>
                    <p><strong>Mortality Rate:</strong> {result.Mortality}%</p>
                  </div>
                </Card>
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
};

export default DiseaseSearchPage;
