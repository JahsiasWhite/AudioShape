import React, { useState, useEffect } from 'react';
import { useAudioPlayer } from '../../AudioController/AudioContext';
import './Playlists.css';

const Playlists = ({ toggleSection }) => {
  const {
    loadedSongs,
    playlists,
    createPlaylist,
    setPlaylists,
    setVisibleSongs,
    setCurrentScreen,
  } = useAudioPlayer();

  const [newPlaylistName, setNewPlaylistName] = useState('');

  /**
   * Gets the playlists when the component first loads
   */
  useEffect(() => {
    // Calls to the server to get the playlists
    window.electron.ipcRenderer.sendMessage('GET_PLAYLISTS');

    // Response from the server
    window.electron.ipcRenderer.on('GRAB_PLAYLISTS', (playlists) => {
      setPlaylists(playlists);
    });
  }, []);

  const handlePlaylistClick = (playlist) => {
    let newSongCollection = {};
    for (let i = 0; i < playlist.songs.length; i++) {
      const songName = playlist.songs[i];

      // Make sure the song has been loaded
      if (loadedSongs[songName])
        newSongCollection[songName] = loadedSongs[songName];
    }

    console.error('New Song Collection: ', newSongCollection);
    setVisibleSongs(newSongCollection);

    // ! Todo, probably want to clean this up
    setCurrentScreen(playlist.name);
    toggleSection('allSongs');
  };

  /**
   * Deletes the given playlist from the user's playlists
   * @param {*} playlistToDelete
   */
  const deletePlaylist = (playlistToDelete, event) => {
    // Prevent the click event from propagating to the parent element
    event.stopPropagation();

    // Send a message to the main process to delete the playlist
    window.electron.ipcRenderer.sendMessage(
      'DELETE_PLAYLIST',
      playlistToDelete
    );
  };

  /**
   * The user wants to create a new playlist
   * @returns
   */
  const handleCreatePlaylistClick = () => {
    // Don't create an empty-named playlist
    if (newPlaylistName.trim() === '') {
      return;
    }

    createPlaylist(newPlaylistName);
    setNewPlaylistName('');
  };

  const getPlaylistImage = () => {
    // console.error(loadedSongs);
    // console.error(playlists);

    playlists.forEach((playlist) => {
      console.error(playlist);
    });

    // ! Should just have playlist.image, need to have add this when we add a new song to the playlist on the server side
  };

  return (
    <div className="playlists-container">
      <h1>Playlists</h1>
      <div className="create-playlist">
        <input
          type="text"
          placeholder="Enter playlist name"
          value={newPlaylistName}
          onChange={(e) => setNewPlaylistName(e.target.value)}
        />
        <button onClick={handleCreatePlaylistClick}>Create a Playlist</button>
      </div>

      <div className="playlist-cards">
        {playlists.map((playlist, index) => (
          <div
            key={index}
            className="playlist-card"
            onClick={() => handlePlaylistClick(playlist)}
          >
            <div
              className="delete-button"
              onClick={(event) => deletePlaylist(playlist, event)}
            >
              X
            </div>
            <div className="playlist-card-details">
              <h3>{playlist.name}</h3>
              <p>Songs: {playlist.songs.length}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Playlists;
