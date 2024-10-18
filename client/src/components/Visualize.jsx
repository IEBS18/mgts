// "use client";

// import React, { useEffect, useState } from "react";
// import { useLocation } from "react-router-dom";
// import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// // Helper function for KPI cards
// const KPICard = ({ title, value }) => (
//   <div className="w-full sm:w-1/3 p-2">
//     <div className="bg-white rounded-lg shadow-md p-4">
//       <h3 className="text-gray-600 font-medium">{title}</h3>
//       <h2 className="text-2xl font-bold">{value}</h2>
//     </div>
//   </div>
// );

// export default function Visualize() {
//   const location = useLocation();
//   const searchData = location.state?.searchData;

//   const [df, setDf] = useState([]);
//   const [kpis, setKPIs] = useState({ totalProducts: 0, uniqueIngredients: 0, totalOrganizations: 0 });
//   const [topCompaniesData, setTopCompaniesData] = useState([]);
//   const [topIngredientsData, setTopIngredientsData] = useState([]);
//   const [routesOfAdminData, setRoutesOfAdminData] = useState([]);

//   // Data for Drug Disease Landscape (Tab 2)
//   const [diseaseKPIs, setDiseaseKPIs] = useState({ totalDiseases: 0, uniqueProducts: 0, totalRoutes: 0 });
//   const [topDiseasesData, setTopDiseasesData] = useState([]);
//   const [topDrugsByDiseaseData, setTopDrugsByDiseaseData] = useState([]);
//   const [topCompaniesByDiseaseData, setTopCompaniesByDiseaseData] = useState([]);

//   useEffect(() => {
//     if (searchData) {
//       // Data Preprocessing for Tab 1 (Product Intelligence)
//       let ddData = searchData.filter((doc) => doc.type === "drugdisease");

//       // Split and extract unique values for Ingredients, Routes_of_Administration, and Diseases
//       ddData = ddData.map((item) => ({
//         ...item,
//         Ingredients: item.Ingredients ? item.Ingredients.split('|').map((ing) => ing.trim()) : [],
//         Routes_of_Administration: item.Routes_of_Administration
//           ? item.Routes_of_Administration.split('|').map((route) => route.trim())
//           : [],
//         Diseases: item.Diseases ? item.Diseases.split('|').map((disease) => disease.trim()) : [],
//         Product_Name: item.Product_Name.toLowerCase(),
//       }));

//       setDf(ddData);

//       // KPIs for Product Intelligence (Tab 1)
//       const totalProducts = new Set(ddData.map((item) => item.Product_Name)).size;
//       const uniqueIngredients = new Set(ddData.flatMap((item) => item.Ingredients)).size;
//       const totalOrganizations = new Set(ddData.map((item) => item.Organization_Name)).size;

//       setKPIs({ totalProducts, uniqueIngredients, totalOrganizations });

//       // Top 10 Companies by Number of Drugs
//       const companyCounts = ddData.reduce((acc, item) => {
//         const org = item.Organization_Name || "Unknown";
//         acc[org] = (acc[org] || 0) + 1;
//         return acc;
//       }, {});

//       const topCompanies = Object.entries(companyCounts)
//         .sort((a, b) => b[1] - a[1])
//         .slice(0, 10)
//         .map(([name, count]) => ({ name, count }));

//       setTopCompaniesData(topCompanies);

//       // Top 20 Ingredients by Count
//       const ingredientCounts = ddData.reduce((acc, item) => {
//         item.Ingredients.forEach((ingredient) => {
//           acc[ingredient] = (acc[ingredient] || 0) + 1;
//         });
//         return acc;
//       }, {});

//       const topIngredients = Object.entries(ingredientCounts)
//         .sort((a, b) => b[1] - a[1])
//         .slice(0, 20)
//         .map(([name, count]) => ({ name, count }));

//       setTopIngredientsData(topIngredients);

