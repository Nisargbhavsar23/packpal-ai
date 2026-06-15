import axiosClient from "./axiosClient";

function getFilenameFromHeaders(headers) {
  const disposition = headers?.["content-disposition"];
  const match = disposition?.match(/filename="?([^"]+)"?/i);
  return match?.[1] || "packpal-trip-report.pdf";
}

export async function downloadTripPdf(tripId) {
  const response = await axiosClient.get(`/api/v1/trips/${tripId}/export/pdf`, {
    responseType: "blob",
  });
  const filename = getFilenameFromHeaders(response.headers);
  const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
