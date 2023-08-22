import React from 'react';
import './layoutBar.css';

import HomeButton from './HomeButton/HomeButton';
import PlaylistButton from './PlaylistButton/PlaylistButton';
import ArtistButton from './ArtistButton/ArtistButton';

function LayoutBar({ toggleSection }) {
  return (
    <div className="layout-bar">
      <HomeButton toggleSection={toggleSection} />
      <PlaylistButton toggleSection={toggleSection} />
      <ArtistButton toggleSection={toggleSection} />
    </div>
  );
}

export default LayoutBar;
