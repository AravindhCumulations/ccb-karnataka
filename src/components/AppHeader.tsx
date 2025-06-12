// src/components/AppHeader.tsx
import React from 'react';
import './AppHeader.css';

const AppHeader: React.FC = () => {
  return (
    <>
      {/* Status Bar */}
      <div className="status-bar">
        <span>Kannada</span>
      </div>

      {/* Header */}
      <div className="header">
        <div className="header-content">
          <img src="/Frame1000003741.svg" alt="NCB Logo" className="logo-image" />
        </div>
      </div>
    </>
  );
};

export default AppHeader;
