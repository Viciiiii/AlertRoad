import { useState, useEffect } from "react";
import NavBar from "../components/NavBar";
import UploadSection from "../components/UploadSection";
import ScanResult from "../components/ScanResult";
import BottomPanels from "../components/BottomPanels";
import ScanModal from "../components/ScanModal";
import InfoSections from "../components/InfoSections";
import AddCameraModal from "../components/AddCameraModal";
import { initialCameras } from "../data/mockCameras";
import "./Dashboard.css";

const API_URL = "http://localhost:8000";

// scanState: "idle" | "loading" | "success" | "error" | "no-file-error" | "no-camera-error"
function Dashboard() {
  const [scanState, setScanState] = useState("idle");
  const [currentScan, setCurrentScan] = useState(null);
  const [recentScans, setRecentScans] = useState([]);
  const [modalScan, setModalScan] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const [cameras, setCameras] = useState(initialCameras);
  const [selectedCameraId, setSelectedCameraId] = useState(null);
  const [showAddCameraModal, setShowAddCameraModal] = useState(false);

  // Load past scans from the database when the dashboard first mounts
  useEffect(() => {
    const loadScans = async () => {
      try {
        const response = await fetch(`${API_URL}/api/scans`);
        if (!response.ok) return;
        const data = await response.json();

        const formatted = data.map((scan) => ({
          ...scan,
          riskLevel: scan.risk_level,
          fileUrl: null,
          fileType: "Image",
          cameraName: null,
          lat: null,
          lng: null,
        }));

        setRecentScans(formatted);
      } catch (err) {
        console.error("Failed to load past scans:", err);
      }
    };

    loadScans();
  }, []);

  const handleFileSelect = (file) => {
    setSelectedFile(file);
  };

  const handleClassify = async () => {
    if (!selectedCameraId) {
      setScanState("no-camera-error");
      return;
    }

    if (!selectedFile) {
      setScanState("no-file-error");
      return;
    }

    setScanState("loading");

    const selectedCamera = cameras.find((cam) => cam.id === selectedCameraId);
    const location = selectedCamera ? selectedCamera.location : "Unknown location";

    try {
      const response = await fetch(`${API_URL}/api/scans`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ location }),
      });

      if (!response.ok) {
        setScanState("error");
        return;
      }

      const saved = await response.json();

      const result = {
        ...saved,
        riskLevel: saved.risk_level,
        cameraName: selectedCamera ? selectedCamera.name : "Unknown Camera",
        lat: selectedCamera ? selectedCamera.lat : null,
        lng: selectedCamera ? selectedCamera.lng : null,
        fileName: selectedFile.name,
        fileUrl: URL.createObjectURL(selectedFile),
        fileType: selectedFile.type.startsWith("video") ? "Video" : "Image",
      };

      setCurrentScan(result);
      setRecentScans((prev) => [result, ...prev]);
      setScanState("success");
    } catch (err) {
      console.error("Classify request failed:", err);
      setScanState("error");
    }
  };

  const handleRetry = () => {
    setScanState("idle");
    handleClassify();
  };

  const handleUploadAnother = () => {
    setScanState("idle");
    setSelectedFile(null);
  };

  const handleOpenModal = (scan) => {
    setModalScan(scan);
  };

  const handleCloseModal = () => {
    setModalScan(null);
  };

  const handleAddCamera = (newCamera) => {
    setCameras((prev) => [...prev, newCamera]);
    setSelectedCameraId(newCamera.id);
  };

  const handleDeleteCamera = (cameraId) => {
    setCameras((prev) => prev.filter((cam) => cam.id !== cameraId));
    setSelectedCameraId((prev) => (prev === cameraId ? null : prev));
  };

  return (
    <div className="dashboard-page">
      <NavBar />

      <div className="dashboard-fold">
        <div className="dashboard-hero">
          <h1 className="dashboard-title">
            See road risk before it becomes an accident
          </h1>
          <p className="dashboard-subtitle">
            AlertRoad reads road images and recorded CCTV footage, detects
            damage and traffic, and scores accident risk automatically — so LGU
            teams know exactly where to act first.
          </p>
        </div>

        <div className="dashboard-content">
          {scanState === "success" && currentScan ? (
            <ScanResult scan={currentScan} onUploadAnother={handleUploadAnother} />
          ) : (
            <UploadSection
              scanState={scanState}
              onFileSelect={handleFileSelect}
              onClassify={handleClassify}
              onRetry={handleRetry}
              cameras={cameras}
              selectedCameraId={selectedCameraId}
              onSelectCamera={setSelectedCameraId}
              onAddCamera={() => setShowAddCameraModal(true)}
              onDeleteCamera={handleDeleteCamera}
            />
          )}

          <BottomPanels
            recentScans={recentScans}
            onSelectScan={handleOpenModal}
          />
        </div>
      </div>

      <InfoSections />

      {modalScan && (
        <ScanModal scan={modalScan} onClose={handleCloseModal} />
      )}

      {showAddCameraModal && (
        <AddCameraModal
          onClose={() => setShowAddCameraModal(false)}
          onAddCamera={handleAddCamera}
        />
      )}
    </div>
  );
}

export default Dashboard;