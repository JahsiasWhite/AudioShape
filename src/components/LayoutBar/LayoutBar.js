import React, { useState } from 'react';
import './layoutBar.css';

import HomeButton from './HomeButton/HomeButton';
import MixerButton from './MixerButton/MixerButton';
import PlaylistButton from './PlaylistButton/PlaylistButton';
import ArtistButton from './ArtistButton/ArtistButton';
import SpotifyButton from './SpotifyButton/SpotifyButton';
import YoutubeButton from './YoutubeButton/YoutubeButton';
import SettingsButton from './SettingsButton/SettingsButton';

import { useAudioPlayer } from '../AudioContext';

function LayoutBar({ toggleSection }) {
  const { setVisibleSongs, loadedSongs } = useAudioPlayer();

  /* Keeps track of which 'tab' we are currently viewing */
  const [currentSection, setCurrentSection] = useState('');

  /* We have to do this here which is kinda annoying but I dont know how to call the context in App.js */
  const modifiedToggleSection = (section) => {
    if (section === 'allSongs') {
      setVisibleSongs(loadedSongs); // Home should reset the view to show all loaded songs
    }

    setCurrentSection(section);

    // Call the original toggleSection with the modified section
    toggleSection(section);
  };

  const sections = [
    'allSongs',
    'mixer',
    'playlists',
    'artists',
    'youtube',
    'settings',
  ];

  return (
    <div className="layout-bar">
      <div className="centered-content">
        {sections.map((section) => (
          <div
            key={section}
            onClick={() => modifiedToggleSection(section)}
            className={currentSection === section ? 'tab-selected' : ''}
          >
            {section === 'allSongs' && <HomeButton />}
            {section === 'mixer' && <MixerButton />}
            {section === 'playlists' && <PlaylistButton />}
            {section === 'artists' && <ArtistButton />}
            {section === 'youtube' && <YoutubeButton />}
            {section === 'settings' && <SettingsButton />}
          </div>
        ))}
      </div>
    </div>
  );
}

export default LayoutBar;
