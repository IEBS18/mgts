import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Select from "react-select";
import outputData from '../../assets/data/competitiveLandscape/disease.json';
import { useNavigate } from "react-router-dom";
import Competitor from '../../assets/dashboard/competitorAnalysis.png'

export default function CompetitiveLandscapeModal({ isOpen, onOpenChange }) {
  const [diseaseName, setDiseaseName] = useState('');
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [searchType, setSearchType] = useState("disease");
  const [searchValue, setSearchValue] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();

  const handleSearchSubmit = async () => {
    setIsSearching(true);
    let searchParams = {};

    if (searchType === "disease") {
      searchParams = {
        search_type: "disease",
        disease_name: diseaseName,
      };
    } else if (searchType === "drug") {
      const countryType = selectedCountries.length > 0 ? selectedCountries : ["all"];
      searchParams = {
        search_type: "drug",
        active_ingredient: searchValue,
        // country_name: countryType,
      };
    }

    try {
      let endpoint = "";
      let navigateTo = "";

      if (searchType === "disease") {
        endpoint = `${import.meta.env.VITE_API_URL}/generate_disease_analysis`;
        navigateTo = "/competitive-landscape-by-disease";
      } else if (searchType === "drug") {
        endpoint = `${import.meta.env.VITE_API_URL}/get-drug-data`;
        navigateTo = "/competitive-landscape-by-drug";
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(searchParams),
      });

      const data = await response.json();
      console.log("Search Results:", data);
      console.log(diseaseName);

      navigate(navigateTo, {
        state: { searchResults: data, diseaseName: searchValue },
      });

      setIsSearching(false);
    } catch (error) {
      console.error("Error submitting search:", error);
      setIsSearching(false);
    }
  };

  const selectStyles = {
    control: (base) => ({
      ...base,
      borderRadius: "12px",
      borderColor: "#d1d5db",
      boxShadow: "none",
      '&:hover': { borderColor: "#a6ce39" },
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused ? "#e0f3c4" : "white",
      color: "#333",
    }),
    menuPortal: (base) => ({ ...base, zIndex: 1050, pointerEvents: 'auto', WebkitOverflowScrolling: "touch", touchAction: 'pan-y' }),
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-3xl bg-dialog rounded-[12px] overflow-y-auto"
        style={{
          position: 'fixed',
          top: '10%',
          left: '50%',
          transform: 'translateX(-50%)',
          maxHeight: '80vh',
          width: '100%',
        }}
      >
        <DialogHeader className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <DialogTitle className="flex flex-row items-center justify-cente text-white rounded-lg">
                <div className="flex items-center justify-center w-12 h-12 border-2 border-white rounded-full mr-4">
                  <img
                    src={Competitor}
                    alt="Disease icon"
                    className="w-6 h-6 object-contain"
                  />
                </div>
                <p className="text-lg font-medium">Competitive Landscape</p>
              </DialogTitle>
            </div>
            <p className="text-sm text-white">
              Analyze the competitive environment, key players, and market dynamics. Understand your position and identify opportunities.
            </p>
          </div>
        </DialogHeader>
        <Tabs
          defaultValue="disease"
          onValueChange={(value) => {
            setSearchType(value);
            setSearchValue("");
          }}
          className="w-full"
        >
          <div className="sticky top-0 z-10 bg-white rounded-[18px]">
            <TabsList className="grid w-full grid-cols-2 bg-white rounded-[18px]">
              <TabsTrigger
                value="disease"
                className="data-[state=active]:bg-[#54681D] data-[state=active]:text-white rounded-[12px]"
              >
                Search by Disease
              </TabsTrigger>
              <TabsTrigger
                value="drug"
                className="data-[state=active]:bg-[#54681D] data-[state=active]:text-white rounded-[12px]"
              >
                Search by Drug
              </TabsTrigger>
            </TabsList>
          </div>
          <div className="overflow-y-auto max-h-[70vh] bg-white p-4 rounded-[20px] mt-4">
            <TabsContent value="disease">
              <div className="space-y-2">
                <Label htmlFor="disease-select" className="text-gray-700">Disease Name</Label>
                <Select
                  id="disease-select"
                  options={outputData.DISEASE.map(disease => ({ value: disease, label: disease }))}
                  onChange={(option) => {
                    setSearchValue(option.value);
                    setDiseaseName(option.value);
                  }}
                  styles={selectStyles}
                  placeholder="Select disease..."
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                />
              </div>
              <div className="flex justify-center">
                <Button
                  onClick={handleSearchSubmit}
                  disabled={isSearching}
                  className="w-[120px] bg-[#54681D] text-white hover:bg-[#95b833] rounded-[60px] mt-4"
                >
                  {isSearching ? 'Loading...' : 'Submit'}
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="drug">
              <div className="space-y-2">
                <Label htmlFor="drug-select" className="text-gray-700">Drug Name</Label>
                <Select
                  id="drug-select"
                  options={outputData["ACTIVE INGREDIENT"].map(drug => ({ value: drug, label: drug }))}
                  onChange={(option) => setSearchValue(option.value)}
                  styles={selectStyles}
                  placeholder="Select drug..."
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                />
              </div>


              <div className="flex justify-center">
                <Button
                  onClick={handleSearchSubmit}
                  disabled={isSearching}
                  className="w-[120px] bg-[#54681D] text-white hover:bg-[#95b833] rounded-[60px] mt-4"
                >
                  {isSearching ? 'Loading...' : 'Submit'}
                </Button>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
