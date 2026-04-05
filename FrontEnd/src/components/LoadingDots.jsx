import React from 'react';
import './LoadingDots.css';

const LoadingDots = ({ message = "Loading...", compact = false }) => {
  return (
    <div className={`loading-dots-container ${compact ? 'compact' : ''}`}>
      <div className="dots-wrapper">
        <div className="dot dot-1"></div>
        <div className="dot dot-2"></div>
        <div className="dot dot-3"></div>
        <div className="dot dot-4"></div>
      </div>
      {!compact && message && <p className="loading-message">{message}</p>}
    </div>
  );
};

export default LoadingDots;
