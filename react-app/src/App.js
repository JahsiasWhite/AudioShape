import React, { useState, useEffect } from 'react';
import './App.css';

import logo from './logo.svg';

import Playbar from './components/Playbar/Playbar';
import SongList from './components/SongList/SongList';
import Playlists from './components/Playlists/Playlists';
import Artists from './components/Artists/Artists';
import LayoutBar from './components/LayoutBar/LayoutBar';
import ErrorMessages from './components/ErrorMessages/ErrorMessages';

function App() {
  const [currentSongIndex, setCurrentSongIndex] = useState(null);
  const [loadedSongs, setLoadedSongs] = useState([]);

  // Update the current song when a song is selected
  const handleSongSelect = (songIndex) => {
    setCurrentSongIndex(songIndex);
  };

  // Current showing content in 'main-content'
  const [currentSection, setCurrentSection] = useState('songs');
  // Function to toggle between SongList and Playlists
  const toggleSection = (section) => {
    setCurrentSection(section);
  };

  return (
    <div className="app-container">
      <LayoutBar toggleSection={toggleSection} />
      <div className="main-content">
        {currentSection === 'songs' ? (
          <SongList
            onSongSelect={handleSongSelect}
            loadedSongs={setLoadedSongs}
            currentSongIndex={currentSongIndex}
          />
        ) : currentSection === 'playlists' ? (
          <Playlists songs={loadedSongs} />
        ) : (
          <Artists songs={loadedSongs} />
        )}
      </div>
      <Playbar
        currentSongIndex={currentSongIndex}
        loadedSongs={loadedSongs}
        setCurrentSongIndex={setCurrentSongIndex}
      />

      <ErrorMessages />
    </div>
  );
}

export default App;
