// src/components/DiseaseOverviewModal.jsx

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Select from "react-select";
import outputData from '../assets/data/output.json';

export default function DiseaseOverviewModal({ isOpen, onOpenChange, onSearchSubmit }) {
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [searchType, setSearchType] = useState("disease");
  const [searchValue, setSearchValue] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const [diseaseOptions, setDiseaseOptions] = useState([]);
  const [drugOptions, setDrugOptions] = useState([]);

  useEffect(() => {
    // Fetch disease options
    fetch("/output.json")
      .then((response) => response.json())
      .then((data) => {
        console.log("Fetched Disease Data:", data);
        const options = data.DISEASE.map((disease) => ({
          value: disease,
          label: disease,
        }));
        setDiseaseOptions(options);
      })
      .catch((error) => console.error("Error fetching disease data:", error));

    // Fetch drug options
    fetch("/output.json")
      .then((response) => response.json())
      .then((data) => {
        const options = data["ACTIVE INGREDIENT"].map((drug) => ({
          value: drug,
          label: drug,
        }));
        setDrugOptions(options);
      })
      .catch((error) => console.error("Error fetching drug data:", error));
  }, []);


  const handleSearchSubmitDisease = async () => {
    setIsSearching(true);
    const searchParams = {
      search_type: "disease",
      disease_name: searchValue,
    };

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/search-by-disease`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(searchParams),
      });
      const data = await response.json();
      console.log("Search Results:", data.data);
      setIsSearching(false);
      if (onSearchSubmit) {
        onSearchSubmit({ type: 'disease', data: data.data });
      }
    } catch (error) {
      console.error("Error submitting search:", error);
    }
  };

  const handleSearchSubmitDrug = async () => {
    setIsSearching(true);
    const countryType = selectedCountries.length > 0 ? selectedCountries : ["all"];
    const searchParams = {
      search_type: "drug",
      drug_names: searchValue,
      country_name: countryType,
    };

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/search-by-drug`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(searchParams),
      });
      const data = await response.json();
      console.log("Search Results:", data.data);
      setIsSearching(false);
      if (onSearchSubmit) {
        onSearchSubmit({ type: 'drug', data: data.data });
      }
    } catch (error) {
      console.error("Error submitting search:", error);
    }
  };

  const handleSearchSubmitSymptoms = async () => {
    setIsSearching(true);
    const searchParams = {
      search_type: "symptoms",
      search_keyword: searchValue,
    };

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/search-by-symptoms`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(searchParams),
      });
      const data = await response.json();
      console.log("Search Results:", data.data);
      setIsSearching(false);
      if (onSearchSubmit) {
        onSearchSubmit({ type: 'symptoms', data: data.data, symptoms: searchParams.search_keyword });
      }
    } catch (error) {
      console.error("Error submitting search:", error);
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
              <DialogTitle className="text-gray-900">Disease Overview</DialogTitle>
            </div>
            <p className="text-sm text-gray-600">
              A high-level overview of the selected indication, covering disease biology, risk factors, standard treatment
              protocols, and key unmet needs. Ideal for developing a foundational understanding or refining strategic focus.
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
          {/* Fixed TabsList Container */}
          <div className="sticky top-0 z-10 bg-white rounded-[12px]">
            <TabsList className="grid w-full grid-cols-3 bg-white rounded-[12px]">
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
              <TabsTrigger
                value="symptoms"
                className="data-[state=active]:bg-[#a6ce39] data-[state=active]:text-black rounded-[12px]"
              >
                Search by Symptoms
              </TabsTrigger>
            </TabsList>
          </div>
          {/* Scrollable Content Area */}
          <div className="overflow-y-auto max-h-[70vh] bg-white p-4 rounded-[12px] mt-4">
            <TabsContent value="disease">
              <div className="space-y-2">
                <Label htmlFor="disease-select" className="text-gray-700">Disease Name</Label>
                <Select
                  id="disease-select"
                  options={diseaseOptions}
                  onChange={(option) => setSearchValue(option.value)}
                  styles={selectStyles}
                  placeholder="Select disease..."
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                />
              </div>
              <Button
                onClick={handleSearchSubmitDisease}
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
                  options={drugOptions}
                  onChange={(option) => setSearchValue(option.value)}
                  styles={selectStyles}
                  placeholder="Select drug..."
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                />
              </div>
              <div className="space-y-2 mt-4">
                <Label htmlFor="country" className="text-gray-700">Country</Label>
                <Select
                  id="country"
                  isMulti
                  defaultValue={{ value: 'all', label: 'All Countries' }}
                  options={[
                    { value: 'All Countries', label: 'All Countries' },
                    { value: 'Ireland', label: 'Ireland' },
                    { value: 'Italy', label: 'Italy' },
                    { value: 'Switzerland', label: 'Switzerland' },
                    { value: 'Netherlands', label: 'Netherlands' },
                    { value: 'UK', label: 'UK' },
                    { value: 'USA', label: 'USA' },
                  ]}
                  classNamePrefix="react-select"
                  onChange={(selectedOptions) => setSelectedCountries(selectedOptions.map(option => option.value))}
                  styles={selectStyles}
                  placeholder="Select countries..."
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                />
              </div>
              <Button
                onClick={handleSearchSubmitDrug}
                disabled={isSearching}
                className="w-full bg-[#a6ce39] text-black hover:bg-[#95b833] rounded-[12px] mt-4"
              >
                {isSearching ? 'Loading...' : 'Submit'}
              </Button>
            </TabsContent>
            <TabsContent value="symptoms">
              <div className="space-y-2">
                <Label htmlFor="symptoms-text" className="text-gray-700">Symptoms</Label>
                <Input
                  id="symptoms-text"
                  placeholder="Enter symptoms..."
                  className="w-full p-2 border border-gray-200 rounded-[12px] text-gray-800 focus:border-[#a6ce39] focus:ring-[#a6ce39] hover:border-[#a6ce39] transition duration-200 ease-in-out"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                />
              </div>
              <Button
                onClick={handleSearchSubmitSymptoms}
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
