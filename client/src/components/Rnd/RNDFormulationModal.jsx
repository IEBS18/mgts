import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";

import RnD from "../../assets/dashboard/research-and-development.png";

export default function RNDFormulationModal({ isOpen, onOpenChange }) {
  const [ingredientName, setIngredientName] = useState("");
  const navigate = useNavigate();

  const handleSearchSubmit = () => {
    if (!ingredientName.trim()) return;
    // Immediately redirect to the RNDFormulation page with the user query
    navigate("/rnd-formulation", {
      state: { userQuery: ingredientName },
    });
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
              A brief description about what R&D and Formulations do and its basic functionality
            </p>
          </div>
        </DialogHeader>

        <div className="bg-white p-4 rounded-[20px] mt-4">
          <div className="space-y-2">
            <Label htmlFor="ingredient-name" className="text-gray-700">
              Ingredient Name
            </Label>
            <input
              id="ingredient-name"
              type="text"
              value={ingredientName}
              onChange={(e) => setIngredientName(e.target.value)}
              placeholder="Type Ingredient Name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none"
            />
          </div>

          <div className="flex justify-center">
            <Button
              onClick={handleSearchSubmit}
              className="w-[120px] bg-[#54681D] text-white hover:bg-[#95b833] rounded-[60px] mt-4"
            >
              Submit
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
