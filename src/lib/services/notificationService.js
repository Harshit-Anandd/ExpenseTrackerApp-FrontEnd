import apiClient from "@/lib/api-client";

const getNotifications = async () => {
  const { data } = await apiClient.get("/notifications");
  return data;
};

const getUnreadNotifications = async () => {
  const { data } = await apiClient.get("/notifications/unread");
  return data;
};

const getUnreadCount = async () => {
  const { data } = await apiClient.get("/notifications/unread/count");
  return data;
};

const markAsRead = async (id) => {
  const { data } = await apiClient.put(`/notifications/${id}/read`);
  return data;
};

const markAllAsRead = async () => {
  const { data } = await apiClient.put("/notifications/read-all");
  return data;
};

const deleteNotification = async (id) => {
  await apiClient.delete(`/notifications/${id}`);
};

export {
  deleteNotification,
  getNotifications,
  getUnreadCount,
  getUnreadNotifications,
  markAllAsRead,
  markAsRead,
};
