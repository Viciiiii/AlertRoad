import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import alertroadLogo from "../assets/alertroad-logo.jpg";
import "./NavBar.css";

const icons = {
  dashboard: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="3" width="8" height="8" rx="1.5" />
      <rect x="13" y="3" width="8" height="8" rx="1.5" />
      <rect x="3" y="13" width="8" height="8" rx="1.5" />
      <rect x="13" y="13" width="8" height="8" rx="1.5" />
    </svg>
  ),
  manageStaff: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5" />
      <circle cx="18" cy="9" r="2.4" />
      <path d="M15 20c.2-2.1 1.6-3.6 3.5-3.6" />
    </svg>
  ),
  about: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v5M12 16h.01" />
    </svg>
  ),
  logout: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5M21 12H9" />
    </svg>
  ),
};

function getInitials(name) {
  if (!name) return "?";
  return name.slice(0, 2).toUpperCase();
}

function NavBar() {
  const { logout, isAdmin, username } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isOnDashboard = location.pathname === "/dashboard";
  const isOnAdmin = location.pathname === "/admin";
  const isOnAbout = location.pathname === "/about";

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleLogoClick = () => {
    // "unless he's already in the dashboard" - do nothing if we're already there
    if (!isOnDashboard) {
      navigate("/dashboard");
    }
  };

  return (
    <nav className="navbar">
      <div
        className={`navbar-logo${!isOnDashboard ? " navbar-logo-clickable" : ""}`}
        onClick={handleLogoClick}
      >
        <img src={alertroadLogo} alt="AlertRoad logo" className="logo-image" />
        <span className="logo-text">ALERTROAD</span>
      </div>

      <div className="navbar-links">
        <button
          className={`navbar-link navbar-link-dashboard${isOnDashboard ? " active" : ""}`}
          onClick={() => (isOnDashboard ? null : navigate("/dashboard"))}
        >
          <span className="navbar-link-icon">{icons.dashboard}</span>
          <span className="navbar-link-text">Dashboard</span>
        </button>
        {isAdmin && (
          <button
            className={`navbar-link${isOnAdmin ? " active" : ""}`}
            onClick={() => navigate("/admin")}
          >
            <span className="navbar-link-icon">{icons.manageStaff}</span>
            <span className="navbar-link-text">Manage Staff</span>
          </button>
        )}
      </div>

      <div className="navbar-secondary">
        <button
          className={`navbar-about${isOnAbout ? " active" : ""}`}
          onClick={() => navigate("/about")}
        >
          <span className="navbar-about-icon">{icons.about}</span>
          <span className="navbar-about-text">About AlertRoad</span>
        </button>
      </div>

      <div className="navbar-actions">
        <div className="navbar-user">
          <span className="navbar-avatar">{getInitials(username)}</span>
          <span className="navbar-user-meta">
            <span className="navbar-user-name">{username || "Account"}</span>
            <span className="navbar-user-role">{isAdmin ? "Admin" : "Staff"}</span>
          </span>
        </div>
        <span className="navbar-admin">{isAdmin ? "Admin" : "Staff"}</span>
        <button className="navbar-logout" onClick={handleLogout}>
          <span className="navbar-logout-icon">{icons.logout}</span>
          <span className="navbar-logout-text">Log out</span>
        </button>
      </div>
    </nav>
  );
}

export default NavBar;