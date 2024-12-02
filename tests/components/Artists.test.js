import React from 'react';
import { render, renderHook, fireEvent } from '@testing-library/react';
import Artists from '../../src/components/Artists/Artists.js';
import App from '../../src/App';
import AudioContext, {
  AudioProvider,
} from '../../src/AudioController/AudioContext';

const loadedSongs = {
  sampleArtist: {
    title: 'title',
    artist: 'artist',
    duration: 42,
  },
  sampleArtist2: {
    title: 'title2',
    artist: 'artist2',
  },
};
var mockSetVisibleSongs;
jest.mock('../../src/AudioController/AudioContext', () => {
  const useAudioPlayer = jest.fn();
  useAudioPlayer.mockReturnValue({
    setVisibleSongs: (mockSetVisibleSongs = jest.fn()),
    setCurrentScreen: jest.fn(),
    loadedSongs: loadedSongs,
    visibleSongs: loadedSongs,
    loadingQueue: [],
    effects: {},
    currentSong: {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      src: 'sample-file',
      play: jest.fn(),
    },
    savedEffects: {},
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

describe('<Artists />', () => {
  it('renders artists correctly', () => {
    const { container } = render(
      <AudioProvider>
        <Artists toggleSection={jest.fn()} />
      </AudioProvider>
    );

    expect(container).toBeDefined();
  });

  it('handles artist click correctly', () => {
    const artistName = 'artist';
    const toggleSectionMock = jest.fn();
    const { getByText } = render(
      <AudioProvider>
        <Artists toggleSection={toggleSectionMock} />
      </AudioProvider>
    );

    // Simulate a click on an artist card
    fireEvent.click(getByText(artistName));

    /* We only want to show songs where the artist is 'artistName' */
    const expectedVisibleSongs = {
      undefined: {
        title: 'title',
        artist: 'artist',
        duration: 42,
      },
    };

    expect(toggleSectionMock).toHaveBeenCalled();
    expect(mockSetVisibleSongs).toHaveBeenCalledWith(expectedVisibleSongs);
  });

  it('handles artist click to song screen correctly', () => {
    const artistName = 'artist';
    const resultText = '0:42';
    const { getByText, queryByText } = render(
      <AudioProvider>
        <App />
      </AudioProvider>
    );

    // Find and go to the Artists component within App
    const artistsComponent = getByText('Artists');
    expect(artistsComponent).toBeTruthy();
    fireEvent.click(getByText('Artists'));

    // This is the duration of the artist that we are going to click
    // Making sure the artist is not clicked at this point
    expect(queryByText(resultText)).toBeFalsy();

    // Simulate a click on an artist card
    fireEvent.click(getByText(artistName));

    /* We only want to show songs where the artist is 'artistName' */
    const expectedVisibleSongs = {
      undefined: {
        title: 'title',
        artist: 'artist',
        duration: 42,
      },
    };
    expect(mockSetVisibleSongs).toHaveBeenCalledWith(expectedVisibleSongs);

    // Check if we went back to main song screen after clicking an artist
    const result = getByText(resultText);
    expect(result).toBeTruthy();
  });
});
