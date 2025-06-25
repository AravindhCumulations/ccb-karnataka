import React from 'react';
import './HomePage.css';
import { useNavigate } from 'react-router-dom';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="home-container">
      <div className="home-mobile-frame">
        {/* Header with language selection */}
        <header className="home-header">
          <div className="home-language-bar">
            <span className="home-language-text">
              Kannada
            </span>
          </div>
        </header>

        {/* Organization info bar */}
        <section className="home-org-section">
          <img
            className="home-org-image"
            alt="CCB Anti-Narcotics Bengaluru"
            src="/Frame 1000003741 (1).svg"
          />
        </section>

        {/* Main content */}
        <main className="home-main-content">
          {/* Welcome header */}
          <div className="home-welcome-section">
            <h1 className="home-welcome-title">
              Welcome to Raksha
            </h1>
          </div>

          {/* First card - Dr. G Parameshwara */}
          <div className="home-content-padding">
            <div className="home-minister-card">
              <div className="home-card-content">
                <div className="home-minister-info">
                  <h3 className="home-minister-name">Dr. G Parameshwara</h3>
                  <p className="home-minister-title">Hon'ble Home Minister</p>
                </div>
                <div className="home-minister-avatar">
                  <img 
                    src="/karnHM.svg"
                    alt="Dr. G Parameshwara"
                    className="home-avatar-image"
                  />
                </div>
              </div>
              <p className="home-minister-quote">
                "Together, we can build a drug-free Bengaluru. Your anonymous reports are crucial in our fight against narcotics. Every piece of information matters."
              </p>
            </div>
          </div>

          {/* Second card - Commissioner */}
          <div className="home-content-padding">
            <div className="home-commissioner-card">
              <div className="home-card-header">
                <div className="home-commissioner-info">
                  <h3 className="home-commissioner-name">Seemanth Kumar Singh IPS</h3>
                  <p className="home-commissioner-title">Commissioner of Police, Bangalore City</p>
                </div>
                <div className="home-commissioner-avatar">
                  <img 
                    src="/KarnCom.svg"
                    alt="Seemanth Kumar Singh IPS"
                    className="home-avatar-image"
                  />
                </div>
              </div>
              
              <div className="home-video-section">
                <h4 className="home-video-title">Video Message</h4>
                <div className="home-video-container">
                  <video 
                    className="home-video-player"
                    controls
                    poster="https://images.pexels.com/photos/6077326/pexels-photo-6077326.jpeg?auto=compress&cs=tinysrgb&w=400&h=225&fit=crop"
                  >
                    <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              </div>
                </div>
            </div>

            {/* Report Button */}
            <div className="home-content-padding">
                <button className="home-report-button" onClick={() => navigate('/otp')}>
              <span className="home-report-text">Report</span>
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default HomePage;