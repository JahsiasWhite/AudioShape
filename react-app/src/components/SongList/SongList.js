// react-app/src/components/Playbar.js
import React, { useState, useEffect } from 'react';
import './songList.css';

import FolderSelection from '../FolderSelection/FolderSelection';

function SongList({ onSongSelect }) {
  // FULL LIST OF SONGS, TODO: Remove? TOO MUCH DATA?
  // ! viewableSongs <- only need to load as many as the screen should show
  // const [songs, setSongs] = useState([]);
  const [loadedSongs, setLoadedSongs] = useState([]);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch initial songs when the component mounts
    if (isLoading && loadedSongs.length === 0) {
      console.error('GETTING');
      window.electron.ipcRenderer.sendMessage(
        'GET_SONGS',
        '/initialFolderPath'
      ); // Change to your initial folder path
      setIsLoading(false);
    }

    // Listen for the mp3-files-loaded event from the main process
    // ! GET_SONGS loads from the dir, while GRAB_SONGS gets songs to show on the frontend
    window.electron.ipcRenderer.on('GRAB_SONGS', (mp3Files) => {
      console.error('GRABBING SONGS', mp3Files);
      // Update the loadedSongs state
      setLoadedSongs(mp3Files);
    });
  }, []); // Empty dependency array, so this effect runs only once? ! ITS RUNNING TWICE RN!!!!

  return (
    <div className="song-list-container">
      {loadedSongs.length === 0 ? (
        <div className="empty-message">
          <p>No songs found! Make sure the file path is correct, or reset it</p>
          <FolderSelection />
        </div>
      ) : (
        <ul className="song-list">
          {loadedSongs.map((song) => (
            <li key={song.id} onClick={() => onSongSelect(song)}>
              {song.title} - {song.artist}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SongList;
