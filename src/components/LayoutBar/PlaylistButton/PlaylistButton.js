import PlaylistSVG from './Playlist.svg';

function PlaylistButton() {
  return (
    <div className="button-container">
      <img className="icon" src={PlaylistSVG}></img>
      <span>Playlists</span>
    </div>
  );
}

export default PlaylistButton;
