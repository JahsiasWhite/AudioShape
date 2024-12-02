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
} from '../../../src/AudioController/AudioContext';

const loadedSongs = [
  {
    title: 'title',
    artist: 'artist',
    id: 'id',
  },
  {
    title: 'title2',
    artist: 'artist2',
    id: 'id2',
  },
];
var mockSetVisibleSongs;
var handleSongSelectMock;
var currentScreenMock = '';
var setCurrentScreen;
jest.mock('../../../src/AudioController/AudioContext', () => {
  const useAudioPlayer = jest.fn();
  useAudioPlayer.mockReturnValue({
    setVisibleSongs: (mockSetVisibleSongs = jest.fn()),
    setCurrentScreen: (setCurrentScreen = jest.fn()),
    loadedSongs: loadedSongs,
    visibleSongs: loadedSongs,
    handleSongSelect: (handleSongSelectMock = jest.fn()),
    loadingQueue: [],
    currentScreen: currentScreenMock,
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

describe('Song List Items', () => {
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

  it('handles add to playlist button click correctly', () => {
    let setPlaylistMenuOpen = jest.fn();
    const { getByTestId } = render(
      <AudioProvider>
        <SongListItems
          filteredSongs={[
            {
              title: 'title',
              artist: 'artist',
              id: 'id',
            },
          ]}
          setFilteredSongs={jest.fn()}
          toggleRightClickMenu={jest.fn()}
          setPlaylistMenuOpen={setPlaylistMenuOpen}
        />
      </AudioProvider>
    );

    // Simulate a click on the playlist button
    const playlistButton = getByTestId('plus-sign');
    fireEvent.click(playlistButton);

    expect(setPlaylistMenuOpen).toHaveBeenCalled();
  });

  it('handles song edit button click correctly', () => {
    let handleSongEditClick = jest.fn();
    const { getByTestId } = render(
      <AudioProvider>
        <SongListItems
          filteredSongs={[
            {
              title: 'title',
              artist: 'artist',
              id: 'id',
            },
          ]}
          setFilteredSongs={jest.fn()}
          toggleRightClickMenu={jest.fn()}
          handleSongEditClick={handleSongEditClick}
        />
      </AudioProvider>
    );

    // Simulate a click on the edit button
    const editButton = getByTestId('dropdown-button');
    fireEvent.click(editButton);

    expect(handleSongEditClick).toHaveBeenCalled();
    expect(setCurrentScreen).toHaveBeenCalled();
  });
});
