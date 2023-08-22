import React from 'react';
import './PreviousButton.css';

import PreviousButtonSVG from './PreviousButton.svg';

function PreviousButton({ onClick }) {
  return (
    <img
      className="previous-button"
      src={PreviousButtonSVG}
      onClick={onClick}
    />
  );
}

export default PreviousButton;
