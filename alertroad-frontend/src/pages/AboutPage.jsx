import { useAuth } from "../context/AuthContext";
import NavBar from "../components/NavBar";
import InfoSections from "../components/InfoSections";
import "./AboutPage.css";

function AboutPage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className={`about-page${isAuthenticated ? " about-page-with-sidebar" : ""}`}>
      <NavBar />
      <div className="about-content">
        <InfoSections />
      </div>
    </div>
  );
}

export default AboutPage;