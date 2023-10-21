import React, { useState, useEffect } from 'react';

const SpotifyPlaylist = ({ playlistId }) => {
  const [playlistData, setPlaylistData] = useState(null);

  useEffect(() => {
    console.error('SENDING ', playlistId);
    window.electron.ipcRenderer.sendMessage('get-spotify-playlist', playlistId);

    function handleLoggedIn(data) {
      console.log('GOT SPOTIFY PLAYLIST: ', data.tracks.items[1].track);
      setPlaylistData(data);
    }

    window.electron.ipcRenderer.once('get-spotify-playlist', handleLoggedIn);
  }, []);

  return (
    <div className="song-list-container">
      {playlistData && (
        <>
          <div className="song-list-header">{playlistData.name}</div>

          <ul className="song-list">
            {playlistData.tracks.items.map((item, idx) => (
              <div className="song" key={idx}>
                <li className="list-item">
                  {item.track.album.images[0] && (
                    <img
                      className="list-image"
                      src={item.track.album.images[0].url}
                    />
                  )}
                  <div className="song-details">
                    <div className={`song-title `}>{item.track.name}</div>
                    <div>{item.track.album.name}</div>
                    <div>{item.track.artists[0].name}</div>
                  </div>
                </li>
              </div>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default SpotifyPlaylist;
