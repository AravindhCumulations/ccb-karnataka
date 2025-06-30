import React from 'react';
import { ArrowLeft, Phone } from 'lucide-react';
import './ThanksPage.css';
import { useNavigate } from 'react-router-dom';
import AppHeader from '../components/AppHeader';
import { useTranslation } from 'react-i18next';

const ThanksPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleBangalorePoliceClick = () => {
    // Open Bangalore City Police website
    window.open('https://bcp.karnataka.gov.in/en', '_blank');
  };

  // const handleRehabCentersClick = () => {
  //   // Open rehabilitation centers list
  //   window.open('https://www.google.com/search?q=bangalore+rehabilitation+near+me&sca_esv=f44c1c969151bea8&ei=by9caPffD5aNvr0PuNru-AE&oq=bangalore+rehabilitation+nea&gs_lp=Egxnd3Mtd2l6LXNlcnAiHGJhbmdhbG9yZSByZWhhYmlsaXRhdGlvbiBuZWEqAggAMgcQIRigARgKSN80UMIMWIYpcAR4AJABAJgB0gKgAa4LqgEHMC4zLjMuMbgBA8gBAPgBAZgCCaAC_gnCAgsQABiABBiwAxiiBMICBhAAGBYYHsICCBAAGIAEGLEDwgIREC4YgAQYsQMYxwEYjgUYrwHCAgsQABiABBiRAhiKBcICBRAAGIAEwgILEAAYgAQYhgMYigXCAggQABiABBiiBMICCBAAGKIEGIkFmAMAiAYBkAYBkgcHNC4yLjIuMaAHki6yBwcwLjIuMi4xuAfICcIHBzItMi41LjLIB4cB&sclient=gws-wiz-serp', '_blank');
  // };

  return (
    <div className="thanks-container">
      <div className="thanks-mobile-frame">
        <AppHeader />

        {/* Main content */}
        <main className="thanks-main-content">
          {/* Report Activity header */}
          <div className="thanks-report-header">
            <div className="thanks-title-section">
              <ArrowLeft className="thanks-back-icon" onClick={() => navigate('/')} />
              <h1 className="thanks-title">
                {t('back_to_home')}
              </h1>
            </div>
          </div>

          {/* Thank you message */}
          <div className="thank-you-message">
            {t('thank_you_submission')}
          </div>

          {/* Emergency Helpline Card */}
          <div className="content-padding">
            <div className="helpline-card">
              <div className="card-content">
                <p className="card-subtitle">{t('call_toll_free')}</p>
                <div className="phone-section">
                  <Phone className="phone-icon" />
                  <span className="phone-number">1933</span>
                </div>
                <p className="card-description">{t('narcotics_helpline')}</p>
              </div>
            </div>
          </div>

          {/* Bangalore City Police Card */}
          <div className="content-padding">
            <div className="counselling-card">
              <div className="card-content">
                <p className="card-subtitle">{t('assistance_required')}</p>
                <button className="counselling-button" onClick={handleBangalorePoliceClick}>
                  {t('bangalore_city_police')}
                </button>
              </div>
            </div>
          </div>

          {/* Rehabilitation Centers Card */}
          <div className="content-padding assistance-required">
            <div className="counselling-card">
              <div className="card-content">
                <p className="card-subtitle">{t('assistance_required')}</p>
                <button className="counselling-button" onClick={() => navigate('/rehab-list')}>
                  {t('rehab_centers_list')}
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