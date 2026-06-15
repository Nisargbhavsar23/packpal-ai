import axiosClient from "./axiosClient";

export async function generatePackingList(tripId, payload) {
  const response = await axiosClient.post(`/api/v1/trips/${tripId}/ai/packing-list`, payload);
  return response.data;
}

export async function findMissingEssentials(tripId, payload) {
  const response = await axiosClient.post(`/api/v1/trips/${tripId}/ai/missing-essentials`, payload);
  return response.data;
}

export async function generateTripSummary(tripId, payload = {}) {
  const response = await axiosClient.post(`/api/v1/trips/${tripId}/ai/trip-summary`, payload);
  return response.data;
}

export async function askAssistant(tripId, payload) {
  const response = await axiosClient.post(`/api/v1/trips/${tripId}/ai/ask`, payload);
  return response.data;
}

export async function applyAISuggestedItems(tripId, payload) {
  const response = await axiosClient.post(`/api/v1/trips/${tripId}/ai/apply-items`, payload);
  return response.data;
}
