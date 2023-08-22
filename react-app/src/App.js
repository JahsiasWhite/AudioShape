import React, { useState, useEffect } from 'react';
import './App.css';

import logo from './logo.svg';

import Playbar from './components/Playbar/Playbar';
import SongList from './components/SongList/SongList';
import LayoutBar from './components/LayoutBar/LayoutBar';
import ErrorMessages from './components/ErrorMessages/ErrorMessages';

function App() {
  const [currentSongIndex, setCurrentSongIndex] = useState(null);
  const [loadedSongs, setLoadedSongs] = useState([]);

  // Update the current song when a song is selected
  const handleSongSelect = (songIndex) => {
    setCurrentSongIndex(songIndex);
    console.error('CURRENT SONG IDX IS ', songIndex, loadedSongs);
  };

  return (
    <div className="app-container">
      <LayoutBar />
      <div className="main-content">
        <SongList
          onSongSelect={handleSongSelect}
          loadedSongs={setLoadedSongs}
        />
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
