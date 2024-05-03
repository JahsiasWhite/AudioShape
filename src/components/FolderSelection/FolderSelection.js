import React from 'react';

import './FolderSelection.css';

function FolderSelection({ onSettingsUpdate }) {
  // Once a folder is selected, we call to the server to load the
  // file path to grab the songs
  const handleFolderSelection = (event) => {
    const filePath = event.target.files[0].path;

    window.electron.ipcRenderer.sendMessage('GET_SONGS', filePath);

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
