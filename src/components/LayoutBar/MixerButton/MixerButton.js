// import './MixerButton.css';
import MixerSVG from './mixer.svg';

function MixerButton() {
  return (
    <div className="button-container">
      <img className="force" src={MixerSVG}></img>Edit
    </div>
  );
}

export default MixerButton;
