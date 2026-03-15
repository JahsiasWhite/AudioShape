import { useState } from 'react';
import { useAudioPlayer } from '../../AudioController/AudioContext';

// TODO: Add song.id !!!!

function EffectNamePopup({ effects, closeNamePopup }) {
  const { saveEffects, currentSpeed } = useAudioPlayer();

  const [effectName, setEffectName] = useState('');
  const [error, setError] = useState('');

  const hasEffects = Object.keys(effects).length > 0 || currentSpeed !== 1;

  const saveEffect = () => {
    if (effectName === '') {
      setError('Please enter a name for this effect.');
      return;
    }
    if (!hasEffects) {
      setError('No effects are active. Add at least one effect before saving.');
      return;
    }

    saveEffects(effectName);
    closeNamePopup();
  };

  return (
    <div className="popup-container">
      <div className="close-menu" onClick={closeNamePopup}>
        X
      </div>
      <div className="create-playlist" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Enter effect name"
            value={effectName}
            onChange={(e) => { setEffectName(e.target.value); setError(''); }}
          />
          <button onClick={saveEffect}>Save</button>
        </div>
        {error && (
          <p style={{ color: 'var(--color-accent)', fontSize: '0.8rem', margin: 0 }}>
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

export default EffectNamePopup;
