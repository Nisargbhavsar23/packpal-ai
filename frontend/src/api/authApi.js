import axiosClient from "./axiosClient";

export async function registerUser(payload) {
  const response = await axiosClient.post("/api/v1/auth/register", payload);
  return response.data;
}

export async function loginUser(payload) {
  const response = await axiosClient.post("/api/v1/auth/login", payload);
  return response.data;
}

export async function getCurrentUser() {
  const response = await axiosClient.get("/api/v1/auth/me");
  return response.data;
}

export async function forgotPassword(payload) {
  const response = await axiosClient.post("/api/v1/auth/forgot-password", payload);
  return response.data;
}

export async function resetPassword(payload) {
  const response = await axiosClient.post("/api/v1/auth/reset-password", payload);
  return response.data;
}
