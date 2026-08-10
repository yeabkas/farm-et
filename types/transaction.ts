export type TransactionType = "Expense" | "Income";

export const EXPENSE_CATEGORIES = [
  "Car and truck expenses",
  "Chemicals",
  "Conservation expenses",
  "Custom hire (machine work)",
  "Depreciation",
  "Employee benefit programs",
  "Feed",
  "Fertilizers and lime",
  "Freight and trucking",
  "Gasoline, fuel, and oil",
  "Insurance (other than health)",
  "Interest Mortgage (paid to banks, etc.)",
  "Interest Other",
  "Labor hired (less employment credits)",
  "Other expenses",
  "Pension and profit-sharing plans",
  "Purchase of livestock",
  "Rent or Lease of Other (land, animals, etc.)",
  "Rent or Lease of Vehicles, machinery, equipment",
  "Repairs and maintenance",
  "Seeds and plants",
  "Storage and warehousing",
  "Supplies",
  "Taxes",
  "Utilities",
  "Veterinary, breeding, and medicine",
] as const;

export const INCOME_CATEGORIES = [
  "Agricultural program payments",
  "CCC loans forfeited",
  "Commodity Credit Corporation (CCC) loans reported under election",
  "Cooperative distributions",
  "Cost or other basis of livestock",
  "Crop insurance proceeds and federal crop disaster payments",
  "Custom hire (machine work) income",
  "Other income",
  "Sales of livestock and other resale items",
  "Sales of livestock, produce, grains, and other products you raised",
] as const;

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  payeeCustomer: string;
  category: string;
  date: string;
  reportingYear: string;
  checkNumber?: string;
  associatedTo?: string;
  keywords?: string;
  description?: string;
}