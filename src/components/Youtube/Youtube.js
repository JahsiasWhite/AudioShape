import React, { useState, useEffect } from 'react';
import './YoutubeDownloader.css';

// TODO: Videos with the char '|' in the title don't download. Prob issue with the package but maybe I can fix this

function YouTubeDownloader() {
  const [videoUrl, setVideoUrl] = useState('');
  const [downloadStatus, setDownloadStatus] = useState(null);

  const handleDownload = () => {
    if (videoUrl === '') return;

    window.electron.ipcRenderer.sendMessage('DOWNLOAD_YOUTUBE_VID', videoUrl);
    setDownloadStatus('Downloading');

    window.electron.ipcRenderer.on('download-success', (message) => {
      setDownloadStatus('Success: ' + message);
    });

    window.electron.ipcRenderer.on('download-error', (error) => {
      setDownloadStatus('Error: ' + error);
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
        <button className="download-button" onClick={handleDownload}>
          Download
        </button>
      </div>
      {downloadStatus && <p className="download-status">{downloadStatus}</p>}
    </div>
  );
}

export default YouTubeDownloader;
