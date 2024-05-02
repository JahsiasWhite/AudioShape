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
import PopupMenu from './components/PopupMenu/PopupMenu';

import FullscreenView from './components/FullscreenView/FullscreenView';

import ErrorMessages from './components/ErrorMessages/ErrorMessages';

// CONTEXT
import { AudioProvider } from './AudioController/AudioContext'; // So we can talk to the editor directly, NO PROP DRILLING YAY!!

function App() {
  const [selectedSongIndex, setSelectedSongIndex] = useState(null);

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
      section = 'songs';
    }
    setCurrentSection(section);
  };

  /**
   * When the app first loads, we make a call to the server to grab the songs. It will pull any songs if a
   * previous directory was given in the past. Once the server is done processing, it sends the songs back
   * here where they are saved.
   */
  useEffect(() => {
    // Fetch initial songs when the component mounts
    window.electron.ipcRenderer.sendMessage('GET_SONGS', '');

    // // ! GET_SONGS loads from the dir, while GRAB_SONGS gets songs to show on the frontend
    // window.electron.ipcRenderer.on('GRAB_SONGS', (retrievedSongs) => {
    //   // handleSongLoad(mp3Files);
    //   console.error('SETTING NEW SONGS');
    //   // setLoadedSongs(retrievedSongs); // ! should I actually call initialSongLoad?
    // });
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
            <div className="middle-content">
              <LayoutBar toggleSection={toggleSection} />
              <div className="main-content">
                {currentSection === 'songs' ? (
                  <SongList
                    // handleSongLoad={loadedSongs}
                    handleSongEdit={handleSongSelect}
                    // songs={visibleSongs}
                  />
                ) : currentSection === 'playlists' ? (
                  <Playlists toggleSection={toggleSection} />
                ) : currentSection === 'artists' ? (
                  <Artists toggleSection={toggleSection} />
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
            </div>
            <Playbar
              toggleFullscreen={enableFullscreen}
              setIsVisible={setIsVisible}
            />
          </div>
        )}

        {isFullscreen && (
          <FullscreenView toggleFullscreen={disableFullscreen} />
        )}

        <ErrorMessages />

        {/* Popup menu */}
        <PopupMenu />
      </div>
    </AudioProvider>
  );
}

export default App;
