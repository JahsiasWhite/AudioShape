import React, { useState } from 'react';
import SpotifyPlaylist from './SpotifyPlaylist';

const SpotifyPlaylists = ({ playlists }) => {
  const [loadPlaylist, setLoadPlaylist] = useState(null);
  const playlistItems = playlists.items;

  const loadSpotifyPlaylist = (playlistId) => {
    // Set the loadPlaylist state to the selected playlistId
    setLoadPlaylist(playlistId);
  };

  const unloadPlaylist = () => {
    setLoadPlaylist(null);
  };

  return (
    <>
      Playlists
      {!loadPlaylist ? (
        <div className="playlist-cards">
          {playlistItems.map((playlist, idx) => (
            <div
              className="playlist-card"
              key={idx}
              onDoubleClick={() => loadSpotifyPlaylist(playlist.id)}
            >
              {playlist.images.length > 0 && (
                <img
                  className="artist-image"
                  src={playlist.images[0].url}
                  alt={`${artist} image`}
                />
              )}
              {playlist.name}
            </div>
          ))}
        </div>
      ) : (
        <SpotifyPlaylist
          playlistId={loadPlaylist}
          unloadPlaylist={unloadPlaylist}
        />
      )}
    </>
  );
};

export default SpotifyPlaylists;
