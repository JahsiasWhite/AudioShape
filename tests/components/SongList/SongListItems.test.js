import React from 'react';
import {
  render,
  renderHook,
  fireEvent,
  getByTestId,
} from '@testing-library/react';
import { mockScrollToRow } from 'react-window';
import SongListItems from '../../../src/components/SongList/SongListItems.js';
import AudioContext, {
  AudioProvider,
} from '../../../src/AudioController/AudioContext';

jest.mock('react-window', () => {
  const React = require('react');
  const mockScrollToRow = jest.fn();
  function List({ rowComponent: Row, rowCount, rowProps, listRef }) {
    React.useLayoutEffect(() => {
      if (listRef) {
        listRef.current = {
          scrollToRow: mockScrollToRow,
        };
      }
    });
    if (!Row || !rowCount) return null;
    const merged = rowProps || {};
    return React.createElement(
      'div',
      { 'data-testid': 'virtual-list' },
      Array.from({ length: rowCount }, (_, index) =>
        React.createElement(Row, {
          key: index,
          index,
          style: {},
          ariaAttributes: {},
          ...merged,
        }),
      ),
    );
  }
  function useListRef() {
    return React.useRef(null);
  }
  return { mockScrollToRow, List, useListRef };
});

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
    currentSongId: null,
    songListScrollToCurrentToken: 0,
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
    sendMessage: jest.fn(),
  },
};

describe('Song List Items', () => {
  afterEach(() => {
    mockScrollToRow.mockClear();
    const {
      useAudioPlayer,
    } = require('../../../src/AudioController/AudioContext');
    useAudioPlayer.mockReturnValue({
      setVisibleSongs: mockSetVisibleSongs,
      setCurrentScreen,
      loadedSongs,
      visibleSongs: loadedSongs,
      handleSongSelect: handleSongSelectMock,
      loadingQueue: [],
      currentScreen: currentScreenMock,
      currentSongId: null,
      songListScrollToCurrentToken: 0,
    });
  });

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

  it('scrolls the virtual list to the current song when songListScrollToCurrentToken bumps (e.g. playbar title click)', () => {
    const {
      useAudioPlayer,
    } = require('../../../src/AudioController/AudioContext');

    const filtered = {
      id: { title: 'title', artist: 'artist', id: 'id' },
      id2: { title: 'title2', artist: 'artist2', id: 'id2' },
    };

    useAudioPlayer.mockReturnValue({
      setVisibleSongs: mockSetVisibleSongs,
      setCurrentScreen,
      loadedSongs,
      visibleSongs: loadedSongs,
      handleSongSelect: handleSongSelectMock,
      loadingQueue: [],
      currentScreen: currentScreenMock,
      currentSongId: 'id2',
      songListScrollToCurrentToken: 0,
    });

    const { rerender } = render(
      <AudioProvider>
        <SongListItems
          filteredSongs={filtered}
          setFilteredSongs={jest.fn()}
          toggleRightClickMenu={jest.fn()}
        />
      </AudioProvider>,
    );

    expect(mockScrollToRow).toHaveBeenCalledWith(
      expect.objectContaining({
        align: 'auto',
        behavior: 'smooth',
        index: 1,
      }),
    );

    mockScrollToRow.mockClear();

    useAudioPlayer.mockReturnValue({
      setVisibleSongs: mockSetVisibleSongs,
      setCurrentScreen,
      loadedSongs,
      visibleSongs: loadedSongs,
      handleSongSelect: handleSongSelectMock,
      loadingQueue: [],
      currentScreen: currentScreenMock,
      currentSongId: 'id2',
      songListScrollToCurrentToken: 1,
    });

    rerender(
      <AudioProvider>
        <SongListItems
          filteredSongs={filtered}
          setFilteredSongs={jest.fn()}
          toggleRightClickMenu={jest.fn()}
        />
      </AudioProvider>,
    );

    expect(mockScrollToRow).toHaveBeenCalledWith(
      expect.objectContaining({
        align: 'auto',
        behavior: 'smooth',
        index: 1,
      }),
    );
  });
});
