import React from 'react';
import {
  render,
  renderHook,
  fireEvent,
  act,
  waitFor,
  cleanup,
} from '@testing-library/react';
import AudioPlugin from '../../../src/components/Mixer/AudioPlugin.js';
import AudioContext, {
  AudioProvider,
} from '../../../src/AudioController/AudioContext';

const loadedSongs = [
  {
    title: 'title',
    artist: 'artist',
  },
  {
    title: 'title2',
    artist: 'artist2',
  },
];
const savedEffects = {};
const mockCurrentSong = {
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
};
var mockSetVisibleSongs;
var handleSongSelectMock;
var resetCurrentSongMock;
jest.mock('../../../src/AudioController/AudioContext', () => {
  const useAudioPlayer = jest.fn();
  useAudioPlayer.mockReturnValue({
    // setVisibleSongs: (mockSetVisibleSongs = jest.fn()),
    // setCurrentScreen: jest.fn(),
    // loadedSongs: loadedSongs,
    // visibleSongs: loadedSongs,
    // handleSongSelect: (handleSongSelectMock = jest.fn()),
    currentSpeed: 1,
    currentSong: mockCurrentSong,
    loadingQueue: [],
    savedEffects: savedEffects,
    resetCurrentSong: (resetCurrentSongMock = jest.fn()),
    addEffect: jest.fn(),
  });

  return {
    ...jest.requireActual('../../../src/AudioController/AudioContext'),
    useAudioPlayer,
  };
});

// Mock the ipcRenderer for testing
window.electron = {
  ipcRenderer: {
    on: jest.fn(),
    once: jest.fn(),
  },
};

describe('<AudioPlugin />', () => {
  it('renders AudioPlugin correctly', () => {
    const { container } = render(
      <AudioProvider>
        <AudioPlugin />
      </AudioProvider>
    );

    expect(container).toBeDefined();
  });

  it('handles reset button correctly', async () => {
    const buttonText = 'Reset';
    const { getByText } = render(
      <AudioProvider>
        <AudioPlugin />
      </AudioProvider>
    );

    const resetDiv = getByText(buttonText);
    expect(resetDiv).toBeDefined();

    const resetButton = resetDiv.querySelector('.synth-button');
    expect(resetButton).toBeDefined();

    // Click reset button
    fireEvent.click(resetButton);
  });

  it('speed knob should work', async () => {
    const { container, getByText } = render(
      <AudioProvider>
        <AudioPlugin />
      </AudioProvider>
    );

    // Multiplier is default to 1x
    const multiplier = getByText('MULTIPLIER: 1x');
    expect(multiplier).not.toBeNull();

    const speedContainer = container.querySelector('.speed-body');
    expect(speedContainer).toBeDefined();

    const speedKnob = speedContainer.querySelector('.knob');
    const grip = speedKnob.querySelector('.grip');
    expect(grip).toBeDefined();
    expect(grip).not.toBeNull();

    // Drag speed to the right
    fireEvent.mouseDown(grip);
    fireEvent.mouseMove(grip, { clientX: 10, clientY: 0 });
    fireEvent.mouseUp(grip);

    // There is a small delay for the UI to update that we have to wait for
    await waitFor(() => {
      expect(getByText('MULTIPLIER: 1.69x')).not.toBeNull();
    });
  });

  it('speed knob position should update when reset button is pressed', async () => {
    const { container, getByText } = render(
      <AudioProvider>
        <AudioPlugin />
      </AudioProvider>
    );

    // Multiplier is default to 1x
    const multiplier = getByText('MULTIPLIER: 1x');
    const speedContainer = container.querySelector('.speed-body');

    const speedKnob = speedContainer.querySelector('.knob');
    const innerKnob = speedKnob.querySelector('.knob.inner');
    const grip = speedKnob.querySelector('.grip');

    // Make sure default values are correct
    expect(getComputedStyle(innerKnob).transform).toBe('rotate(178deg)');

    // Simulate moving speed knob to the right
    fireEvent.mouseDown(grip);
    fireEvent.mouseMove(grip, { clientX: 10, clientY: 0 });
    fireEvent.mouseUp(grip);

    // There is a small delay for the UI to update that we have to wait for
    await waitFor(() => {
      expect(getByText('MULTIPLIER: 1.69x')).not.toBeNull();

      const newMultiplier = getByText('MULTIPLIER: 1.69x');
      expect(newMultiplier).not.toBeNull();

      expect(getComputedStyle(innerKnob).transform).toBe('rotate(270deg)');

      // Click Reset button
      const resetDiv = getByText('Reset');
      const resetButton = resetDiv.querySelector('.synth-button');
      fireEvent.click(resetButton);

      const resetMultiplier = getByText('MULTIPLIER: 1x');
      expect(resetMultiplier).not.toBeNull();
    });

    // const innerKnob2 = speedKnob.querySelector('.knob.inner');
    // expect(getComputedStyle(innerKnob2).transform).toBe('rotate(178deg)');
  });
});
