import React from 'react';
import './LoadingSpinner.css';

function LoadingSpinner({ className = '' }) {
  return <div className={`loading-spinner ${className}`}></div>;
}

export default LoadingSpinner;
