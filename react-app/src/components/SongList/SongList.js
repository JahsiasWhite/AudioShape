// react-app/src/components/Playbar.js
import React, { useState, useEffect } from 'react';
import './songList.css';

import FolderSelection from '../FolderSelection/FolderSelection';

function SongList({ onSongSelect, loadedSongs }) {
  // FULL LIST OF SONGS, TODO: Remove? TOO MUCH DATA?
  // ! viewableSongs <- only need to load as many as the screen should show
  // const [songs, setSongs] = useState([]);
  const [visibleSongs, setvisibleSongs] = useState([]);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch initial songs when the component mounts
    if (isLoading && visibleSongs.length === 0) {
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
      // Update the visibleSongs state
      setvisibleSongs(mp3Files);
      loadedSongs(mp3Files);
    });
  }, []); // Empty dependency array, so this effect runs only once? ! ITS RUNNING TWICE RN!!!!

  return (
    <div className="song-list-container">
      {visibleSongs.length === 0 ? (
        <div className="empty-message">
          <p>No songs found! Make sure the file path is correct, or reset it</p>
          <FolderSelection />
        </div>
      ) : (
        <ul className="song-list">
          {visibleSongs.map((song, index) => (
            <li key={song.id} onClick={() => onSongSelect(index)}>
              {song.title} - {song.artist}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SongList;
