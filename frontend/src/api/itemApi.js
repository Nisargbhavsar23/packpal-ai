import axiosClient from "./axiosClient";

function buildParams(filters = {}) {
  return Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== undefined && value !== null && value !== ""),
  );
}

export async function getTripItems(tripId, filters = {}) {
  const response = await axiosClient.get(`/api/v1/trips/${tripId}/items`, {
    params: buildParams(filters),
  });
  return response.data;
}

export async function createTripItem(tripId, payload) {
  const response = await axiosClient.post(`/api/v1/trips/${tripId}/items`, payload);
  return response.data;
}

export async function getTripItemById(tripId, itemId) {
  const response = await axiosClient.get(`/api/v1/trips/${tripId}/items/${itemId}`);
  return response.data;
}

export async function updateTripItem(tripId, itemId, payload) {
  const response = await axiosClient.patch(`/api/v1/trips/${tripId}/items/${itemId}`, payload);
  return response.data;
}

export async function updateTripItemStatus(tripId, itemId, payload) {
  const response = await axiosClient.patch(`/api/v1/trips/${tripId}/items/${itemId}/status`, payload);
  return response.data;
}

export async function deleteTripItem(tripId, itemId) {
  const response = await axiosClient.delete(`/api/v1/trips/${tripId}/items/${itemId}`);
  return response.data;
}
