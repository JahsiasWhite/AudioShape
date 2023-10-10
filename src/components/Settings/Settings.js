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
    fetchSettings();
  }, []);

  const fetchSettings = () => {
    window.electron.ipcRenderer.sendMessage('GET_SETTINGS');

    window.electron.ipcRenderer.on('GET_SETTINGS', (updatedSettings) => {
      setSettings(updatedSettings);
    });
  };

  // Handle settings update when the user interacts with FolderSelection
  const handleSettingsUpdate = () => {
    fetchSettings();
  };

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
        <FolderSelection onSettingsUpdate={handleSettingsUpdate} />
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
