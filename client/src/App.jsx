
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Visualize from "@/components/Visualize";
import Layout from "@/pages/Layout";
import Dashboard2 from "./components/Dashboard2";
import DiseaseSearchPage from "./components/DiseaseSearchPage";
import SelectedCardsTablePage from "./components/List";
import DrugResultsPage from "./components/DrugResultPage";
import SymptomResultsPage from "./components/SymptomsResultPage";
import CompetitiveLandscapeSearchPage from "./components/CompetitiveLandscapeSearchPage";

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
        <Route path="/symptom-search" element={<Layout><SymptomResultsPage/></Layout>}/>
        <Route path="/list" element={<Layout><SelectedCardsTablePage /></Layout>} />
        <Route path="/competitive-landscape" element={<Layout><CompetitiveLandscapeSearchPage /></Layout>} />
      </Routes>
    </Router>
  );
}

export default App;
