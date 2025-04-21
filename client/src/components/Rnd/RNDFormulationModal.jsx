// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { Button } from "@/components/ui/button";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Label } from "@/components/ui/label";
// import { Input } from "@/components/ui/input";

// import RnD from "../../assets/dashboard/research-and-development.png";

// export default function RNDFormulationModal({ isOpen, onOpenChange }) {
//   const navigate = useNavigate();

//   // Track which tab is active
//   const [activeTab, setActiveTab] = useState("ingredient");

//   // State for "Search by Ingredient"
//   const [ingredientName, setIngredientName] = useState("");
//   const [selectedTabsIngredient, setSelectedTabsIngredient] = useState([]);

//   // State for "Search by Drug"
//   const [drugName, setDrugName] = useState("");
//   // Preselect "Disease Name" and "Source" by default
//   const [selectedTabsDrug, setSelectedTabsDrug] = useState(["Disease",
//     "Diseases_PMC_ID",
//     "Drug_PMC_ID",
//     "Justification for Drug Use"]);

//   // Existing optional tabs for the "Search by Ingredient" tab
//   const optionalTabsIngredient = [
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

//   // // New optional tabs for the "Search by Drug" tab
//   // const optionalTabsDrug = [
//   //   "Disease Name",
//   //   "Source",
//   //   "Mechanism of Association",
//   //   "Bacteria or Microbe",
//   //   "Role/Pathway",
//   //   "Potential of Drug",
//   //   "Constipation as Comorbidity",
//   //   "Analyst Comment (Disease Association to Gut Microbiome)",
//   //   "Scientific Evidence",
//   //   "Studies by",
//   //   "Drug Studied player",
//   // ];
//   // New optional tabs for the "Search by Drug" tab
//   const optionalTabsDrug = [
//     "Disease",
//     "Justification_for_Drug_Use",
//     "Disease_Mechanism",
//     "Disease_Microbes",
//     "Drug_Mechanism",
//     "Drug_Microbes",
//     "Disease_Source",
//     "Drug_Source",
//   ];

//   // Toggle selection of a topic in "Search by Ingredient"
//   const handleTabIngredientClick = (topic) => {
//     if (selectedTabsIngredient.includes(topic)) {
//       setSelectedTabsIngredient((prev) => prev.filter((t) => t !== topic));
//     } else {
//       setSelectedTabsIngredient((prev) => [...prev, topic]);
//     }
//   };

//   // Toggle selection of a topic in "Search by Drug"
//   const handleTabDrugClick = (topic) => {
//     if (selectedTabsDrug.includes(topic)) {
//       setSelectedTabsDrug((prev) => prev.filter((t) => t !== topic));
//     } else {
//       setSelectedTabsDrug((prev) => [...prev, topic]);
//     }
//   };

//   // Single handler for the Submit button – decides which tab’s data to use
//   const handleSearchSubmit = () => {
//     if (activeTab === "ingredient") {
//       // Searching by Ingredient
//       if (!ingredientName.trim()) return;
//       navigate("/rnd-formulation-ingredients", {
//         state: {
//           userQuery: ingredientName,
//           selectedTabs: selectedTabsIngredient,
//         },
//       });
//     } else {
//       // Searching by Drug
//       // if (!drugName.trim()) return;
//       navigate("/rnd-formulation-drugs", {
//         state: {
//           // userQuery: drugName,
//           selectedTabs: selectedTabsDrug,
//         },
//       });
//     }
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
//                 <p className="text-lg font-medium">BioFormulate</p>
//               </DialogTitle>
//             </div>
//             <p className="text-sm text-white">
//             Analyze pharmaceutical ingredients and uncover new therapeutic applications using patents and research insights.
//             </p>
//           </div>
//         </DialogHeader>

//         {/* TABS: "Search by Ingredient" & "Search by Drug" */}
//         <Tabs
//           defaultValue="ingredient"
//           value={activeTab}
//           onValueChange={(val) => setActiveTab(val)}
//           className="w-full"
//         >
//           {/* Tab Triggers */}
//           <div className="sticky top-0 z-10 bg-white rounded-[18px]">
//             <TabsList className="grid w-full grid-cols-2 bg-white rounded-[18px]">
//               <TabsTrigger
//                 value="ingredient"
//                 className="data-[state=active]:bg-[#54681D] data-[state=active]:text-white rounded-[12px]"
//               >
//                 Search by Ingredient
//               </TabsTrigger>
//               <TabsTrigger
//                 value="drug"
//                 className="data-[state=active]:bg-[#54681D] data-[state=active]:text-white rounded-[12px]"
//               >
//                 Search by Drug
//               </TabsTrigger>
//             </TabsList>
//           </div>

//           {/* CONTENT for "Search by Ingredient" tab */}
//           <TabsContent value="ingredient">
//             <div className="bg-white p-4 rounded-[20px] mt-4 space-y-4">
//               {/* Ingredient Name Input */}
//               <div>
//                 <Label htmlFor="ingredient-name" className="text-gray-700">
//                   Ingredient Name
//                 </Label>
//                 <Input
//                   id="ingredient-name"
//                   type="text"
//                   value={ingredientName}
//                   onChange={(e) => setIngredientName(e.target.value)}
//                   placeholder="Type Ingredient Name"
//                   className="mt-1 rounded-lg"
//                 />
//               </div>

