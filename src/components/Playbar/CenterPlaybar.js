import PreviousButton from './PreviousButton/PreviousButton';
import PlayButton from './PlayButton/PlayButton';
import NextButton from './NextButton/NextButton';
import PlaybackTimer from './PlaybackTimer/PlaybackTimer';
import SavedEffects from './SavedEffects/SavedEffects';
import SlowDownButtonSVG from './SlowDownButtonSVG';
import SpeedupButtonSVG from './SpeedupButtonSVG';

import { useAudioPlayer } from '../../AudioController/AudioContext';

export default function CenterPlaybar() {
  const {
    toggleSpeedup,
    speedupIsEnabled,
    toggleSlowDown,
    slowDownIsEnabled,
    loadingQueue,
  } = useAudioPlayer();

  return (
    <div className="playbar-controls">
      <div
        className={`buttons-container ${
          loadingQueue.length > 0 ? 'unclickable' : ''
        }`}
      >
        <SavedEffects />

        <SlowDownButtonSVG
          slowDownIsEnabled={slowDownIsEnabled}
          onClick={() => {
            toggleSlowDown();
          }}
        ></SlowDownButtonSVG>
        <PreviousButton />
        <PlayButton />
        <NextButton />
        <SpeedupButtonSVG
          speedupIsEnabled={speedupIsEnabled}
          onClick={() => {
            toggleSpeedup();
          }}
        ></SpeedupButtonSVG>
      </div>
      <PlaybackTimer />
    </div>
  );
}
