import { useState, useEffect } from 'react';

export const PlaylistsManager = () => {
  const [playlists, setPlaylists] = useState([]);

  const createPlaylist = (playlistName) => {
    window.electron.ipcRenderer.sendMessage('CREATE_PLAYLIST', playlistName);
  };

  /**
   * Callback from the server of the new playlist creation
   */
  useEffect(() => {
    const handlePlaylistAdded = (newPlaylists) => {
      setPlaylists(newPlaylists);
    };

    window.electron.ipcRenderer.once('CREATE_PLAYLIST', handlePlaylistAdded);
  }, [playlists]);

  return {
    createPlaylist,
    playlists,
    setPlaylists,
  };
};
