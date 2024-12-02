import React from 'react';

import './FolderSelection.css';

function FolderSelection({ onSettingsUpdate }) {
  // Once a folder is selected, we call to the server to load the
  // file path to grab the songs
  const handleFolderSelection = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Get the first folder from the relative path
    const firstFolder = file.webkitRelativePath.split('/')[0];

    // Remove everything after and including the first folder from the absolute path
    const fullPath = file.path;
    const selectedFolderPath = fullPath.substring(
      0,
      fullPath.indexOf(firstFolder) + firstFolder.length
    );

    console.error('Selected folder path:', selectedFolderPath);

    window.electron.ipcRenderer.sendMessage('GET_SONGS', selectedFolderPath);

    // Notify the parent component about the folder selection
    onSettingsUpdate();
  };

  return (
    <label htmlFor="folderInput" className="folderInputLabel">
      <b>Choose Song Directory</b>
      <input
        id="folderInput"
        type="file"
        directory=""
        webkitdirectory=""
        onChange={handleFolderSelection}
      />
    </label>
  );
}

export default FolderSelection;
