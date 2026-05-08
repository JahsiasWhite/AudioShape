import React from 'react';

import './FolderSelection.css';

function FolderSelection({ onSettingsUpdate, onLoadingStart }) {
  // Once a folder is selected, we call to the server to load the
  // file path to grab the songs
  const handleFolderSelection = async () => {
    const selectedFolderPath = await window.electron.ipcRenderer.invoke(
      'SELECT_LIBRARY_DIRECTORY'
    );
    if (!selectedFolderPath) return;

    // Signal that loading has started before sending the request
    if (onLoadingStart) onLoadingStart();

    window.electron.ipcRenderer.sendMessage('GET_SONGS', {
      folderPath: selectedFolderPath,
    });

    // Notify the parent component about the folder selection, passing the new path
    // so it can update the displayed directory immediately without an IPC round-trip
    if (onSettingsUpdate) onSettingsUpdate(selectedFolderPath);
  };

  return (
    <button
      type="button"
      data-testid="folder-input"
      className="folderInputLabel"
      onClick={handleFolderSelection}
    >
      <b>Choose Song Directory</b>
    </button>
  );
}

export default FolderSelection;
