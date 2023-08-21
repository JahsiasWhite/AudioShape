// react-app/src/components/Playbar.js
import React, { useState, useEffect } from 'react';
import './songList.css';

function SongList({ songs }) {
  const [chosenFolderPath, setChosenFolderPath] = useState(null);
  const [loadedSongs, setLoadedSongs] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Add isLoading state

  // Once a folder is selected, we call to the server to load the
  // file path to grab the songs
  const handleFolderSelection = (event) => {
    const filePath = event.target.files[0].path;
    // const relativePath = event.target.files[0].webkitRelativePath;

    const cutoffIndex = filePath.lastIndexOf('\\');
    const folderPath = filePath.substring(0, cutoffIndex);

    setChosenFolderPath(folderPath);
    window.electron.ipcRenderer.sendMessage('GET_SONGS', folderPath);
  };

  // Listen for the mp3-files-loaded event from the main process
  // useEffect(() => {
  //   window.electron.ipcRenderer.on('LOAD_SONGS', (mp3Files) => {
  //     for (const mp3File of mp3Files) {
  //       console.error(mp3File);
  //     }
  //   });
  // }, [chosenFolderPath]); // ! only load this if chosenFolderPath?
  useEffect(() => {
    // Fetch initial songs when the component mounts
    if (isLoading && songs.length === 0) {
      console.error('GETTING');
      window.electron.ipcRenderer.sendMessage(
        'GET_SONGS',
        '/initialFolderPath'
      ); // Change to your initial folder path
      setIsLoading(false);
    }

    // Listen for the mp3-files-loaded event from the main process
    window.electron.ipcRenderer.on('LOAD_SONGS', (mp3Files) => {
      console.error('HI');
      // Update the loadedSongs state
      setLoadedSongs(mp3Files);
    });

    // TODO ! MOVE THIS SOMEWHERE ELSE, THIS is a generic
    window.electron.ipcRenderer.on('ERROR_MESSAGE', (err) => {
      console.error('AHAHA', err);
    });
  }, []); // Empty dependency array, so this effect runs only once

  return (
    <div className="song-list-container">
      {songs.length === 0 ? (
        <div className="empty-message">
          <p>No songs found! Make sure the file path is correct, or reset it</p>
          <label htmlFor="folderInput">
            Choose Folder
            <input
              id="folderInput"
              type="file"
              directory=""
              webkitdirectory=""
              onChange={handleFolderSelection}
            />
          </label>
        </div>
      ) : (
        <ul className="song-list">
          {songs.map((song) => (
            <li key={song.id}>
              {song.title} - {song.artist}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SongList;
