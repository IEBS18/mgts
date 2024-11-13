// import React from "react";
// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import Dashboard from "@/components/Dashboard";
// import Visualize from "@/components/Visualize";

// function App() {
//   return (
//     <Router>
//       <Routes>
//         <Route
//           path="/"
//           element={
//             <Layout>
//               <Dashboard />
//             </Layout>
//           }
//         />
//         <Route
//           path="/visualize"
//           element={
//             <Layout>
//               <Visualize />
//             </Layout>
//           }
//         />
//       </Routes>
//     </Router>
//   );
// }

// export default App;


import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "@/components/Dashboard";
import Visualize from "@/components/Visualize";
import Layout from "@/pages/Layout";
import Dashboard2 from "./components/Dashboard2";
import DiseaseSearchPage from "./components/DiseaseSearchPage";
import SelectedCardsTablePage from "./components/List";
import DrugResultsPage from "./components/DrugResultPage";
import SymptomResultsPage from "./components/SymptomsResultPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <Layout type="dashboard"> {/* Pass type as 'dashboard' */}
              <Dashboard2 />
            </Layout>
          }
        />
        <Route
          path="/visualize"
          element={
            <Layout type="visualize"> {/* Pass type as 'visualize' */}
              <Visualize />
            </Layout>
          }
        />
        <Route path="/disease-search" element={<Layout><DiseaseSearchPage/></Layout>}/>
        <Route path="/drug-search" element={<Layout><DrugResultsPage/></Layout>}/>
        <Route path="//symptom-search" element={<Layout><SymptomResultsPage/></Layout>}/>
        <Route path="/list" element={<Layout><SelectedCardsTablePage /></Layout>} />
      </Routes>
    </Router>
  );
}

export default App;
