import apiClient from "@/lib/api-client";

const INCOME_SOURCE_TO_API = {
  Salary: "SALARY",
  Freelance: "FREELANCE",
  Business: "BUSINESS",
  Investment: "INVESTMENT",
  Gift: "GIFT",
  Other: "OTHER",
};

const INCOME_SOURCE_FROM_API = {
  SALARY: "Salary",
  FREELANCE: "Freelance",
  BUSINESS: "Business",
  INVESTMENT: "Investment",
  GIFT: "Gift",
  OTHER: "Other",
};

/** Map category display name to backend IncomeSource; custom categories use OTHER. */
const resolveIncomeApiSource = (categoryName) => {
  const key = (categoryName || "").trim().toLowerCase();
  const match = Object.entries(INCOME_SOURCE_TO_API).find(
    ([label]) => label.toLowerCase() === key,
  );
  return match ? match[1] : "OTHER";
};

const mapIncomeToUi = (income) => ({
  ...income,
  source: INCOME_SOURCE_FROM_API[income.source] || income.source,
});

const getIncomes = async (params = {}) => {
  const query = { ...params };
  if (params.startDate != null) {
    query.from = params.startDate;
    delete query.startDate;
  }
  if (params.endDate != null) {
    query.to = params.endDate;
    delete query.endDate;
  }
  const { data } = await apiClient.get("/incomes", { params: query });
  return data.map(mapIncomeToUi);
};

const getIncomeById = async (id) => {
  const { data } = await apiClient.get(`/incomes/${id}`);
  return mapIncomeToUi(data);
};

const createIncome = async (payload) => {
  const { data } = await apiClient.post("/incomes", {
    ...payload,
    source:
      typeof payload.source === "string" && payload.source.includes("_")
        ? payload.source
        : INCOME_SOURCE_TO_API[payload.source] || payload.source,
  });
  return mapIncomeToUi(data);
};

const updateIncome = async (id, payload) => {
  const { data } = await apiClient.put(`/incomes/${id}`, {
    ...payload,
    source:
      typeof payload.source === "string" && payload.source.includes("_")
        ? payload.source
        : INCOME_SOURCE_TO_API[payload.source] || payload.source,
  });
  return mapIncomeToUi(data);
};

const deleteIncome = async (id) => {
  await apiClient.delete(`/incomes/${id}`);
};

const getIncomeTotals = async () => {
  const { data } = await apiClient.get("/incomes/totals");
  return data;
};

export {
  createIncome,
  deleteIncome,
  getIncomeById,
  getIncomes,
  getIncomeTotals,
  resolveIncomeApiSource,
  updateIncome,
};
