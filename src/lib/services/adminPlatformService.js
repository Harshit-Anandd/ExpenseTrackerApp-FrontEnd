import apiClient from "@/lib/api-client";

const getAdminExpenses = async () => {
  const { data } = await apiClient.get("/admin/expenses");
  return data;
};

const getAdminExpenseCount = async () => {
  const { data } = await apiClient.get("/admin/expenses/count");
  return data;
};

const getAdminExpenseTotals = async () => {
  const { data } = await apiClient.get("/admin/expenses/totals");
  return data;
};

const getAdminIncomeCount = async () => {
  const { data } = await apiClient.get("/admin/incomes/count");
  return data;
};

const getAdminCategoryCount = async () => {
  const { data } = await apiClient.get("/admin/categories/count");
  return data;
};

export {
  getAdminCategoryCount,
  getAdminExpenseCount,
  getAdminExpenseTotals,
  getAdminExpenses,
  getAdminIncomeCount,
};
