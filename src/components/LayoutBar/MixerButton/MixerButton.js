// import './MixerButton.css';
import MixerSVG from './mixer.svg';

function MixerButton({ toggleSection }) {
  return (
    <div className="button-container" onClick={() => toggleSection('mixer')}>
      <img className="force" src={MixerSVG}></img>Edit
    </div>
  );
}

export default MixerButton;
