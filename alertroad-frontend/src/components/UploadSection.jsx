import { useRef, useState } from "react";

import CameraSelect from "./CameraSelect";
import LocationAutocomplete from "./LocationAutoComplete";
import "./UploadSection.css";

const UPLOAD_WARNING_STORAGE_KEY =
  "alertroad-hide-upload-quality-warning";

function UploadSection({
  scanState,
  onFileSelect,
  onClassify,
  onRetry,
  cameras,
  selectedCameraId,
  onSelectCamera,
  onAddCamera,
  onDeleteCamera,
  isAdmin,
  manualLocation,
  onManualLocationTextChange,
  onManualLocationSelect,
}) {
  const fileInputRef = useRef(null);

  const [fileName, setFileName] = useState("");
  const [locatingDevice, setLocatingDevice] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [showUploadWarning, setShowUploadWarning] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const isManualMode = selectedCameraId === "manual";

  const openFilePicker = () => {
    if (!fileInputRef.current) {
      return;
    }

    /*
      Resetting the value allows the user to select the same file again
      after cancelling or retrying an upload.
    */
    fileInputRef.current.value = "";
    fileInputRef.current.click();
  };

  const shouldHideUploadWarning = () => {
    try {
      return (
        localStorage.getItem(UPLOAD_WARNING_STORAGE_KEY) === "true"
      );
    } catch (error) {
      console.warn(
        "Unable to read the upload warning preference:",
        error
      );

      return false;
    }
  };

  const handleBrowseClick = () => {
    if (shouldHideUploadWarning()) {
      openFilePicker();
      return;
    }

    setDontShowAgain(false);
    setShowUploadWarning(true);
  };

  const handleContinueUpload = () => {
    if (dontShowAgain) {
      try {
        localStorage.setItem(
          UPLOAD_WARNING_STORAGE_KEY,
          "true"
        );
      } catch (error) {
        console.warn(
          "Unable to save the upload warning preference:",
          error
        );
      }
    }

    setShowUploadWarning(false);
    openFilePicker();
  };

  const handleCloseUploadWarning = () => {
    setShowUploadWarning(false);
    setDontShowAgain(false);
  };

  const handleWarningBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      handleCloseUploadWarning();
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setFileName(file.name);
    onFileSelect(file);
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setLocationError(
        "Your browser doesn't support location access."
      );
      return;
    }

    setLocationError("");
    setLocatingDevice(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );

          const data = await response.json();

          onManualLocationSelect({
            address:
              data.display_name ||
              `${latitude}, ${longitude}`,
            lat: latitude,
            lng: longitude,
          });
        } catch (error) {
          onManualLocationSelect({
            address: `${latitude}, ${longitude}`,
            lat: latitude,
            lng: longitude,
          });
        } finally {
          setLocatingDevice(false);
        }
      },
      () => {
        setLocationError(
          "Couldn't get your location. Please search for it instead."
        );
        setLocatingDevice(false);
      }
    );
  };

  if (scanState === "loading") {
    return (
      <div className="upload-section upload-section-loading">
        <div className="upload-spinner" />

        <h2 className="upload-loading-title">
          Analyzing footage...
        </h2>

        <p className="upload-loading-subtitle">
          Running road-damage and traffic detection, then
          scoring accident risk. This may take a moment for
          video files.
        </p>

        <div className="upload-progress-track">
          <div className="upload-progress-fill" />
        </div>
      </div>
    );
  }

  if (scanState === "error") {
    return (
      <div className="upload-section upload-section-error">
        <div className="upload-error-icon">!</div>

        <h2 className="upload-error-title">
          Something went wrong
        </h2>

        <p className="upload-error-subtitle">
          We couldn't analyze the file. This may be a temporary
          issue with the server.
        </p>

        <button
          type="button"
          className="upload-retry-button"
          onClick={onRetry}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="upload-section">
      <h2 className="upload-title">
        Upload an Image or Video
      </h2>

      <p className="upload-subtitle">
        jpg, png for a photo · mp4, mov for recorded CCTV
        footage
      </p>

      <div className="upload-controls">
        <CameraSelect
          cameras={cameras}
          selectedCameraId={selectedCameraId}
          onSelect={(camera) => onSelectCamera(camera.id)}
          onAddCamera={onAddCamera}
          onDeleteCamera={onDeleteCamera}
          isAdmin={isAdmin}
        />

        <button
          type="button"
          className="upload-browse-button"
          onClick={handleBrowseClick}
        >
          {fileName || "Browse Files"}
        </button>

        <input
          type="file"
          ref={fileInputRef}
          accept="image/jpeg,image/png,video/mp4,video/quicktime"
          onChange={handleFileChange}
          hidden
        />

        <button
          type="button"
          className="upload-classify-button"
          onClick={onClassify}
        >
          Classify
        </button>
      </div>

      {isManualMode && (
        <div className="upload-manual-location">
          <div className="upload-manual-location-row">
            <LocationAutocomplete
              value={manualLocation.location}
              onChange={onManualLocationTextChange}
              onSelectLocation={onManualLocationSelect}
            />

            <button
              type="button"
              className="upload-manual-locate-button"
              onClick={handleUseMyLocation}
              disabled={locatingDevice}
            >
              {locatingDevice
                ? "Locating..."
                : "Use my current location"}
            </button>
          </div>

          {locationError && (
            <p className="upload-inline-error">
              {locationError}
            </p>
          )}
        </div>
      )}

      {scanState === "no-file-error" && (
        <p className="upload-inline-error">
          Please select a file before classifying. Unsupported
          file types may also not be allowed.
        </p>
      )}

      {scanState === "no-camera-error" && (
        <p className="upload-inline-error">
          Please select a camera location before classifying.
        </p>
      )}

      {scanState === "no-location-error" && (
        <p className="upload-inline-error">
          Please select a location from the suggestions list,
          or use "Use my current location", before classifying.
        </p>
      )}

      {showUploadWarning && (
        <div
          className="upload-warning-backdrop"
          onClick={handleWarningBackdropClick}
        >
          <div
            className="upload-warning-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="upload-warning-title"
          >
            <div className="upload-warning-header">
              <div className="upload-warning-icon">!</div>

              <div>
                <h3
                  id="upload-warning-title"
                  className="upload-warning-title"
                >
                  Image and Video Quality Reminder
                </h3>

                <p className="upload-warning-introduction">
                  For more reliable road-damage detection,
                  please make sure the image or video follows
                  these guidelines:
                </p>
              </div>
            </div>

            <ul className="upload-warning-list">
              <li>
                Capture the road from a sufficient distance so
                the damaged area and its surroundings are
                visible.
              </li>

              <li>
                Make sure the road surface is clear, well-lit,
                and not blurry.
              </li>

              <li>
                Avoid obstructions, excessive camera movement,
                glare, and very dark footage.
              </li>
            </ul>

            <p className="upload-warning-note">
              Poor distance, lighting, or image quality may
              affect the detection and risk-classification
              results.
            </p>

            <label className="upload-warning-checkbox">
              <input
                type="checkbox"
                checked={dontShowAgain}
                onChange={(event) =>
                  setDontShowAgain(event.target.checked)
                }
              />

              <span className="upload-warning-checkbox-box">
                <span className="upload-warning-checkbox-check">
                  ✓
                </span>
              </span>

              <span className="upload-warning-checkbox-label">
                Don't show this reminder again
              </span>
            </label>

            <div className="upload-warning-actions">
              <button
                type="button"
                className="upload-warning-cancel"
                onClick={handleCloseUploadWarning}
              >
                Cancel
              </button>

              <button
                type="button"
                className="upload-warning-continue"
                onClick={handleContinueUpload}
              >
                Continue to Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UploadSection;