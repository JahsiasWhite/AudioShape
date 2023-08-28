import React from 'react';
import './layoutBar.css';

import HomeButton from './HomeButton/HomeButton';
import PlaylistButton from './PlaylistButton/PlaylistButton';
import ArtistButton from './ArtistButton/ArtistButton';
import SpotifyButton from './SpotifyButton/SpotifyButton';
import SettingsButton from './SettingsButton/SettingsButton';

import { useAudioPlayer } from '../AudioContext';

function LayoutBar({ toggleSection }) {
  const { setVisibleSongs, loadedSongs } = useAudioPlayer();
  /* We have to do this here which is kinda annoying but I dont know how to call the context in App.js */
  const modifiedToggleSection = (section) => {
    if (section === 'allSongs') {
      setVisibleSongs(loadedSongs); // Home should reset the view to show all loaded songs
    }
    // Call the original toggleSection with the modified section
    toggleSection(section);
  };

  return (
    <div className="layout-bar">
      <div className="centered-content">
        <HomeButton toggleSection={modifiedToggleSection} />
        {/* <SpotifyButton toggleSection={modifiedToggleSection} /> */}
        <PlaylistButton toggleSection={modifiedToggleSection} />
        <ArtistButton toggleSection={modifiedToggleSection} />
        <SpotifyButton toggleSection={modifiedToggleSection} />
        <SettingsButton toggleSection={modifiedToggleSection} />
      </div>
    </div>
  );
}

export default LayoutBar;
