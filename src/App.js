import React, { useState, useEffect, useContext } from 'react';
import './App.css';

import logo from './logo.svg';

import Playbar from './components/Playbar/Playbar';
import SongList from './components/SongList/SongList';
import Playlists from './components/Playlists/Playlists';
import Artists from './components/Artists/Artists';
import Settings from './components/Settings/Settings';
import Spotify from './components/Spotify/Spotify';
import Youtube from './components/Youtube/Youtube';
import LayoutBar from './components/LayoutBar/LayoutBar';
import Mixer from './components/Mixer/Mixer';

import FullscreenView from './components/FullscreenView/FullscreenView';

import ErrorMessages from './components/ErrorMessages/ErrorMessages';

// CONTEXT
import { AudioProvider } from './components/AudioContext'; // So we can talk to the editor directly, NO PROP DRILLING YAY!!

function App() {
  const [selectedSongIndex, setSelectedSongIndex] = useState(null);

  const [loadedSongs, setLoadedSongs] = useState({}); // ? Can we use this as just visibleSongs ? Or should we have two objects?
  // const [visibleSongs, setVisibleSongs] = useState([]);

  // Update the current song when a song is selected
  const handleSongSelect = (songIndex) => {
    setSelectedSongIndex(songIndex);
    setCurrentSection('mixer');
  };

  // Current showing content in 'main-content'
  const [currentSection, setCurrentSection] = useState('songs');
  // Function to toggle between SongList and Playlists
  const toggleSection = (section) => {
    //TODO FIX THIS, Each page should be its own component... instead of SongList showing all types
    if (section === 'allSongs') {
      // setVisibleSongs(loadedSongs);
      section = 'songs';
    }
    console.error('SETTING TO ', section);
    setCurrentSection(section);
  };

  /**
   * When the app first loads, we make a call to the server to grab the songs. It will pull any songs if a
   * previous directory was given in the past. Once the server is donw processing, it sends the songs back
   * here where they are saved.
   */
  useEffect(() => {
    // Fetch initial songs when the component mounts
    window.electron.ipcRenderer.sendMessage('GET_SONGS', '');

    // ! GET_SONGS loads from the dir, while GRAB_SONGS gets songs to show on the frontend
    window.electron.ipcRenderer.on('GRAB_SONGS', (retrievedSongs) => {
      // handleSongLoad(mp3Files);
      setLoadedSongs(retrievedSongs); // ! should I actually call initialSongLoad?
    });
  }, []);

  /**
   * Enables fullscreen mode
   */
  const [isFullscreen, setIsFullscreen] = useState(false);
  const enableFullscreen = () => {
    setIsFullscreen(true);
  };

  /**
   * Exits out of fullscreen mode
   */
  const disableFullscreen = () => {
    setIsFullscreen(false);
  };

  return (
    <AudioProvider>
      <div className="app-container">
        {!isFullscreen && (
          <div className="non-fullscreen">
            <LayoutBar toggleSection={toggleSection} />
            <div className="middle-content">
              <div className="main-content">
                {currentSection === 'songs' ? (
                  <SongList
                    handleSongLoad={loadedSongs}
                    handleSongEdit={handleSongSelect}
                    // songs={visibleSongs}
                  />
                ) : currentSection === 'playlists' ? (
                  <Playlists toggleSection={toggleSection} />
                ) : currentSection === 'artists' ? (
                  <Artists songs={loadedSongs} toggleSection={toggleSection} />
                ) : currentSection === 'spotify' ? (
                  <Spotify />
                ) : currentSection === 'settings' ? (
                  <Settings />
                ) : currentSection === 'mixer' ? (
                  <Mixer
                    selectedIndex={selectedSongIndex}
                    setSelectedIndex={setSelectedSongIndex}
                  />
                ) : currentSection === 'youtube' ? (
                  <Youtube />
                ) : (
                  <div>NO SECTION FOUND</div>
                )}
              </div>
              <Playbar toggleFullscreen={enableFullscreen} />
            </div>
          </div>
        )}

        {isFullscreen && (
          <FullscreenView toggleFullscreen={disableFullscreen} />
        )}

        <ErrorMessages />
      </div>
    </AudioProvider>
  );
}

export default App;
