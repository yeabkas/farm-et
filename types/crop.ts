export interface Crop {

  id?: string;



  // --- Type & Variety ---

  cropType: string;             

  varietyStrain?: string;       // optional

  botanicalName?: string;       // optional

  description?: string;         // optional

  saleWindow?: number | string; // renamed to camelCase (standard TS practice)



  // --- Recommended Additions ---

  internalId?: string;          // Short code / SKU (e.g., "ASTE") - great for quick search/labels

  daysToMaturity?: number;      // Critical for crop planning & auto-calculating harvest dates

  harvestUnits?: string;        // Unit of measure (e.g., "kg", "lbs", "bales", "bunches")

  estimatedValue?: number;    // Base price per harvest unit for financial forecasting

  isPerennial?: boolean;        // Quick toggle to flag if crop replanting is needed annually

}