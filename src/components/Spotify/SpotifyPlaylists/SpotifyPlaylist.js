import React, { useState, useEffect, useRef } from 'react';

import DownloadSVG from './download.svg';
import ProgressBar from '../../ProgressBar/ProgressBar';

import { useAudioPlayer } from '../../../AudioController/AudioContext';

var offset = 0;
var total = 0;
const LIMIT = 100; // 100 is the max
var showNextButton = false;
var showPreviousButton = false;

const formatDuration = (ms) => {
  const totalSecs = Math.floor(ms / 1000);
  const mins = Math.floor(totalSecs / 60);
  const secs = totalSecs % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const SpotifyPlaylist = ({ playlistId, unloadPlaylist }) => {
  const { loadedSongs, setVisibleSongs, handleSongSelect, addSong } =
    useAudioPlayer();
  const savedSongs = {};
  const [progress, setProgress] = useState({});
  // const [showNextButton, setShowNextButton] = useState(false);

  const setSavedSongs = (playlistData) => {
    // Convert loadedSongs object to an array
    // const loadedSongArray = Object.values(loadedSongs);

    // console.error(playlistData);
    // console.error(playlistData.tracks);
    // console.error(playlistData.tracks.items);
    offset = playlistData.offset; // Prob unneeded and redundant
    total = playlistData.total;
    // if (total > offset + 100) {
    //   showNextButton = true;
    // } else {
    //   showNextButton = false;
    // }
    showNextButton = total > offset + 100 ? true : false;
    showPreviousButton = offset > 0 ? true : false;

    console.log('Mapping');
    // playlistData.items.map((song) => {
    //   const overlappingSong = loadedSongArray.find(
    //     (loadedSong) =>
    //       loadedSong.title === song.track.name &&
    //       loadedSong.artist === song.track.artists[0].name
    //   );
    //   savedSongs[overlappingSong.id] = overlappingSong;
    // });

    // Map through playlistData.tracks.items and filter out the loaded songs
    // const overlappingSongs = playlistData.tracks.items.map((song) => {
    //   const overlappingSong = loadedSongArray.find(
    //     (loadedSong) =>
    //       loadedSong.title === song.track.name &&
    //       loadedSong.artist === song.track.artists[0].name
    //   );
    //   console.error(overlappingSong);

    //   // If a loaded song overlaps, add it to savedSongs
    //   if (overlappingSong) {
    //     savedSongs[overlappingSong.id] = overlappingSong;
    //   }

    //   return overlappingSong;
    // });

    // Now savedSongs contains the overlapping songs
    // console.log(savedSongs);
    // setVisibleSongs(savedSongs);
  };

  const normalize = (str) => (str ?? '').toLowerCase().trim();

  // Normalizes artist names for fuzzy matching:
  // "Peter, Bjorn & John" → "peter bjorn and john"
  // "Peter Bjorn and John" → "peter bjorn and john"
  const normalizeArtist = (str) =>
    (str ?? '')
      .toLowerCase()
      .replace(/&/g, 'and')
      .replace(/[,\.]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

  // Checks if two titles match, accounting for YouTube video titles that contain
  // the Spotify title as a substring (e.g. "Malice K - Changes (Official Video)" vs "Changes")
  const titlesMatch = (loadedTitle, spotifyTitle) => {
    const a = normalize(loadedTitle);
    const b = normalize(spotifyTitle);
    return a === b || a.includes(b);
  };

  const songMatches = (loadedSong, spotifyTrack) => {
    const title = spotifyTrack.name;
    const artist = normalizeArtist(spotifyTrack.artists[0].name);
    const spotifyDurationSec = spotifyTrack.duration_ms / 1000;

    const titleMatch = titlesMatch(loadedSong.title, title);
    const artistMatch = normalizeArtist(loadedSong.artist) === artist;

    if (titleMatch && artistMatch) return true;

    // Fallback: title match + duration match handles cases where the artist has
    // an alternate name (e.g. "Starfucker" stored locally vs "STRFKR" on Spotify)
    if (titleMatch && Math.abs(loadedSong.duration - spotifyDurationSec) < 3)
      return true;

    return false;
  };

  const isSongLoaded = (song) => {
    if (!song.track) return false;
    return Object.values(loadedSongs).some((loadedSong) =>
      songMatches(loadedSong, song.track),
    );
  };

  const getLoadedSong = (song) => {
    return Object.values(loadedSongs).find((loadedSong) =>
      songMatches(loadedSong, song.track),
    );
  };

  const [playlistData, setPlaylistData] = useState(null); // TODO: Does this have to be a useState?

  const [downloadStatus, setDownloadStatus] = useState({});
  const [progressMsg, setProgressMsg] = useState({});
  // Maps download idx → Spotify track name so global listeners can resolve which row to update
  const pendingDownloads = useRef({});

  useEffect(() => {
    const removeProgress = window.electron.ipcRenderer.on(
      'ffmpeg-progress',
      (msg, percent, id) => {
        const pct = Math.min(percent ?? 0, 100);
        setProgress((prev) => ({ ...prev, [id]: pct }));
        setProgressMsg((prev) => ({ ...prev, [id]: msg }));
      },
    );

    const removeSuccess = window.electron.ipcRenderer.on(
      'download-success',
      (message, songData) => {
        if (songData) addSong(songData);
        const pending = pendingDownloads.current;
        const matchIdx = Object.keys(pending).find(
          (i) => normalize(pending[i]) === normalize(songData?.title ?? ''),
        );
        if (matchIdx !== undefined) {
          setDownloadStatus((prev) => ({ ...prev, [matchIdx]: 'success' }));
          delete pending[matchIdx];
        }
      },
    );

    const removeError = window.electron.ipcRenderer.on(
      'download-error',
      (songName, error) => {
        console.error('Download error for', songName, ':', error);
        const pending = pendingDownloads.current;
        const matchIdx = Object.keys(pending).find(
          (i) => normalize(pending[i]) === normalize(songName),
        );
        if (matchIdx !== undefined) {
          setDownloadStatus((prev) => ({ ...prev, [matchIdx]: 'error' }));
          delete pending[matchIdx];
        }
      },
    );

    return () => {
      removeProgress();
      removeSuccess();
      removeError();
    };
  }, [addSong]);

  function handleLoggedIn(data) {
    // console.log('GOT SPOTIFY PLAYLIST: ', data.tracks.items[1].track);
    console.log('GOT SPOTIFY PLAYLIST: ', data);
    setPlaylistData(data);
    setSavedSongs(data);
  }

  useEffect(() => {
    offset = 0;
    console.error('SENDING ', playlistId);
    window.electron.ipcRenderer.sendMessage(
      'get-spotify-playlist',
      playlistId,
      offset,
    );
    window.electron.ipcRenderer.once('get-spotify-playlist', handleLoggedIn);
  }, []);

  const downloadSong = (song, idx) => {
    const songDetails = {
      name: song.track.name,
      artist: song.track.artists[0].name,
      album: song.track.album.name,
    };

    pendingDownloads.current[idx] = song.track.name;
    setDownloadStatus((prev) => ({ ...prev, [idx]: 'downloading' }));
    window.electron.ipcRenderer.sendMessage(
      'DOWNLOAD_SONG_FROM_YOUTUBE_SEARCH',
      songDetails,
    );
  };

  const handleSongPlay = (song) => {
    // Make sure the song is loaded before trying to play it
    if (!isSongLoaded(song)) return;

    const loadedSong = getLoadedSong(song);
    handleSongSelect(loadedSong.id);

    // We now want to make sure that visible songs isnt still pointing to the previous song list
    // This only needs to be changed the first time this is clicked.
    // We could change this when this page is first entered but then it would ruin the experience if a user just wanted to
    // download songs and keep listening to their current playlist
    // ! Went with second option, this was crashing for some reason when placed here
    // console.error('SAVEDSONGS: ', savedSongs);
    // setVisibleSongs(savedSongs);
  };

  const getNextSongs = (amnt) => {
    offset += amnt;

    window.electron.ipcRenderer.sendMessage(
      'get-spotify-playlist',
      playlistId,
      offset,
    );

    // Scroll to top
    const songDiv = document.getElementById('song-list-header');
    if (songDiv) songDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.electron.ipcRenderer.once('get-spotify-playlist', handleLoggedIn);
  };

  return (
    <div className="song-list-container">
      <div onClick={() => unloadPlaylist()}>BACK</div>
      {playlistData && (
        <>
          <div className="song-list-header" id="song-list-header">
            {playlistData.name}
          </div>

          <ul className="song-list">
            {/* {playlistData.tracks.items.map((item, idx) => ( */}
            {playlistData.items.map((item, idx) => (
              <div
                className={`song ${isSongLoaded(item) ? 'highlighted' : ''}`}
                key={idx}
              >
                {item.track && (
                  <li
                    className="list-item"
                    onClick={() => handleSongPlay(item)}
                  >
                    {item.track.album.images[0] && (
                      <img
                        className="list-image"
                        src={item.track.album.images[0].url}
                      />
                    )}
                    <div
                      className={`song-details ${isSongLoaded(item) ? 'song-downloaded' : ''}`}
                    >
                      <div className={`song-title`}>{item.track.name}</div>
                      <div>{item.track.album.name}</div>
                      <div>{item.track.artists[0].name}</div>
                      <div className="spotify-song-duration">
                        {formatDuration(item.track.duration_ms)}
                      </div>
                    </div>
                    <div className="right-side" style={{ flex: 'auto' }}>
                      {downloadStatus[idx] === 'downloading' && (
                        <>
                          <ProgressBar
                            progress={progress[item.track.name] ?? 0}
                          />
                          <span className="download-percent">
                            {progressMsg[item.track.name] ?? 'Starting...'}
                          </span>
                        </>
                      )}
                      {downloadStatus[idx] === 'success' && (
                        <span className="download-success-text">✓ Saved</span>
                      )}
                      {downloadStatus[idx] === 'error' && (
                        <span className="download-error-text">✗ Error</span>
                      )}
                      {downloadStatus[idx] !== 'downloading' && (
                        <img
                          className="plus-sign"
                          src={DownloadSVG}
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadSong(item, idx);
                          }}
                        />
                      )}
                    </div>
                  </li>
                )}
              </div>
            ))}
          </ul>

          <div className="arrows-container">
            {showPreviousButton && (
              <div className="left-arrow" onClick={() => getNextSongs(-100)}>
                {'<'}
              </div>
            )}
            {showNextButton && (
              <div className="right-arrow" onClick={() => getNextSongs(100)}>
                {'>'}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default SpotifyPlaylist;
