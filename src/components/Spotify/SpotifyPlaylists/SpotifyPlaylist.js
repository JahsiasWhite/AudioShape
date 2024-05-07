import React, { useState, useEffect } from 'react';

import DownloadSVG from './download.svg';
import ProgressBar from '../../ProgressBar/ProgressBar';

import { useAudioPlayer } from '../../../AudioController/AudioContext';

var offset = 0;
var total = 0;
const LIMIT = 100; // 100 is the max
var showNextButton = false;
var showPreviousButton = false;

const SpotifyPlaylist = ({ playlistId, unloadPlaylist }) => {
  const { loadedSongs, setVisibleSongs, handleSongSelect } = useAudioPlayer();
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

  const isSongLoaded = (song) => {
    const loadedSongArray = Object.values(loadedSongs);
    return loadedSongArray.some(
      (loadedSong) =>
        song.track &&
        loadedSong.title === song.track.name &&
        loadedSong.artist === song.track.artists[0].name
    );
  };

  const getLoadedSong = (song) => {
    console.error(song.track);
    const loadedSongArray = Object.values(loadedSongs);
    console.error('GETTING ', song.track.name);
    let test;
    loadedSongArray.forEach((loadedSong) => {
      if (
        loadedSong.title === song.track.name &&
        loadedSong.artist === song.track.artists[0].name
      ) {
        console.error('WORKS!', loadedSong);
        test = loadedSong;
        return loadedSong;
      }
    });
    console.error('HMM : ', test);
    return test;
  };

  const [playlistData, setPlaylistData] = useState(null); // TODO: Does this have to be a useState?

  const [downloadStatus, setDownloadStatus] = useState({});

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
      offset
    );
    window.electron.ipcRenderer.once('get-spotify-playlist', handleLoggedIn);
  }, []);

  const downloadSong = (song, idx) => {
    console.error('SENDING ', song);
    // Extract the details from the song
    // ? Just the name and artist are being used to search. Could add album if there are false positives happening
    const songDetails = {
      name: song.track.name,
      artist: song.track.artists[0].name,
      album: song.track.album.name,
    };

    // Images come in an array with 3 different resolutions:
    // 640x640, 300x300, 64x64
    // song.track.album.images[0].url

    window.electron.ipcRenderer.sendMessage(
      'DOWNLOAD_SONG_FROM_YOUTUBE_SEARCH',
      songDetails
    );
    setDownloadStatus((prevStatus) => ({
      ...prevStatus,
      [idx]: 'downloading',
    }));

    window.electron.ipcRenderer.on('download-success', (message, songData) => {
      console.error('Success: ' + message, songData);
      console.error('Object ID: ', [idx]);
      setDownloadStatus((prevStatus) => ({
        ...prevStatus,
        [idx]: 'success',
      }));
    });

    window.electron.ipcRenderer.on('download-error', (error) => {
      console.error('Error: ' + error + '. Index clicked:  ' + idx);
      setDownloadStatus((prevStatus) => ({
        ...prevStatus,
        [idx]: 'error',
      }));
    });

    window.electron.ipcRenderer.on(
      'ffmpeg-progress',
      (progressMsg, progressPercent, progressId) => {
        console.error(progressMsg);
        console.error(progressId);
        setProgress({ ...progress, [progressId]: progressPercent }); // TODO Remove entry from object once done with using it
      }
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
      offset
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
                    onDoubleClick={() => handleSongPlay(item)}
                  >
                    {item.track.album.images[0] && (
                      <img
                        className="list-image"
                        src={item.track.album.images[0].url}
                      />
                    )}
                    <div className="song-details">
                      <div className={`song-title `}>{item.track.name}</div>
                      <div>{item.track.album.name}</div>
                      <div>{item.track.artists[0].name}</div>
                    </div>
                    <div className="right-side" style={{ flex: 'auto' }}>
                      {progress[item.track.name] && (
                        <ProgressBar progress={progress[item.track.name]} />
                      )}
                      {downloadStatus[idx] && <>{downloadStatus[idx]}</>}
                      <img
                        className="plus-sign"
                        src={DownloadSVG}
                        onClick={() => downloadSong(item, idx)}
                      ></img>
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
