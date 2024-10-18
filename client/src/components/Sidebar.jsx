// import React, { useState } from "react";
// import {
//   Search,
//   Grid,
//   Calendar,
//   Eye,
//   Briefcase,
//   ChartArea,
// } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import insimine from "@/assets/Insimine.svg";

// const Sidebar = () => {
//   const [visualization, setVisualization] = useState(true);
//   return (
//     <aside className="w-16 bg-white shadow-md sticky top-0 h-screen">
//       <div className="flex flex-col items-center py-4">
//         <div className="w-10 h-10 bg-white-200 rounded-full mb-8">
//           <img src={insimine} alt="insimine logo" />
//         </div>
//         <Button variant="ghost" size="icon" className="mb-4">
//           <Grid className="h-6 w-6" />
//         </Button>
//         <Button variant="ghost" size="icon" className="mb-4">
//           <ChartArea
//             className={`h-6 w-6 ${
//               visualization ? "text-[#95D524]" : "text-black"
//             }`}
//           />
//         </Button>
//         <Button variant="ghost" size="icon" className="mb-4">
//           <Search className="h-6 w-6" />
//         </Button>
//         <Button variant="ghost" size="icon" className="mb-4">
//           <Calendar className="h-6 w-6" />
//         </Button>
//         <Button variant="ghost" size="icon" className="mb-4">
//           <Eye className="h-6 w-6" />
//         </Button>
//         <Button variant="ghost" size="icon" className="mb-4">
//           <Briefcase className="h-6 w-6" />
//         </Button>
//       </div>
//     </aside>
//   );
// };

// export default Sidebar;

import React from "react";
import { Search, Grid, Calendar, Eye, Briefcase, ChartArea } from "lucide-react";
import { Button } from "@/components/ui/button";
import insimine from "@/assets/Insimine.svg";

const Sidebar = ({ type }) => {
  const isDashboard = type === "dashboard";
  const isVisualize = type === "visualize";

  return (
    <aside className="w-16 bg-white shadow-md sticky top-0 h-screen">
      <div className="flex flex-col items-center py-4">
        <div className="w-10 h-10 bg-white-200 rounded-full mb-8">
          <img src={insimine} alt="insimine logo" />
        </div>

        <Button variant="ghost" size="icon" className="mb-4">
          <Grid className={`h-6 w-6 ${isDashboard ? "text-[#95D524]" : "text-black"}`} />
        </Button>

        <Button variant="ghost" size="icon" className="mb-4">
          <ChartArea className={`h-6 w-6 ${isVisualize ? "text-[#95D524]" : "text-black"}`} />
        </Button>

        <Button variant="ghost" size="icon" className="mb-4">
          <Search className={`h-6 w-6 text-black`} />
        </Button>

        <Button variant="ghost" size="icon" className="mb-4">
          <Calendar className="h-6 w-6" />
        </Button>

        <Button variant="ghost" size="icon" className="mb-4">
          <Eye className="h-6 w-6" />
        </Button>

        <Button variant="ghost" size="icon" className="mb-4">
          <Briefcase className="h-6 w-6" />
        </Button>
      </div>
    </aside>
  );
};

export default Sidebar;
