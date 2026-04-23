import apiClient from "@/lib/api-client";

const getUsers = async (params = {}) => {
  const { data } = await apiClient.get("/admin/users", { params });
  return data;
};

const updateUserStatus = async (userId, active) => {
  const { data } = await apiClient.put(`/admin/users/${userId}/status`, { active });
  return data;
};

const updateUserRole = async (userId, role) => {
  const { data } = await apiClient.put(`/admin/users/${userId}/role`, { role });
  return data;
};

const updateUserSubscription = async (userId, subscriptionType) => {
  const { data } = await apiClient.put(`/admin/users/${userId}/subscription`, {
    subscriptionType,
  });
  return data;
};

export { getUsers, updateUserRole, updateUserStatus, updateUserSubscription };

