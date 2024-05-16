/**
 * The body of the song list. The actual list of songs :|
 */
import React from 'react';

import DownArrowSVG from './down-arrow.svg';
import PlusButtonSVG from './add-svgrepo-com.svg';
import MixerSVG from '../LayoutBar/MixerButton/mixer.svg';

import { useAudioPlayer } from '../../AudioController/AudioContext';

export default function SongListItems({
  filteredSongs,
  setFilteredSongs,
  toggleRightClickMenu,
}) {
  const {
    handleSongSelect,
    visibleSongs,
    currentSongId,
    loadingQueue,
    loadedSongs,
    setVisibleSongs,
    setCurrentScreen,
    handleSongEditClick,
  } = useAudioPlayer();

  /**
   * Formats decimal duration to "mm:ss" format.
   * @param {number} decimalDuration - The decimal duration to be formatted.
   * @returns {string} - The formatted duration in "mm:ss" format.
   */
  function formatDuration(decimalDuration) {
    // Extract whole minutes from the decimal duration
    const minutes = Math.floor(decimalDuration);

    // Calculate remaining seconds by rounding the fractional part and multiplying by 60
    const seconds = Math.round((decimalDuration - minutes) * 60);

    // Ensure seconds are within the valid range (0 to 59)
    const formattedSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`;

    // Format the duration as "mm:ss"
    const formattedDuration = `${minutes}:${formattedSeconds}`;

    return formattedDuration;
  }

  function sortByDuration(songs, sortToggle) {
    console.error(sortToggle);
    return songs.sort((a, b) => {
      const comparison = a[1]['duration'] < b[1]['duration'];
      return sortToggle ? comparison : !comparison;
    });
  }

  // Handle the context menu here, e.g., show/hide the menu
  const handleContextMenu = (event, songData) => {
    event.preventDefault();

    const { clientX, clientY } = event;
    toggleRightClickMenu(clientX, clientY, songData);
  };

  const goToArtistScreen = (key) => {
    /* Get songs by ID */
    // Initialize an empty object to store songs organized by artist
    const songsByArtist = {};
    const artist = loadedSongs[key].artist;

    // Loop through loadedSongs and organize them by artist
    Object.keys(loadedSongs).forEach((id) => {
      const song = loadedSongs[id];

      // Skip to the next iteration if the artist doesn't match
      if (artist !== song.artist) {
        return;
      }

      // Use the duration as the key for each song within the artist
      songsByArtist[id] = song;
    });

    setVisibleSongs(songsByArtist);
    setCurrentScreen(artist);
    setFilteredSongs(songsByArtist);
  };

  const goToAlbumScreen = (key) => {
    /* Get songs by ID */
    // Initialize an empty object to store songs organized by album
    const songsByAlbum = {};
    const album = loadedSongs[key].album;

    // Loop through loadedSongs and organize them by album
    Object.keys(loadedSongs).forEach((id) => {
      const song = loadedSongs[id];

      // Skip to the next iteration if the album doesn't match
      if (album !== song.album) {
        return;
      }

      // Use the duration as the key for each song within the artist
      songsByAlbum[id] = song;
    });

    setVisibleSongs(songsByAlbum);
    setCurrentScreen(album);
    setFilteredSongs(songsByAlbum);
  };

  /* Toggles showing the playlist menu */
  const handlePlaylistEdit = (index) => {
    // Open or close the playlist menu
    setPlaylistMenuOpen(index);
  };

  function clickSong(songId) {
    handleSongSelect(songId);

    // Save the current "playlist", this will be what collection of songs are looped through.
    // So we can still go to other playlists without playing them
  }

  // ? TODO I had <div> here instead of <>... I can't remember if it fixed a small glitch...
  return (
    <>
      {Object.keys(filteredSongs).map((key) => (
        <div
          className={`song ${loadingQueue.length > 0 ? 'unclickable' : ''}`}
          key={key}
          id={visibleSongs[key].id}
        >
          <li
            key={key} // TODO Fix this to be more appropriate/an actual unique key, when the page changes to artists for example, the indices are all messed up
            onDoubleClick={() => {
              // handleSongSelect(visibleSongs[key].id);
              clickSong(visibleSongs[key].id);
            }}
            onClick={() => {
              toggleRightClickMenu(false); // Hide the 'right-click' menu when we left-click
            }}
            onContextMenu={
              (event) => handleContextMenu(event, visibleSongs[key]) // Pass the song data when right-clicking
            }
            className={`list-item ${
              currentSongId === visibleSongs[key].id ? 'highlighted' : ''
            }`}
          >
            {visibleSongs[key].albumImage && (
              <img
                className="list-image"
                src={visibleSongs[key].albumImage}
                alt={`${visibleSongs[key].album} cover`}
              />
            )}
            <div className="song-details">
              <div
                className={`song-title ${
                  currentSongId === visibleSongs[key].id ? '' : 'header-color'
                }`}
              >
                {visibleSongs[key].title}
              </div>
              <div>
                <span onClick={() => goToArtistScreen(key)}>
                  {visibleSongs[key].artist}
                </span>
              </div>
              <div>
                <span onClick={() => goToAlbumScreen(key)}>
                  {visibleSongs[key].album}
                </span>
              </div>
            </div>
            <div className="song-duration">
              {formatDuration(visibleSongs[key].duration / 60)}
            </div>
            <div className="right-side">
              <img
                className="plus-sign"
                src={PlusButtonSVG}
                onClick={() => handlePlaylistEdit(visibleSongs[key].id)}
              ></img>
              <img
                className="dropdown-button"
                src={MixerSVG}
                onClick={() => handleSongEditClick(visibleSongs[key].id)}
              ></img>
            </div>
          </li>
        </div>
      ))}
    </>
  );
}