//       // Dosage Administration Routes Distribution
//       const routesCounts = ddData.reduce((acc, item) => {
//         item.Routes_of_Administration.forEach((route) => {
//           acc[route] = (acc[route] || 0) + 1;
//         });
//         return acc;
//       }, {});

//       const routesOfAdmin = Object.entries(routesCounts)
//         .sort((a, b) => b[1] - a[1])
//         .slice(0, 10)
//         .map(([name, count]) => ({ name, count }));

//       setRoutesOfAdminData(routesOfAdmin);

//       // ========================
//       // Drug Disease Landscape Data (Tab 2)
//       // ========================
//       // KPIs
//       const totalDiseases = new Set(ddData.flatMap((item) => item.Diseases)).size;
//       const uniqueProducts = new Set(ddData.filter((item) => item.Diseases.length > 0).map((item) => item.Product_Name)).size;
//       const totalRoutes = new Set(ddData.flatMap((item) => item.Routes_of_Administration)).size;

//       setDiseaseKPIs({ totalDiseases, uniqueProducts, totalRoutes });

//       // Top 10 Diseases
//       const diseaseCounts = ddData.reduce((acc, item) => {
//         item.Diseases.forEach((disease) => {
//           acc[disease] = (acc[disease] || 0) + 1;
//         });
//         return acc;
//       }, {});

//       const topDiseases = Object.entries(diseaseCounts)
//         .sort((a, b) => b[1] - a[1])
//         .slice(0, 10)
//         .map(([name, count]) => ({ name, count }));

//       setTopDiseasesData(topDiseases);

//       // Top 10 Drugs Treating Most Diseases
//       const drugsByDiseaseCounts = ddData.filter((item) => item.Diseases.length > 0).reduce((acc, item) => {
//         acc[item.Product_Name] = (acc[item.Product_Name] || 0) + 1;
//         return acc;
//       }, {});

//       const topDrugsByDisease = Object.entries(drugsByDiseaseCounts)
//         .sort((a, b) => b[1] - a[1])
//         .slice(0, 10)
//         .map(([name, count]) => ({ name, count }));

//       setTopDrugsByDiseaseData(topDrugsByDisease);

//       // Top 10 Companies by Number of Diseases Treated
//       const companiesByDiseaseCounts = ddData.reduce((acc, item) => {
//         const org = item.Organization_Name || "Unknown";
//         acc[org] = (acc[org] || 0) + item.Diseases.length;
//         return acc;
//       }, {});

//       const topCompaniesByDisease = Object.entries(companiesByDiseaseCounts)
//         .sort((a, b) => b[1] - a[1])
//         .slice(0, 10)
//         .map(([name, count]) => ({ name, count }));

//       setTopCompaniesByDiseaseData(topCompaniesByDisease);
//     }
//   }, [searchData]);

//   const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#FF6384", "#36A2EB", "#FFCE56", "#33FF57", "#FF33B5"];

//   return (
//     <div className="container mx-auto p-6 bg-gray-50 rounded-lg shadow-lg">
//       <h1 className="text-3xl font-bold mb-6">PharmaX Dashboard</h1>

//       {/* KPI Cards */}


