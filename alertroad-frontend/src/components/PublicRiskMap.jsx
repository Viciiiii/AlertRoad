import { useEffect, useState } from "react";
import RiskMap from "./RiskMap";
import "./BottomPanels.css";
import "./PublicRiskMap.css";

const API_URL = "";

function PublicRiskMap() {
  const [scans, setScans] = useState([]);
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPublicMap = async () => {
      try {
        const response = await fetch(`${API_URL}/api/public/map`);
        if (!response.ok) return;
        const data = await response.json();

        setScans(
          data
            .filter((point) => point.type === "scan")
            .map((point) => ({
              location: point.location,
              lat: point.lat,
              lng: point.lng,
              riskLevel: point.risk_level,
            }))
        );

        setReports(
          data
            .filter((point) => point.type === "report")
            .map((point) => ({
              location: point.location,
              lat: point.lat,
              lng: point.lng,
              description: point.description,
            }))
        );
      } catch (err) {
        console.error("Failed to load public map:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadPublicMap();
  }, []);

  const hasAnyData = scans.length > 0 || reports.length > 0;

  return (
    <div className="panel public-map-panel">
      <div className="panel-header">
        <span className="panel-title">Community Risk Map</span>
        <span className="panel-legend">
          <span className="legend-dot legend-low" /> Low
          <span className="legend-dot legend-medium" /> Medium
          <span className="legend-dot legend-high" /> High
          <span className="legend-dot legend-report" /> Reported
        </span>
      </div>
      <div className="panel-body public-map-body">
        {isLoading ? (
          <p className="panel-empty-text">Loading map...</p>
        ) : !hasAnyData ? (
          <p className="panel-empty-text">
            No risk data yet — check back after the first scan or report.
          </p>
        ) : (
          <RiskMap scans={scans} reports={reports} />
        )}
      </div>
    </div>
  );
}

export default PublicRiskMap;