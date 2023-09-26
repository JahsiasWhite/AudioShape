import SettingsVG from './Settings.svg';

function SettingsButton() {
  return (
    <div className="button-container">
      <img className="icon" src={SettingsVG}></img>Settings
    </div>
  );
}

export default SettingsButton;
