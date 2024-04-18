// Settings.js
import React, { useEffect, useState } from 'react';
import FolderSelection from '../FolderSelection/FolderSelection';
import './Settings.css'; // Import the CSS file

function Settings() {
  const [settings, setSettings] = useState({
    songDirectory: '',
    dataDirectory: '',
    mp4DownloadEnabled: false,
  });

  /**
   * Gets the settings when the component first loads
   */
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = () => {
    window.electron.ipcRenderer.sendMessage('GET_SETTINGS');

    window.electron.ipcRenderer.on('GET_SETTINGS', (updatedSettings) => {
      setSettings(updatedSettings);
      console.error(updatedSettings);
    });
  };

  // Handle settings update when the user interacts with FolderSelection
  const handleSettingsUpdate = () => {
    fetchSettings();
  };

  // Toggles whether we download an MP4 or MP3 from Youtube or Spotify
  // MP4 takes much more space and a lot longer to download
  const toggleMP4 = () => {
    settings.mp4DownloadEnabled = !settings.mp4DownloadEnabled;
    setSettings({
      ...settings,
      ['mp4DownloadEnabled']: settings.mp4DownloadEnabled,
    });
    window.electron.ipcRenderer.sendMessage('SAVE_SETTINGS', settings);
  };

  return (
    <div className="settings">
      <div className="settings-container">
        <div className="song-title">Directories</div>

        <div className="setting-item">
          <strong style={{ marginRight: 1 + '%' }}>
            Current Song Directory:
          </strong>
          {settings.libraryDirectory}
          {/* Choose Song Directory */}
        </div>
        <FolderSelection onSettingsUpdate={handleSettingsUpdate} />

        <div className="setting-item">
          <strong>Settings Directory:</strong> {settings.dataDirectory}
        </div>
      </div>
      <div className="settings-container">
        <div className="song-title">Customizations</div>

        <div className="setting-item">
          <input type="checkbox" id="toggleMP4" />
          <label htmlFor="toggleMP4">
            Toggle showing image in fullscreen view{' '}
          </label>
        </div>
        <div className="setting-item">
          <input
            type="checkbox"
            id="toggleMP4"
            checked={settings.mp4DownloadEnabled}
            onChange={toggleMP4}
          />
          <label htmlFor="toggleMP4"> Download songs as MP4s </label>
        </div>
      </div>
    </div>
  );
}

export default Settings;
