import React from 'react';
import './Artists.css';

import { useAudioPlayer } from '../AudioContext';

function Artists({ songs, toggleSection }) {
  const { setVisibleSongs } = useAudioPlayer();

  /**
   * Finds all artists in the given song list. Matches each artist to each song they have as well
   *
   * @param {Array} songs - Array of all of our songs, I think Audio() objects
   * @returns - Dict of all of the different artists found along with each of their songs
   */
  function groupSongsByArtists(songs) {
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

  /**
   * When an artist is clicked, we should go the song screen, only showing
   * the selected artists songs
   *
   * @param {*} artist
   */
  const handleArtistClick = (artist) => {
    setVisibleSongs(artistsBySongs[artist]);
    toggleSection('songs');
  };

  const artistsBySongs = groupSongsByArtists(songs);
  if (artistsBySongs.length === 0) return; // ? Is this happening?

  return (
    <div className="artists">
      <h2>Artists</h2>
      <ul>
        <div className="playlist-cards">
          {Object.keys(artistsBySongs).map((artist) => (
            <div
              key={artist}
              className="playlist-card"
              onDoubleClick={() => handleArtistClick(artist)}
            >
              {artist}
            </div>
          ))}
        </div>
      </ul>
    </div>
  );
}

export default Artists;
