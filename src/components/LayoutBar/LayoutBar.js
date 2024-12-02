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

function LayoutBar({ toggleSection, currentSection, setCurrentSection }) {
  const { setVisibleSongs, loadedSongs, currentScreen, setCurrentScreen } =
    useAudioPlayer();

  const [sections, setSections] = useState([
    'allSongs',
    'mixer',
    'playlists',
    'artists',
    'youtube',
    'settings',
  ]);

  /**
   * Gets the settings when the component first loads
   */
  useEffect(() => {
    fetchSettings();
  }, []);

  // TODO: Turn into invoke maybe
  const fetchSettings = () => {
    console.error('Getting layout settings...');
    window.electron.ipcRenderer.sendMessage('GET_LAYOUT_SETTINGS');

    window.electron.ipcRenderer.on('GET_LAYOUT_SETTINGS', (spotifyEnabled) => {
      if (spotifyEnabled && !sections.includes('spotify')) {
        setSections([...sections.slice(0, 5), 'spotify', ...sections.slice(5)]); // TODO make less ugly
      } else if (!spotifyEnabled) {
        setSections(sections.filter((section) => section !== 'spotify'));
      }
      console.error('Updating layout settings...', sections);

      // TODO We need to remove only when entering fullscreen. If we exit fullscreen, another object is created :(
      // window.electron.ipcRenderer.removeAllListeners('GET_LAYOUT_SETTINGS');
    });
  };

  /* Keeps track of which 'tab' we are currently viewing */
  // const [currentSection, setCurrentSection] = useState('allSongs');

  /* We have to do this here which is kinda annoying but I dont know how to call the context in App.js */
  const modifiedToggleSection = (section) => {
    if (section === 'allSongs') {
      setVisibleSongs(loadedSongs); // Home should reset the view to show all loaded songs
      setCurrentScreen('All Songs');
    }

    console.error(currentSection, section);
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

  return (
    <div className="layout-bar">
      <div className="centered-content">
        {sections.map((section) => (
          <div
            key={section}
            onClick={() => modifiedToggleSection(section)}
            className={
              currentSection === section ? 'tab-selected' : 'layout-tab'
            }
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
