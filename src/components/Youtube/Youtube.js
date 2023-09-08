import React, { useState } from 'react';

function YouTubeDownloader() {
  const [videoUrl, setVideoUrl] = useState('');
  const [downloadStatus, setDownloadStatus] = useState(null);

  const handleDownload = () => {
    window.electron.ipcRenderer.sendMessage('DOWNLOAD_YOUTUBE_VID', videoUrl);

    window.electron.ipcRenderer.on('download-success', (event, message) => {
      console.error('DOWNLOAD_SUCCESS', message);
      setDownloadStatus('Success');
    });

    window.electron.ipcRenderer.on('download-error', (event, error) => {
      console.error('DOWNLOAD_ERROR', error);
      setDownloadStatus('Error');
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