//       <Tabs defaultValue="tab1" className="w-full">
//         <TabsList className="grid grid-cols-5 bg-gray-100 rounded-md p-1 mb-4 shadow-sm">
//           <TabsTrigger
//             value="tab1"
//             className="text-gray-700 font-semibold focus:outline-none transition-colors duration-200 ease-in-out 
//                        data-[state=active]:bg-[#4CAF50] data-[state=active]:shadow-md data-[state=active]:text-white"
//           >
//             Product Intelligence
//           </TabsTrigger>
//           <TabsTrigger
//             value="tab2"
//             className="text-gray-700 font-semibold focus:outline-none transition-colors duration-200 ease-in-out 
//                        data-[state=active]:bg-[#4CAF50] data-[state=active]:shadow-md data-[state=active]:text-white"
//           >
//             Drug Disease Landscape
//           </TabsTrigger>
//           <TabsTrigger
//             value="tab3"
//             className="text-gray-700 font-semibold focus:outline-none transition-colors duration-200 ease-in-out 
//                        data-[state=active]:bg-[#4CAF50] data-[state=active]:shadow-md data-[state=active]:text-white"
//           >
//             Clinical Studies
//           </TabsTrigger>
//           <TabsTrigger
//             value="tab4"
//             className="text-gray-700 font-semibold focus:outline-none transition-colors duration-200 ease-in-out 
//                        data-[state=active]:bg-[#4CAF50] data-[state=active]:shadow-md data-[state=active]:text-white"
//           >
//             Scientific Literature
//           </TabsTrigger>
//           <TabsTrigger
//             value="tab5"
//             className="text-gray-700 font-semibold focus:outline-none transition-colors duration-200 ease-in-out 
//                        data-[state=active]:bg-[#4CAF50] data-[state=active]:shadow-md data-[state=active]:text-white"
//           >
//             Intellectual Property
//           </TabsTrigger>
//         </TabsList>

//         {/* Tab 1: Product Intelligence */}
//         <TabsContent value="tab1">
//           <Card className="shadow-sm mb-6">
//             <CardHeader className="border-b">
//               <CardTitle className="text-xl font-semibold">Product Intelligence</CardTitle>
//               <CardDescription>Insights into drug and ingredient distributions.</CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-6">
//             <div className="flex flex-wrap justify-between mb-6">
//         <KPICard title="Total Drugs" value={kpis.totalProducts} />
//         <KPICard title="Unique Ingredients" value={kpis.uniqueIngredients} />
//         <KPICard title="Total Companies" value={kpis.totalOrganizations} />
//       </div>
//               <div>
//                 <h3 className="text-lg font-semibold mb-4 text-gray-700">Top 10 Companies by Number of Drugs</h3>
//                 <ResponsiveContainer width="100%" height={400}>
//                   <BarChart data={topCompaniesData}>
//                     <XAxis dataKey="name" />
//                     <YAxis />
//                     <Tooltip />
//                     <Bar dataKey="count" fill="#4CAF50" />
//                   </BarChart>
//                 </ResponsiveContainer>
//               </div>

//               <div>
//                 <h3 className="text-lg font-semibold mb-4 text-gray-700">Dosage Administration Routes Distribution</h3>
//                 <ResponsiveContainer width="100%" height={400}>
//                   <PieChart>
//                     <Pie data={routesOfAdminData} dataKey="count" outerRadius={150} fill="#FF5722" label>
//                       {routesOfAdminData.map((entry, index) => (
//                         <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                       ))}
//                     </Pie>
//                     <Tooltip />
//                   </PieChart>
//                 </ResponsiveContainer>
//               </div>

//               <div>
//                 <h3 className="text-lg font-semibold mb-4 text-gray-700">Top 20 Ingredients</h3>
//                 <ResponsiveContainer width="100%" height={400}>
//                   <BarChart data={topIngredientsData}>
//                     <XAxis dataKey="name" />
//                     <YAxis />
//                     <Tooltip />
//                     <Bar dataKey="count" fill="#2196F3" />
//                   </BarChart>
//                 </ResponsiveContainer>
//               </div>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         {/* Tab 2: Drug Disease Landscape */}
//         <TabsContent value="tab2">
//           <Card className="shadow-sm mb-6">
//             <CardHeader className="border-b">
//               <CardTitle className="text-xl font-semibold">Drug Disease Landscape</CardTitle>
//               <CardDescription>Insights into diseases and drugs.</CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-6">
//               {/* KPI Cards for Tab 2 */}
//               <div className="flex flex-wrap justify-between mb-6">
//                 <KPICard title="Total Diseases" value={diseaseKPIs.totalDiseases} />
//                 <KPICard title="Drugs Treating Multiple Diseases" value={diseaseKPIs.uniqueProducts} />
//                 <KPICard title="Dosage Administration Routes" value={diseaseKPIs.totalRoutes} />
//               </div>

