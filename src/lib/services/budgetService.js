import apiClient from "@/lib/api-client";

const getBudgets = async () => {
  const { data } = await apiClient.get("/budgets");
  return data;
};

const getActiveBudgets = async () => {
  const { data } = await apiClient.get("/budgets/active");
  return data;
};

const getBudgetById = async (id) => {
  const { data } = await apiClient.get(`/budgets/${id}`);
  return data;
};

const createBudget = async (payload) => {
  const { data } = await apiClient.post("/budgets", payload);
  return data;
};

const updateBudget = async (id, payload) => {
  const { data } = await apiClient.put(`/budgets/${id}`, payload);
  return data;
};

const deleteBudget = async (id) => {
  await apiClient.delete(`/budgets/${id}`);
};

const getExceededBudgets = async () => {
  const { data } = await apiClient.get("/budgets/exceeded");
  return data;
};

const getBudgetCount = async () => {
  const { data } = await apiClient.get("/budgets/count");
  return data;
};

export {
  createBudget,
  deleteBudget,
  getActiveBudgets,
  getBudgetById,
  getBudgetCount,
  getBudgets,
  getExceededBudgets,
  updateBudget,
};
