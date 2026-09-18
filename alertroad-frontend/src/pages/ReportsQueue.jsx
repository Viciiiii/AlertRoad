import { useEffect, useState } from "react";
import NavBar from "../components/NavBar";
import { useAuth } from "../context/AuthContext";
import { fetchAuthenticatedFileUrl } from "../utils/media";
import "./ReportsQueue.css";

const API_URL = "";
const TABS = ["pending", "approved", "rejected"];

function ReportsQueue() {
  const { isAdmin, isAuthenticated } = useAuth();

  const [activeTab, setActiveTab] = useState("pending");
  const [reports, setReports] = useState([]);
  const [photoUrls, setPhotoUrls] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const authHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  });

  useEffect(() => {
    const loadReports = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `${API_URL}/api/reports?status=${activeTab}`,
          { headers: authHeaders() }
        );
        if (!response.ok) return;
        const data = await response.json();
        setReports(data);

        const urls = {};
        await Promise.all(
          data.map(async (report) => {
            if (!report.image_filename) return;
            urls[report.id] = await fetchAuthenticatedFileUrl(
              `reports/${report.image_filename}`
            );
          })
        );
        setPhotoUrls(urls);
      } catch (err) {
        console.error("Failed to load reports:", err);
      } finally {
        setIsLoading(false);
      }
    };

        loadReports();
      }, [activeTab]);

  const handleDecision = async (reportId, status) => {
    setBusyId(reportId);
    try {
      const response = await fetch(
        `${API_URL}/api/reports/${reportId}/status`,
        {
          method: "PUT",
          headers: authHeaders(),
          body: JSON.stringify({ status }),
        }
      );
      if (!response.ok) return;

      // Reviewed reports leave the pending list immediately.
      setReports((prev) => prev.filter((r) => r.id !== reportId));
    } catch (err) {
      console.error("Failed to update report status:", err);
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (reportId) => {
    if (!window.confirm("Delete this report permanently?")) return;

    setBusyId(reportId);
    try {
      const response = await fetch(`${API_URL}/api/reports/${reportId}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!response.ok) return;

      setReports((prev) => prev.filter((r) => r.id !== reportId));
    } catch (err) {
      console.error("Failed to delete report:", err);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div
      className={`reports-page${isAuthenticated ? " reports-page-with-sidebar" : ""}`}
    >
      <NavBar />

      <div className="reports-main">
        <div className="reports-content">
          <h1 className="reports-title">Community Reports</h1>
          <p className="reports-subtitle">
            Hazards submitted by the public. Approving does not add these to
            the official scan pipeline — it just marks them as reviewed.
          </p>

          <div className="reports-tabs">
            {TABS.map((tab) => (
              <button
                key={tab}
                className={`reports-tab${activeTab === tab ? " active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {isLoading && <p className="reports-empty-text">Loading...</p>}

          {!isLoading && reports.length === 0 && (
            <p className="reports-empty-text">
              No {activeTab} reports right now.
            </p>
          )}

          <div className="reports-grid">
            {reports.map((report) => (
              <div className="report-item-card" key={report.id}>
                {photoUrls[report.id] ? (
                  <img
                    src={photoUrls[report.id]}
                    alt="Reported hazard"
                    className="report-item-photo"
                  />
                ) : (
                  <div className="report-item-photo report-item-photo-empty">
                    No photo
                  </div>
                )}

                <div className="report-item-body">
                  <p className="report-item-location">{report.location}</p>
                  {report.description && (
                    <p className="report-item-description">
                      {report.description}
                    </p>
                  )}
                  <p className="report-item-meta">
                    {new Date(report.created_at).toLocaleString()}
                    {report.reviewed_by &&
                      ` · reviewed by ${report.reviewed_by}`}
                  </p>

                  {activeTab === "pending" && (
                    <div className="report-item-actions">
                      <button
                        className="report-item-approve"
                        disabled={busyId === report.id}
                        onClick={() => handleDecision(report.id, "approved")}
                      >
                        Approve
                      </button>
                      <button
                        className="report-item-reject"
                        disabled={busyId === report.id}
                        onClick={() => handleDecision(report.id, "rejected")}
                      >
                        Reject
                      </button>
                    </div>
                  )}

                  {activeTab !== "pending" && isAdmin && (
                    <div className="report-item-actions">
                      <button
                        className="report-item-delete"
                        disabled={busyId === report.id}
                        onClick={() => handleDelete(report.id)}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReportsQueue;