/**
 * The body of the song list. The actual list of songs :|
 */
import React, { useState, useEffect } from 'react';

import PlusButtonSVG from './add-svgrepo-com.svg';
import MixerSVG from '../LayoutBar/MixerButton/mixer.svg';

import { useAudioPlayer } from '../../AudioController/AudioContext';

export const thumbnailCache = {};

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
   * Returns the Data URL of a jpeg frame from the given mp4 video at a specified time.
   * Seeks to currentTime=1 after metadata loads, then draws on the `seeked` event so
   * the frame is actually ready before calling drawImage.
   *
   * @param {String} videoSrc
   * @returns {Promise<string>}
   */
  const extractThumbnail = (videoSrc) => {
    if (thumbnailCache[videoSrc]) {
      return Promise.resolve(thumbnailCache[videoSrc]);
    }
    return new Promise((resolve) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      const cleanup = (dataUrl) => {
        video.src = '';
        resolve(dataUrl);
      };

      video.addEventListener('seeked', () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg');
        thumbnailCache[videoSrc] = dataUrl;
        cleanup(dataUrl);
      }, { once: true });

      video.addEventListener('loadedmetadata', () => {
        video.currentTime = Math.min(1, video.duration || 1);
      }, { once: true });

      // If the video fails to load, resolve null so the loop isn't stuck
      video.addEventListener('error', () => cleanup(null), { once: true });

      video.preload = 'metadata';
      video.src = videoSrc;
    });
  };

  // Build initial state from cache so cached thumbnails show immediately on re-navigation
  const buildFromCache = (songs) => {
    const result = {};
    for (const key of Object.keys(songs)) {
      if (songs[key].isVideo && thumbnailCache[songs[key].file]) {
        result[key] = thumbnailCache[songs[key].file];
      }
    }
    return result;
  };

  const [thumbnails, setThumbnails] = useState(() => buildFromCache(filteredSongs));

  useEffect(() => {
    // Immediately restore any cached thumbnails (avoids flash on re-navigation)
    setThumbnails(buildFromCache(filteredSongs));

    let cancelled = false;
    const loadThumbnails = async () => {
      for (const key of Object.keys(filteredSongs)) {
        if (cancelled) break;
        if (filteredSongs[key].isVideo && !thumbnailCache[filteredSongs[key].file]) {
          const dataUrl = await extractThumbnail(filteredSongs[key].file);
          if (!cancelled && dataUrl) {
            setThumbnails((prev) => ({ ...prev, [key]: dataUrl }));
          }
        }
      }
    };
    loadThumbnails();
    return () => { cancelled = true; };
  }, [filteredSongs]);

  // ? TODO I had <div> here instead of <>... I can't remember if it fixed a small glitch...
  return (
    <>
      {Object.keys(filteredSongs).map((key) => {
        const song = visibleSongs[key] || filteredSongs[key];
        if (!song) return null;
        return (
        <div
          className={`song ${loadingQueue.length > 0 ? 'unclickable' : ''}`}
          key={key}
          id={song.id}
        >
          <li
            key={key} // TODO Fix this to be more appropriate/an actual unique key, when the page changes to artists for example, the indices are all messed up
            onDoubleClick={() => {
              // handleSongSelect(visibleSongs[key].id);
              clickSong(song.id);
            }}
            onClick={() => {
              toggleRightClickMenu(false); // Hide the 'right-click' menu when we left-click
            }}
            onContextMenu={
              (event) => handleContextMenu(event, song) // Pass the song data when right-clicking
            }
            className={`list-item ${
              currentSongId === song.id ? 'highlighted' : ''
            }`}
          >
            {!filteredSongs[key].albumImage ? (
              // If there is no album image, check if the file is an mp4.
              // If it is, we can use a frame from the video as the image
              filteredSongs[key].isVideo && thumbnails[key] ? (
                <img
                  className="list-image"
                  src={thumbnails[key]}
                  alt={`${filteredSongs[key].album} cover`}
                />
              ) : (
                <></>
              )
            ) : (
              // If there was an image in the immediate file directory, use that as the image
              <img
                className="list-image"
                src={filteredSongs[key].albumImage}
                alt={`${filteredSongs[key].album} cover`}
              />
            )}
            <div className="song-details">
              <div
                className={`song-title ${
                  currentSongId === song.id ? '' : 'header-color'
                }`}
              >
                {song.title}
              </div>
              <div>
                <span onClick={() => goToArtistScreen(key)}>
                  {song.artist}
                </span>
              </div>
              <div>
                <span onClick={() => goToAlbumScreen(key)}>
                  {song.album}
                </span>
              </div>
            </div>
            <div className="song-duration">
              {formatDuration(song.duration / 60)}
            </div>
            <div className="right-side">
              <img
                className="plus-sign"
                data-testid="plus-sign"
                src={PlusButtonSVG}
                onClick={() => handlePlaylistEdit(song.id)}
              ></img>
              <img
                className="dropdown-button"
                data-testid="dropdown-button"
                src={MixerSVG}
                onClick={() => {
                  handleSongEditClick(song.id);
                  setCurrentScreen('mixer');
                }}
              ></img>
            </div>
          </li>
        </div>
      )})}
    </>
  );
}
