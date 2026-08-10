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
  
  // 1. Add state to track the animal being edited
  const [editingAnimal, setEditingAnimal] = useState<Animal | null>(null);

  // 2. Open form for CREATING a new animal
  const handleOpenAddForm = () => {
    setEditingAnimal(null); // Clear selected animal
    setShowForm(true);
  };

  // 3. Open form for EDITING an existing animal
  const handleEditAnimal = (animal: Animal) => {
    setEditingAnimal(animal); // Store selected animal
    setShowForm(true);
  };

  // 4. Handle form submission (Handles BOTH Create and Update)
  const handleSubmitForm = (submittedAnimal: Animal) => {
    if (editingAnimal) {
      // Update existing animal in state
      setAnimals((prev) =>
        prev.map((a) => (a.id === submittedAnimal.id ? submittedAnimal : a))
      );
    } else {
      // Add new animal to state
      setAnimals((prev) => [...prev, submittedAnimal]);
    }

    // Reset view state
    setShowForm(false);
    setEditingAnimal(null);
  };

  // 5. Handle cancel action
  const handleCancel = () => {
    setShowForm(false);
    setEditingAnimal(null);
  };

  // 6. Handle deletion
  const handleDeleteAnimal = (id: string) => {
    setAnimals((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-mono">
      {!showForm && <AnimalHeader onAddAnimalClick={handleOpenAddForm} />}

      {showForm ? (
        <AnimalForm
          initialData={editingAnimal} // <-- Pass editing data to form
          onCancel={handleCancel}
          onSubmit={handleSubmitForm}
        />
      ) : animals.length === 0 ? (
        <AnimalEmptyState />
      ) : (
        <AnimalTable 
          animals={animals} 
          onEdit={handleEditAnimal}     // <-- Connect edit callback
          onDelete={handleDeleteAnimal} // <-- Connect delete callback
        />
      )}
    </div>
  );
}