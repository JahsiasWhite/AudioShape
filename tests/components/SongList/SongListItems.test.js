import React from 'react';
import {
  render,
  renderHook,
  fireEvent,
  getByTestId,
} from '@testing-library/react';
import SongListItems from '../../../src/components/SongList/SongListItems.js';
import AudioContext, {
  AudioProvider,
} from '../../../src/audioController/AudioContext';

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
        <SongListItems
          filteredSongs={[]}
          setFilteredSongs={jest.fn()}
          toggleRightClickMenu={jest.fn()}
        />
      </AudioProvider>
    );

    expect(container).toBeDefined();
  });

  // it('handles song click correctly', () => {
  //   const { getByTestId } = render(
  //     <AudioProvider>
  //       <SongListItems
  //         filteredSongs={[]}
  //         setFilteredSongs={jest.fn()}
  //         toggleRightClickMenu={jest.fn()}
  //       />
  //     </AudioProvider>
  //   );

  //   // Simulate a click on the edit button
  //   // const editButton = getByRole('img', { name: /dropdown-button/i });
  //   const editButton = getByTestId('dropdown-button');
  //   fireEvent.click(editButton);

  //   expect(editButton).toHaveBeenCalled();

  //   // const checkbox = getByRole('checkbox', { name: /Download songs as MP4s/i });
  //   // expect(checkbox.checked).toBe(true);
  // });
});
