"use client";

import { useGetCategoriesApiV1CategoriesGet } from "@/lib/api";

export default function CategoriesExample() {
  const {
    data: categories,
    isLoading,
    error,
  } = useGetCategoriesApiV1CategoriesGet();

  if (isLoading) {
    return <div>Loading categories...</div>;
  }

  if (error) {
    const errorMessage =
      typeof error === "object" && error && "message" in (error as any)
        ? String((error as any).message)
        : String(error);
    return <div>Error loading categories: {errorMessage}</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Categories</h2>
      <div className="grid gap-2">
        {categories?.map((category) => (
          <div key={category.id} className="p-3 border rounded-lg">
            <div className="flex items-center gap-2">
              {category.icon && <span>{category.icon}</span>}
              <span className="font-semibold">{category.name}</span>
              <span
                className={`text-sm px-2 py-1 rounded ${
                  category.type === "EXPENSE"
                    ? "bg-red-100 text-red-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {category.type}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
