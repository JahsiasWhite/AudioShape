import SpotifySVG from './spotify.svg';

function SpotifyButton() {
  return (
    <div className="button-container">
      <img className="force" src={SpotifySVG}></img>
      <span>Spotify</span>
    </div>
  );
}

export default SpotifyButton;
