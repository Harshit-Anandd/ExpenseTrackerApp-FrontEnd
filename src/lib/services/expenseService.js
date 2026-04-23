import apiClient from "@/lib/api-client";
import { PAYMENT_METHOD_FROM_API, PAYMENT_METHOD_TO_API } from "@/lib/constants";

const normalizeAmount = (value) => {
  const parsed = Number.parseFloat(String(value ?? "").trim().replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
};

/**
 * Map API expense to UI format.
 * Category name is now resolved by the caller using CategoryContext.
 */
const mapExpenseToUi = (expense) => ({
  ...expense,
  id: String(expense.expenseId),
  paymentMethod: PAYMENT_METHOD_FROM_API[expense.paymentMethod] || expense.paymentMethod,
});

const buildCreatePayload = (form, currency = "USD") => {
  const amount = normalizeAmount(form.amount);
  return {
  categoryId: form.categoryId ? Number(form.categoryId) : null,
  title: form.title,
  amount,
  currency,
  type: "EXPENSE",
  paymentMethod: PAYMENT_METHOD_TO_API[form.paymentMethod] || form.paymentMethod,
  date: form.date,
  notes: form.notes?.trim() || null,
  isRecurring: Boolean(form.isRecurring),
  };
};

const buildUpdatePayload = (form, currency = "USD") => {
  const amount = normalizeAmount(form.amount);
  return {
  categoryId: form.categoryId ? Number(form.categoryId) : null,
  title: form.title,
  amount,
  currency,
  type: "EXPENSE",
  paymentMethod: PAYMENT_METHOD_TO_API[form.paymentMethod] || form.paymentMethod,
  date: form.date,
  notes: form.notes?.trim() || null,
  isRecurring: Boolean(form.isRecurring),
  };
};

const listExpenses = async (filters = {}) => {
  const { data } = await apiClient.get("/expenses", { params: filters });
  return data;
};

const createExpense = async (payload) => {
  const { data } = await apiClient.post("/expenses", payload);
  return data;
};

const updateExpense = async (expenseId, payload) => {
  const { data } = await apiClient.put(`/expenses/${expenseId}`, payload);
  return data;
};

const deleteExpense = async (expenseId) => {
  await apiClient.delete(`/expenses/${expenseId}`);
};

const getExpenseTotals = async (categoryId) => {
  const params = categoryId ? { categoryId } : undefined;
  const { data } = await apiClient.get("/expenses/totals", { params });
  return data;
};

const uploadReceipt = async (expenseId, file) => {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await apiClient.post(`/expenses/${expenseId}/receipt`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return data;
};

export {
  buildCreatePayload,
  buildUpdatePayload,
  createExpense,
  deleteExpense,
  getExpenseTotals,
  listExpenses,
  mapExpenseToUi,
  updateExpense,
  uploadReceipt,
};
