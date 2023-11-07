/**
 * 
          collaborative: false,
[1]       description: '',
[1]       external_urls: [Object],
[1]       href: 'https://api.spotify.com/v1/playlists/3TpB4OjUWa63i4SaRlZ7P1',
[1]       id: '3TpB4OjUWa63i4SaRlZ7P1',
[1]       images: [Array],
[1]       name: '👄 Singy Songs 👄',
[1]       owner: [Object],
[1]       primary_color: null,
[1]       public: true,
[1]       snapshot_id: 'MTk4LDk4MWIwZTRmZGYxMTI0NDBiYmEyYzYxNzk1ZjFlNGJmNjI4OWI4YjU=',
[1]       tracks: [Object],
[1]       type: 'playlist',
[1]       uri: 'spotify:playlist:3TpB4OjUWa63i4SaRlZ7P1'
 * 
 * 
 */
import React, { useState } from 'react';
import SpotifyPlaylist from './SpotifyPlaylist';

const SpotifyPlaylists = ({ playlists }) => {
  const [loadPlaylist, setLoadPlaylist] = useState(null);
  const playlistItems = playlists.items;

  const loadSpotifyPlaylist = (playlistId) => {
    // You can implement the logic to load the Spotify playlist here
    // You might want to navigate to a new route or page
    // and pass the playlistId as a parameter
    // For example:
    // history.push(`/playlist/${playlistId}`);
    console.log(playlistId);
    setLoadPlaylist(playlistId);
    return <SpotifyPlaylist playlistId={playlistId} />;
  };

  return (
    <>
      Playlists
      {loadPlaylist && <SpotifyPlaylist playlistId={loadPlaylist} />}
      {!loadPlaylist && (
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
      )}
    </>
  );
};

export default SpotifyPlaylists;
