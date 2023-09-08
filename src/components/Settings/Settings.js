// Settings.js
import React, { useEffect, useState } from 'react';
import FolderSelection from '../FolderSelection/FolderSelection';
import './Settings.css'; // Import the CSS file

function Settings() {
  const [settings, setSettings] = useState({
    songDirectory: '',
    outputDirectory: '',
  });

  /**
   * Gets the settings when the component first loads
   */
  useEffect(() => {
    window.electron.ipcRenderer.sendMessage('GET_SETTINGS');

    window.electron.ipcRenderer.on('GET_SETTINGS', (settings) => {
      setSettings(settings);
    });
  }, []);

  return (
    <div className="settings">
      <div className="settings-container">
        <div className="container-header">Directories</div>

        <div className="setting-item">
          <strong>Song Directory:</strong> {settings.songDirectory}
        </div>
        <div className="setting-item">
          <strong>Output Directory:</strong> {settings.outputDirectory}
        </div>
        <FolderSelection />
      </div>
      <div className="settings-container">
        <div className="container-header">Customizations</div>

        <div className="setting-item">
          Toggle showing image in fullscreen view
        </div>
      </div>
    </div>
  );
}

export default Settings;
