import React from 'react';
import { render, renderHook, fireEvent, act } from '@testing-library/react';
import Settings from '../../src/components/Settings/Settings.js';
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
var handleSongSelectMock;
jest.mock('../../src/AudioController/AudioContext', () => {
  const useAudioPlayer = jest.fn();
  useAudioPlayer.mockReturnValue({
    setVisibleSongs: (mockSetVisibleSongs = jest.fn()),
    setCurrentScreen: jest.fn(),
    loadedSongs: loadedSongs,
    visibleSongs: loadedSongs,
    handleSongSelect: (handleSongSelectMock = jest.fn()),
    loadingQueue: [],
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

describe('<Settings />', () => {
  afterEach(() => {
    jest.clearAllMocks(); // Clear all mocks after each test
  });

  it('renders settings correctly', () => {
    const { container } = render(
      <AudioProvider>
        <Settings />
      </AudioProvider>
    );

    expect(container).toBeDefined();
  });

  it('handles toggle spotify correctly', () => {
    const { getByText, getByRole } = render(
      <AudioProvider>
        <Settings />
      </AudioProvider>
    );

    // Simulate a click on an artist card
    fireEvent.doubleClick(getByText('Enable Spotify'));
    expect(window.electron.ipcRenderer.on).toHaveBeenCalled();

    /* TEST */
    const updatedSettings = {
      songDirectory: '',
      dataDirectory: '',
      mp4DownloadEnabled: false,
      spotifyEnabled: true,
    };
    act(() => {
      // Assuming 'GET_SETTINGS' is the 3rd registered 'on' callback
      //   window.electron.ipcRenderer.on.mock.calls[2][1](updatedSettings);
      window.electron.ipcRenderer.on.mock.calls[2][1](updatedSettings);
    });

    const checkbox = getByRole('checkbox', { name: /Enable Spotify/i });
    expect(checkbox.checked).toBe(true);
  });
});
