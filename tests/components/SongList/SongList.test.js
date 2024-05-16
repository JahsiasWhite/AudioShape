import React from 'react';
import { render, renderHook, fireEvent } from '@testing-library/react';
import SongList from '../../../src/components/SongList/SongList.js';
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
var mockSetVisibleSongs;
var handleSongSelectMock;
jest.mock('../../../src/AudioController/AudioContext', () => {
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

describe('<Artists />', () => {
  it('renders artists correctly', () => {
    const { container } = render(
      <AudioProvider>
        <SongList handleSongEdit={jest.fn()} />
      </AudioProvider>
    );

    expect(container).toBeDefined();
  });

  it('handles song click correctly', () => {
    const songTitle = 'title';
    const toggleSectionMock = jest.fn();
    const { getByText } = render(
      <AudioProvider>
        <SongList handleSongEdit={jest.fn()} />
      </AudioProvider>
    );

    // Simulate a click on an artist card
    fireEvent.doubleClick(getByText(songTitle));

    expect(handleSongSelectMock).toHaveBeenCalled();
  });
});
