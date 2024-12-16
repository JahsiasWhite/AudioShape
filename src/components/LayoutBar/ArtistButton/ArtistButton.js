import ArtistSVG from './Artist.svg';

function Artists() {
  return (
    <div className="button-container">
      <img className="force" src={ArtistSVG}></img>
      <span>Artists</span>
    </div>
  );
}

export default Artists;
