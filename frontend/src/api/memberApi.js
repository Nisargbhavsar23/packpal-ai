import axiosClient from "./axiosClient";

export async function getTripMembers(tripId) {
  const response = await axiosClient.get(`/api/v1/trips/${tripId}/members`);
  return response.data;
}

export async function addTripMember(tripId, payload) {
  // payload: { email: string, role: "MEMBER" | "ADMIN" | "VIEWER" }
  const response = await axiosClient.post(`/api/v1/trips/${tripId}/members`, payload);
  return response.data;
}

export async function updateMemberRole(tripId, memberId, role) {
  const response = await axiosClient.patch(
    `/api/v1/trips/${tripId}/members/${memberId}/role`,
    { role },
  );
  return response.data;
}

export async function removeTripMember(tripId, memberId) {
  const response = await axiosClient.delete(
    `/api/v1/trips/${tripId}/members/${memberId}`,
  );
  return response.data;
}

export async function leaveTrip(tripId) {
  const response = await axiosClient.delete(`/api/v1/trips/${tripId}/members/me`);
  return response.data;
}
