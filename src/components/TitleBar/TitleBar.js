import React from 'react';
import logo from '../../logo.svg';
import './TitleBar.css';

function TitleBar() {
  const minimize = () => window.electron.windowControls.minimize();
  const maximize = () => window.electron.windowControls.maximize();
  const close = () => window.electron.windowControls.close();

  return (
    <div className="title-bar">
      <div className="title-bar-identity">
        <img src={logo} alt="logo" className="title-bar-logo" />
        <span className="title-bar-name">AudioShape</span>
      </div>
      <div className="title-bar-drag-region" />
      <div className="title-bar-buttons">
        <button className="title-bar-btn btn-minimize" onClick={minimize} title="Minimize">
          <span />
        </button>
        <button className="title-bar-btn btn-maximize" onClick={maximize} title="Maximize">
          <span />
        </button>
        <button className="title-bar-btn btn-close" onClick={close} title="Close">
          <span />
        </button>
      </div>
    </div>
  );
}

export default TitleBar;
