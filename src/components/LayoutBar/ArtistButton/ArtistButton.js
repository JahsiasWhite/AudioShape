import ArtistSVG from './Artist.svg';

function Artists({ toggleSection }) {
  return (
    <div className="button-container" onClick={() => toggleSection('artists')}>
      <img className="icon" src={ArtistSVG}></img>Artists
    </div>
  );
}

export default Artists;
