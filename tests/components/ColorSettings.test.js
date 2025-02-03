import React from 'react';
import { render, renderHook, fireEvent, act } from '@testing-library/react';
import ColorSettings from '../../src/components/Settings/ColorSettings.js';
import AudioContext, {
  AudioProvider,
} from '../../src/AudioController/AudioContext.js';

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
    removeAllListeners: jest.fn(),
  },
};

describe('<ColorSettings />', () => {
  afterEach(() => {
    jest.clearAllMocks(); // Clear all mocks after each test
  });

  it('renders color settings correctly', () => {
    const { container } = render(
      <AudioProvider>
        <ColorSettings />
      </AudioProvider>
    );

    expect(container).toBeDefined();
  });

  it('handles reset correctly', () => {
    const { getByText, getByRole } = render(
      <AudioProvider>
        <ColorSettings />
      </AudioProvider>
    );

    // Simulate a click on an artist card
    fireEvent.click(getByText('Colors'));
    fireEvent.doubleClick(getByText('Reset'));
    expect(window.electron.ipcRenderer.on).toHaveBeenCalled();
  });

  it('handles reset correctly', () => {
    const { getByText, getByRole } = render(
      <AudioProvider>
        <ColorSettings />
      </AudioProvider>
    );

    // Simulate a click on an artist card
    fireEvent.click(getByText('Colors'));
    fireEvent.doubleClick(getByText('Reset'));
    expect(window.electron.ipcRenderer.on).toHaveBeenCalled();
  });
});
