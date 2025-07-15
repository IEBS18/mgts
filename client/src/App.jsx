
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/pages/Layout";
import Dashboard from "@/pages/Dashboard";
import DiseaseSearchPage from "./components/DiseaseOverview/DiseaseSearchPage";
import DrugResultsPage from "./components/DiseaseOverview/DrugResultPage";
import SymptomResultsPage from "./components/DiseaseOverview/SymptomsResultPage";
import DiseaseAnalysis from "./components/CompetitiveAnalysis/CompetitiveLandscapeSearchPage";
import PrivateRoute from "./components/Authenticate/PrivateRoute";
import Authenticate from "./components/Authenticate/Authenticate";
import { DrugComparisonTable } from "./components/DiseaseOverview/DrugComparisonTable";
import CompetitorAnalysis from "./components/PricePrediction/PricePrediction";
import CompetitiveLandscapeDrugPage from "./components/CompetitiveAnalysis/CompetitiveLandscapeDrugPage";
import { FormularyDashboard } from "./components/Formulary/FormularyDashboard";
import TPPDrugPage from "./components/DiseaseOverview/TPPDrugPage";
import { TPPComparison } from "./components/DiseaseOverview/TPPComparison";
import { ComparePlans } from "./components/Formulary/ComparePlans";
import RNDFormulation from "./components/Rnd/RNDFormulation";
import DrugFormulation from './components/Rnd/DrugFormulation'
import FormularyDrugPage from "./components/Formulary/FormularyDrugPage";
import { FormularyComparison } from "./components/Formulary/FormularyComparison";
import SettingsPage from "./components/Settings/Settings";
import HomePage from "./pages/HomePage";
import BioFormulate from "./pages/BioFormulate";
import BioFormulateLayout from "./pages/BioFormulateLayout";
import BenchmarkAnalysisPage from "./components/Rnd/BenchmarkAnalysis";
import DiseaseOverviewPage from "./components/DiseaseOverview/DiseaseOverviewPage";
import CompetitiveAnalysisPage from "./components/CompetitiveAnalysis/CompetitveAnalysisPage";
import PricePredictionPage from "./components/PricePrediction/PricePredictionPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Authenticate />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Layout type="dashboard">
                <HomePage />
              </Layout>
            </PrivateRoute>
          }
        />
        {/* <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Layout type="dashboard">
                <Dashboard />
              </Layout>
            </PrivateRoute>
          }
        /> */}
        {/* <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <BioFormulateLayout type="dashboard">
                <BioFormulate />
              </BioFormulateLayout>
            </PrivateRoute>
          }
        /> */}
        <Route
          path="/settings/:tab"
          element={
            <PrivateRoute>
              <Layout>
                <SettingsPage />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <PrivateRoute>
              <Layout>
                <SettingsPage />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path='/disease-overview'
          element={
            <PrivateRoute>
              <Layout>
                <DiseaseOverviewPage />
              </Layout>
            </PrivateRoute>
          }
          />
        <Route
          path="/disease-search"
          element={
            <PrivateRoute>
              <Layout>
                <DiseaseSearchPage />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/drug-search"
          element={
            <PrivateRoute>
              <Layout>
                <DrugResultsPage />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/symptom-search"
          element={
            <PrivateRoute>
              <Layout>
                <SymptomResultsPage />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path='/competitive-analysis'
          element={
            <PrivateRoute>
              <Layout>
                <CompetitiveAnalysisPage />
              </Layout>
            </PrivateRoute>
          }
          />
        <Route
          path="/competitive-landscape-by-disease"
          element={
            <PrivateRoute>
              <Layout>
                <DiseaseAnalysis />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/competitive-landscape-by-drug"
          element={
            <PrivateRoute>
              <Layout>
                <CompetitiveLandscapeDrugPage />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/drug-comparison"
          element={
            <PrivateRoute>
              <Layout>
                <DrugComparisonTable />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path='/price-prediction-modal'
          element={
            <PrivateRoute>
              <Layout>
                <PricePredictionPage />
              </Layout>
            </PrivateRoute>
          }
          />
        <Route
          path="/price-prediction"
          element={
            <PrivateRoute>
              <Layout>
                <CompetitorAnalysis />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/formulary"
          element={
            <PrivateRoute>
              <Layout>
                <FormularyDashboard />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/formulary-competitor"
          element={
            <PrivateRoute>
              <Layout>
                <FormularyDrugPage />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/formulary-compare"
          element={
            <PrivateRoute>
              <Layout>
                <FormularyComparison />
              </Layout>
            </PrivateRoute>
          }
        /> 
        <Route
          path="/tpp-by-drug"
          element={
            <PrivateRoute>
              <Layout>
                <TPPDrugPage />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/tpp-comparison"
          element={
            <PrivateRoute>
              <Layout>
                <TPPComparison />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/compare-plans"
          element={
            <PrivateRoute>
              <Layout>
                <ComparePlans />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/rnd-formulation-ingredients"
          element={
            <PrivateRoute>
              <Layout>
                <RNDFormulation />
              </Layout>
            </PrivateRoute>
          }
        />
       
        <Route
          path="/rnd-formulation-drugs"
          element={
            <PrivateRoute>
              <BioFormulateLayout>
                <DrugFormulation />
              </BioFormulateLayout>
            </PrivateRoute>
          }
        />
        {/* <Route
          path="/rnd-formulation-drugs"
          element={
            <PrivateRoute>
              <Layout>
                <DrugFormulation />
              </Layout>
            </PrivateRoute>
          }
        /> */}
        <Route
          path="/benchmark-analysis"
          element={
            <PrivateRoute>
              <Layout>
                <BenchmarkAnalysisPage />
              </Layout>
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
