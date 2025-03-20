// import React, { useState } from "react";
// import { Button } from "@/components/ui/button";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Label } from "@/components/ui/label";
// import { useNavigate } from "react-router-dom";

// import RnD from "../../assets/dashboard/research-and-development.png";

// export default function RNDFormulationModal({ isOpen, onOpenChange }) {
//   const [ingredientName, setIngredientName] = useState("");
//   const navigate = useNavigate();

//   // Define optional topics:
//   const optionalTabs = [
//     "Stability Conditions",
//     "Interaction",
//     "Composition",
//     "Composition Characteristics",
//     "Interaction Components",
//     "Solution Form",
//     "Testing Conditions",
//     "Stability Test Results",
//     "Dissolution Study",
//     "Safety Study Results",
//     "Efficacy Studies",
//     "Toxicity Studies",
//     "Application",
//     "IEB Comment (Summary)",
//   ];

//   // Track which optional tabs are selected:
//   const [selectedTabs, setSelectedTabs] = useState([]);

//   // Toggle selection of a tab:
//   const handleTabClick = (tab) => {
//     if (selectedTabs.includes(tab)) {
//       setSelectedTabs((prev) => prev.filter((t) => t !== tab));
//     } else {
//       setSelectedTabs((prev) => [...prev, tab]);
//     }
//   };

//   const handleSearchSubmit = () => {
//     if (!ingredientName.trim()) return;
//     // Pass the user query and selected tabs to RNDFormulation
//     navigate("/rnd-formulation", {
//       state: {
//         userQuery: ingredientName,
//         selectedTabs,
//       },
//     });
//   };

//   return (
//     <Dialog open={isOpen} onOpenChange={onOpenChange}>
//       <DialogContent
//         className="max-w-3xl bg-dialog rounded-[12px] overflow-y-auto"
//         style={{
//           position: "fixed",
//           top: "10%",
//           left: "50%",
//           transform: "translateX(-50%)",
//           maxHeight: "80vh",
//           width: "100%",
//         }}
//       >
//         <DialogHeader className="space-y-4">
//           <div className="space-y-2">
//             <div className="flex items-center gap-2">
//               <DialogTitle className="flex flex-row items-center justify-center text-white rounded-lg">
//                 <div className="flex items-center justify-center w-12 h-12 border-2 border-white rounded-full mr-4">
//                   <img
//                     src={RnD}
//                     alt="R&D icon"
//                     className="w-6 h-6 object-contain"
//                   />
//                 </div>
//                 <p className="text-lg font-medium">R&D Formulation</p>
//               </DialogTitle>
//             </div>
//             <p className="text-sm text-white">
//               A brief description about what R&D and Formulations do and its basic functionality
//             </p>
//           </div>
//         </DialogHeader>

//         {/* Main Content */}
//         <div className="bg-white p-4 rounded-[20px] mt-4 space-y-4">
//           {/* Ingredient Name Input */}
//           <div>
//             <Label htmlFor="ingredient-name" className="text-gray-700">
//               Ingredient Name
//             </Label>
//             <input
//               id="ingredient-name"
//               type="text"
//               value={ingredientName}
//               onChange={(e) => setIngredientName(e.target.value)}
//               placeholder="Type Ingredient Name"
//               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none"
//             />
//           </div>

//           {/* Tabs for optional topics */}
//           <div>
//             <Label className="text-gray-700 mb-2 block">
//               Select Additional Topics (Tabs)
//             </Label>
//             <div className="flex flex-wrap gap-2">
//               {optionalTabs.map((tab) => {
//                 const isSelected = selectedTabs.includes(tab);
//                 return (
//                   <Button
//                     key={tab}
//                     onClick={() => handleTabClick(tab)}
//                     variant="outline"
//                     className={
//                       isSelected
//                         ? "bg-[#54681D] text-white hover:bg-[#54681D]/80 rounded-lg"
//                         : "text-[#54681D] hover:bg-[#f0f8e5] border-[#54681D] rounded-lg"
//                     }
//                   >
//                     {tab}
//                   </Button>
//                 );
//               })}
//             </div>
//           </div>

