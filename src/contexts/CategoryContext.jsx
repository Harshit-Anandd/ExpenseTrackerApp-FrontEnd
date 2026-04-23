import { createContext, useCallback, useContext, useEffect, useState } from "react";
import {
  getCategories,
  getCategoriesByType,
  createCategory as createCategoryRequest,
  updateCategory as updateCategoryRequest,
  deleteCategory as deleteCategoryRequest,
  seedDefaultCategories,
} from "@/lib/services/categoryService";
import { useAuth } from "@/contexts/AuthContext";

const CategoryContext = createContext(null);

/**
 * Provides app-wide category state and actions.
 * Categories are fetched once on login and cached until refresh.
 */
const CategoryProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCategories = useCallback(async () => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
      setError(err?.response?.data?.message || "Failed to load categories");
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Auto-fetch categories when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchCategories();
    } else {
      setCategories([]);
    }
  }, [isAuthenticated, fetchCategories]);

  const expenseCategories = categories.filter((c) => c.type === "EXPENSE");
  const incomeCategories = categories.filter(
    (c) => c.type === "INCOME" || c.type === "BOTH",
  );

  const createCategory = useCallback(
    async (payload) => {
      const newCategory = await createCategoryRequest(payload);
      setCategories((prev) => [...prev, newCategory]);
      return newCategory;
    },
    [],
  );

  const updateCategory = useCallback(
    async (id, payload) => {
      const updated = await updateCategoryRequest(id, payload);
      setCategories((prev) =>
        prev.map((c) => (c.categoryId === id ? updated : c)),
      );
      return updated;
    },
    [],
  );

  const deleteCategory = useCallback(
    async (id) => {
      await deleteCategoryRequest(id);
      setCategories((prev) => prev.filter((c) => c.categoryId !== id));
    },
    [],
  );

  const seedDefaults = useCallback(async () => {
    await seedDefaultCategories();
    await fetchCategories();
  }, [fetchCategories]);

  const getCategoryById = useCallback(
    (id) => categories.find((c) => c.categoryId === id),
    [categories],
  );

  const getCategoryName = useCallback(
    (id) => {
      const cat = categories.find((c) => c.categoryId === id);
      return cat?.name || "Unknown";
    },
    [categories],
  );

  const value = {
    categories,
    expenseCategories,
    incomeCategories,
    isLoading,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    seedDefaults,
    getCategoryById,
    getCategoryName,
  };

  return (
    <CategoryContext.Provider value={value}>
      {children}
    </CategoryContext.Provider>
  );
};

const useCategories = () => {
  const context = useContext(CategoryContext);
  if (!context) {
    throw new Error("useCategories must be used within CategoryProvider");
  }
  return context;
};

export { CategoryProvider, useCategories };
