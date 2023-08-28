import SettingsVG from './Settings.svg';

function SettingsButton({ toggleSection }) {
  return (
    <div className="button-container" onClick={() => toggleSection('settings')}>
      <img className="icon" src={SettingsVG}></img>Settings
    </div>
  );
}

export default SettingsButton;
