// src/UploadPage.tsx
import React from 'react';
import { Phone } from 'lucide-react';
import "../App.css"
import AppHeader from '../components/AppHeader';
import { useNavigate } from 'react-router-dom';


const MainPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="mobile-container">
      <AppHeader/>

      {/* Banner Image */}
      <div className="content-padding">
        <div className="banner-image">
          <img 
            src="https://images.pexels.com/photos/8828597/pexels-photo-8828597.jpeg?auto=compress&cs=tinysrgb&w=800" 
            alt="NCB Training" 
          />
        </div>
      </div>

      {/* YouTube Video */}
      <div className="content-padding">
        <div className="video-container">
          <div className="video-content">
            <iframe
              src="https://www.youtube.com/embed/tgbNymZ7vqY"
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>

            {/* <div className="youtube-badge">
              <span className="play-icon">▶</span>
              <span>YouTube</span>
            </div> */}

            {/* <div className="video-controls">
              <div className="control-icon">🔍</div>
              <div className="control-icon">⋮</div>
            </div> */}

            <div className="video-title">
              <p>ಮಾದಕ ವಸ್ತು ವಿರೋಧಿ ಅಭಿಯಾನ</p>
            </div>
          </div>
        </div>
      </div>


      {/* Information Upload Button */}
      <div className="content-padding">
        <button className="upload-button" onClick={() => navigate('/otp')}>
          
          Information Upload
        </button>
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

      {/* Counselling Card */}
      <div className="content-padding">
        <div className="counselling-card">
          <div className="card-content">
            <p className="card-subtitle">Assistance Required?</p>
            <button className="counselling-button">
              Counselling Website
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainPage;