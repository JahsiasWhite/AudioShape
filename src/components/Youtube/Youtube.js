import React, { useState, useEffect } from 'react';
import './YoutubeDownloader.css';

import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';

// TODO: Videos with the char '|' in the title don't download. Prob issue with the package but maybe I can fix this

import { useAudioPlayer } from '../../AudioController/AudioContext';

function YouTubeDownloader() {
  const { addSong } = useAudioPlayer();

  const [videoUrl, setVideoUrl] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [downloadStatus, setDownloadStatus] = useState(null);

  const handleUrlDownload = () => {
    if (videoUrl === '') return;

    setDownloadStatus('Downloading');
    window.electron.ipcRenderer.sendMessage('DOWNLOAD_YOUTUBE_VID', videoUrl);

    listenForDownloadEvents();
  };

  const handleSearchDownload = () => {
    if (searchQuery.trim() === '') return;

    const songDetails = {
      name: searchQuery,
      artist: '',
      album: '',
    };

    setDownloadStatus('Downloading');
    window.electron.ipcRenderer.sendMessage(
      'DOWNLOAD_SONG_FROM_YOUTUBE_SEARCH',
      songDetails
    );

    listenForDownloadEvents();
  };

  const listenForDownloadEvents = () => {
    window.electron.ipcRenderer.once('download-success', (message, newSong) => {
      setDownloadStatus('Success: ' + message);
      addSong(newSong);
    });

    window.electron.ipcRenderer.once('download-error', (error) => {
      if (typeof error === 'string' && error.includes('403')) {
        setDownloadStatus(
          'Youtube updated their site, breaking this... Ensure you have the latest version of AudioShape installed. If its still not working, please wait for a fix...'
        );
      } else {
        setDownloadStatus(error.toString());
      }
    });
  };

  return (
    <div className="youtube-downloader-container">
      <h2 className="youtube-downloader-title">YouTube Video Downloader</h2>
      <div className="input-container">
        <input
          type="text"
          className="video-url-input"
          placeholder="Enter YouTube video URL"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
        />
        <button className="download-button" onClick={handleUrlDownload}>
          Download
        </button>
      </div>

      <div className="input-container">
        <input
          type="text"
          className="video-url-input"
          placeholder="Search YouTube for a song"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button className="download-button" onClick={handleSearchDownload}>
          Download
        </button>
      </div>

      {downloadStatus === 'Downloading' ? (
        <div className="center-content">
          <LoadingSpinner />
        </div>
      ) : (
        downloadStatus && <p className="download-status">{downloadStatus}</p>
      )}
    </div>
  );
}

export default YouTubeDownloader;
