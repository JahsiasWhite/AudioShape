import React, { useState, useEffect } from 'react';

function YouTubeDownloader() {
  const [videoUrl, setVideoUrl] = useState('');
  const [downloadStatus, setDownloadStatus] = useState(null);

  const handleDownload = () => {
    window.electron.ipcRenderer.sendMessage('DOWNLOAD_YOUTUBE_VID', videoUrl);
    setDownloadStatus('Downloading');

    window.electron.ipcRenderer.on('download-success', (message) => {
      console.error('DOWNLOAD_SUCCESS', message);
      setDownloadStatus('Success: ' + message);
    });

    window.electron.ipcRenderer.on('download-error', (error) => {
      console.error('DOWNLOAD_ERROR', typeof error, error);
      setDownloadStatus('Error: ' + error);
    });
  };

  return (
    <div>
      <h2>YouTube Video Downloader</h2>
      <input
        type="text"
        placeholder="Enter YouTube video URL"
        value={videoUrl}
        onChange={(e) => setVideoUrl(e.target.value)}
      />
      <button onClick={handleDownload}>Download</button>
      {downloadStatus && <p>{downloadStatus}</p>}
    </div>
  );
}

export default YouTubeDownloader;
