import { useState } from "react";
import "./AddCameraModal.css";

function AddCameraModal({ onClose, onAddCamera }) {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [error, setError] = useState("");

  const handleBackdropClick = () => {
    onClose();
  };

  const handleCardClick = (e) => {
    e.stopPropagation();
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name.trim() || !location.trim()) {
      setError("Please fill in both camera name and location.");
      return;
    }

    onAddCamera({
      id: `cam-${Date.now()}`,
      name: name.trim(),
      location: location.trim(),
    });

    onClose();
  };

  return (
    <div className="add-camera-backdrop" onClick={handleBackdropClick}>
      <div className="add-camera-card" onClick={handleCardClick}>
        <button className="add-camera-close" onClick={onClose}>
          ×
        </button>

        <h2 className="add-camera-title">Add New Camera</h2>
        <p className="add-camera-subtitle">
          Register a camera once so its location can be reused for every
          future upload.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <label className="add-camera-label" htmlFor="camera-name">
            Camera Name
          </label>
          <input
            id="camera-name"
            type="text"
            className="add-camera-input"
            placeholder="e.g. Camera 4 – Commonwealth Ave."
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <label className="add-camera-label" htmlFor="camera-location">
            Location
          </label>
          <input
            id="camera-location"
            type="text"
            className="add-camera-input"
            placeholder="e.g. Commonwealth Ave., Quezon City"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />

          {error && <p className="add-camera-error">{error}</p>}

          <button type="submit" className="add-camera-submit">
            Save Camera
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddCameraModal;