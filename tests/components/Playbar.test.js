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
    id: '1',
  },
  {
    title: 'title2',
    artist: 'artist2',
    id: '2',
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
    visibleSongs: loadedSongs,
    // setVisibleSongs: (mockSetVisibleSongs = jest.fn()),
    // setCurrentScreen: jest.fn(),
    currentSongId: 0, // Index in the array
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
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders playbar correctly', () => {
    const { container } = render(
      <AudioProvider>
        <Playbar toggleSection={jest.fn()} />
      </AudioProvider>
    );

    expect(container).toBeDefined();
  });

  it('handles name click on a non-songlist screen', () => {
    const { getByText } = render(
      <AudioProvider>
        <Playbar />
      </AudioProvider>
    );

    fireEvent.click(getByText('title'));

    // Make sure the function 'scrollToCurrentSong' doesn't crash
    expect(AudioProvider).toBeDefined();
  });

  it('displays loading spinner and correct effect count when loading', () => {
    // TODO: I think there is a cleaner way to do this
    const {
      useAudioPlayer,
    } = require('../../src/AudioController/AudioContext');
    useAudioPlayer.mockReturnValueOnce({
      visibleSongs: loadedSongs,
      loadedSongs: loadedSongs.reduce((acc, s, idx) => {
        acc[idx] = s;
        return acc;
      }, {}),
      currentSongId: 0,
      loadingQueue: ['effect1'], // 1 left to load
      effects: { 1: {} }, // 1 total expected
      toggleShuffle: jest.fn(),
      shuffleIsEnabled: false,
      setVisibleSongs: jest.fn(),
      setCurrentScreen: jest.fn(),
    });

    const { getByText, getByTestId, container } = render(
      <AudioProvider>
        <Playbar toggleSection={jest.fn()} />
      </AudioProvider>
    );

    // Check for spinner
    const spinner = container.querySelector('.loading-spinner');
    expect(spinner).not.toBeNull();

    // Check for correct effect count display
    expect(getByText('0/1 effects')).not.toBeNull();
  });
});
