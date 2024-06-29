import React from 'react';
import { render, renderHook, fireEvent, act } from '@testing-library/react';
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
    currentSong: mockCurrentSong,
    loadingQueue: [],
    savedEffects: savedEffects,
    resetCurrentSong: (resetCurrentSongMock = jest.fn()),
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
});
