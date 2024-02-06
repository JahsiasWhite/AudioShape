import React from 'react';
import { render, renderHook, fireEvent } from '@testing-library/react';
import Artists from '../../src/components/Artists/Artists.js'; // Adjust the path accordingly
import AudioContext, {
  AudioProvider,
} from '../../src/audioController/AudioContext';

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
  useAudioPlayer.mockReturnValue({
    setVisibleSongs: (mockSetVisibleSongs = jest.fn()),
    setCurrentScreen: jest.fn(),
    loadedSongs: loadedSongs,
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

  // it('renders artists with ', () => {
  //   // const { result } = renderHook(() => Artists({ toggleSection: jest.fn() }));

  //   // Mock the necessary values from useAudioPlayer
  //   const mockVisibleSongs = {
  //     // Mock your visibleSongs data here
  //   };

  //   const mockSetVisibleSongs = jest.fn();
  //   const mockSetCurrentScreen = jest.fn();
  //   const mockLoadedSongs = {
  //     // Mock your loadedSongs data here
  //   };

  //   const useAudioPlayer = jest.fn();
  //   useAudioPlayer.mockReturnValue({
  //     setVisibleSongs: mockSetVisibleSongs,
  //     setCurrentScreen: mockSetCurrentScreen,
  //     loadedSongs: mockLoadedSongs,
  //   });

  //   jest.spyOn(React, 'useContext').mockImplementation(useAudioPlayer);

  //   const { container, getByText } = render(
  //     <AudioContext.Provider>
  //       <Artists toggleSection={jest.fn()} />
  //     </AudioContext.Provider>
  //   );

  //   // Assert that the component renders without crashing
  //   // expect(container).toBeDefined();

  //   // TODO: Add more assertions based on your component's behavior
  //   // For example, you might want to check if artist names are rendered correctly
  //   // and if clicking on an artist card triggers the expected actions.
  // });

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

    // Assert that the expected functions are called with the correct arguments
    // expect(mockSetVisibleSongs).toHaveBeenCalledWith({
    //   // Expected new visible songs based on your component's logic
    //   console.log("hi");

    // });

    /* We only want to show songs where the artist is 'artistName' */
    const expectedVisibleSongs = {
      undefined: {
        title: 'title',
        artist: 'artist',
      },
    };

    expect(toggleSectionMock).toHaveBeenCalled();
    expect(mockSetVisibleSongs).toHaveBeenCalledWith(expectedVisibleSongs);
  });
});
