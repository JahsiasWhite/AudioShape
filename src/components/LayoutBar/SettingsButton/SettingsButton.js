import SettingsVG from './Settings.svg';

function SettingsButton() {
  return (
    <div className="button-container">
      <img className="icon" src={SettingsVG}></img>
      <span>Settings</span>
    </div>
  );
}

export default SettingsButton;
