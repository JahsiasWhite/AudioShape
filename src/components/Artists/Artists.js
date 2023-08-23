import React from 'react';

function Artists({ songs }) {
  function groupSongsByArtists(songs) {
    console.error(songs);
    // Do some stuff here, tell the user
    if (songs === undefined) return [];

    const artists = {}; // Grouped songs by artist
    songs.forEach((song) => {
      if (!artists[song.artist]) {
        artists[song.artist] = [];
      }
      artists[song.artist].push(song);
    });
    return artists;
  }

  const tempArtists = groupSongsByArtists(songs);
  console.error(tempArtists);
  if (tempArtists.length === 0) return;

  const artists = Object.keys(tempArtists);

  return (
    <div>
      Artists:
      <ul>
        {artists.map((artist) => (
          <li key={artist}>{artist}</li>
        ))}
      </ul>
    </div>
  );
}

export default Artists;
