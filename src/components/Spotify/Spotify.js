import React, { useEffect, useState } from 'react';
// import { Player } from 'spotify-web-playback-sdk';

import WebPlayback from './WebPlayback/WebPlayback';
import Login from './Login/Login';

const Spotify = () => {
  const [token, setToken] = useState('');
  useEffect(() => {
    async function getToken() {
      const response = await fetch('/auth/token');
      const json = await response.json();
      setToken(json.access_token);
      console.error('HI', json.access_token);
    }

    getToken();
  }, []);

  return <>{token === '' ? <Login /> : <WebPlayback token={token} />};</>;
};

export default Spotify;
