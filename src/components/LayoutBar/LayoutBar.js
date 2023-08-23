import React from 'react';
import './layoutBar.css';

import HomeButton from './HomeButton/HomeButton';
import PlaylistButton from './PlaylistButton/PlaylistButton';
import ArtistButton from './ArtistButton/ArtistButton';
import SettingsButton from './SettingsButton/SettingsButton';

function LayoutBar({ toggleSection }) {
  return (
    <div className="layout-bar">
      <div className="centered-content">
        <HomeButton toggleSection={toggleSection} />
        <PlaylistButton toggleSection={toggleSection} />
        <ArtistButton toggleSection={toggleSection} />
        <SettingsButton toggleSection={toggleSection} />
      </div>
    </div>
  );
}

export default LayoutBar;
