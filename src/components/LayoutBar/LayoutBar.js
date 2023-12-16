import React, { useState, useEffect } from 'react';
import './layoutBar.css';

import HomeButton from './HomeButton/HomeButton';
import MixerButton from './MixerButton/MixerButton';
import PlaylistButton from './PlaylistButton/PlaylistButton';
import ArtistButton from './ArtistButton/ArtistButton';
import SpotifyButton from './SpotifyButton/SpotifyButton';
import YoutubeButton from './YoutubeButton/YoutubeButton';
import SettingsButton from './SettingsButton/SettingsButton';

import { useAudioPlayer } from '../../AudioController/AudioContext';

function LayoutBar({ toggleSection }) {
  const { setVisibleSongs, loadedSongs, currentScreen, setCurrentScreen } =
    useAudioPlayer();

  /* Keeps track of which 'tab' we are currently viewing */
  const [currentSection, setCurrentSection] = useState('allSongs');

  /* We have to do this here which is kinda annoying but I dont know how to call the context in App.js */
  const modifiedToggleSection = (section) => {
    if (section === 'allSongs') {
      setVisibleSongs(loadedSongs); // Home should reset the view to show all loaded songs
      setCurrentScreen('All Songs');
    }

    setCurrentSection(section);

    // Call the original toggleSection with the modified section
    toggleSection(section);
  };

  // TODO: FIND A way better way to do this
  // This is just the quick and dirty way
  // Fixes the bug where going to the edit screen from the song list wouldn't highlight the tab
  useEffect(() => {
    if (currentScreen !== 'mixer') return;

    modifiedToggleSection('mixer');
  }, [currentScreen]);

  const sections = [
    'allSongs',
    'mixer',
    'playlists',
    'artists',
    'youtube',
    'spotify',
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
            {section === 'spotify' && <SpotifyButton />}
            {section === 'settings' && <SettingsButton />}
          </div>
        ))}
      </div>
    </div>
  );
}

export default LayoutBar;
