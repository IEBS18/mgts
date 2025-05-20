"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BarChart3, TrendingUp, Users, Building2 } from "lucide-react";
import Select from "react-select";
import { MenuList } from "../util/VirtualMenuList";
import outputData from "../../assets/data/competitiveLandscape/disease.json";
import { useNavigate } from "react-router-dom";

export default function CompetitiveAnalysisPage() {
  // States for metrics
  const [metrics, setMetrics] = useState({
    totalCompanies: 850,
    activeProducts: 3240,
    marketSize: 1250, // in billions
    growthRate: 12.5, // percentage
  });

  // States for search
  const [diseaseName, setDiseaseName] = useState("");
  // const [selectedCountries, setSelectedCountries] = useState([]);
  const [searchType, setSearchType] = useState("disease");
  const [searchValue, setSearchValue] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const navigate = useNavigate();

  const handleSearchSubmitDisease = async () => {
    setIsSearching(true);

    const searchParams = {
      search_type: "disease",
      disease_name: diseaseName,
    };

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/generate_disease_analysis`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(searchParams),
        }
      );
      console.log(searchParams);
      const data = await response.json();
      console.log("Search Results:", data);
      console.log(diseaseName);

      navigate("/competitive-landscape-by-disease", {
        state: { searchResults: data, diseaseName: searchValue },
      });

      setIsSearching(false);
    } catch (error) {
      console.error("Error submitting search:", error);
      setIsSearching(false);
    }
  };

  const handleSearchSubmitDrug = async () => {
    setIsSearching(true);
    const searchParams = {
      search_type: "drug",
      active_ingredient: searchValue,
    };

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/get-drug-data`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(searchParams),
        }
      );
      const data = await response.json();

      navigate("/competitive-landscape-by-drug", {
        state: { searchResults: data, diseaseName: searchValue },
      });

      setIsSearching(false);
    } catch (error) {
      console.error("Error submitting search:", error);
      setIsSearching(false);
    }
  };

  // Select styles
  const selectStyles = {
    control: (base) => ({
      ...base,
      borderRadius: "12px",
      borderColor: "#d1d5db",
      boxShadow: "none",
      "&:hover": { borderColor: "#a6ce39" },
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused ? "#e0f3c4" : "white",
      color: "#333",
    }),
    menuPortal: (base) => ({
      ...base,
      zIndex: 1050,
    }),
    menuList: (base) => ({
      ...base,
      maxHeight: "300px",
      overflowY: "auto",
    }),
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Competitive Landscape</h1>
        <p className="text-gray-600 mb-6">
          Analyze the competitive environment, key players, and market dynamics.
          Understand your position and identify opportunities.
        </p>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold">
                {metrics.totalCompanies.toLocaleString()}
              </CardTitle>
              <CardDescription>Pharmaceutical Companies</CardDescription>
            </CardHeader>
            <CardContent>
              <Building2 className="h-6 w-6 text-[#54681D]" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold">
                {metrics.activeProducts.toLocaleString()}
              </CardTitle>
              <CardDescription>Active Products</CardDescription>
            </CardHeader>
            <CardContent>
              <BarChart3 className="h-6 w-6 text-[#54681D]" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold">
                ${metrics.marketSize.toLocaleString()}B
              </CardTitle>
              <CardDescription>Global Market Size</CardDescription>
            </CardHeader>
            <CardContent>
              <Users className="h-6 w-6 text-[#54681D]" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold">
                {metrics.growthRate}%
              </CardTitle>
              <CardDescription>Annual Growth Rate</CardDescription>
            </CardHeader>
            <CardContent>
              <TrendingUp className="h-6 w-6 text-[#54681D]" />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs
        defaultValue="disease"
        onValueChange={(value) => {
          setSearchType(value);
          setSearchValue("");
        }}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2 bg-white rounded-[18px] mb-6">
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

        {/* Disease Tab Content */}
        <TabsContent value="disease">
          <Card>
            <CardHeader>
              <CardTitle>Search by Disease</CardTitle>
              <CardDescription>
                Analyze the competitive landscape for specific disease areas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="disease-select" className="text-gray-700">
                  Disease Name
                </Label>
                <Select
                  id="disease-select"
                  options={outputData.DISEASE.map((disease) => ({
                    value: disease,
                    label: disease,
                  }))}
                  onChange={(option) => {
                    setSearchValue(option.value);
                    setDiseaseName(option.value);
                  }}
                  styles={selectStyles}
                  components={{ MenuList }}
                  placeholder="Select disease..."
                  menuPortalTarget={document.body}
                  className="w-full"
                />
              </div>
              <div className="flex justify-center mt-6">
                <Button
                  onClick={handleSearchSubmitDisease}
                  disabled={isSearching}
                  className="w-[120px] bg-[#54681D] text-white hover:bg-[#95b833] rounded-[60px]"
                >
                  {isSearching ? "Loading..." : "Submit"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Drug Tab Content */}
        <TabsContent value="drug">
          <Card>
            <CardHeader>
              <CardTitle>Search by Drug</CardTitle>
              <CardDescription>
                Analyze the competitive landscape for specific drugs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="drug-select" className="text-gray-700">
                  Drug Name
                </Label>
                <Select
                  id="drug-select"
                  options={outputData["ACTIVE INGREDIENT"].map((drug) => ({
                    value: drug,
                    label: drug,
                  }))}
                  onChange={(option) => setSearchValue(option.value)}
                  styles={selectStyles}
                  components={{ MenuList }}
                  placeholder="Select drug..."
                  menuPortalTarget={document.body}
                  className="w-full"
                />
                
              </div>
              <div className="flex justify-center mt-6">
                <Button
                  onClick={handleSearchSubmitDrug}
                  disabled={isSearching}
                  className="w-[120px] bg-[#54681D] text-white hover:bg-[#95b833] rounded-[60px]"
                >
                  {isSearching ? "Loading..." : "Submit"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
