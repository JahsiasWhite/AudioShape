import React, { useState, useEffect } from 'react';
import './App.css';

import logo from './logo.svg';

import Playbar from './components/Playbar/Playbar';
import SongList from './components/SongList/SongList';
import LayoutBar from './components/LayoutBar/LayoutBar';

// const { ipcRenderer } = window.require('electron');

function App() {
  const [songs, setSongs] = useState([
    // Your song data here...
  ]);
  const [currentSong, setCurrentSong] = useState(null);

  useEffect(() => {
    // Listen for the event
    window.electron.ipcRenderer.on('GET_DATA', (event, arg) => {
      // setData(arg);
    });
    // Clean the listener after the component is dismounted
    return;
  }, []);

  return (
    <div className="app-container">
      <LayoutBar />
      <div className="main-content">
        <SongList songs={songs} />
      </div>
      <Playbar currentSong={currentSong} />
    </div>
  );
}

export default App;
