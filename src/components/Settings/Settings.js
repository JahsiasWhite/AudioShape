// Settings.js
import React, { useEffect, useState } from 'react';
import FolderSelection from '../FolderSelection/FolderSelection';
import './Settings.css';
import ColorSettings from './ColorSettings';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import { useAudioPlayer } from '../../AudioController/AudioContext';

function Settings({ openHistory }) {
  const { startSongsLoading, initSongsLoading } = useAudioPlayer();

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
  // newPath is passed immediately so the display updates without waiting for the IPC round-trip
  const handleSettingsUpdate = (newPath) => {
    if (newPath) {
      setSettings((prev) => ({
        ...prev,
        libraryDirectory: newPath.replace(/\\/g, '/'),
      }));
    }
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
          {initSongsLoading ? (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              {settings.libraryDirectory}
              <LoadingSpinner className="loading-spinner-sm" />
            </span>
          ) : (
            settings.libraryDirectory
          )}
        </div>
        <FolderSelection
          onSettingsUpdate={handleSettingsUpdate}
          onLoadingStart={startSongsLoading}
        />

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
        <div className="setting-item">
          <input
            type="checkbox"
            id="toggleMP4"
            checked={settings.mp4DownloadEnabled}
            onChange={() => saveSettings('mp4DownloadEnabled')}
          />
          <label htmlFor="toggleMP4"> Download songs as MP4s </label>
        </div>
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
      <div className="settings-container">
        <div className="song-title">History</div>
        <div className="setting-item">
          <button className="settings-link-button" onClick={openHistory}>
            Open Listening History
          </button>
        </div>
      </div>
      <div className="settings-container settings-tips">
        <div className="song-title">Tips</div>
        <details className="setting-item settings-tips-details">
          <summary className="settings-tips-summary">How search works</summary>
          <div className="settings-tips-body">
            <p>
              Search matches against each song&apos;s title, artist, and album
              (file path only for extension filters below).
            </p>
            <ul>
              <li>
                <strong>Plain text</strong> — substring match, case-insensitive.
                Example: <code>kanye</code>
              </li>
              <li>
                <strong>Exact field</strong> — wrap in double quotes. The whole
                title, artist, or album must match that phrase exactly.
                Example: <code>&quot;kanye west&quot;</code>
              </li>
              <li>
                <strong>Exclude</strong> — double quotes with a leading{' '}
                <code>!</code> inside the quotes. Hides rows where title, artist,
                or album contains the phrase. Example:{' '}
                <code>&quot;!kanye&quot;</code> (or <code>!&quot;kanye&quot;</code>
                before normalization).
              </li>
              <li>
                <strong>Regex (advanced)</strong> — wrap the pattern in single
                quotes. Uses JavaScript <code>RegExp</code> with the{' '}
                <code>i</code> flag on title, artist, and album. Negation is not
                supported in this mode; use double-quote exclude instead. Invalid
                patterns match nothing. Example: <code>&apos;kanye.*west&apos;</code>
              </li>
              <li>
                <strong>By file type</strong> — if the entire box is only an
                extension like <code>.mp3</code>, <code>mp3</code>, or{' '}
                <code>*.mp3</code>, songs are filtered by that extension on the
                file path.
              </li>
            </ul>
          </div>
        </details>
      </div>
    </div>
  );
}

export default Settings;
