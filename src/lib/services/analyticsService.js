import apiClient from "@/lib/api-client";

const getLatestSummary = async () => {
  const { data } = await apiClient.get("/analytics/summary");
  return data;
};

const getSummariesByRange = async (from, to) => {
  const { data } = await apiClient.get("/analytics/summary/range", {
    params: { from, to },
  });
  return data;
};

const getMonthlyTrends = async (months = 12) => {
  const { data } = await apiClient.get("/analytics/trends", {
    params: { months },
  });
  return data;
};

const getAnalyticsHistory = async () => {
  const { data } = await apiClient.get("/analytics/history");
  return data;
};

export {
  getAnalyticsHistory,
  getLatestSummary,
  getMonthlyTrends,
  getSummariesByRange,
};
