import React from 'react';
import './NextButton.css';

import NextButtonSVG from './NextButton.svg';

function NextButton({ onClick }) {
  return <img className="next-button" src={NextButtonSVG} onClick={onClick} />;
}

export default NextButton;
