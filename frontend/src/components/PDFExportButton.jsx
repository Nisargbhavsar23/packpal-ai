import { useState } from "react";

import { downloadTripPdf } from "../api/exportApi";
import Alert from "./Alert";
import Button from "./Button";
import LoadingSpinner from "./LoadingSpinner";

function getExportError(error) {
  if (error?.response?.status === 403) {
    return "You do not have permission to export this trip.";
  }
  if (error?.response?.status === 401) {
    return "Session expired. Please login again.";
  }
  return "Failed to export PDF. Please try again.";
}

function PDFExportButton({ tripId }) {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState("");

  async function handleExport() {
    setIsExporting(true);
    setError("");
    try {
      await downloadTripPdf(tripId);
    } catch (exportError) {
      setError(getExportError(exportError));
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Button variant="secondary" onClick={handleExport} disabled={isExporting}>
        {isExporting ? (
          <LoadingSpinner label="Exporting" spinnerClassName="border-slate-300 border-t-emerald-600" />
        ) : (
          "Export PDF"
        )}
      </Button>
      {error && <Alert>{error}</Alert>}
    </div>
  );
}

export default PDFExportButton;
