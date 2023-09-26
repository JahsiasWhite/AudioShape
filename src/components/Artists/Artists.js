import React from 'react';
import './Artists.css';

import { useAudioPlayer } from '../AudioContext';

function Artists({ songs, toggleSection }) {
  const { setVisibleSongs, setCurrentScreen } = useAudioPlayer();

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
    let artistImg = '';

    // Loops through every song and adds them to their respective artist
    songs.forEach((song) => {
      // Add the song to the artist
      if (!artists[song.artist]) {
        artists[song.artist] = [];
      }
      artists[song.artist].push(song);

      // Check if the artist's image is not set and the current song has an image
      if (!artists[song.artist].image && song.albumImage) {
        artists[song.artist].image = song.albumImage;
      }
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
    setCurrentScreen(artist);
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
              onClick={() => handleArtistClick(artist)}
            >
              {artistsBySongs[artist].image && (
                <img
                  className="artist-image"
                  src={artistsBySongs[artist].image}
                  alt={`${artist} image`}
                />
              )}
              <div className="artist-name">{artist}</div>
            </div>
          ))}
        </div>
      </ul>
    </div>
  );
}

export default Artists;
