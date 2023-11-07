import React, { useState, useEffect } from 'react';

import DownloadSVG from './download.svg';

const SpotifyPlaylist = ({ playlistId }) => {
  const [playlistData, setPlaylistData] = useState(null); // TODO: Does this have to be a useState?

  const [downloadStatus, setDownloadStatus] = useState({});

  useEffect(() => {
    console.error('SENDING ', playlistId);
    window.electron.ipcRenderer.sendMessage('get-spotify-playlist', playlistId);

    function handleLoggedIn(data) {
      console.log('GOT SPOTIFY PLAYLIST: ', data.tracks.items[1].track);
      setPlaylistData(data);
    }

    window.electron.ipcRenderer.once('get-spotify-playlist', handleLoggedIn);
  }, []);

  const downloadSong = (song, idx) => {
    // Extract the details from the song that are required to search for it on youtube
    // ? Just the name and artist. Could add album if there are false positives happening
    const songDetails = {
      name: song.track.name,
      artist: song.track.artists[0].name,
    };

    // Images come in an array with 3 different resolutions:
    // 640x640, 300x300, 64x64
    // song.track.album.images[0].url

    console.error('Downloading ', song);
    window.electron.ipcRenderer.sendMessage(
      'DOWNLOAD_SPOTIFY_SONG',
      songDetails
    );
    setDownloadStatus((prevStatus) => ({
      ...prevStatus,
      [idx]: 'downloading',
    }));

    window.electron.ipcRenderer.on('download-success', (message, songData) => {
      console.error('Success: ' + message, songData);
      setDownloadStatus((prevStatus) => ({
        ...prevStatus,
        [idx]: 'success',
      }));
    });

    window.electron.ipcRenderer.on('download-error', (error) => {
      console.error('Error: ' + error + '  ' + idx);
      setDownloadStatus((prevStatus) => ({
        ...prevStatus,
        [idx]: 'error',
      }));
    });
  };

  return (
    <div className="song-list-container">
      {playlistData && (
        <>
          <div className="song-list-header">{playlistData.name}</div>

          <ul className="song-list">
            {playlistData.tracks.items.map((item, idx) => (
              <div className="song" key={idx}>
                <li className="list-item">
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
                  <div className="right-side">
                    {downloadStatus[idx] && <>{downloadStatus[idx]}</>}
                    <img
                      className="plus-sign"
                      src={DownloadSVG}
                      onClick={() => downloadSong(item, idx)}
                    ></img>
                  </div>
                </li>
              </div>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default SpotifyPlaylist;
