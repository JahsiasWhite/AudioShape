import PlaylistSVG from './Playlist.svg';

function PlaylistButton({ toggleSection }) {
  return (
    <div
      className="button-container"
      onClick={() => toggleSection('playlists')}
    >
      <img className="icon" src={PlaylistSVG}></img>Playlists
    </div>
  );
}

export default PlaylistButton;
