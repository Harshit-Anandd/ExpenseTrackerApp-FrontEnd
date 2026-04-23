import apiClient from "@/lib/api-client";

const getRecurringRules = async () => {
  const { data } = await apiClient.get("/recurring");
  return data;
};

const getActiveRules = async () => {
  const { data } = await apiClient.get("/recurring/active");
  return data;
};

const getRecurringRuleById = async (id) => {
  const { data } = await apiClient.get(`/recurring/${id}`);
  return data;
};

const createRecurringRule = async (payload) => {
  const { data } = await apiClient.post("/recurring", payload);
  return data;
};

const updateRecurringRule = async (id, payload) => {
  const { data } = await apiClient.put(`/recurring/${id}`, payload);
  return data;
};

const toggleRecurringRule = async (id) => {
  const { data } = await apiClient.put(`/recurring/${id}/toggle`);
  return data;
};

const deleteRecurringRule = async (id) => {
  await apiClient.delete(`/recurring/${id}`);
};

const getActiveCount = async () => {
  const { data } = await apiClient.get("/recurring/count");
  return data;
};

export {
  createRecurringRule,
  deleteRecurringRule,
  getActiveCount,
  getActiveRules,
  getRecurringRuleById,
  getRecurringRules,
  toggleRecurringRule,
  updateRecurringRule,
};