//               <div>
//                 <h3 className="text-lg font-semibold mb-4 text-gray-700">Top 10 Drugs Treating Most Diseases</h3>
//                 <ResponsiveContainer width="100%" height={400}>
//                   <BarChart data={topDrugsByDiseaseData}>
//                     <XAxis dataKey="name" />
//                     <YAxis />
//                     <Tooltip />
//                     <Bar dataKey="count" fill="#4CAF50" />
//                   </BarChart>
//                 </ResponsiveContainer>
//               </div>

//               <div>
//                 <h3 className="text-lg font-semibold mb-4 text-gray-700">Most Occurred Diseases</h3>
//                 <ResponsiveContainer width="100%" height={400}>
//                   <PieChart>
//                     <Pie data={topDiseasesData} dataKey="count" outerRadius={150} fill="#FF5722" label>
//                       {topDiseasesData.map((entry, index) => (
//                         <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                       ))}
//                     </Pie>
//                     <Tooltip />
//                   </PieChart>
//                 </ResponsiveContainer>
//               </div>

//               <div>
//                 <h3 className="text-lg font-semibold mb-4 text-gray-700">Top 10 Companies by Number of Diseases Treated</h3>
//                 <ResponsiveContainer width="100%" height={400}>
//                   <BarChart data={topCompaniesByDiseaseData}>
//                     <XAxis dataKey="name" />
//                     <YAxis />
//                     <Tooltip />
//                     <Bar dataKey="count" fill="#2196F3" />
//                   </BarChart>
//                 </ResponsiveContainer>
//               </div>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         {/* Add content for other tabs like Clinical Studies, Scientific Literature, etc. */}
//       </Tabs>
//     </div>
//   );
// }

"use client";

import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Helper function for KPI cards
const KPICard = ({ title, value }) => (
  <div className="w-full sm:w-1/3 p-2">
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="text-gray-600 font-medium">{title}</h3>
      <h2 className="text-2xl font-bold">{value}</h2>
    </div>
  </div>
);

