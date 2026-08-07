"use client";

import { useState } from "react";
import { Animal } from "@/types/animal";
import { AnimalForm } from "@/components/forms/AnimalForm";
import { AnimalHeader } from "@/components/headers/AnimalHeader";
import { AnimalTable } from "@/components/tables/AnimalTable";
import { AnimalEmptyState } from "@/components/emptyStates/AnimalEmptyState";

export default function AnimalsPage() {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [showForm, setShowForm] = useState(false);

  const handleAddAnimal = (newAnimal: Animal) => {
    setAnimals((prev) => [...prev, newAnimal]);
    setShowForm(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-mono">
      {!showForm && <AnimalHeader onAddAnimalClick={() => setShowForm(true)} />}

      {showForm ? (
        <AnimalForm
          onCancel={() => setShowForm(false)}
          onSubmit={handleAddAnimal}
        />
      ) : animals.length === 0 ? (
        <AnimalEmptyState />
      ) : (
        <AnimalTable animals={animals} />
      )}
    </div>
  );
}