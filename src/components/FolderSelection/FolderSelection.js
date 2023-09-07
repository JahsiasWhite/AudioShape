import React, { useState } from 'react';

import './FolderSelection.css';

function FolderSelection() {
  // Once a folder is selected, we call to the server to load the
  // file path to grab the songs
  const handleFolderSelection = (event) => {
    const filePath = event.target.files[0].path; // TODO: I dont think this is really accurate

    window.electron.ipcRenderer.sendMessage('GET_SONGS', filePath);
  };

  return (
    <label htmlFor="folderInput">
      Choose Song Directory
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
