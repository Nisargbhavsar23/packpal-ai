import axiosClient from "./axiosClient";

export async function getTrips() {
  const response = await axiosClient.get("/api/v1/trips");
  return response.data;
}

export async function createTrip(payload) {
  const response = await axiosClient.post("/api/v1/trips", payload);
  return response.data;
}

export async function getTripById(tripId) {
  const response = await axiosClient.get(`/api/v1/trips/${tripId}`);
  return response.data;
}

export async function updateTrip(tripId, payload) {
  const response = await axiosClient.patch(`/api/v1/trips/${tripId}`, payload);
  return response.data;
}

export async function deleteTrip(tripId) {
  const response = await axiosClient.delete(`/api/v1/trips/${tripId}`);
  return response.data;
}
