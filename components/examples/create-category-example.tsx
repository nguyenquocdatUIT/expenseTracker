"use client";

import { useState } from "react";
import { useCreateCategoryV1CategoriesPost } from "@/lib/api";
import type { CategoryType } from "@/lib/api";

export default function CreateCategoryExample() {
  const [name, setName] = useState("");
  const [type, setType] = useState<CategoryType>("EXPENSE");

  const { mutate, isPending, isSuccess, error } =
    useCreateCategoryV1CategoriesPost();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    mutate(
      {
        data: {
          name,
          type,
        },
      },
      {
        onSuccess: (data) => {
          console.log("Category created:", data);
          setName("");
          alert(`Category "${data.name}" created successfully!`);
        },
        onError: (error) => {
          console.error("Error creating category:", error);
        },
      }
    );
  };

  return (
    <div className="p-4 max-w-md">
      <h2 className="text-2xl font-bold mb-4">Create Category</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Category Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="e.g., Food, Transport"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as CategoryType)}
            className="w-full px-3 py-2 border rounded-lg"
          >
            <option value="EXPENSE">Expense</option>
            <option value="INCOME">Income</option>
          </select>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded-lg">
            Error:{" "}
            {error instanceof Error
              ? error.message
              : "Failed to create category"}
          </div>
        )}

        {isSuccess && (
          <div className="p-3 bg-green-50 text-green-700 rounded-lg">
            Category created successfully!
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isPending ? "Creating..." : "Create Category"}
        </button>
      </form>
    </div>
  );
}
