
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Visualize from "@/components/Visualize";
import Layout from "@/pages/Layout";
import Dashboard2 from "./components/Dashboard2";
import DiseaseSearchPage from "./components/DiseaseSearchPage";
import SelectedCardsTablePage from "./components/List";
import DrugResultsPage from "./components/DrugResultPage";
import SymptomResultsPage from "./components/SymptomsResultPage";
import DiseaseAnalysis from "./components/CompetitiveLandscapeSearchPage";
import PrivateRoute from "./components/PrivateRoute";
import Authenticate from "./components/Authenticate";
import { DrugComparisonTable } from "./components/DrugComparisonTable";
import CompetitorAnalysis from "./components/PricePrediction";
import DrugAnalysis from "./components/CompetitiveLandscapeDrugPage";
import CompetitiveLandscapeDrugPage from "./components/CompetitiveLandscapeDrugPage";
// import { Formulary } from "./components/Formulary";
import { FormularyDashboard } from "./components/Formulary/FormularyDashboard";
import TPPDrugPage from "./components/TPPDrugPage";
import { TPPComparison } from "./components/TPPComparison";
import { ComparePlans } from "./components/Formulary/ComparePlans";
import RNDFormulation from "./components/Rnd/RNDFormulation";
import DrugFormulation from './components/Rnd/DrugFormulation'
import FormularyDrugPage from "./components/Formulary/FormularyDrugPage";
import { FormularyComparison } from "@/components/Formulary/FormularyComparison";
import BenchmarkAnalysisPage from "@/components/Rnd/BenchmarkAnalysis";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Authenticate />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Layout type="dashboard"> {/* Pass type as 'dashboard' */}
                <Dashboard2 />
              </Layout>
            </PrivateRoute>
            
          }
        />
        <Route
          path="/visualize"
          element={
            <PrivateRoute>
              <Layout type="visualize"> 
                <Visualize />
              </Layout>
            </PrivateRoute>
            }
        />
        <Route path="/disease-search" element={<PrivateRoute><Layout><DiseaseSearchPage/></Layout></PrivateRoute>}/>
        <Route path="/drug-search" element={<PrivateRoute><Layout><DrugResultsPage/></Layout></PrivateRoute>}/>
        <Route path="/symptom-search" element={<PrivateRoute><Layout><SymptomResultsPage/></Layout></PrivateRoute>}/>
        <Route path="/list" element={<PrivateRoute><Layout><SelectedCardsTablePage /></Layout></PrivateRoute>} />
        <Route path="/competitive-landscape-by-disease" element={<PrivateRoute><Layout><DiseaseAnalysis /></Layout></PrivateRoute>} />
        <Route path="/competitive-landscape-by-drug" element={<PrivateRoute><Layout><CompetitiveLandscapeDrugPage /></Layout></PrivateRoute>} />
        <Route path="/drug-comparison" element={<PrivateRoute><Layout><DrugComparisonTable /></Layout></PrivateRoute>} />
        <Route path="/price-prediction" element={<PrivateRoute><Layout><CompetitorAnalysis /></Layout></PrivateRoute>} />
        <Route path="/formulary" element={<PrivateRoute><Layout><FormularyDashboard /></Layout></PrivateRoute>} />
        <Route path="/formulary-competitor" element={<PrivateRoute><Layout><FormularyDrugPage /></Layout></PrivateRoute>} />
        <Route path="/formulary-compare" element={<PrivateRoute><Layout><FormularyComparison /></Layout></PrivateRoute>} />
        <Route path="/tpp-by-drug" element={<PrivateRoute><Layout><TPPDrugPage/></Layout></PrivateRoute>} />
        <Route path="/tpp-comparison" element={<PrivateRoute><Layout><TPPComparison /></Layout></PrivateRoute>} />
        <Route path="/compare-plans" element={<PrivateRoute><Layout><ComparePlans/></Layout></PrivateRoute>} />
        <Route path="/rnd-formulation-ingredients" element={<PrivateRoute><Layout><RNDFormulation/></Layout></PrivateRoute>} />
        <Route path="/rnd-formulation-drugs" element={<PrivateRoute><Layout><DrugFormulation/></Layout></PrivateRoute>} />
        <Route path="/benchmark-analysis" element={<PrivateRoute><Layout><BenchmarkAnalysisPage/></Layout></PrivateRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
