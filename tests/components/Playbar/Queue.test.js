import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import Queue from '../../../src/components/Playbar/Queue/Queue.js';

var handleSongSelectMock;
jest.mock('../../../src/AudioController/AudioContext', () => {
  const useAudioPlayer = jest.fn();
  useAudioPlayer.mockReturnValue({
    loadedSongs: {
      song1: { id: 'song1', title: 'Song 1' },
      222.222: { id: '222.222', title: 'Song 2' },
      'C:/Users/User/Music/Song 3.mp3': {
        id: 'C:/Users/User/Music/Song 3.mp3',
        title: 'Song 3',
      },
      333.333: { id: '333.333', title: 'Song 4' },
      'C:/Users/User/Music/Song 5.mp3': {
        id: 'C:/Users/User/Music/Song 5.mp3',
        title: 'Song 5',
      },
    },
    visibleSongs: {},
    currentSongId: 'song1',
    currentSongIndex: 0,
    handleSongSelect: (handleSongSelectMock = jest.fn()),
    songQueue: ['222.222', 'C:/Users/User/Music/Song 3.mp3'],
    nextSongs: ['333.333', 'C:/Users/User/Music/Song 5.mp3'],
  });

  return {
    ...jest.requireActual('../../../src/AudioController/AudioContext'),
    useAudioPlayer,
  };
});

describe('Queue', () => {
  beforeEach(() => {
    handleSongSelectMock.mockClear();
  });

  const openQueue = (container) => {
    const queueButton = container.querySelector('.queue-button');
    fireEvent.click(queueButton);
  };

  it('renders without crashing', () => {
    const { container } = render(<Queue />);
    expect(container).toBeDefined();
  });

  it('calls handleSongSelect with the exact string id — not a parseFloat conversion', () => {
    const { container } = render(<Queue />);
    openQueue(container);

    const queueItems = container.querySelectorAll(
      '.queue-item:not(.current-song-queue)',
    );
    // Double-click the first queue item, which has a numeric-looking string id '222.222'
    fireEvent.doubleClick(queueItems[0]);

    expect(handleSongSelectMock).toHaveBeenCalledTimes(1);
    // Must be called with the string '222.222', not the float 222.222
    expect(handleSongSelectMock).toHaveBeenCalledWith('222.222');
    expect(handleSongSelectMock).not.toHaveBeenCalledWith(222.222);
  });

  it('calls handleSongSelect with the exact file path id', () => {
    const { container } = render(<Queue />);
    openQueue(container);

    const queueItems = container.querySelectorAll(
      '.queue-item:not(.current-song-queue)',
    );
    // Double-click the second queue item, which has a file path id
    fireEvent.doubleClick(queueItems[1]);

    expect(handleSongSelectMock).toHaveBeenCalledTimes(1);
    expect(handleSongSelectMock).toHaveBeenCalledWith(
      'C:/Users/User/Music/Song 3.mp3',
    );
  });

  it('secondary queue: calls handleSongSelect with the exact numeric-looking string id', () => {
    const { container } = render(<Queue />);
    openQueue(container);

    const nextItems = container.querySelectorAll(
      '.secondary-queue .queue-item',
    );
    // Double-click the first next item, which has the numeric-looking string id '333.333'
    fireEvent.doubleClick(nextItems[0]);

    expect(handleSongSelectMock).toHaveBeenCalledTimes(1);
    // Must be called with the string '333.333', not the float 333.333
    expect(handleSongSelectMock).toHaveBeenCalledWith('333.333');
    expect(handleSongSelectMock).not.toHaveBeenCalledWith(333.333);
  });

  it('secondary queue: calls handleSongSelect with the exact file path id', () => {
    const { container } = render(<Queue />);
    openQueue(container);

    const nextItems = container.querySelectorAll(
      '.secondary-queue .queue-item',
    );
    fireEvent.doubleClick(nextItems[1]);

    expect(handleSongSelectMock).toHaveBeenCalledTimes(1);
    expect(handleSongSelectMock).toHaveBeenCalledWith(
      'C:/Users/User/Music/Song 5.mp3',
    );
  });

  it('calls handleSongSelect once per double-click', () => {
    const { container } = render(<Queue />);
    openQueue(container);

    const queueItems = container.querySelectorAll(
      '.queue-item:not(.current-song-queue)',
    );
    fireEvent.doubleClick(queueItems[0]);
    fireEvent.doubleClick(queueItems[1]);

    expect(handleSongSelectMock).toHaveBeenCalledTimes(2);
  });

  describe('after switching song directory (stale IDs)', () => {
    const { useAudioPlayer } = require('../../../src/AudioController/AudioContext');

    it('does not crash when currentSongId is stale and not in loadedSongs', () => {
      useAudioPlayer.mockReturnValue({
        loadedSongs: {},
        visibleSongs: {},
        currentSongId: 'song1',
        currentSongIndex: 0,
        handleSongSelect: jest.fn(),
        songQueue: [],
        nextSongs: [],
      });

      const { container } = render(<Queue />);
      openQueue(container);
      expect(container).toBeDefined();
    });

    it('does not render current song when its id is stale', () => {
      useAudioPlayer.mockReturnValue({
        loadedSongs: {},
        visibleSongs: {},
        currentSongId: 'song1',
        currentSongIndex: 0,
        handleSongSelect: jest.fn(),
        songQueue: [],
        nextSongs: [],
      });

      const { container } = render(<Queue />);
      openQueue(container);
      expect(container.querySelector('.current-song-queue')).toBeNull();
    });

    it('does not render queue items when their ids are stale', () => {
      useAudioPlayer.mockReturnValue({
        loadedSongs: {},
        visibleSongs: {},
        currentSongId: null,
        currentSongIndex: 0,
        handleSongSelect: jest.fn(),
        songQueue: ['stale-id-1', 'stale-id-2'],
        nextSongs: [],
      });

      const { container } = render(<Queue />);
      openQueue(container);
      expect(container.querySelectorAll('.queue-item:not(.current-song-queue)').length).toBe(0);
    });

    it('does not render next song items when their ids are stale', () => {
      useAudioPlayer.mockReturnValue({
        loadedSongs: {},
        visibleSongs: {},
        currentSongId: null,
        currentSongIndex: 0,
        handleSongSelect: jest.fn(),
        songQueue: [],
        nextSongs: ['stale-id-3', 'stale-id-4'],
      });

      const { container } = render(<Queue />);
      openQueue(container);
      expect(container.querySelectorAll('.secondary-queue .queue-item').length).toBe(0);
    });

    it('only renders queue items that exist in the new loadedSongs after partial reload', () => {
      useAudioPlayer.mockReturnValue({
        loadedSongs: {
          'new-song-1': { id: 'new-song-1', title: 'New Song 1' },
        },
        visibleSongs: {},
        currentSongId: 'song1', // stale from old directory
        currentSongIndex: 0,
        handleSongSelect: jest.fn(),
        songQueue: ['stale-id', 'new-song-1'], // one stale, one valid
        nextSongs: [],
      });

      const { container } = render(<Queue />);
      openQueue(container);

      const queueItems = container.querySelectorAll('.queue-item:not(.current-song-queue)');
      expect(queueItems.length).toBe(1);
      expect(queueItems[0].textContent).toBe('New Song 1');
    });
  });
});