//               {/* Optional Topics (Tabs) */}
//               <div>
//                 <Label className="text-gray-700 mb-2 block">
//                   Select Additional Topics (Tabs)
//                 </Label>
//                 <div className="flex flex-wrap gap-2">
//                   {optionalTabsIngredient.map((topic) => {
//                     const isSelected = selectedTabsIngredient.includes(topic);
//                     return (
//                       <Button
//                         key={topic}
//                         onClick={() => handleTabIngredientClick(topic)}
//                         variant="outline"
//                         className={
//                           isSelected
//                             ? "bg-[#54681D] text-white hover:bg-[#54681D]/80 rounded-lg"
//                             : "text-[#54681D] hover:bg-[#f0f8e5] border-[#54681D] rounded-lg"
//                         }
//                       >
//                         {topic}
//                       </Button>
//                     );
//                   })}
//                 </div>
//               </div>

//               {/* Submit Button */}
//               <div className="flex justify-center">
//                 <Button
//                   onClick={handleSearchSubmit}
//                   className="w-[120px] bg-[#54681D] text-white hover:bg-[#95b833] rounded-[60px] mt-4"
//                 >
//                   Submit
//                 </Button>
//               </div>
//             </div>
//           </TabsContent>

//           {/* CONTENT for "Search by Drug" tab */}
//           <TabsContent value="drug">
//             <div className="bg-white p-4 rounded-[20px] mt-4 space-y-4">
//               {/* Drug Name Input */}
//               {/* <div>
//                 <Label htmlFor="drug-name" className="text-gray-700">
//                   Drug Name
//                 </Label>
//                 <Input
//                   id="drug-name"
//                   type="text"
//                   value={drugName}
//                   onChange={(e) => setDrugName(e.target.value)}
//                   placeholder="Type Drug Name"
//                   className="mt-1 rounded-lg"
//                 />
//               </div> */}

//               {/* Optional Topics (Tabs) for the "Drug" tab */}
//               <div>
//                 <Label className="text-gray-700 mb-2 block">
//                   Select Additional Topics (Tabs)
//                 </Label>
//                 <div className="flex flex-wrap gap-2">
//                   {optionalTabsDrug.map((topic) => {
//                     const isSelected = selectedTabsDrug.includes(topic);
//                     return (
//                       <Button
//                         key={topic}
//                         onClick={() => handleTabDrugClick(topic)}
//                         variant="outline"
//                         className={
//                           isSelected
//                             ? "bg-[#54681D] text-white hover:bg-[#54681D]/80 rounded-lg"
//                             : "text-[#54681D] hover:bg-[#f0f8e5] border-[#54681D] rounded-lg"
//                         }
//                       >
//                         {topic}
//                       </Button>
//                     );
//                   })}
//                 </div>
//               </div>

//               {/* Submit Button */}
//               <div className="flex justify-center">
//                 <Button
//                   onClick={handleSearchSubmit}
//                   className="w-[120px] bg-[#54681D] text-white hover:bg-[#95b833] rounded-[60px] mt-4"
//                 >
//                   Submit
//                 </Button>
//               </div>
//             </div>
//           </TabsContent>
//         </Tabs>
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

  // New optional tabs for the "Search by Drug" tab
  const optionalTabsDrug = [
    "Disease",
    "Justification_for_Drug_Use",
    "Disease_Mechanism",
    "Disease_Microbes",
    "Drug_Mechanism",
    "Drug_Microbes",
    "Disease_Sources",
    "Drug_Sources",
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

  // Handle Select All / Unselect All for Ingredient tab
  const handleSelectToggleIngredient = () => {
    if (selectedTabsIngredient.length === optionalTabsIngredient.length) {
      setSelectedTabsIngredient([]); // Unselect all if all are selected
    } else {
      setSelectedTabsIngredient(optionalTabsIngredient); // Select all if not all are selected
    }
  };

  // Handle Select All / Unselect All for Drug tab
  const handleSelectToggleDrug = () => {
    if (selectedTabsDrug.length === optionalTabsDrug.length) {
      setSelectedTabsDrug([]); // Unselect all if all are selected
    } else {
      setSelectedTabsDrug(optionalTabsDrug); // Select all if not all are selected
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
      navigate("/rnd-formulation-drugs", {
        state: {
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
                <p className="text-lg font-medium">BioFormulate</p>
              </DialogTitle>
            </div>
            <p className="text-sm text-white">
              Analyze pharmaceutical ingredients and uncover new therapeutic applications using patents and research insights.
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
            <div className="bg-white border-0 p-4 rounded-[20px] mt-4 space-y-4 outline-none">
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
              <div >
                <Label className="text-gray-700 mb-2 block">
                  Select Additional Topics (Tabs)
                </Label>
                <div className="flex flex-wrap gap-2">
                  {/* Select All / Unselect All Tab */}
                  <Button
                    onClick={handleSelectToggleIngredient}
                    variant="outline"
                    className={
                      selectedTabsIngredient.length === optionalTabsIngredient.length
                        ? "bg-[#54681D] text-white hover:bg-[#54681D]/80 rounded-lg"
                        : "text-[#54681D] hover:bg-[#f0f8e5] border-[#54681D] rounded-lg"
                    }
                  >
                    {selectedTabsIngredient.length === optionalTabsIngredient.length
                      ? "Unselect All"
                      : "Select All"}
                  </Button>

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
              {/* Optional Topics (Tabs) for the "Drug" tab */}
              <div>
                <Label className="text-gray-700 mb-2 block">
                  Select Additional Topics (Tabs)
                </Label>
                <div className="flex flex-wrap gap-2">
                  {/* Select All / Unselect All Tab */}
                  <Button
                    onClick={handleSelectToggleDrug}
                    variant="outline"
                    className={
                      selectedTabsDrug.length === optionalTabsDrug.length
                        ? "bg-[#54681D] text-white hover:bg-[#54681D]/80 rounded-lg"
                        : "text-[#54681D] hover:bg-[#f0f8e5] border-[#54681D] rounded-lg"
                    }
                  >
                    {selectedTabsDrug.length === optionalTabsDrug.length
                      ? "Unselect All"
                      : "Select All"}
                  </Button>

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
