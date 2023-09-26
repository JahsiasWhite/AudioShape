import React, { useState, useEffect } from 'react';
import { useAudioPlayer } from '../AudioContext';
import './Playlists.css'; // Import your CSS for styling

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
    window.electron.ipcRenderer.sendMessage('GET_PLAYLISTS');

    window.electron.ipcRenderer.on('GRAB_PLAYLISTS', (playlists) => {
      setPlaylists(playlists);
    });
  }, []);

  const handlePlaylistClick = (playlist) => {
    let newSongCollection = [];
    for (let i = 0; i < playlist.songs.length; i++) {
      const songName = playlist.songs[i];
      //TODO ! Make loadedSongs {} instead of [] so we dont have to loop...
      for (let j = 0; j < loadedSongs.length; j++) {
        if (loadedSongs[j].title === songName)
          newSongCollection.push(loadedSongs[j]);
      }
    }

    setVisibleSongs(newSongCollection);

    // ! Todo, probably want to clean this up
    setCurrentScreen(playlist.name);
    toggleSection('songs');
  };

  /**
   * Deletes the given playlist from the user's playlists
   * @param {*} playlistToDelete
   */
  const deletePlaylist = (playlistToDelete) => {
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
    console.error(loadedSongs);

    console.error(playlists);
  };

  return (
    <div className="playlists-container">
      <h2>Playlists</h2>
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
            onDoubleClick={() => handlePlaylistClick(playlist)}
          >
            <h3>{playlist.name}</h3>
            <p>Songs: {playlist.songs.length}</p>
            <button onClick={() => deletePlaylist(playlist)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Playlists;
