import apiClient from "@/lib/api-client";

const register = async (payload) => {
  const { data } = await apiClient.post("/auth/register", payload);
  return data;
};

const login = async (payload) => {
  const { data } = await apiClient.post("/auth/login", payload);
  return data;
};

const refresh = async (payload) => {
  const { data } = await apiClient.post("/auth/refresh", payload);
  return data;
};

const verifyOtp = async (payload) => {
  const { data } = await apiClient.post("/auth/otp/verify", payload);
  return data;
};

const resendOtp = async (payload) => {
  const { data } = await apiClient.post("/auth/otp/resend", payload);
  return data;
};

const logout = async (payload) => {
  const { data } = await apiClient.post("/auth/logout", payload);
  return data;
};

const getProfile = async () => {
  const { data } = await apiClient.get("/auth/profile");
  return data;
};

const updateProfile = async (payload) => {
  const { data } = await apiClient.put("/auth/profile", payload);
  return data;
};

const updatePassword = async (payload) => {
  const { data } = await apiClient.put("/auth/password", payload);
  return data;
};

const updateCurrency = async (currency) => {
  const { data } = await apiClient.put("/auth/currency", { currency });
  return data;
};

const deactivateAccount = async () => {
  const { data } = await apiClient.put("/auth/deactivate");
  return data;
};

const setTwoFactor = async (enabled) => {
  const { data } = await apiClient.put("/auth/2fa", { enabled });
  return data;
};

export {
  deactivateAccount,
  getProfile,
  login,
  logout,
  refresh,
  resendOtp,
  register,
  setTwoFactor,
  updateCurrency,
  updatePassword,
  updateProfile,
  verifyOtp,
};

