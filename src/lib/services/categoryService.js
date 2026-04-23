import apiClient from "@/lib/api-client";

const getCategories = async () => {
  const { data } = await apiClient.get("/categories");
  return data;
};

const getCategoriesByType = async (type) => {
  const { data } = await apiClient.get(`/categories/type/${type}`);
  return data;
};

const getCategoryById = async (id) => {
  const { data } = await apiClient.get(`/categories/${id}`);
  return data;
};

const createCategory = async (payload) => {
  const { data } = await apiClient.post("/categories", payload);
  return data;
};

const updateCategory = async (id, payload) => {
  const { data } = await apiClient.put(`/categories/${id}`, payload);
  return data;
};

const deleteCategory = async (id) => {
  await apiClient.delete(`/categories/${id}`);
};

const setCategoryBudgetLimit = async (id, budgetLimit) => {
  const { data } = await apiClient.put(`/categories/${id}/budget-limit`, { budgetLimit });
  return data;
};

const seedDefaultCategories = async () => {
  const { data } = await apiClient.post("/categories/seed-defaults");
  return data;
};

const getDefaultCategories = async () => {
  const { data } = await apiClient.get("/categories/defaults");
  return data;
};

const getCategoryCount = async (type = null) => {
  const params = type ? { type } : {};
  const { data } = await apiClient.get("/categories/count", { params });
  return data;
};

export {
  createCategory,
  deleteCategory,
  getCategories,
  getCategoriesByType,
  getCategoryById,
  getCategoryCount,
  getDefaultCategories,
  seedDefaultCategories,
  setCategoryBudgetLimit,
  updateCategory,
};
