import React, { useEffect, useState } from 'react';
// import { Player } from 'spotify-web-playback-sdk';

import WebPlayback from './WebPlayback/WebPlayback';
import SpotifyPlaylists from './SpotifyPlaylists/SpotifyPlaylists';
import Login from './Login/Login';

const Spotify = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [playlists, setPlaylists] = useState({});
  // useEffect(() => {
  //   async function getToken() {
  //     const response = await fetch('/auth/token');
  //     const json = await response.json();
  //     setToken(json.access_token);
  //     console.error('HI', json.access_token);
  //   }

  //   getToken();
  // }, []);

  const handleLoggedIn = (playlists) => {
    console.error(playlists);
    setLoggedIn(true);
    setPlaylists(playlists);

    // Close the login window
    // window.electron.ipcRenderer.send('close-login-window');
  };

  useEffect(() => {
    // ? useMemo ?
    window.electron.ipcRenderer.once('get-user-playlists', handleLoggedIn);
  });

  // <WebPlayback token={token} />

  return (
    <>
      {!loggedIn ? (
        <Login />
      ) : (
        // ) : token === '' ? (
        //   <div>
        //     <a onClick={() => handleLogin(url)}>TEST</a>
        //   </div>
        <SpotifyPlaylists playlists={playlists} />
      )}
    </>
  );
};

export default Spotify;
