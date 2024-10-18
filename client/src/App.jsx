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

function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <Layout type="dashboard"> {/* Pass type as 'dashboard' */}
              <Dashboard />
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
      </Routes>
    </Router>
  );
}

export default App;
