import React, { useEffect, useState } from 'react';
// import { Player } from 'spotify-web-playback-sdk';

import WebPlayback from './WebPlayback/WebPlayback';
import SpotifyPlaylists from './SpotifyPlaylists/SpotifyPlaylists';
import Login from './Login/Login';

const Spotify = () => {
  const [token, setToken] = useState('');
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

  const handleLoggedIn = (code, playlists) => {
    console.error('HI');
    console.error(playlists);
    console.error(code);
    setToken(code);
    setPlaylists(playlists);
  };

  useEffect(() => {
    // ? useMemo ?
    window.electron.ipcRenderer.once('start-spotify-login', handleLoggedIn);
  });

  // <WebPlayback token={token} />

  return (
    <>{token === '' ? <Login /> : <SpotifyPlaylists playlists={playlists} />}</>
  );
};

export default Spotify;
