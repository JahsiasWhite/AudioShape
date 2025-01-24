/**
 * The body of the song list. The actual list of songs :|
 */
import React, { useState, useEffect } from 'react';

import PlusButtonSVG from './add-svgrepo-com.svg';
import MixerSVG from '../LayoutBar/MixerButton/mixer.svg';

import { useAudioPlayer } from '../../AudioController/AudioContext';

export default function SongListItems({
  filteredSongs,
  setFilteredSongs,
  toggleRightClickMenu,
  setPlaylistMenuOpen,
  handleSongEditClick,
}) {
  const {
    handleSongSelect,
    visibleSongs,
    currentSongId,
    loadingQueue,
    loadedSongs,
    setVisibleSongs,
    setCurrentScreen,
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

  // Handle the context menu here, e.g., show/hide the right-click menu
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

  /**
   * Returns the Data URL of a jpeg frame from the given mp4 video at a specified time
   *
   * TODO
   * Maybe have the time be more variable? It's harder than it seems though. If I do random, I'd want the
   * max time to be the video duration. I have to get that in loadeddata though. And then I need to wait
   * an unspecified time for it to be set in video. So when I drawImage, it actually is the image.
   *
   * @param {String} videoSrc
   * @returns
   */
  const extractThumbnail = (videoSrc) => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      video.addEventListener('loadeddata', () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);
        resolve(canvas.toDataURL('image/jpeg'));
      });

      video.src = videoSrc;

      // Get the picture from the video at a certain time
      video.currentTime = 1;
    });
  };

  const [thumbnails, setThumbnails] = useState();
  useEffect(() => {
    const loadThumbnails = async () => {
      console.error('LOADING THUMBNAILS');
      const newThumbnails = {};
      for (const key of Object.keys(filteredSongs)) {
        if (
          filteredSongs[key].file &&
          filteredSongs[key].file.includes('.mp4')
        ) {
          newThumbnails[key] = await extractThumbnail(filteredSongs[key].file);
        }
      }
      setThumbnails(newThumbnails);
    };
    loadThumbnails();
  }, [filteredSongs]);

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
            {!filteredSongs[key].albumImage ? (
              // If there is no album image, check if the file is an mp4.
              // If it is, we can use a frame from the video as the image
              filteredSongs[key].file &&
              filteredSongs[key].file.includes('.mp4') &&
              thumbnails ? (
                <img
                  className="list-image-header"
                  src={thumbnails[key]}
                  alt={`${filteredSongs[key].album} cover`}
                />
              ) : (
                <></>
              )
            ) : (
              // If there was an image in the immediate file directory, use that as the image
              <img
                className="list-image-header"
                src={filteredSongs[key].albumImage}
                alt={`${filteredSongs[key].album} cover`}
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
                data-testid="plus-sign"
                src={PlusButtonSVG}
                onClick={() => handlePlaylistEdit(visibleSongs[key].id)}
              ></img>
              <img
                className="dropdown-button"
                data-testid="dropdown-button"
                src={MixerSVG}
                onClick={() => {
                  handleSongEditClick(visibleSongs[key].id);
                  setCurrentScreen('mixer');
                }}
              ></img>
            </div>
          </li>
        </div>
      ))}
    </>
  );
}
