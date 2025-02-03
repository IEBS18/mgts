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
import outputData from '../assets/data/priceprediction.json';
import { useNavigate } from "react-router-dom";
import PriceImg from '../assets/dashboard/pricePrediction.png'

export default function DrugCostPredictionForm({ isOpen, onOpenChange }) {
  const [formData, setFormData] = useState({
    disease_name: null,
    country: null,
    quality_of_life: "",
    mortality: "",
    modality: null,
    morbidity: "",
    safety: "",
    efficacy: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();


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


  const handleInputChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    const { disease_name, country, quality_of_life, mortality, modality, morbidity, safety, efficacy } = formData;

    // Ensure all fields are filled
    if (!disease_name || !country || !quality_of_life || !mortality || !modality || !morbidity || !safety || !efficacy) {
      alert("Please fill in all fields.");
      return;
    }

    // Create the payload with only the required values
    const payload = {
      disease_name: disease_name.value,
      country: country.value,
      quality_of_life,
      mortality,
      modality: modality.value,
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
      navigate('/price-prediction', { state: { data, payload } });
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
      <DialogContent className="max-w-3xl bg-dialog rounded-[12px] overflow-y-auto"
        style={{
          position: 'fixed',
          top: '10%',
          left: '50%',
          transform: 'translateX(-50%)',
          maxHeight: '80vh',
          width: '100%',
        }}>
        <DialogHeader className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <DialogTitle className="flex flex-row items-center justify-cente text-white rounded-lg">
                <div className="flex items-center justify-center w-12 h-12 border-2 border-white rounded-full mr-4">
                  <img
                    src={PriceImg}
                    alt="Disease icon"
                    className="w-6 h-6 object-contain"
                  />
                </div>
                <p className="text-lg font-medium">Predict Drug Cost</p>
              </DialogTitle>
            </div>
            <p className="text-sm text-white">
               Predicts drug prices based on disease factors, treatment type, quality of life, mortality data and other factors.
            </p>

          </div>
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
            <Label htmlFor="modality">Select Modality</Label>
            <Select
              id="modality"
              options={[
                // { value: 'All Countries', label: 'All Countries' },
                { value: 'Small Molecules', label: 'Small Molecules' },
                { value: 'Biologics', label: 'Biologics' },
              ]}
              value={formData.modality}
              onChange={(option) => handleInputChange("modality", option)}
              placeholder="Select a Modality"
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
          <div className="flex justify-center">
            <Button onClick={handleSubmit} className="w-[120px] bg-[#54681D] text-white hover:bg-[#95b833] rounded-[60px] mt-4" disabled={loading}>
              {loading ? "Predicting..." : "Predict Cost"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
