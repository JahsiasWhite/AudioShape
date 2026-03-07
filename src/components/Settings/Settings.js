// Settings.js
import React, { useEffect, useState } from 'react';
import FolderSelection from '../FolderSelection/FolderSelection';
import './Settings.css';
import ColorSettings from './ColorSettings';

function Settings() {
  const [settings, setSettings] = useState({
    songDirectory: '',
    dataDirectory: '',
    mp4DownloadEnabled: false,
    spotifyEnabled: false,
    colors: {},
    rowSize: 50,
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
      if (updatedSettings.rowSize != null) {
        document.documentElement.style.setProperty(
          '--row-image-size',
          updatedSettings.rowSize + 'px',
        );
      }
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

  const saveRowSize = (value) => {
    const newSettings = { ...settings, rowSize: value };
    setSettings(newSettings);
    document.documentElement.style.setProperty(
      '--row-image-size',
      value + 'px',
    );
    window.electron.ipcRenderer.sendMessage('SAVE_SETTINGS', newSettings);
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

        <div className="setting-item">
          <label htmlFor="rowSize">
            Song Row Size: {settings.rowSize ?? 50}px
          </label>
          <br />
          <input
            type="range"
            id="rowSize"
            className="row-size-slider"
            min="30"
            max="150"
            step="10"
            list="rowSizeTicks"
            value={settings.rowSize ?? 50}
            onChange={(e) => saveRowSize(Number(e.target.value))}
          />
          <datalist id="rowSizeTicks">
            <option value="30" />
            <option value="50" />
            <option value="70" />
            <option value="90" />
            <option value="110" />
            <option value="130" />
            <option value="150" />
          </datalist>
        </div>

        <ColorSettings />
      </div>
    </div>
  );
}

export default Settings;
