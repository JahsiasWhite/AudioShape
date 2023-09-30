import React, { useState, useEffect } from 'react';
import { useAudioPlayer } from '../AudioContext';
import './PlaylistMenu.css';

// TODO: Instead of exit button, click on outside of menu to close
// TODO: Add song.id !!!!

function PlaylistMenu({ song, closePlaylistMenu }) {
  // const { playlists } = useContext(useAudioPlayer);
  const { playlists, createPlaylist, setPlaylists } = useAudioPlayer();
  const [newPlaylistName, setNewPlaylistName] = useState('');

  // I think this is the current playlists that the given song is in
  const [selectedPlaylists, setSelectedPlaylists] = useState([]);

  const onCreatePlaylistClick = () => {
    // Don't create an empty-named playlist
    if (newPlaylistName.trim() === '') {
      return;
    }

    createPlaylist(newPlaylistName);
    setNewPlaylistName('');
  };

  /**
   * Loads all playlists when the menu is first opened
   *
   * Also gets the callback from adding the current song to a playlist
   */
  useEffect(() => {
    window.electron.ipcRenderer.sendMessage('GET_PLAYLISTS');

    window.electron.ipcRenderer.on('GRAB_PLAYLISTS', (playlists) => {
      setPlaylists(playlists);
    });
  }, []);

  /**
   * Figures out which playlists the current song is in
   */
  useEffect(() => {
    if (playlists.length === 0) return;

    // Initialize selectedPlaylists based on whether the song is already in each playlist
    const initialSelected = playlists.map((playlist) =>
      playlist.songs.includes(song.id)
    );

    setSelectedPlaylists(initialSelected);
  }, [playlists]);

  const addSongToPlaylist = (playlist, index) => {
    console.error('ADDING SONG TO PLAYLIST ', song);
    window.electron.ipcRenderer.sendMessage(
      'TOGGLE_SONG_TO_PLAYLIST',
      playlist.name,
      song.id
    );
  };

  return (
    <div className="playlist-menu">
      <div className="song-name">{song.title}</div>
      <div className="close-menu" onClick={closePlaylistMenu}>
        X
      </div>
      <ul>
        {playlists.map((playlist, index) => (
          <li key={index}>
            {playlist.name}{' '}
            <span
              className={`playlist-circle ${
                selectedPlaylists[index] ? 'selected' : ''
              }`}
              onClick={() => addSongToPlaylist(playlist, index)}
            ></span>
          </li>
        ))}
        {/* <div className="add-song-container"></div> */}
      </ul>
      <div className="create-playlist">
        <input
          type="text"
          placeholder="Enter playlist name"
          value={newPlaylistName}
          onChange={(e) => setNewPlaylistName(e.target.value)}
        />
        <button onClick={onCreatePlaylistClick}>Create a Playlist</button>
      </div>
    </div>
  );
}

export default PlaylistMenu;
