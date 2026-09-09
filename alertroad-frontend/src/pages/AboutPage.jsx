import NavBar from "../components/NavBar";
import InfoSections from "../components/InfoSections";
import "./AboutPage.css";

function AboutPage() {
  return (
    <div className="about-page">
      <NavBar />
      <div className="about-content">
        <InfoSections />
      </div>
    </div>
  );
}

export default AboutPage;