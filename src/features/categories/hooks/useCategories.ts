import { useEffect, useState } from "react";
import { categoriesService } from "../services/categoriesService";
import type { Category } from "../types/category";

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await categoriesService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const toggle = async (id: string, currentStatus: boolean) => {
    try {
      await categoriesService.toggleCategoryStatus(id, !currentStatus);
      setCategories((currentCategories) =>
        currentCategories.map((category) =>
          category.id === id ? { ...category, ativa: !currentStatus } : category,
        ),
      );
    } catch (error) {
      console.error("Error updating status", error);
    }
  };

  return {
    categories,
    fetchCategories,
    loading,
    toggle,
  };
}
