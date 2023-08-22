import React, { useState, useEffect } from 'react';
import './App.css';

import logo from './logo.svg';

import Playbar from './components/Playbar/Playbar';
import SongList from './components/SongList/SongList';
import LayoutBar from './components/LayoutBar/LayoutBar';
import ErrorMessages from './components/ErrorMessages/ErrorMessages';

function App() {
  const [currentSong, setCurrentSong] = useState(null);
  // Update the current song when a song is selected
  const handleSongSelect = (song) => {
    setCurrentSong(song);
    console.error('CURRENT SONG IS ', song);
  };

  return (
    <div className="app-container">
      <LayoutBar />
      <div className="main-content">
        <SongList onSongSelect={handleSongSelect} />
      </div>
      <Playbar currentSong={currentSong} />

      <ErrorMessages />
    </div>
  );
}

export default App;
