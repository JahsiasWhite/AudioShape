import React from 'react';
// import { shell } from 'electron';

const Login = () => {
  const handleLoginClick = () => {
    window.electron.ipcRenderer.sendMessage('start-spotify-login');
  };

  return (
    <div className="App">
      <header className="App-header">
        <a className="btn-spotify" onClick={handleLoginClick}>
          Login with Spotify
        </a>
      </header>
    </div>
  );
};

export default Login;
