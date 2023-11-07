import SpotifySVG from './spotify.svg';

function SpotifyButton() {
  return (
    <div className="button-container">
      <img className="icon" src={SpotifySVG}></img>Spotify
    </div>
  );
}

export default SpotifyButton;
