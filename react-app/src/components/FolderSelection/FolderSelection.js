import React, { useState } from 'react';

function FolderSelection() {
  const [chosenFolderPath, setChosenFolderPath] = useState(null);

  // Once a folder is selected, we call to the server to load the
  // file path to grab the songs
  const handleFolderSelection = (event) => {
    const filePath = event.target.files[0].path;
    // const relativePath = event.target.files[0].webkitRelativePath;

    const cutoffIndex = filePath.lastIndexOf('\\');
    const folderPath = filePath.substring(0, cutoffIndex);

    setChosenFolderPath(folderPath);
    window.electron.ipcRenderer.sendMessage('GET_SONGS', folderPath);
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
