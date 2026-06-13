import axiosClient from "./axiosClient";

export async function getCategories() {
  const response = await axiosClient.get("/api/v1/categories");
  return response.data;
}

export async function createCategory(payload) {
  const response = await axiosClient.post("/api/v1/categories", payload);
  return response.data;
}

export async function updateCategory(categoryId, payload) {
  const response = await axiosClient.patch(`/api/v1/categories/${categoryId}`, payload);
  return response.data;
}

export async function deleteCategory(categoryId) {
  const response = await axiosClient.delete(`/api/v1/categories/${categoryId}`);
  return response.data;
}
