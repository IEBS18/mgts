import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import Select from "react-select";
import outputData from '../assets/data/output.json';
import { useNavigate } from "react-router-dom";

export default function DrugCostPredictionForm({ isOpen, onOpenChange }) {
  const [formData, setFormData] = useState({
    disease_name: null,
    country: null,
    quality_of_life: "",
    mortality: "",
    morbidity: "",
    safety: "",
    efficacy: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate= useNavigate();


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


  const handleInputChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    const { disease_name, country, quality_of_life, mortality, morbidity, safety, efficacy } = formData;
  
    // Ensure all fields are filled
    if (!disease_name || !country || !quality_of_life || !mortality || !morbidity || !safety || !efficacy) {
      alert("Please fill in all fields.");
      return;
    }
  
    // Create the payload with only the required values
    const payload = {
      disease_name: disease_name.value,
      country: country.value,
      quality_of_life,
      mortality,
      morbidity,
      safety,
      efficacy,
    };
  
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/price-prediction`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
  
      if (!response.ok) throw new Error("Failed to predict cost");
  
      const data = await response.json();
      console.log(data);
      navigate('/price-prediction', {state: { data, payload }});
      // alert(`Predicted cost: ${(data.result["average_price"]).toFixed(2)}`);
    } catch (error) {
      console.error(error);
      alert("An error occurred during prediction.");
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl bg-[#f4f4f4] rounded-[12px] overflow-y-auto"
      style={{
        position: 'fixed',
        top: '10%',          
        left: '50%',          
        transform: 'translateX(-50%)',
        maxHeight: '80vh',    
        width: '100%',
      }}>
        <DialogHeader className="space-y-4">
          <DialogTitle className="text-gray-900">Predict Drug Cost</DialogTitle>
        </DialogHeader>

        <div className="sticky top-0 z-10 bg-white rounded-[12px] p-4">
          <div className="space-y-2">
            <Label htmlFor="disease_name">Select Disease</Label>
            <Select
              id="disease_name"
              options={outputData.DISEASE.map(disease => ({ value: disease, label: disease }))}
              value={formData.disease_name}
              onChange={(option) => handleInputChange("disease_name", option)}
              placeholder="Select a Disease"
              className="w-full"
              menuPortalTarget={document.body}
              menuPosition="fixed"
              styles={selectStyles}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="country">Select Country</Label>
            <Select
              id="country"
              options={[
                // { value: 'All Countries', label: 'All Countries' },
                { value: 'Ireland', label: 'Ireland' },
                { value: 'Italy', label: 'Italy' },
                { value: 'Switzerland', label: 'Switzerland' },
                { value: 'Netherlands', label: 'Netherlands' },
                { value: 'UK', label: 'UK' },
                { value: 'USA', label: 'USA' },
              ]}
              value={formData.country}
              onChange={(option) => handleInputChange("country", option)}
              placeholder="Select a Country"
              className="w-full"
              menuPortalTarget={document.body}
              menuPosition="fixed"
              styles={selectStyles}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="quality_of_life">Quality of Life</Label>
            <input
              id="quality_of_life"
              type="text"
              value={formData.quality_of_life}
              onChange={(e) => handleInputChange("quality_of_life", e.target.value)}
              placeholder="e.g., Moderate impact due to mobility issues"
              className="w-full px-4 py-2 border rounded"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mortality">Mortality (%)</Label>
            <input
              id="mortality"
              type="number"
              value={formData.mortality}
              onChange={(e) => handleInputChange("mortality", e.target.value)}
              placeholder="e.g., 20"
              className="w-full px-4 py-2 border rounded"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="morbidity">Morbidity (%)</Label>
            <input
              id="morbidity"
              type="number"
              value={formData.morbidity}
              onChange={(e) => handleInputChange("morbidity", e.target.value)}
              placeholder="e.g., 8"
              className="w-full px-4 py-2 border rounded"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="safety">Safety</Label>
            <input
              id="safety"
              type="text"
              value={formData.safety}
              onChange={(e) => handleInputChange("safety", e.target.value)}
              placeholder="e.g., Generally Safe"
              className="w-full px-4 py-2 border rounded"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="efficacy">Efficacy</Label>
            <input
              id="efficacy"
              type="text"
              value={formData.efficacy}
              onChange={(e) => handleInputChange("efficacy", e.target.value)}
              placeholder="e.g., Moderate for pain relief"
              className="w-full px-4 py-2 border rounded"
            />
          </div>

          <Button onClick={handleSubmit} className="w-full bg-[#a6ce39] text-black hover:bg-[#95b833] rounded-[12px] mt-4" disabled={loading}>
            {loading ? "Predicting..." : "Predict Cost"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
