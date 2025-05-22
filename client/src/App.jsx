
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/pages/Layout";
import PrivateRoute from "./components/Authenticate/PrivateRoute";
import Authenticate from "./components/Authenticate/Authenticate";
import DrugFormulation from './components/Rnd/DrugFormulation'
import BioFormulate from "./pages/BioFormulate";
import BioFormulateLayout from "./pages/BioFormulateLayout";
import BenchmarkAnalysisPage from "./components/Rnd/BenchmarkAnalysis";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Authenticate />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <BioFormulateLayout type="dashboard">
                <BioFormulate />
              </BioFormulateLayout>
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
