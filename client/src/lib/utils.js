import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}


// src/lib/utils.js

export const filterDrugs = (drugs, searchTerm) => {
  return drugs.filter(drug =>
    drug.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
};
