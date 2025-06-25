import React from 'react';
import { ArrowLeft, Phone } from 'lucide-react';
import './ThanksPage.css';
import { useNavigate } from 'react-router-dom';

const ThanksPage: React.FC = () => {
  const navigate = useNavigate();

  const handleBangalorePoliceClick = () => {
    // Open Bangalore City Police website
    window.open('https://bangalorepolice.gov.in', '_blank');
  };

  const handleRehabCentersClick = () => {
    // Open rehabilitation centers list
    window.open('https://rehabilitation-centers.com', '_blank');
  };

  return (
    <div className="thanks-container">
      <div className="thanks-mobile-frame">
        {/* Header with language selection */}
        <header className="thanks-header">
          <div className="thanks-language-bar">
            <span className="thanks-language-text">
              Kannada
            </span>
          </div>
        </header>

        {/* Organization info bar - replaced with image */}
        <section className="thanks-org-section">
          <img
            className="thanks-org-image"
            alt="CCB Anti-Narcotics Bengaluru"
            src="/Frame 1000003741 (1).svg"
          />
        </section>

        {/* Main content */}
        <main className="thanks-main-content">
          {/* Report Activity header */}
          <div className="thanks-report-header">
            <div className="thanks-title-section">
              <ArrowLeft className="thanks-back-icon" onClick={() => navigate('/')} />
              <h1 className="thanks-title">
                Back to home
              </h1>
            </div>
          </div>

          {/* Thank you message */}
          <div className="thank-you-message">
            Thank you for your submission!
          </div>

          {/* Emergency Helpline Card */}
          <div className="content-padding">
            <div className="helpline-card">
              <div className="card-content">
                <p className="card-subtitle">Call on toll free number</p>
                <div className="phone-section">
                  <Phone className="phone-icon" />
                  <span className="phone-number">1933</span>
                </div>
                <p className="card-description">24 x 7 : National Narcotics Helpline</p>
              </div>
            </div>
          </div>

          {/* Bangalore City Police Card */}
          <div className="content-padding">
            <div className="counselling-card">
              <div className="card-content">
                <p className="card-subtitle">Assistance Required?</p>
                <button className="counselling-button" onClick={handleBangalorePoliceClick}>
                  Bangalore City Police
                </button>
              </div>
            </div>
          </div>

          {/* Rehabilitation Centers Card */}
          <div className="content-padding assistance-required">
            <div className="counselling-card">
              <div className="card-content">
                <p className="card-subtitle">Assistance Required?</p>
                <button className="counselling-button" onClick={handleRehabCentersClick}>
                  List of Rehabilitation Centers
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ThanksPage;