import React, { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Select from "react-select";
import outputData from '../assets/data/competitiveLandscape/disease.json';
import { useNavigate } from "react-router-dom";
 
export default function CompetitiveLandscapeModal({ isOpen, onOpenChange }) {
  // const [isOpen, setIsOpen] = useState(false);
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
    menuPortal: (base) => ({ ...base, zIndex: 1050, pointerEvents: 'auto', WebkitOverflowScrolling: "touch",  touchAction: 'pan-y' }),
  };
 
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {/* <DialogTrigger asChild>
        <Button className="w-full md:w-auto bg-[#a6ce39] text-black rounded-[12px] hover:bg-[#95b833]">
          Get Started
        </Button>
      </DialogTrigger> */}
      <DialogContent
        className="max-w-3xl bg-[#f4f4f4] rounded-[12px] overflow-y-auto"
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
              <DialogTitle className="text-gray-900">Competitive Landscape</DialogTitle>
            </div>
            <p className="text-sm text-gray-600">
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
          <div className="sticky top-0 z-10 bg-white rounded-[12px]">
            <TabsList className="grid w-full grid-cols-2 bg-white rounded-[12px]">
              <TabsTrigger
                value="disease"
                className="data-[state=active]:bg-[#a6ce39] data-[state=active]:text-black rounded-[12px]"
              >
                Search by Disease
              </TabsTrigger>
              <TabsTrigger
                value="drug"
                className="data-[state=active]:bg-[#a6ce39] data-[state=active]:text-black rounded-[12px]"
              >
                Search by Drug
              </TabsTrigger>
            </TabsList>
          </div>
          <div className="overflow-y-auto max-h-[70vh] bg-white p-4 rounded-[12px] mt-4">
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
              <Button
                onClick={handleSearchSubmit}
                disabled={isSearching}
                className="w-full bg-[#a6ce39] text-black hover:bg-[#95b833] rounded-[12px] mt-4"
              >
                {isSearching ? 'Loading...' : 'Submit'}
              </Button>
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
              
              <Button
                onClick={handleSearchSubmit}
                disabled={isSearching}
                className="w-full bg-[#a6ce39] text-black hover:bg-[#95b833] rounded-[12px] mt-4"
              >
                {isSearching ? 'Loading...' : 'Submit'}
              </Button>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
 