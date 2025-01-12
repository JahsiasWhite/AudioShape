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
    id: 1,
  },
  {
    title: 'title2',
    artist: 'artist2',
    id: 2,
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
    sendMessage: jest.fn(),
  },
};

describe('Song List', () => {
  it('renders song list correctly', () => {
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

  it('handles sort by title correctly', () => {
    // Mock the AudioContext values
    const mockAudioContext = {
      visibleSongs: {
        songC: { title: 'Song C', duration: 180, id: 180 },
        songB: { title: 'Song B', duration: 120, id: 120 },
        songA: { title: 'Song A', duration: 240, id: 240 },
      },
      currentScreen: 'All Songs',
      setCurrentScreen: jest.fn(),
      initSongsLoading: false,
      loadingQueue: [],
    };

    // Mock useAudioPlayer hook
    jest
      .spyOn(
        require('../../../src/AudioController/AudioContext'),
        'useAudioPlayer'
      )
      .mockImplementation(() => mockAudioContext);

    const { getByText, getAllByRole } = render(
      <AudioProvider>
        <SongList handleSongEdit={jest.fn()} />
      </AudioProvider>
    );

    // Get initial order of songs
    const songListBefore = getAllByRole('listitem').map(
      (item) => item.querySelector('.song-title').textContent
    );

    // Click sort button
    fireEvent.click(getByText('Sort by'));

    // Get new order of songs
    const songListAfter = getAllByRole('listitem').map(
      (item) => item.querySelector('.song-title').textContent
    );

    // Verify songs were reordered
    expect(songListBefore).not.toEqual(songListAfter);
    expect(songListAfter).toEqual(['Song A', 'Song B', 'Song C']);
  });

  it('handles import songs correctly', () => {
    // Mock the AudioContext values
    const mockAudioContext = {
      visibleSongs: [],
      currentScreen: 'All Songs',
      setCurrentScreen: jest.fn(),
      initSongsLoading: false,
      loadingQueue: [],
    };

    // Mock useAudioPlayer hook
    jest
      .spyOn(
        require('../../../src/AudioController/AudioContext'),
        'useAudioPlayer'
      )
      .mockImplementation(() => mockAudioContext);

    const { getByText, getAllByRole, getByTestId } = render(
      <AudioProvider>
        <SongList />
      </AudioProvider>
    );

    // Click FolderSelection button
    fireEvent.click(getByText('Choose Song Directory'));

    // Simulate folder input change
    const mockFile = {
      path: 'C:\\Users\\test\\Music\\MyMusic',
      webkitRelativePath: 'MyMusic/song.mp3',
      name: 'song.mp3',
    };
    const input = getByTestId('folder-input');
    fireEvent.change(input, {
      target: {
        files: [mockFile],
      },
    });

    // Verify nothing broke
    expect(SongList).toBeDefined();
    expect(window.electron.ipcRenderer.sendMessage).toHaveBeenCalledWith(
      'GET_SONGS',
      'C:\\Users\\test\\Music\\MyMusic'
    );
  });
});
