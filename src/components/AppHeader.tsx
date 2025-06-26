// src/components/AppHeader.tsx
import React from 'react';
import './AppHeader.css';

const AppHeader: React.FC = () => {
  return (
    <>
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
    </>
  );
};

export default AppHeader;
