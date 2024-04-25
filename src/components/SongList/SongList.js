// react-app/src/components/Playbar.js
import React, { useState, useEffect } from 'react';
import './songList.css';

import FolderSelection from '../FolderSelection/FolderSelection';
import ContextMenu from './ContextMenu/ContextMenu';
import PlaylistMenu from '../PlaylistMenu/PlaylistMenu';
import Searchbar from './Searchbar';

import DownArrowSVG from './down-arrow.svg';
import PlusButtonSVG from './add-svgrepo-com.svg';
import MixerSVG from '../LayoutBar/MixerButton/mixer.svg';

import { useAudioPlayer } from '../../AudioController/AudioContext';

let sortToggle = false;

function SongList({ handleSongEdit }) {
  const {
    handleSongSelect,
    visibleSongs,
    setVisibleSongs,
    loadedSongs,
    currentSongId,
    currentScreen,
    setCurrentScreen,
  } = useAudioPlayer();

  const [isLoading, setIsLoading] = useState(true);

  function handleSongEditClick(id) {
    handleSongEdit(id);
    setCurrentScreen('mixer');
  }

  /**
   * Once songs are loaded in, we know we are done loading
   */
  useEffect(() => {
    // TODO: Do I need to show loading?
    if (Object.keys(visibleSongs).length > 0) {
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }

    setFilteredSongs(visibleSongs);
  }, [visibleSongs]);

  /**
   * Stuff to handle right clicks... this should be in its own component
   * TODO: This should not be in SongList either because we will prob want to right click other
   * stuff in the future
   */
  const [isContextMenuActive, setIsContextMenuActive] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({
    x: 0,
    y: 0,
  });
  const [contextMenuSongData, setContextMenuSongData] = useState(null);

  const handleContextMenu = (event, songData) => {
    // Handle the context menu here, e.g., show/hide the menu
    event.preventDefault();
    const { clientX, clientY } = event;
    setContextMenuPosition({ x: clientX, y: clientY });
    setContextMenuSongData(songData);
    setIsContextMenuActive(true);
  };
  const hideContextMenu = () => {
    setIsContextMenuActive(false);
  };

  const [playlistMenuIndex, setPlaylistMenuOpen] = useState(-1);
  /* Toggles showing the playlist menu */
  const handlePlaylistEdit = (index) => {
    // Open or close the playlist menu
    setPlaylistMenuOpen(index);
  };
  const closePlaylistMenu = () => {
    // Close the playlist menu
    setPlaylistMenuOpen(-1);
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
  };

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

  function sortSongs(sortBy) {
    sortToggle = !sortToggle;

    // 1. Convert object to an array of key-value pairs
    const songEntries = Object.entries(filteredSongs);

    // 2. Sort the entries based on the song property
    songEntries.sort((a, b) => {
      const comparison = a[1][sortBy].localeCompare(b[1][sortBy]);
      return sortToggle ? comparison : -comparison;
    });

    // 3. Convert the sorted entries back to an object
    const sortedSongs = Object.fromEntries(songEntries);

    setFilteredSongs(sortedSongs);
  }

  const [filteredSongs, setFilteredSongs] = useState(visibleSongs);

  return (
    <div className="song-list-container">
      <div className="song-list-header">{currentScreen}</div>
      <Searchbar setFilteredSongs={setFilteredSongs} />
      {isLoading ? (
        <p>Loading...</p>
      ) : visibleSongs.length === 0 ? (
        <div className="empty-message">
          <p>No songs found! Make sure the file path is correct, or reset it</p>
          <FolderSelection />
        </div>
      ) : (
        <div>
          <div className="playlist-header-2-container">
            <div className="num-songs">
              {Object.keys(filteredSongs).length} songs
            </div>
            <div className="right-side">
              <div className="sort">
                <div
                  onClick={() => {
                    sortSongs('title');
                  }}
                >
                  sort
                </div>
                <div>Title</div>
              </div>
              <div className="filter">Filter</div>
            </div>
          </div>
          <ul className="song-list">
            {/* {Object.keys(visibleSongs).map((key) => ( */}
            {Object.keys(filteredSongs).map((key) => (
              <div className="song" key={key} id={visibleSongs[key].id}>
                <li
                  key={key} // TODO Fix this to be more appropriate/an actual unique key, when the page changes to artists for example, the indices are all messed up
                  onDoubleClick={() => {
                    handleSongSelect(visibleSongs[key].id);
                  }}
                  onClick={() => {
                    setIsContextMenuActive(false); // Hide the 'right-click' menu when we left-click
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
                        currentSongId === visibleSongs[key].id
                          ? ''
                          : 'header-color'
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
          </ul>
          {isContextMenuActive && contextMenuSongData && (
            <ContextMenu
              onContextMenu={hideContextMenu} // Prob dont need, just hides the menu if you right click it
              style={{
                top: contextMenuPosition.y,
                left: contextMenuPosition.x,
              }}
              songData={contextMenuSongData}
              hideContextMenu={hideContextMenu}
              handleSongEditClick={handleSongEditClick}
            />
          )}
          {/* Render the PlaylistMenu when playlistMenuIndex has a real index */}
          {playlistMenuIndex != -1 && (
            <PlaylistMenu
              song={visibleSongs[playlistMenuIndex]}
              closePlaylistMenu={closePlaylistMenu}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default SongList;