//           {/* Submit Button */}
//           <div className="flex justify-center">
//             <Button
//               onClick={handleSearchSubmit}
//               className="w-[120px] bg-[#54681D] text-white hover:bg-[#95b833] rounded-[60px] mt-4"
//             >
//               Submit
//             </Button>
//           </div>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }


import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

import RnD from "../../assets/dashboard/research-and-development.png";

export default function RNDFormulationModal({ isOpen, onOpenChange }) {
  const navigate = useNavigate();

  // Track which tab is active
  const [activeTab, setActiveTab] = useState("ingredient");

  // State for "Search by Ingredient"
  const [ingredientName, setIngredientName] = useState("");
  const [selectedTabsIngredient, setSelectedTabsIngredient] = useState([]);

  // State for "Search by Drug"
  const [drugName, setDrugName] = useState("");
  // Preselect "Disease Name" and "Source" by default
  const [selectedTabsDrug, setSelectedTabsDrug] = useState(["Disease",
    "Diseases_PMC_ID",
    "Drug_PMC_ID",
    "Justification for Drug Use"]);

  // Existing optional tabs for the "Search by Ingredient" tab
  const optionalTabsIngredient = [
    "Stability Conditions",
    "Interaction",
    "Composition",
    "Composition Characteristics",
    "Interaction Components",
    "Solution Form",
    "Testing Conditions",
    "Stability Test Results",
    "Dissolution Study",
    "Safety Study Results",
    "Efficacy Studies",
    "Toxicity Studies",
    "Application",
    "IEB Comment (Summary)",
  ];

  // // New optional tabs for the "Search by Drug" tab
  // const optionalTabsDrug = [
  //   "Disease Name",
  //   "Source",
  //   "Mechanism of Association",
  //   "Bacteria or Microbe",
  //   "Role/Pathway",
  //   "Potential of Drug",
  //   "Constipation as Comorbidity",
  //   "Analyst Comment (Disease Association to Gut Microbiome)",
  //   "Scientific Evidence",
  //   "Studies by",
  //   "Drug Studied player",
  // ];
  // New optional tabs for the "Search by Drug" tab
  const optionalTabsDrug = [
    "Disease",
    "Diseases_PMC_ID",
    "Drug_PMC_ID",
    "Justification_for_Drug_Use",
    "Disease_Title",
    "Disease_Mechanism",
    "Drug_Title",
    "Drug_Mechanism",
    "Drug_Microbes",
    "Disease_Microbes",
  ];

  // Toggle selection of a topic in "Search by Ingredient"
  const handleTabIngredientClick = (topic) => {
    if (selectedTabsIngredient.includes(topic)) {
      setSelectedTabsIngredient((prev) => prev.filter((t) => t !== topic));
    } else {
      setSelectedTabsIngredient((prev) => [...prev, topic]);
    }
  };

  // Toggle selection of a topic in "Search by Drug"
  const handleTabDrugClick = (topic) => {
    if (selectedTabsDrug.includes(topic)) {
      setSelectedTabsDrug((prev) => prev.filter((t) => t !== topic));
    } else {
      setSelectedTabsDrug((prev) => [...prev, topic]);
    }
  };

  // Single handler for the Submit button – decides which tab’s data to use
  const handleSearchSubmit = () => {
    if (activeTab === "ingredient") {
      // Searching by Ingredient
      if (!ingredientName.trim()) return;
      navigate("/rnd-formulation-ingredients", {
        state: {
          userQuery: ingredientName,
          selectedTabs: selectedTabsIngredient,
        },
      });
    } else {
      // Searching by Drug
      // if (!drugName.trim()) return;
      navigate("/rnd-formulation-drugs", {
        state: {
          // userQuery: drugName,
          selectedTabs: selectedTabsDrug,
        },
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-3xl bg-dialog rounded-[12px] overflow-y-auto"
        style={{
          position: "fixed",
          top: "10%",
          left: "50%",
          transform: "translateX(-50%)",
          maxHeight: "80vh",
          width: "100%",
        }}
      >
        <DialogHeader className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <DialogTitle className="flex flex-row items-center justify-center text-white rounded-lg">
                <div className="flex items-center justify-center w-12 h-12 border-2 border-white rounded-full mr-4">
                  <img
                    src={RnD}
                    alt="R&D icon"
                    className="w-6 h-6 object-contain"
                  />
                </div>
                <p className="text-lg font-medium">R&D Formulation</p>
              </DialogTitle>
            </div>
            <p className="text-sm text-white">
              A brief description about what R&D and Formulations do and their basic functionality.
            </p>
          </div>
        </DialogHeader>

        {/* TABS: "Search by Ingredient" & "Search by Drug" */}
        <Tabs
          defaultValue="ingredient"
          value={activeTab}
          onValueChange={(val) => setActiveTab(val)}
          className="w-full"
        >
          {/* Tab Triggers */}
          <div className="sticky top-0 z-10 bg-white rounded-[18px]">
            <TabsList className="grid w-full grid-cols-2 bg-white rounded-[18px]">
              <TabsTrigger
                value="ingredient"
                className="data-[state=active]:bg-[#54681D] data-[state=active]:text-white rounded-[12px]"
              >
                Search by Ingredient
              </TabsTrigger>
              <TabsTrigger
                value="drug"
                className="data-[state=active]:bg-[#54681D] data-[state=active]:text-white rounded-[12px]"
              >
                Search by Drug
              </TabsTrigger>
            </TabsList>
          </div>

          {/* CONTENT for "Search by Ingredient" tab */}
          <TabsContent value="ingredient">
            <div className="bg-white p-4 rounded-[20px] mt-4 space-y-4">
              {/* Ingredient Name Input */}
              <div>
                <Label htmlFor="ingredient-name" className="text-gray-700">
                  Ingredient Name
                </Label>
                <Input
                  id="ingredient-name"
                  type="text"
                  value={ingredientName}
                  onChange={(e) => setIngredientName(e.target.value)}
                  placeholder="Type Ingredient Name"
                  className="mt-1 rounded-lg"
                />
              </div>

              {/* Optional Topics (Tabs) */}
              <div>
                <Label className="text-gray-700 mb-2 block">
                  Select Additional Topics (Tabs)
                </Label>
                <div className="flex flex-wrap gap-2">
                  {optionalTabsIngredient.map((topic) => {
                    const isSelected = selectedTabsIngredient.includes(topic);
                    return (
                      <Button
                        key={topic}
                        onClick={() => handleTabIngredientClick(topic)}
                        variant="outline"
                        className={
                          isSelected
                            ? "bg-[#54681D] text-white hover:bg-[#54681D]/80 rounded-lg"
                            : "text-[#54681D] hover:bg-[#f0f8e5] border-[#54681D] rounded-lg"
                        }
                      >
                        {topic}
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-center">
                <Button
                  onClick={handleSearchSubmit}
                  className="w-[120px] bg-[#54681D] text-white hover:bg-[#95b833] rounded-[60px] mt-4"
                >
                  Submit
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* CONTENT for "Search by Drug" tab */}
          <TabsContent value="drug">
            <div className="bg-white p-4 rounded-[20px] mt-4 space-y-4">
              {/* Drug Name Input */}
              {/* <div>
                <Label htmlFor="drug-name" className="text-gray-700">
                  Drug Name
                </Label>
                <Input
                  id="drug-name"
                  type="text"
                  value={drugName}
                  onChange={(e) => setDrugName(e.target.value)}
                  placeholder="Type Drug Name"
                  className="mt-1 rounded-lg"
                />
              </div> */}

              {/* Optional Topics (Tabs) for the "Drug" tab */}
              <div>
                <Label className="text-gray-700 mb-2 block">
                  Select Additional Topics (Tabs)
                </Label>
                <div className="flex flex-wrap gap-2">
                  {optionalTabsDrug.map((topic) => {
                    const isSelected = selectedTabsDrug.includes(topic);
                    return (
                      <Button
                        key={topic}
                        onClick={() => handleTabDrugClick(topic)}
                        variant="outline"
                        className={
                          isSelected
                            ? "bg-[#54681D] text-white hover:bg-[#54681D]/80 rounded-lg"
                            : "text-[#54681D] hover:bg-[#f0f8e5] border-[#54681D] rounded-lg"
                        }
                      >
                        {topic}
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-center">
                <Button
                  onClick={handleSearchSubmit}
                  className="w-[120px] bg-[#54681D] text-white hover:bg-[#95b833] rounded-[60px] mt-4"
                >
                  Submit
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
