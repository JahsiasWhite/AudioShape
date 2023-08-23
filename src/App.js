import React, { useState, useEffect } from 'react';
import './App.css';

import logo from './logo.svg';

import Playbar from './components/Playbar/Playbar';
import SongList from './components/SongList/SongList';
import Playlists from './components/Playlists/Playlists';
import Artists from './components/Artists/Artists';
import Settings from './components/Settings/Settings';
import LayoutBar from './components/LayoutBar/LayoutBar';
import ErrorMessages from './components/ErrorMessages/ErrorMessages';

function App() {
  const [currentSongIndex, setCurrentSongIndex] = useState(null);

  const [loadedSongs, setLoadedSongs] = useState([]); // ? Can we use this as just visibleSongs ? Or should we have two objects?
  const [visibleSongs, setVisibleSongs] = useState([]);

  // Update the current song when a song is selected
  const handleSongSelect = (songIndex) => {
    setCurrentSongIndex(songIndex);
  };

  // Current showing content in 'main-content'
  const [currentSection, setCurrentSection] = useState('songs');
  // Function to toggle between SongList and Playlists
  const toggleSection = (section) => {
    //TODO FIX THIS, Each page should be its own component... instead of SongList showing all types
    if (section === 'allSongs') {
      setVisibleSongs(loadedSongs);
      section = 'songs';
    }
    setCurrentSection(section);
  };

  /* When the songs first load, we want all songs to be shown */
  const handleSongLoad = (songs) => {
    setLoadedSongs(songs);
    setVisibleSongs(songs);
  };

  const handleArtistSelect = (artist, songs) => {
    // setSelectedArtist(artist);
    setCurrentSection('songs');
    setVisibleSongs(songs);
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
    window.electron.ipcRenderer.on('GRAB_SONGS', (mp3Files) => {
      setVisibleSongs(mp3Files);
      setLoadedSongs(mp3Files);
    });
  }, []);

  return (
    <div className="app-container">
      <LayoutBar toggleSection={toggleSection} />
      <div className="main-content">
        {currentSection === 'songs' ? (
          <SongList
            onSongSelect={handleSongSelect}
            loadedSongs={handleSongLoad}
            currentSongIndex={currentSongIndex}
            songs={visibleSongs}
          />
        ) : currentSection === 'playlists' ? (
          <Playlists songs={loadedSongs} />
        ) : currentSection === 'artists' ? (
          <Artists songs={loadedSongs} onArtistSelect={handleArtistSelect} />
        ) : (
          <Settings />
        )}
      </div>
      <Playbar
        currentSongIndex={currentSongIndex}
        visibleSongs={visibleSongs} // TODO Dont import this entire object, you don't have to
        setCurrentSongIndex={setCurrentSongIndex}
      />

      <ErrorMessages />
    </div>
  );
}

export default App;
