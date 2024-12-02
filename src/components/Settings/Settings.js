// Settings.js
import React, { useEffect, useState } from 'react';
import FolderSelection from '../FolderSelection/FolderSelection';
import './Settings.css'; // Import the CSS file

function Settings() {
  const [settings, setSettings] = useState({
    songDirectory: '',
    dataDirectory: '',
    mp4DownloadEnabled: false,
    spotifyEnabled: false,
  });

  /**
   * Gets the settings when the component first loads
   */
  useEffect(() => {
    fetchSettings();
  }, []);

  // TODO: Turn into invoke maybe
  const fetchSettings = () => {
    console.error('Getting settings...');
    window.electron.ipcRenderer.sendMessage('GET_SETTINGS');

    window.electron.ipcRenderer.on('GET_SETTINGS', (updatedSettings) => {
      setSettings(updatedSettings);
      console.error(updatedSettings);
      window.electron.ipcRenderer.removeAllListeners('GET_SETTINGS');
    });
  };

  // Handle settings update when the user interacts with FolderSelection
  const handleSettingsUpdate = () => {
    fetchSettings();
  };

  const saveSettings = (setting) => {
    settings[setting] = !settings[setting];
    setSettings({
      ...settings,
    });
    window.electron.ipcRenderer.sendMessage('SAVE_SETTINGS', settings);

    fetchSettings();

    // Update the layout bar
    if (setting === 'spotifyEnabled')
      window.electron.ipcRenderer.sendMessage('GET_LAYOUT_SETTINGS');
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

        {/* <div className="setting-item">
          <input type="checkbox" id="toggleMP4" />
          <label htmlFor="toggleMP4">
            Toggle showing image in fullscreen view{' '}
          </label>
        </div> */}
        {/* <div className="setting-item">
          <input
            type="checkbox"
            id="toggleMP4"
            checked={settings.mp4DownloadEnabled}
            onChange={() => saveSettings('mp4DownloadEnabled')}
          />
          <label htmlFor="toggleMP4"> Download songs as MP4s </label>
        </div> */}
        <div className="setting-item">
          <input
            type="checkbox"
            id="spotifyEnabled"
            checked={settings.spotifyEnabled}
            onChange={() => saveSettings('spotifyEnabled')}
          />
          <label htmlFor="spotifyEnabled"> Enable Spotify </label>
        </div>
      </div>
    </div>
  );
}

export default Settings;
