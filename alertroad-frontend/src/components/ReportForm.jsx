import { useRef, useState } from "react";

import LocationAutocomplete from "./LocationAutoComplete";
import "./ReportForm.css";

const API_URL = "";

// reportState: "idle" | "submitting" | "success" | "error"
function ReportForm() {
  const fileInputRef = useRef(null);

  const [reportState, setReportState] = useState("idle");
  const [fileName, setFileName] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [location, setLocation] = useState({ text: "", lat: "", lng: "" });
  const [description, setDescription] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const openFilePicker = () => {
    if (!fileInputRef.current) return;
    fileInputRef.current.value = "";
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setFileName(file.name);
  };

  const handleLocationTextChange = (text) => {
    setLocation((prev) => ({ ...prev, text, lat: "", lng: "" }));
  };

  const handleLocationSelect = ({ address, lat, lng }) => {
    setLocation({ text: address, lat, lng });
  };

  const resetForm = () => {
    setSelectedFile(null);
    setFileName("");
    setLocation({ text: "", lat: "", lng: "" });
    setDescription("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!selectedFile) {
      setErrorMessage("Please attach a photo of the hazard.");
      return;
    }
    if (!location.text.trim() || location.lat === "" || location.lng === "") {
      setErrorMessage("Please pick a location from the suggestions.");
      return;
    }

    setReportState("submitting");

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("location", location.text);
    formData.append("lat", location.lat);
    formData.append("lng", location.lng);
    if (description.trim()) {
      formData.append("description", description.trim());
    }

    try {
      const response = await fetch(`${API_URL}/api/reports`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        setReportState("error");
        setErrorMessage("Something went wrong sending your report. Please try again.");
        return;
      }

      setReportState("success");
      resetForm();
    } catch (err) {
      console.error("Report submission failed:", err);
      setReportState("error");
      setErrorMessage("Something went wrong sending your report. Please try again.");
    }
  };

  if (reportState === "success") {
    return (
      <div className="report-card">
        <div className="report-success">
          <div className="report-success-icon">✓</div>
          <h2 className="report-success-title">Thanks for the report</h2>
          <p className="report-success-subtitle">
            Your photo and location have been sent to the AlertRoad team for
            review. Approved reports help LGU staff spot hazards faster.
          </p>
          <button
            className="report-submit-another"
            onClick={() => setReportState("idle")}
          >
            Report another hazard
          </button>
        </div>
      </div>
    );
  }

  return (
    <form className="report-card" onSubmit={handleSubmit}>
      <h2 className="report-title">Report a Road Hazard</h2>
      <p className="report-subtitle">
        Spotted a pothole, crack, or damaged road? Send a photo and its
        location — our team reviews every report before it's added.
      </p>

      <div className="report-field">
        <label className="report-label">Photo</label>
        <button
          type="button"
          className="report-browse-button"
          onClick={openFilePicker}
        >
          {fileName || "Choose a photo"}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="report-file-input"
          onChange={handleFileChange}
        />
      </div>

      <div className="report-field">
        <label className="report-label">Location</label>
        <LocationAutocomplete
          value={location.text}
          onChange={handleLocationTextChange}
          onSelectLocation={handleLocationSelect}
        />
      </div>

      <div className="report-field">
        <label className="report-label">
          Description <span className="report-label-optional">(optional)</span>
        </label>
        <textarea
          className="report-textarea"
          placeholder="e.g. Large pothole, cars swerving to avoid it"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
      </div>

      {errorMessage && <p className="report-error-text">{errorMessage}</p>}

      <button
        type="submit"
        className="report-submit"
        disabled={reportState === "submitting"}
      >
        {reportState === "submitting" ? "Sending..." : "Send Report"}
      </button>
    </form>
  );
}

export default ReportForm;