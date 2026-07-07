import { useState, useRef, useEffect } from "react";
import "./CameraSelect.css";

function CameraSelect({ cameras, selectedCameraId, onSelect, onAddCamera }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedCamera = cameras.find((cam) => cam.id === selectedCameraId);

  const handleSelectCamera = (camera) => {
    onSelect(camera);
    setIsOpen(false);
  };

  const handleAddCameraClick = () => {
    setIsOpen(false);
    onAddCamera();
  };

  return (
    <div className="camera-select" ref={dropdownRef}>
      <button
        type="button"
        className="camera-select-trigger"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span className="camera-select-label">
          {selectedCamera ? selectedCamera.name : "Camera"}
        </span>
        <span className={`camera-select-arrow ${isOpen ? "open" : ""}`}>▾</span>
      </button>

      {isOpen && (
        <div className="camera-select-menu">
          {cameras.length === 0 ? (
            <p className="camera-select-empty">No cameras registered yet</p>
          ) : (
            cameras.map((camera) => (
              <button
                key={camera.id}
                type="button"
                className={`camera-select-item ${
                  camera.id === selectedCameraId ? "selected" : ""
                }`}
                onClick={() => handleSelectCamera(camera)}
              >
                <span className="camera-select-item-name">{camera.name}</span>
                <span className="camera-select-item-location">
                  {camera.location}
                </span>
              </button>
            ))
          )}

          <div className="camera-select-divider" />

          <button
            type="button"
            className="camera-select-add"
            onClick={handleAddCameraClick}
          >
            + Add New Camera
          </button>
        </div>
      )}
    </div>
  );
}

export default CameraSelect;