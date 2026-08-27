// types/animal.ts
export interface Animal {
  id: number;
  userId?: number;
  name: string;
  animalType: string;
  breed?: string;
  sex: string;
  age?: number | string;
  status: string;
  neutered: string;
  coloring?: string;
  description?: string;
  methodAcquired?: string;
  veterinarian?: string;
  matureWeight?: number | string;
  estimatedValue?: number | string;
  images?: string[];
}