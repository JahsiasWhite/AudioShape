import './HomeButton.css';
import HomeSVG from './home.svg';

function HomeButton({ toggleSection }) {
  return (
    <div className="button-container" onClick={() => toggleSection('allSongs')}>
      <img className="force" src={HomeSVG}></img>Home
    </div>
  );
}

export default HomeButton;