export default function Visualize() {
  const location = useLocation();
  const searchData = location.state?.searchData;

  const [df, setDf] = useState([]);
  const [kpis, setKPIs] = useState({ totalProducts: 0, uniqueIngredients: 0, totalOrganizations: 0 });
  const [topCompaniesData, setTopCompaniesData] = useState([]);
  const [topIngredientsData, setTopIngredientsData] = useState([]);
  const [routesOfAdminData, setRoutesOfAdminData] = useState([]);

  // Data for Drug Disease Landscape (Tab 2)
  const [diseaseKPIs, setDiseaseKPIs] = useState({ totalDiseases: 0, uniqueProducts: 0, totalRoutes: 0 });
  const [topDiseasesData, setTopDiseasesData] = useState([]);
  const [topDrugsByDiseaseData, setTopDrugsByDiseaseData] = useState([]);
  const [topCompaniesByDiseaseData, setTopCompaniesByDiseaseData] = useState([]);

  // Data for Clinical Studies (Tab 3)
  const [clinicalKPIs, setClinicalKPIs] = useState({ totalStudies: 0, totalDiseases: 0, totalDrugs: 0 });
  const [topDrugsData, setTopDrugsData] = useState([]);
  const [topDiseasesClinicalData, setTopDiseasesClinicalData] = useState([]);
  const [studyStatusData, setStudyStatusData] = useState([]);
  const [topSponsorsData, setTopSponsorsData] = useState([]);
  const [phasesDistributionData, setPhasesDistributionData] = useState([]);

  useEffect(() => {
    if (searchData) {
      // Data Preprocessing for Tab 1 (Product Intelligence)
      let ddData = searchData.filter((doc) => doc.type === "drugdisease");

      // Split and extract unique values for Ingredients, Routes_of_Administration, and Diseases
      ddData = ddData.map((item) => ({
        ...item,
        Ingredients: item.Ingredients ? item.Ingredients.split('|').map((ing) => ing.trim()) : [],
        Routes_of_Administration: item.Routes_of_Administration
          ? item.Routes_of_Administration.split('|').map((route) => route.trim())
          : [],
        Diseases: item.Diseases ? item.Diseases.split('|').map((disease) => disease.trim()) : [],
        Product_Name: item.Product_Name.toLowerCase(),
      }));

      setDf(ddData);

      // KPIs for Product Intelligence (Tab 1)
      const totalProducts = new Set(ddData.map((item) => item.Product_Name)).size;
      const uniqueIngredients = new Set(ddData.flatMap((item) => item.Ingredients)).size;
      const totalOrganizations = new Set(ddData.map((item) => item.Organization_Name)).size;

      setKPIs({ totalProducts, uniqueIngredients, totalOrganizations });

      // Top 10 Companies by Number of Drugs
      const companyCounts = ddData.reduce((acc, item) => {
        const org = item.Organization_Name || "Unknown";
        acc[org] = (acc[org] || 0) + 1;
        return acc;
      }, {});

      const topCompanies = Object.entries(companyCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([name, count]) => ({ name, count }));

      setTopCompaniesData(topCompanies);

      // Top 20 Ingredients by Count
      const ingredientCounts = ddData.reduce((acc, item) => {
        item.Ingredients.forEach((ingredient) => {
          acc[ingredient] = (acc[ingredient] || 0) + 1;
        });
        return acc;
      }, {});

      const topIngredients = Object.entries(ingredientCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20)
        .map(([name, count]) => ({ name, count }));

      setTopIngredientsData(topIngredients);

      // Dosage Administration Routes Distribution
      const routesCounts = ddData.reduce((acc, item) => {
        item.Routes_of_Administration.forEach((route) => {
          acc[route] = (acc[route] || 0) + 1;
        });
        return acc;
      }, {});

      const routesOfAdmin = Object.entries(routesCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([name, count]) => ({ name, count }));

      setRoutesOfAdminData(routesOfAdmin);

      // ========================
      // Drug Disease Landscape Data (Tab 2)
      // ========================
      // KPIs
      const totalDiseases = new Set(ddData.flatMap((item) => item.Diseases)).size;
      const uniqueProducts = new Set(ddData.filter((item) => item.Diseases.length > 0).map((item) => item.Product_Name)).size;
      const totalRoutes = new Set(ddData.flatMap((item) => item.Routes_of_Administration)).size;

      setDiseaseKPIs({ totalDiseases, uniqueProducts, totalRoutes });

      // Top 10 Diseases
      const diseaseCounts = ddData.reduce((acc, item) => {
        item.Diseases.forEach((disease) => {
          acc[disease] = (acc[disease] || 0) + 1;
        });
        return acc;
      }, {});

      const topDiseases = Object.entries(diseaseCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([name, count]) => ({ name, count }));

      setTopDiseasesData(topDiseases);

      // Top 10 Drugs Treating Most Diseases
      const drugsByDiseaseCounts = ddData.filter((item) => item.Diseases.length > 0).reduce((acc, item) => {
        acc[item.Product_Name] = (acc[item.Product_Name] || 0) + 1;
        return acc;
      }, {});

      const topDrugsByDisease = Object.entries(drugsByDiseaseCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([name, count]) => ({ name, count }));

      setTopDrugsByDiseaseData(topDrugsByDisease);

      // Top 10 Companies by Number of Diseases Treated
      const companiesByDiseaseCounts = ddData.reduce((acc, item) => {
        const org = item.Organization_Name || "Unknown";
        acc[org] = (acc[org] || 0) + item.Diseases.length;
        return acc;
      }, {});

      const topCompaniesByDisease = Object.entries(companiesByDiseaseCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([name, count]) => ({ name, count }));

      setTopCompaniesByDiseaseData(topCompaniesByDisease);

      // ========================
      // Clinical Studies Data (Tab 3)
      // ========================
      const ctoData = searchData.filter((doc) => doc.type === "clinicaltrial");

      // KPIs for Clinical Studies
      const totalStudies = new Set(ctoData.map((item) => item["NCT Number"])).size;
      const totalDiseasesClinical = new Set(ctoData.map((item) => item.Conditions)).size;
      const totalDrugs = new Set(ctoData.map((item) => item.Interventions)).size;

      setClinicalKPIs({ totalStudies, totalDiseases: totalDiseasesClinical, totalDrugs });

      // Top 10 Drugs in Clinical Studies
      const drugCounts = ctoData.reduce((acc, item) => {
        acc[item.Interventions] = (acc[item.Interventions] || 0) + 1;
        return acc;
      }, {});

      const topDrugs = Object.entries(drugCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([name, count]) => ({ name, count }));

      setTopDrugsData(topDrugs);

      // Top 10 Diseases in Clinical Studies
      const diseaseClinicalCounts = ctoData.reduce((acc, item) => {
        acc[item.Conditions] = (acc[item.Conditions] || 0) + 1;
        return acc;
      }, {});

      const topDiseasesClinical = Object.entries(diseaseClinicalCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([name, count]) => ({ name, count }));

      setTopDiseasesClinicalData(topDiseasesClinical);

      // Study Status Distribution
      const statusCounts = ctoData.reduce((acc, item) => {
        acc[item["Study Status"]] = (acc[item["Study Status"]] || 0) + 1;
        return acc;
      }, {});

      const studyStatus = Object.entries(statusCounts).map(([name, count]) => ({ name, count }));
      setStudyStatusData(studyStatus);

      // Top 10 Sponsors by Number of Studies
      const sponsorCounts = ctoData.reduce((acc, item) => {
        acc[item.Sponsor] = (acc[item.Sponsor] || 0) + 1;
        return acc;
      }, {});

      const topSponsors = Object.entries(sponsorCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([name, count]) => ({ name, count }));

      setTopSponsorsData(topSponsors);

      // Phases Distribution
      const phaseCounts = ctoData.reduce((acc, item) => {
        acc[item.Phases] = (acc[item.Phases] || 0) + 1;
        return acc;
      }, {});

      const phasesDistribution = Object.entries(phaseCounts).map(([name, count]) => ({ name, count }));
      setPhasesDistributionData(phasesDistribution);
    }
  }, [searchData]);

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#FF6384", "#36A2EB", "#FFCE56", "#33FF57", "#FF33B5"];

  return (
    <div className="container mx-auto p-6 bg-gray-50 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-6">PharmaX Dashboard</h1>

      <Tabs defaultValue="tab1" className="w-full">
        <TabsList className="grid grid-cols-5 bg-gray-100 rounded-md p-1 mb-4 shadow-sm">
          <TabsTrigger
            value="tab1"
            className="text-gray-700 font-semibold focus:outline-none transition-colors duration-200 ease-in-out 
                       data-[state=active]:bg-[#4CAF50] data-[state=active]:shadow-md data-[state=active]:text-white"
          >
            Product Intelligence
          </TabsTrigger>
          <TabsTrigger
            value="tab2"
            className="text-gray-700 font-semibold focus:outline-none transition-colors duration-200 ease-in-out 
                       data-[state=active]:bg-[#4CAF50] data-[state=active]:shadow-md data-[state=active]:text-white"
          >
            Drug Disease Landscape
          </TabsTrigger>
          <TabsTrigger
            value="tab3"
            className="text-gray-700 font-semibold focus:outline-none transition-colors duration-200 ease-in-out 
                       data-[state=active]:bg-[#4CAF50] data-[state=active]:shadow-md data-[state=active]:text-white"
          >
            Clinical Studies
          </TabsTrigger>
          <TabsTrigger
            value="tab4"
            className="text-gray-700 font-semibold focus:outline-none transition-colors duration-200 ease-in-out 
                       data-[state=active]:bg-[#4CAF50] data-[state=active]:shadow-md data-[state=active]:text-white"
          >
            Scientific Literature
          </TabsTrigger>
          <TabsTrigger
            value="tab5"
            className="text-gray-700 font-semibold focus:outline-none transition-colors duration-200 ease-in-out 
                       data-[state=active]:bg-[#4CAF50] data-[state=active]:shadow-md data-[state=active]:text-white"
          >
            Intellectual Property
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Product Intelligence */}
        <TabsContent value="tab1">
          <Card className="shadow-sm mb-6">
            <CardHeader className="border-b">
              <CardTitle className="text-xl font-semibold">Product Intelligence</CardTitle>
              <CardDescription>Insights into drug and ingredient distributions.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-wrap justify-between mb-6">
                <KPICard title="Total Drugs" value={kpis.totalProducts} />
                <KPICard title="Unique Ingredients" value={kpis.uniqueIngredients} />
                <KPICard title="Total Companies" value={kpis.totalOrganizations} />
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-700">Top 10 Companies by Number of Drugs</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={topCompaniesData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#4CAF50" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-700">Dosage Administration Routes Distribution</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie data={routesOfAdminData} dataKey="count" outerRadius={150} fill="#FF5722" label>
                      {routesOfAdminData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-700">Top 20 Ingredients</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={topIngredientsData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#2196F3" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Drug Disease Landscape */}
        <TabsContent value="tab2">
          <Card className="shadow-sm mb-6">
            <CardHeader className="border-b">
              <CardTitle className="text-xl font-semibold">Drug Disease Landscape</CardTitle>
              <CardDescription>Insights into diseases and drugs.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* KPI Cards for Tab 2 */}
              <div className="flex flex-wrap justify-between mb-6">
                <KPICard title="Total Diseases" value={diseaseKPIs.totalDiseases} />
                <KPICard title="Drugs Treating Multiple Diseases" value={diseaseKPIs.uniqueProducts} />
                <KPICard title="Dosage Administration Routes" value={diseaseKPIs.totalRoutes} />
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-700">Top 10 Drugs Treating Most Diseases</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={topDrugsByDiseaseData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#4CAF50" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-700">Most Occurred Diseases</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie data={topDiseasesData} dataKey="count" outerRadius={150} fill="#FF5722" label>
                      {topDiseasesData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-700">Top 10 Companies by Number of Diseases Treated</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={topCompaniesByDiseaseData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#2196F3" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Clinical Studies */}
        <TabsContent value="tab3">
          <Card className="shadow-sm mb-6">
            <CardHeader className="border-b">
              <CardTitle className="text-xl font-semibold">Clinical Studies</CardTitle>
              <CardDescription>Insights into clinical trials data.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* KPI Cards for Tab 3 */}
              <div className="flex flex-wrap justify-between mb-6">
                <KPICard title="Total Clinical Studies" value={clinicalKPIs.totalStudies} />
                <KPICard title="Total Diseases" value={clinicalKPIs.totalDiseases} />
                <KPICard title="Total Drugs" value={clinicalKPIs.totalDrugs} />
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-700">Top 10 Drugs in Clinical Studies</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={topDrugsData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#4CAF50" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-700">Top 10 Diseases in Clinical Studies</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={topDiseasesClinicalData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#2196F3" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-700">Study Status Distribution</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie data={studyStatusData} dataKey="count" outerRadius={150} fill="#FF5722" label>
                      {studyStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-700">Top 10 Sponsors by Number of Studies</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={topSponsorsData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#FFCE56" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-700">Phases Distribution</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie data={phasesDistributionData} dataKey="count" outerRadius={150} fill="#36A2EB" label>
                      {phasesDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Add content for other tabs like Scientific Literature, Intellectual Property, etc. */}
      </Tabs>
    </div>
  );
}
