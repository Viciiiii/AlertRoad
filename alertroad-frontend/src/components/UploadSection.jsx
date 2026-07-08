import { useRef, useState } from "react";
import CameraSelect from "./CameraSelect";
import LocationAutocomplete from "./LocationAutoComplete";
import "./UploadSection.css";

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

  const isManualMode = selectedCameraId === "manual";

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      onFileSelect(file);
    }
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Your browser doesn't support location access.");
      return;
    }

    setLocationError("");
    setLocatingDevice(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        // Reverse-geocode the coordinates into a human-readable address,
        // using the same OpenStreetMap/Nominatim service the suggestions
        // dropdown uses, so this ends up as a normal "selected location"
        // just like picking one from the list.
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();

          onManualLocationSelect({
            address: data.display_name || `${latitude}, ${longitude}`,
            lat: latitude,
            lng: longitude,
          });
        } catch (err) {
          // Reverse geocoding failed, but we still have real coordinates -
          // fall back to showing them directly as the address text.
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
        <h2 className="upload-loading-title">Analyzing footage...</h2>
        <p className="upload-loading-subtitle">
          Running road-damage and traffic detection, then scoring accident
          risk. This may take a moment for video files.
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
        <h2 className="upload-error-title">Something went wrong</h2>
        <p className="upload-error-subtitle">
          We couldn't analyze the file. This may be a temporary issue with
          the server.
        </p>
        <button className="upload-retry-button" onClick={onRetry}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="upload-section">
      <h2 className="upload-title">Upload an Image or Video</h2>
      <p className="upload-subtitle">
        jpg, png for a photo · mp4, mov for recorded CCTV footage
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

        <button className="upload-browse-button" onClick={handleBrowseClick}>
          {fileName ? fileName : "Browse Files"}
        </button>

        <input
          type="file"
          ref={fileInputRef}
          accept="image/jpeg,image/png,video/mp4,video/quicktime"
          onChange={handleFileChange}
          hidden
        />

        <button className="upload-classify-button" onClick={onClassify}>
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
              {locatingDevice ? "Locating..." : "Use my current location"}
            </button>
          </div>
          {locationError && (
            <p className="upload-inline-error">{locationError}</p>
          )}
        </div>
      )}

      {scanState === "no-file-error" && (
        <p className="upload-inline-error">
          Please select a camera before classifying. Unsupported file type
          may also not be allowed.
        </p>
      )}

      {scanState === "no-camera-error" && (
        <p className="upload-inline-error">
          Please select a camera location before classifying.
        </p>
      )}

      {scanState === "no-location-error" && (
        <p className="upload-inline-error">
          Please select a location from the suggestions list, or use
          "Use my current location", before classifying.
        </p>
      )}
    </div>
  );
}

export default UploadSection;