import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();

  const handlePlaygroundClick = () => {
    navigate('/playground');
  };

  const handlePipelineHubClick = () => {
    navigate('/pipeline-hub');
  };

  return (
    <div className="landing-container">
      <div className="landing-content">
        {/* <div className="landing-logo">
          <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="30" cy="30" r="30" fill="#4B5563" fillOpacity="0.1"/>
            <path d="M15 20L30 12L45 20M15 20L30 28M15 20V40L30 48M30 28L45 20M30 28V48M45 20V40L30 48" stroke="#2563EB" strokeWidth="2.5"/>
            <circle cx="15" cy="20" r="4" fill="#C7D2FE"/>
            <circle cx="30" cy="12" r="4" fill="#818CF8"/>
            <circle cx="45" cy="20" r="4" fill="#C7D2FE"/>
            <circle cx="45" cy="40" r="4" fill="#818CF8"/>
            <circle cx="30" cy="48" r="4" fill="#C7D2FE"/>
            <circle cx="15" cy="40" r="4" fill="#818CF8"/>
          </svg>
        </div> */}
        <h1 className="landing-title">LoCoML</h1>
        <p className="landing-subtitle">Multi-model deployment made easier.</p>
        
        <div className="landing-buttons">
          <button className="landing-button playground-button" onClick={handlePlaygroundClick}>
            <span className="button-icon">✨</span>
            Playground
          </button>
          <button className="landing-button hub-button" onClick={handlePipelineHubClick}>
            <span className="button-icon">📦</span>
            Pipeline Hub
          </button>
        </div>
      </div>
      
      <div className="landing-footer">
        <p>Build and deploy multi-model pipelines with ease</p>
      </div>
    </div>
  );
};

export default LandingPage;