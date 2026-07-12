import { useState } from "react";
import "./ScanResult.css";

function ScanResult({ scan, onUploadAnother }) {
  // Default to the annotated (bounding-box) view when one exists, since
  // that's the more useful view — falls back to the raw upload otherwise.
  const [showAnnotated, setShowAnnotated] = useState(Boolean(scan.annotatedFileUrl));

  const hasAnnotated = Boolean(scan.annotatedFileUrl);
  const isVideo = scan.fileType === "Video";

  return (
    <div className="scan-result">
      <div className="scan-result-header">
        <button className="scan-upload-another" onClick={onUploadAnother}>
          + Upload another scan
        </button>
      </div>

      <div className="scan-result-grid">
        <div className="scan-media-wrapper">
          {hasAnnotated && (
            <div className="scan-media-toggle">
              <button
                className={showAnnotated ? "active" : ""}
                onClick={() => setShowAnnotated(true)}
              >
                Detected damage
              </button>
              <button
                className={!showAnnotated ? "active" : ""}
                onClick={() => setShowAnnotated(false)}
              >
                {isVideo ? "Original video" : "Original image"}
              </button>
            </div>
          )}

          {showAnnotated && hasAnnotated ? (
            <img
              className="scan-media"
              src={scan.annotatedFileUrl}
              alt={
                isVideo
                  ? "Detected road damage, annotated frame from video"
                  : "Detected road damage with bounding boxes"
              }
            />
          ) : isVideo ? (
            <video className="scan-media" src={scan.fileUrl} controls />
          ) : (
            <img className="scan-media" src={scan.fileUrl} alt="Scanned road" />
          )}

          {hasAnnotated && showAnnotated && isVideo && (
            <p className="scan-media-note">
              Showing a single annotated frame extracted from the video, not
              the full clip.
            </p>
          )}
        </div>

        <div className="scan-info-column">
          <div className="scan-risk-card">
            <p className="scan-risk-label">Risk Level</p>
            <p className="scan-risk-value">{scan.riskLevel}</p>
            <p className="scan-risk-location">📍 {scan.location}</p>
            <span className="scan-risk-icon">⚠</span>
          </div>

          {scan.riskReason && (
            <p
              className={
                scan.damageDetected === false
                  ? "scan-risk-reason scan-risk-reason-warning"
                  : "scan-risk-reason"
              }
            >
              {scan.damageDetected === false ? "⚠ " : ""}
              {scan.riskReason}
            </p>
          )}

          <div className="scan-stats-grid">
            <div className="scan-stat-card">
              <p className="scan-stat-label">Potholes</p>
              <p className="scan-stat-value">{scan.potholes}</p>
            </div>
            <div className="scan-stat-card">
              <p className="scan-stat-label">Cracks</p>
              <p className="scan-stat-value">{scan.cracks}</p>
            </div>
            <div className="scan-stat-card">
              <p className="scan-stat-label">Confidence</p>
              <p className="scan-stat-value">{scan.confidence}%</p>
            </div>
            <div className="scan-stat-card">
              <p className="scan-stat-label">Traffic</p>
              <p className="scan-stat-value">{scan.traffic} veh</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ScanResult;