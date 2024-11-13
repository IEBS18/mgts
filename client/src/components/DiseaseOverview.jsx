import { useState } from "react";
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
import outputData from '../assets/data/output.json';
import { useNavigate } from "react-router-dom";

export default function DiseaseOverviewModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [searchType, setSearchType] = useState("disease");
  const [searchValue, setSearchValue] = useState("");
  const navigate = useNavigate();

  const handleSearchSubmitDisease = async () => {
    const searchParams = {
      search_type: "disease",
      disease_name: searchValue,
    };

    try {
      const response = await fetch("http://localhost:5000/search-by-disease", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(searchParams),
      });
      const data = await response.json();
      console.log("Search Results:", data.data);
      navigate("/disease-search", {
        state: { searchResults: data.data },
      });
    } catch (error) {
      console.error("Error submitting search:", error);
    }
  };

  const handleSearchSubmitDrug = async () => {
    const countryType = selectedCountries.length > 0 ? selectedCountries : ["all"];
    const searchParams = {
      search_type: "drug",
      drug_names: searchValue,
      country_name: countryType,
    };

    try {
      const response = await fetch("http://localhost:5000/search-by-drug", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(searchParams),
      });
      const data = await response.json();
      console.log("Search Results:", data.data);
      navigate("/search-by-drug", {
        state: { searchResults: data.data },
      });
    } catch (error) {
      console.error("Error submitting search:", error);
    }
  };

  const handleSearchSubmitSymptoms = async () => {
    const searchParams = {
      search_type: "symptoms",
      search_keyword: searchValue,
    };

    try {
      const response = await fetch("http://localhost:5000/search-by-symptoms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(searchParams),
      });
      const data = await response.json();
      console.log("Search Results:", data.data);
      navigate("/search-by-symptoms", {
        state: { searchResults: data.data },
      });
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
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full md:w-auto bg-[#a6ce39] text-black rounded-[12px] hover:bg-[#95b833]">
          Get Started
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl bg-[#f4f4f4] rounded-[12px]">
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
        <Tabs defaultValue="disease" onValueChange={(value) => { setSearchType(value); setSearchValue(""); }} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white rounded-[12px]">
            <TabsTrigger value="disease" className="data-[state=active]:bg-[#a6ce39] data-[state=active]:text-black rounded-[12px]">
              Search by Disease
            </TabsTrigger>
            <TabsTrigger value="drug" className="data-[state=active]:bg-[#a6ce39] data-[state=active]:text-black rounded-[12px]">
              Search by Drug
            </TabsTrigger>
            <TabsTrigger value="symptoms" className="data-[state=active]:bg-[#a6ce39] data-[state=active]:text-black rounded-[12px]">
              Search by Symptoms
            </TabsTrigger>
          </TabsList>
          <div className="space-y-4 bg-white p-4 rounded-[12px] mt-4">
            <TabsContent value="disease">
              <div className="space-y-2">
                <Label htmlFor="disease-select" className="text-gray-700">Disease Name</Label>
                <Select
                  id="disease-select"
                  options={outputData.DISEASE.map(disease => ({ value: disease, label: disease }))}
                  onChange={(option) => setSearchValue(option.value)}
                  styles={selectStyles}
                  placeholder="Select disease..."
                />
              </div>
              <Button onClick={handleSearchSubmitDisease} className="w-full bg-[#a6ce39] text-black hover:bg-[#95b833] rounded-[12px] mt-4">
                Submit
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
                />
              </div>
              <Button onClick={handleSearchSubmitDrug} className="w-full bg-[#a6ce39] text-black hover:bg-[#95b833] rounded-[12px] mt-4">
                Submit
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
              <Button onClick={handleSearchSubmitSymptoms} className="w-full bg-[#a6ce39] text-black hover:bg-[#95b833] rounded-[12px] mt-4">
                Submit
              </Button>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}