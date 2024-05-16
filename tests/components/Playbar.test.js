import React from 'react';
import { render, renderHook, fireEvent } from '@testing-library/react';
import Playbar from '../../src/components/Playbar/Playbar.js';
import AudioContext, {
  AudioProvider,
} from '../../src/AudioController/AudioContext';

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
var mockSetVisibleSongs;
jest.mock('../../src/AudioController/AudioContext', () => {
  const useAudioPlayer = jest.fn();
  const mockCurrentSong = {
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  };
  useAudioPlayer.mockReturnValue({
    visibleSongs: [],
    // setVisibleSongs: (mockSetVisibleSongs = jest.fn()),
    // setCurrentScreen: jest.fn(),
    currentSong: mockCurrentSong,
    loadedSongs: loadedSongs,
    loadingQueue: [],
    effects: [],
  });

  return {
    ...jest.requireActual('../../src/AudioController/AudioContext'),
    useAudioPlayer,
  };
});

// Mock the ipcRenderer for testing
window.electron = {
  ipcRenderer: {
    on: jest.fn(),
    once: jest.fn(),
    sendMessage: jest.fn(),
  },
};

describe('<Playbar />', () => {
  it('renders playbar correctly', () => {
    const { container } = render(
      <AudioProvider>
        <Playbar toggleSection={jest.fn()} />
      </AudioProvider>
    );

    expect(container).toBeDefined();
  });
});
