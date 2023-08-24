import React, { useState } from 'react';

function FolderSelection() {
  // Once a folder is selected, we call to the server to load the
  // file path to grab the songs
  const handleFolderSelection = (event) => {
    const filePath = event.target.files[0].path;

    window.electron.ipcRenderer.sendMessage('GET_SONGS', filePath);
  };

  return (
    <label htmlFor="folderInput">
      Choose Folder
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
